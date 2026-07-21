const fs = require('fs');
const path = require('path');

function refactorForms(content) {
  let modified = content;

  const map = [
    // Colors & Hex
    { from: /#fbbf24/gi, to: 'var(--color-secondary)' },
    { from: /#f3f4f6/gi, to: 'var(--color-bg-soft)' },
    { from: /#e5e7eb/gi, to: 'var(--color-border)' },
    { from: /#ffffff/gi, to: 'var(--color-card)' },
    { from: /'white'/gi, to: "'var(--color-card)'" },
    { from: /#0B3C5D/gi, to: 'var(--color-text-primary)' },
    { from: /#D9534F/gi, to: 'var(--color-primary)' },
    { from: /#6b7280/gi, to: 'var(--color-text-muted)' },
    { from: /#E03C42/gi, to: 'var(--color-primary)' },
    { from: /#374151/gi, to: 'var(--color-text-primary)' },
    { from: /#4b5563/gi, to: 'var(--color-text-muted)' },
    { from: /#f9fafb/gi, to: 'var(--color-bg-soft)' },
    { from: /#1f2937/gi, to: 'var(--color-text-primary)' },
    { from: /#9ca3af/gi, to: 'var(--color-text-muted)' },
    { from: /#fff/gi, to: 'var(--color-card)' },
    { from: /#16a34a/gi, to: 'var(--color-primary)' }, 
    { from: /#dc2626/gi, to: 'var(--color-secondary)' }, 
    { from: /#0f766e/gi, to: 'var(--color-primary)' },
    { from: /#b91c1c/gi, to: 'var(--color-secondary)' },
    { from: /#0f172a/gi, to: 'var(--color-text-primary)' },
    { from: /#f8fafc/gi, to: 'var(--color-bg-soft)' },
    { from: /#64748b/gi, to: 'var(--color-text-muted)' },
    { from: /#334155/gi, to: 'var(--color-text-primary)' },
    { from: /#e2e8f0/gi, to: 'var(--color-border)' },
    { from: /#f1f5f9/gi, to: 'var(--color-border)' },
    { from: /#fee2e2/gi, to: 'var(--color-secondary-hover)' },
    { from: /#ef4444/gi, to: 'var(--color-secondary)' },
    { from: /#94a3b8/gi, to: 'var(--color-text-muted)' },
    { from: /#10b981/gi, to: 'var(--color-primary)' },
    { from: /#111827/gi, to: 'var(--color-text-primary)' },
    { from: /#f59e0b/gi, to: 'var(--color-secondary)' },
    { from: /#e11d48/gi, to: 'var(--color-primary)' },
    { from: /#ffebf0/gi, to: 'var(--color-primary-light)' },
    
    // Gradients
    { from: /rgba\(224,\s*60,\s*66,\s*0\.1\)/g, to: 'color-mix(in srgb, var(--color-primary) 10%, transparent)' },
    { from: /rgba\(16,\s*185,\s*129,\s*0\.08\)/g, to: 'color-mix(in srgb, var(--color-primary) 8%, transparent)' },
    { from: /#dbeafe 0%, #ecfeff 52%, #f8fafc 100%/g, to: 'var(--color-primary-light) 0%, var(--color-bg-soft) 100%' },

    // Shadows
    { from: /0 40px 100px -10px rgba\(0,0,0,0\.5\)/g, to: 'var(--shadow-xl)' },
    { from: /0 10px 25px -5px rgba\(0, 0, 0, 0\.1\)/g, to: 'var(--shadow-md)' },
    { from: /0 10px 25px rgba\(0,0,0,0\.15\)/g, to: 'var(--shadow-md)' },
    { from: /0 8px 40px rgba\(0,0,0,0\.2\)/g, to: 'var(--shadow-lg)' },
    { from: /0 24px 80px rgba\(15, 23, 42, 0\.28\)/g, to: 'var(--shadow-xl)' },
    { from: /0 10px 40px rgba\(0,0,0,0\.08\)/g, to: 'var(--shadow-md)' },
    { from: /0 4px 12px rgba\(16,185,129,0\.08\)/g, to: 'var(--shadow-sm)' },
    { from: /0 30px 60px rgba\(0,0,0,0\.3\)/g, to: 'var(--shadow-xl)' },
    { from: /0 20px 40px rgba\(0,0,0,0\.15\)/g, to: 'var(--shadow-lg)' },
    { from: /0 20px 40px rgba\(15, 23, 42, 0\.08\)/g, to: 'var(--shadow-md)' },

    // Radii
    { from: /borderRadius:\s*'20px'/g, to: "borderRadius: 'var(--radius-2xl)'" },
    { from: /border-radius:\s*20px/g, to: "border-radius: var(--radius-2xl)" },
    { from: /borderRadius:\s*'12px'/g, to: "borderRadius: 'var(--radius-xl)'" },
    { from: /border-radius:\s*12px/g, to: "border-radius: var(--radius-xl)" },
    { from: /borderRadius:\s*'8px'/g, to: "borderRadius: 'var(--radius-md)'" },
    { from: /border-radius:\s*8px/g, to: "border-radius: var(--radius-md)" },
    { from: /border-radius:\s*16px/g, to: "border-radius: var(--radius-2xl)" },
    { from: /border-radius:\s*50px/g, to: "border-radius: var(--radius-full)" },
    { from: /borderRadius:\s*'50px'/g, to: "borderRadius: 'var(--radius-full)'" },

    // Spacings & Paddings
    { from: /padding:\s*40px 30px/g, to: "padding: var(--space-8) var(--space-7)" },
    { from: /padding:\s*40px 48px/g, to: "padding: var(--space-8) var(--space-8)" },
    { from: /padding:\s*40px 32px/g, to: "padding: var(--space-8) var(--space-7)" },
    { from: /padding:\s*40px 24px 30px 24px/g, to: "padding: var(--space-8) var(--space-6) var(--space-7) var(--space-6)" },
    { from: /padding:\s*24px/g, to: "padding: var(--space-6)" },
    { from: /padding:\s*14px 16px 14px 44px/g, to: "padding: var(--space-3) var(--space-4) var(--space-3) 44px" },
    { from: /padding-top:\s*20px/g, to: "padding-top: var(--space-5)" },
    { from: /padding:\s*8\b/g, to: "padding: 'var(--space-2)'" },
    { from: /padding:\s*'10px 16px'/g, to: "padding: 'var(--space-2) var(--space-4)'" },
    { from: /padding:\s*18px/g, to: "padding: var(--space-5)" },
    { from: /padding:\s*26px/g, to: "padding: var(--space-6)" },
    { from: /padding:\s*11px 12px/g, to: "padding: var(--space-3)" },
    { from: /padding:\s*'40px 0 60px'/g, to: "padding: 'var(--space-8) 0 var(--space-10)'" },
    { from: /padding:\s*'18px 24px 18px 60px'/g, to: "padding: 'var(--space-4) var(--space-6) var(--space-4) 60px'" },
    { from: /padding:\s*'60px 0 50px'/g, to: "padding: 'var(--space-10) 0 var(--space-9)'" },
    { from: /padding:\s*'40px 24px'/g, to: "padding: 'var(--space-8) var(--space-6)'" },
    
    // Margins and Gaps
    { from: /margin-bottom:\s*24px/g, to: "margin-bottom: var(--space-6)" },
    { from: /margin-bottom:\s*16px/g, to: "margin-bottom: var(--space-4)" },
    { from: /marginBottom:\s*12\b/g, to: "marginBottom: 'var(--space-3)'" },
    { from: /marginBottom:\s*24\b/g, to: "marginBottom: 'var(--space-6)'" },
    { from: /gap:\s*12\b/g, to: "gap: 'var(--space-3)'" }
  ];

  map.forEach(r => {
    modified = modified.replace(r.from, r.to);
  });

  return modified;
}

const filesToRefactor = [
  'components/GlobalInquiryModal.js',
  'components/NewsletterForm.js',
  'components/BookingSidebar.js',
  'components/DestinationPicker.js'
];

filesToRefactor.forEach(relPath => {
  const fullPath = path.join(__dirname, relPath);
  if (fs.existsSync(fullPath)) {
    const original = fs.readFileSync(fullPath, 'utf8');
    const updated = refactorForms(original);
    fs.writeFileSync(fullPath, updated);
    console.log('Updated ' + relPath);
  }
});
