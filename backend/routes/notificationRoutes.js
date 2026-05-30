import express from 'express';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // If Admin/Sub Admin, they can see a global view or specific ones.
    // For now, let's just get notifications meant for req.user._id
    // But since Admins might need system alerts, let's just fetch all if admin, or target recipient
    let query = {
      $or: [
        { recipient: req.user._id },
        { targetRoles: req.user.role }
      ]
    };
    if (req.user.role === 'Admin') {
       query = {}; // Admin sees all system notifications
    } else if (req.user._id === 'mock-id') {
       query = {}; // Mock users see all notifications
    }

    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(20);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching notifications' });
  }
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
router.put('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    notification.isRead = true;
    await notification.save();
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Server Error updating notification' });
  }
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
router.put('/read-all', protect, async (req, res) => {
  try {
    let query = { recipient: req.user._id };
    if (req.user.role === 'Admin' || req.user._id === 'mock-id') query = {};
    
    await Notification.updateMany(query, { isRead: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error updating notifications' });
  }
});

export default router;
