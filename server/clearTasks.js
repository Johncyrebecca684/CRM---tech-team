import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import dns from 'dns';
import { fileURLToPath } from 'url';
import { Task } from './models/Task.js';
import { TimeLog } from './models/TimeLog.js';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
  console.warn('DNS config notice:', e.message);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://KC:KCecommerce@cluster0.b2v8pfh.mongodb.net/tech_team_crm?retryWrites=true&w=majority';

async function clearTasks() {
  try {
    console.log('[Clear] Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('[Clear] Connected.');

    const taskDeleteRes = await Task.deleteMany({});
    console.log(`[Clear] Deleted ${taskDeleteRes.deletedCount} tasks from database.`);

    const logDeleteRes = await TimeLog.deleteMany({});
    console.log(`[Clear] Deleted ${logDeleteRes.deletedCount} time logs associated with tasks.`);

    console.log('[Clear] All tasks and social media tasks have been successfully removed from DB.');
    process.exit(0);
  } catch (err) {
    console.error('[Clear Error]:', err);
    process.exit(1);
  }
}

clearTasks();
