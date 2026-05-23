import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Derive __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: `${__dirname}/.env` });
console.log('✅ Loaded JWT secret:', process.env.JWT_SECRET ? 'YES (loaded)' : '❌ MISSING!');

// Import Routes
import studentRoutes from './routes/studentRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import marksRoutes from './routes/marksRoutes.js';
import feesRoutes from './routes/feesRoutes.js';
import reportsRoutes from './routes/reportsRoutes.js';
import authRoutes from './routes/authRoutes.js';

// Import Models for auto-seeding
import User from './models/User.js';
import Student from './models/Student.js';
import Staff from './models/Staff.js';
import Department from './models/Department.js';
import Attendance from './models/Attendance.js';
import Fee from './models/Fee.js';
import Mark from './models/Mark.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ── Auto-seed helper ──────────────────────────────────────────────────────────
// Only seeds when the DB is truly empty — does NOT wipe data on every restart
const autoSeedIfEmpty = async () => {
  try {
    const existingUserCount = await User.countDocuments();
    if (existingUserCount > 0) {
      console.log(`✅ Database already has ${existingUserCount} users — skipping seed.`);
      return;
    }
    console.log('🌱 Empty database detected – seeding fresh demo data...');
    console.log('🌱 Auto-seeding fresh demo data across all 6 roles & departments...');


    // 1. Users (bcrypt hash triggers via pre-save hook)
    await User.create([
      { name: 'System Admin',     email: 'admin@college.edu',        password: 'password123', role: 'Admin' },
      
      // HODs
      { name: 'CSE HOD',          email: 'csehod@gmail.com',         password: 'password123', role: 'HOD',     department: 'Computer Science', referenceId: 'STF001' },
      { name: 'ECE HOD',          email: 'ecehod@gmail.com',         password: 'password123', role: 'HOD',     department: 'Electronics & Comm.', referenceId: 'STF002' },
      { name: 'EEE HOD',          email: 'eeehod@gmail.com',         password: 'password123', role: 'HOD',     department: 'Electrical & Electronics', referenceId: 'STF003' },
      { name: 'MECH HOD',         email: 'mechhod@gmail.com',        password: 'password123', role: 'HOD',     department: 'Mechanical Engg.', referenceId: 'STF004' },
      { name: 'BCA HOD',          email: 'bcahod@gmail.com',         password: 'password123', role: 'HOD',     department: 'Bachelor of Computer App.', referenceId: 'STF005' },
      { name: 'MBA HOD',          email: 'mbahod@gmail.com',         password: 'password123', role: 'HOD',     department: 'Master of Business Admin.', referenceId: 'STF006' },
      
      // Staff
      { name: 'Prof. Karthik S.', email: 'karthik@college.edu',      password: 'password123', role: 'Staff',   department: 'Computer Science', referenceId: 'STF007', subjects: ['OS', 'Machine Learning'] },
      { name: 'Dr. Ananya Rao',   email: 'ananya@college.edu',       password: 'password123', role: 'Staff',   department: 'Computer Science', referenceId: 'STF008', subjects: ['Data Structures', 'DBMS'] },
      { name: 'Prof. Rajan Iyer', email: 'rajan@college.edu',        password: 'password123', role: 'Staff',   department: 'Electrical & Electronics', referenceId: 'STF003', subjects: ['Circuits', 'Networks'] },
      { name: 'Dr. Priya Nair',   email: 'mehod@college.edu',        password: 'password123', role: 'Staff',   department: 'Mechanical Engg.', referenceId: 'STF004', subjects: ['Thermodynamics'] },
      { name: 'Dr. Meena Pillai', email: 'meena@college.edu',        password: 'password123', role: 'Staff',   department: 'Electronics & Comm.', referenceId: 'STF002', subjects: ['Microprocessors'] },
      
      // Students
      { name: 'John Doe',         email: 'john@college.edu',         password: 'password123', role: 'Student', department: 'Computer Science', referenceId: 'CS2022001', studentId: 'CS2022001' },
      { name: 'Emily Davis',      email: 'emily@college.edu',        password: 'password123', role: 'Student', department: 'Computer Science', referenceId: 'CS2021004', studentId: 'CS2021004' },
      { name: 'David Lee',        email: 'david@college.edu',        password: 'password123', role: 'Student', department: 'Computer Science', referenceId: 'CS2022002', studentId: 'CS2022002' },
      { name: 'Alice Smith',      email: 'alice@college.edu',        password: 'password123', role: 'Student', department: 'Electrical & Electronics', referenceId: 'EE2022001', studentId: 'EE2022001' },
      { name: 'Sarah Wilson',     email: 'sarah@college.edu',        password: 'password123', role: 'Student', department: 'Electrical & Electronics', referenceId: 'EE2022002', studentId: 'EE2022002' },
      { name: 'Vikram Seth',      email: 'vikram@college.edu',       password: 'password123', role: 'Student', department: 'Electronics & Comm.', referenceId: 'EC2022001', studentId: 'EC2022001' },
      { name: 'Neha Gupta',       email: 'neha@college.edu',         password: 'password123', role: 'Student', department: 'Electronics & Comm.', referenceId: 'EC2022002', studentId: 'EC2022002' },
      { name: 'Robert Johnson',   email: 'robert@college.edu',       password: 'password123', role: 'Student', department: 'Mechanical Engg.', referenceId: 'ME2023001', studentId: 'ME2023001' },
      { name: 'Karan Malhotra',   email: 'karan@college.edu',        password: 'password123', role: 'Student', department: 'Bachelor of Computer App.', referenceId: 'BC2022001', studentId: 'BC2022001' },
      { name: 'Ritu Sen',         email: 'ritu@college.edu',         password: 'password123', role: 'Student', department: 'Master of Business Admin.', referenceId: 'MB2022001', studentId: 'MB2022001' },

      // Parents
      { name: 'Parent of John',   email: 'parent_john@college.edu',  password: 'password123', role: 'Parent',  referenceId: 'CS2022001', parentOf: 'CS2022001' },
      { name: 'Parent of Alice',  email: 'parent_alice@college.edu', password: 'password123', role: 'Parent',  referenceId: 'EE2022001', parentOf: 'EE2022001' },
      
      // Accounts
      { name: 'Accounts Officer', email: 'accounts@college.edu',     password: 'password123', role: 'Accounts' },
    ]);

    // 2. Departments
    await Department.insertMany([
      { id: 'DEPT001', name: 'Computer Science',          code: 'CSE',  hod: 'CSE HOD',          totalStudents: 3 },
      { id: 'DEPT002', name: 'Electronics & Comm.',       code: 'ECE',  hod: 'ECE HOD',          totalStudents: 2 },
      { id: 'DEPT003', name: 'Electrical & Electronics',  code: 'EEE',  hod: 'EEE HOD',          totalStudents: 2 },
      { id: 'DEPT004', name: 'Mechanical Engg.',          code: 'MECH', hod: 'MECH HOD',         totalStudents: 1 },
      { id: 'DEPT005', name: 'Bachelor of Computer App.', code: 'BCA',  hod: 'BCA HOD',          totalStudents: 1 },
      { id: 'DEPT006', name: 'Master of Business Admin.', code: 'MBA',  hod: 'MBA HOD',          totalStudents: 1 },
    ]);

    // 3. Students
    await Student.insertMany([
      { id: 'CS2022001', name: 'John Doe',       email: 'john@college.edu',    phone: '9876543210', dept: 'Computer Science',          sem: 'Sem 6', cgpa: 8.6, attendance: 85, status: 'Active',   feeStatus: 'Paid'    },
      { id: 'CS2021004', name: 'Emily Davis',    email: 'emily@college.edu',   phone: '9823456789', dept: 'Computer Science',          sem: 'Sem 6', cgpa: 8.9, attendance: 98, status: 'Active',   feeStatus: 'Paid'    },
      { id: 'CS2022002', name: 'David Lee',      email: 'david@college.edu',   phone: '9890123456', dept: 'Computer Science',          sem: 'Sem 3', cgpa: 8.2, attendance: 88, status: 'Active',   feeStatus: 'Partial' },
      { id: 'EE2022001', name: 'Alice Smith',    email: 'alice@college.edu',   phone: '9845123456', dept: 'Electrical & Electronics',  sem: 'Sem 4', cgpa: 9.1, attendance: 95, status: 'Active',   feeStatus: 'Paid'    },
      { id: 'EE2022002', name: 'Sarah Wilson',   email: 'sarah@college.edu',   phone: '9801234567', dept: 'Electrical & Electronics',  sem: 'Sem 4', cgpa: 9.5, attendance: 91, status: 'Active',   feeStatus: 'Paid'    },
      { id: 'EC2022001', name: 'Vikram Seth',    email: 'vikram@college.edu',  phone: '9811122233', dept: 'Electronics & Comm.',       sem: 'Sem 6', cgpa: 8.8, attendance: 90, status: 'Active',   feeStatus: 'Paid'    },
      { id: 'EC2022002', name: 'Neha Gupta',     email: 'neha@college.edu',    phone: '9822233344', dept: 'Electronics & Comm.',       sem: 'Sem 6', cgpa: 8.5, attendance: 75, status: 'Active',   feeStatus: 'Pending' },
      { id: 'ME2023001', name: 'Robert Johnson', email: 'robert@college.edu',  phone: '9812987654', dept: 'Mechanical Engg.',          sem: 'Sem 2', cgpa: 7.8, attendance: 68, status: 'Active',   feeStatus: 'Partial' },
      { id: 'BC2022001', name: 'Karan Malhotra', email: 'karan@college.edu',   phone: '9856789012', dept: 'Bachelor of Computer App.', sem: 'Sem 5', cgpa: 8.7, attendance: 94, status: 'Active',   feeStatus: 'Paid'    },
      { id: 'MB2022001', name: 'Ritu Sen',       email: 'ritu@college.edu',    phone: '9867123456', dept: 'Master of Business Admin.', sem: 'Sem 4', cgpa: 9.2, attendance: 96, status: 'Active',   feeStatus: 'Paid'    },
    ]);

    // 4. Staff
    await Staff.insertMany([
      { id: 'STF001', name: 'CSE HOD',          email: 'csehod@gmail.com',    phone: '9900000001', dept: 'Computer Science',          designation: 'HOD',             subjects: ['Algorithms', 'Compiler Design'], workload: 12, attendance: 98 },
      { id: 'STF002', name: 'ECE HOD',          email: 'ecehod@gmail.com',    phone: '9900000002', dept: 'Electronics & Comm.',       designation: 'HOD',             subjects: ['Signals & Systems'],            workload: 10, attendance: 96 },
      { id: 'STF003', name: 'EEE HOD',          email: 'eeehod@gmail.com',    phone: '9900000003', dept: 'Electrical & Electronics',  designation: 'HOD',             subjects: ['Circuits', 'Networks'],         workload: 14, attendance: 95 },
      { id: 'STF004', name: 'MECH HOD',         email: 'mechhod@gmail.com',   phone: '9900000004', dept: 'Mechanical Engg.',          designation: 'HOD',             subjects: ['Thermodynamics'],               workload: 12, attendance: 93 },
      { id: 'STF005', name: 'BCA HOD',          email: 'bcahod@gmail.com',    phone: '9900000005', dept: 'Bachelor of Computer App.', designation: 'HOD',             subjects: ['Java Programming'],             workload: 12, attendance: 97 },
      { id: 'STF006', name: 'MBA HOD',          email: 'mbahod@gmail.com',    phone: '9900000006', dept: 'Master of Business Admin.', designation: 'HOD',             subjects: ['Strategic Management'],         workload: 10, attendance: 94 },
      
      { id: 'STF007', name: 'Prof. Karthik S.', email: 'karthik@college.edu', phone: '9823456789', dept: 'Computer Science',          designation: 'Assistant Prof.', subjects: ['OS', 'Machine Learning'],       workload: 20, attendance: 89 },
      { id: 'STF008', name: 'Dr. Ananya Rao',   email: 'ananya@college.edu',  phone: '9876543210', dept: 'Computer Science',          designation: 'Professor',       subjects: ['Data Structures', 'DBMS'],      workload: 18, attendance: 97 },
      { id: 'STF009', name: 'Dr. Meena Pillai', email: 'meena@college.edu',   phone: '9812987654', dept: 'Electronics & Comm.',       designation: 'Associate Prof.', subjects: ['Microprocessors'],              workload: 16, attendance: 92 },
    ]);

    // 5. Attendance
    await Attendance.insertMany([
      { studentId: 'CS2022001', studentName: 'John Doe', registerNo: 'CS2022001', department: 'Computer Science', semester: 'Sem 6', date: new Date('2026-05-20'), status: 'Present', subject: 'Data Structures', markedBy: 'Dr. Ananya Rao' },
      { studentId: 'CS2022001', studentName: 'John Doe', registerNo: 'CS2022001', department: 'Computer Science', semester: 'Sem 6', date: new Date('2026-05-21'), status: 'Present', subject: 'DBMS', markedBy: 'Dr. Ananya Rao' },
      { studentId: 'CS2022001', studentName: 'John Doe', registerNo: 'CS2022001', department: 'Computer Science', semester: 'Sem 6', date: new Date('2026-05-22'), status: 'Present', subject: 'OS', markedBy: 'Prof. Karthik S.' },
      
      { studentId: 'CS2021004', studentName: 'Emily Davis', registerNo: 'CS2021004', department: 'Computer Science', semester: 'Sem 6', date: new Date('2026-05-20'), status: 'Present', subject: 'Data Structures', markedBy: 'Dr. Ananya Rao' },
      { studentId: 'CS2021004', studentName: 'Emily Davis', registerNo: 'CS2021004', department: 'Computer Science', semester: 'Sem 6', date: new Date('2026-05-21'), status: 'Present', subject: 'DBMS', markedBy: 'Dr. Ananya Rao' },
      { studentId: 'CS2021004', studentName: 'Emily Davis', registerNo: 'CS2021004', department: 'Computer Science', semester: 'Sem 6', date: new Date('2026-05-22'), status: 'Present', subject: 'OS', markedBy: 'Prof. Karthik S.' },

      { studentId: 'CS2022002', studentName: 'David Lee', registerNo: 'CS2022002', department: 'Computer Science', semester: 'Sem 3', date: new Date('2026-05-20'), status: 'Present', subject: 'Data Structures', markedBy: 'Dr. Ananya Rao' },
      { studentId: 'CS2022002', studentName: 'David Lee', registerNo: 'CS2022002', department: 'Computer Science', semester: 'Sem 3', date: new Date('2026-05-21'), status: 'Absent', subject: 'DBMS', markedBy: 'Dr. Ananya Rao' },
      { studentId: 'CS2022002', studentName: 'David Lee', registerNo: 'CS2022002', department: 'Computer Science', semester: 'Sem 3', date: new Date('2026-05-22'), status: 'Present', subject: 'OS', markedBy: 'Prof. Karthik S.' },
    ]);

    // 6. Marks
    await Mark.insertMany([
      { studentId: 'CS2022001', studentName: 'John Doe', registerNo: 'CS2022001', department: 'Computer Science', semester: 'Sem 6', subject: 'Data Structures', internalMarks: 42, semesterMarks: 85, totalMarks: 127, grade: 'O', gpa: 9.0, cgpa: 8.6, arrearStatus: 'Clear' },
      { studentId: 'CS2022001', studentName: 'John Doe', registerNo: 'CS2022001', department: 'Computer Science', semester: 'Sem 6', subject: 'Database Management Systems', internalMarks: 40, semesterMarks: 87, totalMarks: 127, grade: 'A+', gpa: 8.9, cgpa: 8.6, arrearStatus: 'Clear' },
      { studentId: 'CS2022001', studentName: 'John Doe', registerNo: 'CS2022001', department: 'Computer Science', semester: 'Sem 6', subject: 'Operating Systems', internalMarks: 44, semesterMarks: 78, totalMarks: 122, grade: 'A+', gpa: 8.2, cgpa: 8.6, arrearStatus: 'Clear' },
      
      { studentId: 'CS2021004', studentName: 'Emily Davis', registerNo: 'CS2021004', department: 'Computer Science', semester: 'Sem 6', subject: 'Database Management Systems', internalMarks: 45, semesterMarks: 90, totalMarks: 135, grade: 'O', gpa: 9.5, cgpa: 8.9, arrearStatus: 'Clear' },
      { studentId: 'CS2021004', studentName: 'Emily Davis', registerNo: 'CS2021004', department: 'Computer Science', semester: 'Sem 6', subject: 'Operating Systems', internalMarks: 46, semesterMarks: 92, totalMarks: 138, grade: 'O', gpa: 9.6, cgpa: 8.9, arrearStatus: 'Clear' },

      { studentId: 'CS2022002', studentName: 'David Lee', registerNo: 'CS2022002', department: 'Computer Science', semester: 'Sem 3', subject: 'Data Structures', internalMarks: 38, semesterMarks: 72, totalMarks: 110, grade: 'A', gpa: 8.0, cgpa: 8.2, arrearStatus: 'Clear' },
      
      { studentId: 'EE2022001', studentName: 'Alice Smith', registerNo: 'EE2022001', department: 'Electrical & Electronics', semester: 'Sem 4', subject: 'Circuits', internalMarks: 45, semesterMarks: 88, totalMarks: 133, grade: 'A+', gpa: 9.1, cgpa: 9.1, arrearStatus: 'Clear' },
      { studentId: 'EE2022002', studentName: 'Sarah Wilson', registerNo: 'EE2022002', department: 'Electrical & Electronics', semester: 'Sem 4', subject: 'Networks', internalMarks: 47, semesterMarks: 91, totalMarks: 138, grade: 'O', gpa: 9.5, cgpa: 9.5, arrearStatus: 'Clear' },
      
      { studentId: 'EC2022001', studentName: 'Vikram Seth', registerNo: 'EC2022001', department: 'Electronics & Comm.', semester: 'Sem 6', subject: 'Microprocessors', internalMarks: 43, semesterMarks: 82, totalMarks: 125, grade: 'A+', gpa: 8.8, cgpa: 8.8, arrearStatus: 'Clear' },
      { studentId: 'EC2022002', studentName: 'Neha Gupta', registerNo: 'EC2022002', department: 'Electronics & Comm.', semester: 'Sem 6', subject: 'Signals & Systems', internalMarks: 42, semesterMarks: 80, totalMarks: 122, grade: 'A+', gpa: 8.5, cgpa: 8.5, arrearStatus: 'Clear' },
      
      { studentId: 'ME2023001', studentName: 'Robert Johnson', registerNo: 'ME2023001', department: 'Mechanical Engg.', semester: 'Sem 2', subject: 'Thermodynamics', internalMarks: 36, semesterMarks: 65, totalMarks: 101, grade: 'B+', gpa: 7.8, cgpa: 7.8, arrearStatus: 'Clear' },
      { studentId: 'BC2022001', studentName: 'Karan Malhotra', registerNo: 'BC2022001', department: 'Bachelor of Computer App.', semester: 'Sem 5', subject: 'Web Programming', internalMarks: 41, semesterMarks: 83, totalMarks: 124, grade: 'A+', gpa: 8.7, cgpa: 8.7, arrearStatus: 'Clear' },
      { studentId: 'MB2022001', studentName: 'Ritu Sen', registerNo: 'MB2022001', department: 'Master of Business Admin.', semester: 'Sem 4', subject: 'Financial Accounting', internalMarks: 44, semesterMarks: 89, totalMarks: 133, grade: 'O', gpa: 9.2, cgpa: 9.2, arrearStatus: 'Clear' }
    ]);

    // 7. Fees
    await Fee.insertMany([
      { studentId: 'CS2022001', studentName: 'John Doe', registerNo: 'CS2022001', department: 'Computer Science', semester: 'Sem 6', totalFees: 850000, paidAmount: 850000, pendingAmount: 0, paymentDate: new Date('2026-05-15'), paymentMode: 'Online', status: 'Paid', receiptNo: 'REC-001' },
      { studentId: 'CS2022001', studentName: 'John Doe', registerNo: 'CS2022001', department: 'Computer Science', semester: 'Sem 6', totalFees: 120000, paidAmount: 120000, pendingAmount: 0, paymentDate: new Date('2026-05-15'), paymentMode: 'Online', status: 'Paid', receiptNo: 'REC-002' },
      { studentId: 'CS2022001', studentName: 'John Doe', registerNo: 'CS2022001', department: 'Computer Science', semester: 'Sem 6', totalFees: 340000, paidAmount: 340000, pendingAmount: 0, paymentDate: new Date('2026-05-16'), paymentMode: 'Net Banking', status: 'Paid', receiptNo: 'REC-003' },
      { studentId: 'CS2022001', studentName: 'John Doe', registerNo: 'CS2022001', department: 'Computer Science', semester: 'Sem 6', totalFees: 180000, paidAmount: 180000, pendingAmount: 0, paymentDate: new Date('2026-05-16'), paymentMode: 'UPI', status: 'Paid', receiptNo: 'REC-004' },
      
      { studentId: 'CS2021004', studentName: 'Emily Davis', registerNo: 'CS2021004', department: 'Computer Science', semester: 'Sem 6', totalFees: 850000, paidAmount: 850000, pendingAmount: 0, paymentDate: new Date('2026-05-10'), paymentMode: 'Online', status: 'Paid', receiptNo: 'REC-005' },
      { studentId: 'CS2022002', studentName: 'David Lee', registerNo: 'CS2022002', department: 'Computer Science', semester: 'Sem 3', totalFees: 150000, paidAmount: 50000, pendingAmount: 100000, paymentDate: new Date('2026-05-18'), paymentMode: 'Cash', status: 'Partial', receiptNo: 'REC-006' },
      
      { studentId: 'EE2022001', studentName: 'Alice Smith', registerNo: 'EE2022001', department: 'Electrical & Electronics', semester: 'Sem 4', totalFees: 150000, paidAmount: 150000, pendingAmount: 0, paymentDate: new Date('2026-05-12'), paymentMode: 'Online', status: 'Paid', receiptNo: 'REC-007' },
      { studentId: 'EE2022002', studentName: 'Sarah Wilson', registerNo: 'EE2022002', department: 'Electrical & Electronics', semester: 'Sem 4', totalFees: 150000, paidAmount: 150000, pendingAmount: 0, paymentDate: new Date('2026-05-12'), paymentMode: 'Online', status: 'Paid', receiptNo: 'REC-008' },
      
      { studentId: 'EC2022001', studentName: 'Vikram Seth', registerNo: 'EC2022001', department: 'Electronics & Comm.', semester: 'Sem 6', totalFees: 120000, paidAmount: 120000, pendingAmount: 0, paymentDate: new Date('2026-05-11'), paymentMode: 'Online', status: 'Paid', receiptNo: 'REC-009' },
      { studentId: 'EC2022002', studentName: 'Neha Gupta', registerNo: 'EC2022002', department: 'Electronics & Comm.', semester: 'Sem 6', totalFees: 120000, paidAmount: 0, pendingAmount: 120000, status: 'Pending' },
      
      { studentId: 'ME2023001', studentName: 'Robert Johnson', registerNo: 'ME2023001', department: 'Mechanical Engg.', semester: 'Sem 2', totalFees: 160000, paidAmount: 80000, pendingAmount: 80000, paymentDate: new Date('2026-05-14'), paymentMode: 'Online', status: 'Partial', receiptNo: 'REC-010' },
      { studentId: 'BC2022001', studentName: 'Karan Malhotra', registerNo: 'BC2022001', department: 'Bachelor of Computer App.', semester: 'Sem 5', totalFees: 140000, paidAmount: 140000, pendingAmount: 0, paymentDate: new Date('2026-05-13'), paymentMode: 'Online', status: 'Paid', receiptNo: 'REC-011' },
      { studentId: 'MB2022001', studentName: 'Ritu Sen', registerNo: 'MB2022001', department: 'Master of Business Admin.', semester: 'Sem 4', totalFees: 250000, paidAmount: 250000, pendingAmount: 0, paymentDate: new Date('2026-05-09'), paymentMode: 'Online', status: 'Paid', receiptNo: 'REC-012' }
    ]);

    console.log('✅ Auto-seed successfully pre-populated! 22 users | 6 departments | 10 students | 9 staff | 9 attendance entries | 13 mark transcripts | 12 fee invoices');
    console.log('   🔑 CSE HOD login: csehod@gmail.com / password123');
    console.log('   🔑 Student login: john@college.edu / password123');
  } catch (err) {
    console.error('❌ Auto-seed failed:', err.message);
  }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/marks', marksRoutes);
app.use('/api/fees', feesRoutes);
app.use('/api/reports', reportsRoutes);

app.get('/', (req, res) => {
  res.send('College ERP API is running...');
});

// ── Database Connection + Server Start ────────────────────────────────────────
const startServer = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/college_erp';
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
    console.log('✅ Connected to Local MongoDB');
  } catch (err) {
    console.log('⚠️ Local MongoDB not found. Falling back to In-Memory Database...');
    const mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    console.log('✅ Connected to In-Memory MongoDB (Zero-Config Mode)');
  }

  await autoSeedIfEmpty();

  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🌐 API ready at http://localhost:${PORT}`);
  });
};

startServer();
