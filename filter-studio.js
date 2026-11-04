'use strict';
(function(root){
 const profiles=[
  {group:'Cinema',names:['Cinema Gold','Cinema Teal','Blockbuster','Noir Cinema','Soft Film'],v:[108,116,112,0,8,-12,0,'#f0a45a']},
  {group:'Vintage',names:['Old Photo','Sepia Memory','Faded Print','Warm 1970s','Retro Polaroid'],v:[106,94,82,0,30,8,0,'#b97942']},
  {group:'Monochrome',names:['Pure Mono','Silver Screen','High Contrast B&W','Soft Grey','Matte Black'],v:[104,122,0,100,0,0,0,'#ffffff']},
  {group:'Vibrant',names:['Pop Color','Neon Pop','Candy','Electric','Festival'],v:[112,124,148,0,0,8,0,'#ff38a8']},
  {group:'Cool',names:['Arctic Blue','Deep Ocean','Glacier','Steel Blue','Moonlight'],v:[104,112,108,0,0,190,0,'#39baff']},
  {group:'Warm',names:['Golden Hour','Amber Glow','Sunlit','Peach Skin','Desert Heat'],v:[112,106,116,0,12,-8,0,'#ffad61']},
  {group:'Dreamy',names:['Dream Soft','Pastel Haze','Cloud Nine','Bloom','Ethereal'],v:[112,92,104,0,8,24,1.2,'#eabfff']},
  {group:'Night',names:['Midnight','Cyber Night','Dark Blue','After Hours','Neon Noir'],v:[78,136,122,0,0,210,0,'#452cff']},
  {group:'Analog',names:['35mm Grain Look','Instant Film','Cross Process','Expired Film','Disposable Cam'],v:[106,112,110,0,18,14,.35,'#d18a54']},
  {group:'Editorial',names:['Clean Editorial','Bright Studio','Soft Portrait','Fashion Matte','Minimal White'],v:[110,108,96,0,0,0,0,'#ffffff']}
 ];
 const variants=[-.16,-.08,0,.08,.16],items=[];
 profiles.forEach((p,pi)=>p.names.forEach((name,i)=>{
  const k=variants[i],v=p.v;
  items.push({id:'f'+String(items.length+1).padStart(2,'0'),name,group:p.group,
   brightness:Math.round(v[0]+k*35),contrast:Math.round(v[1]+k*42),saturate:Math.max(0,Math.round(v[2]+k*55)),
   grayscale:Math.max(0,Math.min(100,Math.round(v[3]+k*18))),sepia:Math.max(0,Math.min(100,Math.round(v[4]+k*30))),
   hue:v[5]+Math.round(k*75),blur:Math.max(0,Number((v[6]+k*.5).toFixed(2))),tint:v[7],tintAlpha:pi===2?0:Math.max(.025,Math.min(.22,.09+k*.25))
  });
 }));
 let selected='f01',strength=100;
 function get(id){return items.find(x=>x.id===id)||items[0];}
 function set(id,value){if(id&&items.some(x=>x.id===id))selected=id;if(Number.isFinite(Number(value)))strength=Math.max(0,Math.min(100,Number(value)));sync();return getSettings();}
 function getSettings(){return{filterPreset:selected,filterIntensity:strength};}
 function sync(){const sel=document.getElementById('backgroundFilter'),range=document.getElementById('filterStrength'),out=document.getElementById('filterStrengthValue');if(sel)sel.value=selected;if(range)range.value=String(strength);if(out)out.textContent=strength+'%';}
 function draw(ctx,source,x,y,w,h){
  const p=get(selected),k=strength/100;
  ctx.save();
  if('filter' in ctx)ctx.filter='brightness('+Math.max(0,100+(p.brightness-100)*k)+'%) contrast('+Math.max(0,100+(p.contrast-100)*k)+'%) saturate('+Math.max(0,100+(p.saturate-100)*k)+'%) grayscale('+p.grayscale*k+'%) sepia('+p.sepia*k+'%) hue-rotate('+(p.hue*k)+'deg) blur('+(p.blur*k)+'px)';
  ctx.drawImage(source,x,y,w,h);
  if(p.tint&&p.tintAlpha>0&&k>0){ctx.globalCompositeOperation='soft-light';ctx.globalAlpha=p.tintAlpha*k;ctx.fillStyle=p.tint;ctx.fillRect(x,y,w,h);}
  ctx.restore();
 }
 function mount(host,onChange){
  if(!host||document.getElementById('filterStudio'))return;
  const section=document.createElement('section');section.id='filterStudio';section.className='filter-studio';
  section.innerHTML='<div class="filter-studio-head"><div><span class="eyebrow">PHOTO + VIDEO LOOKS</span><h3>50 creative filters</h3><p>Live canvas effects apply to imported photo/video backgrounds and are included in export.</p></div><span class="filter-count">50</span></div><label>Search filter<input id="filterSearch" type="search" placeholder="Try cinema, vintage, night…"></label><label>Choose look<select id="backgroundFilter" size="1"></select></label><div class="filter-strength-row"><label for="filterStrength">Filter strength</label><output id="filterStrengthValue">100%</output></div><input id="filterStrength" type="range" min="0" max="100" value="100"><div class="filter-selected" id="filterSelected">Cinema Gold · Cinema</div><button type="button" class="btn small" id="filterReset">Reset to original</button><p class="filter-footnote">These are real canvas color/blur effects, not AI retouching or resolution upscaling.</p>';
  host.appendChild(section);
  const sel=section.querySelector('#backgroundFilter'),search=section.querySelector('#filterSearch');
  function fill(query){const q=String(query||'').trim().toLowerCase(),current=selected;sel.replaceChildren();items.filter(p=>(p.name+' '+p.group).toLowerCase().includes(q)).forEach(p=>{const o=document.createElement('option');o.value=p.id;o.textContent=p.name+' · '+p.group;sel.appendChild(o);});if([...sel.options].some(o=>o.value===current))sel.value=current;else if(sel.options.length)sel.selectedIndex=0;else{const o=document.createElement('option');o.textContent='No matching filters';o.disabled=true;sel.appendChild(o);} }
  function changed(){const p=get(selected),label=section.querySelector('#filterSelected');if(label)label.textContent=p.name+' · '+p.group;sync();if(typeof onChange==='function')onChange(getSettings());}
  search.addEventListener('input',()=>fill(search.value));
  sel.addEventListener('change',()=>{selected=sel.value;changed();});
  section.querySelector('#filterStrength').addEventListener('input',e=>{strength=Number(e.target.value);changed();});
  section.querySelector('#filterReset').addEventListener('click',()=>{selected='f01';strength=0;search.value='';fill('');changed();});
  fill('');sync();changed();
 }
 root.WaveForgeFilters={items,set,getSettings,draw,mount};
})(window);
