import express from 'express';
import Salary from '../models/Salary.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Compute net salary before inserting/updating
const processPayload = (data) => {
  const basic = Number(data.basicPay) || 0;
  const allowances = Number(data.allowances) || 0;
  const deductions = Number(data.deductions) || 0;
  return { ...data, basicPay: basic, allowances, deductions, netSalary: (basic + allowances) - deductions };
};

// GET all salaries — Admin, Principal, Accounts
router.get('/', protect, authorize('Admin', 'Principal', 'Accounts'), async (req, res) => {
  try {
    const salaries = await Salary.find().sort({ createdAt: -1 });
    res.json(salaries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET salaries for a specific staff member
router.get('/staff/:staffId', protect, async (req, res) => {
  try {
    const salaries = await Salary.find({ staffId: req.params.staffId }).sort({ createdAt: -1 });
    res.json(salaries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST — Create new payroll record
router.post('/', protect, authorize('Admin', 'Principal', 'Accounts'), async (req, res) => {
  try {
    if (Array.isArray(req.body)) {
      const docs = req.body.map(processPayload);
      const created = await Salary.insertMany(docs);
      return res.status(201).json(created);
    }
    const salary = new Salary(processPayload(req.body));
    const saved = await salary.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT — Update salary record (e.g. Disburse)
router.put('/:id', protect, authorize('Admin', 'Principal', 'Accounts'), async (req, res) => {
  try {
    const payload = processPayload(req.body);
    if (req.body.status === 'Disbursed' && !payload.paymentDate) {
      payload.paymentDate = new Date();
    }
    const updated = await Salary.findByIdAndUpdate(req.params.id, payload, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE — Remove payroll record
router.delete('/:id', protect, authorize('Admin', 'Principal', 'Accounts'), async (req, res) => {
  try {
    await Salary.findByIdAndDelete(req.params.id);
    res.json({ message: 'Salary record deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
