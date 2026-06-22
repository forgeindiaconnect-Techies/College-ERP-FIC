const fs = require('fs');
const file = 'e:/Antigravity/New folder/src/index.css';
let content = fs.readFileSync(file, 'utf8');

const cssFix = `

/* =========================================================
   GLOBAL PAGE HEADER ALIGNMENT FIX
   Ensures titles and subtitles stack vertically unless 
   there is a back button present.
   ========================================================= */
.page-header .header-left, .page-header .header-left-s {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0;
}

.page-header .header-left:has(button), .page-header .header-left-s:has(button) {
  flex-direction: row;
  align-items: center;
  gap: 1rem;
}
`;

if (!content.includes('GLOBAL PAGE HEADER ALIGNMENT FIX')) {
  content += cssFix;
  fs.writeFileSync(file, content, 'utf8');
  console.log('Appended global header fix to index.css');
} else {
  console.log('Fix already present in index.css');
}
