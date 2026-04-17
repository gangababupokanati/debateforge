// fix_report.js - Adds security question based password reset
// Run: node fix_report.js
// Updates both server.js and public/index.html

const fs = require('fs');
let fixes = 0;

// =====================================================
// PART 1: UPDATE SERVER.JS
// =====================================================
let server = fs.readFileSync('server.js', 'utf8');

// 1a: Add securityQuestion and securityAnswer to User schema
const oldSchema = `const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});`;

const newSchema = `const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  securityQuestion: { type: String, default: '' },
  securityAnswer: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});`;

if (server.includes(oldSchema)) {
  server = server.replace(oldSchema, newSchema);
  fixes++;
  console.log('✅ Server FIX 1: Added securityQuestion fields to User schema');
} else {
  console.log('⏭️  Server FIX 1: Schema already updated or not found');
}

// 1b: Update register route to save security question
const oldRegister = `const user = new User({ name, email, password: hashedPassword });`;
const newRegister = `const securityQuestion = req.body.securityQuestion || '';
    const securityAnswer = req.body.securityAnswer ? req.body.securityAnswer.toLowerCase().trim() : '';
    const user = new User({ name, email, password: hashedPassword, securityQuestion, securityAnswer });`;

if (server.includes(oldRegister)) {
  server = server.replace(oldRegister, newRegister);
  fixes++;
  console.log('✅ Server FIX 2: Updated register route to save security question');
} else {
  console.log('⏭️  Server FIX 2: Register route already updated or not found');
}

// 1c: Add forgot password route before "// START SERVER" section
const forgotRoute = `
// ═══════════════════════════════════════
// FORGOT PASSWORD ROUTE
// ═══════════════════════════════════════

app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email, securityAnswer, newPassword } = req.body;
    if (!email || !securityAnswer || !newPassword) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'No account found with this email.' });
    }
    if (!user.securityAnswer) {
      return res.status(400).json({ error: 'No security question set for this account. Please contact support.' });
    }
    if (user.securityAnswer.toLowerCase().trim() !== securityAnswer.toLowerCase().trim()) {
      return res.status(400).json({ error: 'Security answer is incorrect.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ success: true, message: 'Password reset successful! You can now login.' });
  } catch (err) {
    console.error('Forgot password error:', err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

app.post('/api/get-security-question', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'No account found with this email.' });
    }
    if (!user.securityQuestion) {
      return res.status(400).json({ error: 'No security question set for this account.' });
    }
    res.json({ question: user.securityQuestion });
  } catch (err) {
    console.error('Get security question error:', err.message);
    res.status(500).json({ error: 'Something went wrong.' });
  }
});

`;

const insertBeforeServer = `// ═══════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════`;

if (!server.includes('/api/forgot-password') && server.includes(insertBeforeServer)) {
  server = server.replace(insertBeforeServer, forgotRoute + insertBeforeServer);
  fixes++;
  console.log('✅ Server FIX 3: Added forgot-password and get-security-question routes');
} else {
  console.log('⏭️  Server FIX 3: Routes already exist or insert point not found');
}

fs.writeFileSync('server.js', server, 'utf8');
console.log('   server.js updated!\n');

// =====================================================
// PART 2: UPDATE PUBLIC/INDEX.HTML
// =====================================================
let html = fs.readFileSync('public/index.html', 'utf8');

// 2a: Add security question field to registration form
const oldRegFields = `<div style="margin-bottom:14px;display:flex;align-items:flex-start;gap:8px">
      <input type="checkbox" id="rTC"`;

