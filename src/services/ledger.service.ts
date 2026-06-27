import { prisma } from '../config/database.js';
import { redis } from '../config/redis.js';
import { Tier, TransactionType } from '@prisma/client';

const TIER_LIMITS = {
  TIER_1: 50000,
  TIER_2: 200000,
  TIER_3: 5000000,
};

export class LedgerService {
  // Check daily limit cached inside Redis
  static async verifyLimits(userId: string, tier: Tier, amount: number) {
    const limit = TIER_LIMITS[tier];
    const redisKey = `user:daily-limit:${userId}:${new Date().toISOString().split('T')[0]}`;
    
    const currentDailySpend = Number(await redis.get(redisKey)) || 0;
    if (currentDailySpend + amount > limit) {
      throw new Error(`Transaction exceeds your daily ${tier} limit.`);
    }
    return redisKey;
  }

  static async transfer(senderId: string, receiverEmail: string, amount: number) {
    if (amount <= 0) throw new Error("Invalid transaction amount.");

    return await prisma.$transaction(async (tx) => {
      const sender = await tx.user.findUnique({ where: { id: senderId }, include: { wallet: true } });
      const receiver = await tx.user.findUnique({ where: { email: receiverEmail }, include: { wallet: true } });

      if (!sender || !sender.wallet) throw new Error("Sender wallet not found.");
      if (!receiver || !receiver.wallet) throw new Error("Receiver wallet not found.");
      if (sender.wallet.balance.toNumber() < amount) throw new Error("Insufficient balance.");

      // Verify Tier Limit via Redis
      const redisKey = await this.verifyLimits(senderId, sender.tier, amount);

      // Execute atomic balance moves
      await tx.wallet.update({
        where: { userId: senderId },
        data: { balance: { decrement: amount } }
      });

      await tx.wallet.update({
        where: { email: receiverEmail }, // or via receiver.id
        where: { userId: receiver.id },
        data: { balance: { increment: amount } }
      });

      const ref = `TX-${Date.now()}`;
      await tx.transaction.createMany({
        data: [
          { walletId: sender.wallet.id, type: TransactionType.TRANSFER, amount: -amount, reference: `${ref}-OUT`, description: `Transfer to ${receiverEmail}` },
          { walletId: receiver.wallet.id, type: TransactionType.DEPOSIT, amount: amount, reference: `${ref}-IN`, description: `Transfer from ${sender.email}` }
        ]
      });

      // Update cached limits
      await redis.incrby(redisKey, amount);
      await redis.expire(redisKey, 86400); // 24 Hours

      return { reference: ref, balance: sender.wallet.balance.toNumber() - amount };
    });
  }
}