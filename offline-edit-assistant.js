'use strict';
(function(root){
 function parsePrompt(prompt,current={}){
  const text=String(prompt||'').trim(),lower=text.toLowerCase(),actions=[],used=new Set();
  const add=(id,label,value)=>{if(!used.has(id)){used.add(id);actions.push({id,label,value});}};
  const styleRules=[
   [/(?:cinematic|cinema|film look|filmi style)/,'cinematic'],
   [/(?:travel|safar|trip montage)/,'travel'],
   [/(?:vlog|daily vlog)/,'vlog'],
   [/(?:calm|aesthetic|sukoon|ahista look)/,'calm'],
   [/(?:photo memories|photo story|tasveer|photos|pictures)/,'photo'],
   [/(?:lyric pulse|lyrics style|lyrics beat)/,'lyric'],
   [/(?:flash cuts|flash style|flash)/,'flash'],
   [/(?:memory film|memories|yaadon|yaadein)/,'memories'],
   [/(?:documentary|documentary style|dastavezi)/,'documentary'],
   [/(?:beat snap|social|reels|tiktok|fast social)/,'social']
  ];
  for(const [pattern,value] of styleRules)if(pattern.test(lower)){add('autoVideoStyle','Video editing template',value);break;}
  if(/(?:more cuts|cut faster|faster cuts|zyada cuts|tez cuts|cuts? tez|cuts? fast|speed barhao)/i.test(lower))add('autoVideoIntensity','Cut intensity',Math.min(5,(Number(current.autoVideoIntensity)||3)+1));
  else if(/(?:fewer cuts|cut slower|slower cuts|kam cuts|slow cuts|cuts? ahista|cuts? dheema|speed kam)/i.test(lower))add('autoVideoIntensity','Cut intensity',Math.max(1,(Number(current.autoVideoIntensity)||3)-1));
  const vis=[[/equalizer bars|equalizer|bars/,'bars'],[/waveform|wave/,'wave'],[/circle|circular/,'circle'],[/neon pulse|neon/,'neon']];
  for(const [pattern,value] of vis)if(pattern.test(lower)){add('visualStyle','Visualizer style',value);break;}
  const colors=[[/sunset/,'sunset'],[/ice blue|ice|neela/,'ice'],[/aurora/,'aurora'],[/monochrome|mono/,'mono']];
  for(const [pattern,value] of colors)if(pattern.test(lower)){add('visualColor','Color theme',value);break;}
  const ratio=lower.match(/(?:9\s*:\s*16|16\s*:\s*9|1\s*:\s*1)/);
  if(ratio)add('exportRatio','Canvas format',ratio[0].replace(/\s/g,''));
  else if(/(?:vertical|portrait|mobile|seedha format|reels format)/i.test(lower))add('exportRatio','Canvas format','9:16');
  else if(/(?:horizontal|landscape|wide format)/i.test(lower))add('exportRatio','Canvas format','16:9');
  else if(/(?:square|chowkor)/i.test(lower))add('exportRatio','Canvas format','1:1');
  const titlePatterns=[
   /(?:video\s+)?\btitle\s*(?:to|as|[:=]|ko|mein)\s*([^,;]+)/i,
   /(?:video\s+)?\btitle\s+(.+?)\s+(?:rakho|likho|set\s+karo)(?=$|[,;])/i
  ];
  for(const pattern of titlePatterns){const match=text.match(pattern);if(match){const value=match[1].trim().replace(/\s+(?:rakho|likho|set\s+karo)$/i,'').trim();if(value){add('titleInput','Video title',value.slice(0,60));break;}}}
  const subtitlePatterns=[
   /subtitle\s*(?:to|as|[:=]|ko|mein)\s*([^,;]+)/i,
   /subtitle\s+(.+?)\s+(?:rakho|likho|set\s+karo)(?=$|[,;])/i
  ];
  for(const pattern of subtitlePatterns){const match=text.match(pattern);if(match){const value=match[1].trim().replace(/\s+(?:rakho|likho|set\s+karo)$/i,'').trim();if(value){add('subtitleInput','Subtitle',value.slice(0,90));break;}}}
  const bass=lower.match(/bass\s*(?:(?:to|ko)\s*)?([+-]?\d{1,2})\s*(?:db|decibel)?/);
  if(bass)add('mainBass','Music bass',Math.max(-12,Math.min(12,Number(bass[1]))));
  else if(/bass\s*(?:ko\s*)?(?:up|increase|boost|barhao|badhao|tez karo)/i.test(lower))add('mainBass','Music bass',Math.min(12,(Number(current.mainBass)||0)+3));
  else if(/bass\s*(?:ko\s*)?(?:down|decrease|reduce|kam karo|ghatao|kam)/i.test(lower))add('mainBass','Music bass',Math.max(-12,(Number(current.mainBass)||0)-3));
  const treble=lower.match(/treble\s*(?:(?:to|ko)\s*)?([+-]?\d{1,2})\s*(?:db|decibel)?/);
  if(treble)add('mainTreble','Music treble',Math.max(-12,Math.min(12,Number(treble[1]))));
  else if(/treble\s*(?:ko\s*)?(?:up|increase|boost|barhao|badhao)/i.test(lower))add('mainTreble','Music treble',Math.min(12,(Number(current.mainTreble)||0)+3));
  else if(/treble\s*(?:ko\s*)?(?:down|decrease|reduce|kam|ghatao)/i.test(lower))add('mainTreble','Music treble',Math.max(-12,(Number(current.mainTreble)||0)-3));
  const volume=lower.match(/(?:volume|awaz|awaaz)\s*(?:(?:to|ko)\s*)?(\d{1,3})\s*(?:%|percent|feesad)?/);
  if(volume)add('volume','Main music volume',Math.max(0,Math.min(100,Number(volume[1])))/100);
  else if(/(?:volume|awaz|awaaz)\s*(?:barhao|badhao|tez karo|up)/i.test(lower))add('volume','Main music volume',Math.min(1,(Number(current.volume)||.85)+.1));
  else if(/(?:volume|awaz|awaaz)\s*(?:kam karo|ghatao|down)/i.test(lower))add('volume','Main music volume',Math.max(0,(Number(current.volume)||.85)-.1));
  const pitch=lower.match(/pitch\s*(?:ko\s*)?([+-]?\d{1,2})/);
  if(pitch)add('mainPitch','Main music pitch',Math.max(-12,Math.min(12,Number(pitch[1]))));
  if(/(?:lyrics?|words?|text)\s*(?:ko\s*)?(?:bigger|larger|increase|bara|bara karo|baray karo)/i.test(lower))add('lyricSize','Lyric size',Math.min(90,(Number(current.lyricSize)||48)+10));
  else if(/(?:lyrics?|words?|text)\s*(?:ko\s*)?(?:smaller|reduce|decrease|chota|chota karo|chotay karo)/i.test(lower))add('lyricSize','Lyric size',Math.max(20,(Number(current.lyricSize)||48)-10));
  const roman=/\b(?:karo|kar do|barhao|badhao|kam|zyada|tez|ahista|rakho|likho|safar|yaadein|tasveer|awaz|sukoon)\b/i.test(lower);
  return{actions,unsupported:actions.length?[]:[text?(roman?'Yeh request abhi is offline helper ke supported commands mein nahi hai.':'I could not match that request to a supported local edit.'):'Edit request likhein. / Enter an edit request.']};
 }
 function mount(host,options={}){
  if(!host||!root.document)return null;
  const $=id=>host.querySelector('#'+id),input=$('offlineEditPrompt'),preview=$('offlineEditPreview'),apply=$('offlineEditApply'),analyse=$('offlineEditAnalyse'),status=$('offlineEditStatus');
  let pending=[];
  function current(){const read=id=>$(id)?$(id).value:'';return{autoVideoIntensity:read('autoVideoIntensity'),mainBass:read('mainBass'),mainTreble:read('mainTreble'),lyricSize:read('lyricSize'),volume:read('volume')};}
  function show(){
   preview.innerHTML='';pending.forEach(action=>{const item=root.document.createElement('li');item.textContent=action.label+': '+action.value;preview.appendChild(item);});
   if(!pending.length){const item=root.document.createElement('li');item.textContent='No supported changes detected.';preview.appendChild(item);}
   apply.disabled=!pending.length;
  }
  input.addEventListener('input',()=>{pending=[];show();status.textContent='Prompt changed. Preview again before applying.';});
  analyse.addEventListener('click',()=>{const result=parsePrompt(input.value,current());pending=result.actions;show();status.textContent=result.unsupported[0]||'Preview ready. Only the listed supported edits will be applied; other parts are ignored.';});
  apply.addEventListener('click',()=>{
   if(!pending.length)return;let count=0;
   pending.forEach(action=>{
    if(action.id==='visualStyle'){const button=host.querySelector('.style-card[data-style="'+action.value+'"]');if(button){button.click();count++;}return;}
    const control=root.document.getElementById(action.id);if(!control)return;
    control.value=String(action.value);control.dispatchEvent(new Event(control.tagName==='SELECT'?'change':'input',{bubbles:true}));
    if(action.id==='mainPitch'||action.id==='exportRatio')control.dispatchEvent(new Event('change',{bubbles:true}));count++;
   });
   if(options.onApply)options.onApply();status.textContent=count+' supported edit(s) applied locally. Review the preview before export.';pending=[];show();
  });
  return{parse:parsePrompt};
 }
 const api={parsePrompt,mount};root.WaveForgeOfflineAssistant=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
