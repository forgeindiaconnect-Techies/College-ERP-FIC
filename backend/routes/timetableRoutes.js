import express from 'express';
import Timetable from '../models/Timetable.js';
import { protect, authorize, collegeScope } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all timetables (Admin Overview)
router.get('/all', protect, authorize('Admin', 'Principal', 'Sub Admin', 'HOD'), collegeScope, async (req, res) => {
  try {
    const query = req.collegeId ? { collegeId: req.collegeId } : {};
    const timetables = await Timetable.find(query);
    res.json(timetables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get timetable by department and semester
router.get('/', protect, collegeScope, async (req, res) => {
  const { dept, sem } = req.query;
  try {
    if (!dept || !sem) {
      return res.status(400).json({ message: 'Department and semester are required.' });
    }
    
    const query = { department: dept, semester: sem };
    if (req.collegeId) query.collegeId = req.collegeId;

    let timetable = await Timetable.findOne(query);
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
router.post('/', protect, authorize('Admin', 'Principal', 'HOD', 'Sub Admin'), collegeScope, async (req, res) => {
  const { department, semester, times, schedule } = req.body;
  try {
    const filter = { department, semester };
    if (req.collegeId) filter.collegeId = req.collegeId;

    const timetable = await Timetable.findOneAndUpdate(
      filter,
      { department, semester, times, schedule, collegeId: req.collegeId || null },
      { new: true, upsert: true, runValidators: true }
    );
    res.status(201).json(timetable);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
