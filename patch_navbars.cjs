const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function findFiles(dir, filter, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      findFiles(filePath, filter, fileList);
    } else if (filter.test(filePath)) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const navbarFiles = findFiles(srcDir, /Navbar\.jsx$/);

navbarFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Add state if it doesn't exist
  if (!content.includes('showProfileMenu')) {
    content = content.replace(
      /const \[showNotifications, setShowNotifications\] = useState\(false\);/,
      `const [showNotifications, setShowNotifications] = useState(false);\n  const [showProfileMenu, setShowProfileMenu] = useState(false);`
    );
  }

  // Replace profile div to include onClick and the dropdown
  // We need to match the outer profile div which has class matching *-profile or just navbar-profile
  const profileDivRegex = /(<div className="([^"]*profile)">(.*?)<ChevronDown[^>]*>)\s*<\/div>/s;
  
  if (profileDivRegex.test(content) && !content.includes('showProfileMenu && (')) {
    content = content.replace(profileDivRegex, (match, beforeChevron, className, inner) => {
      // Add onClick to the profile div and style for cursor pointer
      const updatedBeforeChevron = beforeChevron.replace(
        `<div className="${className}">`,
        `<div className="${className}" style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setShowProfileMenu(!showProfileMenu)}>`
      );
      
      const dropdownHtml = `
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 z-50 overflow-hidden animate-fade-in" style={{position: 'absolute', right: 0, top: '100%', marginTop: '0.5rem', width: '12rem', backgroundColor: 'var(--bg-primary)', borderRadius: '0.75rem', zIndex: 50, border: '1px solid var(--border-color)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'}}>
              <div style={{padding: '0.75rem', borderBottom: '1px solid var(--border-color)'}}>
                <div className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>Profile Settings</div>
              </div>
              <div style={{padding: '0.75rem', cursor: 'pointer'}} className="hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => { sessionStorage.clear(); window.location.href = '/login'; }}>
                <div className="text-sm font-bold text-danger" style={{ color: '#ef4444' }}>Logout</div>
              </div>
            </div>
          )}
        </div>`;
      
      return updatedBeforeChevron + dropdownHtml;
    });
    
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Patched ${file}`);
  } else {
    console.log(`Skipped ${file}`);
  }
});
