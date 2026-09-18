(() => {
  'use strict';
  const $=id=>document.getElementById(id),format=n=>Math.floor(n).toLocaleString('en-US',{minimumIntegerDigits:6});
  const table=BUMPERY_TABLES.find(table=>table.id===document.body.dataset.table);
  if(!table)throw Error('This table is not registered.');
  const storageKey=key=>key.replace(/^starbound\./,table.storageNamespace+'.');
  const read=(key,fallback)=>{try{return localStorage.getItem(storageKey(key))??fallback;}catch{return fallback;}};
  const write=(key,value)=>{try{localStorage.setItem(storageKey(key),String(value));}catch{/* Private storage must not stop a game. */}};
  let best=Math.max(0,Number(read('starbound.best','0'))||0),muted=read('starbound.muted','true')!=='false',audio=null,paused=false,accumulator=0,last=0;
  const renderer=new GetawayRenderer($('table'));
  const cabinet=document.createElement('div');cabinet.className='cabinet';cabinet.setAttribute('aria-label','Table modes and unlocks');document.querySelector('.mission').after(cabinet);
  const show=new GetawayShow(cabinet);
  const modeGuide=document.createElement('p');modeGuide.textContent='HIDEOUT: shoot the lit pocket to lock the ball and start a chase. Steer with the flippers. Avoid traffic, roadblocks, and pursuers; three hits end the chase. Earn 250 points per second times your score multiplier. The table freezes until you return. Light all three signals or clear six targets to reopen the hideout. A target bank shifts up a gear and raises scoring, up to 5×. Three quick nudges tilt the table.';$('guide').append(modeGuide);
  const leaderboard=new StarboundLeaderboard({...globalThis.STARBOUND_CONFIG,rpcPrefix:table.rpcPrefix,storageNamespace:table.storageNamespace});
  let runPromise=null,runGeneration=0,pendingScore=null;
  try{pendingScore=JSON.parse(read('starbound.pending','null'));}catch{}
  const callsign=read('starbound.nickname','');$('nickname').value=callsign;
  const scoresButton=document.createElement('button');scoresButton.id='scores';scoresButton.textContent='☆ Scores';document.querySelector('.toolbar').append(scoresButton);
  const nudgeButton=document.createElement('button');nudgeButton.id='nudge';nudgeButton.textContent='↟ Nudge';document.querySelector('.controls').insertBefore(nudgeButton,$('right'));
  const shareButton=document.createElement('button');shareButton.id='share-score';shareButton.className='quiet-button';shareButton.textContent='View leaderboard / post score';shareButton.hidden=true;$('start').after(shareButton);
  const touch=matchMedia('(pointer: coarse)').matches;
  if(touch)$('launch').querySelector('span').textContent='HOLD & RELEASE';
  function tone(frequency,duration=.08,type='sine',volume=.045){
    if(muted||paused||!audio||audio.state!=='running')return;
    const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.setValueAtTime(frequency,audio.currentTime);o.frequency.exponentialRampToValueAtTime(frequency*.7,audio.currentTime+duration);g.gain.setValueAtTime(volume,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+duration);
  }
  function unlockAudio(){if(muted)return;try{audio??=new AudioContext();if(audio.state==='suspended')audio.resume().catch(()=>{});}catch{muted=true;}}
  const game=new Getaway.Game(event=>{
    renderer.effect(event);
    switch(event.type){
      case 'loaded':message(touch?'Hold Launch, then release.':'Hold Space. Release to hit the streets.');break;
      case 'save':message('A second chance. Ball saved—launch again.');tone(330,.4);break;
      case 'launch':message('Shoot the lit hideout pocket.');tone(140,.25,'triangle');break;
      case 'chaseStart':clearInputs();setSteering(true);message('Ball locked. Steer with the flippers and survive.');tone(160,.5,'triangle');break;
      case 'chaseHit':tone(70,.2,'sawtooth');break;
      case 'chaseCrash':message('Chase over. Returning to the table.');tone(60,.6,'triangle');break;
      case 'chaseEnd':clearInputs();setSteering(false);message(event.seconds.toFixed(1)+' seconds survived. +'+format(event.bonus)+' bonus.');show.announce('CHASE BONUS +'+format(event.bonus),'','combo',game.time,4);tone(660,.3);break;
      case 'gear':message('Gear '+game.gear+'! '+game.multiplier+'× scoring. Hideout open.');show.announce('GEAR '+game.gear+' · HIDEOUT LIT','','combo',game.time,3);tone(740,.3);break;
      case 'lockReady':message('Hideout open. Shoot the illuminated pocket.');tone(880,.2);break;
      case 'beacon':tone(540+event.index*120,.18);break;
      case 'combo':show.announce(`${event.count}-SHOT COMBO`,`+${format(event.count*250*game.multiplier)} · KEEP THE CHAIN ALIVE`,'combo',game.time,1);tone(400+event.count*100,.12);break;
      case 'superCombo':message('Redline combo! Six different shots.');show.announce('REDLINE COMBO',`+${format(2500*game.multiplier)} BONUS`,'hyper',game.time,3);tone(1047,.4);break;
      case 'skillShot':message('Precision launch! Skill shot bonus.');show.announce('SKILL SHOT',`+${format(1000*game.multiplier)} · PRECISION LAUNCH`,'combo',game.time,2);tone(880,.3);break;
      case 'shield':tone(180,.05,'sine',.025);break;
      case 'nudge':message(event.danger?'Easy, driver. One more nudge risks tilt.':'Keep it on the road.');tone(85,.12,'triangle');break;
      case 'tilt':message('TILT. Special modes cancelled; flippers disabled.');show.announce('TILT','FLIPPERS DISABLED','tilt',game.time,5);tone(65,.6,'sawtooth',.025);break;
      case 'hit':tone(event.kind.startsWith('bumper')?420+Math.random()*120:260,.07);break;
      case 'flipHit':tone(120,.06,'triangle');break;
      case 'over':updateBest();showOverlay('RUN COMPLETE','End of the road.',`Final score: ${format(game.score)}<br>Personal best: ${format(best)}`,'Play again ↗');shareButton.hidden=false;finishRankedRun();message('Run complete. One more drive?');break;
    }
  });
  function setSteering(on){for(const id of ['left','right']){$(id).querySelector('span').textContent=on?'STEER':'FLIP';$(id).setAttribute('aria-label',(id==='left'?'Left':'Right')+(on?' steering':' flipper'));}$('launch').disabled=on;nudgeButton.disabled=on;}
  function message(text){$('message').textContent=text;}
  function updateBest(){if(game.score>best){best=game.score;write('starbound.best',best);}}
  function showOverlay(kicker,title,copy,button){$('overlay-kicker').textContent=kicker;$('overlay-title').innerHTML=title;$('overlay-copy').innerHTML=copy;$('start').textContent=button;$('overlay').hidden=false;}
  function clearInputs(){game.input.left=false;game.input.right=false;game.input.launch=false;game.charge=0;for(const id of ['left','right','launch'])$(id).classList.remove('held');held.clear();}
  function setPause(value){if(game.state==='ready'||game.state==='over')return;if(!value)closeMenu();paused=value;clearInputs();accumulator=0;$('pause').textContent=paused?'▶ Resume':'Ⅱ Pause';shareButton.hidden=true;if(paused){updateBest();showOverlay('TAKE A BREATH','Engine off.','Your game is paused.<br>Resume when you’re ready.','Resume game ↗');}else{$('overlay').hidden=true;unlockAudio();}}
  function start(){closeMenu();unlockAudio();if(paused){setPause(false);$('start').blur();return;}runGeneration++;runPromise=leaderboard.begin().catch(()=>null);game.start();clearInputs();setSteering(false);show.reset();paused=false;accumulator=0;renderer.effects=[];renderer.trail=[];shareButton.hidden=true;$('overlay').hidden=true;$('pause').textContent='Ⅱ Pause';$('start').blur();}
  function prepareForm(){const eligible=Boolean(pendingScore?.id&&pendingScore.score>0&&leaderboard.configured);$('score-form').hidden=!eligible;if(eligible)$('submit-summary').textContent=`Post your completed run: ${format(pendingScore.score)} points.`;}
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
      for(const row of rows.slice(0,50)){const li=document.createElement('li'),name=document.createElement('span'),score=document.createElement('strong');name.textContent=String(row.nickname).slice(0,16);score.textContent=format(Number(row.score)||0);li.append(name,score);$('leaderboard-list').append(li);}
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
    if(paused||game.state==='ready'||game.state==='over')return;
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
    else if(!e.repeat){if(e.code==='KeyP'||e.code==='Escape'){e.preventDefault();setPause(!paused);}if(e.code==='KeyN'&&!paused)game.nudge();if(e.code==='KeyM')toggleSound();}
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
  nudgeButton.addEventListener('click',()=>{if(!paused){unlockAudio();game.nudge();}});
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
    if(!paused){accumulator+=dt;while(accumulator>=Getaway.STEP){game.step();accumulator-=Getaway.STEP;}}
    if(game.score!==lastScore){$('score').textContent=format(game.score);lastScore=game.score;updateBest();}
    if(best!==lastBest){$('best').textContent=format(best);lastBest=best;}
    if(game.ballNumber!==lastBall){$('ball-count').innerHTML=`0${game.ballNumber} <small>/ 03</small>`;lastBall=game.ballNumber;}
    const beacons=game.lit.join();if(beacons!==lastBeacons){game.lit.forEach((v,i)=>$('beacon-'+i).classList.toggle('lit',v));lastBeacons=beacons;}
    $('pause').disabled=game.state==='ready'||game.state==='over';show.update(game,paused);renderer.draw(game,dt,paused);requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
