import mongoose from 'mongoose';

const LeaveRequestSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  employeeEmail: { type: String },
  employeeRole: { type: String },
  leaveType: { 
    type: String, 
    required: true,
    enum: ['Casual Leave', 'Sick Leave', 'Emergency Leave', 'Work From Home (WFH)', 'Half Day', 'Other']
  },
  fromDate: { type: String, required: true },
  toDate: { type: String, required: true },
  days: { type: Number, required: true, default: 1 },
  reason: { type: String, required: true },
  appliedDate: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected'], 
    default: 'Pending' 
  },
  adminComment: { type: String, default: '' },
  reviewedBy: { type: String },
  reviewedAt: { type: String }
}, {
  timestamps: true
});

export const LeaveRequest = mongoose.models.LeaveRequest || mongoose.model('LeaveRequest', LeaveRequestSchema);
