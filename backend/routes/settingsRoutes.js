import express from 'express';
import SystemSetting from '../models/SystemSetting.js';
import LoginLog from '../models/LoginLog.js';
import { protect, authorize, collegeScope } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get system settings
// @route   GET /api/settings
// @access  Private/Admin
router.get('/', protect, authorize('Admin', 'Sub Admin'), collegeScope, async (req, res) => {
  try {
    let settings = await SystemSetting.findOne({ key: 'global_config' });
    if (!settings) {
      settings = await SystemSetting.create({ key: 'global_config' });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching settings' });
  }
});

// @desc    Update system settings
// @route   PUT /api/settings
// @access  Private/Admin
router.put('/', protect, authorize('Admin'), collegeScope, async (req, res) => {
  try {
    const settings = await SystemSetting.findOneAndUpdate(
      { key: 'global_config' },
      req.body,
      { new: true, upsert: true }
    );
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server Error updating settings' });
  }
});

// @desc    Get login logs
// @route   GET /api/settings/logs
// @access  Private/Admin
router.get('/logs', protect, authorize('Admin', 'Sub Admin'), collegeScope, async (req, res) => {
  try {
    const logs = await LoginLog.find({}).sort({ createdAt: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching login logs' });
  }
});

export default router;
