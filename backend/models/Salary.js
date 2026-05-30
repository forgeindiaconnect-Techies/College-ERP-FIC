import mongoose from 'mongoose';

const salarySchema = new mongoose.Schema({
  staffId:       { type: String, required: true },
  staffName:     { type: String },
  designation:   { type: String },
  department:    { type: String },
  billingMonth:  { type: String, required: true },   // e.g. "May 2026"
  basicPay:      { type: Number, required: true, default: 0 },
  allowances:    { type: Number, default: 0 },
  deductions:    { type: Number, default: 0 },
  netSalary:     { type: Number },
  paymentDate:   { type: Date },
  paymentMode:   { type: String, default: 'Bank Transfer' },
  status:        { type: String, enum: ['Pending', 'Disbursed'], default: 'Pending' },
}, { timestamps: true });

// Auto-compute netSalary before save
salarySchema.pre('save', function (next) {
  this.netSalary = (this.basicPay + this.allowances) - this.deductions;
  next();
});

export default mongoose.model('Salary', salarySchema);
