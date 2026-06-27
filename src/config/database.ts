// src/config/database.ts
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

// 🚀 Update this import to point directly to your generated folder!
import { PrismaClient } from '../generated/prisma/index.js';

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

// Pass the driver adapter explicitly per Prisma 7 standards
export const prisma = new PrismaClient({ adapter });