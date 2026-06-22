const fs = require('fs');
const file = 'e:/Antigravity/New folder/src/index.css';
let content = fs.readFileSync(file, 'utf8');

const cssFix = `

/* =========================================================
   GLOBAL HEADER ACTIONS & SEARCH BAR
   ========================================================= */
.page-header .header-right,
.page-header .header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-bar {
  display: flex;
  align-items: center;
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.5rem 0.8rem;
  gap: 0.5rem;
  transition: var(--transition);
}

.search-bar:focus-within {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.search-bar input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 0.9rem;
  width: 200px;
  padding: 0;
  margin: 0;
}
`;

if (!content.includes('GLOBAL HEADER ACTIONS & SEARCH BAR')) {
  content += cssFix;
  fs.writeFileSync(file, content, 'utf8');
  console.log('Appended search bar and header actions styles to index.css');
} else {
  console.log('Fix already present in index.css');
}
