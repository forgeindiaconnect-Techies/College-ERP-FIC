import express from 'express';
import Exam from '../models/Exam.js';
import { protect, authorize, departmentScope } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET all exams (HOD/Staff scoped by departmentScope, Admin/Principal can view all or filter)
router.get('/', protect, authorize('Admin', 'Principal', 'HOD', 'Staff', 'Student', 'Parent'), departmentScope, async (req, res) => {
  try {
    const dept = req.dept || req.query.dept;
    const query = dept ? { dept: dept } : {};
    const exams = await Exam.find(query).sort({ date: 1 });
    res.json(exams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET exam by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam slot not found' });
    res.json(exam);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new exam schedule
router.post('/', protect, authorize('Admin', 'HOD', 'Principal'), async (req, res) => {
  try {
    const exam = new Exam({
      name: req.body.name,
      dept: req.body.dept,
      sem: req.body.sem,
      subject: req.body.subject,
      date: req.body.date,
      time: req.body.time,
      room: req.body.room,
      maxMarks: Number(req.body.maxMarks) || 100,
      createdBy: req.user.name || 'Staff HOD'
    });
    
    const newExam = await exam.save();
    req.app.get('io').emit('dataUpdated', { module: 'exams', action: 'created' });
    res.status(201).json(newExam);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update exam schedule
router.put('/:id', protect, authorize('Admin', 'HOD', 'Principal'), async (req, res) => {
  try {
    const updated = await Exam.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        dept: req.body.dept,
        sem: req.body.sem,
        subject: req.body.subject,
        date: req.body.date,
        time: req.body.time,
        room: req.body.room,
        maxMarks: Number(req.body.maxMarks) || 100
      },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Exam slot not found' });
    req.app.get('io').emit('dataUpdated', { module: 'exams', action: 'updated' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE exam schedule
router.delete('/:id', protect, authorize('Admin', 'HOD', 'Principal'), async (req, res) => {
  try {
    const deleted = await Exam.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Exam slot not found' });
    req.app.get('io').emit('dataUpdated', { module: 'exams', action: 'deleted' });
    res.json({ message: 'Exam schedule deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
