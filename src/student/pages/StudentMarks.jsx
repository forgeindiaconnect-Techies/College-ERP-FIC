import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, AlertTriangle, ArrowLeft, Percent, GraduationCap, Award } from 'lucide-react';
import { getStudentById, getMarksByStudent } from '../../api/index';
import './StudentMarks.css';

// Fallbacks
const DEFAULT_STUDENT = {
  id: 'CS2022001',
  name: 'John Doe',
  dept: 'Computer Science',
  sem: 'Sem 6',
  email: 'john@college.edu'
};

const calcGpa = (internal, external) => {
  const pct = ((internal + external) / 150) * 100;
  if (internal < 20 || external < 35) return 0;
  if (pct >= 90) return 10;
  if (pct >= 80) return 9;
  if (pct >= 70) return 8;
  if (pct >= 60) return 7;
  if (pct >= 55) return 6;
  if (pct >= 50) return 5;
  return 0;
};

const StudentMarks = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [studentSession, setStudentSession] = useState(DEFAULT_STUDENT);
  const [studentDetails, setStudentDetails] = useState(null);
  const [marksRecord, setMarksRecord] = useState(null);

  useEffect(() => {
    // 1. Session check
    const session = sessionStorage.getItem('student_session');
    let activeStud = DEFAULT_STUDENT;
    if (session) {
      activeStud = JSON.parse(session);
      setStudentSession(activeStud);
    } else {
      navigate('/student/login');
      return;
    }

    const loadMarksData = async () => {
      try {
        const [studRes, marksRes] = await Promise.all([
          getStudentById(activeStud.id || activeStud.referenceId || activeStud._id).catch(() => null),
          getMarksByStudent(activeStud.id || activeStud.referenceId || activeStud._id).catch(() => null)
        ]);

        if (studRes?.data) {
          setStudentDetails(studRes.data);
        } else {
          setStudentDetails({
            id: activeStud.id,
            name: activeStud.name,
            dept: activeStud.dept,
            sem: activeStud.sem,
            cgpa: 8.6,
            arrears: 0
          });
        }

        if (marksRes?.data && marksRes.data.length > 0) {
          const records = marksRes.data;
          const totalArrears = records.filter(r => r.arrearStatus === 'Arrear').length;
          const totalGPA = records.reduce((acc, r) => acc + (r.gpa || 0), 0);
          const currentGpa = records.length > 0 ? Number((totalGPA / records.length).toFixed(2)) : 0;

          setMarksRecord({
            id: activeStud.id,
            name: activeStud.name,
            dept: activeStud.dept,
            sem: activeStud.sem,
            internal: records[0]?.internalMarks || 0,
            external: records[0]?.semesterMarks || 0,
            arrears: totalArrears,
            gpa: currentGpa,
            courses: records.map((r, idx) => ({
              code: r._id ? `CS30${idx + 1}` : 'CS301',
              name: r.subject,
              internal: r.internalMarks,
              external: r.semesterMarks,
              gpa: r.gpa || 0,
              status: r.arrearStatus || 'Pass'
            }))
          });
        } else {
          // No marks available - do not use dummy fallbacks
          setMarksRecord({
            id: activeStud.id,
            name: activeStud.name,
            dept: activeStud.dept,
            sem: activeStud.sem,
            internal: 0,
            external: 0,
            arrears: 0,
            gpa: 0,
            courses: []
          });
        }
      } catch (err) {
        console.error('Failed to load live student marks:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMarksData();
  }, [navigate]);

  if (loading || !marksRecord || !studentDetails) {
    return (
      <div className="student-loading-container">
        <span className="student-spinner-large"></span>
      </div>
    );
  }

  // Derive grades and statuses
  const getGrade = (cgpa) => cgpa >= 9.0 ? 'O' : cgpa >= 8.0 ? 'A+' : cgpa >= 7.0 ? 'A' : 'B';
  const getCgpaColor = (c) => c >= 8.5 ? 'var(--success)' : c >= 7.0 ? 'var(--warning)' : 'var(--danger)';

  // Calculate dynamic GPA values
  const currentGpa = marksRecord.gpa;
  const coursesList = marksRecord.courses;

  return (
    <div className="student-marks-page animate-fade-in">
      <div className="page-header-student">
        <div className="header-left-s">
          <button className="btn-back-s" onClick={() => navigate('/student/dashboard')}>
            <ArrowLeft size={16} /> Back
          </button>
          <div>
            <h1>Semester Grade Card</h1>
            <p className="text-muted">Review internal assessments, end-semester grades, and CGPA trends.</p>
          </div>
        </div>
      </div>

      {/* Aggregate Header Grid */}
      <div className="marks-hero-summary-grid">
        <div className="glass-card summary-grade-card">
          <Award size={24} className="icon-s teal" />
          <div>
            <p className="summary-label">CUMULATIVE CGPA</p>
            <h2 style={{ color: getCgpaColor(studentDetails.cgpa) }}>{studentDetails.cgpa}</h2>
          </div>
        </div>

        <div className="glass-card summary-grade-card">
          <GraduationCap size={24} className="icon-s blue" />
          <div>
            <p className="summary-label">CURRENT GPA</p>
            <h2>{currentGpa}</h2>
          </div>
        </div>

        <div className="glass-card summary-grade-card">
          <AlertTriangle size={24} className="icon-s red" />
          <div>
            <p className="summary-label">ACTIVE ARREARS</p>
            <h2 className={marksRecord.arrears > 0 ? 'text-danger' : 'text-success'}>
              {marksRecord.arrears}
            </h2>
          </div>
        </div>
      </div>

      {/* Grade Table */}
      <div className="glass-card table-section-card-s">
        <div className="table-header-row-s">
          <h3>Registered Courses Score Sheet</h3>
          <span className="current-sem-badge">{studentSession.sem}</span>
        </div>

        <div className="table-container-s">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Course Name</th>
                <th>Internals (50)</th>
                <th>Externals (100)</th>
                <th>GPA</th>
                <th>Grade</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {coursesList.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center text-muted" style={{ padding: '3rem' }}>
                    No semester marks have been published yet.
                  </td>
                </tr>
              ) : (
                coursesList.map((course, idx) => (
                  <tr key={idx}>
                    <td><span className="register-no-badge">{course.code}</span></td>
                    <td><span className="font-semibold">{course.name}</span></td>
                    <td>{course.internal}</td>
                    <td>{course.external}</td>
                    <td className="font-semibold" style={{ color: getCgpaColor(course.gpa) }}>{course.gpa}</td>
                    <td>
                      <span
                        className="grade-badge-cell"
                        style={{
                          background: getCgpaColor(course.gpa) + '15',
                          color: getCgpaColor(course.gpa),
                          border: `1px solid ${getCgpaColor(course.gpa)}30`
                        }}
                      >
                        {getGrade(course.gpa)}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge-cell ${course.status.toLowerCase() === 'pass' ? 'present' : 'absent'}`}>
                        {course.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentMarks;

