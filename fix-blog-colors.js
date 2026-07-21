const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'app', 'blog', 'page.js');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/#f8fafc/g, 'var(--color-bg)');
content = content.replace(/background:\s*'#111827'/g, "background: 'var(--color-text-primary)'");
content = content.replace(/color:\s*'#d1d5db'/g, "color: 'rgba(255,255,255,0.7)'");
content = content.replace(/#64748b/g, 'var(--color-text-muted)');
content = content.replace(/#10b981/g, 'var(--color-primary)');
content = content.replace(/background:\s*'white'/g, "background: 'var(--color-card)'");
content = content.replace(/background:\s*white;/g, "background: var(--color-card);");
content = content.replace(/#cbd5e1/g, 'var(--color-border)');
content = content.replace(/#374151/g, 'var(--color-text-secondary)');
content = content.replace(/#111827/g, 'var(--color-text-primary)');
content = content.replace(/#4b5563/g, 'var(--color-text-muted)');
content = content.replace(/#6b7280/g, 'var(--color-text-muted)');
content = content.replace(/#f3f4f6/g, 'var(--color-border)');
content = content.replace(/#d1d5db/g, 'var(--color-border)');
content = content.replace(/#e5e7eb/g, 'var(--color-border)');
content = content.replace(/rgba\(16,185,129,0\.3\)/g, 'color-mix(in srgb, var(--color-primary) 30%, transparent)');

fs.writeFileSync(file, content);
console.log('Done refactoring app/blog/page.js');
