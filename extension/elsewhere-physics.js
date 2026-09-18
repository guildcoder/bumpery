/* Elsewhere uses one canonical physics space; its warped viewport turns that space
   upside down. Gravity, walls, ball and flippers share the same transform. */
(function(root){
 'use strict';
 const Base=typeof module!=='undefined'&&module.exports?require('./physics.js'):root.Pinball;
 const bumpers=[{x:190,y:300,r:34},{x:398,y:320,r:34},{x:290,y:475,r:37}];
 const portal={x:296,y:205,r:24};
 class Game extends Base.Game {
  resetProgress(){super.resetProgress();this.warpStart=-100;this.warpUntil=0;this.nextWarpAt=45;this.portalVisits=0;this.warpCount=0;this.storyTime=0;this.storyNote=-1;this.seed=31991;}
  get elapsedTime(){return this.time+this.storyTime;}
  get warped(){return this.warpUntil>this.time;}
  get warpAge(){return this.time-this.warpStart;}
  get warpPhase(){return !this.warped?'normal':this.warpAge<2?'entering':this.warpUntil-this.time<2?'leaving':this.warpAge>=10&&this.warpAge<16?'slow':'inverted';}
  start(){super.start();this.state='intro';this.emit('introStart');}
  skipIntro(){if(this.state!=='intro')return;this.state='loaded';this.input.left=this.input.right=this.input.launch=false;this.emit('introEnd');}
  activateHyperspeed(){return false;}
  activateMeteorShower(){return false;}
  tryWarp(){
   if(this.state!=='playing'||this.warped||this.tilted||this.time<this.nextWarpAt)return false;
   this.portalVisits++;this.seed=(Math.imul(this.seed,1664525)+1013904223)>>>0;
   // Rare eligible portal contacts, with a fourth-visit guarantee against bad luck.
   if(this.seed/4294967296>.28&&this.portalVisits<4){this.emit('portalWhisper');return false;}
   this.portalVisits=0;this.warpCount++;this.warpStart=this.time;this.warpUntil=this.time+24;
   this.ball.x=296;this.ball.y=540;this.ball.vx=180;this.ball.vy=-300;this.ball.shooter=false;
   this.addScore(2000,296,540);this.emit('warpStart');return true;
  }
  returnHome(reward=true){
   if(!this.warpUntil)return;
   this.warpUntil=0;this.nextWarpAt=this.time+65;this.ball.x=296;this.ball.y=560;this.ball.vx=120;this.ball.vy=-260;this.ball.shooter=false;
   if(reward&&!this.tilted){this.addScore(3000,296,560);this.saveUntil=this.time+3;}
   this.emit('warpEnd',{protected:reward&&!this.tilted});
  }
  endModes(){super.endModes();if(this.warpUntil)this.returnHome(false);}
  step(dt=Base.STEP){
   if(dt>Base.STEP+1e-9){let left=Math.min(.1,dt);while(left>1e-9){const part=Math.min(left,Base.STEP);this.step(part);left-=part;}return;}
   if(this.state==='intro'){this.storyTime+=dt;const note=Math.floor(this.storyTime/.55);if(note!==this.storyNote){this.storyNote=note;this.emit('introNote',{note});}if(this.storyTime>=12)this.skipIntro();return;}
   if(this.warpUntil&&this.time+dt>=this.warpUntil)this.returnHome();
   if(this.warpPhase==='entering'||this.warpPhase==='leaving'){this.time+=dt;return;}
   // A 180-degree turn swaps screen-left and screen-right flippers.
   const left=this.input.left,right=this.input.right;
   if(this.warped){this.input.left=right;this.input.right=left;}
   super.step(dt);
   if(this.warped){this.input.left=left;this.input.right=right;}
  }
  integrateBall(dt){
   const b=this.ball;if(this.warpPhase==='entering'||this.warpPhase==='leaving')return;
   const warped=this.warped;if(this.warpPhase==='slow')dt*=.5;
   b.vy+=(warped?620:820)*dt;if(warped)b.vx+=Math.sin(this.warpAge*.7)*260*dt;
   const damp=Math.exp(-.055*dt);b.vx*=damp;b.vy*=damp;const speed=Math.hypot(b.vx,b.vy);if(speed>2100){b.vx*=2100/speed;b.vy*=2100/speed;}
   b.x+=b.vx*dt;b.y+=b.vy*dt;
   if(b.x>524&&b.y<246&&b.vy<0){b.vx=-450;b.vy=Math.min(b.vy,-580);}if(b.x<510)b.shooter=false;
   Base.rails.forEach((r,i)=>this.segment(r.a,r.b,r.kind==='sling'?7:5,r.kind==='sling'?.85:.8,null,r.kind==='sling','else'+i));
   bumpers.forEach((c,i)=>this.circle(c,.94,warped?920:760,'bumper'+i,warped?300:150));
   Base.targets.forEach((c,i)=>{if(this.circle(c,.9,470,'target'+i,200)&&!this.tilted){this.targetLights[i]=true;if(this.targetLights.every(Boolean)){this.targetLights.fill(false);this.multiplier=Math.min(5,this.multiplier+1);this.addScore(1500,c.x,c.y);this.emit('threshold');}}});
   Base.beacons.forEach((c,i)=>{if(this.circle(c,.9,280,'beacon'+i,350)&&!this.tilted){this.lit[i]=true;this.emit('beacon',{index:i});}});
   if(this.circle(portal,.8,380,'portal',100)&&!this.tilted){if(this.lit.every(Boolean)){this.addScore(2500,portal.x,portal.y);this.lit.fill(false);this.emit('mystery');}if(this.tryWarp())return;}
   for(const f of this.flippers){const tip={x:f.x+Math.cos(f.angle)*91,y:f.y+Math.sin(f.angle)*91};this.segment(f,tip,12,.68,p=>({x:-f.omega*(p.y-f.y),y:f.omega*(p.x-f.x)}));}
   if(warped&&b.y>1010){b.x=296;b.y=780;b.vx=200*Math.sin(this.warpAge);b.vy=-1000;this.emit('paradoxSave');return;}
   if(b.x>536&&b.y>974&&b.vy>0){this.state='loaded';b.y=974;b.vx=b.vy=0;this.charge=0;this.emit('loaded');}
  }
 }
 const api={Game,STEP:Base.STEP,bumpers,portal,rails:Base.rails,targets:Base.targets,beacons:Base.beacons,slings:Base.slings};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Elsewhere=api;
})(globalThis);
