(function(root){
'use strict';
const VERSION='17.0.0';
const DATA_URL='https://cdn.jsdelivr.net/gh/hfg-gmuend/openmoji@'+VERSION+'/data/openmoji.json';
const SVG_BASE='https://cdn.jsdelivr.net/gh/hfg-gmuend/openmoji@'+VERSION+'/color/svg/';
let entries=null,loading=null,selected=null;
function normalizeEntry(item){
 if(!item||!/^[0-9A-F-]{4,32}$/i.test(String(item.hexcode||'')))return null;
 return{hexcode:String(item.hexcode).toUpperCase(),annotation:String(item.annotation||item.name||item.hexcode),tags:[...(Array.isArray(item.tags)?item.tags:String(item.tags||'').split(/[ ,]+/).filter(Boolean)),...String(item.openmoji_tags||'').split(/[ ,]+/).filter(Boolean)],group:String(item.group||''),subgroup:String(item.subgroups||item.subgroup||'')};
}
function filterEntries(items,query='',group='All'){
 const q=String(query||'').trim().toLowerCase();
 return(items||[]).filter(item=>(group==='All'||item.group===group)&&(!q||[item.annotation,item.hexcode,item.group,item.subgroup,(item.tags||[]).join(' ')].join(' ').toLowerCase().includes(q)));
}
function svgUrl(hexcode){return SVG_BASE+encodeURIComponent(String(hexcode).toUpperCase())+'.svg';}
async function loadData(){
 if(entries)return entries;if(loading)return loading;
 loading=root.fetch(DATA_URL).then(response=>{if(!response.ok)throw new Error('OpenMoji catalogue request failed ('+response.status+').');return response.json();}).then(data=>{
  entries=(Array.isArray(data)?data:[]).map(normalizeEntry).filter(Boolean);if(!entries.length)throw new Error('The OpenMoji catalogue returned no usable symbols.');return entries;
 }).catch(error=>{loading=null;throw error;});
 return loading;
}
async function getSvgFile(item){
 const response=await root.fetch(svgUrl(item.hexcode));if(!response.ok)throw new Error('Could not download this symbol SVG.');
 const blob=await response.blob();return new File([blob],'openmoji-'+item.hexcode+'.svg',{type:'image/svg+xml',lastModified:Date.now()});
}
function mount(host,options={}){
 if(!host||root.document.getElementById('openMojiLibrary'))return;
 const panel=root.document.createElement('section');panel.id='openMojiLibrary';panel.className='openmoji-library';
 panel.innerHTML='<div class="openmoji-head"><div><span class="eyebrow">OPEN SYMBOL COLLECTION</span><h3>4,000+ searchable symbols</h3><p>Load the OpenMoji catalogue only when you need it. Search by name, tag or group; only selected symbols are added to your project.</p></div><span id="openmojiCount" class="font-count">…</span></div><button type="button" class="btn small" id="openmojiLoad">Load symbol catalogue</button><div class="openmoji-search"><input id="openmojiSearch" type="search" placeholder="Search symbols: music, heart, camera…" disabled><select id="openmojiGroup" disabled><option>All</option></select></div><div id="openmojiGrid" class="openmoji-grid"></div><div class="openmoji-actions"><button type="button" class="btn small primary" id="openmojiUse" disabled>Use as logo</button><button type="button" class="btn small" id="openmojiBackground" disabled>Use as background</button><button type="button" class="btn small" id="openmojiArtwork" disabled>Add as artwork</button><button type="button" class="btn small" id="openmojiText" disabled>Use with text</button><span id="openmojiStatus" class="hint" aria-live="polite">Loading symbol catalogue…</span></div><small class="openmoji-license">OpenMoji graphics are CC BY-SA 4.0. Read the <a href="https://openmoji.org/" target="_blank" rel="noopener">OpenMoji source</a> and <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener">licence terms</a>; attribution and ShareAlike apply.</small>';
 host.appendChild(panel);
 const $=id=>panel.querySelector('#'+id),grid=$('openmojiGrid');let filtered=[];
 function render(){
  filtered=filterEntries(entries,$('openmojiSearch').value,$('openmojiGroup').value).slice(0,72);
  grid.replaceChildren();selected=null;['openmojiUse','openmojiBackground','openmojiArtwork','openmojiText'].forEach(id=>$(id).disabled=true);
  filtered.forEach(item=>{
   const button=root.document.createElement('button');button.type='button';button.className='openmoji-item';button.title=item.annotation;
   const img=root.document.createElement('img');img.src=svgUrl(item.hexcode);img.alt=item.annotation;img.loading='lazy';
   const label=root.document.createElement('span');label.textContent=item.annotation;
   button.append(img,label);button.onclick=()=>{grid.querySelectorAll('.openmoji-item').forEach(x=>x.classList.remove('selected'));button.classList.add('selected');selected=item;['openmojiUse','openmojiBackground','openmojiArtwork','openmojiText'].forEach(id=>$(id).disabled=false);$('openmojiStatus').textContent=item.annotation+' · '+item.hexcode;};
   grid.append(button);
  });
  $('openmojiCount').textContent=entries.length.toLocaleString();
  if(!filtered.length)$('openmojiStatus').textContent='No matching symbols. Try another search.';
  else $('openmojiStatus').textContent='Showing '+filtered.length+' matches (up to 72 per search).';
 }
 $('openmojiSearch').oninput=render;$('openmojiGroup').onchange=render;
 $('openmojiLoad').onclick=async()=>{ $('openmojiLoad').disabled=true;$('openmojiStatus').textContent='Downloading catalogue metadata…';try{entries=await loadData();const groups=[...new Set(entries.map(x=>x.group).filter(Boolean))].sort();groups.forEach(group=>{const option=root.document.createElement('option');option.value=group;option.textContent=group;$('openmojiGroup').append(option);});$('openmojiSearch').disabled=false;$('openmojiGroup').disabled=false;$('openmojiLoad').textContent='Catalogue ready';$('openmojiCount').textContent=entries.length.toLocaleString();render();}catch(error){$('openmojiStatus').textContent='Symbol catalogue unavailable: '+error.message+' — check internet access.';$('openmojiLoad').disabled=false;}};
 async function useSelected(target,button){
  if(!selected)return;const item=selected;button.disabled=true;
  try{
   const file=await getSvgFile(item);let stored=true;
   if(typeof options.onImport==='function')stored=await options.onImport(file,target);
   else if(target==='logo'&&typeof options.onLogo==='function')stored=await options.onLogo(file);
   else throw new Error('This editor import target is not connected.');
   $('openmojiStatus').textContent=stored===false?'Loaded '+item.annotation+' for this session, but media storage is unavailable.':'Added '+item.annotation+' to the '+target+' editor.';
  }catch(error){$('openmojiStatus').textContent='Could not add symbol: '+error.message;}
  finally{button.disabled=!selected;}
 }
 $('openmojiUse').onclick=()=>useSelected('logo',$('openmojiUse'));
 $('openmojiBackground').onclick=()=>useSelected('background',$('openmojiBackground'));
 $('openmojiArtwork').onclick=()=>useSelected('artwork',$('openmojiArtwork'));
 $('openmojiText').onclick=()=>useSelected('text-decoration',$('openmojiText'));
 $('openmojiStatus').textContent='Tap “Load symbol catalogue” to fetch the searchable collection.';
}
const api={normalizeEntry,filterEntries,svgUrl,loadData,getSvgFile,mount};
root.WaveForgeSymbols=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
