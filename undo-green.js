const fs = require('fs');

function revertTours() {
  const f = 'app/tours/page.js';
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/filters\.minRating === r \? 'var\(--color-primary\)' : 'var\(--color-border\)'/g, "filters.minRating === r ? '#8EB69B' : 'var(--color-border)'");
  c = c.replace(/filters\.minRating === r \? 'var\(--color-primary\)' : 'transparent'/g, "filters.minRating === r ? '#8EB69B' : 'transparent'");
  c = c.replace(/filters\.minRating === r \? 'var\(--color-card\)' : 'var\(--color-text-muted\)'/g, "filters.minRating === r ? '#FFFFFF' : 'var(--color-text-muted)'");
  fs.writeFileSync(f, c);
}

function revertPackages() {
  const f = 'app/packages/PackagesClient.js';
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/priceFilter === f\.key \? '2px solid var\(--color-primary\)' : '1\.5px solid #d1d5db'/g, "priceFilter === f.key ? '2px solid #8EB69B' : '1.5px solid #d1d5db'");
  c = c.replace(/priceFilter === f\.key \? 'var\(--color-primary\)' : 'white'/g, "priceFilter === f.key ? '#8EB69B' : 'white'");
  c = c.replace(/priceFilter === f\.key \? 'var\(--color-card\)' : '#374151'/g, "priceFilter === f.key ? '#FFFFFF' : '#374151'");
  
  c = c.replace(/background:\s*'var\(--color-primary\)',\s*color:\s*'var\(--color-card\)',\s*border:\s*'1px solid var\(--color-primary\)'/g, "background: '#8EB69B',\n                    color: '#FFFFFF',\n                    border: '1px solid #8EB69B'");
  
  c = c.replace(/background:\s*'var\(--color-primary\)', border:\s*'1px solid var\(--color-primary\)',\s*color:\s*'var\(--color-card\)'/g, "background: '#8EB69B', border: '1px solid #8EB69B',\n              color: '#FFFFFF'");
  fs.writeFileSync(f, c);
}

function revertCollections() {
  const f = 'app/collections/[slug]/page.js';
  if (fs.existsSync(f)) {
    let c = fs.readFileSync(f, 'utf8');
    c = c.replace(/background:\s*'var\(--color-primary\)', border:\s*'1px solid var\(--color-primary\)',\s*color:\s*'var\(--color-card\)'/g, "background: '#8EB69B', border: '1px solid #8EB69B',\n              color: '#FFFFFF'");
    fs.writeFileSync(f, c);
  }
}

function revertWhite() {
  const files = [
    'app/auth/login/page.js',
    'app/auth/register/page.js',
    'app/blog/[slug]/page.js',
    'app/customize/page.js',
    'app/global-error.js',
    'app/layout.js'
  ];
  for (const f of files) {
    if (fs.existsSync(f)) {
      let c = fs.readFileSync(f, 'utf8');
      c = c.replace(/var\(--color-card\)/g, '#ffffff');
      fs.writeFileSync(f, c);
    }
  }
}

try {
  revertTours();
  revertPackages();
  revertCollections();
  revertWhite();
  console.log('Reverted all changes');
} catch (e) {
  console.error(e);
}
