import express from 'express';
import Approval from '../models/Approval.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// GET all approvals (filtered by status or department)
router.get('/', authorize('Admin', 'Principal', 'HOD'), async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'HOD' && req.user.department) {
      query.department = req.user.department;
    }
    const approvals = await Approval.find(query).sort({ createdAt: -1 });
    res.json(approvals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET pending approvals (for Principal/Admin)
router.get('/pending', authorize('Admin', 'Principal'), async (req, res) => {
  try {
    const pending = await Approval.find({ status: 'Pending' }).sort({ createdAt: -1 });
    res.json(pending);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE approval request (for HOD / Staff)
router.post('/', authorize('Admin', 'HOD', 'Staff'), async (req, res) => {
  try {
    const { type, department, requestedBy, details, priority, aiRecommendation, aiScore } = req.body;
    
    // Automatically capture submitter details if not provided
    const approval = new Approval({
      type,
      department: department || req.user.department || 'General',
      requestedBy: requestedBy || req.user.name,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      details,
      priority: priority || 'Medium',
      aiRecommendation: aiRecommendation || 'Safe to Approve. System pre-audit completed.',
      aiScore: aiScore || 95,
      status: 'Pending'
    });

    const saved = await approval.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update approval status (Approve/Reject)
router.put('/:id', authorize('Admin', 'Principal'), async (req, res) => {
  try {
    const { status, remarks } = req.body;
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status update. Must be Approved or Rejected' });
    }

    const approval = await Approval.findById(req.params.id);
    if (!approval) {
      return res.status(404).json({ message: 'Approval request not found' });
    }

    approval.status = status;
    approval.remarks = remarks || (status === 'Approved' ? 'Approved by Principal' : 'Rejected by Principal');
    
    const updated = await approval.save();
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
