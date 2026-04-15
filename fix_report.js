// fix_report.js - Converts all modules to horizontal layout like Opponent
// Run: node fix_report.js

const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');
let fixes = 0;

// ===== TOPIC MODULE =====
// Technology
const oldTech = `<div class="oc sel" data-v="technology" onclick="pk(this,'topic');showSubs('technology')"><i data-lucide="cpu" class="em"></i><h4>Technology</h4><p>AI & jobs</p></div>`;
const newTech = `<div class="oc opc sel" data-v="technology" onclick="pk(this,'topic');showSubs('technology')"><div class="opi" style="background:var(--acg);color:var(--ac)"><i data-lucide="cpu" style="width:22px;height:22px;stroke-width:2"></i></div><div><h4>Technology</h4><p>AI & jobs</p></div></div>`;
if (html.includes(oldTech)) { html = html.replace(oldTech, newTech); fixes++; console.log('✅ Technology card updated'); }

// Education
const oldEdu = `<div class="oc" data-v="education" onclick="pk(this,'topic');showSubs('education')"><i data-lucide="book-open" class="em"></i><h4>Education</h4><p>Online vs class</p></div>`;
const newEdu = `<div class="oc opc" data-v="education" onclick="pk(this,'topic');showSubs('education')"><div class="opi" style="background:var(--gng);color:var(--gn)"><i data-lucide="book-open" style="width:22px;height:22px;stroke-width:2"></i></div><div><h4>Education</h4><p>Online vs class</p></div></div>`;
if (html.includes(oldEdu)) { html = html.replace(oldEdu, newEdu); fixes++; console.log('✅ Education card updated'); }

// Politics
const oldPol = `<div class="oc" data-v="politics" onclick="pk(this,'topic');showSubs('politics')"><i data-lucide="landmark" class="em"></i><h4>Politics</h4><p>Governance</p></div>`;
const newPol = `<div class="oc opc" data-v="politics" onclick="pk(this,'topic');showSubs('politics')"><div class="opi" style="background:var(--ylg);color:var(--yl)"><i data-lucide="landmark" style="width:22px;height:22px;stroke-width:2"></i></div><div><h4>Politics</h4><p>Governance</p></div></div>`;
if (html.includes(oldPol)) { html = html.replace(oldPol, newPol); fixes++; console.log('✅ Politics card updated'); }

// Environment
const oldEnv = `<div class="oc" data-v="environment" onclick="pk(this,'topic');showSubs('environment')"><i data-lucide="globe" class="em"></i><h4>Environment</h4><p>Climate</p></div>`;
const newEnv = `<div class="oc opc" data-v="environment" onclick="pk(this,'topic');showSubs('environment')"><div class="opi" style="background:var(--gng);color:var(--gn)"><i data-lucide="globe" style="width:22px;height:22px;stroke-width:2"></i></div><div><h4>Environment</h4><p>Climate</p></div></div>`;
if (html.includes(oldEnv)) { html = html.replace(oldEnv, newEnv); fixes++; console.log('✅ Environment card updated'); }

// ===== STANDPOINT MODULE =====
const oldSupport = `<div class="oc sel" data-v="support" onclick="pk(this,'standpoint')"><i data-lucide="thumbs-up" class="em"></i><h4>Support</h4><p>Argue in favor</p></div>`;
const newSupport = `<div class="oc opc sel" data-v="support" onclick="pk(this,'standpoint')"><div class="opi" style="background:var(--gng);color:var(--gn)"><i data-lucide="thumbs-up" style="width:22px;height:22px;stroke-width:2"></i></div><div><h4>Support</h4><p>Argue in favor</p></div></div>`;
if (html.includes(oldSupport)) { html = html.replace(oldSupport, newSupport); fixes++; console.log('✅ Support card updated'); }

const oldOppose = `<div class="oc" data-v="oppose" onclick="pk(this,'standpoint')"><i data-lucide="thumbs-down" class="em"></i><h4>Oppose</h4><p>Argue against</p></div>`;
const newOppose = `<div class="oc opc" data-v="oppose" onclick="pk(this,'standpoint')"><div class="opi" style="background:var(--rdg);color:var(--rd)"><i data-lucide="thumbs-down" style="width:22px;height:22px;stroke-width:2"></i></div><div><h4>Oppose</h4><p>Argue against</p></div></div>`;
if (html.includes(oldOppose)) { html = html.replace(oldOppose, newOppose); fixes++; console.log('✅ Oppose card updated'); }

const oldNeutral = `<div class="oc" data-v="neutral" onclick="pk(this,'standpoint')"><i data-lucide="scale" class="em"></i><h4>Neutral</h4><p>Balanced view</p></div>`;
const newNeutral = `<div class="oc opc" data-v="neutral" onclick="pk(this,'standpoint')"><div class="opi" style="background:var(--ylg);color:var(--yl)"><i data-lucide="scale" style="width:22px;height:22px;stroke-width:2"></i></div><div><h4>Neutral</h4><p>Balanced view</p></div></div>`;
if (html.includes(oldNeutral)) { html = html.replace(oldNeutral, newNeutral); fixes++; console.log('✅ Neutral card updated'); }

