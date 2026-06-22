const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src/subadmin/components/SubAdminSidebar.css');
if (fs.existsSync(cssPath)) {
  let content = fs.readFileSync(cssPath, 'utf8');
  content = content.replace(/transform:\\s*translateX\\(-100%\\)\\s*!important;/g, 'margin-left: -280px !important;');
  fs.writeFileSync(cssPath, content);
  console.log('Fixed margin in SubAdminSidebar.css');
}

