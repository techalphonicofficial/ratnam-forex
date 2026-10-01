const fs = require('fs');

const filePath = 'c:\\Users\\Techalphonic\\Downloads\\ratnam-forex-master\\ratnam-forex-master\\components\\PremiumDestinationLayout.js';
let content = fs.readFileSync(filePath, 'utf-8');

// 1. typingPhrases
content = content.replace(
  "    if (themeType === 'nri') {",
  "    if (themeType === 'corporate') {\n      return [\n        pkg?.name || 'Corporate Package',\n        'Seamless business travel, greater success',\n        'Professional trips, perfectly planned'\n      ];\n    }\n    if (themeType === 'nri') {"
);

// 2. typing cursor color for corporate
content = content.replace(
  "              {themeType === 'pilgrim' && typedText === 'Path of faith, journey of peace' ? (",
  "              {themeType === 'corporate' && typedText === 'Seamless business travel, greater success' ? (\n                typedText.split(/(greater success)/gi).map((part, i) =>\n                  (part.toLowerCase() === 'greater success') ?\n                    <span key={i} style={{ color: '#1E5AA8' }}>{part}</span> : part\n                )\n              ) : themeType === 'pilgrim' && typedText === 'Path of faith, journey of peace' ? ("
);


// 3. carouselImages
content = content.replace(
  "    const defaultImages = themeType === 'pilgrim' ? [",
  "    const defaultImages = themeType === 'corporate' ? [\n      'https://images.unsplash.com/photo-1556761175-5973dc0f32d7?auto=format&fit=crop&w=800&q=80',\n      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80',\n      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80'\n    ] : themeType === 'pilgrim' ? ["
);

// 4. heroImage
content = content.replace(
  "  const heroImage = media?.images?.[0]?.url || (themeType === 'pilgrim' ? 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=2000&q=80' : (themeType === 'budget' ?",
  "  const heroImage = media?.images?.[0]?.url || (themeType === 'corporate' ? 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2000&q=80' : (themeType === 'pilgrim' ? 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=2000&q=80' : (themeType === 'budget' ?"
);

// 5. CSS variables
content = content.replace(
  "      '--theme-bg': themeType === 'nri' ? '#FFFCF5'",
  "      '--theme-bg': themeType === 'corporate' ? '#F7FAFF' : (themeType === 'nri' ? '#FFFCF5'"
).replace(
  "      '--theme-primary': themeType === 'nri' ? '#1759A6'",
  "      '--theme-primary': themeType === 'corporate' ? '#1E5AA8' : (themeType === 'nri' ? '#1759A6'"
).replace(
  "      '--theme-dark': themeType === 'nri' ? '#0B2342'",
  "      '--theme-dark': themeType === 'corporate' ? '#0D1B2A' : (themeType === 'nri' ? '#0B2342'"
).replace(
  "      '--theme-soft': themeType === 'nri' ? '#F4F7FA'",
  "      '--theme-soft': themeType === 'corporate' ? '#E6F2FD' : (themeType === 'nri' ? '#F4F7FA'"
).replace(
  "      '--theme-text-sec': themeType === 'nri' ? '#596575'",
  "      '--theme-text-sec': themeType === 'corporate' ? '#4B5563' : (themeType === 'nri' ? '#596575'"
).replace(
  "      '--theme-text-main': themeType === 'nri' ? '#173A63'",
  "      '--theme-text-main': themeType === 'corporate' ? '#0D1B2A' : (themeType === 'nri' ? '#173A63'"
);
// replace closing parenthesis for these
for (let i = 0; i < 6; i++) {
  content = content.replace("? '#FFF9F7' : 'var(--pink-bg)')))))", "? '#FFF9F7' : 'var(--pink-bg)'))))))");
  content = content.replace("? '#D32F2F' : 'var(--pink-primary)')))))", "? '#D32F2F' : 'var(--pink-primary)'))))))");
  content = content.replace("? '#B71C1C' : 'var(--pink-dark)')))))", "? '#B71C1C' : 'var(--pink-dark)'))))))");
  content = content.replace("? '#FFCEC0' : 'var(--pink-soft)')))))", "? '#FFCEC0' : 'var(--pink-soft)'))))))");
  content = content.replace("? '#555555' : 'var(--text-sec)')))))", "? '#555555' : 'var(--text-sec)'))))))");
  content = content.replace("? '#8B1E1E' : 'var(--text-main)')))))", "? '#8B1E1E' : 'var(--text-main)'))))))");
}

