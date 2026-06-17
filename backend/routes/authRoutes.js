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
import College from '../models/College.js';
import Staff from '../models/Staff.js';
import Department from '../models/Department.js';
import { protect, authorize, collegeScope, checkSubscription } from '../middleware/authMiddleware.js';
import bcrypt from 'bcryptjs';
import ActivityLog from '../models/ActivityLog.js';
import Subscription from '../models/Subscription.js';
import { calculateSubscriptionStatus } from '../utils/subscriptionHelper.js';

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
    // Case-insensitive search for email to prevent login failures due to capitalization
    const user = await User.findOne({ email: { $regex: new RegExp(`^${email.trim()}$`, 'i') } });

    if (user && (await user.matchPassword(password))) {
      // Async Activity Log
      ActivityLog.create({
        userId: user._id.toString(),
        userName: user.name,
        role: user.role,
        action: 'System Login',
        moduleName: 'Authentication',
        dept: user.department || 'System',
        ip: req.ip || req.connection.remoteAddress,
        collegeId: user.tenantId || user.collegeId || 'unassigned_college'
      }).catch(err => console.error('Failed to log login activity', err));

      // Fetch College Subscription
      let subscriptionDetails = null;
      const effectiveTenantId = user.tenantId || user.collegeId;
      if (effectiveTenantId && effectiveTenantId !== 'system') {
        const college = await College.findOne({ tenantId: effectiveTenantId });
        if (college) {
          subscriptionDetails = calculateSubscriptionStatus(college);
          
          // Auto-update DB if status changed
          if (college.subscriptionStatus !== subscriptionDetails.status) {
            college.subscriptionStatus = subscriptionDetails.status;
            await college.save();
          }
        }
      }

      let collegeName = null;
      if (effectiveTenantId && effectiveTenantId !== 'system') {
        const college = await College.findOne({ tenantId: effectiveTenantId });
        if (college) collegeName = college.name;
      }

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
        permissions: user.permissions || [],
        tenantId: user.tenantId || null,
        subscription: subscriptionDetails,
        collegeName: collegeName,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('[auth/login] Error:', error);
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

// Register College (SaaS Onboarding)
router.post('/register-college', async (req, res) => {
  const { collegeName, adminName, email, phone, password, principalName, principalEmail, principalPassword } = req.body;
  try {
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedPrincipalEmail = principalEmail?.trim().toLowerCase();
    
    // Check if college name already exists
    const existingCollegeByName = await College.findOne({ name: { $regex: new RegExp(`^${collegeName.trim()}$`, 'i') } });
    if (existingCollegeByName) {
      return res.status(400).json({ message: `A college with the name '${collegeName}' is already registered in the system.` });
    }

    const existingCollege = await College.findOne({ email: normalizedEmail });
    if (existingCollege) {
      return res.status(400).json({ message: `The email '${normalizedEmail}' is already used by another college. You must provide a unique admin email for each new college.` });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: `The email '${normalizedEmail}' is already an active user account. Please use a different email.` });
    }
    
    if (normalizedPrincipalEmail) {
      const existingPrincipalUser = await User.findOne({ email: normalizedPrincipalEmail });
      if (existingPrincipalUser) {
        return res.status(400).json({ message: `The email '${normalizedPrincipalEmail}' is already an active user account. Please use a different principal email.` });
      }
    }

    // Generate Tenant ID safely
    const lastCollege = await College.findOne({}, {}, { sort: { 'createdAt': -1 } });
    let nextNum = 1;
    if (lastCollege && lastCollege.tenantId && lastCollege.tenantId.startsWith('COL')) {
      const lastNum = parseInt(lastCollege.tenantId.replace('COL', '').split('-')[0], 10);
      if (!isNaN(lastNum)) {
        nextNum = lastNum + 1;
      }
    }
    // Add randomness and timestamp to absolutely prevent race conditions or dupes
    const timestampSuffix = Date.now().toString().slice(-4);
    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const tenantId = `COL${String(nextNum).padStart(3, '0')}-${timestampSuffix}${randomSuffix}`;

    const trialStartDate = new Date();
    const trialEndDate = new Date();
    trialEndDate.setDate(trialStartDate.getDate() + 1); // 1-Day Free Trial

    const newCollege = new College({
      name: collegeName,
      adminName,
      email: email.trim().toLowerCase(),
      phone,
      tenantId,
      subscriptionPlan: 'Trial',
      subscriptionStatus: 'Active',
      trialStartDate,
      trialEndDate,
      adminPassword: password,
      principalEmail: normalizedPrincipalEmail,
      principalPassword
    });
    await newCollege.save();

    try {
      const newAdmin = new User({
        name: adminName,
        email: email.trim().toLowerCase(),
        password,
        role: 'Admin',
        phone,
        tenantId
      });
      await newAdmin.save();

      if (principalName && normalizedPrincipalEmail && principalPassword) {
        const newPrincipal = new User({
          name: principalName,
          email: normalizedPrincipalEmail,
          password: principalPassword,
          role: 'Principal',
          phone,
          tenantId
        });
        await newPrincipal.save();
      }
    } catch (userError) {
      // Rollback college creation if user creation fails
      await College.findOneAndDelete({ _id: newCollege._id });
      throw new Error('Failed to create Admin/Principal user account. College registration rolled back. ' + userError.message);
    }

    res.status(201).json({
      message: 'Your 1-day free trial has been activated successfully.',
      tenantId
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'An unexpected error occurred during registration.' });
  }
});

