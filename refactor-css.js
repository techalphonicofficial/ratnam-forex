const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'app/globals.css');
let content = fs.readFileSync(cssPath, 'utf8');

const lines = content.split('\n');
const header = lines.slice(0, 151).join('\n');
let rest = lines.slice(151).join('\n');

// 1. Spacing Maps (Padding, Margin, Gap, Top, Bottom, Left, Right)
const spaceMap = {
  '4px': 'var(--space-1)',
  '8px': 'var(--space-2)',
  '12px': 'var(--space-3)',
  '16px': 'var(--space-4)',
  '20px': 'var(--space-5)',
  '24px': 'var(--space-6)',
  '32px': 'var(--space-8)',
  '40px': 'var(--space-10)',
  '48px': 'var(--space-12)',
  '64px': 'var(--space-16)',
  '80px': 'var(--space-20)',
  '96px': 'var(--space-24)',
};

// 2. Radius Maps
const radiusMap = {
  '8px': 'var(--radius-sm)',
  '12px': 'var(--radius-md)',
  '16px': 'var(--radius-lg)',
  '20px': 'var(--radius-xl)',
  '28px': 'var(--radius-2xl)',
  '50%': 'var(--radius-full)',
  '999px': 'var(--radius-full)',
  '9999px': 'var(--radius-full)'
};

// We will do a generic replacement for specific properties.
// For margin, padding, gap:
['margin', 'padding', 'gap', 'margin-top', 'margin-bottom', 'margin-left', 'margin-right', 'padding-top', 'padding-bottom', 'padding-left', 'padding-right', 'top', 'bottom', 'left', 'right'].forEach(prop => {
  const regex = new RegExp(`(${prop}:\\s*)([^;]+)(;)`, 'g');
  rest = rest.replace(regex, (match, p1, p2, p3) => {
    let newVal = p2;
    for (const [px, vr] of Object.entries(spaceMap)) {
      // replace exact word matches for pixel values
      const pxRegex = new RegExp(`\\b${px}\\b`, 'g');
      newVal = newVal.replace(pxRegex, vr);
    }
    return p1 + newVal + p3;
  });
});

// For border-radius:
['border-radius'].forEach(prop => {
  const regex = new RegExp(`(${prop}:\\s*)([^;]+)(;)`, 'g');
  rest = rest.replace(regex, (match, p1, p2, p3) => {
    let newVal = p2;
    for (const [px, vr] of Object.entries(radiusMap)) {
      const pxRegex = new RegExp(`\\b${px}\\b(?!\\()`, 'g');
      // replace 50% only if it stands alone or part of a list
      if(px === '50%') newVal = newVal.replace(/50%/g, vr);
      else newVal = newVal.replace(pxRegex, vr);
    }
    return p1 + newVal + p3;
  });
});

// For box-shadow:
const shadowMap = [
  { from: /0 8px 24px rgba\(163, 198, 68, 0\.28\)/g, to: 'var(--shadow-sm)' },
  { from: /0 16px 36px rgba\(163, 198, 68, 0\.35\)/g, to: 'var(--shadow-md)' },
  { from: /0 6px 18px rgba\(163, 198, 68, 0\.25\)/g, to: 'var(--shadow-sm)' },
  { from: /0 2px 30px rgba\(0, 0, 0, 0\.3\)/g, to: 'var(--shadow-md)' },
  { from: /0 20px 60px rgba\(0, 0, 0, 0\.3\)/g, to: 'var(--shadow-lg)' },
  { from: /0 2px 8px rgba\(0, 82, 204, 0\.4\)/g, to: 'var(--shadow-sm)' },
  { from: /0 0 0 4px rgba\(163, 198, 68, 0\.25\)/g, to: '0 0 0 4px var(--color-primary-light)' },
  { from: /0 0 0 3px rgba\(0, 82, 204, 0\.15\)/g, to: '0 0 0 3px var(--color-primary-light)' },
  { from: /0 0 0 4px rgba\(0, 82, 204, 0\.2\)/g, to: '0 0 0 4px var(--color-primary-light)' },
  { from: /0 0 0 4px rgba\(239, 68, 68, 0\.12\)/g, to: 'var(--shadow-sm)' },
];

shadowMap.forEach(s => {
  rest = rest.replace(s.from, s.to);
});

