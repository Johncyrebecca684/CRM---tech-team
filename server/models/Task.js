import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    sNo: { type: Number },
    date: { type: String },
    clientProject: { type: String, default: 'Internal Project' },
    activity: { type: String, required: true },
    project: { type: String, default: 'Core System' },
    coreActivity: { type: String, default: '' },
    assignedToId: { type: String, required: true },
    workStartDate: { type: String },
    targetEndDate: { type: String },
    actualEndDate: { type: String, default: null },
    slaStatus: { type: String, default: 'Green' },
    status: { type: String, default: 'In Progress' },
    commentsUpdates: { type: String, default: '' },
    estimatedHours: { type: Number, default: 10 },
    timeSpentHours: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const Task = mongoose.model('Task', taskSchema);
