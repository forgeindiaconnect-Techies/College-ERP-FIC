import mongoose from 'mongoose';

const placementJobSchema = new mongoose.Schema({
  jobId: { type: String, required: true, unique: true },
  company: { type: String, required: true },
  role: { type: String, required: true },
  ctc: { type: String, required: true },
  eligibility: { type: String, required: true },
  deadline: { type: Date, required: true },
  applicants: { type: Number, required: true, default: 0 }
}, { timestamps: true });

export default mongoose.model('PlacementJob', placementJobSchema);
