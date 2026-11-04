'use strict';
(function(root){
 const API='https://commons.wikimedia.org/w/api.php',MAX_AUDIO_BYTES=25*1024*1024;
 function isAudioMime(mime){return /^audio\//i.test(String(mime||''));}
 function sourcePage(title){return 'https://commons.wikimedia.org/wiki/'+encodeURIComponent(String(title||'').replace(/ /g,'_'));}
 function makeSearchUrl(query,continuation){
  const p=new URLSearchParams({action:'query',format:'json',origin:'*',generator:'search',gsrnamespace:'6',gsrlimit:'50',gsrsearch:String(query||'').trim(),prop:'imageinfo',iiprop:'url|mime|size|extmetadata'});
  if(continuation)Object.keys(continuation).forEach(k=>p.set(k,continuation[k]));
  return API+'?'+p.toString();
 }
 function normalisePages(json){
  const pages=Object.values(json&&json.query&&json.query.pages||{}),items=[];
  pages.forEach(page=>{const info=page.imageinfo&&page.imageinfo[0];if(!info||!isAudioMime(info.mime))return;const meta=info.extmetadata||{};items.push({title:String(page.title||'Audio file').replace(/^File:/,''),url:info.url,mime:info.mime,size:Number(info.size)||0,license:meta.LicenseShortName&&meta.LicenseShortName.value||'Check source licence',artist:meta.Artist&&meta.Artist.value||'',source:sourcePage(page.title)});});
  return items;
 }
 async function search(query,continuation){
  if(!String(query||'').trim())throw new Error('Enter a sound or instrument to search.');
  const response=await fetch(makeSearchUrl(query,continuation));if(!response.ok)throw new Error('Wikimedia sound search failed ('+response.status+').');
  const json=await response.json();return{items:normalisePages(json),continuation:json.continue||null};
 }
 async function importAudio(item){
  if(!item||!isAudioMime(item.mime)||!item.url)throw new Error('This search result is not a supported audio file.');
  if(item.size>MAX_AUDIO_BYTES)throw new Error('This audio file is larger than the 25 MB import limit.');
  const response=await fetch(item.url);if(!response.ok)throw new Error('The source audio could not be downloaded. Open the source page instead.');
  const blob=await response.blob();if(!isAudioMime(blob.type||item.mime))throw new Error('The downloaded file is not recognized as audio.');
  if(blob.size>MAX_AUDIO_BYTES)throw new Error('This audio file is larger than the 25 MB import limit.');
  const ext=({'audio/mpeg':'mp3','audio/ogg':'ogg','audio/wav':'wav','audio/x-wav':'wav','audio/flac':'flac','audio/mp4':'m4a','audio/webm':'webm'}[blob.type||item.mime]||'audio');
  const name=String(item.title||'sound-effect').replace(/\.[a-z0-9]{2,5}$/i,'').replace(/[^a-z0-9_-]+/gi,'-').slice(0,60)||'sound-effect';
  return new File([blob],name+'.'+ext,{type:blob.type||item.mime,lastModified:Date.now()});
 }
 function mount(host,defaultQuery,onImport){
  if(!host||host.querySelector('#soundLibrary'))return;
  const panel=document.createElement('section');panel.id='soundLibrary';panel.className='sound-library';
  panel.innerHTML='<div class="mixer-heading"><div><b>Open sound library</b><small>Search audio files on Wikimedia Commons. Check the licence and attribution on each source page before publishing.</small></div><span class="mixer-live">LIVE SEARCH</span></div><div class="sound-search-row"><input id="soundSearchQuery" type="search" maxlength="100" placeholder="Search sound effects, engine, piano…"><button class="btn small" id="soundSearchBtn" type="button">Search audio</button></div><p class="sound-search-status" id="soundSearchStatus" role="status">Search open audio files. Results are streamed in pages.</p><div class="sound-search-results" id="soundSearchResults"></div><button type="button" class="btn small" id="soundLoadMore" hidden>Load more results</button><p class="sound-library-note">This is a live external search, not a bundled 5,000-file pack. File formats, availability, licence terms and download permissions vary by source.</p>';
  host.appendChild(panel);
  const $=id=>panel.querySelector('#'+id);
  let continuation=null,query='',busy=false;
  function status(text){$('soundSearchStatus').textContent=text;}
  function addCard(item){
   const card=document.createElement('article');card.className='sound-result';
   const title=document.createElement('b');title.textContent=item.title;
   const meta=document.createElement('small');meta.textContent=item.mime+' · '+(item.size/1024/1024).toFixed(1)+' MB · '+item.license;
   const audio=document.createElement('audio');audio.controls=true;audio.preload='none';audio.src=item.url;
   const actions=document.createElement('div');actions.className='sound-result-actions';
   const add=document.createElement('button');add.type='button';add.className='btn small';add.textContent='Add to Music Studio';
   add.onclick=async()=>{add.disabled=true;try{const file=await importAudio(item);if(typeof onImport==='function')onImport(file);status('Added '+item.title+' to the mixer.');}catch(e){status(e.message);add.disabled=false;}};
   const link=document.createElement('a');link.href=item.source;link.target='_blank';link.rel='noopener noreferrer';link.textContent='Source / licence';
   actions.append(add,link);card.append(title,meta,audio,actions);$('soundSearchResults').appendChild(card);
  }
  async function run(reset){
   if(busy)return;const value=$('soundSearchQuery').value.trim();if(!value){status('Enter a sound or instrument to search.');return;}
   if(reset){query=value;continuation=null;$('soundSearchResults').replaceChildren();}
   if(query!==value){query=value;continuation=null;$('soundSearchResults').replaceChildren();}
   busy=true;$('soundSearchBtn').disabled=true;$('soundLoadMore').disabled=true;status('Searching Wikimedia Commons audio files…');
   try{const result=await search(query,reset?null:continuation);result.items.forEach(addCard);continuation=result.continuation;$('soundLoadMore').hidden=!continuation;status(result.items.length+' audio result(s) loaded. Review source licences before use.');}
   catch(e){status(e.message);}
   finally{busy=false;$('soundSearchBtn').disabled=false;$('soundLoadMore').disabled=false;}
  }
  $('soundSearchQuery').value=defaultQuery||'sound effect';
  $('soundSearchBtn').onclick=()=>run(true);$('soundLoadMore').onclick=()=>run(false);
  run(true);
 }
 root.WaveForgeSoundLibrary={search,makeSearchUrl,normalisePages,isAudioMime,importAudio,mount,MAX_AUDIO_BYTES};
})(window);
