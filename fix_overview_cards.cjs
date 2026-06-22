const fs = require('fs');

const cardMarkup = `          <div key={i} className="stat-card" style={{ padding: '1.25rem', background: '#FFFFFF', border: '1px solid #E3E5EC', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.75rem', boxShadow: 'none' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: s.bgTint, color: s.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {s.icon}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>{s.label}</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: '1.1' }}>{s.value}</span>
              <span style={{ fontSize: '0.75rem', color: s.subColor || 'var(--text-muted)', fontWeight: s.subColor ? 600 : 400 }}>{s.sub}</span>
            </div>
          </div>`;

// 1. PrincipalHodManagement
let hodFile = 'src/principal/pages/PrincipalHodManagement.jsx';
let hod = fs.readFileSync(hodFile, 'utf8');
hod = hod.replace(
  /\{\s*label:\s*'Total HODs'.*?color:\s*'[^']+'.*?\}/,
  `{ label: 'Total HODs', value: hodList.length, icon: <Users size={18} />, bgTint: '#EEEDFE', iconColor: '#3C3489', sub: 'Active departments' }`
);
hod = hod.replace(
  /\{\s*label:\s*'Active HODs'.*?color:\s*'[^']+'.*?\}/,
  `{ label: 'Active HODs', value: hodList.filter(h => h.status === 'Active').length, icon: <CheckCircle size={18} />, bgTint: '#E1F5EE', iconColor: '#047857', sub: 'Currently present', subColor: '#047857' }`
);
hod = hod.replace(
  /\{\s*label:\s*'Avg Attendance'.*?color:\s*'[^']+'.*?\}/,
  `{ label: 'Avg Attendance', value: hodList.length ? \`\${(hodList.reduce((a,b) => a + b.attendance, 0) / hodList.length).toFixed(1)}%\` : '0%', icon: <TrendingUp size={18} />, bgTint: '#E1F5EE', iconColor: '#047857', sub: 'This semester', subColor: '#047857' }`
);
hod = hod.replace(
  /\{\s*label:\s*'Avg Pass Rate'.*?color:\s*'[^']+'.*?\}/,
  `{ label: 'Avg Pass Rate', value: hodList.length ? \`\${(hodList.reduce((a,b) => a + b.passRate, 0) / hodList.length).toFixed(1)}%\` : '0%', icon: <Star size={18} />, bgTint: '#EEEDFE', iconColor: '#3C3489', sub: 'All departments' }`
);
hod = hod.replace(
  /\{\s*label:\s*'Pending Reviews'.*?color:\s*'[^']+'.*?\}/,
  `{ label: 'Pending Reviews', value: 0, icon: <AlertCircle size={18} />, bgTint: '#FAEEDA', iconColor: '#B45309', sub: 'Action needed', subColor: '#B45309' }`
);
hod = hod.replace(/<div key=\{i\} className="stat-card" style=\{\{ borderBottom: `3px solid \$\{s\.color\}` \}\}>[\s\S]*?<\/div>\s*<\/div>/g, cardMarkup);
fs.writeFileSync(hodFile, hod);


