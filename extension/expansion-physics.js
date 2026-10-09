(function(root){
'use strict';const Base=typeof module!=='undefined'&&module.exports?require('./physics.js'):root.Pinball;
const configs={
 neonroyale:{name:'Neon Royale',mode:'LAST CALL',color:'#ff539c',accent:'#64e1e1',bg:'#141124',subtitle:'ONE MORE GAME BEFORE THE LIGHTS COME UP',bumps:[[207,306],[383,325],[295,466]],duration:20,guide:'Light three club signs, then shoot the crown to start Last Call: 20 seconds, three balls and double scoring. Clear six targets to raise the multiplier. The first five seconds of a special mode save drains.'},
 undertow:{name:'Undertow',mode:'RISING TIDE',color:'#73d9cf',accent:'#e7b778',bg:'#092736',subtitle:'THE DEEP KEEPS ITS SECRETS',bumps:[[174,338],[399,293],[326,475]],duration:22,guide:'Light three dive lamps, then hit the diving bell for Rising Tide. For 22 seconds water slows the fall, currents sweep sideways, and scoring doubles. Clear six relics to raise the multiplier.'},
 sugarrush:{name:'Sugar Rush',mode:'SUGAR STORM',color:'#ff79b0',accent:'#f6d664',bg:'#36213d',subtitle:'A LITTLE CHAOS. EXTRA SPRINKLES.',bumps:[[220,293],[390,366],[230,484]],duration:25,guide:'Clear all six sweets to start Sugar Storm: three balls and 25 seconds of double scoring. Light three cherries and shoot the cake for a jackpot. Another storm needs another complete bank.'},
 dragonfire:{name:'Dragonfire',mode:'DRAGON AWAKENS',color:'#ed8356',accent:'#d2bd7e',bg:'#241c23',subtitle:'WAKE THE ANCIENT FIRE',bumps:[[202,328],[393,323],[298,493]],duration:25,guide:'Light three runes and strike the dragon seal. Hit bumpers six times within 25 seconds to defeat the dragon and earn a 12,000-point bounty. The next dragon takes two more hits. Clear six shields to raise scoring.'}
};
class Game extends Base.Game{
 constructor(id,onEvent){super(onEvent);if(!configs[id])throw Error('Unknown expansion table');this.id=id;this.cfg=configs[id];this.bumpers=this.cfg.bumps.map(([x,y],i)=>({x,y,r:i===2?35:32}));}
 resetProgress(){super.resetProgress();this.modeUntil=0;this.modeStarts=0;this.dragonHP=0;this.dragons=0;this.bankCount=0;this.lastMode='';}
 get elapsedTime(){return this.time;}get special(){return this.modeUntil>this.time&&!this.tilted;}
 endModes(){super.endModes();this.modeUntil=0;this.dragonHP=0;}
 activateHyperspeed(){return false;}activateMeteorShower(){return false;}
 startMode(){if(this.state!=='playing'||this.special||this.tilted)return false;this.modeUntil=this.time+this.cfg.duration;this.modeStarts++;this.dragonHP=6+this.dragons*2;this.saveUntil=Math.max(this.saveUntil,this.time+5);
 if(this.id==='sugarrush'||this.id==='neonroyale')while(this.balls.length<3){const i=this.balls.length;this.balls.push({id:++this.nextBallId,x:160+i*100,y:110,vx:i%2?140:-140,vy:200,r:10,shooter:false});}
 this.emit('modeStart',{name:this.cfg.mode,duration:this.cfg.duration});return true;}
 hitTarget(i){if(this.tilted||this.targetLights[i])return;this.targetLights[i]=true;if(this.targetLights.every(Boolean)){this.targetLights.fill(false);this.bankCount++;this.multiplier=Math.min(5,this.multiplier+1);this.addScore(1500,300,550);this.emit('bank');if(this.id==='sugarrush')this.startMode();}}
 hitPortal(){if(this.tilted||!this.lit.every(Boolean))return;this.lit.fill(false);this.addScore(5000,296,205);this.emit('jackpot');if(this.id!=='sugarrush')this.startMode();}
 step(dt=Base.STEP){if(dt>Base.STEP+1e-9){let left=Math.min(dt,.1);while(left>1e-9){const d=Math.min(left,Base.STEP);this.step(d);left-=d;}return;}const was=this.special;super.step(dt);if(was&&!this.special)this.emit('modeEnd');}
 addScore(points,x,y){super.addScore(points*(this.special?2:1),x,y);}
 integrateBall(dt){const b=this.ball,water=this.id==='undertow'&&this.special;b.vy+=(water?470:820)*dt;if(water)b.vx+=Math.sin(this.time*1.6)*235*dt;const damp=Math.exp(-(water?.32:.055)*dt);b.vx*=damp;b.vy*=damp;const speed=Math.hypot(b.vx,b.vy);if(speed>2100){b.vx*=2100/speed;b.vy*=2100/speed;}b.x+=b.vx*dt;b.y+=b.vy*dt;
 if(b.x>524&&b.y<246&&b.vy<0){b.vx=-450;b.vy=Math.min(b.vy,-580);}if(b.x<510)b.shooter=false;
 Base.rails.forEach((r,i)=>this.segment(r.a,r.b,r.kind==='sling'?7:5,r.kind==='sling'?.85:.8,null,r.kind==='sling','rail'+i));
 this.bumpers.forEach((c,i)=>{if(this.circle(c,.94,water?610:780,'bumper'+i,150)&&this.id==='dragonfire'&&this.special&&this.dragonHP>0){this.dragonHP--;this.emit('dragonHit');if(!this.dragonHP){this.dragons++;this.modeUntil=0;this.addScore(12000,c.x,c.y);this.emit('dragonDefeated');}}});
 Base.targets.forEach((c,i)=>{if(this.circle(c,.9,460,'target'+i,200))this.hitTarget(i);});
 Base.beacons.forEach((c,i)=>{if(this.circle(c,.9,280,'beacon'+i,350)&&!this.tilted){this.lit[i]=true;this.emit('beacon',{index:i});}});
 if(this.circle(Base.observatory,.8,380,'portal',100))this.hitPortal();
 for(const f of this.flippers){const tip={x:f.x+Math.cos(f.angle)*91,y:f.y+Math.sin(f.angle)*91};this.segment(f,tip,12,.68,p=>({x:-f.omega*(p.y-f.y),y:f.omega*(p.x-f.x)}));}
 if(this.special&&this.time<this.saveUntil&&b.y>1000){b.x=295;b.y=900;b.vx=180;b.vy=-950;return;}
 if(b.x>536&&b.y>974&&b.vy>0){if(this.balls.length>1){b.y=950;b.vy=-1500;b.vx=0;}else{this.state='loaded';b.y=974;b.vx=b.vy=0;this.charge=0;this.emit('loaded');}}
 }
}
const api={Game,configs,STEP:Base.STEP,rails:Base.rails,targets:Base.targets,beacons:Base.beacons,slings:Base.slings,portal:Base.observatory};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Expansion=api;
})(globalThis);
