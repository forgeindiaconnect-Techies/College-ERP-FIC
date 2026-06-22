const fs = require('fs');

const file = 'src/principal/pages/PrincipalStaffSupport.jsx';
let content = fs.readFileSync(file, 'utf8');

const oldBannerRegex = /<div style=\{\{\s*background:\s*'var\(--primary\)',\s*borderRadius:\s*'16px',\s*padding:\s*'1\.5rem 2rem',\s*marginBottom:\s*'1\.5rem',\s*color:\s*'#fff',\s*boxShadow:\s*'0 4px 15px -5px rgba\(16, 185, 129, 0\.4\)',\s*display:\s*'flex',\s*justifyContent:\s*'space-between',\s*alignItems:\s*'center',\s*position:\s*'relative',\s*overflow:\s*'hidden'\s*\}\}>[\s\S]*?<div style=\{\{ position: 'relative', zIndex: 1 \}\}>\s*<h1 style=\{\{ fontSize: '1\.5rem', fontWeight: 800, margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' \}\}>\s*<UserCheck size=\{24\} \/> Support & Escalations Oversight\s*<\/h1>\s*<p style=\{\{ margin: 0, opacity: 0\.9, fontSize: '0\.875rem', fontWeight: 500 \}\}>\s*Review and manage staff requests, leaves, complaints, and HOD escalations\.\s*<\/p>\s*<\/div>\s*<\/div>/;

const newBanner = `<div style={{
        background: '#3730A5',
        borderRadius: '16px',
        padding: '1.5rem 2rem',
        marginBottom: '1.5rem',
        color: '#fff',
        boxShadow: '0 4px 20px -5px rgba(55, 48, 165, 0.4)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: '300px', height: '300px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', filter: 'blur(40px)' }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
            <UserCheck size={24} /> Support & Escalations Oversight
          </h1>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '0.85rem', fontWeight: 500, color: '#fff' }}>
            Review and manage staff requests, leaves, complaints, and HOD escalations.
          </p>
        </div>
      </div>`;

content = content.replace(oldBannerRegex, newBanner);

// Wait, I should also make sure btn-primary styles don't look weird?
// The user says "change the colour size as an second image fix this".
// Let's also check if there are other un-fixed banners using `var(--primary)`.

fs.writeFileSync(file, content);
console.log('Fixed PrincipalStaffSupport.jsx banner!');
