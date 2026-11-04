'use strict';
(function(root){
 function parsePrompt(prompt,current={}){
  const text=String(prompt||'').trim(),lower=text.toLowerCase(),actions=[],used=new Set();
  const add=(id,label,value)=>{if(!used.has(id)){used.add(id);actions.push({id,label,value});}};
  const videoStyle=[['cinematic','cinematic'],['travel','travel'],['vlog','vlog'],['calm','calm'],['social','social'],['reels','social'],['tiktok','social']];
  for(const [word,value] of videoStyle)if(new RegExp('\\b'+word+'\\b','i').test(lower)){add('autoVideoStyle','Video editing style',value);break;}
  if(/(more cuts|cut faster|faster cuts|zyada cuts|tez cuts)/i.test(lower))add('autoVideoIntensity','Cut intensity',Math.min(5,(Number(current.autoVideoIntensity)||3)+1));
  else if(/(fewer cuts|cut slower|slower cuts|kam cuts|slow cuts)/i.test(lower))add('autoVideoIntensity','Cut intensity',Math.max(1,(Number(current.autoVideoIntensity)||3)-1));
  const vis=[['equalizer bars','bars'],['bars','bars'],['waveform','wave'],['wave','wave'],['circle','circle'],['neon pulse','neon'],['neon','neon']];
  for(const [word,value] of vis)if(new RegExp('\\b'+word+'\\b','i').test(lower)){add('visualStyle','Visualizer style',value);break;}
  const colors=[['sunset','sunset'],['ice blue','ice'],['ice','ice'],['aurora','aurora'],['monochrome','mono'],['mono','mono']];
  for(const [word,value] of colors)if(new RegExp('\\b'+word+'\\b','i').test(lower)){add('visualColor','Color theme',value);break;}
  const ratio=lower.match(/(?:9\s*:\s*16|16\s*:\s*9|1\s*:\s*1)/);
  if(ratio)add('exportRatio','Canvas format',ratio[0].replace(/\s/g,''));
  const title=text.match(/(?:^|[,;]\s*|\b)(?:set\s+)?title\s*(?:to|as|[:=])\s*(.+)$/i);
  if(title)add('titleInput','Video title',title[1].trim().slice(0,60));
  const subtitle=text.match(/(?:^|[,;]\s*|\b)(?:set\s+)?subtitle\s*(?:to|as|[:=])\s*(.+)$/i);
  if(subtitle)add('subtitleInput','Subtitle',subtitle[1].trim().slice(0,90));
  const bass=lower.match(/bass\s*(?:to\s*)?([+-]?\d{1,2})\s*(?:db)?/);
  if(bass)add('mainBass','Music bass',Math.max(-12,Math.min(12,Number(bass[1]))));
  else if(/bass\s*(up|increase|boost|barhao)/i.test(lower))add('mainBass','Music bass',Math.min(12,(Number(current.mainBass)||0)+3));
  else if(/bass\s*(down|decrease|reduce|kam)/i.test(lower))add('mainBass','Music bass',Math.max(-12,(Number(current.mainBass)||0)-3));
  const treble=lower.match(/treble\s*(?:to\s*)?([+-]?\d{1,2})\s*(?:db)?/);
  if(treble)add('mainTreble','Music treble',Math.max(-12,Math.min(12,Number(treble[1]))));
  else if(/treble\s*(up|increase|boost)/i.test(lower))add('mainTreble','Music treble',Math.min(12,(Number(current.mainTreble)||0)+3));
  else if(/treble\s*(down|decrease|reduce)/i.test(lower))add('mainTreble','Music treble',Math.max(-12,(Number(current.mainTreble)||0)-3));
  const volume=lower.match(/volume\s*(?:to\s*)?(\d{1,3})\s*%?/);
  if(volume)add('volume','Main music volume',Math.max(0,Math.min(100,Number(volume[1])))/100);
  const pitch=lower.match(/pitch\s*([+-]?\d{1,2})/);
  if(pitch)add('mainPitch','Main music pitch',Math.max(-12,Math.min(12,Number(pitch[1]))));
  if(/lyrics?\s*(bigger|larger|increase)/i.test(lower))add('lyricSize','Lyric size',Math.min(90,(Number(current.lyricSize)||48)+10));
  else if(/lyrics?\s*(smaller|reduce|decrease)/i.test(lower))add('lyricSize','Lyric size',Math.max(20,(Number(current.lyricSize)||48)-10));
  return{actions,unsupported:actions.length?[]:[text?'I could not match that request to a supported local edit.':'Enter an edit request first.']};
 }
 function mount(host,options={}){
  if(!host||!root.document)return null;
  const $=id=>host.querySelector('#'+id),input=$('offlineEditPrompt'),preview=$('offlineEditPreview'),apply=$('offlineEditApply'),analyse=$('offlineEditAnalyse'),status=$('offlineEditStatus');
  let pending=[];
  function current(){const read=id=>$(id)?$(id).value:'';return{autoVideoIntensity:read('autoVideoIntensity'),mainBass:read('mainBass'),mainTreble:read('mainTreble'),lyricSize:read('lyricSize')};}
  function show(){
   preview.innerHTML='';
   pending.forEach(action=>{const item=root.document.createElement('li');item.textContent=action.label+': '+action.value;preview.appendChild(item);});
   if(!pending.length){const item=root.document.createElement('li');item.textContent='No supported changes detected.';preview.appendChild(item);}
   apply.disabled=!pending.length;
  }
  input.addEventListener('input',()=>{pending=[];show();status.textContent='Prompt changed. Preview again before applying.';});
  analyse.addEventListener('click',()=>{
   const result=parsePrompt(input.value,current());pending=result.actions;show();
   status.textContent=result.unsupported[0]||'Preview ready. Only the listed supported edits will be applied; other parts are ignored.';
  });
  apply.addEventListener('click',()=>{
   if(!pending.length)return;
   let count=0;
   pending.forEach(action=>{
    if(action.id==='visualStyle'){const button=host.querySelector('.style-card[data-style="'+action.value+'"]');if(button){button.click();count++;}return;}
    const control=root.document.getElementById(action.id);if(!control)return;
    control.value=String(action.value);control.dispatchEvent(new Event(control.tagName==='SELECT'?'change':'input',{bubbles:true}));
    if(action.id==='mainPitch'){control.dispatchEvent(new Event('change',{bubbles:true}));}
    if(action.id==='exportRatio')control.dispatchEvent(new Event('change',{bubbles:true}));
    count++;
   });
   if(options.onApply)options.onApply();
   status.textContent=count+' supported edit(s) applied locally. Review the preview before export.';
   pending=[];show();
  });
  return{parse:parsePrompt};
 }
 const api={parsePrompt,mount};root.WaveForgeOfflineAssistant=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
