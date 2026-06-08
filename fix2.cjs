const fs = require('fs');
let data = fs.readFileSync('backend/server.js', 'utf8');
const index = data.indexOf('startServer();');
if (index !== -1) {
  data = data.substring(0, index + 14) + '\n';
  fs.writeFileSync('backend/server.js', data, 'utf8');
  console.log('Fixed syntax error!');
}
