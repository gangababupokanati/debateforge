// fix_report.js - Fixes speech recognition disconnection in debate page
// Run: node fix_report.js

const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');
let fixes = 0;

// ============ FIX 1: Replace the old initSTT function with robust version ============
const oldInitSTT = `function initSTT(){
  var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR)return null;
  var r=new SR();
  r.continuous=true;
  r.interimResults=true;
  r.lang='en-US';
  var finalText='';
  r.onresult=function(e){
    var interim='';
    finalText='';
    for(var i=0;i<e.results.length;i++){
      if(e.results[i].isFinal){
        finalText+=e.results[i][0].transcript+' ';
      }else{
        interim+=e.results[i][0].transcript;
      }
    }
    var inp=document.getElementById('cI');
    if(inp) inp.value=finalText+interim;
    if(silenceTimer)clearTimeout(silenceTimer);
    silenceTimer=setTimeout(function(){
      if(S.rec){
        S.recognition.stop();
        S.rec=false;
        document.getElementById('mB').classList.remove('rec');
        var inp2=document.getElementById('cI');
        if(inp2) inp2.value=finalText.trim();
        if(S.active&&finalText.trim()){
          setTimeout(function(){sendMsg()},300);
        }
      }
    },3000);
  };
  r.onend=function(){
    S.rec=false;
    document.getElementById('mB').classList.remove('rec');
    if(silenceTimer){clearTimeout(silenceTimer);silenceTimer=null}
    finalText='';
  };
  r.onerror=function(){
    S.rec=false;
    document.getElementById('mB').classList.remove('rec');
    if(silenceTimer){clearTimeout(silenceTimer);silenceTimer=null}
    finalText='';
  };
  return r
}`;

const newInitSTT = `function initSTT(){
  var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR)return null;
  var r=new SR();
  r.continuous=true;
  r.interimResults=true;
  r.lang='en-US';
  r.maxAlternatives=1;
  var finalText='';
  var restartAttempts=0;
  var maxRestarts=5;
  r.onresult=function(e){
    var interim='';
    finalText='';
    restartAttempts=0;
    for(var i=0;i<e.results.length;i++){
      if(e.results[i].isFinal){
        finalText+=e.results[i][0].transcript+' ';
      }else{
        interim+=e.results[i][0].transcript;
      }
    }
    var inp=document.getElementById('cI');
    if(inp) inp.value=finalText+interim;
    var st=document.getElementById('debateStatusText');
    if(st) st.textContent='Listening...';
    if(silenceTimer)clearTimeout(silenceTimer);
    silenceTimer=setTimeout(function(){
      if(S.rec){
        S.recognition.stop();
        S.rec=false;
        document.getElementById('mB').classList.remove('rec');
        var inp2=document.getElementById('cI');
        if(inp2) inp2.value=finalText.trim();
        if(S.active&&finalText.trim()){
          setTimeout(function(){sendMsg()},300);
        }
      }
    },4000);
  };
  r.onend=function(){
    if(silenceTimer){clearTimeout(silenceTimer);silenceTimer=null}
    if(S.active&&S.rec&&restartAttempts<maxRestarts){
      restartAttempts++;
      console.log('Speech recognition ended, restarting... attempt '+restartAttempts);
      setTimeout(function(){
        if(S.active&&S.rec){
          try{
            finalText='';
            r.start();
            var st=document.getElementById('debateStatusText');
            if(st) st.textContent='Listening...';
          }catch(e){
            console.log('Could not restart speech recognition');
            S.rec=false;
            document.getElementById('mB').classList.remove('rec');
          }
        }
      },300);
    }else{
      S.rec=false;
      document.getElementById('mB').classList.remove('rec');
      finalText='';
    }
  };
  r.onerror=function(e){
    console.log('Speech recognition error: '+e.error);
    if(e.error==='no-speech'){
      if(S.active&&S.rec&&restartAttempts<maxRestarts){
        restartAttempts++;
        return;
      }
    }
    if(e.error==='aborted'||e.error==='network'){
      if(S.active&&S.rec&&restartAttempts<maxRestarts){
        restartAttempts++;
        return;
      }
    }
    if(silenceTimer){clearTimeout(silenceTimer);silenceTimer=null}
    S.rec=false;
    document.getElementById('mB').classList.remove('rec');
    finalText='';
  };
  return r
}`;

if (html.includes(oldInitSTT)) {
  html = html.replace(oldInitSTT, newInitSTT);
  fixes++;
  console.log('✅ FIX 1: Replaced initSTT with robust auto-restart version');
} else {
  console.log('⏭️  FIX 1: initSTT not found (may need manual check)');
}

// ============ FIX 2: Replace autoStartMic with more robust version ============
const oldAutoStart = `function autoStartMic(){
    if(!S.recognition)S.recognition=initSTT();
    if(!S.recognition||S.rec)return;
    try{
      sttFinalText='';
      document.getElementById('cI').value='';
      S.rec=true;
      document.getElementById('mB').classList.add('rec');
      S.recognition.start();
    }catch(e){}
  }`;

