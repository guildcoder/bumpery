/* Getaway's chase is a deterministic, fixed-step simulation, independent of rendering. */
(function(root){
 'use strict';
 const Base=typeof module!=='undefined'&&module.exports?require('./physics.js'):root.Pinball;
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const outline=[[44,1060],[44,310],[66,264],[140,231],[460,231],[536,242],[574,270],[574,1060]];
 const rails=outline.slice(1).map((p,i)=>({a:{x:outline[i][0],y:outline[i][1]},b:{x:p[0],y:p[1]},kind:'rail'}));
 const segment=(a,b,kind='rail')=>rails.push({a:{x:a[0],y:a[1]},b:{x:b[0],y:b[1]},kind});
 segment([526,302],[526,1060]);
 [[[65,753],[65,936]],[[65,936],[126,1000]],[[103,815],[103,867]],[[103,867],[177,929]],[[502,753],[502,936]],[[502,936],[441,1000]],[[464,815],[464,867]],[[464,867],[411,929]]].forEach(([a,b])=>segment(a,b));
 const slings=[[[128,770],[176,878],[126,846]],[[460,770],[410,878],[461,846]]];
 slings.forEach(t=>t.forEach((p,i)=>segment(p,t[(i+1)%3],'sling')));
 const bumpers=[{x:305,y:345,r:32},{x:411,y:419,r:32},{x:274,y:490,r:33}];
 const targets=[{x:80,y:467,r:12},{x:80,y:531,r:12},{x:80,y:595,r:12},{x:490,y:493,r:12},{x:490,y:557,r:12},{x:490,y:621,r:12}];
 const beacons=[{x:212,y:275,r:14},{x:310,y:270,r:14},{x:414,y:278,r:14}];
 const pocket={x:141,y:360,r:26};
 class Chase {
  constructor(seed=1){this.seed=seed>>>0;this.phase='intro';this.countdown=1.8;this.time=0;this.endTime=0;this.player={x:.5,y:.81,vx:0};this.traffic=[];this.spawnAt=.5;this.wave=0;this.health=3;this.invulnerable=0;this.distance=0;this.reason='WRECKED';}
  random(){this.seed=(Math.imul(this.seed,1664525)+1013904223)>>>0;return this.seed/4294967296;}
  get bonus(){return Math.floor((this.time+1e-8)*10)*25;}
  spawn(){
   const lanes=[.21,.5,.79],safe=Math.floor(this.random()*3),count=this.time>12?2:1;
   const occupied=[0,1,2].filter(i=>i!==safe);if(count===1)occupied.splice(this.random()<.5?0:1,1);
   for(const lane of occupied)this.traffic.push({x:lanes[lane],y:-.16,w:.15,h:.13,kind:this.wave%4===2?'barrier':this.time>8&&this.wave%3===0?'pursuer':'traffic',speed:.31+Math.min(.85,this.time*.009),hit:false});
   if(this.time>10&&this.wave%4===0)this.traffic.push({x:lanes[safe],y:1.2,w:.15,h:.14,kind:'hunter',speed:-.22-Math.min(.35,this.time*.004),hit:false});
   this.wave++;
  }
  step(dt,input){
   if(this.phase==='finished')return;
   if(this.phase==='intro'){this.countdown=Math.max(0,this.countdown-dt);if(!this.countdown)this.phase='running';return;}
   if(this.phase==='crashed'){this.endTime+=dt;if(this.endTime>=2.2)this.phase='finished';return;}
   this.time+=dt;this.distance+=(110+this.time*3)*dt;this.invulnerable=Math.max(0,this.invulnerable-dt);
   const steer=Number(Boolean(input.right))-Number(Boolean(input.left));
   this.player.vx+=(steer*.92-this.player.vx)*Math.min(1,dt*9);this.player.x=clamp(this.player.x+this.player.vx*dt,.095,.905);
   if(this.time>=this.spawnAt){this.spawn();this.spawnAt=this.time+Math.max(.32,1.05-this.time*.012);}
   for(const car of this.traffic){
    car.y+=car.speed*dt;
    if(car.kind==='pursuer'||car.kind==='hunter')car.x+=clamp(this.player.x-car.x,-1,1)*dt*(.24+this.time*.006);
    if(!car.hit&&!this.invulnerable&&Math.abs(car.x-this.player.x)<(car.w+.115)/2&&Math.abs(car.y-this.player.y)<(car.h+.115)/2){car.hit=true;this.health--;this.invulnerable=1;this.player.vx+=(this.player.x<car.x?-.5:.5);}
   }
   this.traffic=this.traffic.filter(car=>car.speed>0?car.y<1.3:car.y>-.3);
   if(this.health<=0||this.time>=90){this.reason=this.health<=0?'WRECKED':'BOXED IN';this.phase='crashed';this.player.vx=0;}
  }
 }
 class Game extends Base.Game {
  resetProgress(){super.resetProgress();this.gear=1;this.pocketArmed=true;this.lockCooldown=0;this.chase=null;this.chaseCount=0;this.chaseSeconds=0;this.lastChaseBonus=0;}
  get elapsedTime(){return this.time+this.chaseSeconds;}
  activateHyperspeed(){return false;}
  activateMeteorShower(){return false;}
  captureBall(){
   if(this.state!=='playing'||!this.pocketArmed||this.tilted||this.time<this.lockCooldown)return false;
   this.ball.x=pocket.x;this.ball.y=pocket.y;this.ball.vx=0;this.ball.vy=0;this.state='chase';this.pocketArmed=false;
   this.chase=new Chase(7919*(++this.chaseCount)+41);this.input.left=false;this.input.right=false;this.input.launch=false;
   this.emit('chaseStart');return true;
  }
  finishChase(){
   if(this.state!=='chase'||!this.chase||this.chase.phase!=='finished')return false;
   const seconds=this.chase.time,bonus=this.chase.bonus;this.lastChaseBonus=bonus*this.multiplier;
   this.addScore(bonus,pocket.x,pocket.y);this.chase=null;this.state='playing';this.lockCooldown=this.time+6;
   this.ball.x=pocket.x+12;this.ball.y=pocket.y+42;this.ball.vx=260;this.ball.vy=440;this.ball.shooter=false;
   this.saveUntil=Math.max(this.saveUntil,this.time+3);this.input.left=false;this.input.right=false;this.input.launch=false;
   this.emit('chaseEnd',{seconds,bonus:this.lastChaseBonus});return true;
  }
  step(dt=Base.STEP){
   if(dt>Base.STEP+1e-9){let remaining=Math.min(dt,.1);while(remaining>1e-9){const slice=Math.min(remaining,Base.STEP);this.step(slice);remaining-=slice;}return;}
   if(this.state==='chase'){
    this.chaseSeconds+=dt;const health=this.chase.health,phase=this.chase.phase;this.chase.step(dt,this.input);
    if(this.chase.health<health)this.emit('chaseHit');
    if(phase!=='crashed'&&this.chase.phase==='crashed')this.emit('chaseCrash',{seconds:this.chase.time,bonus:this.chase.bonus*this.multiplier});
    if(this.chase.phase==='finished')this.finishChase();return;
   }
   super.step(dt);
  }
  integrateBall(dt){
   if(this.state==='chase')return;
   const b=this.ball;b.vy+=810*dt;const damping=Math.exp(-.055*dt);b.vx*=damping;b.vy*=damping;
   const speed=Math.hypot(b.vx,b.vy);if(speed>2100){b.vx*=2100/speed;b.vy*=2100/speed;}
   b.x+=b.vx*dt;b.y+=b.vy*dt;
   if(b.x>524&&b.y<302&&b.vy<0){b.vx=-650;b.vy=Math.min(b.vy,-400);}
   if(b.x<510)b.shooter=false;
   if(Math.hypot(b.x-pocket.x,b.y-pocket.y)<pocket.r+b.r+1&&this.captureBall())return;
   rails.forEach((r,i)=>this.segment(r.a,r.b,r.kind==='sling'?7:5,r.kind==='sling'?.85:.8,null,r.kind==='sling','road'+i));
   bumpers.forEach((c,i)=>this.circle(c,.94,760,'bumper'+i,150));
   this.circle(pocket,.8,260,'pocket',100);
   targets.forEach((c,i)=>{if(this.circle(c,.9,460,'target'+i,200)&&!this.tilted){this.targetLights[i]=true;if(this.targetLights.every(Boolean)){this.targetLights.fill(false);this.gear=Math.min(6,this.gear+1);this.multiplier=Math.min(5,this.gear);this.addScore(1500,c.x,c.y);this.pocketArmed=true;this.emit('gear',{gear:this.gear});}}});
   beacons.forEach((c,i)=>{if(this.circle(c,.9,260,'beacon'+i,350)&&!this.tilted){this.lit[i]=true;this.emit('beacon',{index:i,all:this.lit.every(Boolean)});if(this.lit.every(Boolean)){this.lit.fill(false);this.pocketArmed=true;this.addScore(1000,c.x,c.y);this.emit('lockReady');}}});
   for(const f of this.flippers){const tip={x:f.x+Math.cos(f.angle)*91,y:f.y+Math.sin(f.angle)*91};this.segment(f,tip,12,.68,p=>({x:-f.omega*(p.y-f.y),y:f.omega*(p.x-f.x)}));}
   if(b.x>536&&b.y>974&&b.vy>0){this.state='loaded';b.y=974;b.vx=0;b.vy=0;this.charge=0;this.emit('loaded');}
  }
 }
 const api={Game,Chase,STEP:Base.STEP,outline,rails,slings,bumpers,targets,beacons,pocket};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Getaway=api;
})(globalThis);
