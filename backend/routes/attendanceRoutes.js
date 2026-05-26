import express from 'express';
import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';
import { protect, authorize, departmentScope, requirePermission } from '../middleware/authMiddleware.js';

const router = express.Router();

const updateStudentAttendancePercentage = async (studentId) => {
  try {
    const records = await Attendance.find({ studentId });
    if (records.length === 0) return;
    const presentDays = records.filter(r => r.status === 'Present').length;
    const percentage = Math.round((presentDays / records.length) * 100);
    await Student.findOneAndUpdate({ id: studentId }, { attendance: percentage });
  } catch (err) {
    console.error('Failed to update student attendance percentage:', err);
  }
};

// Get all attendance records
router.get('/', protect, authorize('Admin', 'Sub Admin', 'Principal', 'HOD', 'Staff'), requirePermission('view_attendance'), departmentScope, async (req, res) => {
  try {
    const dept = req.dept || req.query.dept;
    const query = dept ? { department: dept } : {};
    const records = await Attendance.find(query).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get attendance for a specific student
router.get('/student/:studentId', protect, async (req, res) => {
  try {
    if ((req.user.role === 'Student' || req.user.role === 'Parent') && req.user.referenceId !== req.params.studentId) {
      return res.status(403).json({ message: 'Unauthorized to view this record' });
    }
    const records = await Attendance.find({ studentId: req.params.studentId }).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Record new attendance (Single or Bulk)
router.post('/', protect, authorize('Admin', 'Sub Admin', 'Principal', 'HOD', 'Staff'), requirePermission('view_attendance'), async (req, res) => {
  try {
    if (Array.isArray(req.body)) {
      // Bulk insert
      const newRecords = await Attendance.insertMany(req.body);
      
      // Update student percentages (get unique student IDs)
      const studentIds = [...new Set(newRecords.map(r => r.studentId))];
      for (const id of studentIds) {
        await updateStudentAttendancePercentage(id);
      }
      
      return res.status(201).json(newRecords);
    } else {
      // Single insert
      const attendance = new Attendance(req.body);
      const newRecord = await attendance.save();
      await updateStudentAttendancePercentage(newRecord.studentId);
      return res.status(201).json(newRecord);
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update attendance record
router.put('/:id', protect, authorize('Admin', 'Sub Admin', 'Principal', 'HOD', 'Staff'), requirePermission('view_attendance'), async (req, res) => {
  try {
    const updatedRecord = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (updatedRecord) {
      await updateStudentAttendancePercentage(updatedRecord.studentId);
    }
    res.json(updatedRecord);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete attendance record
router.delete('/:id', protect, authorize('Admin', 'Sub Admin', 'Principal', 'HOD', 'Staff'), requirePermission('view_attendance'), async (req, res) => {
  try {
    const record = await Attendance.findById(req.params.id);
    if (record) {
      await Attendance.findByIdAndDelete(req.params.id);
      await updateStudentAttendancePercentage(record.studentId);
    }
    res.json({ message: 'Attendance record deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
