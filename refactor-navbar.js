const fs = require('fs');
const path = require('path');

function replaceColors(content) {
  let modified = content;

  const colorMap = [
    // Primary shades
    { from: /#A3C644/gi, to: 'var(--color-primary)' },
    { from: /#8DB133/gi, to: 'var(--color-primary-hover)' },
    { from: /#7EA42D/gi, to: 'var(--color-primary-hover)' },
    
    // Gradients
    { from: /linear-gradient\(135deg,\s*var\(--color-primary\)\s*0%,\s*var\(--color-primary-hover\)\s*100%\)/gi, to: 'var(--gradient-primary)' },
    
    // Text and backgrounds
    { from: /#0f172a/gi, to: 'var(--color-text-primary)' },
    { from: /#111827/gi, to: 'var(--color-text-primary)' },
    { from: /#1f2937/gi, to: 'var(--color-text-primary)' },
    { from: /#334155/gi, to: 'var(--color-text-secondary)' },
    { from: /#374151/gi, to: 'var(--color-text-secondary)' },
    { from: /#475569/gi, to: 'var(--color-text-secondary)' },
    { from: /#4b5563/gi, to: 'var(--color-text-muted)' },
    { from: /#64748b/gi, to: 'var(--color-text-muted)' },
    { from: /#6b7280/gi, to: 'var(--color-text-muted)' },
    { from: /#94a3b8/gi, to: 'var(--color-text-muted)' },

    { from: /#f9fafb/gi, to: 'var(--color-bg)' },
    { from: /#f8fafc/gi, to: 'var(--color-bg-soft)' },
    { from: /#f1f5f9/gi, to: 'var(--color-bg-soft)' },
    { from: /#f8fbff/gi, to: 'var(--color-bg-soft)' },
    { from: /#fcfcfc/gi, to: 'var(--color-bg-soft)' },
    { from: /#FBF9F6/gi, to: 'var(--color-background)' }, // Used in navbar wrapper background

    // Borders
    { from: /#f0f0f0/gi, to: 'var(--color-border)' },
    { from: /#f3f4f6/gi, to: 'var(--color-border)' },
    { from: /#edf2f7/gi, to: 'var(--color-border)' },
    { from: /#e2e8f0/gi, to: 'var(--color-border)' },
    { from: /#eef2f7/gi, to: 'var(--color-border)' },
    { from: /#d1d5db/gi, to: 'var(--color-border)' },
    { from: /#e5e7eb/gi, to: 'var(--color-border)' },
    { from: /#d8dee8/gi, to: 'var(--color-border)' },
    { from: /#edf1f5/gi, to: 'var(--color-border)' },
    { from: /#dbe5ef/gi, to: 'var(--color-border)' },
    { from: /#cfd9e6/gi, to: 'var(--color-border)' },

    // Primary Light / Custom Tints
    { from: /#fff9f2/gi, to: 'var(--color-primary-light)' },
    { from: /#F2F8D9/gi, to: 'var(--color-primary-light)' },

    // Tag colors
    { from: /#ef4444/gi, to: 'var(--color-secondary)' }, // Red
    { from: /#fef2f2/gi, to: 'var(--color-secondary-hover)' }, // Red bg
    { from: /#ec4899/gi, to: 'var(--color-secondary)' }, // Pink
    { from: /#fdf2f8/gi, to: 'var(--color-secondary-hover)' }, // Pink bg
    { from: /#f59e0b/gi, to: 'var(--color-secondary)' }, // Orange
    { from: /#fffbeb/gi, to: 'var(--color-secondary-hover)' }, // Orange bg
    { from: /#8b5cf6/gi, to: 'var(--color-secondary)' }, // Purple
    { from: /#f5f3ff/gi, to: 'var(--color-secondary-hover)' }, // Purple bg
    { from: /#0ea5e9/gi, to: 'var(--color-secondary)' }, // Blue
    { from: /#f0f9ff/gi, to: 'var(--color-secondary-hover)' }, // Blue bg
    { from: /#e0f2fe/gi, to: 'var(--color-secondary-hover)' },
    { from: /#dc2626/gi, to: 'var(--color-secondary)' }, // Red text
    { from: /#fff1f2/gi, to: 'var(--color-secondary-hover)' },
    { from: /#fecdd3/gi, to: 'var(--color-border)' },

    // Modals & Forexs
    { from: /#0369a1/gi, to: 'var(--color-secondary)' },
    { from: /#ecfeff/gi, to: 'var(--color-secondary-hover)' },
    { from: /#eff6ff/gi, to: 'var(--color-secondary-hover)' },
    { from: /#075985/gi, to: 'var(--color-text-primary)' },
    { from: /#bae6fd/gi, to: 'var(--color-border)' },
    { from: /#fed7aa/gi, to: 'var(--color-border)' },
    { from: /#fff7ed/gi, to: 'var(--color-secondary-hover)' },
    { from: /#9a3412/gi, to: 'var(--color-secondary)' },
    { from: /#bfe7d9/gi, to: 'var(--color-border)' },
    { from: /#effdf7/gi, to: 'var(--color-secondary-hover)' },
    { from: /#14532d/gi, to: 'var(--color-text-primary)' },
    { from: /#bbf7d0/gi, to: 'var(--color-border)' },
    { from: /#f7fee7/gi, to: 'var(--color-secondary-hover)' },
    { from: /#4d7c0f/gi, to: 'var(--color-text-secondary)' },
    { from: /#166534/gi, to: 'var(--color-text-primary)' },

    // Transitions
    { from: /'all 0\.3s ease'/gi, to: "'all var(--transition-base)'" },
    { from: /'all 0\.2s'/gi, to: "'all var(--transition-base)'" },
    { from: /'transform 0\.4s cubic-bezier\(0\.16, 1, 0\.3, 1\)'/gi, to: "'transform var(--transition-slow)'" },
    { from: /'transform 0\.3s ease'/gi, to: "'transform var(--transition-base)'" },
    { from: /'transform 0\.25s'/gi, to: "'transform var(--transition-fast)'" },
    { from: /'color 0\.2s'/gi, to: "'color var(--transition-base)'" },
    { from: /'color 0\.15s'/gi, to: "'color var(--transition-fast)'" },
    { from: /'color 0\.2s, background 0\.2s, border-color 0\.2s'/gi, to: "'all var(--transition-base)'" },
    
    // Shadows
    { from: /'0 8px 40px rgba\(0,0,0,0\.18\), 0 2px 8px rgba\(0,0,0,0\.08\)'/g, to: "'var(--shadow-md)'" },
    { from: /'0 4px 12px rgba\(15,23,42,0\.035\)'/g, to: "'var(--shadow-sm)'" },
    { from: /'-18px 0 50px rgba\(15,23,42,0\.22\)'/g, to: "'-18px 0 50px rgba(15,23,42,0.22)'" }, // Keep special side drawer shadow
    { from: /'0 10px 30px rgba\(0,0,0,0\.08\)'/g, to: "'var(--shadow-md)'" },
    
    // Inline string fix (sometimes the #color is part of a string inside React style={})
    { from: /'#ffffff'/gi, to: "'var(--color-card)'" }, // Only if explicitly string. If in CSS, it's #fff.
  ];

  colorMap.forEach(r => {
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
    const updated = replaceColors(original);
    fs.writeFileSync(fullPath, updated);
    console.log('Updated ' + relPath);
  }
});
