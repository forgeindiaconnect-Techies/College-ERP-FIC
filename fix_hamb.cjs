const fs = require('fs');
const path = require('path');

const layoutsDir = path.join(__dirname, 'src');

const findFiles = (dir, pattern) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(findFiles(file, pattern));
    } else {
      if (file.match(pattern)) results.push(file);
    }
  });
  return results;
};

const layoutFiles = findFiles(layoutsDir, /Layout\.jsx$/);
const sidebarFiles = findFiles(layoutsDir, /Sidebar\.jsx$/);
const sidebarCssFiles = findFiles(layoutsDir, /Sidebar\.css$/);

// 1. Fix Layouts
layoutFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  if (!content.includes('useState')) {
    content = content.replace(/import React from 'react';/, "import React, { useState } from 'react';");
    changed = true;
  }
  
  if (!content.includes('sidebarOpen')) {
    content = content.replace(/const (\w+)Layout = \(\) => {/, 'const $1Layout = () => {\n  const [sidebarOpen, setSidebarOpen] = useState(false);');
    
    // Pass isOpen and onClose to Sidebar
    content = content.replace(/<(\w+)Sidebar \/>/, '<$1Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />');
    
    // Add main-wrapper class
    content = content.replace(/className="main-wrapper"/, "className={`main-wrapper ${sidebarOpen ? 'sidebar-open' : ''} `}");
    
    // Fix Navbar
    content = content.replace(/onMenuToggle={\(\) => {}}/g, 'onMenuToggle={() => setSidebarOpen(o => !o)}');
    content = content.replace(/<Navbar role="([^"]+)" \/>/g, '<Navbar role="$1" onMenuToggle={() => setSidebarOpen(o => !o)} />');
    
    changed = true;
  }
  if (changed) {
      fs.writeFileSync(file, content);
      console.log('Fixed Layout:', file);
  }
});

// 2. Fix Sidebars
sidebarFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('isOpen') && !content.includes('Layout.jsx')) {
    // Add X icon
    if (!content.includes('X,')) {
      content = content.replace(/import {([^}]+)} from 'lucide-react';/, "import { X,$1} from 'lucide-react';");
    }
    
    // Update signature
    content = content.replace(/const (\w+)Sidebar = \(\) => {/, 'const $1Sidebar = ({ isOpen, onClose }) => {');
    
    // Add overlay and class
    content = content.replace(/<aside className="([^"]+)">/, '<>\n      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}\n      <aside className={`$1 ${isOpen ? \'sidebar-open\' : \'\'}`}>');
    
    // Add close button
    content = content.replace(/(<img src="\/logo.svg"[^>]+>\n\s*)<\/div>/, '$1<button className="sidebar-close-btn" onClick={onClose}><X size={20} /></button>\n      </div>');
    
    // Add closing fragment
    const lastAsideIndex = content.lastIndexOf('</aside>');
    content = content.substring(0, lastAsideIndex + 8) + '\n    </>' + content.substring(lastAsideIndex + 8);
    
    fs.writeFileSync(file, content);
    console.log('Fixed Sidebar:', file);
  }
});

// 3. Fix Sidebar CSS
sidebarCssFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('.sidebar-close-btn')) {
    content += `\n
/* ============================
   Mobile Responsive Sidebar
   ============================ */
.sidebar-close-btn {
  display: none;
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  margin-left: auto;
}

.sidebar-overlay {
  display: none;
}

@media (max-width: 768px) {
  .staff-sidebar, .hod-sidebar, .student-sidebar, .parent-sidebar, .principal-sidebar, .driver-sidebar, .accounts-sidebar, .subadmin-sidebar {
    transform: translateX(-100%);
    z-index: 200;
    width: 100vw;
    box-shadow: 4px 0 20px rgba(0,0,0,0.3);
  }

  .staff-sidebar.sidebar-open, .hod-sidebar.sidebar-open, .student-sidebar.sidebar-open, .parent-sidebar.sidebar-open, .principal-sidebar.sidebar-open, .driver-sidebar.sidebar-open, .accounts-sidebar.sidebar-open, .subadmin-sidebar.sidebar-open {
    transform: translateX(0) !important;
  }

  .sidebar-close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .sidebar-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 199;
    backdrop-filter: blur(2px);
  }
}

@media (min-width: 769px) {
  .staff-sidebar.sidebar-open, .hod-sidebar.sidebar-open, .student-sidebar.sidebar-open, .parent-sidebar.sidebar-open, .principal-sidebar.sidebar-open, .driver-sidebar.sidebar-open, .accounts-sidebar.sidebar-open, .subadmin-sidebar.sidebar-open {
    transform: translateX(-100%) !important;
  }
}
`;
    fs.writeFileSync(file, content);
    console.log('Fixed CSS:', file);
  }
});
