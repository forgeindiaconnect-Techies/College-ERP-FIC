const fs = require('fs');
let data = fs.readFileSync('backend/server.js', 'utf8');
data = data.replace(/[^\x00-\x7F]/g, '');
data = data.replace(/\r?\n\s*\r?\n\s*$/, '\n');
fs.writeFileSync('backend/server.js', data, 'utf8');
console.log('Fixed backend/server.js');
