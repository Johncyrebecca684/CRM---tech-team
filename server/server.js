import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import apiRoutes from './routes/api.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', apiRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Start Server & Connect MongoDB
const start = async () => {
  await connectDB();
  
  const server = app.listen(PORT, () => {
    console.log(`[Tech CRM Server] Running on http://localhost:${PORT}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`[Tech CRM Server] Port ${PORT} is already in use by an active server instance.`);
    } else {
      console.error('[Tech CRM Server Error]', err);
    }
  });
};

start();
