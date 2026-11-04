(function(){
const $=id=>document.getElementById(id);
const audio=$('audio'),canvas=$('visualizer'),ctx=canvas.getContext('2d');
let engine=null,raf=0,playing=false,style='bars',logoUrl=null,logoImage=null,mediaUrl=null,mediaKind='',audioFile=null,savedTrackName='',lyrics=[],template='trend',beatPulse=0,dragTarget=null,dragOffset={x:0,y:0};
const palette={aurora:['#9b8cff','#65e5c0','#e8f5ff'],sunset:['#ff8c75','#ffca7a','#f8a8cf'],ice:['#62d8ff','#9fbaff','#e4f7ff'],mono:['#fff','#b9c4d5','#eef3fb']};
const positions={title:{x:.5,y:.23},subtitle:{x:.5,y:.29},lyric:{x:.5,y:.80},logo:{x:.82,y:.08}};
function setStatus(t){$('saveState').textContent='● '+t;}
function fmt(s){if(!isFinite(s))s=0;return String(Math.floor(s/60)).padStart(2,'0')+':'+String(Math.floor(s%60)).padStart(2,'0');}
function resizeCanvas(){
 const ratio=$('exportRatio').value.split(':').map(Number),q=Number($('quality').value);
 canvas.width=Math.round(q*Math.max(1,ratio[0]/ratio[1]));canvas.height=Math.round(q*Math.max(1,ratio[1]/ratio[0]));
 $('stage').style.aspectRatio=ratio.join('/');$('resolutionLabel').textContent=canvas.width+' × '+canvas.height;
 document.querySelectorAll('.ratio').forEach(b=>b.classList.toggle('active',b.dataset.ratio===$('exportRatio').value));
}
function roundRect(x,y,w,h,r){ctx.beginPath();ctx.roundRect?ctx.roundRect(x,y,w,h,r):(ctx.rect(x,y,w,h));}
function drawWrapped(text,x,y,maxWidth,lineHeight){
 const words=String(text||'').split(/\s+/),lines=[];let line='';
 words.forEach(word=>{const test=line?line+' '+word:word;if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=word;}else line=test;});
 if(line)lines.push(line);lines.slice(0,3).forEach((v,i)=>ctx.fillText(v,x,y+i*lineHeight,maxWidth));return lines.length*lineHeight;
}
function currentLyric(){
 const t=audio.currentTime||0;
 return lyrics.find(line=>t>=line.start&&t<line.end)||null;
}
function draw(){
 const w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);
 const bg=$('backgroundImage'),vid=$('backgroundVideo');
 let source=null;
 if(mediaKind==='image'&&bg.complete&&bg.naturalWidth>0)source=bg;
 if(mediaKind==='video'&&vid.readyState>=2&&vid.videoWidth>0)source=vid;
 if(source){
  const sw=source.videoWidth||source.naturalWidth,sh=source.videoHeight||source.naturalHeight;
  const scale=Math.max(w/sw,h/sh),dw=sw*scale,dh=sh*scale;
  ctx.drawImage(source,(w-dw)/2,(h-dh)/2,dw,dh);
 }else{
  const grad=ctx.createRadialGradient(w*.5,h*.4,0,w*.5,h*.5,h*.75);
  grad.addColorStop(0,'#29304f');grad.addColorStop(1,'#080d18');ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);
 }
 const shade=ctx.createLinearGradient(0,0,0,h);shade.addColorStop(0,'#080d2420');shade.addColorStop(1,'#080d24bb');ctx.fillStyle=shade;ctx.fillRect(0,0,w,h);
 const colors=palette[$('visualColor').value]||palette.aurora;
 const data=engine?engine.getFrequency():new Uint8Array(128),wave=engine?engine.getWaveform():new Uint8Array(128).fill(128);
 if(engine&&playing){const beat=engine.detectBeat(Number($('sensitivity').value));if(beat.hit)beatPulse=1;$('beatStatus').textContent=beat.hit?'Beat detected · audio energy pulse':'Listening for beat energy…';}
 beatPulse*=.92;const intensity=Number($('intensity').value)/100,base=Math.min(w,h)*.16;
 ctx.save();ctx.translate(w/2,h*.56);ctx.lineWidth=Math.max(2,w*.004);ctx.lineCap='round';ctx.strokeStyle=colors[0];ctx.fillStyle=colors[0];ctx.shadowBlur=18+beatPulse*24;ctx.shadowColor=colors[0];
 if(style==='bars'){
  const count=72,gap=Math.max(2,w*.004),bw=(w*.78)/count;
  for(let i=0;i<count;i++){const v=data[Math.floor(i*data.length/count)]/255,bh=(.025+v*.32*intensity+beatPulse*.12)*h;ctx.globalAlpha=.35+v*.65;ctx.fillStyle=colors[i%2];ctx.fillRect(-w*.39+i*(bw+gap),-bh/2,bw,bh);}
 }else if(style==='wave'){
  ctx.beginPath();for(let i=0;i<wave.length;i+=2){const x=(i/(wave.length-1)-.5)*w*.82,y=((wave[i]-128)/128)*h*.19*intensity;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.stroke();
 }else{
  const count=style==='circle'?96:48;ctx.beginPath();ctx.arc(0,0,base+beatPulse*base*.14,0,Math.PI*2);ctx.globalAlpha=.5;ctx.stroke();
  for(let i=0;i<count;i++){const a=i/count*Math.PI*2,v=data[Math.floor(i*data.length/count)]/255,inner=base*.78,outer=inner+(style==='neon'?base*.45:base*(.14+v*.65*intensity+beatPulse*.12));ctx.globalAlpha=.35+v*.65;ctx.strokeStyle=colors[i%3];ctx.lineWidth=style==='neon'?Math.max(2,w*.006):Math.max(2,w*.003);ctx.beginPath();ctx.moveTo(Math.cos(a)*inner,Math.sin(a)*inner);ctx.lineTo(Math.cos(a)*outer,Math.sin(a)*outer);ctx.stroke();}
 }
 ctx.restore();ctx.shadowBlur=0;ctx.globalAlpha=1;ctx.textAlign='center';ctx.textBaseline='middle';
 const title=$('titleInput').value||'',subtitle=$('subtitleInput').value||'';
 ctx.fillStyle=$('textColor').value;ctx.font='800 '+Math.round(w*.052)+'px '+($('fontStyle').value==='serif'?'Georgia':$('fontStyle').value==='mono'?'monospace':'sans-serif');
 ctx.shadowColor='#000';ctx.shadowBlur=14;drawWrapped(title,positions.title.x*w,positions.title.y*h,w*.82,Math.round(w*.06));
 ctx.font='500 '+Math.round(w*.025)+'px sans-serif';ctx.fillStyle='#ffffffed';drawWrapped(subtitle,positions.subtitle.x*w,positions.subtitle.y*h,w*.82,Math.round(w*.035));
 const lyric=currentLyric();
 if(lyric&&lyric.text){
  const size=Math.round(w*Number($('lyricSize').value)/1000),x=positions.lyric.x*w,y=positions.lyric.y*h,max=w*.84;
  ctx.save();ctx.textAlign='left';ctx.textBaseline='middle';ctx.font=(template==='poetry'?'italic 700 ':'900 ')+size+'px '+(template==='poetry'?'Georgia,serif':template==='minimal'?'Georgia,serif':'sans-serif');
  const words=Array.isArray(lyric.words)&&lyric.words.length?lyric.words:lyric.text.split(' ').map((text,i,a)=>({text,start:lyric.start+(lyric.end-lyric.start)*i/a.length,end:lyric.start+(lyric.end-lyric.start)*(i+1)/a.length}));
  const rows=[[]],rowWidths=[0],space=ctx.measureText(' ').width;
  words.forEach(word=>{const width=ctx.measureText(word.text).width,idx=rows.length-1;if(rowWidths[idx]+(rows[idx].length?space:0)+width>max*.9&&rows[idx].length){rows.push([]);rowWidths.push(0);}const n=rows.length-1;rows[n].push({word,width});rowWidths[n]+=width+(rows[n].length>1?space:0);});
  const lineH=size*1.18,boxH=rows.length*lineH+size*.65,boxW=Math.min(max,Math.max(...rowWidths)+size);
  if(template==='trend'||template==='karaoke'){ctx.fillStyle=template==='trend'?'#080b16bb':'#071b1bc9';roundRect(x-boxW/2,y-boxH/2,boxW,boxH,size*.22);ctx.fill();}
  if(template==='poetry'){ctx.fillStyle='#fff3e8';ctx.shadowColor='#1b0d18';ctx.shadowBlur=16;}
  else if(template==='minimal'){ctx.fillStyle='#fff';ctx.shadowColor='#000';ctx.shadowBlur=8;}
  else if(template==='neon'){ctx.fillStyle='#fff';ctx.shadowColor='#b18aff';ctx.shadowBlur=26;}
  else if(template==='karaoke'){ctx.shadowColor='#2affd2';ctx.shadowBlur=22;}
  else{ctx.fillStyle='#fff';ctx.shadowColor='#ff3d9a';ctx.shadowBlur=18;}
  rows.forEach((row,i)=>{
    let px=x-rowWidths[i]/2;const yy=y+(i-(rows.length-1)/2)*lineH;
    row.forEach(item=>{
      const active=audio.currentTime>=item.word.start&&audio.currentTime<item.word.end;
      if(template==='karaoke')ctx.fillStyle=active?'#fff36b':'#bafff0';
      ctx.fillText(item.word.text,px,yy);px+=item.width+space;
    });
  });
  ctx.restore();
 }
 if(logoImage&&logoImage.complete&&logoImage.naturalWidth){const lw=w*.2,lh=lw*(logoImage.naturalHeight/logoImage.naturalWidth);ctx.drawImage(logoImage,positions.logo.x*w-lw/2,positions.logo.y*h-lh/2,lw,lh);}
 ctx.shadowBlur=0;ctx.font='600 '+Math.round(w*.012)+'px sans-serif';ctx.fillStyle='#ffffff88';ctx.fillText('WAVEFORGE',w/2,h*.96);
 if(!playing&&!audio.src){ctx.fillStyle='#ffffffb0';ctx.font='600 '+Math.round(w*.018)+'px sans-serif';ctx.fillText('ADD A TRACK TO START THE VISUALIZER',w/2,h*.84);}
 raf=requestAnimationFrame(draw);
}
function startDraw(){if(!raf)draw();}
async function ensureEngine(){if(!engine)engine=new AudioEngine(audio);await engine.connect();await engine.resume();engine.setVolume(Number($('volume').value));mixerLayers.forEach(layer=>{if(!layer.connected){engine.addLayer(layer.id,layer.audio,layer.muted?0:layer.volume);layer.connected=true;}});return engine;}

