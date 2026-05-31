import express from 'express';
import Timetable from '../models/Timetable.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get timetable by department and semester
router.get('/', protect, async (req, res) => {
  const { dept, sem } = req.query;
  try {
    if (!dept || !sem) {
      return res.status(400).json({ message: 'Department and semester are required.' });
    }
    
    let timetable = await Timetable.findOne({ department: dept, semester: sem });
    if (!timetable) {
      // Return empty default state if not found
      return res.json({
        department: dept,
        semester: sem,
        times: ['09:00 - 10:00', '10:00 - 11:00', '11:15 - 12:15', '01:00 - 02:00', '02:00 - 04:00', '03:00 - 04:00'],
        schedule: []
      });
    }
    res.json(timetable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create or update timetable
router.post('/', protect, authorize('Admin', 'Principal', 'HOD', 'Sub Admin'), async (req, res) => {
  const { department, semester, times, schedule } = req.body;
  try {
    const timetable = await Timetable.findOneAndUpdate(
      { department, semester },
      { department, semester, times, schedule },
      { new: true, upsert: true, runValidators: true }
    );
    res.status(201).json(timetable);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
