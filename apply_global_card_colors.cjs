const fs = require('fs');
const file = 'e:/Antigravity/New folder/src/index.css';
let content = fs.readFileSync(file, 'utf8');

const grids = [
  '.stats-grid > .stat-card',
  '.stats-grid > .glass-card',
  '.student-metrics-grid > .s-metric-card',
  '.student-metrics-grid > .glass-card',
  '.staff-stats-grid > .glass-card',
  '.staff-stats-grid > .stat-card',
  '.hod-stats-grid > .glass-card',
  '.accounts-metrics-grid > .glass-card',
  '.parent-metrics-grid > .glass-card',
  '.driver-metrics-grid > .glass-card'
];

const colors = [
  { light: ['#eff6ff', '#dbeafe', '#bfdbfe'], dark: ['rgba(30,58,138,0.4)', 'rgba(59,130,246,0.3)'] }, // Blue
  { light: ['#f5f3ff', '#ede9fe', '#ddd6fe'], dark: ['rgba(88,28,135,0.4)', 'rgba(139,92,246,0.3)'] }, // Purple
  { light: ['#fff7ed', '#ffedd5', '#fed7aa'], dark: ['rgba(154,52,18,0.4)', 'rgba(249,115,22,0.3)'] },  // Orange
  { light: ['#ecfdf5', '#d1fae5', '#a7f3d0'], dark: ['rgba(6,78,59,0.4)', 'rgba(16,185,129,0.3)'] },   // Emerald
  { light: ['#fef2f2', '#fee2e2', '#fecaca'], dark: ['rgba(127,29,29,0.4)', 'rgba(239,68,68,0.3)'] },   // Red
  { light: ['#f0fdfa', '#ccfbf1', '#99f6e4'], dark: ['rgba(19,78,74,0.4)', 'rgba(20,184,166,0.3)'] },   // Teal
  { light: ['#fdf4ff', '#fae8ff', '#f5d0fe'], dark: ['rgba(112,26,117,0.4)', 'rgba(217,70,239,0.3)'] }, // Fuchsia
  { light: ['#fffbeb', '#fef3c7', '#fde68a'], dark: ['rgba(116,66,16,0.4)', 'rgba(245,158,11,0.3)'] }   // Amber
];

let cssBlock = `\n/* =========================================================\n   GLOBAL PREMIUM METRIC CARD COLORIZATION\n   Applies 8-color cyclic gradient to all dashboard grids\n   ========================================================= */\n\n`;

colors.forEach((c, i) => {
  const nth = `nth-child(8n+${i+1})`;
  const lightSelectors = grids.map(g => `${g}:${nth}`).join(',\n');
  const darkSelectors = grids.map(g => `.dark ${g}:${nth}`).join(',\n');
  
  cssBlock += `${lightSelectors} {\n  background: linear-gradient(135deg, ${c.light[0]} 0%, ${c.light[1]} 100%) !important;\n  border-color: ${c.light[2]} !important;\n}\n`;
  cssBlock += `${darkSelectors} {\n  background: ${c.dark[0]} !important;\n  border-color: ${c.dark[1]} !important;\n}\n\n`;
});

// Also add a global hover effect for all metric cards inside these grids
const allGrids = grids.join(',\n');
cssBlock += `${allGrids} {\n  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;\n  position: relative;\n  z-index: 1;\n}\n`;
cssBlock += grids.map(g => `${g}:hover`).join(',\n') + ` {\n  transform: translateY(-5px) !important;\n  box-shadow: 0 15px 30px -5px rgba(0,0,0,0.1) !important;\n  z-index: 10;\n}\n`;

if (!content.includes('GLOBAL PREMIUM METRIC CARD COLORIZATION')) {
  content += cssBlock;
  fs.writeFileSync(file, content, 'utf8');
  console.log('Appended global metric card colors to index.css');
} else {
  // Replace the old block
  const oldBlockRegex = /\/\* =========================================================\n   GLOBAL PREMIUM METRIC CARD COLORIZATION[\s\S]*?(?=\/\*|$)/;
  content = content.replace(oldBlockRegex, cssBlock);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Updated global metric card colors in index.css');
}
