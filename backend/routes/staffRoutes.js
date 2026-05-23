import express from 'express';
import Staff from '../models/Staff.js';
import { protect, authorize, departmentScope } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all staff
router.get('/', protect, authorize('Admin', 'Principal', 'HOD'), departmentScope, async (req, res) => {
  try {
    const dept = req.dept || req.query.dept;
    const query = dept ? { dept: dept } : {};
    const staff = await Staff.find(query);
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new staff
router.post('/', protect, authorize('Admin', 'Principal'), async (req, res) => {
  const staff = new Staff(req.body);
  try {
    const newStaff = await staff.save();
    res.status(201).json(newStaff);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update staff
router.put('/:id', protect, authorize('Admin', 'Principal'), async (req, res) => {
  try {
    const updatedStaff = await Staff.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    res.json(updatedStaff);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete staff
router.delete('/:id', protect, authorize('Admin', 'Principal'), async (req, res) => {
  try {
    await Staff.findOneAndDelete({ id: req.params.id });
    res.json({ message: 'Staff deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
