const fs = require('fs');
const path = require('path');

// 1. Update index.css variables
const indexCssPath = path.join(__dirname, 'src/index.css');
if (fs.existsSync(indexCssPath)) {
  let content = fs.readFileSync(indexCssPath, 'utf8');
  
  // Revert Orange Theme to Smart Blue Theme
  content = content.replace(/--bg-primary: [^;]+;/, '--bg-primary: #F4F7FE;');
  content = content.replace(/--sidebar-bg: [^;]+;/, '--sidebar-bg: #3258C5;');
  content = content.replace(/--sidebar-hover: [^;]+;/, '--sidebar-hover: rgba(255, 255, 255, 0.1);');
  content = content.replace(/--sidebar-text: [^;]+;/, '--sidebar-text: #E0E8F9;');
  content = content.replace(/--sidebar-hover-text: [^;]+;/, '--sidebar-hover-text: #FFFFFF;');
  content = content.replace(/--sidebar-header-bg: [^;]+;/, '--sidebar-header-bg: #3258C5;');
  content = content.replace(/--primary: [^;]+;/, '--primary: #3258C5;');
  content = content.replace(/--primary-gradient: [^;]+;/, '--primary-gradient: linear-gradient(135deg, #3258C5, #4A72E4);');
  
  // Body background
  content = content.replace(/background: linear-gradient\(135deg, #ff7e5f, #feb47b\) !important;/g, 'background: #25449A !important;');
  
  fs.writeFileSync(indexCssPath, content);
}

// 2. Update Layout.css (if needed)
const layoutCssPath = path.join(__dirname, 'src/components/layout/Layout.css');
if (fs.existsSync(layoutCssPath)) {
  let content = fs.readFileSync(layoutCssPath, 'utf8');
  
  // Increase border radius
  content = content.replace(/border-radius: 24px;/g, 'border-radius: 30px;');
  fs.writeFileSync(layoutCssPath, content);
}

// 3. Update all sidebar CSS files
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
    
    // Active links background to match reference (White pill blending into main bg)
    content = content.replace(/background: #FF6B6B;/g, 'background: #F4F7FE;');
    content = content.replace(/color: #FFFFFF;/g, 'color: #3258C5;');
    
    // Set border radius to blend right edge
    content = content.replace(/border-radius: 20px;/g, 'border-radius: 24px 0 0 24px;');
    
    // Add margin left so it looks like a pill
    // But since it's touching the right edge, we only want left padding/margin
    content = content.replace(/\.nav-link\s*\{[^}]*\}/, match => {
      if (!match.includes('margin-left')) {
        return match.replace(/padding:/, 'margin-left: 1rem;\n  padding:');
      }
      return match;
    });
    
    // Remove borders
    content = content.replace(/border-right: none;/g, 'border-right: none;');
    
    fs.writeFileSync(fullPath, content);
    console.log('Updated CSS:', relPath);
  }
});

