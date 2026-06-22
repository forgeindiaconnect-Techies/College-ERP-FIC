const fs = require('fs');

const fixIndexCss = () => {
  let code = fs.readFileSync('src/index.css', 'utf8');
  if (!code.includes('bg-icon-primary')) {
    code += `\n/* Unified Stat Card Icon Chips */\n.bg-icon-primary {\n  background: var(--primary-tint) !important;\n  color: var(--on-primary-tint) !important;\n}\n.bg-icon-warning {\n  background: rgba(133, 79, 11, 0.1) !important;\n  color: var(--warning) !important;\n}\n`;
    fs.writeFileSync('src/index.css', code, 'utf8');
    console.log('Added unified icon classes to index.css');
  }
};

fixIndexCss();
