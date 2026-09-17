const {test}=require('node:test'),assert=require('node:assert/strict');
const {Game,STEP,targets}=require('../extension/physics.js');
const advance=(g,seconds)=>{for(let i=0;i<Math.ceil(seconds/STEP);i++)g.step();};
const playing=()=>{const g=new Game();g.start();g.launch();g.saveUntil=0;return g;};
test('all six meteor targets unlock Hyperspeed, not repeated hits on one',()=>{
  const g=playing();for(let i=0;i<6;i++){const c=targets[i];g.ball={x:c.x+20,y:c.y,vx:-100,vy:0,r:10};g.step();if(i<5)assert.equal(g.hyperspeed,false);}
  assert.equal(g.hyperspeed,true);assert.equal(g.hyperDuration,15);assert.equal(g.targetLights.filter(Boolean).length,0);
});
test('Hyperspeed durations are 15, 20, and at most 25 seconds; no refresh exploit',()=>{
  for(const [level,duration] of [[1,15],[2,20],[3,25],[20,25]]){const g=playing();g.level=level;g.activateHyperspeed();const end=g.hyperUntil;assert.equal(g.hyperDuration,duration);g.time+=5;assert.equal(g.activateHyperspeed(),false);assert.equal(g.hyperUntil,end);}
});
test('shield rescues every ball and outlane during Hyperspeed without spending a life',()=>{
  const g=playing();g.activateMeteorShower();while(g.balls.length<5)g.spawnMeteor();g.activateHyperspeed();
  g.balls.forEach((b,i)=>{b.x=[48,83,294,499,550][i];b.y=989;b.vx=0;b.vy=5100;});g.step();
  assert.equal(g.balls.length,5);assert.equal(g.ballNumber,1);for(const b of g.balls){assert.ok(b.y<985);assert.ok(b.vy<0);}
});
test('Hyperspeed stays inside walls under extended high-speed play',()=>{
  const g=playing();g.activateHyperspeed();for(let i=0;i<240*14;i++){g.step();assert.ok(g.balls.length>=1&&g.balls.length<=5);assert.equal(g.state,'playing');for(const b of g.balls){assert.ok(b.x>=25&&b.x<=590);assert.ok(b.y>=20&&b.y<=995);}}
  assert.equal(g.ballNumber,1);
});
test('mode expires on simulation time, restores normal speed and permits drains',()=>{
  const events=[],g=new Game(e=>events.push(e.type));g.start();g.launch();g.activateHyperspeed();g.time=g.hyperUntil-STEP/2;g.ball={x:294,y:980,vx:0,vy:5100,r:10};g.step();assert.equal(g.hyperspeed,false);assert.ok(Math.hypot(g.ball.vx,g.ball.vy)<2200);assert.ok(events.includes('hyperspeedEnd'));
  g.saveUntil=0;g.ball.y=1105;g.step();assert.equal(g.ballNumber,2);
});
test('meteor shower caps at five and replenishes only when a survivor remains',()=>{
  const g=playing();g.activateMeteorShower();while(g.balls.length<5)assert.equal(g.spawnMeteor(),true);assert.equal(g.spawnMeteor(),false);
  for(let i=0;i<4;i++){g.balls[i].x=294;g.balls[i].y=1105;g.balls[i].vy=100;}g.balls[4].x=300;g.balls[4].y=650;g.nextMeteorAt=g.time+1;g.step();assert.equal(g.balls.length,1);assert.equal(g.ballNumber,1);assert.equal(g.meteorShower,true);
  g.nextMeteorAt=g.time;g.step();assert.equal(g.balls.length,2);assert.equal(g.ballNumber,1);
});
test('last-ball loss cancels pending spawns and charges exactly one ball',()=>{
  const g=playing();g.activateMeteorShower();while(g.balls.length<5)g.spawnMeteor();g.nextMeteorAt=g.time;
  for(const b of g.balls){b.x=294;b.y=1105;b.vy=100;}
  g.step();assert.equal(g.meteorShower,false);assert.equal(g.state,'loaded');assert.equal(g.ballNumber,2);assert.equal(g.balls.length,1);assert.equal(g.spawnMeteor(),false);
});
test('losing an entire shower on ball three ends the voyage',()=>{const g=playing();g.ballNumber=3;g.activateMeteorShower();g.spawnMeteor();for(const b of g.balls){b.y=1105;b.x=294;b.vy=100;}g.step();assert.equal(g.state,'over');assert.equal(g.balls.length,0);assert.equal(g.spawnMeteor(),false);});
test('tilt cancels both modes and new game resets all progression',()=>{
  const g=playing();g.activateMeteorShower();g.spawnMeteor();g.activateHyperspeed();for(let i=0;i<3;i++){g.nudge();g.time+=.5;}
  assert.equal(g.tilted,true);assert.equal(g.hyperspeed,false);assert.equal(g.meteorShower,false);assert.equal(g.spawnMeteor(),false);
  g.level=8;g.targetLights[0]=true;g.start();assert.equal(g.level,1);assert.equal(g.balls.length,1);assert.equal(g.targetLights.some(Boolean),false);assert.equal(g.score,0);assert.equal(g.tilted,false);
});
test('combo rewards require distinct shots and expire after four seconds',()=>{
  const g=playing();g.recordShot('a');g.recordShot('a');g.recordShot('b');assert.equal(g.score,0);g.recordShot('c');assert.equal(g.score,750);g.time+=4.1;g.recordShot('d');assert.equal(g.comboShots.length,1);assert.equal(g.score,750);
});
test('meteor arrival interval continues past five without exceeding the cap',()=>{
  const g=playing();g.activateMeteorShower();g.activateHyperspeed();advance(g,12);assert.equal(g.balls.length,5);g.nextMeteorAt=g.time;g.step();assert.equal(g.balls.length,5);
});
