const fs = require('fs');
const path = require('path');

function replaceSpacingAndRadius(content) {
  let modified = content;

  const map = [
    // Border Radius
    { from: /borderRadius:\s*4\b/g, to: "borderRadius: 'var(--radius-sm)'" },
    { from: /borderRadius:\s*6\b/g, to: "borderRadius: 'var(--radius-sm)'" },
    { from: /borderRadius:\s*7\b/g, to: "borderRadius: 'var(--radius-md)'" },
    { from: /borderRadius:\s*8\b/g, to: "borderRadius: 'var(--radius-md)'" },
    { from: /borderRadius:\s*11\b/g, to: "borderRadius: 'var(--radius-lg)'" },
    { from: /borderRadius:\s*12\b/g, to: "borderRadius: 'var(--radius-lg)'" },
    { from: /borderRadius:\s*14\b/g, to: "borderRadius: 'var(--radius-lg)'" },
    { from: /borderRadius:\s*16\b/g, to: "borderRadius: 'var(--radius-xl)'" },
    
    // String Border Radius
    { from: /border-radius:\s*4px/g, to: "border-radius: var(--radius-sm)" },
    { from: /border-radius:\s*8px/g, to: "border-radius: var(--radius-md)" },
    { from: /border-radius:\s*12px/g, to: "border-radius: var(--radius-lg)" },
    { from: /border-radius:\s*14px/g, to: "border-radius: var(--radius-lg)" },
    { from: /border-radius:\s*16px/g, to: "border-radius: var(--radius-xl)" },
    
    // Margin & Padding Strings
    { from: /padding:\s*'2px 4px'/g, to: "padding: 'var(--space-1) var(--space-2)'" },
    { from: /padding:\s*'2px 6px'/g, to: "padding: 'var(--space-1) var(--space-2)'" },
    { from: /padding:\s*'6px 2px'/g, to: "padding: 'var(--space-2) var(--space-1)'" },
    { from: /padding:\s*'8px 0'/g, to: "padding: 'var(--space-2) 0'" },
    { from: /padding:\s*'8px 18px'/g, to: "padding: 'var(--space-2) var(--space-5)'" },
    { from: /padding:\s*'9px 12px'/g, to: "padding: 'var(--space-2) var(--space-3)'" },
    { from: /padding:\s*'9px 13px'/g, to: "padding: 'var(--space-2) var(--space-3)'" },
    { from: /padding:\s*'10px 14px'/g, to: "padding: 'var(--space-3) var(--space-4)'" },
    { from: /padding:\s*'12px 12px'/g, to: "padding: 'var(--space-3)'" },
    { from: /padding:\s*'14px 14px 10px'/g, to: "padding: 'var(--space-4) var(--space-4) var(--space-3)'" },
    { from: /padding:\s*'16px 18px 20px'/g, to: "padding: 'var(--space-4) var(--space-5) var(--space-5)'" },
    { from: /padding:\s*'16px 24px'/g, to: "padding: 'var(--space-4) var(--space-6)'" },
    { from: /padding:\s*'20px 20px 16px'/g, to: "padding: 'var(--space-5) var(--space-5) var(--space-4)'" },
    { from: /padding:\s*'20px 24px'/g, to: "padding: 'var(--space-5) var(--space-6)'" },
    { from: /padding:\s*'24px'/g, to: "padding: 'var(--space-6)'" },
    
    // Numeric Margin & Padding
    { from: /gap:\s*4\b/g, to: "gap: 'var(--space-1)'" },
    { from: /gap:\s*5\b/g, to: "gap: 'var(--space-1)'" },
    { from: /gap:\s*6\b/g, to: "gap: 'var(--space-2)'" },
    { from: /gap:\s*7\b/g, to: "gap: 'var(--space-2)'" },
    { from: /gap:\s*8\b/g, to: "gap: 'var(--space-2)'" },
    { from: /gap:\s*10\b/g, to: "gap: 'var(--space-3)'" },
    { from: /gap:\s*11\b/g, to: "gap: 'var(--space-3)'" },
    { from: /gap:\s*12\b/g, to: "gap: 'var(--space-3)'" },
    { from: /gap:\s*14\b/g, to: "gap: 'var(--space-4)'" },
    { from: /gap:\s*16\b/g, to: "gap: 'var(--space-4)'" },
    { from: /gap:\s*18\b/g, to: "gap: 'var(--space-5)'" },
    { from: /gap:\s*20\b/g, to: "gap: 'var(--space-5)'" },
    
    { from: /padding:\s*14\b/g, to: "padding: 'var(--space-4)'" },
    { from: /padding:\s*20\b/g, to: "padding: 'var(--space-5)'" },
    { from: /marginBottom:\s*9\b/g, to: "marginBottom: 'var(--space-2)'" },
    { from: /marginBottom:\s*18\b/g, to: "marginBottom: 'var(--space-5)'" },
    { from: /marginLeft:\s*6\b/g, to: "marginLeft: 'var(--space-2)'" },
  ];

  map.forEach(r => {
    modified = modified.replace(r.from, r.to);
  });

  return modified;
}

const filesToRefactor = [
  'components/Navbar.js',
  'components/HeroSearchBar.js',
  'components/SideDrawer.js'
];

filesToRefactor.forEach(relPath => {
  const fullPath = path.join(__dirname, relPath);
  if (fs.existsSync(fullPath)) {
    const original = fs.readFileSync(fullPath, 'utf8');
    const updated = replaceSpacingAndRadius(original);
    fs.writeFileSync(fullPath, updated);
    console.log('Updated spacing in ' + relPath);
  }
});
