import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  dept: { type: String, required: true },
  role: { type: String },
  designation: { type: String },
  subjects: { type: [String], default: [] },
  workload: { type: Number, default: 0 },
  attendance: { type: Number, default: 0 },
  experience: { type: String, default: '' },
  passRate: { type: Number, default: 0 },
  publications: { type: Number, default: 0 },
  faculty: { type: Number, default: 0 },
  students: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  joinDate: { type: Date, default: Date.now },
  status: { type: String, default: 'Active' }
}, { timestamps: true });

export default mongoose.model('Staff', staffSchema);
