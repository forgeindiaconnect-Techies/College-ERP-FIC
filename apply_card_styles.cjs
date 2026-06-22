const fs = require('fs');
const file = 'e:/Antigravity/New folder/src/index.css';
let content = fs.readFileSync(file, 'utf8');

const updatedCardsCSS = `
/* =========================================
   UPDATED SMALL COLORED METRIC CARDS 
   ========================================= */

/* Resize grid to pack cards tighter */
.stats-grid {
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)) !important;
  gap: 1rem !important;
  margin-bottom: 1.5rem !important;
}

/* Transform stat cards to a compact horizontal row layout */
.stat-card {
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  justify-content: flex-start !important;
  gap: 1rem !important;
  padding: 1rem 1.25rem !important;
  border-radius: 12px !important;
}

.stat-card::before {
  display: none !important; /* Remove top gradient line for solid cards */
}

/* Adjust typography for smaller compact cards */
.stat-details {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
}

.stat-details h3 {
  font-size: 0.75rem !important;
  margin-bottom: 0.15rem !important;
  color: var(--text-main) !important;
  opacity: 0.8;
}

.stat-value {
  font-size: 1.35rem !important;
  font-weight: 800 !important;
  letter-spacing: -0.02em !important;
}

.stat-change {
  font-size: 0.75rem !important;
  margin-top: 0.25rem !important;
}

.stat-icon-wrapper {
  width: 44px !important;
  height: 44px !important;
  border-radius: 12px !important;
}

/* =========================================
   SEPARATE COLORS FOR EACH GRID CARD
   ========================================= */

/* Light Mode Pastel Colors */
.stats-grid > .stat-card:nth-child(8n+1) { background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%) !important; border-color: #bfdbfe !important; }
.stats-grid > .stat-card:nth-child(8n+2) { background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%) !important; border-color: #ddd6fe !important; }
.stats-grid > .stat-card:nth-child(8n+3) { background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%) !important; border-color: #fed7aa !important; }
.stats-grid > .stat-card:nth-child(8n+4) { background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%) !important; border-color: #a7f3d0 !important; }
.stats-grid > .stat-card:nth-child(8n+5) { background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%) !important; border-color: #fecaca !important; }
.stats-grid > .stat-card:nth-child(8n+6) { background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%) !important; border-color: #99f6e4 !important; }
.stats-grid > .stat-card:nth-child(8n+7) { background: linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%) !important; border-color: #f5d0fe !important; }
.stats-grid > .stat-card:nth-child(8n+8) { background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%) !important; border-color: #fde68a !important; }

/* Dark Mode Deep Colors */
.dark .stats-grid > .stat-card:nth-child(8n+1) { background: rgba(30, 58, 138, 0.4) !important; border-color: rgba(59, 130, 246, 0.3) !important; }
.dark .stats-grid > .stat-card:nth-child(8n+2) { background: rgba(88, 28, 135, 0.4) !important; border-color: rgba(139, 92, 246, 0.3) !important; }
.dark .stats-grid > .stat-card:nth-child(8n+3) { background: rgba(154, 52, 18, 0.4) !important; border-color: rgba(249, 115, 22, 0.3) !important; }
.dark .stats-grid > .stat-card:nth-child(8n+4) { background: rgba(6, 78, 59, 0.4) !important; border-color: rgba(16, 185, 129, 0.3) !important; }
.dark .stats-grid > .stat-card:nth-child(8n+5) { background: rgba(127, 29, 29, 0.4) !important; border-color: rgba(239, 68, 68, 0.3) !important; }
.dark .stats-grid > .stat-card:nth-child(8n+6) { background: rgba(19, 78, 74, 0.4) !important; border-color: rgba(20, 184, 166, 0.3) !important; }
.dark .stats-grid > .stat-card:nth-child(8n+7) { background: rgba(112, 26, 117, 0.4) !important; border-color: rgba(217, 70, 239, 0.3) !important; }
.dark .stats-grid > .stat-card:nth-child(8n+8) { background: rgba(116, 66, 16, 0.4) !important; border-color: rgba(245, 158, 11, 0.3) !important; }

/* Dark mode text readability fixes for solid cards */
.dark .stats-grid > .stat-card .stat-details h3 { color: rgba(255,255,255,0.8) !important; }
.dark .stats-grid > .stat-card .stat-value { color: #ffffff !important; }
`;

content += '\n' + updatedCardsCSS;
fs.writeFileSync(file, content, 'utf8');
console.log('Injected compact colored card CSS.');
