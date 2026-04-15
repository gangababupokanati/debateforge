const fs = require('fs');
let h = fs.readFileSync('public/index.html', 'utf8');

// Fix difficulty icons (emojis with variation selectors)
h = h.replace(/<div class="em">&#128994;<\/div>/g, '<i data-lucide="circle" class="em"></i>');
h = h.replace(/<div class="em">&#128993;<\/div>/g, '<i data-lucide="circle-dot" class="em"></i>');
h = h.replace(/<div class="em">&#128308;<\/div>/g, '<i data-lucide="alert-circle" class="em"></i>');

// Fix opponent icons (they use .opi class, different structure)
h = h.replace(
  '<div class="opi" style="background:var(--acg);color:var(--ac)">&#9878;&#65039;</div>',
  '<div class="opi" style="background:var(--acg);color:var(--ac)"><i data-lucide="bar-chart-3" style="width:22px;height:22px"></i></div>'
);
h = h.replace(
  '<div class="opi" style="background:var(--rdg);color:var(--rd)">&#128293;</div>',
  '<div class="opi" style="background:var(--rdg);color:var(--rd)"><i data-lucide="flame" style="width:22px;height:22px"></i></div>'
);
h = h.replace(
  '<div class="opi" style="background:var(--prg);color:var(--pr)">&#129300;</div>',
  '<div class="opi" style="background:var(--prg);color:var(--pr)"><i data-lucide="brain" style="width:22px;height:22px"></i></div>'
);

// Fix standpoint scale icon (has variation selector)
h = h.replace('<div class="em">⚖️</div>', '<i data-lucide="scale" class="em"></i>');
h = h.replace('<div class="em">&#9878;&#65039;</div>', '<i data-lucide="scale" class="em"></i>');

fs.writeFileSync('public/index.html', h);
console.log('Done! Remaining icons fixed.');