import mongoose from 'mongoose';

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
    default: ['09:00 - 10:00', '10:00 - 11:00', '11:15 - 12:15', '01:00 - 02:00', '02:00 - 04:00']
  },
  schedule: {
    type: [[String]], // 2D array: schedule[dayIndex][timeIndex]
    default: () => [
      ['', '', '', 'Lunch', ''],
      ['', '', '', 'Lunch', ''],
      ['', '', '', 'Lunch', ''],
      ['', '', '', 'Lunch', ''],
      ['', '', '', 'Lunch', '']
    ]
  }
}, { timestamps: true });

// Ensure unique timetable per department per semester
timetableSchema.index({ department: 1, semester: 1 }, { unique: true });

const Timetable = mongoose.model('Timetable', timetableSchema);

export default Timetable;