// ===== DIFFICULTY MODULE =====
const oldEasy = `<div class="oc sel" data-v="easy" onclick="pk(this,'difficulty')"><i data-lucide="leaf" class="em"></i><h4>Easy</h4><p>Gentle counters</p></div>`;
const newEasy = `<div class="oc opc sel" data-v="easy" onclick="pk(this,'difficulty')"><div class="opi" style="background:var(--gng);color:var(--gn)"><i data-lucide="leaf" style="width:22px;height:22px;stroke-width:2"></i></div><div><h4>Easy</h4><p>Gentle counters</p></div></div>`;
if (html.includes(oldEasy)) { html = html.replace(oldEasy, newEasy); fixes++; console.log('✅ Easy card updated'); }

const oldMed = `<div class="oc" data-v="medium" onclick="pk(this,'difficulty')"><i data-lucide="zap" class="em"></i><h4>Medium</h4><p>Balanced pushback</p></div>`;
const newMed = `<div class="oc opc" data-v="medium" onclick="pk(this,'difficulty')"><div class="opi" style="background:var(--ylg);color:var(--yl)"><i data-lucide="zap" style="width:22px;height:22px;stroke-width:2"></i></div><div><h4>Medium</h4><p>Balanced pushback</p></div></div>`;
if (html.includes(oldMed)) { html = html.replace(oldMed, newMed); fixes++; console.log('✅ Medium card updated'); }

const oldHard = `<div class="oc" data-v="hard" onclick="pk(this,'difficulty')"><i data-lucide="flame" class="em"></i><h4>Hard</h4><p>Expert attacks</p></div>`;
const newHard = `<div class="oc opc" data-v="hard" onclick="pk(this,'difficulty')"><div class="opi" style="background:var(--rdg);color:var(--rd)"><i data-lucide="flame" style="width:22px;height:22px;stroke-width:2"></i></div><div><h4>Hard</h4><p>Expert attacks</p></div></div>`;
if (html.includes(oldHard)) { html = html.replace(oldHard, newHard); fixes++; console.log('✅ Hard card updated'); }

// ===== ACCENT MODULE =====
const oldIndian = `<div class="oc" data-v="indian" onclick="pk(this,'accent')"><div class="em" style="font-size:0"><img src="https://flagcdn.com/w40/in.png" style="width:36px;height:auto;border-radius:4px"></div><h4>Indian</h4><p>Heera &amp; Ravi</p></div>`;
const newIndian = `<div class="oc opc" data-v="indian" onclick="pk(this,'accent')"><div class="opi" style="background:rgba(255,153,51,.1);padding:6px"><img src="https://flagcdn.com/w40/in.png" style="width:30px;height:auto;border-radius:3px"></div><div><h4>Indian</h4><p>Heera &amp; Ravi</p></div></div>`;
if (html.includes(oldIndian)) { html = html.replace(oldIndian, newIndian); fixes++; console.log('✅ Indian card updated'); }

const oldBritish = `<div class="oc sel" data-v="british" onclick="pk(this,'accent')"><div class="em" style="font-size:0"><img src="https://flagcdn.com/w40/gb.png" style="width:36px;height:auto;border-radius:4px"></div><h4>British</h4><p>Susan &amp; George</p></div>`;
const newBritish = `<div class="oc opc sel" data-v="british" onclick="pk(this,'accent')"><div class="opi" style="background:rgba(59,130,246,.1);padding:6px"><img src="https://flagcdn.com/w40/gb.png" style="width:30px;height:auto;border-radius:3px"></div><div><h4>British</h4><p>Susan &amp; George</p></div></div>`;
if (html.includes(oldBritish)) { html = html.replace(oldBritish, newBritish); fixes++; console.log('✅ British card updated'); }

const oldAmerican = `<div class="oc" data-v="american" onclick="pk(this,'accent')"><div class="em" style="font-size:0"><img src="https://flagcdn.com/w40/us.png" style="width:36px;height:auto;border-radius:4px"></div><h4>American</h4><p>Zira &amp; David</p></div>`;
const newAmerican = `<div class="oc opc" data-v="american" onclick="pk(this,'accent')"><div class="opi" style="background:rgba(239,68,68,.1);padding:6px"><img src="https://flagcdn.com/w40/us.png" style="width:30px;height:auto;border-radius:3px"></div><div><h4>American</h4><p>Zira &amp; David</p></div></div>`;
if (html.includes(oldAmerican)) { html = html.replace(oldAmerican, newAmerican); fixes++; console.log('✅ American card updated'); }

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('\n🎉 Done! ' + fixes + ' cards updated to horizontal layout.');
console.log('Now run: node server.js');
