import express from 'express';
import Fee from '../models/Fee.js';
import Department from '../models/Department.js';
import PlacementSelection from '../models/PlacementSelection.js';
import Attendance from '../models/Attendance.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get dashboard analytics
// @route   GET /api/analytics
// @access  Private/Admin
router.get('/', protect, authorize('Admin', 'Sub Admin', 'Principal'), async (req, res) => {
  try {
    // 1. Fee Revenue (Total Paid vs Pending)
    const feeStats = await Fee.aggregate([
      {
        $group: {
          _id: null,
          totalCollected: { $sum: "$paidAmount" },
          totalPending: { $sum: "$pendingAmount" }
        }
      }
    ]);

    // 2. Department Rankings (by total students for simplicity)
    const deptStats = await Department.find({}, 'name totalStudents').sort({ totalStudents: -1 });

    // 3. Placement Stats (Count by Company)
    const placementStats = await PlacementSelection.aggregate([
      {
        $group: {
          _id: "$company",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // 4. Attendance Trends (Overall Present vs Absent)
    const attendanceStats = await Attendance.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      fees: feeStats.length > 0 ? feeStats[0] : { totalCollected: 0, totalPending: 0 },
      departments: deptStats,
      placements: placementStats,
      attendance: attendanceStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error generating analytics' });
  }
});

export default router;
