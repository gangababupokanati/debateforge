// fix_report.js - Comprehensive bug fix for DebateForge
// Run: node fix_report.js

const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');
let fixes = 0;

// ============ FIX 1: Fix broken bD badge HTML ============
if (html.includes('id="bD" style="display:none"> style="display:none">')) {
  html = html.replace('id="bD" style="display:none"> style="display:none">', 'id="bD" style="display:none">');
  fixes++;
  console.log('FIX 1: Fixed broken bD badge');
}

// ============ FIX 2: Fix broken bO badge HTML ============
if (html.includes('id="bO" style="display:none"> style="display:none">')) {
  html = html.replace('id="bO" style="display:none"> style="display:none">', 'id="bO" style="display:none">');
  fixes++;
  console.log('FIX 2: Fixed broken bO badge');
}

// ============ FIX 4: Fix review page nesting ============
// pg-review is inside pg-debate > .df div. Need to close those before review.
var reviewIdx = html.indexOf('<!-- REVIEW -->');
if (reviewIdx > -1) {
  var debateStart = html.indexOf('<div class="pg" id="pg-debate">');
  if (debateStart > -1) {
    var section = html.substring(debateStart, reviewIdx);
    var opens = (section.match(/<div[\s>]/g) || []).length;
    var closes = (section.match(/<\/div>/g) || []).length;
    var missing = opens - closes;
    if (missing > 0) {
      var before = html.substring(0, reviewIdx).trimEnd();
      var after = html.substring(reviewIdx);
      var addDivs = '';
      for (var i = 0; i < missing; i++) addDivs += '\n</div>';
      html = before + addDivs + '\n\n' + after;
      fixes++;
      console.log('FIX 4: Added ' + missing + ' missing </div> before REVIEW (fixes nesting)');
    } else {
      console.log('SKIP 4: Div count balanced');
    }
  }
}

// ============ FIX 5: Add End Debate button to debate bar ============
if (!html.includes('End Debate</button></div>\n    </div>') && !html.includes('End Debate</button>')) {
  var timerSpan = '<div class="dc"><span class="tm" id="tmr">00:00</span></div>';
  var timerWithBtn = '<div class="dc"><span class="tm" id="tmr">00:00</span><button class="bt br bs" onclick="endDebateToReview()" style="margin-left:12px">End Debate</button></div>';
  if (html.includes(timerSpan)) {
    html = html.replace(timerSpan, timerWithBtn);
    fixes++;
    console.log('FIX 5: Added End Debate button to debate bar');
  }
}

// ============ FIX 6: Increase silence timer to 4000ms ============
if (html.includes('},3000)') && html.includes('silenceTimer')) {
  html = html.replace('},3000)', '},4000)');
  fixes++;
  console.log('FIX 6: Silence timer increased to 4000ms');
}

// ============ FIX 7: Ensure review page has width:100% and color ============
if (html.includes('id="pg-review"') && !html.includes('pg-review" style="display:none;padding-top:56px;min-height:100vh;width:100%;color:#f1f5f9"')) {
  html = html.replace(
    /id="pg-review" style="[^"]*"/,
    'id="pg-review" style="display:none;padding-top:56px;min-height:100vh;width:100%;color:#f1f5f9"'
  );
  fixes++;
  console.log('FIX 7: Review page styling fixed');
}

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('\nDone! ' + fixes + ' fixes applied.');
console.log('\nNext:');
console.log('  node server.js');
console.log('  git add . && git commit -m "Fix all bugs" && git push origin main');