const newRegFields = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <div class="fd" style="margin-bottom:10px"><label>Security Question</label>
        <select id="rSQ" style="width:100%;padding:10px 14px;background:#131a2c;border:1px solid #1e293b;border-radius:9px;color:#f1f5f9;font-size:.9rem;font-family:Outfit,sans-serif">
          <option value="">Select a question</option>
          <option value="What is your pet's name?">What is your pet's name?</option>
          <option value="What city were you born in?">What city were you born in?</option>
          <option value="What is your favorite movie?">What is your favorite movie?</option>
          <option value="What is your mother's maiden name?">What is your mother's maiden name?</option>
          <option value="What was your first school name?">What was your first school name?</option>
        </select>
      </div>
      <div class="fd" style="margin-bottom:10px"><label>Security Answer</label><input id="rSA" placeholder="Your answer"></div>
    </div>
    <div style="margin-bottom:14px;display:flex;align-items:flex-start;gap:8px">
      <input type="checkbox" id="rTC"`;

if (html.includes(oldRegFields)) {
  html = html.replace(oldRegFields, newRegFields);
  fixes++;
  console.log('✅ HTML FIX 1: Added security question fields to registration form');
} else {
  console.log('⏭️  HTML FIX 1: Registration form already updated or not found');
}

// 2b: Update doRegister to send security question
const oldDoRegister = `var res=await fetch('/api/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:fn+' '+ln,email:email,password:pw,interest:ia,skillLevel:sl})});`;

const newDoRegister = `var sq=document.getElementById('rSQ').value;
var sa=document.getElementById('rSA').value.trim();
if(!sq||!sa){showRegErr('Security question and answer are required.');return}
var res=await fetch('/api/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:fn+' '+ln,email:email,password:pw,interest:ia,skillLevel:sl,securityQuestion:sq,securityAnswer:sa})});`;

if (html.includes(oldDoRegister)) {
  html = html.replace(oldDoRegister, newDoRegister);
  fixes++;
  console.log('✅ HTML FIX 2: Updated doRegister to send security question');
} else {
  console.log('⏭️  HTML FIX 2: doRegister already updated or not found');
}

// 2c: Replace "Forgot Password?" link with proper page navigation
const oldForgot = `<a href="#" onclick="alert('Password reset link sent to your email!');return false" style="color:#60a5fa;font-size:.8rem;text-decoration:none">Forgot Password?</a>`;

const newForgot = `<a href="#" onclick="go('forgot');return false" style="color:#60a5fa;font-size:.8rem;text-decoration:none">Forgot Password?</a>`;

if (html.includes(oldForgot)) {
  html = html.replace(oldForgot, newForgot);
  fixes++;
  console.log('✅ HTML FIX 3: Updated Forgot Password link');
} else {
  console.log('⏭️  HTML FIX 3: Forgot Password link already updated or not found');
}

// 2d: Add Forgot Password page HTML before <!-- HOME -->
const forgotPage = `<!-- FORGOT PASSWORD PAGE -->
<div class="pg" id="pg-forgot" style="display:none;align-items:center;justify-content:center;min-height:100vh;background:radial-gradient(ellipse at 50% 20%,rgba(59,130,246,.06),transparent 50%),#04070d">
  <div class="lb" style="max-width:440px">
    <div style="text-align:left;margin-bottom:16px"><button onclick="go('login')" style="background:none;border:none;color:#60a5fa;font-size:.85rem;cursor:pointer;font-family:Outfit,sans-serif">&#8592; Back to Login</button></div>
    <h1 style="font-size:1.4rem">Reset Password</h1>
    <p class="su">Answer your security question to reset</p>
    <div class="er" id="forgotErr"></div>
    <div style="display:none;padding:8px 12px;border-radius:8px;background:rgba(34,197,94,.1);color:#22c55e;font-size:.85rem;margin-bottom:10px" id="forgotOk"></div>
    <div class="fd" id="forgotStep1">
      <label>Email</label>
      <input id="fEmail" type="email" placeholder="Enter your registered email">
      <button class="bt ba" onclick="getSecurityQ()" style="margin-top:12px">Next &#8594;</button>
    </div>
    <div id="forgotStep2" style="display:none">
      <div class="fd" style="margin-bottom:12px">
        <label>Security Question</label>
        <div id="fQuestion" style="padding:10px 14px;background:#131a2c;border:1px solid #1e293b;border-radius:9px;color:#60a5fa;font-size:.9rem"></div>
      </div>
      <div class="fd" style="margin-bottom:12px"><label>Your Answer</label><input id="fAnswer" placeholder="Type your answer"></div>
      <div class="fd" style="margin-bottom:12px"><label>New Password</label><input id="fNewPw" type="password" placeholder="Enter new password"></div>
      <div class="fd" style="margin-bottom:12px"><label>Confirm New Password</label><input id="fConfPw" type="password" placeholder="Confirm new password"></div>
      <button class="bt ba" onclick="resetPassword()">Reset Password &#8594;</button>
    </div>
    <p style="text-align:center;margin-top:16px;font-size:.85rem;color:#475569">Remember your password? <a href="#" onclick="go('login');return false" style="color:#3b82f6;text-decoration:none;font-weight:600">Login</a></p>
  </div>
</div>

`;

const insertBeforeHome = `<!-- HOME -->`;

if (!html.includes('pg-forgot') && html.includes(insertBeforeHome)) {
  html = html.replace(insertBeforeHome, forgotPage + insertBeforeHome);
  fixes++;
  console.log('✅ HTML FIX 4: Added Forgot Password page');
} else {
  console.log('⏭️  HTML FIX 4: Forgot page already exists or insert point not found');
}

// 2e: Add forgot password JavaScript functions before "function pk("
const forgotJS = `// Forgot Password Functions
async function getSecurityQ(){
  var email=document.getElementById('fEmail').value.trim();
  var errEl=document.getElementById('forgotErr');
  errEl.style.display='none';
  if(!email){errEl.textContent='Please enter your email.';errEl.style.display='block';return}
  try{
    var res=await fetch('/api/get-security-question',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:email})});
    var data=await res.json();
    if(!res.ok){errEl.textContent=data.error;errEl.style.display='block';return}
    document.getElementById('fQuestion').textContent=data.question;
    document.getElementById('forgotStep1').style.display='none';
    document.getElementById('forgotStep2').style.display='block';
  }catch(e){errEl.textContent='Network error.';errEl.style.display='block'}
}
async function resetPassword(){
  var email=document.getElementById('fEmail').value.trim();
  var answer=document.getElementById('fAnswer').value.trim();
  var newPw=document.getElementById('fNewPw').value.trim();
  var confPw=document.getElementById('fConfPw').value.trim();
  var errEl=document.getElementById('forgotErr');
  var okEl=document.getElementById('forgotOk');
  errEl.style.display='none';okEl.style.display='none';
  if(!answer){errEl.textContent='Please enter your security answer.';errEl.style.display='block';return}
  if(!newPw||newPw.length<6){errEl.textContent='Password must be at least 6 characters.';errEl.style.display='block';return}
  if(newPw!==confPw){errEl.textContent='Passwords do not match.';errEl.style.display='block';return}
  try{
    var res=await fetch('/api/forgot-password',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:email,securityAnswer:answer,newPassword:newPw})});
    var data=await res.json();
    if(!res.ok){errEl.textContent=data.error;errEl.style.display='block';return}
    okEl.textContent='Password reset successful! Redirecting to login...';okEl.style.display='block';
    setTimeout(function(){go('login')},2000);
  }catch(e){errEl.textContent='Network error.';errEl.style.display='block'}
}
`;

const insertBeforePk = `function pk(el,k)`;

if (!html.includes('function getSecurityQ') && html.includes(insertBeforePk)) {
  html = html.replace(insertBeforePk, forgotJS + insertBeforePk);
  fixes++;
  console.log('✅ HTML FIX 5: Added forgot password JavaScript functions');
} else {
  console.log('⏭️  HTML FIX 5: Forgot password JS already exists or insert point not found');
}

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('   public/index.html updated!\n');

console.log('🎉 Done! ' + fixes + ' fixes applied.');
console.log('\nNext steps:');
console.log('1. Run: node server.js');
console.log('2. Test: Register a NEW account (with security question)');
console.log('3. Test: Click Forgot Password and reset it');
console.log('4. Push: git add . && git commit -m "Add forgot password" && git push origin main');