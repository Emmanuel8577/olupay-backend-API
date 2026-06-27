import express from 'express';
import dotenv from 'dotenv';
import { handleTransfer, upgradeTier } from './controllers/wallet.controller.js';
// (Import your auth middleware here to protect routes)

dotenv.config();
const app = express();
app.use(express.json());

// Target Group Target Health Route for AWS ALB 
app.get('/', (req, res) => {
  res.status(200).json({ status: "healthy", service: "OluPay Core Engine" });
});

// App Router endpoints
app.post('/api/wallet/transfer', handleTransfer);
app.post('/api/user/upgrade', upgradeTier);

export default app;