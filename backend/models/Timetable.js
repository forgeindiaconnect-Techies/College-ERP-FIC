import mongoose from 'mongoose';

const slotSchema = new mongoose.Schema({
  id: { type: String, required: true },
  dept: { type: String, required: true },
  day: { type: String, required: true },
  period: { type: Number, required: true },
  subject: { type: String, required: true },
  faculty: { type: String, required: true },
  classroom: { type: String, required: true }
}, { _id: false });

const timetableSchema = new mongoose.Schema({
  department: {
    type: String,
    required: true,
  },
  semester: {
    type: String,
    required: true,
  },
  times: {
    type: [String],
    default: ['09:00 - 10:00', '10:00 - 11:00', '11:15 - 12:15', '01:00 - 02:00', '02:00 - 04:00', '03:00 - 04:00']
  },
  schedule: {
    type: [slotSchema], // Array of slot objects
    default: []
  },
  collegeId: {
    type: String,
    required: false
  }
}, { timestamps: true });

// Ensure unique timetable per department per semester per college
timetableSchema.index({ department: 1, semester: 1, collegeId: 1 }, { unique: true });

const Timetable = mongoose.model('Timetable', timetableSchema);

export default Timetable;
