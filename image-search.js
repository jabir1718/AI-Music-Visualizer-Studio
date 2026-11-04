(function(){
'use strict';
const STORE='waveforge-image-search-v1';
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function mount(){
 const host=document.getElementById('overlayPanel');if(!host||document.getElementById('assetSearchPanel'))return;
 const panel=document.createElement('section');panel.id='assetSearchPanel';panel.className='asset-search-panel';
 panel.innerHTML='<div class="asset-search-head"><div><span class="eyebrow">ASSET FINDER</span><h3>Search images & PNG artwork</h3><p>Find an image, preview it, then import it as your background or logo.</p></div><span class="asset-search-tag">ONLINE</span></div>'+
 '<div class="asset-search-controls"><label>Image source<select id="assetProvider"><option value="commons">Open licensed · Wikimedia Commons</option><option value="google">Google Images API</option></select></label><label>Search<input id="assetQuery" type="search" maxlength="120" placeholder="e.g. dark skull PNG, neon city"></label><button id="assetSearchBtn" class="btn small" type="button">Search images</button></div>'+
 '<div id="googleCredentials" class="asset-credentials" hidden><label>Google API key<input id="assetGoogleKey" type="password" autocomplete="off" placeholder="Paste your Google API key"></label><label>Search engine ID (cx)<input id="assetGoogleCx" type="text" autocomplete="off" placeholder="Programmable Search Engine ID"></label><small>Credentials stay in this browser only. Google Custom Search JSON API access is restricted for new customers; see Google documentation before setting this up.</small></div>'+
 '<div id="assetSearchStatus" class="asset-search-status" aria-live="polite">Search Wikimedia Commons now, or configure Google credentials for Google image results.</div><div id="assetSearchResults" class="asset-search-results"></div>'+
 '<p class="asset-search-foot">Import uses the image’s available original file. “16K” is not guaranteed: source dimensions are shown, and no fake upscaling is applied. Check each file’s licence and attribution before publishing.</p>';
 host.appendChild(panel);
 let saved={};try{saved=JSON.parse(localStorage.getItem(STORE)||'{}')}catch(e){}
 const key=document.getElementById('assetGoogleKey'),cx=document.getElementById('assetGoogleCx');key.value=saved.key||'';cx.value=saved.cx||'';
 document.getElementById('assetProvider').addEventListener('change',()=>{document.getElementById('googleCredentials').hidden=document.getElementById('assetProvider').value!=='google';});
 key.addEventListener('change',saveCreds);cx.addEventListener('change',saveCreds);
 document.getElementById('assetSearchBtn').addEventListener('click',search);
 document.getElementById('assetQuery').addEventListener('keydown',e=>{if(e.key==='Enter')search();});
}
function saveCreds(){try{localStorage.setItem(STORE,JSON.stringify({key:document.getElementById('assetGoogleKey').value.trim(),cx:document.getElementById('assetGoogleCx').value.trim()}))}catch(e){}}
function status(s){document.getElementById('assetSearchStatus').textContent=s}
async function search(){
 const q=document.getElementById('assetQuery').value.trim(),provider=document.getElementById('assetProvider').value,btn=document.getElementById('assetSearchBtn'),results=document.getElementById('assetSearchResults');
 if(!q){status('Type an image name first.');return}
 btn.disabled=true;results.replaceChildren();status('Searching…');
 try{
  let items=[];
  if(provider==='google'){
   const key=document.getElementById('assetGoogleKey').value.trim(),cx=document.getElementById('assetGoogleCx').value.trim();
   if(!key||!cx)throw new Error('Google API key and Search engine ID (cx) are required. No API credentials are available inside this project yet.');
   const u=new URL('https://www.googleapis.com/customsearch/v1');u.search=new URLSearchParams({key,cx,q,searchType:'image',num:'10',safe:'active',imgSize:'huge'}).toString();
   const r=await fetch(u);const data=await r.json();if(!r.ok)throw new Error(data.error&&data.error.message||'Google image search failed.');
   items=(data.items||[]).map(x=>({title:x.title,url:x.link,thumb:x.image&&x.image.thumbnailLink||x.link,width:x.image&&x.image.width||0,height:x.image&&x.image.height||0,source:x.image&&x.image.contextLink||x.displayLink,license:'Check licence on source page'}));
  }else{
   const u=new URL('https://commons.wikimedia.org/w/api.php');u.search=new URLSearchParams({action:'query',format:'json',origin:'*',generator:'search',gsrsearch:'filetype:bitmap '+q,gsrnamespace:'6',gsrlimit:'18',prop:'imageinfo',iiprop:'url|size|extmetadata',iiurlwidth:'480'}).toString();
   const r=await fetch(u);if(!r.ok)throw new Error('Wikimedia Commons request failed ('+r.status+').');const data=await r.json();
   items=Object.values(data.query&&data.query.pages||{}).map(x=>{const i=x.imageinfo&&x.imageinfo[0]||{},m=i.extmetadata||{};return{title:x.title.replace(/^File:/,''),url:i.url,thumb:i.thumburl||i.url,width:i.width||0,height:i.height||0,source:'Wikimedia Commons',license:(m.LicenseShortName&&m.LicenseShortName.value||'Licence not stated')+' · '+(m.Artist&&m.Artist.value||'Attribution check required')}}).filter(x=>x.url);
  }
  if(!items.length){status('No images found. Try a shorter search.');return}
  status(items.length+' image results. Choose Background or Logo to import.');
  items.forEach(item=>results.appendChild(makeCard(item)));
 }catch(e){status('Search error: '+e.message)}
 finally{btn.disabled=false}
}
function makeCard(item){
 const card=document.createElement('article');card.className='asset-result';
 const img=document.createElement('img');img.loading='lazy';img.alt=item.title;img.src=item.thumb;img.referrerPolicy='no-referrer';img.onerror=()=>{img.alt='Preview unavailable';img.removeAttribute('src')};
 const title=document.createElement('b');title.textContent=item.title;
 const meta=document.createElement('small');meta.textContent=(item.width&&item.height?item.width+' × '+item.height+' px · ':'')+item.license;
 const actions=document.createElement('div');actions.className='asset-result-actions';
 const bg=document.createElement('button');bg.type='button';bg.className='btn small';bg.textContent='Use as background';bg.addEventListener('click',()=>importImage(item,'background',bg));
 const logo=document.createElement('button');logo.type='button';logo.className='btn small';logo.textContent='Use as logo';logo.addEventListener('click',()=>importImage(item,'logo',logo));
 const source=document.createElement('a');source.href=item.source&&/^https?:/.test(item.source)?item.source:item.url;source.target='_blank';source.rel='noopener';source.textContent='Source / licence';
 actions.append(bg,logo,source);card.append(img,title,meta,actions);return card;
}
async function importImage(item,target,button){
 button.disabled=true;const old=button.textContent;button.textContent='Fetching…';
 try{
  const response=await fetch(item.url,{mode:'cors'});if(!response.ok)throw new Error('Image host did not allow direct import ('+response.status+'). Open the source page instead.');
  const blob=await response.blob();if(!blob.type.startsWith('image/'))throw new Error('The selected result is not a supported image.');
  if(blob.size>30*1024*1024)throw new Error('Image is larger than the 30 MB import limit.');
  const file=new File([blob],safeName(item.title),{type:blob.type});
  const input=document.getElementById(target==='background'?'mediaInput':'logoInput');
  const transfer=new DataTransfer();transfer.items.add(file);input.files=transfer.files;input.dispatchEvent(new Event('change',{bubbles:true}));
  status('Imported '+file.name+' as '+target+'. Source: '+item.source+'. '+(item.width&&item.height?'Original result: '+item.width+' × '+item.height+' px.':'Check original dimensions before export.'));
 }catch(e){status('Import failed: '+e.message)}
 finally{button.disabled=false;button.textContent=old}
}
function safeName(name){return (String(name||'image').replace(/[^a-z0-9._-]+/gi,'_').slice(0,70)||'image')+'.png'}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();