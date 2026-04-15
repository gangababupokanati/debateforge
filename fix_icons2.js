const fs = require('fs');
let h = fs.readFileSync('public/index.html', 'utf8');

// Fix 1: Opponent icons - use simpler approach with emojis that render as line-style
// Replace empty opi divs with proper Lucide icons
h = h.replace(
  /<div class="opi" style="background:var\(--acg\);color:var\(--ac\)">[\s\S]*?<\/div>/,
  '<div class="opi" style="background:var(--acg);color:var(--ac)"><i data-lucide="bar-chart-3" style="width:22px;height:22px;stroke-width:2"></i></div>'
);
h = h.replace(
  /<div class="opi" style="background:var\(--rdg\);color:var\(--rd\)">[\s\S]*?<\/div>/,
  '<div class="opi" style="background:var(--rdg);color:var(--rd)"><i data-lucide="flame" style="width:22px;height:22px;stroke-width:2"></i></div>'
);
h = h.replace(
  /<div class="opi" style="background:var\(--prg\);color:var\(--pr\)">[\s\S]*?<\/div>/,
  '<div class="opi" style="background:var(--prg);color:var(--pr)"><i data-lucide="brain" style="width:22px;height:22px;stroke-width:2"></i></div>'
);

// Fix 2: Accent - replace "IN", "GB", "US" text with proper flag icons using Lucide globe
h = h.replace(
  '<div class="em">IN</div>',
  '<i data-lucide="globe" class="em"></i>'
);
h = h.replace(
  '<div class="em">GB</div>',
  '<i data-lucide="globe" class="em"></i>'
);
h = h.replace(
  '<div class="em">US</div>',
  '<i data-lucide="globe" class="em"></i>'
);

fs.writeFileSync('public/index.html', h);
console.log('Done! Opponent and accent icons fixed.');