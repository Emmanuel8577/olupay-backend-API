import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

export const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_AUTH_TOKEN,
  tls: {}, // Required when Connecting securely to AWS ElastiCache with TLS enabled
});

redis.on('connect', () => console.log('🚀 Connected to AWS ElastiCache Redis.'));
redis.on('error', (err) => console.error('Redis Connection Error:', err));