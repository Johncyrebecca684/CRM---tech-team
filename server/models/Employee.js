import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    role: { type: String, default: 'Software Engineer' },
    email: { type: String, required: true },
    password: { type: String, default: '123456' },
    mustChangePassword: { type: Boolean, default: false },
    isPasswordChanged: { type: Boolean, default: false },
    avatar: { type: String },
    skills: [{ type: String }],
    weeklyCapacityHours: { type: Number, default: 40 },
    status: { type: String, default: 'Active' },
    joinedDate: { type: String },
    isProfileCompleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Employee = mongoose.model('Employee', employeeSchema);
