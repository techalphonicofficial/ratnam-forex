const fs = require('fs');
const path = require('path');

function refactorCards(content) {
  let modified = content;

  const map = [
    // Hex colors
    { from: /#000/g, to: "var(--color-text-primary)" }, // Used in photo wrap bg
    { from: /#fff/g, to: "var(--color-card)" }, 
    { from: /#FFFFFF/g, to: "var(--color-card)" },
    { from: /#A3C644/gi, to: "var(--color-primary)" },
    { from: /#F2F8D9/gi, to: "var(--color-primary-light)" },
    { from: /'rgba\(255,87,34,0\.9\)'/g, to: "'var(--color-secondary)'" },
    
    // Shadows
    { from: /0 8px 24px rgba\(0,0,0,0\.06\)/g, to: "var(--shadow-md)" },
    { from: /0 20px 40px rgba\(0,0,0,0\.15\)/g, to: "var(--shadow-lg)" },
    { from: /0 4px 12px rgba\(0,0,0,0\.15\)/g, to: "var(--shadow-sm)" },
    
    // Transitions
    { from: /transform 0\.4s cubic-bezier\(0\.4, 0, 0\.2, 1\)/g, to: "transform var(--transition-slow)" },
    { from: /border-color 0\.4s ease, box-shadow 0\.5s ease/g, to: "border-color var(--transition-slow), box-shadow var(--transition-slow)" },
    { from: /opacity 0\.4s ease/g, to: "opacity var(--transition-slow)" },
    { from: /transform 0\.3s cubic-bezier\(0\.34, 1\.56, 0\.64, 1\), background 0\.3s ease/g, to: "all var(--transition-base)" },
    { from: /color 0\.3s ease/g, to: "color var(--transition-base)" },
    { from: /'all 0\.3s ease'/g, to: "'all var(--transition-base)'" },
    
    // Spacings in React Style Objects
    { from: /padding:\s*'20px'/g, to: "padding: 'var(--space-5)'" },
    { from: /marginBottom:\s*4\b/g, to: "marginBottom: 'var(--space-1)'" },
    { from: /marginBottom:\s*8\b/g, to: "marginBottom: 'var(--space-2)'" },
    { from: /marginTop:\s*4\b/g, to: "marginTop: 'var(--space-1)'" },
    { from: /gap:\s*4\b/g, to: "gap: 'var(--space-1)'" },
    { from: /gap:\s*8\b/g, to: "gap: 'var(--space-2)'" },
    
    // Spacings in styled-jsx (CategoryCard.js)
    { from: /margin-bottom:\s*30px/g, to: "margin-bottom: var(--space-7)" },
    { from: /margin-bottom:\s*24px/g, to: "margin-bottom: var(--space-6)" },
    { from: /padding-bottom:\s*40px/g, to: "padding-bottom: var(--space-8)" },
    { from: /padding-bottom:\s*30px/g, to: "padding-bottom: var(--space-7)" },
    { from: /padding:\s*6px/g, to: "padding: var(--space-2)" },
    { from: /padding:\s*4px/g, to: "padding: var(--space-1)" },
    { from: /padding:\s*0 10px/g, to: "padding: 0 var(--space-3)" },
    { from: /bottom:\s*-22px/g, to: "bottom: -22px" }, // Hardcoded offset, keeping it safe
    { from: /bottom:\s*-18px/g, to: "bottom: -18px" }, // Hardcoded offset, keeping it safe
  ];

  map.forEach(r => {
    modified = modified.replace(r.from, r.to);
  });

  return modified;
}

const filesToRefactor = [
  'components/TourCard.js',
  'components/CategoryCard.js',
  'components/DestinationCard.js',
  'components/ReviewCard.js',
  'components/TeamCard.js'
];

filesToRefactor.forEach(relPath => {
  const fullPath = path.join(__dirname, relPath);
  if (fs.existsSync(fullPath)) {
    const original = fs.readFileSync(fullPath, 'utf8');
    const updated = refactorCards(original);
    fs.writeFileSync(fullPath, updated);
    console.log('Updated ' + relPath);
  }
});
