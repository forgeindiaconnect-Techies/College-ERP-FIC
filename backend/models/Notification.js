import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  tenantId: { type: String }, // Optional, to target a specific college tenant
  collegeId: { type: String }, // Optional, aliases tenantId for data segregation
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional if targetRoles is used
  targetRoles: { type: [String], default: [] }, // e.g. ['Admin', 'Principal']
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['Info', 'Warning', 'Success', 'Error'], default: 'Info' },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  link: { type: String, default: null } // Optional deep link
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);
