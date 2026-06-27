// prisma.config.ts
import * as dotenv from 'dotenv';
import { defineConfig } from 'prisma/config';

dotenv.config();

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    // 🚀 Fallback to an empty string ensures it's never explicitly 'undefined'
    url: process.env.DATABASE_URL || '',
  },
});