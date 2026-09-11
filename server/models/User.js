import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, enum: ['admin', 'employee', 'super_admin'], required: true },
    password: { type: String, default: '123456' },
    joinedDate: { type: String },
    avatar: { type: String }
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
