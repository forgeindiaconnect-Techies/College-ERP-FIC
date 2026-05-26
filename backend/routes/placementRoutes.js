import express from 'express';
import PlacementCompany from '../models/PlacementCompany.js';
import PlacementJob from '../models/PlacementJob.js';
import PlacementApplication from '../models/PlacementApplication.js';
import PlacementInterview from '../models/PlacementInterview.js';
import PlacementSelection from '../models/PlacementSelection.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get all placement companies
// @route   GET /api/placement/companies
// @access  Private
router.get('/companies', protect, async (req, res) => {
  try {
    const companies = await PlacementCompany.find({});
    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching companies' });
  }
});

// @desc    Get all placement jobs
// @route   GET /api/placement/jobs
// @access  Private
router.get('/jobs', protect, async (req, res) => {
  try {
    const jobs = await PlacementJob.find({});
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching jobs' });
  }
});

// @desc    Get all placement applications
// @route   GET /api/placement/applications
// @access  Private
router.get('/applications', protect, async (req, res) => {
  try {
    const applications = await PlacementApplication.find({})
      .populate({
        path: 'studentProfile',
        populate: { path: 'user', select: 'name email phone' }
      });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching applications' });
  }
});

// @desc    Get all placement interviews
// @route   GET /api/placement/interviews
// @access  Private
router.get('/interviews', protect, async (req, res) => {
  try {
    const interviews = await PlacementInterview.find({});
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching interviews' });
  }
});

// @desc    Get all placement selections
// @route   GET /api/placement/selections
// @access  Private
router.get('/selections', protect, async (req, res) => {
  try {
    const selections = await PlacementSelection.find({});
    res.json(selections);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching selections' });
  }
});

export default router;
