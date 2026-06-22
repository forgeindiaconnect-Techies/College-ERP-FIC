const fs = require('fs');
const path = require('path');

// 1. Update index.css variables
const indexCssPath = path.join(__dirname, 'src/index.css');
if (fs.existsSync(indexCssPath)) {
  let content = fs.readFileSync(indexCssPath, 'utf8');
  
  // Update Light Mode variables
  content = content.replace(/--sidebar-bg: [^;]+;/, '--sidebar-bg: #153b6c;');
  content = content.replace(/--sidebar-hover: [^;]+;/, '--sidebar-hover: rgba(255, 255, 255, 0.08);');
  content = content.replace(/--sidebar-text: [^;]+;/, '--sidebar-text: #cbd5e1;');
  content = content.replace(/--sidebar-hover-text: [^;]+;/, '--sidebar-hover-text: #ffffff;');
  if (!content.includes('--sidebar-header-bg:')) {
    content = content.replace(/--sidebar-header-text:/, '--sidebar-header-bg: #ffffff;\n  --sidebar-header-text:');
  } else {
    content = content.replace(/--sidebar-header-bg: [^;]+;/, '--sidebar-header-bg: #ffffff;');
  }
  
  // Update Dark Mode variables
  content = content.replace(/--sidebar-bg: var\(--bg-card\);/, '--sidebar-bg: var(--bg-card);\n  --sidebar-header-bg: var(--bg-card);');
  
  fs.writeFileSync(indexCssPath, content);
  console.log('Updated index.css');
}

// 2. Update all sidebar CSS files
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
    
    // Add background to headers
    const headerRegex = /(\.[a-zA-Z0-9_-]+sidebar-header\s*\{[^}]*?height:\s*70px;)/g;
    content = content.replace(headerRegex, '\\n  background: var(--sidebar-header-bg);');
    
    // Fix active links background to match reference (semi-transparent instead of light purple)
    content = content.replace(/background: #eef2ff;/g, 'background: rgba(255, 255, 255, 0.15);');
    content = content.replace(/color: #4f46e5;/g, 'color: #ffffff;');
    content = content.replace(/box-shadow: 0 8px 20px rgba\(79, 70, 229, 0\.25\);/g, 'box-shadow: none;');
    
    // Fix nav group header (since background is dark now)
    content = content.replace(/color: #475569;/g, 'color: #94a3b8;');
    
    // Fix borders to match top navbar
    content = content.replace(/border-right: 1px solid rgba\(255, 255, 255, 0\.05\);/g, 'border-right: 1px solid var(--border-color);');
    content = content.replace(/border-bottom: 1px solid rgba\(255, 255, 255, 0\.05\);/g, 'border-bottom: 1px solid var(--border-color);');
    content = content.replace(/border-top: 1px solid rgba\(255, 255, 255, 0\.05\);/g, 'border-top: 1px solid rgba(255, 255, 255, 0.1);');
    
    fs.writeFileSync(fullPath, content);
    console.log('Updated CSS:', relPath);
  }
});

