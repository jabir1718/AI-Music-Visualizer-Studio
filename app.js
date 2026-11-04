(function(){
const $=id=>document.getElementById(id);
const audio=$('audio'),canvas=$('visualizer'),ctx=canvas.getContext('2d');
let engine=null,raf=0,playing=false,style='bars',logoUrl=null,logoImage=null,mediaUrl=null,mediaKind='',audioFile=null,lyrics=[],template='trend',beatPulse=0,dragTarget=null,dragOffset={x:0,y:0};
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
  ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=(template==='poetry'?'italic 700 ':'900 ')+size+'px '+(template==='poetry'?'Georgia,serif':template==='minimal'?'Georgia,serif':'sans-serif');
  const lines=lyric.text.split(/\s+/);let wrapped=[],line='';
  lines.forEach(word=>{const test=line?line+' '+word:word;if(ctx.measureText(test).width>max*.9&&line){wrapped.push(line);line=word;}else line=test;});if(line)wrapped.push(line);wrapped=wrapped.slice(0,3);
  const lineH=size*1.18,boxH=wrapped.length*lineH+size*.65,boxW=Math.min(max,Math.max(...wrapped.map(t=>ctx.measureText(t).width))+size);
  if(template==='trend'||template==='karaoke'){ctx.fillStyle=template==='trend'?'#080b16bb':'#071b1bc9';roundRect(x-boxW/2,y-boxH/2,boxW,boxH,size*.22);ctx.fill();}
  if(template==='poetry'){ctx.fillStyle='#fff3e8';ctx.shadowColor='#1b0d18';ctx.shadowBlur=16;}
  else if(template==='minimal'){ctx.fillStyle='#fff';ctx.shadowColor='#000';ctx.shadowBlur=8;}
  else if(template==='neon'){ctx.fillStyle='#fff';ctx.shadowColor='#b18aff';ctx.shadowBlur=26;}
  else if(template==='karaoke'){ctx.fillStyle='#bafff0';ctx.shadowColor='#2affd2';ctx.shadowBlur=22;}
  else{ctx.fillStyle='#fff';ctx.shadowColor='#ff3d9a';ctx.shadowBlur=18;}
  wrapped.forEach((lineText,i)=>ctx.fillText(lineText,x,y+(i-(wrapped.length-1)/2)*lineH,max));
  ctx.restore();
 }
 if(logoImage&&logoImage.complete&&logoImage.naturalWidth){const lw=w*.2,lh=lw*(logoImage.naturalHeight/logoImage.naturalWidth);ctx.drawImage(logoImage,positions.logo.x*w-lw/2,positions.logo.y*h-lh/2,lw,lh);}
 ctx.shadowBlur=0;ctx.font='600 '+Math.round(w*.012)+'px sans-serif';ctx.fillStyle='#ffffff88';ctx.fillText('WAVEFORGE',w/2,h*.96);
 if(!playing&&!audio.src){ctx.fillStyle='#ffffffb0';ctx.font='600 '+Math.round(w*.018)+'px sans-serif';ctx.fillText('ADD A TRACK TO START THE VISUALIZER',w/2,h*.84);}
 raf=requestAnimationFrame(draw);
}
function startDraw(){if(!raf)draw();}
async function ensureEngine(){if(!engine)engine=new AudioEngine(audio);await engine.connect();await engine.resume();}
function updateText(){ $('previewTitle').textContent=$('titleInput').value||' ';$('previewSubtitle').textContent=$('subtitleInput').value||'';$('stageCopy').style.color=$('textColor').value;$('stageCopy').style.fontFamily=$('fontStyle').value==='serif'?'Georgia,serif':$('fontStyle').value==='mono'?'monospace':'Manrope,sans-serif';}
function saveSettings(){
 const data={title:$('titleInput').value,subtitle:$('subtitleInput').value,caption:$('captionInput').value,color:$('visualColor').value,style,ratio:$('exportRatio').value,quality:$('quality').value,font:$('fontStyle').value,textColor:$('textColor').value,template,lyricSize:$('lyricSize').value,positions};
 try{localStorage.setItem('waveforge-v1',JSON.stringify(data));setStatus('Saved locally');}catch(e){setStatus('Ready');}
}
function loadSettings(){
 try{const d=JSON.parse(localStorage.getItem('waveforge-v1')||'{}');if(d.title!==undefined)$('titleInput').value=d.title;if(d.subtitle!==undefined)$('subtitleInput').value=d.subtitle;if(d.caption!==undefined)$('captionInput').value=d.caption;if(d.color)$('visualColor').value=d.color;if(d.ratio)$('exportRatio').value=d.ratio;if(d.quality)$('quality').value=d.quality;if(d.font)$('fontStyle').value=d.font;if(d.textColor)$('textColor').value=d.textColor;if(d.style)style=d.style;if(d.template)template=d.template;if(d.lyricSize)$('lyricSize').value=d.lyricSize;if(d.positions)Object.assign(positions,d.positions);}catch(e){}
 updateText();selectTemplate(template);resizeCanvas();
}
function selectTemplate(value){template=value;document.querySelectorAll('.template-card').forEach(b=>b.classList.toggle('selected',b.dataset.template===template));}
function loadAudio(file){
 if(!file)return;if(!file.type.startsWith('audio/')){alert('Please choose a valid audio file.');return;}
 if(audio.src)URL.revokeObjectURL(audio.src);audioFile=file;audio.src=URL.createObjectURL(file);
 $('trackName').textContent=file.name;$('trackMeta').textContent=(file.type||'Audio')+' · '+(file.size/1024/1024).toFixed(1)+' MB';$('playBtn').textContent='▶';$('timeLabel').textContent='00:00 / 00:00';lyrics=[];renderLyricList();setStatus('Audio loaded');
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
function parseTime(t){const v=t.trim().replace(',', '.').split(':').map(Number);if(v.length===3)return v[0]*3600+v[1]*60+v[2];if(v.length===2)return v[0]*60+v[1];return 0;}
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
loadSettings();audio.volume=.85;startDraw();
window.addEventListener('beforeunload',()=>{if(mediaUrl)URL.revokeObjectURL(mediaUrl);if(logoUrl)URL.revokeObjectURL(logoUrl);if(audio.src)URL.revokeObjectURL(audio.src);});
})();