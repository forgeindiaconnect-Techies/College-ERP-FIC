const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let changed = false;
            
            // Generic replacement for setX(MOCK_X)
            const regex = /set([A-Za-z]+)\(MOCK_[A-Z_]+\)/g;
            if (regex.test(content)) {
                content = content.replace(regex, 'set$1([])');
                changed = true;
            }

            // Dashboard.jsx specifics
            if (file === 'Dashboard.jsx') {
               if (content.includes(': MOCK_DEPT_SCORES;')) {
                   content = content.replace(': MOCK_DEPT_SCORES;', ': [];');
                   changed = true;
               }
               if (content.includes('data={MOCK_ATTENDANCE}')) {
                   content = content.replace('data={MOCK_ATTENDANCE}', 'data={[]}');
                   changed = true;
               }
               if (content.includes('data={MOCK_CGPA}')) {
                   content = content.replace('data={MOCK_CGPA}', 'data={[]}');
                   changed = true;
               }
            }
            
            // Principal/HOD/Staff specific fallbacks
            if (content.includes('useState(MOCK_')) {
                content = content.replace(/useState\(MOCK_[A-Z_]+\)/g, 'useState([])');
                changed = true;
            }
            if (content.includes('useState(mock')) {
                content = content.replace(/useState\(mock[A-Za-z]+\)/g, 'useState([])');
                changed = true;
            }

            if (changed) {
                fs.writeFileSync(fullPath, content);
                console.log(`Updated ${file}`);
            }
        }
    }
}

processDir(path.join(__dirname, 'src'));
console.log('Finished removing dummy data fallbacks.');
