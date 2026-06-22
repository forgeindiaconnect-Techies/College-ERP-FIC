const fs = require('fs');

const newRenderBlock = `            {menuGroups.map((group, idx) => {
              const themeColors = [
                { color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
                { color: '#7C3AED', bg: 'rgba(124,58,237,0.12)' },
                { color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
                { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
                { color: '#EC4899', bg: 'rgba(236,72,153,0.12)' },
                { color: '#6366F1', bg: 'rgba(99,102,241,0.12)' },
                { color: '#F97316', bg: 'rgba(249,115,22,0.12)' },
                { color: '#14B8A6', bg: 'rgba(20,184,166,0.12)' }
              ];
              const theme = { color: group.color || themeColors[idx % themeColors.length].color, bg: group.bg || themeColors[idx % themeColors.length].bg };
              return (
              <li key={idx} style={{ marginBottom: '0.25rem' }}>
                <div className="nav-group-header" onClick={() => toggleGroup(group.name)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '8px', background: theme.bg, color: theme.color, flexShrink: 0, transition: 'all 0.2s ease' }}>
                      {group.icon}
                    </span>
                    <span>{group.name}</span>
                  </div>
                  {expandedGroups[group.name] ? <ChevronDown size={15} style={{ color: theme.color }} /> : <ChevronRight size={15} style={{ color: '#94a3b8' }} />}
                </div>
                <ul className={\`nav-group-items \${expandedGroups[group.name] ? 'expanded' : 'collapsed'}\`}>
                  {group.items.map((item, i) => (
                    <li key={i}>
                      <NavLink to={item.path} end={item.exact} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} style={{ paddingLeft: '1rem' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '6px', background: theme.bg, color: theme.color, flexShrink: 0 }}>
                          {item.icon}
                        </span>
                        <span>{item.name}</span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </li>
            )
            })}`;

const sidebarFiles = [
  'src/student/components/StudentSidebar.jsx',
  'src/staff/components/StaffSidebar.jsx',
  'src/parent/components/ParentSidebar.jsx',
  'src/principal/components/PrincipalSidebar.jsx',
  'src/hod/components/HodSidebar.jsx',
  'src/driver/components/DriverSidebar.jsx',
  'src/accounts-officer/components/AccountsOfficerSidebar.jsx',
  'src/subadmin/components/SubAdminSidebar.jsx',
  'src/superadmin/components/SuperAdminSidebar.jsx',
  'src/components/layout/Sidebar.jsx' // Re-do the main one to use this cleaner pattern
];

for (const file of sidebarFiles) {
  if (!fs.existsSync(file)) {
    console.log('Skipping missing file:', file);
    continue;
  }
  
  let code = fs.readFileSync(file, 'utf8');
  
  // Update header X button
  code = code.replace(/<div className="sidebar-header"[\s\S]*?<img[\s\S]*?<img[\s\S]*?<button[\s\S]*?<\/button>\s*<\/div>/, 
`<div className="sidebar-header">
          <img src="/logo-dark.svg" alt="ERPSYS Logo" className="logo-light-only" style={{ height: '32px', objectFit: 'contain' }} />
          <img src="/logo.svg" alt="ERPSYS Logo" className="logo-dark-only" style={{ height: '32px', objectFit: 'contain' }} />
          <button className="sidebar-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>`);

  // Try to match the render map block (old format or the one we just made)
  const regex = /\{menuGroups\.map\(\(group, idx\)[\s\S]*?\)\n?\s*\)\)?\}/;
  if (regex.test(code)) {
    code = code.replace(regex, newRenderBlock);
    
    // Also clean up any duplicate closing tags that might have snuck in (for files previously processed)
    code = code.replace(/\)\)\}\r?\n\s*<\/ul>\r?\n\s*<\/li>\r?\n\s*\)\)\}/g, '))}');
    code = code.replace(/\)\r?\n\s*\}\)\}\r?\n\s*<\/ul>\r?\n\s*<\/li>\r?\n\s*\)\)\}/g, ')\n            })}');

    fs.writeFileSync(file, code, 'utf8');
    console.log('Updated', file);
  } else {
    console.log('Could not match render block in', file);
  }
}
