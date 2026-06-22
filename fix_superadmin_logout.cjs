const fs = require('fs');

let file = 'src/superadmin/components/SuperAdminLayout.jsx';
let content = fs.readFileSync(file, 'utf8');
let originalContent = content;

// Replace the logout-btn class button with inline styles matching the rest
content = content.replace(/<button className="logout-btn"[\s\S]*?<\/button>/, `<button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 16px', color: '#ffffff', background: '#ef4444', border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: '0.9rem', borderRadius: '8px', transition: 'all 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#dc2626'} onMouseOut={(e) => e.currentTarget.style.background = '#ef4444'}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>`);

// Bust cache for the logo
content = content.replace(/"\/logo\.svg.*?"/g, '"/logo.svg?v=' + Date.now() + '"');

if (content !== originalContent) {
  fs.writeFileSync(file, content);
  console.log('Fixed SuperAdminLayout');
} else {
  console.log('No changes needed in SuperAdminLayout');
}
