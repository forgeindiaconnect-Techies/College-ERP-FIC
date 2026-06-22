const fs = require('fs');

// 1. Fix Headers in the 4 files
const filesToFix = [
  'src/principal/pages/PrincipalAttendanceAnalytics.jsx',
  'src/principal/pages/PrincipalExamsResults.jsx',
  'src/principal/pages/PrincipalFeesOverview.jsx',
  'src/principal/pages/PrincipalPlacements.jsx'
];

filesToFix.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    // We replace the broken styles with color: '#3730A5' (Deep Indigo) to match the standard
    content = content.replace(/style=\{\{\s*bgTint:[^}]+\}\}/g, `style={{ color: '#3730A5' }}`);
    fs.writeFileSync(file, content);
    console.log('Fixed headers in', file);
  }
});

// 2. Fix Sidebar CSS
const sidebarCss = 'src/components/layout/Sidebar.css';
if (fs.existsSync(sidebarCss)) {
  let content = fs.readFileSync(sidebarCss, 'utf8');
  
  // Reduce nav-link font size
  content = content.replace(/font-size:\s*1\.05rem;/, 'font-size: 0.9rem;');
  
  // Remove the aggressive important overrides at the bottom that break active states
  content = content.replace(/\.nav-link\s*\{\s*color:\s*#9CA3AF\s*!important;\s*\/\*\s*hardcoded\s*navlink\s*\*\/\s*\}/g, '');
  content = content.replace(/\.nav-link:hover\s*\{\s*color:\s*#FFFFFF\s*!important;\s*background-color:\s*rgba\(255,\s*255,\s*255,\s*0\.05\)\s*!important;\s*\}/g, '');
  
  fs.writeFileSync(sidebarCss, content);
  console.log('Fixed Sidebar.css');
}
