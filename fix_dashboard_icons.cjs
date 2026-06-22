const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    try {
      filelist = fs.statSync(dirFile).isDirectory() ? walkSync(dirFile, filelist) : filelist.concat(dirFile);
    } catch (err) {
      if (err.code === 'ENOENT') {
        return filelist;
      } else {
        throw err;
      }
    }
  });
  return filelist;
};

const fixStatCardIcons = () => {
  const files = walkSync('src').filter(f => f.endsWith('.jsx'));
  
  files.forEach(file => {
    let code = fs.readFileSync(file, 'utf8');
    let changed = false;

    const oldCode = code;
    code = code.replace(/bg-icon-(blue|purple|orange|green|emerald|teal|pink|red|cyan|skyblue|indigo|royalblue|amber)/g, 'bg-icon-primary');
    
    if (code !== oldCode) {
      changed = true;
    }

    if (file.includes('Dashboard.jsx')) {
      const attendanceRegex = /<div className="stat-icon-wrapper bg-icon-primary">\s*<CalendarCheck size=\{18\} \/>\s*<\/div>\s*<div className="stat-details">\s*<h3>Avg Attendance<\/h3>/g;
      if (code.match(attendanceRegex)) {
        code = code.replace(
          attendanceRegex,
          `<div className="stat-icon-wrapper bg-icon-warning">\n            <CalendarCheck size={18} />\n          </div>\n          <div className="stat-details">\n            <h3>Avg Attendance</h3>`
        );
        changed = true;
      }
    }

    if (changed) {
      fs.writeFileSync(file, code, 'utf8');
      console.log('Fixed icon colors in:', file);
    }
  });
};

fixStatCardIcons();
