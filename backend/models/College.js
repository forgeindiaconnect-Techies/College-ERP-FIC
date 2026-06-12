import mongoose from 'mongoose';

const collegeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  adminName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  tenantId: {
    type: String,
    required: true,
    unique: true
  },
  subscriptionPlan: {
    type: String,
    enum: ['Trial', 'Starter', 'Premium', 'Elite'],
    default: 'Trial'
  },
  subscriptionStatus: {
    type: String,
    enum: ['Active', 'Expired', 'Cancelled'],
    default: 'Active'
  },
  trialStartDate: {
    type: Date,
    required: true
  },
  trialEndDate: {
    type: Date,
    required: true
  },
  convertedToPaid: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export default mongoose.model('College', collegeSchema);
