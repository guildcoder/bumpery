const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {Game,STEP,beacons,observatory}=require('../extension/physics.js');
const advance=(g,seconds)=>{for(let i=0;i<seconds/STEP;i++)g.step();};
test('every launcher strength clears the lane and reaches the playfield',()=>{
  for(const power of [0,.25,.5,.75,1]){const g=new Game();g.start();g.charge=power;g.launch();let clears=false;for(let i=0;i<480;i++){g.step();clears ||= g.ball.x<510&&g.ball.y<300;assert.ok(Number.isFinite(g.ball.x+g.ball.y+g.ball.vx+g.ball.vy));}assert.ok(clears,`power ${power}`);}
});
test('moving flipper transfers upward momentum only through contact',()=>{
  const resting=new Game(),active=new Game();for(const g of [resting,active]){g.start();g.state='playing';g.ball={x:245,y:931,vx:0,vy:150,r:10};}active.input.left=true;
  advance(resting,.035);advance(active,.035);assert.ok(active.ball.vy<-400);assert.ok(active.ball.vy<resting.ball.vy-300);
});
test('high-speed wall contact remains inside the table',()=>{
  for(const vx of [-2100,2100]){const g=new Game();g.start();g.state='playing';g.ball={x:vx<0?65:505,y:610,vx,vy:0,r:10};advance(g,.03);assert.ok(g.ball.x>=58&&g.ball.x<=512);assert.ok(g.ball.vx*vx<0);}
});
test('ball save gives one replacement; third normal drain ends the game',()=>{
  const g=new Game();g.start();g.launch();g.time=2;g.drain();assert.equal(g.ballNumber,1);assert.equal(g.state,'loaded');g.launch();assert.equal(g.saveUntil,0);g.drain();assert.equal(g.ballNumber,2);g.launch();g.time=g.saveUntil+1;g.drain();assert.equal(g.ballNumber,3);g.launch();g.time=g.saveUntil+1;g.drain();assert.equal(g.state,'over');g.start();assert.equal(g.score,0);assert.equal(g.ballNumber,1);assert.equal(g.state,'loaded');
});
test('three beacons unlock jackpot and increase subsequent scoring',()=>{
  const g=new Game();g.start();g.state='playing';for(const c of beacons){g.ball={x:c.x,y:c.y+c.r+9,vx:0,vy:-100,r:10};g.step();}assert.deepEqual(g.lit,[true,true,true]);const before=g.score;g.ball={x:observatory.x,y:observatory.y+32,vx:0,vy:-100,r:10};g.step();assert.equal(g.score-before,11100);assert.equal(g.multiplier,2);assert.equal(g.level,2);assert.equal(g.meteorShower,true);assert.deepEqual(g.lit,[false,false,false]);
});
test('tilt disables scoring and save, then clears on the next ball',()=>{
  const g=new Game();g.start();g.launch();for(let i=0;i<3;i++){g.nudge();g.time+=.5;}assert.equal(g.tilted,true);assert.equal(g.saveUntil,0);g.addScore(500,0,0);assert.equal(g.score,0);g.drain();assert.equal(g.tilted,false);assert.equal(g.ballNumber,2);
});
test('new game resets nudge cooldown',()=>{const g=new Game();g.start();g.launch();g.time=50;g.nudge();g.start();g.launch();g.nudge();assert.equal(g.tilt,1);});
test('long deterministic play stays finite with no more than five balls',()=>{
  for(let run=0;run<12;run++){const g=new Game();g.start();for(let i=0;i<240*90;i++){
    if(g.state==='loaded'){g.charge=(run%5)/4;g.launch();}
    g.input.left=(i+run*19)%199<43;g.input.right=(i+run*37)%173<39;g.step();
    assert.ok(g.balls.length<=5);for(const b of g.balls){assert.ok(Number.isFinite(b.x+b.y+b.vx+b.vy));assert.ok(Math.abs(b.vx)<10000&&Math.abs(b.vy)<10000);}
    if(g.state==='over')break;
  }}
});
test('extension opens its own local game tab and requests no permissions',()=>{
  const manifest=JSON.parse(fs.readFileSync('extension/manifest.json','utf8'));assert.equal(manifest.manifest_version,3);assert.equal(manifest.permissions,undefined);assert.equal(manifest.host_permissions,undefined);let click,opened;
  vm.runInNewContext(fs.readFileSync('extension/background.js','utf8'),{chrome:{action:{onClicked:{addListener:fn=>click=fn}},runtime:{getURL:p=>'chrome-extension://test/'+p},tabs:{create:args=>opened=args}}});click();assert.equal(opened.url,'chrome-extension://test/index.html');
  const html=fs.readFileSync('extension/game.html','utf8');for(const [,src] of html.matchAll(/(?:src|href)="([^"]+)"/g))assert.ok(fs.existsSync('extension/'+src),src);
});
