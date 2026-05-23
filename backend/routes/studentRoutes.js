import express from 'express';
import Student from '../models/Student.js';
import { protect, authorize, departmentScope } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all students
router.get('/', protect, authorize('Admin', 'Principal', 'HOD', 'Staff'), departmentScope, async (req, res) => {
  try {
    const dept = req.dept || req.query.dept;
    const query = dept ? { dept: dept } : {};
    const students = await Student.find(query);
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get student by ID
router.get('/:id', protect, async (req, res) => {
  try {
    // If Student or Parent, they can only view their own record
    if ((req.user.role === 'Student' || req.user.role === 'Parent') && req.user.referenceId !== req.params.id) {
      return res.status(403).json({ message: 'Unauthorized to view this record' });
    }
    
    const student = await Student.findOne({ id: req.params.id });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    
    // If HOD/Staff, ensure they can only view students in their dept
    // Student model uses field 'dept', User model uses 'department'
    if ((req.user.role === 'HOD' || req.user.role === 'Staff') && student.dept !== req.user.department) {
      return res.status(403).json({ message: 'Student is outside your department scope' });
    }
    
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new student
router.post('/', protect, authorize('Admin', 'Principal', 'HOD'), async (req, res) => {
  const student = new Student(req.body);
  try {
    const newStudent = await student.save();
    res.status(201).json(newStudent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update student
router.put('/:id', protect, authorize('Admin', 'Principal', 'HOD'), async (req, res) => {
  try {
    const updatedStudent = await Student.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    res.json(updatedStudent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete student
router.delete('/:id', protect, authorize('Admin', 'Principal', 'HOD'), async (req, res) => {
  try {
    await Student.findOneAndDelete({ id: req.params.id });
    res.json({ message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
