(function(root){
  'use strict';
  function welcomeState({ios,standalone,seen}){return {show:!seen,install:!standalone&&ios};}
  if(typeof module!=='undefined'&&module.exports){module.exports={welcomeState};return;}
  const $=id=>document.getElementById(id);
  const standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
  const ios=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  let seen=false;try{seen=localStorage.getItem('bumpery.welcome.v1')==='seen';}catch{}
  const state=welcomeState({ios,standalone,seen});
  document.documentElement.classList.toggle('standalone',standalone);
  let welcome=$('welcome');
  if(!welcome){
    welcome=document.createElement('dialog');welcome.id='welcome';welcome.setAttribute('aria-label','Welcome to Bumpery');
    welcome.innerHTML='<img src="icons/icon-192.png" width="72" height="72" alt="Bumpery app icon"><p id="welcome-main" class="welcome-main">Make yourself at home.</p><p id="welcome-copy">Starbound Parlor is your first table. More tables are coming.</p><p id="install-steps" hidden>In Safari, tap <b>Share</b> ↥, then <b>Add to Home Screen</b> and <b>Add</b>. If shown, keep <b>Open as Web App</b> on.</p><p id="install-detail" hidden>Your own app icon. Full-screen play. Offline pinball after the first online visit.</p><button id="welcome-close" type="button">Let’s play ↗</button>';
    document.body.append(welcome);
  }
  function openWelcome(install=state.install){
    document.dispatchEvent(new Event('bumpery:menu'));
    $('welcome-main').textContent=install?'Add Bumpery to your Home Screen.':'Make yourself at home.';
    $('install-steps').hidden=!install;$('install-detail').hidden=!install;
    if(!welcome.open)welcome.showModal();
  }
  function remember(){try{localStorage.setItem('bumpery.welcome.v1','seen');}catch{}}
  $('welcome-close').addEventListener('click',()=>welcome.close());welcome.addEventListener('close',remember);
  // Never claim a dismiss click has installed the app; Safari owns that action.
  const install=$('install');
  if(install){install.hidden=standalone;install.addEventListener('click',()=>{
    openWelcome(true);
    if(!ios)$('install-steps').textContent='On iPhone, open this site in Safari and choose Share → Add to Home Screen → Add. On desktop or Android, use your browser’s Install app option when available.';
  });}
  const fullscreen=$('fullscreen');
  if(ios&&fullscreen&&!document.documentElement.requestFullscreen){
    const replacement=fullscreen.cloneNode(false);replacement.id='install-game';replacement.textContent=standalone?'✓ Installed':'＋ Install';fullscreen.replaceWith(replacement);
    replacement.addEventListener('click',()=>openWelcome(!standalone));
  }
  if(state.show)openWelcome();
  if(/^https?:$/.test(location.protocol)&&'serviceWorker' in navigator&&isSecureContext){
    navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(reg=>reg.update()).catch(()=>{});
  }
})(globalThis);
