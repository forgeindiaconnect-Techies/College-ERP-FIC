const fs = require('fs');
const path = require('path');

// 1. Update index.css variables
const indexCssPath = path.join(__dirname, 'src/index.css');
if (fs.existsSync(indexCssPath)) {
  let content = fs.readFileSync(indexCssPath, 'utf8');
  
  // Revert Blue Theme to Warm Orange/Coral Theme
  content = content.replace(/--bg-primary: [^;]+;/, '--bg-primary: #FDF4F2;');
  content = content.replace(/--sidebar-bg: [^;]+;/, '--sidebar-bg: #FFFFFF;');
  content = content.replace(/--sidebar-hover: [^;]+;/, '--sidebar-hover: #FFF1EE;');
  content = content.replace(/--sidebar-text: [^;]+;/, '--sidebar-text: #475569;');
  content = content.replace(/--sidebar-hover-text: [^;]+;/, '--sidebar-hover-text: #0F172A;');
  content = content.replace(/--sidebar-header-bg: [^;]+;/, '--sidebar-header-bg: #FFFFFF;');
  content = content.replace(/--primary: [^;]+;/, '--primary: #FF6B6B;');
  content = content.replace(/--primary-gradient: [^;]+;/, '--primary-gradient: linear-gradient(135deg, #FF6B6B, #FF8E53);');
  
  fs.writeFileSync(indexCssPath, content);
  console.log('Updated index.css with Orange Theme');
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
    
    // Fix active links background to match reference (Coral Orange Pill)
    // In my previous script, I changed active link to #2563eb (Blue). I'll change it to Coral.
    content = content.replace(/background: #2563eb;/g, 'background: #FF6B6B;');
    content = content.replace(/color: #ffffff;/g, 'color: #FFFFFF;'); // Text is white on active
    
    // In the new reference, active sidebar items are pill-shaped
    content = content.replace(/border-radius: 12px;/g, 'border-radius: 20px;');
    
    // Remove the border-right so it seamlessly blends if needed, or keep a subtle one
    content = content.replace(/border-right: 1px solid var\(--border-color\);/g, 'border-right: none;');
    
    fs.writeFileSync(fullPath, content);
    console.log('Updated CSS:', relPath);
  }
});

