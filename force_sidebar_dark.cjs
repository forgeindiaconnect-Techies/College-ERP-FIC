const fs = require('fs');

let sidebarCss = fs.readFileSync('src/components/layout/Sidebar.css', 'utf8');

// Replace .sidebar background and color
sidebarCss = sidebarCss.replace(/\.sidebar\s*\{[^}]+\}/, `.sidebar {
    width: 280px;
    background: #15113A !important;
    color: #9CA3AF !important;
    display: flex;
    flex-direction: column;
    height: 100vh;
    position: fixed;
    left: 0;
    top: 0;
    z-index: 100;
    border-right: 1px solid rgba(255, 255, 255, 0.05);
}`);

// Add explicit .nav-link colors
if (!sidebarCss.includes('color: #9CA3AF !important; /* hardcoded navlink */')) {
  sidebarCss += `
.nav-link { color: #9CA3AF !important; /* hardcoded navlink */ }
.nav-link:hover { color: #FFFFFF !important; background-color: rgba(255, 255, 255, 0.05) !important; }
.nav-group-header { color: #6B7280 !important; }
.nav-group-header:hover { color: #D1D5DB !important; }
`;
}

// Ensure active is #ffffff
sidebarCss = sidebarCss.replace(/\.nav-link\.active\s*\{[^}]+\}/g, '.nav-link.active { background: #3C3489 !important; color: #ffffff !important; border-radius: 12px !important; font-weight: 600; box-shadow: 0 4px 12px rgba(60, 52, 137, 0.4); border-left: none !important; }');
sidebarCss = sidebarCss.replace(/\.dark\s+\.nav-link\.active\s*\{[^}]+\}/g, ''); // remove redundant dark active

fs.writeFileSync('src/components/layout/Sidebar.css', sidebarCss);

console.log("Forced all sidebar elements to use Dark Theme styling by default!");
