// fix_report.js - Adds human-like SVG avatar with lip sync
// Run: node fix_report.js

const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');
let fixes = 0;

// ============ STEP 1: Add avatar CSS ============
const avatarCSS = `
/* HUMAN AI AVATAR */
.avatar-container{width:200px;height:200px;margin:0 auto 10px;position:relative}
.avatar-container svg{width:100%;height:100%}
.avatar-glow{position:absolute;inset:-15px;border-radius:50%;background:radial-gradient(circle,rgba(59,130,246,.2),transparent 70%);opacity:0;transition:.5s;pointer-events:none}
.avatar-glow.active{opacity:1;animation:glowPulse 2s ease-in-out infinite}
@keyframes glowPulse{0%,100%{opacity:.6;transform:scale(1)}50%{opacity:1;transform:scale(1.05)}}
`;

const cssInsert = `/* NAV */`;
if (html.includes(cssInsert) && !html.includes('.avatar-container{')) {
  html = html.replace(cssInsert, avatarCSS + cssInsert);
  fixes++;
  console.log('✅ FIX 1: Added avatar CSS');
}

// ============ STEP 2: Replace orb with human SVG avatar ============
const humanAvatar = `<div class="avatar-container" id="avatarContainer">
        <div class="avatar-glow" id="avatarGlow"></div>
        <svg viewBox="0 0 200 200" id="avatarSvg">
          <circle cx="100" cy="90" r="70" fill="#F5D6C3" stroke="#E8C4AB" stroke-width="1"/>
          <ellipse cx="100" cy="52" rx="72" ry="40" fill="#1a1a2e"/>
          <ellipse cx="45" cy="72" rx="18" ry="30" fill="#1a1a2e"/>
          <ellipse cx="155" cy="72" rx="18" ry="30" fill="#1a1a2e"/>
          <ellipse cx="32" cy="95" rx="8" ry="12" fill="#F0C9B0"/>
          <ellipse cx="168" cy="95" rx="8" ry="12" fill="#F0C9B0"/>
          <ellipse cx="75" cy="92" rx="16" ry="12" fill="#fff" stroke="#ddd" stroke-width="0.5"/>
          <ellipse cx="125" cy="92" rx="16" ry="12" fill="#fff" stroke="#ddd" stroke-width="0.5"/>
          <circle cx="75" cy="93" r="7" fill="#4A6FA5" id="irisL"/>
          <circle cx="125" cy="93" r="7" fill="#4A6FA5" id="irisR"/>
          <circle cx="75" cy="93" r="3.5" fill="#1a1a2e" id="pupilL"/>
          <circle cx="125" cy="93" r="3.5" fill="#1a1a2e" id="pupilR"/>
          <circle cx="78" cy="90" r="2" fill="#fff" opacity="0.8"/>
          <circle cx="128" cy="90" r="2" fill="#fff" opacity="0.8"/>
          <ellipse cx="75" cy="92" rx="16" ry="0" fill="#F5D6C3" id="eyelidL"/>
          <ellipse cx="125" cy="92" rx="16" ry="0" fill="#F5D6C3" id="eyelidR"/>
          <path d="M58 78 Q75 72 92 78" fill="none" stroke="#1a1a2e" stroke-width="2.5" stroke-linecap="round" id="browL"/>
          <path d="M108 78 Q125 72 142 78" fill="none" stroke="#1a1a2e" stroke-width="2.5" stroke-linecap="round" id="browR"/>
          <path d="M95 100 Q100 112 105 100" fill="none" stroke="#E0B49A" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M80 125 Q100 132 120 125" fill="none" stroke="#C4756A" stroke-width="2.5" stroke-linecap="round" id="mouthLine"/>
          <ellipse cx="100" cy="128" rx="15" ry="0" fill="#C4756A" id="mouthOpen" opacity="0"/>
          <ellipse cx="55" cy="112" rx="12" ry="6" fill="#F0A0A0" opacity="0" id="cheekL"/>
          <ellipse cx="145" cy="112" rx="12" ry="6" fill="#F0A0A0" opacity="0" id="cheekR"/>
          <rect x="85" y="155" width="30" height="20" rx="5" fill="#F0C9B0"/>
          <path d="M50 175 Q100 165 150 175 L160 200 L40 200 Z" fill="#3B82F6"/>
          <path d="M85 175 L100 185 L115 175" fill="none" stroke="#2563EB" stroke-width="1.5"/>
        </svg>
      </div>`;

// Try multiple possible existing avatar/orb patterns
const patterns = [
  // Pattern 1: CSS avatar from previous fix
  /<div class="ai-face-wrap"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/,
  // Pattern 2: Hidden orb
  /<div class="orb-wrap" id="bavW" style="display:none">[\s\S]*?<\/div>\s*<div class="ai-face-wrap/,
];

// Simple string replacements
const orbStr1 = `<div class="orb-wrap" id="bavW" style="display:none">
        <div class="orb-dots"></div>
        <div class="orb-ring2"></div>
        <div class="orb-ring"></div>
        <div class="orb"></div>
      </div>`;

