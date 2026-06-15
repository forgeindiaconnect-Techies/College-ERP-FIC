import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  studentName: { type: String },
  registerNo: { type: String },
  department: { type: String },
  semester: { type: String },
  date: { type: Date, required: true },
  period: { type: String },
  status: { type: String, enum: ['Present', 'Absent', 'On Leave', 'Medical Leave'], required: true },
  subject: { type: String },
  markedBy: { type: String }
, collegeId: { type: String } }, { timestamps: true });

export default mongoose.model('Attendance', attendanceSchema);