// specific hardcoded colors and backgrounds
const colorMap = [
  { from: /background:\s*#fff(fff)?(;|\b)/gi, to: 'background: var(--color-card)$2' },
  { from: /background:\s*#0a0f1e(;|\b)/gi, to: 'background: var(--color-background)$1' },
  { from: /background:\s*#0B3C5D(;|\b)/gi, to: 'background: var(--color-primary)$1' },
  { from: /background:\s*#8EB69B(;|\b)/gi, to: 'background: var(--color-primary)$1' },
  { from: /border-color:\s*#8EB69B(;|\b)/gi, to: 'border-color: var(--color-primary)$1' },
  { from: /border:\s*1px solid #8EB69B(;|\b)/gi, to: 'border: 1px solid var(--color-primary)$1' },
  { from: /color:\s*#344054(;|\b)/gi, to: 'color: var(--color-text)$1' },
  { from: /background:\s*#fff0f0(;|\b)/gi, to: 'background: var(--color-secondary-hover)$1' },
  { from: /color:\s*#374151(;|\b)/gi, to: 'color: var(--color-text)$1' },
  { from: /border:\s*1px solid #fecaca(;|\b)/gi, to: 'border: 1px solid var(--color-secondary)$1' },
  { from: /background:\s*#ef4444(;|\b)/gi, to: 'background: var(--color-secondary)$1' },
  { from: /color:\s*#D4AF37(;|\b)/gi, to: 'color: var(--color-secondary)$1' },
  { from: /background:\s*rgba\(212,175,55,\.15\)(;|\b)/gi, to: 'background: var(--color-secondary-hover)$1' },
  { from: /background:\s*rgba\(255, 152, 0, 0\.12\)(;|\b)/gi, to: 'background: var(--color-secondary-hover)$1' },
  { from: /color:\s*#f57c00(;|\b)/gi, to: 'color: var(--color-secondary)$1' },
  { from: /background:\s*rgba\(229, 57, 53, 0\.12\)(;|\b)/gi, to: 'background: var(--color-secondary-hover)$1' },
  { from: /color:\s*#d32f2f(;|\b)/gi, to: 'color: var(--color-secondary)$1' },
  { from: /background:\s*#ffffff(;|\b)/gi, to: 'background: var(--color-background)$1' },
  { from: /border:\s*1px solid #e5e7eb(;|\b)/gi, to: 'border: 1px solid var(--color-border)$1' },
  { from: /#D9E7B3(;|\b)/g, to: 'var(--color-primary-light)$1' },
  { from: /#8A8A8A(;|\b)/g, to: 'var(--color-text-muted)$1' },
  
  // Transitions
  { from: /transition:\s*all 300ms ease(;|\b)/gi, to: 'transition: all var(--transition-base)$1' },
  { from: /transition:\s*transform 300ms ease(;|\b)/gi, to: 'transition: transform var(--transition-base)$1' },
  { from: /0\.6s ease/gi, to: 'var(--transition-slow)' },
  { from: /0\.3s cubic-bezier\(0\.34,\s*1\.56,\s*0\.64,\s*1\)/gi, to: 'var(--transition-slow)' },
  { from: /0\.2s ease/gi, to: 'var(--transition-fast)' },
  
  // Linear Gradients
  { from: /linear-gradient\(135deg,\s*#A3C644 0%,\s*#8DB133 100%\)/g, to: 'var(--gradient-primary)' },
  { from: /linear-gradient\(135deg,\s*#8DB133 0%,\s*#7EA42D 100%\)/g, to: 'var(--gradient-primary)' }, 
  { from: /linear-gradient\(\s*135deg,\s*rgba\(11,60,93,\.82\) 0%,\s*rgba\(11,60,93,\.55\) 55%,\s*rgba\(0,0,0,\.55\) 100%\)/gi, to: 'var(--gradient-hero)' },
  { from: /linear-gradient\(135deg,#0B3C5D 0%,#164D73 100%\)/gi, to: 'var(--gradient-primary)' },
  { from: /linear-gradient\(\s*135deg,\s*#0B3C5D 0%,\s*#164D73 60%,\s*#D9534F 100%\)/gi, to: 'var(--gradient-primary)' },
];

colorMap.forEach(c => {
  rest = rest.replace(c.from, c.to);
});

fs.writeFileSync(cssPath, header + '\n' + rest);
console.log('Successfully updated globals.css');
