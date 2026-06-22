const fs = require('fs');
const path = require('path');

const cssFiles = [
  'src/student/components/StudentSidebar.css',
  'src/staff/components/StaffSidebar.css',
  'src/parent/components/ParentSidebar.css',
  'src/hod/components/HodSidebar.css',
  'src/components/layout/Sidebar.css',
  'src/driver/components/DriverSidebar.css',
  'src/accounts/components/AccountsSidebar.css'
];

cssFiles.forEach(relPath => {
  const fullPath = path.join(__dirname, relPath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Completely rewrite the active class block for each sidebar
    // We target `.nav-link.active` and `.[prefix]-nav-link.active`
    const prefix = relPath.includes('Sidebar.css') && !relPath.includes('components/') ? '' : relPath.split('/').pop().replace('Sidebar.css', '').toLowerCase();
    const selectorClass = prefix ? `.${prefix}-nav-link.active` : '.nav-link.active';
    
    // We can just use a regex to replace everything inside the active block
    // Find the block: `.staff-nav-link.active { ... }`
    const activeRegex = new RegExp(selectorClass.replace('.', '\\.') + '\\s*\\{[^}]+\\}', 'g');
    
    content = content.replace(activeRegex, `${selectorClass} {\n  background: #F4F7FE !important;\n  color: #3258C5 !important;\n  border-radius: 24px 0 0 24px !important;\n  margin-left: 1rem !important;\n  border-left: none !important;\n  box-shadow: -4px 0 10px rgba(0,0,0,0.05) !important;\n}`);
    
    // Also do the dark mode one
    const darkActiveRegex = new RegExp('\\.dark\\s+' + selectorClass.replace('.', '\\.') + '\\s*\\{[^}]+\\}', 'g');
    content = content.replace(darkActiveRegex, `.dark ${selectorClass} {\n  background: #1E293B !important;\n  color: #6366F1 !important;\n  border-radius: 24px 0 0 24px !important;\n  margin-left: 1rem !important;\n  border-left: none !important;\n  box-shadow: none !important;\n}`);

    // Fix the logout button text color to be white/light instead of red on dark blue
    content = content.replace(/\.logout-btn:hover \.text-danger \{\s*color: #EF4444;\s*\}/g, '.logout-btn:hover .text-danger {\n  color: #FCA5A5;\n}');
    content = content.replace(/\.logout-btn \.text-danger \{\s*color: #9CA3AF;\s*\}/g, '.logout-btn .text-danger {\n  color: #E2E8F0;\n}');
    
    // Make Logout main text lighter
    content = content.replace(/\.logout-btn \{\s*background: transparent;\s*border: 1px solid rgba\(255, 255, 255, 0\.05\);\s*color: #9CA3AF;/g, '.logout-btn {\n  background: transparent;\n  border: 1px solid rgba(255, 255, 255, 0.05);\n  color: #E2E8F0;');
    
    // Make sure SVG icons inside the active link are properly colored blue!
    const svgRegex = new RegExp(selectorClass.replace('.', '\\.') + '\\s*svg\\s*\\{[^}]+\\}', 'g');
    content = content.replace(svgRegex, `${selectorClass} svg {\n  color: #3258C5 !important;\n}`);

    fs.writeFileSync(fullPath, content);
    console.log('Fixed Active Link Colors in:', relPath);
  }
});