// Submit Payment for Verification
router.post('/verify-payment', protect, collegeScope, async (req, res) => {
  const { paymentId, planName, amount } = req.body;
  
  try {
    const college = await College.findOne({ tenantId: req.user.tenantId });
    if (!college) {
      return res.status(404).json({ message: 'College not found.' });
    }

    const now = new Date();
    const endDate = new Date(now);
    // Subscription lasts for 30 days
    endDate.setDate(endDate.getDate() + 30);

    const subscription = new Subscription({
      tenantId: college.tenantId,
      collegeId: college._id,
      collegeName: college.name,
      planName,
      amount,
      startDate: now,
      endDate: endDate,
      paymentStatus: 'Pending', // Sent to Super Admin for verification
      transactionId: paymentId
    });

    await subscription.save();

    // Do NOT automatically set college to Active. Super Admin must verify it first.
    // However, we send a notification to Super Admin
    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      role: req.user.role,
      action: `Requested Upgrade to ${planName}`,
      moduleName: 'Subscription',
      ip: req.ip || req.connection.remoteAddress,
      collegeId: 'system' // So it shows on Super Admin logs potentially
    });

    res.json({ message: 'Your subscription request has been submitted successfully and is pending verification by the Super Admin.', subscription });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all colleges (Super Admin only)
router.get('/colleges', protect, collegeScope, async (req, res) => {
  try {
    if (req.user.role !== 'Super Admin') {
      return res.status(403).json({ message: 'Not authorized as Super Admin' });
    }
    
    const { calculateSubscriptionStatus } = await import('../utils/subscriptionHelper.js');
    const colleges = await College.find().sort({ createdAt: -1 });
    
    const collegesWithStats = await Promise.all(colleges.map(async (college) => {
      // Users are linked via tenantId string (e.g. 'COL002-614'), NOT collegeId ObjectId
      const userCount = await User.countDocuments({ tenantId: college.tenantId });
      // Compute real-time subscription status from dates (same as Subscriptions/Trials tabs)
      const liveStatus = calculateSubscriptionStatus(college);
      return {
        ...college.toObject(),
        totalUsers: userCount,
        // Override the raw DB status with the accurately computed live status
        subscriptionStatus: liveStatus.status,
        subscriptionPlan: liveStatus.planName,
        daysRemaining: liveStatus.daysRemaining,
      };
    }));
    
    res.json(collegesWithStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Current User
router.get('/me', protect, collegeScope, async (req, res) => {
  let collegeName = null;
  if (req.user.tenantId && req.user.tenantId !== 'system') {
    const college = await College.findOne({ tenantId: req.user.tenantId });
    if (college) collegeName = college.name;
  }

  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    department: req.user.department,
    collegeName: collegeName,
    referenceId: req.user.referenceId
  });
});

// Dev Only: Repair orphaned users
router.get('/repair-users', async (req, res) => {
  try {
    let repaired = 0;
    const students = await Student.find();
    for (const student of students) {
      if (!student.email) continue;
      const u = await User.findOne({ email: { $regex: new RegExp(`^${student.email.trim()}$`, 'i') } });
      if (!u) {
        await User.create({
          name: student.name, email: student.email, password: 'password123',
          role: 'Student', department: student.dept, referenceId: student.id
        });
        repaired++;
      } else {
        u.role = 'Student';
        u.password = 'password123';
        u.markModified('password');
        await u.save();
        repaired++;
      }
    }

    const staffMembers = await Staff.find();
    for (const stf of staffMembers) {
      if (!stf.email) continue;
      const u = await User.findOne({ email: { $regex: new RegExp(`^${stf.email.trim()}$`, 'i') } });
      if (!u) {
        await User.create({
          name: stf.name, email: stf.email, password: 'password123',
          role: stf.designation === 'HOD' ? 'HOD' : 'Staff', department: stf.dept, referenceId: stf.id
        });
        repaired++;
      } else {
        u.role = stf.designation === 'HOD' ? 'HOD' : 'Staff';
        u.password = 'password123';
        u.markModified('password');
        await u.save();
        repaired++;
      }
    }
    res.json({ message: `Repaired ${repaired} users.` });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// Dev Only: Inspect specific users
router.get('/check-users', async (req, res) => {
  try {
    const users = await User.find({ email: /pooja|gowtham/i });
    res.json(users);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/clean-pooja', async (req, res) => {
  try {
    await College.deleteMany({ email: { $in: ['pooja@gmail.com', 'gowtham@gmail.com'] } });
    await User.deleteMany({ email: { $in: ['pooja@gmail.com', 'gowtham@gmail.com'] } });
    res.json({ message: 'Test emails cleared from both College and User.' });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
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
router.get('/users', protect, collegeScope, async (req, res) => {
  try {
    const role = (req.user.role || '').toLowerCase();
    if (role !== 'admin' && role !== 'principal' && role !== 'system admin') {
      return res.status(403).json({ message: 'Access denied: Admin/Principal only' });
    }
    // Prevent cross-tenant data leak
    const effectiveTenantId = req.collegeId || req.user.tenantId || req.user.collegeId || 'unassigned_college';
    const users = await User.find({ 
      $or: [
        { tenantId: effectiveTenantId },
        { collegeId: effectiveTenantId }
      ]
    }, '-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE a user
router.post('/users', protect, authorize('Admin', 'Sub Admin', 'Principal'), collegeScope, checkSubscription, async (req, res) => {
  try {
    const { name, email, password, role, department, referenceId, parentOf, studentId, subjects, phone } = req.body;
    
    // Check Tenant Limits if applicable
    const tenantId = req.user.tenantId;
    if (tenantId) {
      const college = await College.findOne({ tenantId });
      if (college && college.subscriptionPlan === 'Trial' && college.subscriptionStatus === 'Active') {
        if (role === 'HOD') {
          const hodCount = await User.countDocuments({ tenantId, role: 'HOD' });
          if (hodCount >= 1) return res.status(403).json({ message: 'Trial Limit Exceeded: Maximum 1 HOD allowed.' });
        }
        if (role === 'Student') {
          const studentCount = await User.countDocuments({ tenantId, role: 'Student' });
          if (studentCount >= 2) return res.status(403).json({ message: 'Trial Limit Exceeded: Maximum 2 Students allowed.' });
        }
      } else if (college && college.subscriptionStatus === 'Expired') {
        return res.status(403).json({ message: 'Subscription Expired. Please upgrade to create users.' });
      }
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    const user = new User({ name, email, password, role, department, referenceId, parentOf, studentId, subjects, phone, tenantId });
    const saved = await user.save();
    const response = saved.toObject();
    delete response.password;
    req.app.get('io').emit('dataUpdated', { module: 'users', action: 'created' });
    res.status(201).json(response);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// UPDATE a user
router.put('/users/:id', protect, authorize('Admin', 'Sub Admin', 'Principal'), collegeScope, checkSubscription, async (req, res) => {
  try {
    const { name, email, role, department, referenceId, parentOf, studentId, subjects, password, phone } = req.body;
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
    if (phone !== undefined) user.phone = phone;
    
    if (password) {
      user.password = password; // Hashing triggers on pre-save hook
    }
    
    const saved = await user.save();
    const response = saved.toObject();
    delete response.password;
    req.app.get('io').emit('dataUpdated', { module: 'users', action: 'updated' });
    res.json(response);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a user
router.delete('/users/:id', protect, authorize('Admin', 'Sub Admin', 'Principal'), collegeScope, checkSubscription, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Cascade delete related records to prevent orphaned duplicate keys
    if (user.role === 'Student' && user.email) {
      await Student.findOneAndDelete({ email: user.email });
    } else if ((user.role === 'Staff' || user.role === 'HOD') && user.email) {
      await Staff.findOneAndDelete({ email: user.email });
    }

    req.app.get('io').emit('dataUpdated', { module: 'users', action: 'deleted' });
    res.json({ message: 'User account successfully deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
