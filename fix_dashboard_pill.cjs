const fs = require('fs');

const fixDashboardElements = () => {
  const file = 'src/pages/Dashboard.jsx';
  if (!fs.existsSync(file)) return;
  
  let code = fs.readFileSync(file, 'utf8');

  // 1. Fix Live Sync pill
  code = code.replace(
    /background:\s*'rgba\(16,185,129,0\.1\)',\s*border:\s*'1px solid rgba\(16,185,129,0\.3\)'[^,]+,\s*borderRadius:\s*20,\s*fontSize:\s*'0\.75rem',\s*fontWeight:\s*700,\s*color:\s*'#10b981'/g,
    "background: 'rgba(15, 110, 86, 0.1)', border: '1px solid rgba(15, 110, 86, 0.2)', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, color: 'var(--success)'"
  );
  
  code = code.replace(
    /background:\s*'#10b981',\s*display:\s*'inline-block',\s*boxShadow:\s*'0 0 0 2px rgba\(16,185,129,0\.3\)'/g,
    "background: 'var(--success)', display: 'inline-block', boxShadow: '0 0 0 2px rgba(15, 110, 86, 0.2)'"
  );

  fs.writeFileSync(file, code, 'utf8');
  console.log('Fixed Dashboard.jsx');
};

fixDashboardElements();