let mixerLayers=[],mixerPanel=null,mixerCategory='Voice';
function syncMixerLayers(){
 const now=audio.currentTime||0;
 mixerLayers.forEach(layer=>{
  const target=(now-layer.offset)*layer.rate;
  if(audio.paused||target<0||(isFinite(layer.audio.duration)&&layer.audio.duration>0&&target>=layer.audio.duration)){
   if(!layer.audio.paused)layer.audio.pause();
   if(target<0&&layer.audio.currentTime!==0)layer.audio.currentTime=0;
   return;
  }
  if(Math.abs(layer.audio.currentTime-target)>.35)try{layer.audio.currentTime=Math.max(0,target);}catch(e){}
  if(layer.audio.paused)layer.audio.play().catch(()=>{});
 });
}
function initMixerUI(){
 const host=$('audioPanel'),audioEl=$('audio');
 mixerPanel=document.createElement('section');mixerPanel.className='mixer-panel music-studio';
 mixerPanel.innerHTML='<div class="mixer-heading"><div><b>Music Studio</b><small>Choose one workspace. Its controls open below, so the screen stays organized.</small></div><span class="mixer-live">TRACK EDITOR</span></div>'+
 '<div class="music-category-nav" id="musicCategoryNav" role="tablist" aria-label="Music editing categories">'+
 '<button type="button" class="music-category active" data-category="Voice">Vocals</button>'+
 '<button type="button" class="music-category" data-category="Ad-lib">Ad-libs</button>'+
 '<button type="button" class="music-category" data-category="Humming">Humming</button>'+
 '<button type="button" class="music-category" data-category="Harmony">Harmonies</button>'+
 '<button type="button" class="music-category" data-category="Instruments">Instruments</button>'+
 '<button type="button" class="music-category" data-category="Sound effect">Sound effects</button>'+
 '<button type="button" class="music-category" data-category="Voice FX">Voice FX</button>'+
 '<button type="button" class="music-category" data-category="Separation">AI separation</button>'+
 '<button type="button" class="music-category" data-category="Cleanup">Noise cleanup</button></div>'+
 '<div class="music-category-detail" id="musicCategoryDetail" aria-live="polite"></div>'+
 '<div class="mixer-add"><label>Layer source<select id="mixerRole"><option>Voice</option><option>Background vocal</option><option>Ad-lib</option><option>Humming</option><option>Harmony</option><option>Bass stem</option><option>Drums</option><option>Piano</option><option>Guitar</option><option>Instrumental</option><option>Sound effect</option><option>Voice FX</option><option>Other</option></select></label><label class="mixer-file">＋ Import audio<input id="mixerFile" type="file" accept="audio/*" hidden></label><button class="btn small" id="mixerAddBtn" type="button">Add to track</button></div>'+
 '<div class="mixer-main-pitch"><label>Background music pitch <input id="mainPitch" type="range" min="-12" max="12" step="1" value="0"></label><span id="mainPitchValue">0 semitones</span></div>'+
 '<div id="mixerList" class="mixer-list"><p class="hint">No extra layers yet. Your original song remains the background music.</p></div>'+
 '<p class="hint mixer-footnote">Imported layers are independently adjustable. A mixed MP3 does not contain separately editable stems automatically. AI separation and generated vocal effects are not connected yet.</p>';
 host.insertBefore(mixerPanel,audioEl);
 try{const saved=JSON.parse(localStorage.getItem('waveforge-v1')||'{}');if(saved.mainPitch!==undefined){$('mainPitch').value=saved.mainPitch;audio.playbackRate=Math.pow(2,Number(saved.mainPitch)/12);audio.preservesPitch=false;$('mainPitchValue').textContent=(Number(saved.mainPitch)>0?'+':'')+saved.mainPitch+' semitones';}}catch(e){}
 const file=$('mixerFile');
 $('mixerAddBtn').onclick=()=>file.click();
 file.onchange=e=>{const f=e.target.files&&e.target.files[0];if(f)addMixerLayer(f,$('mixerRole').value);file.value='';};
 $('mainPitch').oninput=e=>{
  const semitones=Number(e.target.value),rate=Math.pow(2,semitones/12);
  audio.playbackRate=rate;audio.preservesPitch=false;
  $('mainPitchValue').textContent=(semitones>0?'+':'')+semitones+' semitones';
  saveSettings();
 };
 document.querySelectorAll('.music-category').forEach(btn=>btn.onclick=()=>selectMusicCategory(btn.dataset.category));
 selectMusicCategory('Voice');
 audio.addEventListener('timeupdate',syncMixerLayers);
 audio.addEventListener('play',syncMixerLayers);
 audio.addEventListener('seeking',syncMixerLayers);
 audio.addEventListener('pause',()=>mixerLayers.forEach(layer=>layer.audio.pause()));
 audio.addEventListener('ended',()=>mixerLayers.forEach(layer=>layer.audio.pause()));
}
function selectMusicCategory(category){
 mixerCategory=category;
 document.querySelectorAll('.music-category').forEach(btn=>btn.classList.toggle('active',btn.dataset.category===category));
 const detail=$('musicCategoryDetail'),role=$('mixerRole'),add=$('mixerAddBtn'),file=$('mixerFile');
 const config={
  'Voice':{role:'Voice',title:'Main vocals',desc:'Import an isolated vocal stem to adjust its volume, pitch, speed and timing without changing the background track.',available:true},
  'Ad-lib':{role:'Ad-lib',title:'Ad-libs & doubles',desc:'Add a separate ad-lib or doubled-vocal recording, then position it and control it independently.',available:true},
  'Humming':{role:'Humming',title:'Humming layers',desc:'Import or record a humming layer separately. Humming generation is not connected yet.',available:true},
  'Harmony':{role:'Harmony',title:'Harmonies & backing vocals',desc:'Import harmony/backing-vocal stems as separate tracks. Automatic harmony generation is not connected yet.',available:true},
  'Instruments':{role:'Bass stem',title:'Instrument stems',desc:'Choose bass, drums, piano, guitar or instrumental in the source selector. Each imported stem gets its own controls.',available:true},
  'Sound effect':{role:'Sound effect',title:'Sound effects',desc:'Import a clean effect clip and position it independently over your song.',available:true},
  'Voice FX':{role:'Voice FX',title:'Voice changer & character effects',desc:'Import a processed voice layer. Built-in character generation and advanced formant processing are not connected yet.',available:true},
  'Separation':{role:'Instrumental',title:'AI vocal & instrument separation',desc:'This operation is planned but not implemented yet. The current app cannot extract vocals or instruments from a mixed MP3 automatically.',available:false},
  'Cleanup':{role:'Voice',title:'Noise cleanup',desc:'Noise removal and voice isolation are planned but not implemented yet. Original audio is left unchanged.',available:false}
 };
 const item=config[category]||config.Voice;
 role.value=item.role;
 detail.innerHTML='<div class="music-detail-title"><div><span class="eyebrow">SELECTED WORKSPACE</span><h3>'+item.title+'</h3></div><span class="music-detail-state">'+(item.available?'IMPORT READY':'NOT IMPLEMENTED')+'</span></div><p>'+item.desc+'</p>';
 add.disabled=!item.available;file.disabled=!item.available;
 renderMixerLayers();
}
function addMixerLayer(file,role){
 if(!file.type.startsWith('audio/')){alert('Choose a supported audio file.');return;}
 const id='mix-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),url=URL.createObjectURL(file);
 const el=document.createElement('audio');el.preload='auto';el.hidden=true;el.src=url;el.preservesPitch=false;
 const layer={id,file,url,audio:el,role,volume:.85,rate:1,offset:0,muted:false,connected:false};
 mixerLayers.push(layer);mixerPanel.appendChild(el);renderMixerLayers();
 if(engine&&engine.ready){engine.addLayer(id,el,layer.volume);layer.connected=true;}
 syncMixerLayers();setStatus('Audio layer added');
}
function renderMixerLayers(){
 const list=$('mixerList');list.innerHTML='';
 if(!mixerLayers.length){list.innerHTML='<p class="hint">No extra layers yet. Your main audio remains the background music.</p>';return;}
 mixerLayers.forEach(layer=>{
  const row=document.createElement('div');row.className='mixer-track';
  const head=document.createElement('div');head.className='mixer-track-head';
  const info=document.createElement('div'),name=document.createElement('b'),meta=document.createElement('small');
  name.textContent=layer.file.name;meta.textContent=layer.role;info.append(name,meta);
  const mute=document.createElement('button');mute.className='btn small';mute.textContent=layer.muted?'Unmute':'Mute';
  mute.onclick=()=>{layer.muted=!layer.muted;mute.textContent=layer.muted?'Unmute':'Mute';if(engine&&layer.connected)engine.setLayerVolume(layer.id,layer.muted?0:layer.volume);};
  const remove=document.createElement('button');remove.className='btn small';remove.textContent='Remove';
  remove.onclick=()=>{if(engine&&layer.connected)engine.removeLayer(layer.id);layer.audio.pause();layer.audio.removeAttribute('src');layer.audio.load();URL.revokeObjectURL(layer.url);mixerLayers=mixerLayers.filter(x=>x!==layer);renderMixerLayers();};
  head.append(info,mute,remove);row.append(head);
  const controls=document.createElement('div');controls.className='mixer-track-controls';
  const volWrap=document.createElement('label');volWrap.textContent='Volume';
  const vol=document.createElement('input');vol.type='range';vol.min='0';vol.max='1';vol.step='.01';vol.value=layer.volume;
  vol.oninput=()=>{layer.volume=Number(vol.value);if(engine&&layer.connected)engine.setLayerVolume(layer.id,layer.muted?0:layer.volume);};
  volWrap.append(vol);
  const pitchWrap=document.createElement('label');pitchWrap.textContent='Pitch';
  const pitch=document.createElement('input');pitch.type='range';pitch.min='-12';pitch.max='12';pitch.step='1';pitch.value='0';
  const pitchText=document.createElement('small');pitchText.textContent='0 semitones';
  pitch.oninput=()=>{const n=Number(pitch.value);layer.rate=Math.pow(2,n/12);layer.audio.playbackRate=layer.rate;layer.audio.preservesPitch=false;pitchText.textContent=(n>0?'+':'')+n+' semitones';syncMixerLayers();};
  pitchWrap.append(pitch,pitchText);
  const offsetWrap=document.createElement('label');offsetWrap.textContent='Start offset (seconds)';
  const offset=document.createElement('input');offset.type='number';offset.min='0';offset.max='3600';offset.step='.1';offset.value='0';
  offset.onchange=()=>{layer.offset=Math.max(0,Number(offset.value)||0);syncMixerLayers();};
  offsetWrap.append(offset);controls.append(volWrap,pitchWrap,offsetWrap);row.append(controls);list.append(row);
 });
}

