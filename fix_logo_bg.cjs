const fs = require('fs');

let svg = fs.readFileSync('public/logo.svg', 'utf8');

// Replace both occurrences of the white background rectangle
// The regex accounts for possible minor spacing variations
svg = svg.replace(/<rect[^>]*fill="white"[^>]*\/>/g, '');

// Save the clean SVG
fs.writeFileSync('public/logo.svg', svg);

console.log("Removed white background from logo.svg!");
