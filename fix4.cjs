const fs = require('fs');
const path = 'src/components/layout/Navbar.jsx';
let content = fs.readFileSync(path, 'utf8');
content = content.replace('Welcome, {userRole}! dY`<', 'Welcome, {userRole}!');
fs.writeFileSync(path, content);
console.log('Fixed Navbar.jsx');
