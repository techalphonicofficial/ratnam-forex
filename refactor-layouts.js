const fs = require('fs');
const path = require('path');

const map = [
  // Primary (Greens/Reds depending on brand)
  { from: /#A3C644/gi, to: 'var(--color-primary)' },
  { from: /#8DB133/gi, to: 'var(--color-primary-dark)' },
  { from: /#F2F8D9/gi, to: 'var(--color-primary-light)' },
  { from: /#E03C42/gi, to: 'var(--color-primary)' },
  { from: /#D9534F/gi, to: 'var(--color-primary)' },
  { from: /#10b981/gi, to: 'var(--color-primary)' },
  { from: /#ec4899/gi, to: 'var(--color-primary)' },
  { from: /#6366f1/gi, to: 'var(--color-primary)' },
  { from: /#1d4ed8/gi, to: 'var(--color-primary)' },
  { from: /#047857/gi, to: 'var(--color-primary)' },
  { from: /#6d28d9/gi, to: 'var(--color-primary)' },
  { from: /#e11d48/gi, to: 'var(--color-primary)' },
  { from: /#be185d/gi, to: 'var(--color-primary)' },

  // Secondary (Yellows/Oranges/Blues)
  { from: /#fbbf24/gi, to: 'var(--color-secondary)' },
  { from: /#f59e0b/gi, to: 'var(--color-secondary)' },
  { from: /#0ea5e9/gi, to: 'var(--color-secondary)' },
  { from: /#0284c7/gi, to: 'var(--color-secondary)' },
  { from: /#b45309/gi, to: 'var(--color-secondary)' },
  { from: /#c2410c/gi, to: 'var(--color-secondary)' },
  { from: /#b91c1c/gi, to: 'var(--color-secondary)' },
  { from: /#ef4444/gi, to: 'var(--color-secondary)' },

  // Background Soft / Light variants
  { from: /#f3f4f6/gi, to: 'var(--color-bg-soft)' },
  { from: /#f9fafb/gi, to: 'var(--color-bg-soft)' },
  { from: /#f8fafc/gi, to: 'var(--color-bg-soft)' },
  { from: /#eff6ff/gi, to: 'var(--color-bg-soft)' },
  { from: /#f5f3ff/gi, to: 'var(--color-bg-soft)' },
  { from: /#ffebf0/gi, to: 'var(--color-primary-light)' },
  { from: /#fce7f3/gi, to: 'var(--color-primary-light)' },
  { from: /#ecfdf5/gi, to: 'var(--color-primary-light)' },
  { from: /#fef3c7/gi, to: 'var(--color-secondary-hover)' },
  { from: /#fff7ed/gi, to: 'var(--color-secondary-hover)' },
  { from: /#fef2f2/gi, to: 'var(--color-secondary-hover)' },
  { from: /#fee2e2/gi, to: 'var(--color-secondary-hover)' },

  // Borders
  { from: /#e5e7eb/gi, to: 'var(--color-border)' },
  { from: /#e2e8f0/gi, to: 'var(--color-border)' },
  { from: /#f1f5f9/gi, to: 'var(--color-border)' },
  { from: /#d1d5db/gi, to: 'var(--color-border)' },

  // Text Primary
  { from: /#0B3C5D/gi, to: 'var(--color-text-primary)' },
  { from: /#111827/gi, to: 'var(--color-text-primary)' },
  { from: /#0f172a/gi, to: 'var(--color-text-primary)' },
  { from: /#1f2937/gi, to: 'var(--color-text-primary)' },
  { from: /#374151/gi, to: 'var(--color-text-primary)' },
  { from: /#334155/gi, to: 'var(--color-text-primary)' },

  // Text Muted
  { from: /#6b7280/gi, to: 'var(--color-text-muted)' },
  { from: /#4b5563/gi, to: 'var(--color-text-muted)' },
  { from: /#9ca3af/gi, to: 'var(--color-text-muted)' },
  { from: /#64748b/gi, to: 'var(--color-text-muted)' },
  { from: /#94a3b8/gi, to: 'var(--color-text-muted)' },

  // Shadows
  { from: /0 20px 50px rgba\(0,0,0,0\.3\)/g, to: 'var(--shadow-xl)' },
  { from: /0 4px 20px rgba\(0,0,0,0\.14\)/g, to: 'var(--shadow-md)' },
  { from: /0 8px 24px rgba\(163,\s*198,\s*68,\s*0\.28\)/g, to: 'var(--shadow-md)' },
  { from: /0 16px 40px rgba\(0,0,0,0\.22\)/g, to: 'var(--shadow-lg)' },
  { from: /0 4px 16px rgba\(0,0,0,0\.1\)/g, to: 'var(--shadow-sm)' },
  { from: /0 1px 4px rgba\(0,0,0,0\.08\)/g, to: 'var(--shadow-sm)' },
  { from: /0 4px 14px rgba\(0,0,0,0\.12\)/g, to: 'var(--shadow-sm)' },
  { from: /0 2px 8px rgba\(0,0,0,0\.15\)/g, to: 'var(--shadow-sm)' },
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
console.log('Finished Layouts & Components Refactor');
