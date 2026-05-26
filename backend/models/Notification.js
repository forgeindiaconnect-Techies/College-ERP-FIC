import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['Info', 'Warning', 'Success', 'Error'], default: 'Info' },
  isRead: { type: Boolean, default: false },
  link: { type: String, default: null } // Optional deep link (e.g., '/student/fees')
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);
