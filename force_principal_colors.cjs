const fs = require('fs');

const principalFile = 'src/principal/pages/PrincipalDashboard.jsx';
if (fs.existsSync(principalFile)) {
  let code = fs.readFileSync(principalFile, 'utf8');

  // Force all var(--primary) to #3730A5
  code = code.replace(/var\(--primary\)/g, '#3730A5');
  
  // Force var(--primary-tint) to #EEEDFE and var(--on-primary-tint) to #3C3489
  code = code.replace(/var\(--primary-tint\)/g, '#EEEDFE');
  code = code.replace(/var\(--on-primary-tint\)/g, '#3C3489');

  fs.writeFileSync(principalFile, code, 'utf8');
}
