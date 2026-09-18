(() => {
  'use strict';
  const $=id=>document.getElementById(id),format=n=>Math.floor(n).toLocaleString('en-US',{minimumIntegerDigits:6});
  const table=BUMPERY_TABLES.find(table=>table.id===document.body.dataset.table);
  if(!table)throw Error('This table is not registered.');
  const storageKey=key=>key.replace(/^starbound\./,table.storageNamespace+'.');
  const read=(key,fallback)=>{try{return localStorage.getItem(storageKey(key))??fallback;}catch{return fallback;}};
  const write=(key,value)=>{try{localStorage.setItem(storageKey(key),String(value));}catch{/* Private storage must not stop a game. */}};
  let best=Math.max(0,Number(read('starbound.best','0'))||0),muted=read('starbound.muted','true')!=='false',audio=null,paused=false,accumulator=0,last=0;
  const renderer=new OldCourseRenderer($('table'));
  const cabinet=document.createElement('div');cabinet.className='cabinet';cabinet.setAttribute('aria-label','Table modes and unlocks');document.querySelector('.mission').after(cabinet);
  const show=new OldCourseShow(cabinet);
  const modeGuide=document.createElement('p');modeGuide.textContent='Nine original links holes. Aim with left/right, choose Brassie, Iron or Putter with Club (C), then hold and release Strike (Space). The wooden flipper travels with your ball. Rough and pot bunkers shorten shots; wind bends longer shots. Water or out-of-bounds returns you to your previous lie with one penalty stroke. Enter the cup gently; fast balls roll across it. Ten strokes picks up the hole. Lowest total strokes wins. This is an original course, not a recreation of St Andrews.';$('guide').append(modeGuide);
  const leaderboard=new StarboundLeaderboard({...globalThis.STARBOUND_CONFIG,rpcPrefix:table.rpcPrefix,storageNamespace:table.storageNamespace});
  let runPromise=null,runGeneration=0,pendingScore=null;
  try{pendingScore=JSON.parse(read('starbound.pending','null'));}catch{}
  const callsign=read('starbound.nickname','');$('nickname').value=callsign;
  const scoresButton=document.createElement('button');scoresButton.id='scores';scoresButton.textContent='☆ Scores';document.querySelector('.toolbar').append(scoresButton);
  const nudgeButton=document.createElement('button');nudgeButton.id='nudge';nudgeButton.textContent='♧ Club';document.querySelector('.controls').insertBefore(nudgeButton,$('right'));
  const shareButton=document.createElement('button');shareButton.id='share-score';shareButton.className='quiet-button';shareButton.textContent='View leaderboard / post score';shareButton.hidden=true;$('start').after(shareButton);
  const touch=matchMedia('(pointer: coarse)').matches;
  if(touch)$('launch').querySelector('span').textContent='HOLD & RELEASE';
  function tone(frequency,duration=.08,type='sine',volume=.045){
    if(muted||paused||!audio||audio.state!=='running')return;
    const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.setValueAtTime(frequency,audio.currentTime);o.frequency.exponentialRampToValueAtTime(frequency*.7,audio.currentTime+duration);g.gain.setValueAtTime(volume,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+duration);
  }
  function unlockAudio(){if(muted)return;try{audio??=new AudioContext();if(audio.state==='suspended')audio.resume().catch(()=>{});}catch{muted=true;}}
  const game=new OldCourse.Game(event=>{
    renderer.effect(event);
    switch(event.type){
      case 'holeStart':clearInputs();$('launch').setAttribute('aria-label','Hold to draw back, release to strike');$('launch').querySelector('span').textContent='HOLD & RELEASE';$('launch').firstChild.textContent='STRIKE ';message('Hole '+(game.holeIndex+1)+': '+game.hole.name+'. Aim, choose a club, and hold Strike.');break;
      case 'strike':clearInputs();tone(170,.15,'triangle');message('A clean strike.');break;
      case 'club':message(OldCourse.clubs[game.club].name+' selected.');break;
      case 'penalty':message('Penalty stroke. Back to your previous lie.');tone(100,.2);break;
      case 'rest':message(game.lie+'. '+Math.round(Math.hypot(game.ball.x-game.cup.x,game.ball.y-game.cup.y)/3)+' yards to the flag.');break;
      case 'holed':clearInputs();$('launch').setAttribute('aria-label',game.holeIndex===8?'Finish round':'Next hole');$('launch').firstChild.textContent=game.holeIndex===8?'FINISH ':'NEXT ';$('launch').querySelector('span').textContent='TAP';message(event.pickedUp?'Ten strokes. Pick up and move on.':'Holed in '+game.strokes+'. Mark your card.');tone(660,.4);break;
      case 'over':updateBest();showOverlay('ROUND COMPLETE',game.total+' strokes.', 'A proper round.<br>Your best: '+(162-best/25)+' strokes.','Play another round ↗');shareButton.hidden=false;finishRankedRun();break;
    }
  });
  function message(text){$('message').textContent=text;}
  function updateBest(){if(game.state==='over'&&game.score>best){best=game.score;write('starbound.best',best);}}
  function showOverlay(kicker,title,copy,button){$('overlay-kicker').textContent=kicker;$('overlay-title').innerHTML=title;$('overlay-copy').innerHTML=copy;$('start').textContent=button;$('overlay').hidden=false;}
  function clearInputs(){game.input.left=false;game.input.right=false;game.input.launch=false;game.charge=0;for(const id of ['left','right','launch'])$(id).classList.remove('held');held.clear();}
  function setPause(value){if(game.state==='ready'||game.state==='over')return;if(!value)closeMenu();paused=value;clearInputs();accumulator=0;$('pause').textContent=paused?'▶ Resume':'Ⅱ Pause';shareButton.hidden=true;if(paused){updateBest();showOverlay('TAKE A BREATH','Take your time.','Your game is paused.<br>Resume when you’re ready.','Resume game ↗');}else{$('overlay').hidden=true;unlockAudio();}}
  function start(){closeMenu();unlockAudio();if(paused){setPause(false);$('start').blur();return;}runGeneration++;runPromise=leaderboard.begin().catch(()=>null);game.start();clearInputs();show.reset();paused=false;accumulator=0;renderer.effects=[];renderer.trail=[];shareButton.hidden=true;$('overlay').hidden=true;$('pause').textContent='Ⅱ Pause';$('start').blur();}
  function prepareForm(){const eligible=Boolean(pendingScore?.id&&pendingScore.score>0&&leaderboard.configured);$('score-form').hidden=!eligible;if(eligible)$('submit-summary').textContent=`Post your completed run: ${162-pendingScore.score/25} strokes.`;}
  async function finishRankedRun(){
    const generation=runGeneration,score=game.score,seconds=Math.floor(game.elapsedTime*1000)/1000;
    const id=await runPromise;if(generation!==runGeneration)return;
    pendingScore=id?{id,score,seconds}:null;write('starbound.pending',JSON.stringify(pendingScore));prepareForm();
  }
  let refreshSequence=0;
  async function refreshScores(){
    const request=++refreshSequence;$('leaderboard-status').textContent='Loading scores…';$('refresh-leaderboard').disabled=true;
    try{
      const rows=await leaderboard.top();if(request!==refreshSequence)return;
      if(!Array.isArray(rows))throw Error('The leaderboard returned an unreadable response.');
      $('leaderboard-list').replaceChildren();
      for(const row of rows.slice(0,50)){const li=document.createElement('li'),name=document.createElement('span'),score=document.createElement('strong');name.textContent=String(row.nickname).slice(0,16);score.textContent=(162-Number(row.score)/25)+' strokes';li.append(name,score);$('leaderboard-list').append(li);}
      $('leaderboard-status').textContent=rows.length?'Live scores · updates when refreshed':'No runs posted yet. Be the first.';
    }catch(error){if(request===refreshSequence){$('leaderboard-list').replaceChildren();$('leaderboard-status').textContent=navigator.onLine?error.message:'You’re offline. Play locally; connect to view the global leaderboard.';}}
    finally{if(request===refreshSequence)$('refresh-leaderboard').disabled=false;}
  }
  function openScores(){setPause(true);prepareForm();$('leaderboard-dialog').showModal();refreshScores();}
  scoresButton.addEventListener('click',openScores);shareButton.addEventListener('click',openScores);
  $('close-leaderboard').addEventListener('click',()=>$('leaderboard-dialog').close());
  $('refresh-leaderboard').addEventListener('click',refreshScores);
  $('score-form').addEventListener('submit',async e=>{
    e.preventDefault();const run=pendingScore;if(!run)return;const nickname=$('nickname').value.trim();$('submit-score').disabled=true;
    try{await leaderboard.submit(run,nickname);write('starbound.nickname',nickname);if(pendingScore?.id===run.id){pendingScore=null;write('starbound.pending','null');}prepareForm();await refreshScores();$('leaderboard-status').textContent='Run received! Your best score is on the leaderboard.';}
    catch(error){$('leaderboard-status').textContent=error.message;}finally{$('submit-score').disabled=false;}
  });
  function toggleSound(){muted=!muted;write('starbound.muted',muted);$('sound').textContent=muted?'♪ Sound off':'♪ Sound on';$('sound').setAttribute('aria-pressed',String(!muted));unlockAudio();if(!muted)tone(660,.15);}
  const held=new Set();
  function input(name,on,source){
    if(paused||game.state==='ready'||game.state==='over')return;if(game.state==='hole'){if(name==='launch'&&on){game.launch();clearInputs();}return;}if(game.state==='rolling')return;
    const was=game.input[name];if(on)held.add(source);else held.delete(source);
    game.input[name]=[...held].some(s=>s.startsWith(name+':'));
    $(name).classList.toggle('held',game.input[name]);
    if(name==='launch'&&was&&!game.input.launch)game.launch();
    if(on){unlockAudio();if(name!=='launch'&&!was)tone(95,.045,'triangle');}
  }
  const bindings={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',Space:'launch'};
  window.addEventListener('keydown',e=>{
    if(e.ctrlKey||e.metaKey||e.altKey)return;
    if(document.querySelector('dialog[open]')||e.target.matches?.('input,textarea,select,[contenteditable]'))return;
    // Native keyboard activation remains available on focused menu buttons.
    if((e.code==='Space'||e.code==='Enter')&&e.target instanceof HTMLButtonElement&&!['left','right','launch'].includes(e.target.id))return;
    if(bindings[e.code]){e.preventDefault();if(!e.repeat)input(bindings[e.code],true,bindings[e.code]+':'+e.code);}
    else if(!e.repeat){if(e.code==='KeyP'||e.code==='Escape'){e.preventDefault();setPause(!paused);}if(e.code==='KeyC'&&!paused)game.nextClub();if(e.code==='KeyM')toggleSound();}
  });
  window.addEventListener('keyup',e=>{if(bindings[e.code]){e.preventDefault();input(bindings[e.code],false,bindings[e.code]+':'+e.code);}});
  for(const name of ['left','right','launch']){
    const button=$(name);button.addEventListener('pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);input(name,true,name+':pointer'+e.pointerId);});
    button.addEventListener('pointerup',e=>input(name,false,name+':pointer'+e.pointerId));
    const cancel=e=>{held.delete(name+':pointer'+e.pointerId);game.input[name]=[...held].some(s=>s.startsWith(name+':'));button.classList.toggle('held',game.input[name]);if(name==='launch'&&!game.input.launch)game.charge=0;};
    button.addEventListener('pointercancel',cancel);button.addEventListener('lostpointercapture',cancel);
  }
  function closeMenu(){document.body.classList.remove('menu-open');$('game-menu').setAttribute('aria-expanded','false');$('guide').hidden=true;$('help').setAttribute('aria-expanded','false');}
  $('game-menu').addEventListener('click',()=>{const open=!document.body.classList.contains('menu-open');if(open)setPause(true);else closeMenu();document.body.classList.toggle('menu-open',open);$('game-menu').setAttribute('aria-expanded',String(open));});
  $('start').addEventListener('click',start);$('pause').addEventListener('click',()=>setPause(!paused));$('sound').addEventListener('click',toggleSound);
  nudgeButton.addEventListener('click',()=>{if(!paused){unlockAudio();game.nextClub();}});
  $('sound').textContent=muted?'♪ Sound off':'♪ Sound on';$('sound').setAttribute('aria-pressed',String(!muted));
  $('help').addEventListener('click',()=>{$('guide').hidden=!$('guide').hidden;$('help').setAttribute('aria-expanded',String(!$('guide').hidden));});
  $('fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{message('Fullscreen is unavailable here. The table still fits your window.');}});
  document.addEventListener('fullscreenchange',()=>{if($('fullscreen'))$('fullscreen').textContent=document.fullscreenElement?'⛶ Exit fullscreen':'⛶ Fullscreen';});
  document.addEventListener('bumpery:menu',()=>setPause(true));
  window.addEventListener('blur',()=>setPause(true));document.addEventListener('visibilitychange',()=>{if(document.hidden)setPause(true);});window.addEventListener('pagehide',updateBest);
  new ResizeObserver(()=>renderer.resize()).observe($('table'));
  let lastScore=-1,lastBall=-1,lastBest=-1,lastBeacons='';
  function frame(now){
    const dt=Math.min((now-(last||now))/1000,.05);last=now;
    if(!paused){accumulator+=dt;while(accumulator>=OldCourse.STEP){game.step();accumulator-=OldCourse.STEP;}}
    const strokes=game.total+((game.state==='hole'||game.state==='over')?0:game.strokes);if(strokes!==lastScore){$('score').textContent=strokes+(strokes===1?' stroke':' strokes');lastScore=strokes;}
    if(best!==lastBest){$('best').textContent=best?(162-best/25)+' strokes':'—';lastBest=best;}
    if(game.holeIndex!==lastBall){$('ball-count').innerHTML=`0${game.holeIndex+1} <small>/ 09</small>`;lastBall=game.holeIndex;}
    $('launch').disabled=game.state==='rolling';nudgeButton.disabled=game.state!=='aim';$('left').disabled=$('right').disabled=game.state!=='aim';$('pause').disabled=game.state==='ready'||game.state==='over';show.update(game,paused);renderer.draw(game,dt,paused);requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
