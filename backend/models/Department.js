import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  hod: { type: String },
  students: { type: Number, default: 0 },
  staff: { type: Number, default: 0 },
  established: { type: Number },
  status: { type: String, default: 'Active' }
}, { timestamps: true });

export default mongoose.model('Department', departmentSchema);
