const fs = require('fs');
const path = require('path');

function replaceHeroColors(content) {
  let modified = content;

  const map = [
    // Colors
    { from: /#041a0c/gi, to: 'var(--color-text-primary)' }, // dark bg
    { from: /rgba\(4,\s*26,\s*12,/g, to: 'rgba(0, 0, 0,' }, // dark gradient overlay
    { from: /rgba\(253,\s*206,\s*46,\s*0\.18\)/g, to: 'color-mix(in srgb, var(--color-secondary) 18%, transparent)' },
    { from: /rgba\(46,\s*74,\s*59,\s*0\.3\)/g, to: 'color-mix(in srgb, var(--color-primary) 30%, transparent)' },
    { from: /#111827/gi, to: 'var(--color-text-primary)' },
    { from: /#0f172a/gi, to: 'var(--color-text-primary)' },
    { from: /#f8fafc/gi, to: 'var(--color-bg-soft)' },
    { from: /#64748b/gi, to: 'var(--color-text-muted)' },
    { from: /rgba\(226,\s*232,\s*240,\s*0\.9\)/g, to: 'var(--color-border)' },
    
    // Tag specific colors
    { from: /#e0f2fe/gi, to: 'var(--color-secondary-hover)' },
    { from: /#0369a1/gi, to: 'var(--color-secondary)' },
    { from: /#dcfce7/gi, to: 'var(--color-primary-light)' },
    { from: /#15803d/gi, to: 'var(--color-primary)' },
    { from: /#ffd700/gi, to: 'var(--color-secondary)' },
    
    // Spacing & Radius
    { from: /borderRadius:\s*18\b/g, to: "borderRadius: 'var(--radius-xl)'" },
    { from: /padding:\s*'0 16px 40px'/g, to: "padding: '0 var(--space-4) var(--space-8)'" },
    { from: /padding:\s*'0 16px 20px'/g, to: "padding: '0 var(--space-4) var(--space-5)'" },
    { from: /padding:\s*'0 8px 0 16px'/g, to: "padding: '0 var(--space-2) 0 var(--space-4)'" },
    { from: /padding:\s*'0 10px 0 20px'/g, to: "padding: '0 var(--space-3) 0 var(--space-5)'" },
    { from: /padding:\s*'14px 6px'/g, to: "padding: 'var(--space-4) var(--space-2)'" },
    { from: /padding:\s*'12px 8px'/g, to: "padding: 'var(--space-3) var(--space-2)'" },
    { from: /padding:\s*'0 18px'/g, to: "padding: '0 var(--space-5)'" },
    { from: /padding:\s*'0 28px'/g, to: "padding: '0 var(--space-6)'" },
    { from: /padding:\s*'16px 18px'/g, to: "padding: 'var(--space-4) var(--space-5)'" },
    { from: /padding:\s*'13px 14px'/g, to: "padding: 'var(--space-3) var(--space-4)'" },
    { from: /padding:\s*'14px 18px'/g, to: "padding: 'var(--space-4) var(--space-5)'" },
    { from: /padding:\s*'5px 10px'/g, to: "padding: 'var(--space-1) var(--space-3)'" },
    { from: /padding:\s*'12px 16px'/g, to: "padding: 'var(--space-3) var(--space-4)'" },
    { from: /padding:\s*'0 24px'/g, to: "padding: '0 var(--space-6)'" },
    { from: /padding:\s*'6px 18px'/g, to: "padding: 'var(--space-2) var(--space-5)'" },
    { from: /padding:\s*'6px 14px'/g, to: "padding: 'var(--space-2) var(--space-4)'" },
    
    // Gaps and Margins
    { from: /gap:\s*12\b/g, to: "gap: 'var(--space-3)'" },
    { from: /gap:\s*8\b/g, to: "gap: 'var(--space-2)'" },
    { from: /gap:\s*4\b/g, to: "gap: 'var(--space-1)'" },
    { from: /marginBottom:\s*20\b/g, to: "marginBottom: 'var(--space-5)'" },
    { from: /bottom:\s*32\b/g, to: "bottom: 'var(--space-7)'" }
  ];

  map.forEach(r => {
    modified = modified.replace(r.from, r.to);
  });

  return modified;
}

const filesToRefactor = [
  'components/HomeHero.js',
  'components/HeroSection.js'
];

filesToRefactor.forEach(relPath => {
  const fullPath = path.join(__dirname, relPath);
  if (fs.existsSync(fullPath)) {
    const original = fs.readFileSync(fullPath, 'utf8');
    const updated = replaceHeroColors(original);
    fs.writeFileSync(fullPath, updated);
    console.log('Updated ' + relPath);
  }
});
