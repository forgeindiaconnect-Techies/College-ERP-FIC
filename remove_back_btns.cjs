const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function findFiles(dir, filter, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      findFiles(filePath, filter, fileList);
    } else if (filter.test(filePath)) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const allJsxFiles = findFiles(srcDir, /\.jsx$/);

let filesPatched = 0;

allJsxFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Match any button that contains <ArrowLeft ... /> and the word Back
  const backBtnRegex = /<button[^>]*>[\s\S]*?<ArrowLeft[^>]*>[\s\S]*?Back[\s\S]*?<\/button>/g;
  
  if (backBtnRegex.test(content)) {
    content = content.replace(backBtnRegex, '');
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Removed back button from ${file}`);
    filesPatched++;
  }
});

console.log(`Finished patching. Modified ${filesPatched} files.`);
