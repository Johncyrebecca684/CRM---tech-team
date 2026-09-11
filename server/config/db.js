import mongoose from 'mongoose';
import dns from 'dns';

// Ensure public DNS fallback for MongoDB Atlas SRV record resolution
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore if dns setServers fails in constrained environments
}

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tech_team_crm');
    console.log(`[MongoDB] Connected to host: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB Error] Connection failed: ${error.message}`);
    // Non-fatal fallback for setup resilience
  }
};