const orbStr2 = `<div class="orb-wrap" id="bavW">
        <div class="orb-dots"></div>
        <div class="orb-ring2"></div>
        <div class="orb-ring"></div>
        <div class="orb"></div>
      </div>`;

if (html.includes('ai-face-wrap')) {
  // Remove old CSS avatar entirely and find the orb
  html = html.replace(/<div class="ai-face-wrap"[\s\S]*?<div class="ai-mouth"[^>]*><\/div>\s*<\/div>\s*<\/div>/, '');
  // Also remove hidden orb if present
  if (html.includes(orbStr1)) {
    html = html.replace(orbStr1, humanAvatar);
  } else {
    // Insert avatar before sound wave
    html = html.replace('<div class="sw"', humanAvatar + '\n      <div class="sw"');
  }
  fixes++;
  console.log('✅ FIX 2: Replaced old avatar with human SVG');
} else if (html.includes(orbStr2)) {
  html = html.replace(orbStr2, humanAvatar);
  fixes++;
  console.log('✅ FIX 2: Replaced orb with human SVG avatar');
} else if (html.includes(orbStr1)) {
  html = html.replace(orbStr1, humanAvatar);
  fixes++;
  console.log('✅ FIX 2: Replaced hidden orb with human SVG avatar');
} else {
  // Last resort - insert before sound wave
  if (html.includes('<div class="sw"') && !html.includes('avatarContainer')) {
    html = html.replace('<div class="sw"', humanAvatar + '\n      <div class="sw"');
    fixes++;
    console.log('✅ FIX 2: Inserted human SVG avatar before sound wave');
  } else {
    console.log('⏭️  FIX 2: Could not find insertion point');
  }
}

// ============ STEP 3: Add avatar animation JavaScript ============
const avatarJS = `<script>
(function(){
  var blinkTimer=null,pupilTimer=null,mouthTimer=null;
  function blink(){
    var lL=document.getElementById('eyelidL'),lR=document.getElementById('eyelidR');
    if(!lL||!lR)return;
    lL.setAttribute('ry','12');lR.setAttribute('ry','12');
    setTimeout(function(){lL.setAttribute('ry','0');lR.setAttribute('ry','0');},120);
  }
  function startBlinking(){
    if(blinkTimer)clearInterval(blinkTimer);
    blinkTimer=setInterval(function(){blink();if(Math.random()>0.7)setTimeout(blink,250);},2000+Math.random()*3000);
  }
  function movePupils(){
    if(pupilTimer)clearInterval(pupilTimer);
    pupilTimer=setInterval(function(){
      var ox=(Math.random()-0.5)*4,oy=(Math.random()-0.5)*2;
      var pL=document.getElementById('pupilL'),pR=document.getElementById('pupilR');
      var iL=document.getElementById('irisL'),iR=document.getElementById('irisR');
      if(!pL||!pR||!iL||!iR)return;
      pL.setAttribute('cx',75+ox);pL.setAttribute('cy',93+oy);
      pR.setAttribute('cx',125+ox);pR.setAttribute('cy',93+oy);
      iL.setAttribute('cx',75+ox);iR.setAttribute('cx',125+ox);
      iL.setAttribute('cy',93+oy);iR.setAttribute('cy',93+oy);
    },1500+Math.random()*2000);
  }
  function startSpeaking(){
    var mLine=document.getElementById('mouthLine'),mOpen=document.getElementById('mouthOpen');
    var cL=document.getElementById('cheekL'),cR=document.getElementById('cheekR');
    var glow=document.getElementById('avatarGlow');
    if(!mLine||!mOpen)return;
    mLine.setAttribute('opacity','0');mOpen.setAttribute('opacity','1');
    if(cL)cL.setAttribute('opacity','0.3');if(cR)cR.setAttribute('opacity','0.3');
    if(glow)glow.classList.add('active');
    if(mouthTimer)clearInterval(mouthTimer);
    mouthTimer=setInterval(function(){
      var ry=3+Math.random()*10,rx=12+Math.random()*6;
      mOpen.setAttribute('ry',ry);mOpen.setAttribute('rx',rx);
    },120);
  }
  function stopSpeaking(){
    var mLine=document.getElementById('mouthLine'),mOpen=document.getElementById('mouthOpen');
    var cL=document.getElementById('cheekL'),cR=document.getElementById('cheekR');
    var glow=document.getElementById('avatarGlow');
    if(mouthTimer){clearInterval(mouthTimer);mouthTimer=null;}
    if(!mLine||!mOpen)return;
    mLine.setAttribute('opacity','1');mOpen.setAttribute('opacity','0');mOpen.setAttribute('ry','0');
    if(cL)cL.setAttribute('opacity','0');if(cR)cR.setAttribute('opacity','0');
    if(glow)glow.classList.remove('active');
  }
  function setThinking(){
    stopSpeaking();
    var bL=document.getElementById('browL'),bR=document.getElementById('browR');
    var mLine=document.getElementById('mouthLine'),mOpen=document.getElementById('mouthOpen');
    if(bL)bL.setAttribute('d','M58 74 Q75 68 92 76');
    if(bR)bR.setAttribute('d','M108 76 Q125 68 142 74');
    if(mLine)mLine.setAttribute('opacity','0');
    if(mOpen){mOpen.setAttribute('opacity','1');mOpen.setAttribute('ry','5');mOpen.setAttribute('rx','8');}
  }
  function setSmile(){
    stopSpeaking();
    var bL=document.getElementById('browL'),bR=document.getElementById('browR'),mLine=document.getElementById('mouthLine');
    if(bL)bL.setAttribute('d','M58 78 Q75 72 92 78');
    if(bR)bR.setAttribute('d','M108 78 Q125 72 142 78');
    if(mLine){mLine.setAttribute('opacity','1');mLine.setAttribute('d','M80 122 Q100 138 120 122');}
  }
  function setNeutral(){
    stopSpeaking();
    var bL=document.getElementById('browL'),bR=document.getElementById('browR'),mLine=document.getElementById('mouthLine');
    if(bL)bL.setAttribute('d','M58 78 Q75 72 92 78');
    if(bR)bR.setAttribute('d','M108 78 Q125 72 142 78');
    if(mLine){mLine.setAttribute('opacity','1');mLine.setAttribute('d','M80 125 Q100 132 120 125');}
  }
  startBlinking();movePupils();
  var _origSpeak=window.speak;
  window.speak=function(text,onEnd){
    startSpeaking();
    var st=document.getElementById('debateAiStatus');if(st){st.style.display='block';st.textContent='AI is speaking...';}
    var sw=document.getElementById('sW');if(sw)sw.classList.add('ac');
    var os=document.getElementById('oS');if(os){os.textContent='Speaking...';os.classList.add('spks');}
    _origSpeak(text,function(){
      stopSpeaking();setSmile();
      if(sw)sw.classList.remove('ac');if(os){os.textContent='Listening...';os.classList.remove('spks');}
      var st2=document.getElementById('debateAiStatus');if(st2){st2.style.display='block';st2.textContent='Your Turn - Speak Now';}
      if(onEnd)onEnd();
    });
  };
  var _origGetAI=window.getAIResponse;
  if(_origGetAI){window.getAIResponse=function(msgs,isOpening){setThinking();var st=document.getElementById('debateAiStatus');if(st){st.style.display='block';st.textContent='AI is thinking...';}return _origGetAI(msgs,isOpening);};}
  window.avatarSpeak=startSpeaking;window.avatarStop=stopSpeaking;window.avatarThink=setThinking;window.avatarSmile=setSmile;window.avatarNeutral=setNeutral;
})();
</script>`;

