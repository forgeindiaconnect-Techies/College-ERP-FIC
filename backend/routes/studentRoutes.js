import express from 'express';
import Student from '../models/Student.js';
import { protect, authorize, departmentScope, requirePermission } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Get all students
router.get('/', protect, authorize('Admin', 'Sub Admin', 'Principal', 'HOD', 'Staff', 'Accounts'), requirePermission('manage_students'), departmentScope, async (req, res) => {
  try {
    const dept = req.dept || req.query.dept;
    const query = dept ? { $or: [{ dept: dept }, { department: dept }] } : {};
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
router.post('/', protect, authorize('Admin', 'Sub Admin', 'Principal', 'HOD', 'Accounts'), requirePermission('manage_students'), async (req, res) => {
  const student = new Student(req.body);
  try {
    const newStudent = await student.save();
    
    // Create a User account for login with default password
    try {
      const existingUser = await User.findOne({ email: newStudent.email });
      if (!existingUser) {
        const user = new User({
          name: newStudent.name,
          email: newStudent.email,
          password: 'password123',
          role: 'Student',
          department: newStudent.dept,
          referenceId: newStudent.id
        });
        await user.save();
      } else {
        // If they recreated the student with the same email but new ID, update the referenceId
        existingUser.referenceId = newStudent.id;
        existingUser.department = newStudent.dept;
        await existingUser.save();
      }
    } catch (userErr) {
      console.error('Failed to create User account for Student:', userErr);
    }

    req.app.get('io').emit('dataUpdated', { module: 'students', action: 'created' });
    res.status(201).json(newStudent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update student
router.put('/:id', protect, authorize('Admin', 'Sub Admin', 'Principal', 'HOD'), requirePermission('manage_students'), async (req, res) => {
  try {
    const updatedStudent = await Student.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    req.app.get('io').emit('dataUpdated', { module: 'students', action: 'updated' });
    res.json(updatedStudent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete student
router.delete('/:id', protect, authorize('Admin', 'Sub Admin', 'Principal', 'HOD'), requirePermission('manage_students'), async (req, res) => {
  try {
    const studentId = req.params.id;
    await Student.findOneAndDelete({ id: studentId });
    // IMPORTANT: Delete marks associated with this student so reused IDs don't get random old CGPAs
    try {
      const Mark = (await import('../models/Mark.js')).default;
      await Mark.deleteMany({ studentId });
    } catch(err) {
      console.warn('Failed to delete marks for student:', err.message);
    }
    
    req.app.get('io').emit('dataUpdated', { module: 'students', action: 'deleted' });
    res.json({ message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
