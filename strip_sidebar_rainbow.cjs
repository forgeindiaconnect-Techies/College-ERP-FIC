const fs = require('fs');

const removeSidebarColors = () => {
  const files = [
    'src/superadmin/components/AdminSidebar.jsx',
    'src/subadmin/components/SubAdminSidebar.jsx',
    'src/student/components/StudentSidebar.jsx',
    'src/staff/components/StaffSidebar.jsx',
    'src/principal/components/PrincipalSidebar.jsx',
    'src/parent/components/ParentSidebar.jsx',
    'src/hod/components/HodSidebar.jsx',
    'src/driver/components/DriverSidebar.jsx',
    'src/accounts/components/AccountsSidebar.jsx'
  ];

  const colors = [
    'blue', 'green', 'amber', 'purple', 'indigo', 'violet', 
    'royalblue', 'orange', 'emerald', 'red', 'teal', 'cyan', 'skyblue', 'pink'
  ];

  files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let code = fs.readFileSync(file, 'utf8');
    let changed = false;

    colors.forEach(color => {
      // Remove bg-icon-* classes
      const bgIconRegex = new RegExp(`bg-icon-${color}`, 'g');
      if (code.match(bgIconRegex)) {
        code = code.replace(bgIconRegex, '');
        changed = true;
      }
      
      // Remove stat-icon-wrapper if it's strictly used to colorize the sidebar icon
      // Wait, stat-icon-wrapper has background colors inside it usually.
      // But let's just remove bg-icon-* for now, which strips the rainbow colors.
      const bgGradientRegex = new RegExp(`bg-gradient-${color}`, 'g');
      if (code.match(bgGradientRegex)) {
        code = code.replace(bgGradientRegex, '');
        changed = true;
      }
    });

    if (changed) {
      // Clean up empty classNames
      code = code.replace(/className="\s+"/g, 'className=""');
      fs.writeFileSync(file, code, 'utf8');
      console.log('Stripped rainbow colors from:', file);
    }
  });
};

removeSidebarColors();
