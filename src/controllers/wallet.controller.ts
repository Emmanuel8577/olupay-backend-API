import { Request, Response } from 'express';
import { LedgerService } from '../services/ledger.service.js';
import { prisma } from '../config/database.js';

export const handleTransfer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { receiverEmail, amount } = req.body;
    const senderId = (req as any).user.id; 

    const receipt = await LedgerService.transfer(senderId, receiverEmail, Number(amount));
    res.status(200).json({ success: true, message: "Transfer completed successfully", data: receipt });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const upgradeTier = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nextTier } = req.body; // TIER_2 or TIER_3
    const userId = (req as any).user.id;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { tier: nextTier },
      select: { email: true, tier: true }
    });

    res.status(200).json({ success: true, message: "Account Tier upgraded successfully", data: updatedUser });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};