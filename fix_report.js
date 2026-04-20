// fix_report.js - Remove canvas avatar and restore orb
// Run: node fix_report.js

const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');
let fixes = 0;

// ============ FIX 1: Replace canvas avatar with orb ============
const canvasAvatar = `<div id="canvasAvatarWrap" style="width:100%;max-width:400px;height:320px;margin:0 auto 8px;position:relative;border-radius:20px;overflow:hidden;border:2px solid #1e293b;background:linear-gradient(180deg,#0d1f3c,#0a1628)">
        <canvas id="avatarCanvas" width="400" height="320" style="width:100%;height:100%"></canvas>
        <div id="avatarStatusBadge" style="position:absolute;bottom:10px;left:50%;transform:translateX(-50%);padding:4px 16px;border-radius:12px;background:rgba(10,15,26,.8);backdrop-filter:blur(8px);border:1px solid #1e293b;font-size:.75rem;color:#94a3b8;font-family:Outfit,sans-serif"></div>
      </div>`;

const orbHTML = `<div class="orb-wrap" id="bavW">
        <div class="orb-dots"></div>
        <div class="orb-ring2"></div>
        <div class="orb-ring"></div>
        <div class="orb"></div>
      </div>
      <div class="sw" id="sW"><div class="b" style="height:8px"></div><div class="b" style="height:14px"></div><div class="b" style="height:20px"></div><div class="b" style="height:14px"></div><div class="b" style="height:24px"></div><div class="b" style="height:14px"></div><div class="b" style="height:8px"></div></div>
      <div class="on2" id="oN">AI Opponent</div>
      <div class="os" id="oS">Preparing...</div>
      <div class="sb" id="sB"></div>`;

if (html.includes('canvasAvatarWrap')) {
  html = html.replace(canvasAvatar, orbHTML);
  fixes++;
  console.log('✅ FIX 1: Replaced canvas avatar with orb');
} else {
  console.log('⏭️  FIX 1: Canvas avatar not found');
}

// ============ FIX 2: Remove the entire Canvas avatar JS block ============
const canvasJSRegex = /<script>\s*\/\/ ========== CANVAS AVATAR WITH LIP SYNC ==========[\s\S]*?<\/script>/;
if (canvasJSRegex.test(html)) {
  html = html.replace(canvasJSRegex, '');
  fixes++;
  console.log('✅ FIX 2: Removed Canvas avatar JavaScript');
} else {
  console.log('⏭️  FIX 2: Canvas avatar JS not found');
}

// ============ FIX 3: Remove avatar CSS if present ============
if (html.includes('/* HUMAN AI AVATAR */')) {
  html = html.replace(/\/\* HUMAN AI AVATAR \*\/[\s\S]*?@keyframes glowPulse\{[^}]*\{[^}]*\}[^}]*\}/, '');
  fixes++;
  console.log('✅ FIX 3: Removed avatar CSS');
}

// ============ FIX 4: Fix avs display back to normal ============
if (html.includes('class="avs" style="display:flex;z-index:10;position:relative"')) {
  html = html.replace('class="avs" style="display:flex;z-index:10;position:relative"', 'class="avs"');
  fixes++;
  console.log('✅ FIX 4: Reset avs display');
}

// ============ FIX 5: Restore sB and oS references that had null checks ============
// Fix getAIResponse sB null check back to normal
if (html.includes('var sBel=document.getElementById(\'sB\');if(sBel)sBel.innerHTML=\'<div class="tp">')) {
  html = html.replace(
    'var sBel=document.getElementById(\'sB\');if(sBel)sBel.innerHTML=\'<div class="tp"><i></i><i></i><i></i></div>\';',
    'document.getElementById(\'sB\').innerHTML=\'<div class="tp"><i></i><i></i><i></i></div>\';'
  );
  fixes++;
  console.log('✅ FIX 5a: Restored sB innerHTML');
}

if (html.includes('var oSel2=document.getElementById(\'oS\');if(oSel2)oSel2.textContent=\'Thinking')) {
  html = html.replace(
    'var oSel2=document.getElementById(\'oS\');if(oSel2)oSel2.textContent=\'Thinking\\u2026\';',
    'document.getElementById(\'oS\').textContent=\'Thinking\\u2026\';'
  );
  fixes++;
  console.log('✅ FIX 5b: Restored oS textContent');
}

if (html.includes('var sBel4=document.getElementById(\'sB\');if(sBel4)sBel4.textContent=text;')) {
  html = html.replace(
    'var sBel4=document.getElementById(\'sB\');if(sBel4)sBel4.textContent=text;',
    'document.getElementById(\'sB\').textContent=text;'
  );
  fixes++;
  console.log('✅ FIX 5c: Restored sB textContent');
}

if (html.includes('var sBel3=document.getElementById(\'sB\');if(sBel3)sBel3.textContent=\'Network error.\';var oSel3=document.getElementById(\'oS\');if(oSel3)oSel3.textContent=\'Error\'')) {
  html = html.replace(
    'var sBel3=document.getElementById(\'sB\');if(sBel3)sBel3.textContent=\'Network error.\';var oSel3=document.getElementById(\'oS\');if(oSel3)oSel3.textContent=\'Error\'',
    'document.getElementById(\'sB\').textContent=\'Network error.\';document.getElementById(\'oS\').textContent=\'Error\''
  );
  fixes++;
  console.log('✅ FIX 5d: Restored catch block');
}

// ============ FIX 6: Keep tL null check (it's still needed) ============
// tL null check stays because it's harmless

// ============ FIX 7: Restore particle bg opacity ============
if (html.includes('style="display:none;opacity:0.3"') || html.includes('style="display:none;opacity:0.2"')) {
  html = html.replace(/style="display:none;opacity:0\.\d+"/, 'style="display:none"');
  fixes++;
  console.log('✅ FIX 7: Restored particle bg opacity');
}

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('\n🎉 Done! ' + fixes + ' fixes applied.');
console.log('Avatar removed, orb restored!');
console.log('\nRun: node server.js');
console.log('Push: git add . && git commit -m "Remove avatar, restore orb" && git push origin main');
