import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, enum: ['admin', 'employee'], required: true },
    joinedDate: { type: String },
    avatar: { type: String }
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
