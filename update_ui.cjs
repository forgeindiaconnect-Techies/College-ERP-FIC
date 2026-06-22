const fs = require('fs');
let content = fs.readFileSync('e:/Antigravity/New folder/src/index.css', 'utf8');

const newCSS = `

/* =========================================
   PREMIUM ENTERPRISE SAAS DASHBOARD STYLES 
   ========================================= */

.glass-card, .stat-card, .dashboard-card {
  background: #FFFFFF !important;
  border-radius: 16px !important;
  border: 1px solid rgba(226, 232, 240, 0.8) !important;
  padding: 1.5rem !important;
  box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.05) !important;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.glass-card:hover, .stat-card:hover, .dashboard-card:hover {
  transform: translateY(-6px) !important;
  box-shadow: 0 20px 40px -8px rgba(15, 23, 42, 0.12) !important;
  border-color: rgba(99, 102, 241, 0.2) !important;
}

.glass-card::before, .stat-card::before, .dashboard-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0), transparent);
  transition: all 0.4s ease;
  opacity: 0;
}

.glass-card:hover::before, .stat-card:hover::before, .dashboard-card:hover::before {
  background: linear-gradient(90deg, #6366F1, #8B5CF6) !important;
  opacity: 1;
}

.dark .glass-card, .dark .stat-card, .dark .dashboard-card {
  background: rgba(30, 41, 59, 0.7) !important;
  backdrop-filter: blur(12px) !important;
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
  box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.3) !important;
}

.dark .glass-card:hover, .dark .stat-card:hover, .dark .dashboard-card:hover {
  border-color: rgba(99, 102, 241, 0.4) !important;
  box-shadow: 0 20px 40px -5px rgba(0, 0, 0, 0.4) !important;
}

/* Premium Dashboard Typography & Grid Overrides */
.stat-details h3, .card-header h3 {
  font-size: 0.85rem !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.06em !important;
  color: var(--text-muted) !important;
  margin-bottom: 0.5rem !important;
}

.stat-value {
  font-size: 2rem !important;
  font-weight: 800 !important;
  color: var(--text-main) !important;
  line-height: 1.2 !important;
  letter-spacing: -0.02em !important;
}

.stat-change {
  font-size: 0.85rem !important;
  font-weight: 600 !important;
  display: flex !important;
  align-items: center !important;
  gap: 0.3rem !important;
  margin-top: 0.5rem !important;
}

.stat-icon-wrapper {
  width: 54px !important;
  height: 54px !important;
  border-radius: 14px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  flex-shrink: 0 !important;
  box-shadow: inset 0 2px 4px rgba(255,255,255,0.4) !important;
}

.dark .stat-icon-wrapper {
  box-shadow: inset 0 2px 4px rgba(255,255,255,0.05) !important;
}

.stats-grid {
  display: grid !important;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)) !important;
  gap: 1.5rem !important;
  margin-bottom: 1.5rem !important;
}

.dashboard-grid {
  display: grid !important;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)) !important;
  gap: 1.5rem !important;
  margin-bottom: 1.5rem !important;
}

/* Quick action buttons upgrade */
.quick-action-btn {
  background: var(--bg-card) !important;
  border: 1px solid var(--border-color) !important;
  border-radius: 12px !important;
  padding: 1.2rem !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 0.8rem !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02) !important;
}

.quick-action-btn:hover {
  transform: translateY(-4px) !important;
  box-shadow: 0 12px 24px rgba(0,0,0,0.06) !important;
  border-color: var(--primary) !important;
}

.quick-action-btn span {
  font-weight: 600 !important;
  font-size: 0.9rem !important;
  color: var(--text-main) !important;
}
`;

content += newCSS;
fs.writeFileSync('e:/Antigravity/New folder/src/index.css', content, 'utf8');
console.log('Premium styles injected into index.css');
