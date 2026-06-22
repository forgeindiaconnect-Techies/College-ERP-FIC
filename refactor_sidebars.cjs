const fs = require('fs');
const path = require('path');

// 1. Update CSS
const cssPath = 'src/components/layout/Sidebar.css';
let cssContent = fs.readFileSync(cssPath, 'utf8');

const oldCssBlock = cssContent.substring(cssContent.indexOf('.nav-group-items {'), cssContent.indexOf('/* Logout Button */'));

const newCssBlock = `.nav-group-items {
  list-style: none;
  padding: 0 0 0 1.25rem;
  margin: 0.2rem 1rem 0.5rem 1rem;
  border-left: 2px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.nav-group-items.collapsed {
  max-height: 0;
}

.nav-group-items.expanded {
  max-height: 1000px;
}

/* Submenu Styles */
.submenu-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 1rem;
  color: #7C82B3 !important;
  text-decoration: none !important;
  font-size: 0.85rem;
  font-weight: 500;
  border-radius: 6px;
  transition: all 0.2s ease;
  position: relative;
  margin-bottom: 0.15rem;
}

.submenu-link span {
  color: #7C82B3 !important;
}

.submenu-link svg {
  color: #7C82B3 !important;
  transition: color 0.25s ease;
}

.submenu-link:hover {
  color: var(--sidebar-hover-text) !important;
  background: var(--sidebar-hover);
  transform: translateX(2px);
}

.submenu-link:hover span, .submenu-link:hover svg {
  color: var(--sidebar-hover-text) !important;
}

.submenu-link.active {
  color: var(--sidebar-active-text) !important;
  font-weight: 700;
  background: rgba(37, 99, 235, 0.15);
}

.submenu-link.active span, .submenu-link.active svg {
  color: var(--sidebar-active-text) !important;
}

.submenu-link.active::before {
  content: '';
  position: absolute;
  left: -1.25rem;
  top: 50%;
  transform: translateY(-50%);
  width: 2px;
  height: 60%;
  background-color: var(--sidebar-active-text);
}

`;

if (oldCssBlock.length > 50) {
  cssContent = cssContent.replace(oldCssBlock, newCssBlock);
  fs.writeFileSync(cssPath, cssContent, 'utf8');
}

// 2. Update JSX files
function findSidebarFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findSidebarFiles(filePath, fileList);
    } else if (file.endsWith('Sidebar.jsx')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const sidebarFiles = findSidebarFiles('src');
for (const file of sidebarFiles) {
  let content = fs.readFileSync(file, 'utf8');
  
  content = content.replace(/\{group\.items\.map\(\(item, [\w]\) => \([\s\S]*?<\/ul>/g, (match) => {
    let newMatch = match.replace(/'nav-link active' : 'nav-link'/g, "'submenu-link active' : 'submenu-link'");
    newMatch = newMatch.replace(/style=\{\{ paddingLeft: '1rem' \}\}/g, "");
    newMatch = newMatch.replace(/\{item\.icon\}/g, "{React.cloneElement(item.icon, { size: 16 })}");
    return newMatch;
  });
  
  fs.writeFileSync(file, content, 'utf8');
}
console.log('Updated ' + sidebarFiles.length + ' sidebar files');
