import express from 'express';
import College from '../models/College.js';
import Subscription from '../models/Subscription.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get College Admin Subscription details
// @route   GET /api/admin/my-subscription
// @access  Private/Admin
router.get('/my-subscription', protect, authorize('Admin'), async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    if (!tenantId) {
      return res.status(400).json({ message: 'Tenant ID not found for this admin.' });
    }

    const college = await College.findOne({ tenantId });
    if (!college) {
      return res.status(404).json({ message: 'College not found.' });
    }

    const payments = await Subscription.find({ tenantId }).sort({ createdAt: -1 });

    res.json({
      subscription: {
        plan: college.subscriptionPlan,
        status: college.subscriptionStatus,
        endDate: college.trialEndDate // we use trialEndDate for plan end date globally
      },
      payments
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching subscription.' });
  }
});

export default router;