const newAutoStart = `function autoStartMic(){
    if(!S.recognition)S.recognition=initSTT();
    if(!S.recognition)return;
    if(S.rec){
      try{S.recognition.stop();}catch(e){}
      S.rec=false;
      document.getElementById('mB').classList.remove('rec');
    }
    setTimeout(function(){
      try{
        document.getElementById('cI').value='';
        S.rec=true;
        document.getElementById('mB').classList.add('rec');
        S.recognition.start();
        var st=document.getElementById('debateStatusText');
        if(st) st.textContent='Listening...';
      }catch(e){
        console.log('autoStartMic error: '+e.message);
        S.rec=false;
        document.getElementById('mB').classList.remove('rec');
      }
    },500);
  }`;

if (html.includes(oldAutoStart)) {
  html = html.replace(oldAutoStart, newAutoStart);
  fixes++;
  console.log('✅ FIX 2: Replaced autoStartMic with robust version');
} else {
  console.log('⏭️  FIX 2: autoStartMic not found (may need manual check)');
}

// ============ FIX 3: Fix toggleMic to properly stop and restart ============
const oldToggleMic = `function toggleMic(){
    if(!S.recognition)S.recognition=initSTT();
    if(!S.recognition){alert('Use Chrome for speech recognition.');return}
    if(S.rec){
      S.rec=false;
      if(silenceTimer){clearTimeout(silenceTimer);silenceTimer=null}
      S.recognition.stop();
      document.getElementById('mB').classList.remove('rec');
      var inp=document.getElementById('cI');
      if(S.active&&inp&&inp.value.trim()){
        setTimeout(function(){sendMsg()},300);
      }
      sttFinalText='';
    }else{
      sttFinalText='';
      document.getElementById('cI').value='';
      S.rec=true;
      document.getElementById('mB').classList.add('rec');
      try{S.recognition.start()}catch(e){}
    }
   }`;

const newToggleMic = `function toggleMic(){
    if(!S.recognition)S.recognition=initSTT();
    if(!S.recognition){alert('Use Chrome for speech recognition.');return}
    if(S.rec){
      S.rec=false;
      if(silenceTimer){clearTimeout(silenceTimer);silenceTimer=null}
      try{S.recognition.stop();}catch(e){}
      document.getElementById('mB').classList.remove('rec');
      var inp=document.getElementById('cI');
      if(S.active&&inp&&inp.value.trim()){
        setTimeout(function(){sendMsg()},300);
      }
    }else{
      document.getElementById('cI').value='';
      S.rec=true;
      document.getElementById('mB').classList.add('rec');
      try{S.recognition.start();}catch(e){
        S.rec=false;
        document.getElementById('mB').classList.remove('rec');
        setTimeout(function(){
          try{
            S.rec=true;
            document.getElementById('mB').classList.add('rec');
            S.recognition.start();
          }catch(e2){
            S.rec=false;
            document.getElementById('mB').classList.remove('rec');
          }
        },500);
      }
    }
   }`;

if (html.includes(oldToggleMic)) {
  html = html.replace(oldToggleMic, newToggleMic);
  fixes++;
  console.log('✅ FIX 3: Replaced toggleMic with robust version');
} else {
  console.log('⏭️  FIX 3: toggleMic not found (may need manual check)');
}

// ============ FIX 4: Increase silence timer from 3s to 4s ============
// Already handled in FIX 1 (changed from 3000 to 4000)

// ============ FIX 5: Fix sendMsg to properly stop recognition before sending ============
const oldSendMsg = `function sendMsg(){var inp=document.getElementById('cI'),t=inp.value.trim();if(!t||!S.active)return;inp.value='';stopSpk();if(S.rec&&S.recognition){S.recognition.stop();S.rec=false;document.getElementById('mB').classList.remove('rec')}S.msgs.push({role:'user',text:t});addLog('user',t);S.turn++;getAIResponse(S.msgs,false)}`;

const newSendMsg = `function sendMsg(){var inp=document.getElementById('cI'),t=inp.value.trim();if(!t||!S.active)return;inp.value='';stopSpk();if(silenceTimer){clearTimeout(silenceTimer);silenceTimer=null}if(S.rec&&S.recognition){try{S.recognition.stop();}catch(e){}S.rec=false;document.getElementById('mB').classList.remove('rec')}var st=document.getElementById('debateStatusText');if(st)st.textContent='Processing...';S.msgs.push({role:'user',text:t});addLog('user',t);S.turn++;getAIResponse(S.msgs,false)}`;

if (html.includes(oldSendMsg)) {
  html = html.replace(oldSendMsg, newSendMsg);
  fixes++;
  console.log('✅ FIX 4: Fixed sendMsg to clear timers and stop recognition properly');
} else {
  console.log('⏭️  FIX 4: sendMsg not found (may need manual check)');
}

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('\n🎉 Done! ' + fixes + ' fixes applied.');
console.log('Now run: node server.js');
console.log('Then push to GitHub: git add . && git commit -m "Fix speech recognition" && git push origin main');
