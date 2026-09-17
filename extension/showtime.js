/* Original animated cabinet display. Runs on the gameplay clock, including pause. */
(function(root){
  class CabinetShow {
    constructor(container){
      this.container=container;this.until=0;this.priority=0;this.lastText='';
      container.innerHTML='<div class="cabinet-screen" aria-hidden="true"><div class="cabinet-stars">✦ · · ✧ · ✦ · · ✧</div><svg class="cabinet-ship" viewBox="0 0 90 36"><path d="M4 18 21 12 23 4 39 11 66 11 85 18 66 25 39 25 23 32 21 24Z" fill="#c1f4ed"/><path d="M29 18 10 15 0 18 10 21Z" fill="#e9bb6a"/><circle cx="60" cy="18" r="4" fill="#1d4b5d"/></svg><div class="cabinet-meteor">☄</div></div><div class="cabinet-caption"><span id="cabinet-title">FLIGHT SYSTEMS READY</span><small id="cabinet-subtitle">LIGHT THE SIX METEOR TARGETS</small></div><span class="cabinet-level"></span>';
      this.title=container.querySelector('#cabinet-title');this.subtitle=container.querySelector('#cabinet-subtitle');this.level=container.querySelector('.cabinet-level');
    }
    announce(title,subtitle,kind,time,priority=1){
      if(time<this.until&&priority<this.priority)return;
      this.until=time+3;this.priority=priority;this.lastText='';this.title.textContent=title;this.subtitle.textContent=subtitle;
      this.container.dataset.clip=kind;
    }
    update(game,paused){
      this.container.classList.toggle('paused',paused);
      this.container.style.setProperty('--clip-phase',String(Math.max(0,(3-(this.until-game.time))%3)/3));
      const level=`LV ${String(game.level).padStart(2,'0')}`;if(this.level.textContent!==level)this.level.textContent=level;
      if(game.state==='ready'||game.state==='over')this.until=0;
      if(game.time<this.until)return;
      this.priority=0;this.container.dataset.clip=game.hyperspeed?'hyper':game.meteorShower?'meteor':'idle';
      const title=game.hyperspeed?`HYPERSPEED · ${Math.ceil(game.hyperUntil-game.time)}s`:game.meteorShower?`METEOR SHOWER · ${game.balls.length}/5 BALLS`:`METEOR TARGETS · ${game.targetLights.filter(Boolean).length}/6`;
      const subtitle=game.hyperspeed?(game.meteorShower?'SHIELD UP · METEOR SHOWER ACTIVE':'SHIELD UP · ALL DRAINS PROTECTED'):game.meteorShower?'KEEP ONE ALIVE · MORE ARE INBOUND':'COMPLETE THE BANK TO ENGAGE HYPERSPEED';
      const text=title+subtitle;if(text!==this.lastText){this.title.textContent=title;this.subtitle.textContent=subtitle;this.lastText=text;}
    }
    reset(){this.until=0;this.priority=0;this.lastText='';}
  }
  root.CabinetShow=CabinetShow;
})(globalThis);
