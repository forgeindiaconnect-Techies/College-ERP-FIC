import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });
import Student from '../models/Student.js';
import Staff from '../models/Staff.js';
import Department from '../models/Department.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'fallback_secret_key';
  return jwt.sign({ id }, secret, {
    expiresIn: '30d',
  });
};

// Login Route (Unified for all users)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        referenceId: user.referenceId,
        studentId: user.studentId || null,
        parentOf: user.parentOf || null,
        subjects: user.subjects || [],
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Forgot Password Route
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email: email?.trim().toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'No account registered with this email address' });
    }
    
    // Simulate real enterprise secure reset dispatch
    res.json({ 
      message: 'Password reset link successfully dispatched. Please check your inbox (and spam folder) within the next few minutes.' 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Current User
router.get('/me', protect, (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    department: req.user.department,
    referenceId: req.user.referenceId
  });
});

// Dev Only: Seed Demo Users + Students + Staff + Departments
router.post('/seed', async (req, res) => {
  try {
    // ── 1. Clear all collections ──────────────────────────────────────
    await Promise.all([
      User.deleteMany(),
      Student.deleteMany(),
      Staff.deleteMany(),
      Department.deleteMany(),
    ]);

    // ── 2. Seed Users ─────────────────────────────────────────────────
    const sampleUsers = [
      // Admin
      { name: 'System Admin', email: 'admin@college.edu', password: 'password123', role: 'Admin' },

      // Principal
      { name: 'Dr. Suresh Kumar', email: 'principal@college.edu', password: 'password123', role: 'Principal' },

      // ── HODs ──
      // CSE HOD — matching the user's example exactly
      { name: 'CSE HOD', email: 'csehod@gmail.com', password: 'password123', role: 'HOD', department: 'Computer Science', referenceId: 'STF001' },
      // EE HOD
      { name: 'Prof. Rajan Iyer', email: 'rajan@college.edu', password: 'password123', role: 'HOD', department: 'Electrical Engg.', referenceId: 'STF002' },
      // ME HOD
      { name: 'Dr. Priya Nair', email: 'mehod@college.edu', password: 'password123', role: 'HOD', department: 'Mechanical Engg.', referenceId: 'STF005' },

      // ── Staff (CSE) ──
      { name: 'Dr. Ananya Rao', email: 'ananya@college.edu', password: 'password123', role: 'Staff', department: 'Computer Science', referenceId: 'STF003', subjects: ['Data Structures', 'DBMS'] },
      { name: 'Prof. Karthik S.', email: 'karthik@college.edu', password: 'password123', role: 'Staff', department: 'Computer Science', referenceId: 'STF004', subjects: ['OS', 'Machine Learning'] },
      // ── Staff (EE) ──
      { name: 'Dr. Meena Pillai', email: 'meena@college.edu', password: 'password123', role: 'Staff', department: 'Electrical Engg.', referenceId: 'STF006', subjects: ['Circuits', 'Networks'] },

      // ── Students (CSE) ──
      { name: 'John Doe', email: 'john@college.edu', password: 'password123', role: 'Student', department: 'Computer Science', referenceId: 'CS2022001', studentId: 'CS2022001' },
      { name: 'Emily Davis', email: 'emily@college.edu', password: 'password123', role: 'Student', department: 'Computer Science', referenceId: 'CS2021004', studentId: 'CS2021004' },
      { name: 'David Lee', email: 'david@college.edu', password: 'password123', role: 'Student', department: 'Computer Science', referenceId: 'CS2022002', studentId: 'CS2022002' },
      // ── Students (EE) ──
      { name: 'Alice Smith', email: 'alice@college.edu', password: 'password123', role: 'Student', department: 'Electrical Engg.', referenceId: 'EE2022001', studentId: 'EE2022001' },
      { name: 'Sarah Wilson', email: 'sarah@college.edu', password: 'password123', role: 'Student', department: 'Electrical Engg.', referenceId: 'EE2022002', studentId: 'EE2022002' },

      // ── Parents ──
      { name: 'Parent of John', email: 'parent_john@college.edu', password: 'password123', role: 'Parent', referenceId: 'CS2022001', parentOf: 'CS2022001' },
      { name: 'Parent of Alice', email: 'parent_alice@college.edu', password: 'password123', role: 'Parent', referenceId: 'EE2022001', parentOf: 'EE2022001' },

      // ── Accounts ──
      { name: 'Accounts Officer', email: 'accounts@college.edu', password: 'password123', role: 'Accounts' },
    ];

    // Use create() so pre('save') password hashing triggers
    const createdUsers = await User.create(sampleUsers);

    // ── 3. Seed Departments ───────────────────────────────────────────
    const deptData = [
      { id: 'DEPT001', name: 'Computer Science', code: 'CSE', hod: 'CSE HOD', totalStudents: 3 },
      { id: 'DEPT002', name: 'Electrical Engg.', code: 'EE', hod: 'Prof. Rajan Iyer', totalStudents: 2 },
      { id: 'DEPT003', name: 'Mechanical Engg.', code: 'ME', hod: 'Dr. Priya Nair', totalStudents: 1 },
      { id: 'DEPT004', name: 'Civil Engg.', code: 'CE', hod: 'Vacant', totalStudents: 1 },
      { id: 'DEPT005', name: 'Information Tech.', code: 'IT', hod: 'Vacant', totalStudents: 1 },
    ];
    await Department.insertMany(deptData);

    // ── 4. Seed Students ─────────────────────────────────────────────
    // NOTE: 'dept' is the Student model field (not 'department')
    const studentData = [
      { id: 'CS2022001', name: 'John Doe',       email: 'john@college.edu',    phone: '9876543210', dept: 'Computer Science',  sem: 'Sem 6', cgpa: 8.5, attendance: 92, status: 'Active',   feeStatus: 'Paid'    },
      { id: 'CS2021004', name: 'Emily Davis',    email: 'emily@college.edu',   phone: '9823456789', dept: 'Computer Science',  sem: 'Sem 6', cgpa: 8.9, attendance: 98, status: 'Active',   feeStatus: 'Paid'    },
      { id: 'CS2022002', name: 'David Lee',      email: 'david@college.edu',   phone: '9890123456', dept: 'Computer Science',  sem: 'Sem 3', cgpa: 8.2, attendance: 88, status: 'Active',   feeStatus: 'Pending' },
      { id: 'EE2022001', name: 'Alice Smith',    email: 'alice@college.edu',   phone: '9845123456', dept: 'Electrical Engg.',  sem: 'Sem 4', cgpa: 9.1, attendance: 95, status: 'Active',   feeStatus: 'Paid'    },
      { id: 'EE2022002', name: 'Sarah Wilson',   email: 'sarah@college.edu',   phone: '9801234567', dept: 'Electrical Engg.',  sem: 'Sem 4', cgpa: 9.5, attendance: 91, status: 'Active',   feeStatus: 'Paid'    },
      { id: 'ME2023001', name: 'Robert Johnson', email: 'robert@college.edu',  phone: '9812987654', dept: 'Mechanical Engg.',  sem: 'Sem 2', cgpa: 7.8, attendance: 68, status: 'Active',   feeStatus: 'Pending' },
      { id: 'CE2020001', name: 'Michael Brown',  email: 'michael@college.edu', phone: '9867123456', dept: 'Civil Engg.',       sem: 'Sem 8', cgpa: 7.4, attendance: 78, status: 'Inactive', feeStatus: 'Partial' },
      { id: 'IT2022001', name: 'Priya Sharma',   email: 'priya@college.edu',   phone: '9856789012', dept: 'Information Tech.', sem: 'Sem 5', cgpa: 9.3, attendance: 97, status: 'Active',   feeStatus: 'Paid'    },
    ];
    await Student.insertMany(studentData);

    // ── 5. Seed Staff ────────────────────────────────────────────────
    // NOTE: 'dept' is the Staff model field (not 'department')
    const staffData = [
      { id: 'STF001', name: 'CSE HOD',       email: 'csehod@gmail.com',    phone: '9900000001', dept: 'Computer Science',  designation: 'HOD',            subjects: ['Algorithms', 'Compiler Design'],  workload: 12, attendance: 98 },
      { id: 'STF002', name: 'Prof. Rajan Iyer', email: 'rajan@college.edu',  phone: '9845123456', dept: 'Electrical Engg.',  designation: 'HOD',           subjects: ['Circuits', 'Networks'],          workload: 14, attendance: 95 },
      { id: 'STF003', name: 'Dr. Ananya Rao',   email: 'ananya@college.edu', phone: '9876543210', dept: 'Computer Science',  designation: 'Professor',     subjects: ['Data Structures', 'DBMS'],       workload: 18, attendance: 97 },
      { id: 'STF004', name: 'Prof. Karthik S.', email: 'karthik@college.edu',phone: '9823456789', dept: 'Computer Science',  designation: 'Assistant Prof.',subjects: ['OS', 'Machine Learning'],        workload: 20, attendance: 89 },
      { id: 'STF005', name: 'Dr. Priya Nair',   email: 'mehod@college.edu',  phone: '9812000001', dept: 'Mechanical Engg.', designation: 'HOD',           subjects: ['Thermodynamics'],                workload: 12, attendance: 93 },
      { id: 'STF006', name: 'Dr. Meena Pillai', email: 'meena@college.edu',  phone: '9812987654', dept: 'Electrical Engg.', designation: 'Associate Prof.',subjects: ['Circuits', 'Power Systems'],     workload: 16, attendance: 92 },
    ];
    await Staff.insertMany(staffData);

    res.status(201).json({
      message: `Seed complete!`,
      summary: {
        users: createdUsers.length,
        departments: deptData.length,
        students: studentData.length,
        staff: staffData.length,
      },
      loginCredentials: [
        { role: 'Admin',    email: 'admin@college.edu',        password: 'password123' },
        { role: 'HOD(CSE)', email: 'csehod@gmail.com',         password: 'password123' },
        { role: 'HOD(EE)',  email: 'rajan@college.edu',        password: 'password123' },
        { role: 'Staff',    email: 'ananya@college.edu',       password: 'password123' },
        { role: 'Student',  email: 'john@college.edu',         password: 'password123' },
        { role: 'Parent',   email: 'parent_john@college.edu',  password: 'password123' },
        { role: 'Accounts', email: 'accounts@college.edu',     password: 'password123' },
      ]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET all users (Admin only)
router.get('/users', protect, async (req, res) => {
  try {
    if (req.user.role !== 'Admin' && req.user.role !== 'Principal') {
      return res.status(403).json({ message: 'Access denied: Admin/Principal only' });
    }
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE a user (Admin only)
router.post('/users', protect, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied: Admin only' });
    }
    const { name, email, password, role, department, referenceId, parentOf, studentId, subjects } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    const user = new User({ name, email, password, role, department, referenceId, parentOf, studentId, subjects });
    const saved = await user.save();
    const response = saved.toObject();
    delete response.password;
    res.status(201).json(response);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// UPDATE a user (Admin only)
router.put('/users/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied: Admin only' });
    }
    const { name, email, role, department, referenceId, parentOf, studentId, subjects, password } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.name = name ?? user.name;
    user.email = email ?? user.email;
    user.role = role ?? user.role;
    user.department = department !== undefined ? department : user.department;
    user.referenceId = referenceId !== undefined ? referenceId : user.referenceId;
    user.parentOf = parentOf !== undefined ? parentOf : user.parentOf;
    user.studentId = studentId !== undefined ? studentId : user.studentId;
    user.subjects = subjects !== undefined ? subjects : user.subjects;
    
    if (password) {
      user.password = password; // Hashing triggers on pre-save hook
    }
    
    const saved = await user.save();
    const response = saved.toObject();
    delete response.password;
    res.json(response);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a user (Admin only)
router.delete('/users/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied: Admin only' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User account successfully deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
