const fs = require('fs');
const file = 'e:/Antigravity/New folder/src/pages/Dashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/ðŸ“‹/g, '📋');
content = content.replace(/ðŸš€/g, '🚀');
content = content.replace(/ðŸ”</g, '📋'); // Based on the image showing ðŸ”<

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed Mojibake in Dashboard.jsx');
