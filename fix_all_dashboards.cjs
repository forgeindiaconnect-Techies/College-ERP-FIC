const fs = require('fs');

const fixAllDashboards = () => {
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

    // 1. Target the gradient in the welcome banner wrapper
    // Usually it's: background: 'linear-gradient(135deg, ...)'
    // Let's replace any inline linear-gradient that appears within the first 1500 chars (header area)
    
    // We only want to replace the first occurrence (which is the main banner)
    const firstGradientIndex = code.indexOf("linear-gradient(");
    if (firstGradientIndex !== -1 && firstGradientIndex < 2500) {
       // It's a welcome banner!
       code = code.replace(/linear-gradient\([^)]+\)/, 'var(--primary-gradient)');
       changed = true;
    }

    if (changed) {
      fs.writeFileSync(file, code, 'utf8');
      console.log('Fixed background in:', file);
    }
  });
};

fixAllDashboards();