// 6. hero Image tag
content = content.replace(
  "        {themeType === 'nri' || themeType === 'family'",
  "        {themeType === 'corporate' || themeType === 'nri' || themeType === 'family'"
).replace(
  "            alt={themeType === 'nri' ? \"NRI Package\"",
  "            alt={themeType === 'corporate' ? \"Corporate Package\" : (themeType === 'nri' ? \"NRI Package\""
).replace(
  ": \"Family Getaway\")))}",
  ": \"Family Getaway\"))))}"
);

// 7. SVGs
content = content.replace(
  "fill={themeType === 'nri' ? '#0B2342' :",
  "fill={themeType === 'corporate' ? '#0D2C54' : (themeType === 'nri' ? '#0B2342' :"
).replace(
  "='#B71C1C' : '#C23B6B')))))}",
  "='#B71C1C' : '#C23B6B'))))))}"
);
content = content.replace(
  "fill={themeType === 'nri' ? '#1759A6' :",
  "fill={themeType === 'corporate' ? '#00A8E8' : (themeType === 'nri' ? '#1759A6' :"
).replace(
  "='#FFCEC0' : '#F2A5BC')))))}",
  "='#FFCEC0' : '#F2A5BC'))))))}"
);
content = content.replace(
  "fill={themeType === 'nri' ? '#FFFCF5' :",
  "fill={themeType === 'corporate' ? '#F7FAFF' : (themeType === 'nri' ? '#FFFCF5' :"
).replace(
  "='#FFF9F7' : 'var(--pink-bg)')))))}",
  "='#FFF9F7' : 'var(--pink-bg)'))))))}"
);
content = content.replace(
  "stroke={themeType === 'nri' ? '#1759A6' :",
  "stroke={themeType === 'corporate' ? '#1E5AA8' : (themeType === 'nri' ? '#1759A6' :"
).replace(
  "='#D32F2F' : '#D9466F')))))}",
  "='#D32F2F' : '#D9466F'))))))}"
);

// 8. Flourish dots outer, line, inner (there are two blocks of these)
const outerDotFind = "style={themeType === 'nri' ? { background: '#1759A6', borderColor: '#1759A6' } :";
const outerDotReplace = "style={themeType === 'corporate' ? { background: '#1E5AA8', borderColor: '#1E5AA8' } : (themeType === 'nri' ? { background: '#1759A6', borderColor: '#1759A6' } :";
const lineFind = "style={themeType === 'nri' ? { background: 'linear-gradient(90deg, transparent, #1759A6, transparent)' } :";
const lineReplace = "style={themeType === 'corporate' ? { background: 'linear-gradient(90deg, transparent, #1E5AA8, transparent)' } : (themeType === 'nri' ? { background: 'linear-gradient(90deg, transparent, #1759A6, transparent)' } :";
const innerDotFind = "style={themeType === 'nri' ? { background: '#1759A6' } :";
const innerDotReplace = "style={themeType === 'corporate' ? { background: '#1E5AA8' } : (themeType === 'nri' ? { background: '#1759A6' } :";
const closeParenFind = ": {})))))}></div>";
const closeParenReplace = ": {}))))))}></div>";

content = content.split(outerDotFind).join(outerDotReplace).split(lineFind).join(lineReplace).split(innerDotFind).join(innerDotReplace).split(closeParenFind).join(closeParenReplace);

// 9. flourish heart (divider icon)
content = content.replace(
  "            {themeType === 'nri' ? (",
  "            {themeType === 'corporate' ? (\n              <svg className=\"flourish-heart\" style={{ filter: 'drop-shadow(0 1px 3px rgba(30, 90, 168, 0.25))' }} width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#1E5AA8\" strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\" xmlns=\"http://www.w3.org/2000/svg\">\n                <rect x=\"2\" y=\"7\" width=\"20\" height=\"14\" rx=\"2\" ry=\"2\"></rect>\n                <path d=\"M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16\"></path>\n              </svg>\n            ) : themeType === 'nri' ? ("
);

// 10. Center Top section
content = content.replace(
  "<h2 className=\"section-heading serif\" style={themeType === 'nri' ? { color: '#173A63' } :",
  "<h2 className=\"section-heading serif\" style={themeType === 'corporate' ? { color: '#0D1B2A' } : (themeType === 'nri' ? { color: '#173A63' } :"
).replace(
  ": {})))))}>",
  ": {}))))))}>"
);

content = content.replace(
  "{themeType === 'nri' ? 'Your journey home, made seamless & special' :",
  "{themeType === 'corporate' ? 'Professional trips, perfectly planned' : (themeType === 'nri' ? 'Your journey home, made seamless & special' :"
).replace(
  " escapes')))))}",
  " escapes'))))))}"
);

