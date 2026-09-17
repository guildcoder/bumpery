(() => {
  'use strict';
  const list=document.getElementById('table-list');
  for(const table of BUMPERY_TABLES){
    const card=document.createElement('a');card.className='table-card';card.href=table.href;card.setAttribute('aria-label','Play '+table.name);
    const art=document.createElement('img');art.src=table.art;art.alt='';art.width=720;art.height=800;
    const label=document.createElement('span');label.className='table-label';
    const name=document.createElement('strong');name.textContent=table.name;
    const play=document.createElement('span');play.className='play';play.textContent='Play ↗';
    label.append(name,play);card.append(art,label);list.append(card);
  }
})();
