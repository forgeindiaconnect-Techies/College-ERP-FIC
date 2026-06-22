const fs = require('fs');

const fixBannerBackgrounds = () => {
  const files = [
    'src/driver/pages/DriverDashboard.jsx',
    'src/accounts/pages/AccountsDashboard.jsx',
    'src/student/pages/StudentDashboard.jsx',
    'src/subadmin/pages/SubAdminDashboard.jsx',
    'src/principal/pages/PrincipalDashboard.jsx',
    'src/parent/pages/ParentDashboard.jsx',
    'src/hod/pages/HodDashboard.jsx',
    'src/staff/pages/StaffDashboard.jsx',
    'src/pages/dashboard/DashboardOverview.jsx'
  ];

  files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let code = fs.readFileSync(file, 'utf8');
    let changed = false;

    // Look for the background property of the banner (usually right before color: '#fff')
    code = code.replace(/background:\s*['"]linear-gradient\([^)]+\)['"]/g, (match, offset) => {
      // Only replace if it's near the top of the file / Welcome back header
      const snippet = code.substring(offset, offset + 500);
      if (snippet.includes('Welcome back') || snippet.includes('boxShadow:')) {
        changed = true;
        return "background: 'var(--primary-gradient)'";
      }
      return match;
    });

    if (changed) {
      fs.writeFileSync(file, code, 'utf8');
      console.log('Fixed background in:', file);
    }
  });
};

fixBannerBackgrounds();