// 11. Description Text (Corporate specific text)
const corporateText = `                  <>
                    <p>
                      {pkg?.description || 'Your business travel should be smooth, productive, and completely hassle-free. Our corporate travel solutions are designed to take care of every detail while you focus on what matters most—your business.'}
                    </p>
                    {!pkg?.description && (
                      <div className="extended-description">
                        <p style={{ marginTop: '16px' }}>From flight bookings and comfortable business stays to airport transfers, meeting arrangements, and local transportation, we create seamless travel experiences for professionals and corporate teams.</p>
                        <p style={{ marginTop: '16px' }}>Whether you\\'re travelling for a business meeting, conference, team offsite, client visit, or corporate event, our dedicated support helps make every journey comfortable, efficient, and reliable.</p>
                      </div>
                    )}
                  </>
                ) : themeType === 'nri' ? (`;

content = content.replace(
  "                {themeType === 'nri' ? (",
  "                {themeType === 'corporate' ? (\n" + corporateText
);

// 12. Corporate benefit strips (at the very bottom of the file)
// We need to inject the corporate benefits right before `export default function PremiumDestinationLayout` or where the other strips are.
const corporateBenefits = `
      {themeType === 'corporate' && (
        <div className="corporate-benefits-strip-container" style={{ background: '#F7FAFF', borderTop: '1px solid #E2E8F0', padding: '24px 0', marginTop: '40px' }}>
          <div className="nri-benefits-strip" style={{ display: 'flex', justifyContent: 'space-around', maxWidth: '1200px', margin: '0 auto', flexWrap: 'wrap', gap: '20px' }}>
            <div className="nri-benefit" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="nri-benefit-icon" style={{ background: '#E6F2FD', color: '#1E5AA8', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '24px' }}>💼</span>
              <span className="nri-benefit-text" style={{ fontSize: '14px', color: '#4B5563', fontWeight: 600 }}>Tailored Corporate<br/>Travel Solutions</span>
            </div>
            <div className="nri-benefit" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="nri-benefit-icon" style={{ background: '#E6F2FD', color: '#1E5AA8', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '24px' }}>✈️</span>
              <span className="nri-benefit-text" style={{ fontSize: '14px', color: '#4B5563', fontWeight: 600 }}>Best Deals on Flights<br/>& Business Stays</span>
            </div>
            <div className="nri-benefit" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="nri-benefit-icon" style={{ background: '#E6F2FD', color: '#1E5AA8', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '24px' }}>🚕</span>
              <span className="nri-benefit-text" style={{ fontSize: '14px', color: '#4B5563', fontWeight: 600 }}>Reliable Airport Transfers<br/>& Local Transport</span>
            </div>
            <div className="nri-benefit" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="nri-benefit-icon" style={{ background: '#E6F2FD', color: '#1E5AA8', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '24px' }}>🎧</span>
              <span className="nri-benefit-text" style={{ fontSize: '14px', color: '#4B5563', fontWeight: 600 }}>24/7 Dedicated Support<br/>for Business Travelers</span>
            </div>
            <div className="nri-benefit" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="nri-benefit-icon" style={{ background: '#E6F2FD', color: '#1E5AA8', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '24px' }}>📄</span>
              <span className="nri-benefit-text" style={{ fontSize: '14px', color: '#4B5563', fontWeight: 600 }}>Easy Billing &<br/>GST Invoicing</span>
            </div>
          </div>
        </div>
      )}
`;

content = content.replace(
  "      {themeType === 'nri' && (",
  corporateBenefits + "\n      {themeType === 'nri' && ("
);

// 13. Highlights section for corporate
const corporateHighlights = `
                    ) : themeType === 'corporate' ? (
                      <>
                        <div className="highlight-card"><span className="icon" style={{ filter: 'grayscale(1)', color: '#1E5AA8' }}>💼</span><h4 style={{ fontSize: '15px' }}>Corporate Stays</h4></div>
                        <div className="highlight-card"><span className="icon" style={{ filter: 'grayscale(1)', color: '#1E5AA8' }}>🤝</span><h4 style={{ fontSize: '15px' }}>Meeting Venues</h4></div>
                        <div className="highlight-card"><span className="icon" style={{ filter: 'grayscale(1)', color: '#1E5AA8' }}>✈️</span><h4 style={{ fontSize: '15px' }}>Priority Boarding</h4></div>
                        <div className="highlight-card"><span className="icon" style={{ filter: 'grayscale(1)', color: '#1E5AA8' }}>🚗</span><h4 style={{ fontSize: '15px' }}>Chauffeur Service</h4></div>
                      </>
`;

content = content.replace(
  "                    ) : themeType === 'trending' ? (",
  corporateHighlights + "                    ) : themeType === 'trending' ? ("
);

fs.writeFileSync(filePath, content);
console.log('done');
