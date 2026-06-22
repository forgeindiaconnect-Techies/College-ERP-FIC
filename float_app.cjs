const fs = require('fs');
const path = require('path');

const indexCssPath = path.join(__dirname, 'src/index.css');
if (fs.existsSync(indexCssPath)) {
  let content = fs.readFileSync(indexCssPath, 'utf8');
  
  const bodyRegex = /body \{\s*margin: 0;\s*font-family: 'Inter', sans-serif;/g;
  content = content.replace(bodyRegex, 
    "body {\n  margin: 0;\n  padding: 1.5rem;\n  box-sizing: border-box;\n  min-height: 100vh;\n  background: linear-gradient(135deg, #ff7e5f, #feb47b) !important;\n  font-family: 'Inter', sans-serif;");
  
  fs.writeFileSync(indexCssPath, content);
}

const layoutCssPath = path.join(__dirname, 'src/components/layout/Layout.css');
if (fs.existsSync(layoutCssPath)) {
  let content = fs.readFileSync(layoutCssPath, 'utf8');
  
  const layoutRegex = /\.layout-container \{\s*display: flex;\s*height: 100vh;/g;
  content = content.replace(layoutRegex, 
    ".layout-container {\n  display: flex;\n  height: calc(100vh - 3rem);\n  background: var(--bg-primary);\n  border-radius: 24px;\n  box-shadow: 0 20px 40px rgba(0,0,0,0.15);");
    
  fs.writeFileSync(layoutCssPath, content);
}
