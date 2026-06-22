const fs = require('fs');
const path = require('path');

const filesToFix = {
  'src/driver/components/DriverSidebar.jsx': 'DriverSidebar',
  'src/hod/components/HodSidebar.jsx': 'HodSidebar',
  'src/parent/components/ParentSidebar.jsx': 'ParentSidebar',
  'src/staff/components/StaffSidebar.jsx': 'StaffSidebar',
  'src/student/components/StudentSidebar.jsx': 'StudentSidebar',
  'src/subadmin/components/SubAdminSidebar.jsx': 'SubAdminSidebar'
};

for (const [file, componentName] of Object.entries(filesToFix)) {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // The previous script replaced "const NameSidebar = () => {" with "({ isOpen, onClose }) => {"
    // So we just need to find "^({ isOpen, onClose }) => {" and add the declaration back.
    if (content.includes('({ isOpen, onClose }) => {') && !content.includes(`const ${componentName} = ({`)) {
      content = content.replace(/\(\{\s*isOpen,\s*onClose\s*\}\)\s*=>\s*\{/, `const ${componentName} = ({ isOpen, onClose }) => {`);
      fs.writeFileSync(filePath, content);
      console.log('Restored', componentName, 'in', file);
    }
  }
}
