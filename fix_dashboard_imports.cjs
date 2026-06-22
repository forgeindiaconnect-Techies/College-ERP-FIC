const fs = require('fs');
const file = 'e:/Antigravity/New folder/src/pages/Dashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

const correctImports = `import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useRealtimeSync from '../hooks/useRealtimeSync';
import { 
  Users, 
  GraduationCap, 
  Wallet, 
  Building2,
  TrendingUp,
  UserPlus,
  FileText,
  Settings,
  Briefcase,
  BookOpen,
  Calendar,
  CalendarCheck,
  Megaphone,
  ShieldCheck,
  Clock,
  Activity,
  Heart,
  Inbox,
  Crown,
  ClipboardList,
  Rocket
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, Legend
} from 'recharts';
import { getStudents, getStaff, getDepartments, getAllFees, getAllAttendance, getExams, getActivityLogs, getAllTimetables, getPendingApprovals } from '../api/index';
import api from '../api';
import './Dashboard.css';`;

content = content.replace(/import React[\s\S]*?import '\.\/Dashboard\.css';/, correctImports);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed imports in Dashboard.jsx');
