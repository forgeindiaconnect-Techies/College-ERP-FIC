import express from 'express';
import Staff from '../models/Staff.js';
import { protect, authorize, departmentScope, requirePermission, collegeScope, checkSubscription } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import Approval from '../models/Approval.js';
import Notification from '../models/Notification.js';
import bcrypt from 'bcryptjs';
import ActivityLog from '../models/ActivityLog.js';

const router = express.Router();

// Get all staff
router.get('/', protect, authorize('Admin', 'Sub Admin', 'Principal', 'HOD'), requirePermission('manage_staff'), departmentScope, collegeScope, async (req, res) => {
  try {
    const dept = req.dept || req.query.dept;
    const query = dept ? { $or: [{ dept: dept }, { department: dept }] } : {};
    const staff = await Staff.find(query);
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get staff for payroll (Basic Info)
router.get('/payroll-list', protect, authorize('Admin', 'Principal', 'Accounts'), collegeScope, async (req, res) => {
  try {
    const staff = await Staff.find({ collegeId: req.collegeId || 'unassigned_college',  });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new staff
router.post('/', protect, authorize('Admin', 'Sub Admin', 'Principal', 'HOD'), requirePermission('manage_staff'), collegeScope, checkSubscription, async (req, res) => {
  const staffData = req.body;
  const isHOD = req.user.role && req.user.role.toLowerCase() === 'hod';
  
  // Always stamp the tenant collegeId so compound indexes work
  if (!staffData.collegeId && req.collegeId) {
    staffData.collegeId = req.collegeId;
  }

  if (isHOD) {
    staffData.status = 'Pending Approval';
  }

  const staff = new Staff(staffData);
  try {
    const newStaff = await staff.save();
    
    // Create a User account for login with default password
    try {
      const existingUser = await User.findOne({ email: newStaff.email });
      if (!existingUser) {
        const user = new User({
          name: newStaff.name,
          email: newStaff.email,
          password: 'password123',
          role: newStaff.designation === 'HOD' ? 'HOD' : 'Staff',
          department: newStaff.dept,
          referenceId: newStaff.id
        });
        await user.save();
      }
    } catch (userErr) {
      console.error('Failed to create User account for Staff:', userErr);
    }

    if (isHOD) {
      try {
        const approval = new Approval({
          type: 'Staff Onboarding',
          department: newStaff.dept,
          requestedBy: req.user.name,
          date: new Date().toLocaleDateString('en-GB'),
          priority: 'High',
          status: 'Pending',
          details: `HOD requested to add new staff member: ${newStaff.name} (${newStaff.id}) to ${newStaff.dept}`,
          remarks: `ID: ${newStaff.id}`
        });
        await approval.save();

        const notification = new Notification({
          title: 'New Staff Approval Required',
          message: `${req.user.name} added new staff: ${newStaff.name} in ${newStaff.dept}`,
          type: 'Info',
          targetRoles: ['Admin', 'Principal']
        });
        await notification.save();
        
        // Emit event for real-time dashboard update
        req.app.get('io').emit('staffUpdated', { action: 'pending', staff: newStaff });
      } catch (logErr) {
        console.error('Failed to create approval log:', logErr);
      }
    } else {
       req.app.get('io').emit('staffUpdated', { action: 'added', staff: newStaff });
    }

    req.app.get('io').emit('dataUpdated', { module: 'staff', action: 'created' });

    // Activity Log
    ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      role: req.user.role,
      action: `Added new staff: ${newStaff.name} (${newStaff.id})`,
      moduleName: 'Staff Management',
      dept: req.user.department || 'System',
      ip: req.ip || req.connection.remoteAddress
    }).catch(e => console.error(e));

    res.status(201).json(newStaff);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Approve staff
router.put('/:id/approve', protect, authorize('Admin', 'Principal'), collegeScope, checkSubscription, async (req, res) => {
  try {
    const updatedStaff = await Staff.findOneAndUpdate(
      { id: req.params.id },
      { status: 'Active' },
      { new: true }
    );
    
    if (!updatedStaff) return res.status(404).json({ message: 'Staff not found' });

    // Update approval document if exists
    await Approval.findOneAndUpdate(
      { type: 'Staff Onboarding', remarks: `ID: ${req.params.id}`, status: 'Pending' },
      { status: 'Approved' }
    );

    req.app.get('io').emit('staffUpdated', { action: 'approved', staff: updatedStaff });
    req.app.get('io').emit('dataUpdated', { module: 'staff', action: 'updated' });

    res.json({ message: 'Staff approved successfully', staff: updatedStaff });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update staff
router.put('/:id', protect, authorize('Admin', 'Sub Admin', 'Principal', 'HOD'), requirePermission('manage_staff'), collegeScope, checkSubscription, async (req, res) => {
  try {
    const updatedStaff = await Staff.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    req.app.get('io').emit('staffUpdated', { action: 'updated', staff: updatedStaff });
    req.app.get('io').emit('dataUpdated', { module: 'staff', action: 'updated' });
    res.json(updatedStaff);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete staff
router.delete('/:id', protect, authorize('Admin', 'Sub Admin', 'Principal', 'HOD'), requirePermission('manage_staff'), collegeScope, checkSubscription, async (req, res) => {
  try {
    await Staff.findOneAndDelete({ id: req.params.id });
    req.app.get('io').emit('staffUpdated', { action: 'deleted', id: req.params.id });
    req.app.get('io').emit('dataUpdated', { module: 'staff', action: 'deleted' });
    res.json({ message: 'Staff deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
