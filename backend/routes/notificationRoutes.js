import express from 'express';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { protect, collegeScope } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
router.get('/', protect, collegeScope, async (req, res) => {
  try {
    // If Admin/Sub Admin, they can see a global view or specific ones.
    // For now, let's just get notifications meant for req.user._id
    // But since Admins might need system alerts, let's just fetch all if admin, or target recipient
    let query = {
      $or: [
        { recipient: req.user._id },
        { targetRoles: { $in: [req.user.role, req.user.role.toLowerCase(), 'Admin', 'admin'] } }
      ]
    };
    
    // Add tenant restriction if user belongs to a tenant
    if (req.collegeId) {
      query = {
        $and: [
          { $or: [{ collegeId: req.collegeId }, { tenantId: req.collegeId }] },
          query
        ]
      };
    }

    if (req.user.role === 'Super Admin') {
       query = {}; // Super Admin sees all system notifications
    }

    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(20);
    // Map readBy to isRead for the frontend
    const mapped = notifications.map(n => {
      const obj = n.toObject();
      obj.isRead = obj.readBy && obj.readBy.some(id => id.toString() === req.user._id.toString());
      return obj;
    });
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching notifications' });
  }
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
router.put('/:id/read', protect, collegeScope, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    if (!notification.readBy) notification.readBy = [];
    if (!notification.readBy.includes(req.user._id)) {
      notification.readBy.push(req.user._id);
      await notification.save();
    }
    const obj = notification.toObject();
    obj.isRead = true;
    res.json(obj);
  } catch (error) {
    res.status(500).json({ message: 'Server Error updating notification' });
  }
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
router.put('/read-all', protect, collegeScope, async (req, res) => {
  try {
    let query = { recipient: req.user._id };
    if (req.user.role === 'Admin' || req.user._id === 'mock-id') query = {};
    
    await Notification.updateMany(query, { $addToSet: { readBy: req.user._id } });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error updating notifications' });
  }
});

// @desc    Create a new notification
// @route   POST /api/notifications
// @access  Private
router.post('/', protect, collegeScope, async (req, res) => {
  try {
    const { recipient, email, targetRoles, title, message, type, link } = req.body;
    let actualRecipient = recipient;

    if (email) {
      let user = await User.findOne({ email });
      if (user) {
        actualRecipient = user._id;
      }
    }
    
    // Fallback: if actualRecipient is still undefined, try finding by name (passed as targetName)
    if (!actualRecipient && req.body.targetName) {
      const userByName = await User.findOne({ name: req.body.targetName });
      if (userByName) {
        actualRecipient = userByName._id;
      }
    }
    
    const notification = new Notification({
      recipient: actualRecipient,
      targetRoles,
      title,
      message,
      type,
      link,
      tenantId: req.collegeId || req.user.tenantId || 'unassigned_college',
      collegeId: req.collegeId || req.user.tenantId || 'unassigned_college'
    });

    const created = await notification.save();
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ message: 'Server Error creating notification' });
  }
});

export default router;
