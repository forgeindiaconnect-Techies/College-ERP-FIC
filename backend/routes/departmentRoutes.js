import express from 'express';
import Department from '../models/Department.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all departments
router.get('/', protect, authorize('Admin', 'Principal'), async (req, res) => {
  try {
    const departments = await Department.find();
    res.json(departments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new department
router.post('/', protect, authorize('Admin', 'Principal'), async (req, res) => {
  const department = new Department(req.body);
  try {
    const newDepartment = await department.save();
    res.status(201).json(newDepartment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update department
router.put('/:id', protect, authorize('Admin', 'Principal'), async (req, res) => {
  try {
    const updatedDepartment = await Department.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    res.json(updatedDepartment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete department
router.delete('/:id', protect, authorize('Admin', 'Principal'), async (req, res) => {
  try {
    await Department.findOneAndDelete({ id: req.params.id });
    res.json({ message: 'Department deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
