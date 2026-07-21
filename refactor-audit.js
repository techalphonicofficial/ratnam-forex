const fs = require('fs');
const path = require('path');

const map = [
  // Specific straggler colors
  { from: /#f97316/gi, to: 'var(--color-secondary)' }, // orange
  { from: /#8b5cf6/gi, to: 'var(--color-primary)' }, // purple
  { from: /#1e40af/gi, to: 'var(--color-primary)' }, // blue
  { from: /#1c222e/gi, to: 'var(--color-bg)' }, // very dark bg
  { from: /#222938/gi, to: 'var(--color-bg-soft)' }, // dark bg
  { from: /#2d3748/gi, to: 'var(--color-border)' }, // border
  { from: /#0a0a0a/gi, to: 'var(--color-text-primary)' }, // almost black
  { from: /#059669/gi, to: 'var(--color-primary)' }, // emerald
  { from: /#fffbeb/gi, to: 'var(--color-secondary-hover)' }, // amber-50
  { from: /#fff0f0/gi, to: 'var(--color-primary-light)' }, // pink-50
  { from: /#fecaca/gi, to: 'var(--color-secondary-hover)' }, // red-200
  { from: /#8EB69B/gi, to: 'var(--color-primary)' },
  { from: /#083d5b/gi, to: 'var(--color-primary)' },
  { from: /#108173/gi, to: 'var(--color-secondary)' },
  { from: /#f0fdfa/gi, to: 'var(--color-primary-light)' }, // teal-50

  // The major ones: White and Black
  // Note: we're only matching these bounded so we don't accidentally match parts of hashes.
  // We use regex boundary \b, but since # is not a word character, we look for the exact string followed by a boundary
  { from: /#ffffff\b/gi, to: 'var(--color-card)' },
  { from: /#fff\b/gi, to: 'var(--color-card)' },
  { from: /#000000\b/gi, to: 'var(--color-text-primary)' },
  { from: /#000\b/gi, to: 'var(--color-text-primary)' },
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = content;

      map.forEach(r => {
        modified = modified.replace(r.from, r.to);
      });

      if (content !== modified) {
        fs.writeFileSync(fullPath, modified, 'utf8');
        console.log('Updated ' + fullPath);
      }
    }
  }
}

const targetDir = path.join(__dirname, 'components');
processDirectory(targetDir);
console.log('Finished Final Audit Refactor');
