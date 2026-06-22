const fs = require('fs');
const path = require('path');

const findFiles = (dir, pattern) => {
  let res = [];
  fs.readdirSync(dir).forEach(file => {
    file = path.join(dir, file);
    if (fs.statSync(file).isDirectory()) {
      res = res.concat(findFiles(file, pattern));
    } else if (file.match(pattern)) {
      res.push(file);
    }
  });
  return res;
};

const jsxFiles = findFiles(path.join(__dirname, 'src'), /Sidebar\.jsx$/);

jsxFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Change default styles
  content = content.replace(/color:\s*'#ef4444',\s*background:\s*'transparent'/g, "color: '#ffffff', background: '#ef4444'");
  
  // Change hover styles
  content = content.replace(/onMouseOver=\{\(e\) => e.currentTarget.style.background = 'rgba\(239, 68, 68, 0\.1\)'\}/g, "onMouseOver={(e) => e.currentTarget.style.background = '#dc2626'}");
  
  // Change mouse out styles back to solid red
  content = content.replace(/onMouseOut=\{\(e\) => e.currentTarget.style.background = 'transparent'\}/g, "onMouseOut={(e) => e.currentTarget.style.background = '#ef4444'}");

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    console.log('Fixed logout button in', file);
  }
});

let logo = fs.readFileSync('public/logo.svg', 'utf8');
let originalLogo = logo;
logo = logo.replace(/>RPSYS<\/text>/g, '>ERPSYS</text>');
logo = logo.replace(/x="49"/g, 'x="40"');
if (logo !== originalLogo) {
  fs.writeFileSync('public/logo.svg', logo);
  console.log('Fixed logo.svg');
}
