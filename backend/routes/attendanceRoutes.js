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
    console.log(`[GET /student/:studentId] Request for: ${req.params.studentId}. User role: ${req.user.role}, Ref ID: ${req.user.referenceId}`);
    if ((req.user.role === 'Student' || req.user.role === 'Parent') && req.user.referenceId !== req.params.studentId) {
      console.log('=> 403 Forbidden: Unauthorized');
      return res.status(403).json({ message: 'Unauthorized to view this record' });
    }
    const records = await Attendance.find({ studentId: req.params.studentId }).sort({ date: -1 });
    console.log(`=> Found ${records.length} records`);
    res.json(records);
  } catch (err) {
    console.log(`=> 500 Error: ${err.message}`);
    res.status(500).json({ message: err.message });
  }
});

// Record new attendance (Single or Bulk)
router.post('/', protect, authorize('Admin', 'Sub Admin', 'Principal', 'HOD', 'Staff'), requirePermission('view_attendance'), async (req, res) => {
  try {
    console.log(`[POST /attendance] Received payload:`, JSON.stringify(req.body));
    if (Array.isArray(req.body)) {
      if (req.body.length === 0) return res.status(400).json({ message: 'Empty payload' });

      // Group records by subject and period to check for duplicates
      const sessionsToCheck = [];
      req.body.forEach(record => {
        const exactDate = new Date(record.date);
        exactDate.setUTCHours(0, 0, 0, 0);
        record.date = exactDate; // ensure the record saves with this normalized date
        
        const key = `${record.subject}_${record.period || 'All'}_${exactDate.getTime()}`;
        if (!sessionsToCheck.find(s => s.key === key)) {
          sessionsToCheck.push({
            key,
            subject: record.subject,
            period: record.period,
            date: exactDate,
            department: record.department,
            semester: record.semester
          });
        }
      });

      // Check if any of these sessions already exist
      for (const session of sessionsToCheck) {
        const existingCount = await Attendance.countDocuments({
          subject: session.subject,
          period: session.period,
          date: session.date,
          department: session.department,
          semester: session.semester
        });
        if (existingCount > 0) {
          return res.status(409).json({ message: `Attendance already submitted for ${session.subject} on this date and period.` });
        }
      }

      // If no duplicates, insert all
      const result = await Attendance.insertMany(req.body);
      console.log(`=> Inserted ${result.length} records`);
      
      // Update student percentages (get unique student IDs)
      const studentIds = [...new Set(req.body.map(r => r.studentId))];
      for (const id of studentIds) {
        await updateStudentAttendancePercentage(id);
      }
      req.app.get('io').emit('dataUpdated', { module: 'attendance', action: 'created' });
      return res.status(201).json({ message: 'Attendance records saved successfully' });
    } else {
      // Single insert
      const exactDate = new Date(req.body.date);
      exactDate.setUTCHours(0, 0, 0, 0);
      req.body.date = exactDate;

      const existingCount = await Attendance.countDocuments({
        studentId: req.body.studentId,
        subject: req.body.subject,
        period: req.body.period,
        date: exactDate
      });

      if (existingCount > 0) {
        return res.status(409).json({ message: `Attendance already submitted for this subject and date.` });
      }

      const attendance = new Attendance(req.body);
      const newRecord = await attendance.save();
      await updateStudentAttendancePercentage(newRecord.studentId);
      req.app.get('io').emit('dataUpdated', { module: 'attendance', action: 'created' });
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
    req.app.get('io').emit('dataUpdated', { module: 'attendance', action: 'updated' });
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
    req.app.get('io').emit('dataUpdated', { module: 'attendance', action: 'deleted' });
    res.json({ message: 'Attendance record deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
