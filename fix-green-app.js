const fs = require('fs');
const path = require('path');

function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      let modified = content
        .replace(/#8EB69B/gi, 'var(--color-primary)')
        .replace(/border:\s*'2px solid #8EB69B'/g, "border: '2px solid var(--color-primary)'")
        .replace(/border:\s*'1px solid #8EB69B'/g, "border: '1px solid var(--color-primary)'")
        .replace(/background:\s*'#8EB69B'/g, "background: 'var(--color-primary)'")
        .replace(/#FFFFFF/g, 'var(--color-card)')
        .replace(/#ffffff/g, 'var(--color-card)')
        // For radio buttons or other items where color is explicitly White:
        // we replaced #FFFFFF with var(--color-card) above
        ;

      if (content !== modified) {
        fs.writeFileSync(fullPath, modified, 'utf8');
        console.log('Updated ' + fullPath);
      }
    }
  }
}

const targetDir = path.join(__dirname, 'app');
processDirectory(targetDir);
console.log('Finished fixing green in app directory');
