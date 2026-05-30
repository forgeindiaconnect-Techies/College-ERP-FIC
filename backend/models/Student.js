import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  dept: { type: String, required: true },
  sem: { type: String, required: true },
  attendance: { type: Number, default: 0 },
  cgpa: { type: Number, default: 0 },
  status: { type: String, default: 'Active' },
  feeStatus: { type: String, default: 'Pending' },
  idNumber: { type: String },
  dob: { type: String },
  academicYear: { type: String },
  section: { type: String },
  batch: { type: String },
  admissionDate: { type: String },
  hostelRequired: { type: String },
  roomNumber: { type: String },
  busRoute: { type: String },
  pickupPoint: { type: String },
  transportFeeStatus: { type: String }
}, { timestamps: true });

export default mongoose.model('Student', studentSchema);
