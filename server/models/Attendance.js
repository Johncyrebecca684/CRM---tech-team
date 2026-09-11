import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    employeeId: { type: String, required: true },
    date: { type: String, required: true },
    status: { type: String, default: 'Present' },
    checkIn: { type: String, default: '09:30' },
    checkOut: { type: String, default: '' },
    notes: { type: String, default: '' }
  },
  { timestamps: true, strict: false }
);

export const Attendance = mongoose.model('Attendance', attendanceSchema);