// Remove old avatar JS if present
if (html.includes('AI AVATAR ANIMATION')) {
  html = html.replace(/<script>\s*\/\/ ========== AI AVATAR ANIMATION ==========[\s\S]*?<\/script>/, '');
  console.log('   Removed old avatar JS');
}

const jsInsert = `</body>`;
if (html.includes(jsInsert) && !html.includes('HUMAN AVATAR ANIMATION') && !html.includes('startBlinking();movePupils()')) {
  html = html.replace(jsInsert, avatarJS + '\n' + jsInsert);
  fixes++;
  console.log('✅ FIX 3: Added human avatar animation JS');
}

// ============ STEP 4: Remove old CSS avatar styles ============
if (html.includes('/* AI AVATAR FACE */')) {
  html = html.replace(/\/\* AI AVATAR FACE \*\/[\s\S]*?\.ai-face-status\.listening\{color:#22c55e\}\s*/, '');
  fixes++;
  console.log('✅ FIX 4: Removed old CSS avatar styles');
}

// ============ STEP 5: Make avs visible ============
if (html.includes('<div class="avs" style="display:none">')) {
  html = html.replace('<div class="avs" style="display:none">', '<div class="avs" style="display:flex;z-index:10;position:relative">');
  fixes++;
  console.log('✅ FIX 5: Made avatar section visible');
}

// ============ STEP 6: Dim particle background ============
const debateBgOld = '<div class="debate-bg" id="debateBg" style="display:none">';
const debateBgDim = '<div class="debate-bg" id="debateBg" style="display:none;opacity:0.3">';
if (html.includes(debateBgOld) && !html.includes('opacity:0.3')) {
  html = html.replace(debateBgOld, debateBgDim);
  fixes++;
  console.log('✅ FIX 6: Dimmed particle background');
}

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('\n🎉 Done! ' + fixes + ' fixes applied.');
console.log('\n👤 Human avatar features:');
console.log('   - Realistic face with skin, hair, blue eyes');
console.log('   - Natural eye blinking (every 2-5s)');
console.log('   - Pupils move randomly');
console.log('   - Mouth animates when AI speaks (lip sync)');
console.log('   - Thinking face when AI processes');
console.log('   - Smile when listening to you');
console.log('   - Blue glow when speaking');
console.log('   - Cheek blush effect');
console.log('   - Blue shirt/collar');
console.log('\nRun: node server.js');