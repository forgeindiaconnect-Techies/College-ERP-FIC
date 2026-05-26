import mongoose from 'mongoose';

const hostelComplaintSchema = new mongoose.Schema({
  complaintId: { type: String, required: true, unique: true },
  student: { type: String, required: true },
  room: { type: String, required: true },
  issue: { type: String, required: true },
  status: { type: String, enum: ['Resolved', 'Pending'], default: 'Pending' },
  date: { type: Date, required: true, default: Date.now }
}, { timestamps: true });

export default mongoose.model('HostelComplaint', hostelComplaintSchema);
