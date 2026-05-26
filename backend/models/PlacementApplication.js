import mongoose from 'mongoose';

const placementApplicationSchema = new mongoose.Schema({
  applicationId: { type: String, required: true, unique: true },
  studentProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
  student: { type: String, required: true }, // Backwards compatibility
  regNo: { type: String, required: true },
  company: { type: String, required: true },
  role: { type: String, required: true },
  status: { type: String, enum: ['Applied', 'Shortlisted', 'Rejected'], default: 'Applied' }
}, { timestamps: true });

export default mongoose.model('PlacementApplication', placementApplicationSchema);