// 2. PrincipalStaffOverview
let staffFile = 'src/principal/pages/PrincipalStaffOverview.jsx';
let staff = fs.readFileSync(staffFile, 'utf8');
staff = staff.replace(
  /\{\s*label:\s*'Total Faculty'.*?color:\s*'[^']+'.*?\}/,
  `{ label: 'Total Faculty', value: staffList.length, icon: <Users size={18} />, bgTint: '#EEEDFE', iconColor: '#3C3489', sub: 'All departments' }`
);
staff = staff.replace(
  /\{\s*label:\s*'On Leave'.*?color:\s*'[^']+'.*?\}/,
  `{ label: 'On Leave', value: 0, icon: <UserMinus size={18} />, bgTint: '#EEEDFE', iconColor: '#3C3489', sub: 'No absences' }`
);
staff = staff.replace(
  /\{\s*label:\s*'Avg Attendance'.*?color:\s*'[^']+'.*?\}/,
  `{ label: 'Avg Attendance', value: staffList.length ? \`\${(staffList.reduce((acc, curr) => acc + curr.attendance, 0) / staffList.length).toFixed(1)}%\` : '0%', icon: <Calendar size={18} />, bgTint: '#E1F5EE', iconColor: '#047857', sub: 'Above target', subColor: '#047857' }`
);
staff = staff.replace(
  /\{\s*label:\s*'Avg Rating'.*?color:\s*'[^']+'.*?\}/,
  `{ label: 'Avg Rating', value: staffList.length ? (staffList.reduce((acc, curr) => acc + curr.rating, 0) / staffList.length).toFixed(1) : '0', icon: <Star size={18} />, bgTint: '#EEEDFE', iconColor: '#3C3489', sub: 'Out of 5.0' }`
);
staff = staff.replace(
  /\{\s*label:\s*'Departments'.*?color:\s*'[^']+'.*?\}/,
  `{ label: 'Departments', value: Object.keys(deptCounts).length, icon: <BookOpen size={18} />, bgTint: '#EEEDFE', iconColor: '#3C3489', sub: 'Active divisions' }`
);
staff = staff.replace(/<div key=\{i\} className="stat-card" style=\{\{ borderBottom: `3px solid \$\{s\.color\}` \}\}>[\s\S]*?<\/div>\s*<\/div>/g, cardMarkup);
fs.writeFileSync(staffFile, staff);


// 3. PrincipalStudentsOverview
let stuFile = 'src/principal/pages/PrincipalStudentsOverview.jsx';
let stu = fs.readFileSync(stuFile, 'utf8');
stu = stu.replace(
  /\{\s*label:\s*'Total Students'.*?color:\s*'[^']+'.*?\}/,
  `{ label: 'Total Students', value: studentList.length, icon: <Users size={18} />, bgTint: '#EEEDFE', iconColor: '#3C3489', sub: '6 departments' }`
);
stu = stu.replace(
  /\{\s*label:\s*'Avg CGPA'.*?color:\s*'[^']+'.*?\}/,
  `{ label: 'Avg CGPA', value: avgCGPA, icon: <Star size={18} />, bgTint: '#EEEDFE', iconColor: '#3C3489', sub: 'All students' }`
);
stu = stu.replace(
  /\{\s*label:\s*'Avg Attendance'.*?color:\s*'[^']+'.*?\}/,
  `{ label: 'Avg Attendance', value: \`\${avgAtt}%\`, icon: <TrendingUp size={18} />, bgTint: '#FAEEDA', iconColor: '#B45309', sub: 'Below 75% target', subColor: '#B45309' }`
);
stu = stu.replace(
  /\{\s*label:\s*'Top Performers'.*?color:\s*'[^']+'.*?\}/,
  `{ label: 'Top Performers', value: topCount, icon: <Star size={18} />, bgTint: '#EEEDFE', iconColor: '#3C3489', sub: 'CGPA ≥ 9.0' }`
);
stu = stu.replace(
  /\{\s*label:\s*'Low Attendance'.*?color:\s*'[^']+'.*?\}/,
  `{ label: 'Low Attendance', value: lowAttCount, icon: <AlertCircle size={18} />, bgTint: '#FCEBEB', iconColor: '#DC2626', sub: 'Below 80%', subColor: '#DC2626' }`
);
stu = stu.replace(
  /\{\s*label:\s*'Active Students'.*?color:\s*'[^']+'.*?\}/,
  `{ label: 'Active Students', value: studentList.length, icon: <GraduationCap size={18} />, bgTint: '#E1F5EE', iconColor: '#047857', sub: 'All enrolled', subColor: '#047857' }`
);
stu = stu.replace(/<div key=\{i\} className="stat-card" style=\{\{ borderBottom: `3px solid \$\{s\.color\}` \}\}>[\s\S]*?<\/div>\s*<\/div>/g, cardMarkup);
fs.writeFileSync(stuFile, stu);

console.log('Fixed cards on all 3 pages');
