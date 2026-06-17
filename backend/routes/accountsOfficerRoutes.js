import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { protect, authorize, checkSubscription } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all Accounts Officers
router.get('/', protect, authorize('Admin', 'Super Admin'), async (req, res) => {
  try {
    const filter = { role: { $regex: new RegExp('^accounts$', 'i') } };
    if (req.user.role !== 'Super Admin') {
      filter.collegeId = req.user.collegeId || req.user.tenantId;
    }
    const officers = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json(officers);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create an Accounts Officer
router.post('/', protect, authorize('Admin', 'Super Admin'), checkSubscription, async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    
    let userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const newUser = new User({
      name,
      email,
      phone,
      password, // Pass plain password, Mongoose schema will hash it
      role: 'Accounts',
      collegeId: req.user.collegeId || req.user.tenantId
    });

    await newUser.save();
    
    // Emit real-time event if socket.io is configured
    if (req.app.get('io')) {
      req.app.get('io').emit('dataUpdated', { module: 'accounts-officer', action: 'created' });
    }

    res.status(201).json({ message: 'Accounts Officer created successfully', user: { id: newUser._id, name: newUser.name, email: newUser.email } });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create accounts officer', error: err.message });
  }
});

// Delete an Accounts Officer
router.delete('/:id', protect, authorize('Admin', 'Super Admin'), checkSubscription, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Accounts Officer not found' });
    }
    
    // Ensure the Admin can only delete officers from their own college
    if (req.user.role !== 'Super Admin' && user.collegeId !== (req.user.collegeId || req.user.tenantId)) {
      return res.status(403).json({ message: 'Unauthorized to delete this user' });
    }

    await User.findByIdAndDelete(req.params.id);
    
    if (req.app.get('io')) {
      req.app.get('io').emit('dataUpdated', { module: 'accounts-officer', action: 'deleted' });
    }

    res.json({ message: 'Accounts Officer deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete accounts officer', error: err.message });
  }
});

export default router;
