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
    
    // Fix the broken sidebar header if it was broken by PowerShell
    content = content.replace(/\\n\s*background:\s*var\(--sidebar-header-bg\);/g, ''); // Remove the broken injected string
    
    // Some files might be missing their selector now:
    // "16:   border-right: 1px solid var(--border-color);
    // 17: }
    // 18: 
    // 19:   padding: 0 1.2rem;"
    
    // Let's manually rebuild the missing header
    // The previous state was:
    // .xxx-sidebar-header {
    //   height: 70px;
    //   padding: 0 1.2rem;
    
    // If it's broken, it looks like:
    // }
    // 
    //   padding: 0 1.2rem;
    
    const brokenRegex = /\}\s+padding:\s*0 1\.2rem;/;
    if (brokenRegex.test(content)) {
      const prefix = relPath.includes('Sidebar.css') && !relPath.includes('components/') ? '' : relPath.split('/').pop().replace('Sidebar.css', '').toLowerCase();
      const selectorClass = prefix ? `.${prefix}-sidebar-header` : '.sidebar-header';
      content = content.replace(brokenRegex, `}\n\n${selectorClass} {\n  height: 70px;\n  background: var(--sidebar-header-bg);\n  padding: 0 1.2rem;`);
    } else {
      // If it wasn't broken, safely add the background
      const safeRegex = /(\.[a-zA-Z0-9_-]*sidebar-header\s*\{[\s\S]*?height:\s*70px;)/g;
      if (!content.includes('background: var(--sidebar-header-bg);')) {
         content = content.replace(safeRegex, '$1\n  background: var(--sidebar-header-bg);');
      }
    }
    
    // Also fix .nav-link.active backgrounds to match the image precisely
    // The image uses a solid blue for the selected item, e.g. #2563eb
    content = content.replace(/background: rgba\(255, 255, 255, 0\.15\); color: #ffffff;/g, 'background: #2563eb; color: #ffffff;');
    
    // Make sure .logo-icon inside sidebars is restored or styled properly if it was affected
    // Wait, logo icon was `background: rgba(255, 255, 255, 0.15); color: #ffffff;` due to greedy replace
    content = content.replace(/\.([a-z-]+)logo \{\s*width: 40px;\s*height: 40px;\s*background: #2563eb;/g, '.$1logo {\n  width: 40px;\n  height: 40px;\n  background: #eef2ff;');
    content = content.replace(/\.logo-icon \{\s*width: 40px;\s*height: 40px;\s*background: #2563eb;/g, '.logo-icon {\n  width: 40px;\n  height: 40px;\n  background: #eef2ff;');
    
    fs.writeFileSync(fullPath, content);
    console.log('Fixed CSS:', relPath);
  }
});
