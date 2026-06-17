import express from 'express';
import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';
import { protect, authorize, departmentScope, requirePermission, collegeScope } from '../middleware/authMiddleware.js';

const router = express.Router();

const updateStudentAttendancePercentage = async (studentId, req) => {
  try {
    const records = await Attendance.find({ 
      collegeId: { $in: [req.collegeId, 'unassigned_college'] } 
    });
    if (records.length === 0) return;
    const presentDays = records.filter(r => r.status === 'Present').length;
    const percentage = Math.round((presentDays / records.length) * 100);
    await Student.findOneAndUpdate({ id: studentId }, { attendance: percentage });
  } catch (err) {
    console.error('Failed to update student attendance percentage:', err);
  }
};

// Get all attendance records
router.get('/', protect, authorize('Admin', 'Sub Admin', 'Principal', 'HOD', 'Staff'), requirePermission('view_attendance'), departmentScope, collegeScope, async (req, res) => {
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
router.get('/student/:studentId', protect, collegeScope, async (req, res) => {
  try {
    console.log(`[GET /student/:studentId] Request for: ${req.params.studentId}. User role: ${req.user.role}, Ref ID: ${req.user.referenceId}`);
    if ((req.user.role === 'Student' || req.user.role === 'Parent') && req.user.referenceId !== req.params.studentId) {
      console.log('=> 403 Forbidden: Unauthorized');
      return res.status(403).json({ message: 'Unauthorized to view this record' });
    }
    const records = await Attendance.find({ 
      studentId: req.params.studentId 
    }).sort({ date: -1 });
    console.log(`=> Found ${records.length} records`);
    res.json(records);
  } catch (err) {
    console.log(`=> 500 Error: ${err.message}`);
    res.status(500).json({ message: err.message });
  }
});

// Record new attendance (Single or Bulk)
router.post('/', protect, authorize('Admin', 'Sub Admin', 'Principal', 'HOD', 'Staff'), requirePermission('view_attendance'), collegeScope, async (req, res) => {
  try {
    console.log(`[POST /attendance] Received payload:`, JSON.stringify(req.body));
    if (Array.isArray(req.body)) {
      if (req.body.length === 0) return res.status(400).json({ message: 'Empty payload' });

      const bulkOps = req.body.map(record => {
        const exactDate = new Date(record.date);
        exactDate.setUTCHours(0, 0, 0, 0);
        record.date = exactDate;
        record.collegeId = req.collegeId || 'unassigned_college';
        
        return {
          updateOne: {
            filter: {
              studentId: record.studentId,
              date: exactDate,
              subject: record.subject,
              period: record.period
            },
            update: { $set: record },
            upsert: true
          }
        };
      });

      await Attendance.bulkWrite(bulkOps);
      console.log(`=> Upserted ${bulkOps.length} attendance records`);
      
      // Update student percentages (get unique student IDs)
      const studentIds = [...new Set(req.body.map(r => r.studentId))];
      for (const id of studentIds) {
        await updateStudentAttendancePercentage(id, req);
      }
      req.app.get('io').emit('dataUpdated', { module: 'attendance', action: 'created' });
      return res.status(201).json({ message: 'Attendance records saved successfully' });
    } else {
      // Single insert
      const exactDate = new Date(req.body.date);
      exactDate.setUTCHours(0, 0, 0, 0);
      req.body.date = exactDate;
      req.body.collegeId = req.collegeId || 'unassigned_college'; // Explicitly inject collegeId

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
      await updateStudentAttendancePercentage(newRecord.studentId, req);
      req.app.get('io').emit('dataUpdated', { module: 'attendance', action: 'created' });
      return res.status(201).json(newRecord);
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update attendance record
router.put('/:id', protect, authorize('Admin', 'Sub Admin', 'Principal', 'HOD', 'Staff'), requirePermission('view_attendance'), collegeScope, async (req, res) => {
  try {
    const updatedRecord = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (updatedRecord) {
      await updateStudentAttendancePercentage(updatedRecord.studentId, req);
    }
    req.app.get('io').emit('dataUpdated', { module: 'attendance', action: 'updated' });
    res.json(updatedRecord);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete attendance record
router.delete('/:id', protect, authorize('Admin', 'Sub Admin', 'Principal', 'HOD', 'Staff'), requirePermission('view_attendance'), collegeScope, async (req, res) => {
  try {
    const record = await Attendance.findById(req.params.id);
    if (record) {
      await Attendance.findByIdAndDelete(req.params.id);
      await updateStudentAttendancePercentage(record.studentId, req);
    }
    req.app.get('io').emit('dataUpdated', { module: 'attendance', action: 'deleted' });
    res.json({ message: 'Attendance record deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
