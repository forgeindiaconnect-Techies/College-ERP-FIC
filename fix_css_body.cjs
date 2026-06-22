const fs = require('fs');
const path = require('path');

const indexCssPath = path.join(__dirname, 'src/index.css');
if (fs.existsSync(indexCssPath)) {
  let content = fs.readFileSync(indexCssPath, 'utf8');
  
  // Clean up the messed up .dark block end and add body back
  content = content.replace(/  --shadow-lg: 0 10px 15px -3px rgba\(0, 0, 0, 0\.5\);\s*color: var\(--text-main\);\s*\}/,
`  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 500;
  background: #25449A !important;
  color: var(--text-main);
  -webkit-font-smoothing: antialiased;
  transition: background-color 0.3s ease, color 0.3s ease;
  min-height: 100vh;
  padding: 2rem;
}

h1 { font-size: 32px; font-weight: 700; color: var(--text-main); margin-bottom: 0.5em; }
h2 { font-size: 24px; font-weight: 700; color: var(--text-main); margin-bottom: 0.5em; }
h3 { font-size: 20px; font-weight: 600; color: var(--text-main); margin-bottom: 0.5em; }
h4, h5, h6 {
  font-weight: 600;
  color: var(--text-main);
}`);
  
  fs.writeFileSync(indexCssPath, content);
  console.log('Fixed body in index.css');
}
