const fs = require('fs');

const fixSidebarLogos = () => {
  const files = [
    'src/components/layout/Sidebar.jsx',
    'src/subadmin/components/SubAdminSidebar.jsx',
    'src/student/components/StudentSidebar.jsx',
    'src/staff/components/StaffSidebar.jsx',
    'src/principal/components/PrincipalSidebar.jsx',
    'src/parent/components/ParentSidebar.jsx',
    'src/hod/components/HodSidebar.jsx',
    'src/driver/components/DriverSidebar.jsx',
    'src/accounts/components/AccountsSidebar.jsx'
  ];

  files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let code = fs.readFileSync(file, 'utf8');
    let changed = false;

    // We will replace the dual logo structure with a single logo.svg that is visible always.
    // The previous structure was:
    // <img src="/logo-dark.svg" alt="ERPSYS Logo" className="logo-light-only" style={{ height: '32px', objectFit: 'contain' }} />
    // <img src="/logo.svg" alt="ERPSYS Logo" className="logo-dark-only" style={{ height: '32px', objectFit: 'contain' }} />
    
    // Use regex to find and replace both lines
    const logoRegex = /<img\s+src="\/logo-dark\.svg"[^>]*>\s*<img\s+src="\/logo\.svg"[^>]*>/;
    if (code.match(logoRegex)) {
      code = code.replace(logoRegex, `<img src="/logo.svg" alt="ERPSYS Logo" style={{ height: '32px', objectFit: 'contain' }} />`);
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(file, code, 'utf8');
      console.log('Fixed logo in:', file);
    }
  });
};

fixSidebarLogos();
