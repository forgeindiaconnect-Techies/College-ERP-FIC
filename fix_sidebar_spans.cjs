const fs = require('fs');

const fixSidebarSpans = () => {
  const files = [
    'src/components/layout/Sidebar.jsx',
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

  files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let code = fs.readFileSync(file, 'utf8');
    let changed = false;

    // This regex will match the exact span tag with inline styles that use theme.bg / theme.color
    const spanRegex1 = /<span\s+style={{[^}]*background:\s*theme\.bg[^}]*}}>\s*(\{group\.icon\})\s*<\/span>/g;
    if (code.match(spanRegex1)) {
      code = code.replace(spanRegex1, '$1');
      changed = true;
    }

    const spanRegex2 = /<span\s+style={{[^}]*background:\s*theme\.bg[^}]*}}>\s*(\{item\.icon\})\s*<\/span>/g;
    if (code.match(spanRegex2)) {
      code = code.replace(spanRegex2, '$1');
      changed = true;
    }

    // Sometimes it's hardcoded directly without theme.bg, e.g. background: group.bg
    const spanRegex3 = /<span\s+style={{[^}]*background:\s*group\.bg[^}]*}}>\s*(\{group\.icon\})\s*<\/span>/g;
    if (code.match(spanRegex3)) {
      code = code.replace(spanRegex3, '$1');
      changed = true;
    }

    const spanRegex4 = /<span\s+style={{[^}]*background:\s*item\.bg[^}]*}}>\s*(\{item\.icon\})\s*<\/span>/g;
    if (code.match(spanRegex4)) {
      code = code.replace(spanRegex4, '$1');
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(file, code, 'utf8');
      console.log('Fixed spans in:', file);
    }
  });
};

fixSidebarSpans();
