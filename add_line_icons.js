const fs = require('fs');
let h = fs.readFileSync('public/index.html', 'utf8');

// 1. Add Lucide CDN to head
h = h.replace(
  '<link href="https://fonts.googleapis.com',
  '<script src="https://unpkg.com/lucide@latest"></script>\n<link href="https://fonts.googleapis.com'
);

// 2. Update .em CSS
h = h.replace(
  '.oc .em{font-size:1.6rem;margin-bottom:4px}',
  '.oc .em{width:28px;height:28px;margin:0 auto 6px;color:var(--ac);stroke-width:1.75}\n.oc.sel .em{color:var(--ac2)}'
);

// 3. Replace emojis with Lucide icons
const replacements = [
  ['<div class="em">💻</div>', '<i data-lucide="cpu" class="em"></i>'],
  ['<div class="em">📚</div>', '<i data-lucide="book-open" class="em"></i>'],
  ['<div class="em">🏛️</div>', '<i data-lucide="landmark" class="em"></i>'],
  ['<div class="em">🌍</div>', '<i data-lucide="globe" class="em"></i>'],
  ['<div class="em">👍</div>', '<i data-lucide="thumbs-up" class="em"></i>'],
  ['<div class="em">👎</div>', '<i data-lucide="thumbs-down" class="em"></i>'],
  ['<div class="em">⚖️</div>', '<i data-lucide="scale" class="em"></i>'],
  ['<div class="em">🟢</div>', '<i data-lucide="circle" class="em"></i>'],
  ['<div class="em">🟡</div>', '<i data-lucide="circle-dot" class="em"></i>'],
  ['<div class="em">🔴</div>', '<i data-lucide="alert-circle" class="em"></i>'],
  ['<div class="em">👩</div>', '<i data-lucide="user" class="em"></i>'],
  ['<div class="em">👨</div>', '<i data-lucide="users" class="em"></i>'],
  ['<div class="em">🤖</div>', '<i data-lucide="bot" class="em"></i>'],
];
replacements.forEach(([from, to]) => { h = h.replace(from, to); });

// 4. Initialize Lucide
h = h.replace(
  '})();\n</script>\n<script>window.speechSynthesis.getVoices()',
  '})();\nlucide.createIcons();\n</script>\n<script>window.speechSynthesis.getVoices()'
);

fs.writeFileSync('public/index.html', h);
console.log('Done! Line icons added to home page.');