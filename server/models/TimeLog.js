import mongoose from 'mongoose';

const timeLogSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    taskId: { type: String, required: true },
    employeeId: { type: String, required: true },
    hours: { type: Number, required: true },
    date: { type: String, required: true },
    description: { type: String, default: '' }
  },
  { timestamps: true }
);

export const TimeLog = mongoose.model('TimeLog', timeLogSchema);
