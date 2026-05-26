import mongoose from 'mongoose';

const placementCompanySchema = new mongoose.Schema({
  companyId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  sector: { type: String, required: true },
  location: { type: String, required: true },
  drives: { type: Number, required: true, default: 0 },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });

export default mongoose.model('PlacementCompany', placementCompanySchema);