function updateText(){ $('previewTitle').textContent=$('titleInput').value||' ';$('previewSubtitle').textContent=$('subtitleInput').value||'';$('stageCopy').style.color=$('textColor').value;$('stageCopy').style.fontFamily=$('fontStyle').value==='serif'?'Georgia,serif':$('fontStyle').value==='mono'?'monospace':'Manrope,sans-serif';}
function saveSettings(){
 const data={mainPitch:$('mainPitch')?$('mainPitch').value:0,title:$('titleInput').value,subtitle:$('subtitleInput').value,caption:$('captionInput').value,color:$('visualColor').value,style,ratio:$('exportRatio').value,quality:$('quality').value,font:$('fontStyle').value,textColor:$('textColor').value,template,lyricSize:$('lyricSize').value,positions,lyrics,trackName:audioFile?audioFile.name:savedTrackName};
 try{localStorage.setItem('waveforge-v1',JSON.stringify(data));setStatus('Saved locally');}catch(e){setStatus('Ready');}
}
function loadSettings(){
 try{const d=JSON.parse(localStorage.getItem('waveforge-v1')||'{}');if(d.title!==undefined)$('titleInput').value=d.title;if(d.subtitle!==undefined)$('subtitleInput').value=d.subtitle;if(d.caption!==undefined)$('captionInput').value=d.caption;if(d.color)$('visualColor').value=d.color;if(d.ratio)$('exportRatio').value=d.ratio;if(d.quality)$('quality').value=d.quality;if(d.font)$('fontStyle').value=d.font;if(d.textColor)$('textColor').value=d.textColor;if(d.style)style=d.style;if(d.template)template=d.template;if(d.lyricSize)$('lyricSize').value=d.lyricSize;if(d.positions)Object.assign(positions,d.positions);if(Array.isArray(d.lyrics))lyrics=d.lyrics;savedTrackName=d.trackName||'';}catch(e){}
 updateText();selectTemplate(template);renderLyricList();resizeCanvas();
}
function selectTemplate(value){template=value;document.querySelectorAll('.template-card').forEach(b=>b.classList.toggle('selected',b.dataset.template===template));}
function loadAudio(file){
 if(!file)return;if(!file.type.startsWith('audio/')){alert('Please choose a valid audio file.');return;}
 if(audio.src)URL.revokeObjectURL(audio.src);audioFile=file;audio.src=URL.createObjectURL(file);
 $('trackName').textContent=file.name;$('trackMeta').textContent=(file.type||'Audio')+' · '+(file.size/1024/1024).toFixed(1)+' MB';$('playBtn').textContent='▶';$('timeLabel').textContent='00:00 / 00:00';if(file.name!==savedTrackName)lyrics=[];savedTrackName=file.name;renderLyricList();setStatus('Audio loaded');saveSettings();
}
function renderLyricList(){
 const host=$('lyricList');host.innerHTML='';
 if(!lyrics.length){host.innerHTML='<span class="hint">Generated or imported lyric lines will appear here.</span>';return;}
 lyrics.forEach((line,i)=>{const row=document.createElement('div');row.className='lyric-row';const time=document.createElement('time');time.textContent=fmt(line.start);const text=document.createElement('span');text.textContent=line.text;const edit=document.createElement('button');edit.textContent='Edit';edit.onclick=()=>{const v=prompt('Edit lyric line',line.text);if(v!==null){line.text=v;renderLyricList();}};row.append(time,text,edit);host.appendChild(row);});
}
function manualLyrics(){
 const lines=$('captionInput').value.split(/\n+/).map(x=>x.trim()).filter(Boolean),duration=audio.duration||Math.max(4,lines.length*4);
 lyrics=lines.map((text,i)=>({text,start:duration*i/Math.max(1,lines.length),end:duration*(i+1)/Math.max(1,lines.length)}));renderLyricList();saveSettings();
}
function parseTime(t){const p=t.trim().replace(',', '.').split(':');if(p.length===3)return Number(p[0])*3600+Number(p[1])*60+Number(p[2].split(' ')[0]);if(p.length===2)return Number(p[0])*60+Number(p[1].split(' ')[0]);return 0;}
function importSubtitles(text){
 const blocks=text.replace(/\r/g,'').split(/\n\s*\n/);const parsed=[];
 blocks.forEach(block=>{const lines=block.split('\n').filter(Boolean),idx=lines.findIndex(x=>x.includes('-->'));if(idx<0)return;const times=lines[idx].split('-->');const words=lines.slice(idx+1).join(' ').trim();if(words)parsed.push({start:parseTime(times[0]),end:parseTime(times[1]),text:words});});
 if(parsed.length){lyrics=parsed;$('captionInput').value=parsed.map(x=>x.text).join('\n');renderLyricList();setStatus('Subtitles imported');}else alert('No valid SRT/VTT subtitle cues were found.');
}
$('audioPickBtn').onclick=()=>$('audioInput').click();$('openProjectBtn').onclick=()=>$('audioInput').click();$('audioInput').onchange=e=>loadAudio(e.target.files[0]);
$('audioDrop').ondragover=e=>{e.preventDefault();$('audioDrop').style.borderColor='var(--accent)';};$('audioDrop').ondragleave=()=>$('audioDrop').style.borderColor='';
$('audioDrop').ondrop=e=>{e.preventDefault();$('audioDrop').style.borderColor='';loadAudio(e.dataTransfer.files[0]);};
$('playBtn').onclick=async()=>{if(!audio.src){$('audioInput').click();return;}try{await ensureEngine();if(audio.paused){await audio.play();playing=true;$('playBtn').textContent='Ⅱ';}else{audio.pause();playing=false;$('playBtn').textContent='▶';}}catch(e){alert(e.message);}};
audio.addEventListener('loadedmetadata',()=>{$('trackMeta').textContent=fmt(audio.duration)+' · Ready to play';$('timeLabel').textContent='00:00 / '+fmt(audio.duration);});
audio.addEventListener('timeupdate',()=>{if(engine)engine.applyFade(Number($('fadeIn').value),Number($('fadeOut').value));if(audio.duration){$('seekBar').value=Math.round(audio.currentTime/audio.duration*1000);$('timeLabel').textContent=fmt(audio.currentTime)+' / '+fmt(audio.duration);}const active=lyrics.findIndex(line=>audio.currentTime>=line.start&&audio.currentTime<line.end);document.querySelectorAll('.lyric-row').forEach((row,i)=>row.classList.toggle('active',i===active));});
audio.addEventListener('ended',()=>{playing=false;$('playBtn').textContent='▶';});
$('seekBar').oninput=e=>{if(audio.duration)audio.currentTime=Number(e.target.value)/1000*audio.duration;};
$('volume').oninput=e=>{if(engine)engine.setVolume(Number(e.target.value));else audio.volume=Number(e.target.value);};
$('fadeIn').oninput=e=>$('fadeInValue').textContent=e.target.value+'s';$('fadeOut').oninput=e=>$('fadeOutValue').textContent=e.target.value+'s';
document.querySelectorAll('.style-card').forEach(b=>b.onclick=()=>{style=b.dataset.style;document.querySelectorAll('.style-card').forEach(x=>x.classList.toggle('selected',x===b));saveSettings();});
['titleInput','subtitleInput','textColor','fontStyle','visualColor','intensity','sensitivity'].forEach(id=>$(id).addEventListener('input',()=>{updateText();saveSettings();}));
$('captionInput').addEventListener('input',manualLyrics);
document.querySelectorAll('.template-card').forEach(b=>b.onclick=()=>{selectTemplate(b.dataset.template);saveSettings();});
$('lyricSize').oninput=saveSettings;
$('lyricPosition').onchange=e=>{positions.lyric.y=e.target.value==='upper'?.36:e.target.value==='middle'?.56:.80;saveSettings();};
$('exportRatio').onchange=()=>{resizeCanvas();saveSettings();};document.querySelectorAll('.ratio').forEach(b=>b.onclick=()=>{$('exportRatio').value=b.dataset.ratio;resizeCanvas();saveSettings();});$('quality').onchange=()=>{resizeCanvas();saveSettings();};
document.querySelectorAll('[data-scroll]').forEach(b=>b.onclick=()=>$(b.dataset.scroll).scrollIntoView({behavior:'smooth'}));
$('themeToggle').onclick=()=>{document.body.classList.toggle('light');$('themeToggle').textContent=document.body.classList.contains('light')?'Dark mode':'Light mode';};
$('logoInput').onchange=e=>{const f=e.target.files[0];if(!f)return;if(logoUrl)URL.revokeObjectURL(logoUrl);logoUrl=URL.createObjectURL(f);const img=new Image();img.onload=()=>{logoImage=img;};img.src=logoUrl;$('stageLogo').innerHTML='';};
$('clearLogo').onclick=()=>{$('stageLogo').innerHTML='';if(logoUrl)URL.revokeObjectURL(logoUrl);logoUrl=null;logoImage=null;};
$('mediaInput').onchange=e=>{
 const f=e.target.files[0];if(!f)return;if(!f.type.startsWith('image/')&&!f.type.startsWith('video/')){alert('Choose an image or video file.');return;}
 if(mediaUrl)URL.revokeObjectURL(mediaUrl);mediaUrl=URL.createObjectURL(f);
 const img=$('backgroundImage'),vid=$('backgroundVideo');img.classList.add('hidden');vid.classList.add('hidden');vid.pause();vid.removeAttribute('src');img.removeAttribute('src');
 if(f.type.startsWith('image/')){mediaKind='image';img.onload=()=>{$('mediaStatus').textContent='Photo ready · '+f.name;};img.onerror=()=>{$('mediaStatus').textContent='Could not load this photo.';};img.src=mediaUrl;img.classList.remove('hidden');}
 else{mediaKind='video';vid.muted=true;vid.loop=true;vid.playsInline=true;vid.onloadeddata=()=>{$('mediaStatus').textContent='Video ready · '+f.name;vid.play().catch(()=>{});};vid.src=mediaUrl;vid.classList.remove('hidden');}
};
$('clearMedia').onclick=()=>{if(mediaUrl)URL.revokeObjectURL(mediaUrl);mediaUrl=null;mediaKind='';$('backgroundImage').removeAttribute('src');$('backgroundVideo').pause();$('backgroundVideo').removeAttribute('src');$('backgroundImage').classList.add('hidden');$('backgroundVideo').classList.add('hidden');$('mediaStatus').textContent='No background selected.';};
$('srtInput').onchange=async e=>{const f=e.target.files[0];if(f)importSubtitles(await f.text());};
$('transcribeBtn').onclick=async()=>{
 if(!audioFile){$('lyricStatus').textContent='Add an audio track first.';return;}
 const btn=$('transcribeBtn');btn.disabled=true;btn.textContent='Listening…';$('lyricProgressBar').style.width='2%';
 try{
  const result=await WaveForgeLyrics.transcribe(audioFile,$('whisperModel').value,p=>{$('lyricStatus').textContent=p.status;$('lyricProgressBar').style.width=p.progress+'%';});
  if(!result.length)throw new Error('No lyric text was recognized. Try the Base model or import subtitle lyrics.');
  lyrics=result;$('captionInput').value=result.map(x=>x.text).join('\n');renderLyricList();$('lyricStatus').textContent='Generated '+result.length+' timed lines. Review words and timing before export.';setStatus('Lyrics generated');saveSettings();
 }catch(err){$('lyricStatus').textContent='Could not transcribe: '+err.message+' — check internet for the first model download, then retry.';console.error(err);}
 finally{btn.disabled=false;btn.textContent='✦ Listen & generate lyrics';}
};
$('riskCheck').onclick=()=>{const a=$('ownAudio').checked,v=$('licensedVisuals').checked;$('riskResult').textContent=a&&v?'Checklist complete: you report having rights to the audio and visuals. This is not a copyright clearance.':'Review needed: confirm you have rights or licenses for '+[!a?'audio':'',!v?'visual media':''].filter(Boolean).join(' and ')+'. No automated copyright database scan has been performed.';};
function point(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width,y:(e.clientY-r.top)/r.height};}
canvas.addEventListener('pointerdown',e=>{
 const p=point(e),near=(pos,rx,ry)=>Math.abs(p.x-pos.x)<rx&&Math.abs(p.y-pos.y)<ry;
 dragTarget=near(positions.lyric,.46,.12)&&currentLyric()?'lyric':near(positions.title,.46,.07)?'title':near(positions.subtitle,.46,.06)?'subtitle':logoImage&&near(positions.logo,.15,.1)?'logo':null;
 if(dragTarget){dragOffset={x:p.x-positions[dragTarget].x,y:p.y-positions[dragTarget].y};canvas.setPointerCapture(e.pointerId);$('dragHint').textContent='Moving '+dragTarget+' layer — release to place it.';}
});
canvas.addEventListener('pointermove',e=>{if(!dragTarget)return;const p=point(e);positions[dragTarget]={x:Math.max(.08,Math.min(.92,p.x-dragOffset.x)),y:Math.max(.05,Math.min(.94,p.y-dragOffset.y))};});
canvas.addEventListener('pointerup',()=>{if(dragTarget){dragTarget=null;$('dragHint').textContent='Position saved. Touch another text layer to move it.';saveSettings();}});
canvas.addEventListener('pointercancel',()=>{dragTarget=null;});
async function doExport(){
 if(!audio.src){alert('Add an audio track first.');return;}const status=$('exportStatus');
 try{resizeCanvas();await ensureEngine();audio.currentTime=0;status.textContent='Preparing recording…';$('exportBtn').disabled=true;$('exportBtnSide').disabled=true;
  const result=await WaveForgeExport.record(canvas,audio,{fps:$('fps').value,quality:$('quality').value,audioStream:engine.getExportStream()},p=>status.textContent='Rendering in real time… '+p+'%');
  status.textContent='Export complete · '+result.ext.toUpperCase()+' · '+(result.size/1024/1024).toFixed(1)+' MB';
 }catch(e){status.textContent='Export unavailable: '+e.message;alert(e.message);}
 finally{$('exportBtn').disabled=false;$('exportBtnSide').disabled=false;}
}
$('exportBtn').onclick=doExport;$('exportBtnSide').onclick=doExport;
loadSettings();audio.volume=.85;initMixerUI();startDraw();
window.addEventListener('beforeunload',()=>{if(mediaUrl)URL.revokeObjectURL(mediaUrl);if(logoUrl)URL.revokeObjectURL(logoUrl);if(audio.src)URL.revokeObjectURL(audio.src);});
})();