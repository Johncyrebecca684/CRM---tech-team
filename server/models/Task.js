import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    sNo: { type: Number },
    date: { type: String },
    toBePostedOn: { type: String },
    toBeCompletedOn: { type: String },
    theme: { type: String },
    format: { type: String },
    description: { type: String },
    client: { type: String },
    comments: { type: String },
    reference: { type: String },
    clientProject: { type: String, default: 'Internal Project' },
    activity: { type: String, default: 'Static Poster' },
    project: { type: String, default: 'Core System' },
    coreActivity: { type: String, default: '' },
    assignedToId: { type: String, required: true },
    assignedTo: { type: String },
    assignedToEmail: { type: String, default: '' },
    assignedToUsername: { type: String, default: '' },
    platform: { type: String, default: 'Instagram' },
    scheduledTime: { type: String, default: '10:00' },
    mediaUrl: { type: String, default: '' },
    workStartDate: { type: String },
    targetEndDate: { type: String },
    actualEndDate: { type: String, default: null },
    slaStatus: { type: String, default: 'Green' },
    status: { type: String, default: 'In Progress' },
    commentsUpdates: { type: String, default: '' },
    estimatedHours: { type: Number, default: 10 },
    timeSpentHours: { type: Number, default: 0 },
    taskFile: { type: Object, default: null },
    taskFileName: { type: String, default: '' },
    taskFileUrl: { type: String, default: '' }
  },
  { timestamps: true, strict: false }
);

export const Task = mongoose.model('Task', taskSchema);
