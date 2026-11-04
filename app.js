(function(){
const $=id=>document.getElementById(id);
function decorateActionButton(btn){
 if(!btn||btn.classList.contains('icon-btn')||btn.classList.contains('style-card')||btn.classList.contains('template-card'))return;
 const label=(btn.textContent||'').trim().toLowerCase();
 const ids={exportBtn:'🎬',exportBtnSide:'🎬',themeToggle:'🌓',openProjectBtn:'📂',audioPickBtn:'🎵',clearMedia:'🧹',clearLogo:'🖼️',transcribeBtn:'🎙️',riskCheck:'🛡️',mixerAddBtn:'➕'};
 let icon=ids[btn.id]||'';
 if(!icon&&btn.classList.contains('music-category'))icon=({'Voice':'🎙️','Ad-lib':'✨','Humming':'🎧','Harmony':'🎼','Instruments':'🎹','Sound effect':'🔊','Voice FX':'🗣️','Separation':'🧬','Cleanup':'🧹'})[btn.dataset.category]||'🎵';
 if(!icon&&btn.classList.contains('ratio'))icon='▣';
 if(!icon){if(/export/.test(label))icon='🎬';else if(/add|import|browse/.test(label))icon='➕';else if(/remove|clear|delete/.test(label))icon='🗑️';else if(/mute|unmute/.test(label))icon='🔇';else if(/solo/.test(label))icon='🎧';else if(/edit/.test(label))icon='✏️';else if(/open/.test(label))icon='📂';else if(/generate|listen/.test(label))icon='🎙️';else if(/check|risk/.test(label))icon='🛡️';else icon='⚙️';}
 btn.dataset.actionIcon=icon;
}
function decorateButtonIcons(root=document){root.querySelectorAll('button').forEach(decorateActionButton);}

const audio=$('audio'),canvas=$('visualizer'),ctx=canvas.getContext('2d');
let history=null,historyRestoring=false,timelineView=null;
let engine=null,raf=0,playing=false,style='bars',logoUrl=null,logoImage=null,mediaUrl=null,mediaKind='',audioFile=null,savedTrackName='',lyrics=[],template='trend',beatPulse=0,dragTarget=null,dragOffset={x:0,y:0},manualBpm=null,tapTimes=[],tapClock='',tapBeatOffset=null,lastGridBeat=-1;
const palette={aurora:['#9b8cff','#65e5c0','#e8f5ff'],sunset:['#ff8c75','#ffca7a','#f8a8cf'],ice:['#62d8ff','#9fbaff','#e4f7ff'],mono:['#fff','#b9c4d5','#eef3fb']};
const positions={title:{x:.5,y:.23},subtitle:{x:.5,y:.29},lyric:{x:.5,y:.80},logo:{x:.82,y:.08}};
const objectDefaults={title:{visible:true,scale:1,rotation:0,opacity:1,color:''},subtitle:{visible:true,scale:1,rotation:0,opacity:1,color:''},lyric:{visible:true,scale:1,rotation:0,opacity:1,color:''},logo:{visible:true,scale:1,rotation:0,opacity:1,color:''}};
let objectSettings=JSON.parse(JSON.stringify(objectDefaults)),selectedObject='title',wordSync=null,selectionBox=null,transformGesture=null;
let objectKeyframes={title:[],subtitle:[],lyric:[],logo:[]};
function getObjectState(key,time=audio.currentTime||0){
 const p=positions[key],o=objectSettings[key],base={x:p.x,y:p.y,scale:o.scale,rotation:o.rotation,opacity:o.opacity};
 const animated=window.WaveForgeKeyframes?window.WaveForgeKeyframes.evaluate(objectKeyframes[key]||[],time,base):base;
 return{position:{x:animated.x,y:animated.y},settings:{...o,scale:animated.scale,rotation:animated.rotation,opacity:animated.opacity}};
}
function getBaseKeyframe(key,time=audio.currentTime||0){
 const p=positions[key],o=objectSettings[key];
 return{time,x:p.x,y:p.y,scale:o.scale,rotation:o.rotation,opacity:o.opacity};
}
function updateKeyframeControls(){
 const count=$('objectKeyframeCount');if(count){const frames=objectKeyframes[selectedObject]||[];count.textContent=frames.length+' keyframes · playhead '+fmt(audio.currentTime||0);}
}
function setStatus(t){$('saveState').textContent='● '+t;}
function fmt(s){if(!isFinite(s))s=0;return String(Math.floor(s/60)).padStart(2,'0')+':'+String(Math.floor(s%60)).padStart(2,'0');}
function resizeCanvas(){
 const ratio=$('exportRatio').value.split(':').map(Number),q=Number($('quality').value);
 canvas.width=Math.round(q*Math.max(1,ratio[0]/ratio[1]));canvas.height=Math.round(q*Math.max(1,ratio[1]/ratio[0]));
 $('stage').style.aspectRatio=ratio.join('/');$('resolutionLabel').textContent=canvas.width+' × '+canvas.height;
 document.querySelectorAll('.ratio').forEach(b=>b.classList.toggle('active',b.dataset.ratio===$('exportRatio').value));
}
function roundRect(x,y,w,h,r){ctx.beginPath();ctx.roundRect?ctx.roundRect(x,y,w,h,r):(ctx.rect(x,y,w,h));}
function drawWrapped(text,x,y,maxWidth,lineHeight,typeKey){
 const words=String(text||'').split(/\s+/),lines=[];let line='';
 words.forEach(word=>{const test=line?line+' '+word:word;if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=word;}else line=test;});
 if(line)lines.push(line);lines.slice(0,3).forEach((v,i)=>{if(typeKey&&window.WaveForgeTypography)window.WaveForgeTypography.drawGlyph(ctx,typeKey,v,x,y+i*lineHeight,maxWidth);else ctx.fillText(v,x,y+i*lineHeight,maxWidth);});return lines.length*lineHeight;
}
function currentLyric(){
 const t=audio.currentTime||0;
 return lyrics.find(line=>t>=line.start&&t<line.end)||null;
}
function draw(){
 const w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);updateSelectionOverlay();
 const bg=$('backgroundImage'),vid=$('backgroundVideo');
 let source=null;
 if(mediaKind==='image'&&bg.complete&&bg.naturalWidth>0)source=bg;
 if(mediaKind==='video'&&vid.readyState>=2&&vid.videoWidth>0)source=vid;
 const grad=ctx.createRadialGradient(w*.5,h*.4,0,w*.5,h*.5,h*.75);grad.addColorStop(0,'#29304f');grad.addColorStop(1,'#080d18');ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);
 if(source){
  const sw=source.videoWidth||source.naturalWidth,sh=source.videoHeight||source.naturalHeight;
  const scale=Math.max(w/sw,h/sh),dw=sw*scale,dh=sh*scale,x=(w-dw)/2,y=(h-dh)/2;
  const aiHandled=window.WaveForgeSegmentation&&window.WaveForgeSegmentation.getSettings().enabled&&window.WaveForgeSegmentation.draw(ctx,source,x,y,dw,dh,w,h);
  const keySettings=window.WaveForgeChromaKey?window.WaveForgeChromaKey.getSettings():{enabled:false};
  if(aiHandled){}
  else if(keySettings.enabled&&window.WaveForgeChromaKey){try{const keyed=window.WaveForgeChromaKey.process(source,x,y,dw,dh,w,h);if(window.WaveForgeFilters)window.WaveForgeFilters.draw(ctx,keyed,0,0,w,h);else ctx.drawImage(keyed,0,0,w,h);}catch(error){ctx.drawImage(source,x,y,dw,dh);}}
  else if(window.WaveForgeFilters)window.WaveForgeFilters.draw(ctx,source,x,y,dw,dh);else ctx.drawImage(source,x,y,dw,dh);
 }
 const shade=ctx.createLinearGradient(0,0,0,h);shade.addColorStop(0,'#080d2420');shade.addColorStop(1,'#080d24bb');ctx.fillStyle=shade;ctx.fillRect(0,0,w,h);
 const colors=palette[$('visualColor').value]||palette.aurora;
 const data=engine?engine.getFrequency():new Uint8Array(128),wave=engine?engine.getWaveform():new Uint8Array(128).fill(128);
 if(engine&&playing){const beat=engine.detectBeat(Number($('sensitivity').value));if(beat.hit)beatPulse=1;$('beatStatus').textContent=beat.hit?'Beat detected · audio energy pulse':'Listening for beat energy…';}if(playing&&manualBpm&&tapBeatOffset!==null&&audio.currentTime>=tapBeatOffset){const gridBeat=Math.floor((audio.currentTime-tapBeatOffset)/(60/manualBpm));if(gridBeat<lastGridBeat)lastGridBeat=gridBeat-1;if(gridBeat>lastGridBeat){beatPulse=1;lastGridBeat=gridBeat;}}
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
 ctx.restore();if(window.WaveForge3D)window.WaveForge3D.drawToCanvas(ctx,w,h);ctx.shadowBlur=0;ctx.globalAlpha=1;ctx.textAlign='center';ctx.textBaseline='middle';
 const title=$('titleInput').value||'',subtitle=$('subtitleInput').value||'';
 const titleState=getObjectState('title',audio.currentTime),subtitleState=getObjectState('subtitle',audio.currentTime);
 if(titleState.settings.visible){const o=titleState.settings;ctx.save();ctx.globalAlpha=o.opacity;ctx.translate(titleState.position.x*w,titleState.position.y*h);ctx.rotate(o.rotation*Math.PI/180);ctx.fillStyle=o.color||$('textColor').value;ctx.font='800 '+Math.round(w*.052*o.scale)+'px '+($('fontStyle').value==='serif'?'Georgia':$('fontStyle').value==='mono'?'monospace':'sans-serif');ctx.shadowColor='#000';ctx.shadowBlur=14;if(window.WaveForgeTypography)window.WaveForgeTypography.apply(ctx,'title',Math.round(w*.052*o.scale),'sans-serif');drawWrapped(title,0,0,w*.82,Math.round(w*.06*o.scale),'title');ctx.restore();}
 if(subtitleState.settings.visible){const o=subtitleState.settings;ctx.save();ctx.globalAlpha=o.opacity;ctx.translate(subtitleState.position.x*w,subtitleState.position.y*h);ctx.rotate(o.rotation*Math.PI/180);ctx.font='500 '+Math.round(w*.025*o.scale)+'px sans-serif';ctx.fillStyle=o.color||'#ffffffed';if(window.WaveForgeTypography)window.WaveForgeTypography.apply(ctx,'subtitle',Math.round(w*.025*o.scale),'sans-serif');drawWrapped(subtitle,0,0,w*.82,Math.round(w*.035*o.scale),'subtitle');ctx.restore();}
 const lyric=currentLyric();
 const lyricState=getObjectState('lyric',audio.currentTime);
 if(lyric&&lyric.text&&lyricState.settings.visible){
  const o=lyricState.settings,size=Math.round(w*Number($('lyricSize').value)/1000*o.scale),max=w*.84;
  ctx.save();ctx.globalAlpha=o.opacity;ctx.translate(lyricState.position.x*w,lyricState.position.y*h);ctx.rotate(o.rotation*Math.PI/180);ctx.textAlign='left';ctx.textBaseline='middle';ctx.font=(template==='poetry'?'italic 700 ':'900 ')+size+'px '+(template==='poetry'?'Georgia,serif':template==='minimal'?'Georgia,serif':'sans-serif');if(window.WaveForgeTypography)window.WaveForgeTypography.apply(ctx,'lyric',size,template==='poetry'||template==='minimal'?'Georgia,serif':'sans-serif');
  const words=Array.isArray(lyric.words)&&lyric.words.length?lyric.words:lyric.text.split(' ').map((text,i,a)=>({text,start:lyric.start+(lyric.end-lyric.start)*i/a.length,end:lyric.start+(lyric.end-lyric.start)*(i+1)/a.length}));
  const rows=[[]],rowWidths=[0],space=ctx.measureText(' ').width;
  words.forEach(word=>{const width=ctx.measureText(word.text).width,idx=rows.length-1;if(rowWidths[idx]+(rows[idx].length?space:0)+width>max*.9&&rows[idx].length){rows.push([]);rowWidths.push(0);}const n=rows.length-1;rows[n].push({word,width});rowWidths[n]+=width+(rows[n].length>1?space:0);});
  const lineH=size*1.18,boxH=rows.length*lineH+size*.65,boxW=Math.min(max,Math.max(...rowWidths)+size);
  if(template==='trend'||template==='karaoke'){ctx.fillStyle=template==='trend'?'#080b16bb':'#071b1bc9';roundRect(-boxW/2,-boxH/2,boxW,boxH,size*.22);ctx.fill();}
  if(template==='poetry'){ctx.fillStyle='#fff3e8';ctx.shadowColor='#1b0d18';ctx.shadowBlur=16;}
  else if(template==='minimal'){ctx.fillStyle='#fff';ctx.shadowColor='#000';ctx.shadowBlur=8;}
  else if(template==='neon'){ctx.fillStyle='#fff';ctx.shadowColor='#b18aff';ctx.shadowBlur=26;}
  else if(template==='karaoke'){ctx.shadowColor='#2affd2';ctx.shadowBlur=22;}
  else{ctx.fillStyle='#fff';ctx.shadowColor='#ff3d9a';ctx.shadowBlur=18;}
  rows.forEach((row,i)=>{
    let px=-rowWidths[i]/2;const yy=(i-(rows.length-1)/2)*lineH;
    row.forEach(item=>{
      const active=audio.currentTime>=item.word.start&&audio.currentTime<item.word.end;
      if(template==='karaoke')ctx.fillStyle=active?'#fff36b':'#bafff0';
      if(window.WaveForgeTypography)window.WaveForgeTypography.drawGlyph(ctx,'lyric',item.word.text,px,yy,max);else ctx.fillText(item.word.text,px,yy);px+=item.width+space;
    });
  });
  ctx.restore();
 }
 const logoState=getObjectState('logo',audio.currentTime);
 if(logoState.settings.visible&&logoImage&&logoImage.complete&&logoImage.naturalWidth){const o=logoState.settings;ctx.save();ctx.globalAlpha=o.opacity;ctx.translate(logoState.position.x*w,logoState.position.y*h);ctx.rotate(o.rotation*Math.PI/180);const lw=w*.2*o.scale,lh=lw*(logoImage.naturalHeight/logoImage.naturalWidth);ctx.drawImage(logoImage,-lw/2,-lh/2,lw,lh);ctx.restore();}
 ctx.shadowBlur=0;ctx.font='600 '+Math.round(w*.012)+'px sans-serif';ctx.fillStyle='#ffffff88';ctx.fillText('WAVEFORGE',w/2,h*.96);
 if(!playing&&!audio.src){ctx.fillStyle='#ffffffb0';ctx.font='600 '+Math.round(w*.018)+'px sans-serif';ctx.fillText('ADD A TRACK TO START THE VISUALIZER',w/2,h*.84);}
 raf=requestAnimationFrame(draw);
}
function startDraw(){if(!raf)draw();}
async function enableLayerPitchNode(layer,eng){
 if(layer.formantStrength>0){
  try{await eng.enableLayerFormantCorrection(layer.id,layer.pitch,layer.rate,layer.formantStrength/100);return 'formant';}
  catch(error){await eng.enableLayerPitchPreserving(layer.id,layer.pitch,layer.rate);layer.formantStrength=0;setStatus('Formant correction unavailable; standard pitch-preserving mode is active. '+error.message);return 'soundtouch';}
 }
 await eng.enableLayerPitchPreserving(layer.id,layer.pitch,layer.rate);return 'soundtouch';
}
async function ensureEngine(){
 if(!engine)engine=new AudioEngine(audio);
 await engine.connect();await engine.resume();engine.setVolume(Number($('volume').value));applyMainEffects();
 let fallback=false;
 for(const layer of mixerLayers){
  let graphLayer=engine.layers.get(layer.id);
  if(!layer.connected||!graphLayer){const soloActive=mixerLayers.some(x=>x.solo);engine.addLayer(layer.id,layer.audio,(!layer.muted&&(!soloActive||layer.solo))?layer.volume:0,layer);layer.connected=true;graphLayer=engine.layers.get(layer.id);}
  if(layer.pitchPreserving&&!graphLayer.pitchNode){
   try{const wantsFormant=layer.formantStrength>0;await enableLayerPitchNode(layer,engine);if(wantsFormant&&layer.formantStrength===0)fallback=true;}
   catch(error){layer.pitchPreserving=false;layer.rate=Math.pow(2,layer.pitch/12);layer.audio.playbackRate=layer.rate;fallback=true;setStatus('Pitch-preserving DSP unavailable; standard pitch/rate restored. '+error.message);}
  }
 }
 if(fallback){renderMixerLayers();saveSettings();}
 engine.setMainSoloMute(mixerLayers.some(x=>x.solo));return engine;
}

let mixerLayers=[],mixerPanel=null,mixerCategory='Voice',savedProjectData={},mediaDbPromise=null;
function syncMixerLayers(){
 const now=audio.currentTime||0;
 mixerLayers.forEach(layer=>{
  const timing=window.WaveForgeTimeline?window.WaveForgeTimeline.resolveLayerTime(layer,now,layer.audio.duration):{active:now>=layer.offset,currentTime:Math.max(0,(now-layer.offset)*layer.rate)};
  const target=timing.currentTime;
  if(audio.paused||!timing.active){
   if(!layer.audio.paused)layer.audio.pause();
   if(Number.isFinite(target)&&Math.abs(layer.audio.currentTime-target)>.08)try{layer.audio.currentTime=Math.max(0,target);}catch(e){}
   return;
  }
  if(Math.abs(layer.audio.currentTime-target)>.35)try{layer.audio.currentTime=Math.max(0,target);}catch(e){}
  if(layer.audio.paused)layer.audio.play().catch(()=>{});
 });
}
function readMainEffects(){const value=(id,fallback=0)=>$(id)?Number($(id).value):fallback;return{bass:value('mainBass'),treble:value('mainTreble'),pan:value('mainPan'),echo:value('mainEcho'),reverb:value('mainReverb'),distortion:value('mainDistortion'),compression:value('mainCompression')};}
function applyMainEffects(){if(!engine||!engine.ready)return;const f=readMainEffects();engine.setMainEQ(f.bass,f.treble);engine.setMainPan(f.pan/100);engine.setMainDelay(f.echo);engine.setMainReverb(f.reverb);engine.setMainDistortion(f.distortion);engine.setMainCompression(f.compression);}
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
 '<button type="button" class="music-category" data-category="Engine">Engine sounds</button>'+
 '<button type="button" class="music-category" data-category="Character">Character sounds</button>'+
 '<button type="button" class="music-category" data-category="Voice FX">Voice FX</button>'+
 '<button type="button" class="music-category" data-category="Separation">AI separation</button>'+
 '<button type="button" class="music-category" data-category="Cleanup">Noise cleanup</button></div>'+
 '<div class="music-category-detail" id="musicCategoryDetail" aria-live="polite"></div>'+
 '<div class="bpm-tool"><div><b>Tempo / BPM analyser</b><small>Offline estimate or tap the beat manually. Tap while playing to align the visualizer pulse grid.</small></div><div class="bpm-tool-actions"><button class="btn small" id="bpmAnalyzeBtn" type="button">Detect BPM</button><button class="btn small" id="tapTempoBtn" type="button">Tap tempo · 0</button><button class="btn small" id="clearTapTempoBtn" type="button">Clear</button></div><output id="bpmStatus" aria-live="polite">No analysis yet</output></div>'+
 '<div class="mixer-add"><label>Layer source<select id="mixerRole"><option>Voice</option><option>Background vocal</option><option>Ad-lib</option><option>Humming</option><option>Harmony</option><option>Bass stem</option><option>Drums</option><option>Piano</option><option>Guitar</option><option>Instrumental</option><option>Sound effect</option><option>Voice FX</option><option>Other</option></select></label><label class="mixer-file">＋ Import audio<input id="mixerFile" type="file" accept="audio/*" hidden></label><button class="btn small" id="mixerAddBtn" type="button">Add to track</button></div>'+
 '<div class="mixer-main-pitch"><label>Background music pitch <input id="mainPitch" type="range" min="-12" max="12" step="1" value="0"></label><span id="mainPitchValue">0 semitones</span></div>'+
 '<section class="main-effects-panel"><div class="mixer-heading"><div><b>Background music effects</b><small>These controls affect only the original song, not imported voice/instrument layers.</small></div></div><div class="main-effects-grid">'+
 '<label>Bass <output id="mainBassValue">0 dB</output><input id="mainBass" type="range" min="-12" max="12" value="0"></label>'+
 '<label>Treble <output id="mainTrebleValue">0 dB</output><input id="mainTreble" type="range" min="-12" max="12" value="0"></label>'+
 '<label>Pan <output id="mainPanValue">Center</output><input id="mainPan" type="range" min="-100" max="100" value="0"></label>'+
 '<label>Echo <output id="mainEchoValue">0%</output><input id="mainEcho" type="range" min="0" max="100" value="0"></label>'+
 '<label>Reverb <output id="mainReverbValue">0%</output><input id="mainReverb" type="range" min="0" max="100" value="0"></label>'+
 '<label>Distortion <output id="mainDistortionValue">0%</output><input id="mainDistortion" type="range" min="0" max="100" value="0"></label>'+
 '<label>Compression <output id="mainCompressionValue">0%</output><input id="mainCompression" type="range" min="0" max="100" value="0"></label></div><button type="button" class="btn small" id="mainEffectsReset">Reset music effects</button></section>'+
 '<div id="mixerList" class="mixer-list"><p class="hint">No extra layers yet. Your original song remains the background music.</p></div>'+
 '<p class="hint mixer-footnote">Imported layers are independently adjustable. A mixed MP3 does not contain separately editable stems automatically. AI separation and generated vocal effects are not connected yet.</p>';
 host.insertBefore(mixerPanel,audioEl);
 if(window.WaveForgeTimelineView)timelineView=window.WaveForgeTimelineView.mount(mixerPanel,$('mixerList'),{audioElement:audio,getLayers:()=>mixerLayers,getMainDuration:()=>audio.duration||0,getMainName:()=>audioFile&&audioFile.name||'Background music',getCurrentTime:()=>audio.currentTime||0,onSeek:time=>{if(Number.isFinite(audio.duration))audio.currentTime=time;},onMove:(layer,offset)=>{layer.offset=offset;syncMixerLayers();saveSettings();setStatus('Timeline clip moved');renderMixerLayers();}});
 try{const saved=JSON.parse(localStorage.getItem('waveforge-v1')||'{}');if(saved.mainPitch!==undefined){$('mainPitch').value=saved.mainPitch;audio.playbackRate=Math.pow(2,Number(saved.mainPitch)/12);audio.preservesPitch=false;$('mainPitchValue').textContent=(Number(saved.mainPitch)>0?'+':'')+saved.mainPitch+' semitones';}const fx=saved.mainEffects||{};Object.keys(fx).forEach(key=>{const input=$('main'+key.charAt(0).toUpperCase()+key.slice(1));if(input)input.value=fx[key];});}catch(e){}
 const file=$('mixerFile');
 $('mixerAddBtn').onclick=()=>file.click();
 file.onchange=e=>{const f=e.target.files&&e.target.files[0];if(f)addMixerLayer(f,$('mixerRole').value);file.value='';};
 const effectNames=['bass','treble','pan','echo','reverb','distortion','compression'];
 const updateMainEffectLabels=()=>{const f=readMainEffects();$('mainBassValue').textContent=f.bass+' dB';$('mainTrebleValue').textContent=f.treble+' dB';$('mainPanValue').textContent=f.pan===0?'Center':(f.pan<0?'L ':'R ')+Math.abs(f.pan);$('mainEchoValue').textContent=f.echo+'%';$('mainReverbValue').textContent=f.reverb+'%';$('mainDistortionValue').textContent=f.distortion+'%';$('mainCompressionValue').textContent=f.compression+'%';};
 effectNames.forEach(key=>$('main'+key.charAt(0).toUpperCase()+key.slice(1)).addEventListener('input',()=>{updateMainEffectLabels();applyMainEffects();saveSettings();}));
 $('mainEffectsReset').onclick=()=>{effectNames.forEach(key=>$('main'+key.charAt(0).toUpperCase()+key.slice(1)).value=0);updateMainEffectLabels();applyMainEffects();saveSettings();};updateMainEffectLabels();
 $('mainPitch').oninput=e=>{
  const semitones=Number(e.target.value),rate=Math.pow(2,semitones/12);
  audio.playbackRate=rate;audio.preservesPitch=false;
  $('mainPitchValue').textContent=(semitones>0?'+':'')+semitones+' semitones';
  saveSettings();
 };
 document.querySelectorAll('.music-category').forEach(btn=>btn.onclick=()=>selectMusicCategory(btn.dataset.category));
 selectMusicCategory('Voice');
 $('tapTempoBtn').onclick=()=>{const clock=playing?'audio':'wall',now=clock==='audio'?audio.currentTime:performance.now()/1000;if(clock!==tapClock||tapTimes.length&&now-tapTimes[tapTimes.length-1]>2){tapTimes=[];tapClock=clock;}tapTimes.push(now);if(tapTimes.length>9)tapTimes.shift();$('tapTempoBtn').textContent='Tap tempo · '+tapTimes.length;if(tapTimes.length>=3){try{const result=WaveForgeBPM.fromTaps(tapTimes);manualBpm=result.bpm;tapBeatOffset=clock==='audio'?tapTimes[0]:null;lastGridBeat=-1;$('bpmStatus').textContent='Tap tempo: '+result.bpm+' BPM · '+Math.round(result.confidence*100)+'% consistency'+(tapBeatOffset!==null?' · visualizer grid aligned':' · tap while playing to align the grid');saveSettings();}catch(err){$('bpmStatus').textContent=err.message;}}else $('bpmStatus').textContent='Tap '+(3-tapTimes.length)+' more times…';};
 $('clearTapTempoBtn').onclick=()=>{tapTimes=[];tapClock='';manualBpm=null;tapBeatOffset=null;lastGridBeat=-1;$('tapTempoBtn').textContent='Tap tempo · 0';$('bpmStatus').textContent='Manual tempo cleared.';saveSettings();};
 $('bpmAnalyzeBtn').onclick=async()=>{const btn=$('bpmAnalyzeBtn'),out=$('bpmStatus');if(!audioFile){out.textContent='Import your main song first.';return;}btn.disabled=true;out.textContent='Preparing analysis…';try{const result=await WaveForgeBPM.detect(audioFile,s=>out.textContent=s);out.textContent='Estimated tempo: '+result.bpm+' BPM · '+Math.round(result.confidence*100)+'% rhythm confidence';setStatus('Tempo analysis complete');}catch(err){out.textContent='Analysis failed: '+err.message;}finally{btn.disabled=false;}};
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
  'Sound effect':{role:'Sound effect',title:'Sound effects library',desc:'Search open audio files, preview them and add licensed/attributed effects as independent mixer layers.',available:true},
  'Engine':{role:'Sound effect',title:'Engine & racing sound library',desc:'Search open engine/rev recordings. Verify each file licence and whether the recording is clean before publishing.',available:true},
  'Character':{role:'Voice FX',title:'Character sound library',desc:'Search open character-style laughs and vocal clips. These are source recordings, not generated voice transformations.',available:true},
  'Voice FX':{role:'Voice FX',title:'Voice changer & character effects',desc:'Each imported layer now has Natural, Telephone, Radio, Monster, Chipmunk, Robot and Alien styles with independent EQ, echo, reverb and distortion. Pitch-based styles also change speed; formant-preserving voice conversion is not included.',available:true},
  'Separation':{role:'Instrumental',title:'AI vocal & instrument separation',desc:'This operation is planned but not implemented yet. The current app cannot extract vocals or instruments from a mixed MP3 automatically.',available:false},
  'Cleanup':{role:'Voice',title:'Noise cleanup',desc:'Run local spectral noise reduction on an imported voice clip using a noise-only sample. The original stays untouched; AI source separation is still separate and not implemented.',available:true}
 };
 const item=config[category]||config.Voice;
 role.value=item.role;
 detail.innerHTML='<div class="music-detail-title"><div><span class="eyebrow">SELECTED WORKSPACE</span><h3>'+item.title+'</h3></div><span class="music-detail-state">'+(item.available?'IMPORT READY':'NOT IMPLEMENTED')+'</span></div><p>'+item.desc+'</p>';
 add.disabled=!item.available;file.disabled=!item.available;
 if(item.available&&window.WaveForgeSoundLibrary&&['Sound effect','Engine','Character'].includes(category)){const query=category==='Engine'?'race car engine':category==='Character'?'evil laugh cartoon':'sound effect';window.WaveForgeSoundLibrary.mount(detail,query,file=>addMixerLayer(file,item.role));}
 if(category==='Cleanup'&&window.WaveForgeCleanup)window.WaveForgeCleanup.mount(detail,{onLayer:file=>addMixerLayer(file,'Voice')});
 renderMixerLayers();
}
function addMixerLayer(file,role,restore={},persist=true){
 if(!file.type.startsWith('audio/')){alert('Choose a supported audio file.');return;}
 const id=restore.id||('mix-'+Date.now()+'-'+Math.random().toString(36).slice(2,7)),url=URL.createObjectURL(file);
 const el=document.createElement('audio');el.preload='auto';el.hidden=true;el.src=url;el.preservesPitch=false;
 const layer={id,file,url,audio:el,role,volume:.85,rate:1,pitch:0,offset:0,muted:false,solo:false,pan:0,bass:0,treble:0,delay:0,reverb:0,distortion:0,compression:0,voiceStyle:'natural',pitchPreserving:false,formantStrength:['Voice','Ad-lib','Humming','Harmony','Voice FX'].includes(role)?100:0,trimStart:0,trimEnd:0,loop:false,connected:false,...restore,id,file,url,audio:el,role};
 el.playbackRate=layer.rate||1;mixerLayers.push(layer);mixerPanel.appendChild(el);renderMixerLayers();
 if(engine&&engine.ready){engine.addLayer(id,el,layer.volume,layer);layer.connected=true;if(layer.pitchPreserving)enableLayerPitchNode(layer,engine).catch(error=>{layer.pitchPreserving=false;layer.rate=Math.pow(2,layer.pitch/12);layer.audio.playbackRate=layer.rate;renderMixerLayers();setStatus('Pitch-preserving DSP unavailable: '+error.message);});applyMixerSoloState();}
 syncMixerLayers();if(persist)saveMediaAsset(id,file);saveSettings();setStatus('Audio layer added');
}
function applyMixerSoloState(){
 const soloActive=mixerLayers.some(x=>x.solo);
 mixerLayers.forEach(layer=>{const audible=!layer.muted&&(!soloActive||layer.solo);if(engine&&layer.connected)engine.setLayerVolume(layer.id,audible?layer.volume:0);});if(engine&&engine.ready)engine.setMainSoloMute(soloActive);
}
function applyVoiceStyle(layer,style){
 const styles={
  natural:{rate:1,pitch:0,bass:0,treble:0,delay:0,reverb:0,distortion:0},
  telephone:{rate:1,pitch:0,bass:-9,treble:5,delay:0,reverb:0,distortion:0},
  radio:{rate:1,pitch:0,bass:-5,treble:3,delay:.06,reverb:.02,distortion:.04},
  monster:{rate:.78,pitch:-4.5,bass:5,treble:-3,delay:.08,reverb:.22,distortion:.12},
  chipmunk:{rate:1.32,pitch:5.3,bass:-4,treble:6,delay:0,reverb:.03,distortion:0},
  robot:{rate:1,pitch:0,bass:-3,treble:5,delay:.03,reverb:.02,distortion:.42},
  alien:{rate:.92,pitch:-1.5,bass:2,treble:6,delay:.18,reverb:.32,distortion:.22}
 };
 const p=styles[style]||styles.natural;Object.assign(layer,p,{voiceStyle:style});
 if(layer.pitchPreserving){layer.audio.playbackRate=layer.rate;if(engine&&layer.connected)enableLayerPitchNode(layer,engine).catch(error=>setStatus('Voice processing unavailable: '+error.message));}
 else{layer.audio.playbackRate=layer.rate;layer.audio.preservesPitch=false;}
 if(engine&&layer.connected){engine.setLayerEQ(layer.id,layer.bass,layer.treble);engine.setLayerDelay(layer.id,layer.delay);engine.setLayerReverb(layer.id,layer.reverb);engine.setLayerDistortion(layer.id,layer.distortion*100);}
 renderMixerLayers();saveSettings();setStatus('Applied '+style+' voice style');
}
function applyLayerPreset(layer,preset){
 const presets={
  clean:{bass:0,treble:0,delay:0,reverb:0,pan:0,rate:1,pitch:0,distortion:0},
  telephone:{bass:-8,treble:5,delay:0,reverb:.04,pan:0,rate:1,pitch:0,distortion:0},
  radio:{bass:-5,treble:3,delay:.08,reverb:.02,pan:0,rate:1,pitch:0,distortion:.04},
  room:{bass:0,treble:1,delay:.04,reverb:.38,pan:0,rate:1,pitch:0,distortion:0},
  echo:{bass:0,treble:0,delay:.72,reverb:.12,pan:0,rate:1,pitch:0,distortion:0},
  dreamy:{bass:2,treble:2,delay:.28,reverb:.62,pan:0,rate:1,pitch:0,distortion:0}
 };
 const p=presets[preset]||presets.clean;Object.assign(layer,p,{preset});
 layer.audio.playbackRate=layer.rate;layer.audio.preservesPitch=false;
 if(engine&&layer.connected){if(layer.pitchPreserving)enableLayerPitchNode(layer,engine).catch(error=>setStatus('Voice processing unavailable: '+error.message));engine.setLayerEQ(layer.id,layer.bass,layer.treble);engine.setLayerPan(layer.id,layer.pan);engine.setLayerDelay(layer.id,layer.delay);engine.setLayerReverb(layer.id,layer.reverb);engine.setLayerDistortion(layer.id,layer.distortion*100);}
 renderMixerLayers();saveSettings();setStatus('Applied '+preset+' audio preset');
}
function renderMixerLayers(){
 const list=$('mixerList');list.innerHTML='';
 if(!mixerLayers.length){list.innerHTML='<p class="hint">No extra layers yet. Your original song remains the background music.</p>';if(timelineView)timelineView.render();return;}
 mixerLayers.forEach(layer=>{
  const row=document.createElement('div');row.className='mixer-track';
  const head=document.createElement('div');head.className='mixer-track-head';
  const info=document.createElement('div'),name=document.createElement('b'),meta=document.createElement('small');name.textContent=layer.file.name;meta.textContent=layer.role;info.append(name,meta);
  const mute=document.createElement('button');mute.className='btn small';mute.textContent=layer.muted?'Unmute':'Mute';decorateActionButton(mute);mute.onclick=()=>{layer.muted=!layer.muted;mute.textContent=layer.muted?'Unmute':'Mute';applyMixerSoloState();saveSettings();};
  const solo=document.createElement('button');solo.className='btn small';solo.textContent=layer.solo?'Solo on':'Solo';decorateActionButton(solo);solo.setAttribute('aria-pressed',String(layer.solo));solo.onclick=()=>{layer.solo=!layer.solo;solo.textContent=layer.solo?'Solo on':'Solo';solo.setAttribute('aria-pressed',String(layer.solo));applyMixerSoloState();saveSettings();};
  const remove=document.createElement('button');remove.className='btn small';remove.textContent='Remove';decorateActionButton(remove);remove.onclick=()=>{if(engine&&layer.connected)engine.removeLayer(layer.id);layer.audio.pause();layer.audio.removeAttribute('src');layer.audio.load();URL.revokeObjectURL(layer.url);mixerLayers=mixerLayers.filter(x=>x!==layer);deleteMediaAsset(layer.id);renderMixerLayers();applyMixerSoloState();saveSettings();};
  head.append(info,mute,solo,remove);row.append(head);
  const presetWrap=document.createElement('label');presetWrap.className='mixer-preset';presetWrap.textContent='Effect preset';
  const preset=document.createElement('select');preset.setAttribute('aria-label','Audio effect preset');
  [['clean','Clean'],['telephone','Telephone'],['radio','Radio'],['room','Small room'],['echo','Echo'],['dreamy','Dreamy reverb']].forEach(([value,label])=>{const option=document.createElement('option');option.value=value;option.textContent=label;preset.append(option);});
  preset.value=layer.preset||'clean';preset.onchange=()=>applyLayerPreset(layer,preset.value);presetWrap.append(preset);row.append(presetWrap);
  const voiceWrap=document.createElement('label');voiceWrap.className='mixer-preset';voiceWrap.textContent='Voice character style';
  const voiceStyle=document.createElement('select');voiceStyle.setAttribute('aria-label','Voice character style');
  [['natural','Natural'],['telephone','Telephone'],['radio','Radio'],['monster','Monster / deep'],['chipmunk','Chipmunk / high'],['robot','Robot'],['alien','Alien'],['custom','Custom settings']].forEach(([value,label])=>{const option=document.createElement('option');option.value=value;option.textContent=label;voiceStyle.append(option);});
  voiceStyle.value=layer.voiceStyle||'natural';voiceStyle.onchange=()=>{if(voiceStyle.value!=='custom')applyVoiceStyle(layer,voiceStyle.value);};voiceWrap.append(voiceStyle);row.append(voiceWrap);
  const controls=document.createElement('div');controls.className='mixer-track-controls';
  function addRange(labelText,key,min,max,step,unit,apply){
   const wrap=document.createElement('label');wrap.textContent=labelText;const input=document.createElement('input');input.type='range';input.min=String(min);input.max=String(max);input.step=String(step);input.value=String(layer[key]??0);const readout=document.createElement('small');
   const show=()=>{const v=Number(input.value);readout.textContent=(v>0&&min<0?'+':'')+v+unit;};
   input.oninput=()=>{layer[key]=Number(input.value);show();if(['pitch','pan','bass','treble','delay','reverb','distortion','compression','rate','formantStrength'].includes(key)){layer.voiceStyle='custom';voiceStyle.value='custom';}apply(layer[key]);saveSettings();};show();wrap.append(input,readout);controls.append(wrap);return wrap;
  }
  addRange('Volume','volume',0,1,.01,'',()=>applyMixerSoloState());
  addRange('Pitch (semitones)','pitch',-12,12,1,' st',v=>{if(layer.pitchPreserving&&engine&&layer.connected)engine.setLayerPitch(layer.id,v);else{layer.rate=Math.pow(2,v/12);layer.audio.playbackRate=layer.rate;layer.audio.preservesPitch=false;}syncMixerLayers();});
  const speedControl=addRange('Speed','rate',.5,2,.05,'×',v=>{layer.rate=v;if(layer.pitchPreserving&&engine&&layer.connected)engine.setLayerRate(layer.id,v);else layer.audio.playbackRate=v;syncMixerLayers();});
  speedControl.hidden=!layer.pitchPreserving;
  const formantControl=addRange('Formant preservation','formantStrength',0,100,5,'%',v=>{if(layer.pitchPreserving&&engine&&layer.connected)enableLayerPitchNode(layer,engine).then(()=>{if(layer.formantStrength===0)renderMixerLayers();}).catch(error=>setStatus('Formant processing unavailable: '+error.message));});
  formantControl.hidden=!layer.pitchPreserving;formantControl.title='0% = raw pitch shift; 100% = full LPC formant correction for a more natural voice timbre.';
  const preserveWrap=document.createElement('label');preserveWrap.className='mixer-pitch-preserve';preserveWrap.title='SoundTouchJS AudioWorklet (MPL-2.0) loads from jsDelivr on first use; formant correction is available for voice layers. Internet and AudioWorklet support are required.';const preserve=document.createElement('input');preserve.type='checkbox';preserve.checked=!!layer.pitchPreserving;const preserveText=document.createElement('span');preserveText.textContent='Pitch preserving · separate pitch from speed';preserveWrap.append(preserve,preserveText);row.append(preserveWrap);
  preserve.onchange=async()=>{if(preserve.checked){try{const eng=await ensureEngine();await enableLayerPitchNode(layer,eng);layer.pitchPreserving=true;speedControl.hidden=false;formantControl.hidden=false;setStatus('Pitch and speed are independent for this layer.');}catch(error){layer.pitchPreserving=false;preserve.checked=false;setStatus('Pitch-preserving DSP unavailable: '+error.message);}}else{const effective=Math.pow(2,layer.pitch/12);if(engine&&layer.connected)engine.disableLayerPitchPreserving(layer.id,effective);layer.pitchPreserving=false;layer.rate=effective;layer.audio.playbackRate=effective;speedControl.hidden=true;formantControl.hidden=true;setStatus('Pitch-preserving mode disabled; speed is linked to pitch again.');}renderMixerLayers();syncMixerLayers();saveSettings();};
  addRange('Stereo pan','pan',-1,1,.05,'',v=>{if(engine&&layer.connected)engine.setLayerPan(layer.id,v);});
  addRange('Bass EQ','bass',-12,12,1,' dB',()=>{if(engine&&layer.connected)engine.setLayerEQ(layer.id,layer.bass,layer.treble);});
  addRange('Treble EQ','treble',-12,12,1,' dB',()=>{if(engine&&layer.connected)engine.setLayerEQ(layer.id,layer.bass,layer.treble);});
  addRange('Echo','delay',0,1,.05,'',v=>{if(engine&&layer.connected)engine.setLayerDelay(layer.id,v);});
  addRange('Reverb','reverb',0,1,.05,'',v=>{if(engine&&layer.connected)engine.setLayerReverb(layer.id,v);});
  addRange('Distortion','distortion',0,1,.05,'',v=>{if(engine&&layer.connected)engine.setLayerDistortion(layer.id,v*100);});
  addRange('Compression','compression',0,100,1,'%',v=>{if(engine&&layer.connected)engine.setLayerCompression(layer.id,v);});
  const offsetWrap=document.createElement('label');offsetWrap.textContent='Timeline position (seconds)';const offset=document.createElement('input');offset.type='number';offset.min='0';offset.max='3600';offset.step='.1';offset.value=layer.offset;offset.onchange=()=>{layer.offset=Math.max(0,Number(offset.value)||0);syncMixerLayers();saveSettings();if(timelineView)timelineView.render();};offsetWrap.append(offset);controls.append(offsetWrap);
  const clipTools=document.createElement('div');clipTools.className='mixer-clip-tools';
  const startWrap=document.createElement('label');startWrap.textContent='Clip in (seconds)';const trimStart=document.createElement('input');trimStart.type='number';trimStart.min='0';trimStart.max='3600';trimStart.step='.05';trimStart.value=layer.trimStart||0;trimStart.onchange=()=>{const result=window.WaveForgeTimeline.setTrim(layer,trimStart.value,layer.trimEnd,layer.audio.duration);if(!result.valid){trimStart.value=layer.trimStart||0;setStatus('Clip start must be before clip end.');return;}syncMixerLayers();saveSettings();if(timelineView)timelineView.render();};startWrap.append(trimStart);
  const endWrap=document.createElement('label');endWrap.textContent='Clip out (seconds) · blank = full';const trimEnd=document.createElement('input');trimEnd.type='number';trimEnd.min='0';trimEnd.max='3600';trimEnd.step='.05';trimEnd.placeholder='Full duration';trimEnd.value=layer.trimEnd||'';trimEnd.onchange=()=>{const result=window.WaveForgeTimeline.setTrim(layer,layer.trimStart,trimEnd.value,layer.audio.duration);if(!result.valid){trimEnd.value=layer.trimEnd||'';setStatus('Clip end must be after clip start.');return;}syncMixerLayers();saveSettings();if(timelineView)timelineView.render();};endWrap.append(trimEnd);
  const loopWrap=document.createElement('label');loopWrap.className='mixer-loop-toggle';const loop=document.createElement('input');loop.type='checkbox';loop.checked=!!layer.loop;loop.onchange=()=>{layer.loop=loop.checked;syncMixerLayers();saveSettings();};loopWrap.append(loop,document.createTextNode('Loop trimmed clip'));
  const split=document.createElement('button');split.type='button';split.className='btn small';split.textContent='Split at playhead';split.onclick=()=>{if(!window.WaveForgeTimeline||!audio.src){setStatus('Load and position the main track before splitting.');return;}if(!Number.isFinite(layer.audio.duration)||layer.audio.duration<=0){setStatus('Wait for this audio layer to finish loading before splitting.');return;}const parts=window.WaveForgeTimeline.splitLayer(layer,audio.currentTime,layer.audio.duration);if(!parts){setStatus('Move the playhead inside this clip, away from its edges.');return;}layer.trimEnd=parts.first.trimEnd;const restore={volume:layer.volume,rate:layer.rate,pitch:layer.pitch,offset:audio.currentTime,muted:false,solo:false,pan:layer.pan,bass:layer.bass,treble:layer.treble,delay:layer.delay,reverb:layer.reverb,distortion:layer.distortion,voiceStyle:layer.voiceStyle,pitchPreserving:layer.pitchPreserving,formantStrength:layer.formantStrength,preset:layer.preset,trimStart:parts.second.trimStart,trimEnd:parts.second.trimEnd,loop:false};addMixerLayer(layer.file,layer.role,restore,true);syncMixerLayers();saveSettings();setStatus('Layer split into two editable clips.');};
  clipTools.append(startWrap,endWrap,loopWrap,split);row.append(clipTools);
  row.append(controls);list.append(row);
 });applyMixerSoloState();decorateButtonIcons(list);if(timelineView)timelineView.render();
}
function updateText(){ $('previewTitle').textContent=$('titleInput').value||' ';$('previewSubtitle').textContent=$('subtitleInput').value||'';$('stageCopy').style.color=$('textColor').value;$('stageCopy').style.fontFamily=$('fontStyle').value==='serif'?'Georgia,serif':$('fontStyle').value==='mono'?'monospace':'Manrope,sans-serif';}

function initTypographyStudio(){if(window.WaveForgeTypography)window.WaveForgeTypography.mount($('overlayPanel'),saveSettings);}
function initFilterStudio(){if(window.WaveForgeFilters)window.WaveForgeFilters.mount($('visualPanel'),saveSettings);}
function initChromaKey(){if(window.WaveForgeChromaKey)window.WaveForgeChromaKey.mount($('visualPanel'),saveSettings);}
function initAISegmentation(){if(window.WaveForgeSegmentation)window.WaveForgeSegmentation.mount($('visualPanel'),saveSettings);}
function initMediaTools(){if(window.WaveForgeMediaTools)window.WaveForgeMediaTools.mount($('audioPanel'),{onMain:loadAudio,onLayer:file=>addMixerLayer(file,'Other')});}
function updateSelectionOverlay(){
 if(!selectionBox)return;
 const key=selectedObject||'title',state=getObjectState(key,audio.currentTime),p=state.position,o=state.settings;
 const dims={title:[82,9],subtitle:[82,7],lyric:[84,17],logo:[20,14]}[key]||[30,12];
 selectionBox.style.left=(p.x*100)+'%';selectionBox.style.top=(p.y*100)+'%';
 selectionBox.style.width=(dims[0]*o.scale)+'%';selectionBox.style.height=(dims[1]*o.scale)+'%';
 selectionBox.style.transform='translate(-50%,-50%) rotate('+o.rotation+'deg)';
 selectionBox.hidden=!o.visible;
}
function beginObjectTransform(e,mode){
 e.preventDefault();e.stopPropagation();
 const stage=$('stage'),r=stage.getBoundingClientRect(),state=getObjectState(selectedObject,audio.currentTime),p=state.position,o=state.settings;
 const cx=r.left+p.x*r.width,cy=r.top+p.y*r.height;
 const angle=Math.atan2(e.clientY-cy,e.clientX-cx),distance=Math.max(1,Math.hypot(e.clientX-cx,e.clientY-cy));
 transformGesture={mode,pointerId:e.pointerId,cx,cy,startAngle:angle,startDistance:distance,startScale:o.scale,startRotation:o.rotation};
 e.currentTarget.setPointerCapture(e.pointerId);
}
function moveObjectTransform(e){
 const g=transformGesture;if(!g||g.pointerId!==e.pointerId)return;
 const o=objectSettings[selectedObject];
 if(g.mode==='scale'){
  const d=Math.max(1,Math.hypot(e.clientX-g.cx,e.clientY-g.cy));
  o.scale=Math.max(.25,Math.min(2.5,g.startScale*d/g.startDistance));
  const input=$('objectScale');if(input){input.value=Math.round(o.scale*100);$('objectScaleValue').textContent=input.value+'%';}
 }else{
  const a=Math.atan2(e.clientY-g.cy,e.clientX-g.cx);
  o.rotation=Math.max(-180,Math.min(180,g.startRotation+(a-g.startAngle)*180/Math.PI));
  const input=$('objectRotation');if(input){input.value=Math.round(o.rotation);$('objectRotationValue').textContent=input.value+'°';}
 }
 if((objectKeyframes[selectedObject]||[]).length)objectKeyframes[selectedObject]=window.WaveForgeKeyframes.upsert(objectKeyframes[selectedObject],audio.currentTime,getBaseKeyframe(selectedObject));
 updateSelectionOverlay();updateKeyframeControls();saveSettings();
}
function endObjectTransform(e){
 if(!transformGesture||transformGesture.pointerId!==e.pointerId)return;
 transformGesture=null;saveSettings();updateSelectionOverlay();
}
function initObjectEditor(){
 const host=$('overlayPanel');if(!host||$('objectEditor'))return;
 const panel=document.createElement('section');panel.id='objectEditor';panel.className='object-editor';
 panel.innerHTML='<div class="object-editor-head"><div><span class="eyebrow">TEMPLATE OBJECTS</span><h3>Editable layer list</h3><p>Select one object. Changes affect only that layer and are included in project saves and video export.</p></div></div><div class="object-layer-list" id="objectLayerList"><button type="button" data-object="title">T Title</button><button type="button" data-object="subtitle">Aa Subtitle</button><button type="button" data-object="lyric">♫ Lyrics</button><button type="button" data-object="logo">▧ Logo</button></div><label>Selected object<select id="objectSelect"><option value="title">Title text</option><option value="subtitle">Subtitle text</option><option value="lyric">Lyrics / captions</option><option value="logo">Logo artwork</option></select></label><div id="objectTextWrap"><label>Object text<input id="objectTextValue" maxlength="120" type="text"></label></div><div class="object-editor-grid"><label>Position X <output id="objectXValue"></output><input id="objectX" type="range" min="5" max="95" value="50"></label><label>Position Y <output id="objectYValue"></output><input id="objectY" type="range" min="5" max="95" value="23"></label><label>Size <output id="objectScaleValue"></output><input id="objectScale" type="range" min="25" max="250" value="100"></label><label>Rotation <output id="objectRotationValue"></output><input id="objectRotation" type="range" min="-180" max="180" value="0"></label><label>Opacity <output id="objectOpacityValue"></output><input id="objectOpacity" type="range" min="0" max="100" value="100"></label><label class="object-color" id="objectColorWrap">Object color<input id="objectColor" type="color" value="#ffffff"></label></div><label class="object-visible"><input id="objectVisible" type="checkbox" checked> Show this object in preview and export</label><div class="object-editor-actions"><button type="button" class="btn small" id="objectReset">Reset selected object</button><button type="button" class="btn small" id="objectCenter">Center selected object</button></div><div class="object-keyframe-tools"><div><span class="eyebrow">ANIMATION TRACK</span><b>Transform keyframes</b><small id="objectKeyframeCount">0 keyframes · playhead 00:00</small></div><div class="object-editor-actions"><button type="button" class="btn small" id="objectKeyframeAdd">＋ Add keyframe</button><button type="button" class="btn small" id="objectKeyframeRemove">Remove nearest</button></div></div><p class="object-editor-note" id="objectEditorNote">Canvas layers can also be moved by dragging them directly in the preview. Flattened third-party images remain single images; only WaveForge-native layers are individually editable.</p>';
 host.appendChild(panel);
 const stage=$('stage');
 if(stage&&!$('objectSelectionOverlay')){
  const overlay=document.createElement('div');overlay.id='objectSelectionOverlay';overlay.className='object-selection-overlay';
  overlay.innerHTML='<div class="object-selection-box"><button type="button" class="object-transform-handle resize" data-transform="scale" aria-label="Resize selected object"></button><button type="button" class="object-transform-handle rotate" data-transform="rotate" aria-label="Rotate selected object"></button></div>';
  stage.appendChild(overlay);selectionBox=overlay.querySelector('.object-selection-box');
  overlay.querySelectorAll('[data-transform]').forEach(handle=>{
   handle.addEventListener('pointerdown',e=>beginObjectTransform(e,handle.dataset.transform));
   handle.addEventListener('pointermove',moveObjectTransform);
   handle.addEventListener('pointerup',endObjectTransform);
   handle.addEventListener('pointercancel',endObjectTransform);
  });
 }
 const $o=id=>document.getElementById(id);
 function sync(){
  const k=selectedObject,state=getObjectState(k,audio.currentTime),o=state.settings,p=state.position,isText=k==='title'||k==='subtitle';
  $o('objectSelect').value=k;$o('objectTextWrap').hidden=!isText;$o('objectColorWrap').hidden=!isText;document.querySelectorAll('[data-object]').forEach(b=>b.classList.toggle('active',b.dataset.object===k));
  if(isText)$o('objectTextValue').value=$(k==='title'?'titleInput':'subtitleInput').value;
  $o('objectX').value=Math.round(p.x*100);$o('objectY').value=Math.round(p.y*100);
  $o('objectScale').value=Math.round(o.scale*100);$o('objectRotation').value=o.rotation;
  $o('objectOpacity').value=Math.round(o.opacity*100);$o('objectColor').value=o.color||'#ffffff';$o('objectVisible').checked=o.visible;
  ['X','Y','Scale','Rotation','Opacity'].forEach(key=>{$o('object'+key+'Value').textContent=key==='X'||key==='Y'?$o('object'+key).value+'%':key==='Scale'?$o('object'+key).value+'%':key==='Rotation'?$o('object'+key).value+'°':$o('object'+key).value+'%';});updateSelectionOverlay();updateKeyframeControls();
 }
 function commit(){if((objectKeyframes[selectedObject]||[]).length)objectKeyframes[selectedObject]=window.WaveForgeKeyframes.upsert(objectKeyframes[selectedObject],audio.currentTime,getBaseKeyframe(selectedObject));sync();saveSettings();}
 $o('objectSelect').onchange=e=>{selectedObject=e.target.value;sync();};panel.querySelectorAll('[data-object]').forEach(b=>b.onclick=()=>{selectedObject=b.dataset.object;sync();});
 $o('objectTextValue').oninput=e=>{if(selectedObject==='title')$('titleInput').value=e.target.value;else if(selectedObject==='subtitle')$('subtitleInput').value=e.target.value;updateText();saveSettings();};
 [['X','x'],['Y','y']].forEach(([id,key])=>$o('object'+id).oninput=e=>{positions[selectedObject][key]=Number(e.target.value)/100;commit();});
 $o('objectScale').oninput=e=>{objectSettings[selectedObject].scale=Number(e.target.value)/100;commit();};
 $o('objectRotation').oninput=e=>{objectSettings[selectedObject].rotation=Number(e.target.value);commit();};
 $o('objectOpacity').oninput=e=>{objectSettings[selectedObject].opacity=Number(e.target.value)/100;commit();};
 $o('objectColor').oninput=e=>{objectSettings[selectedObject].color=e.target.value;commit();};
 $o('objectVisible').onchange=e=>{objectSettings[selectedObject].visible=e.target.checked;saveSettings();};
 $o('objectReset').onclick=()=>{objectSettings[selectedObject]={...objectDefaults[selectedObject]};positions[selectedObject]={...({title:{x:.5,y:.23},subtitle:{x:.5,y:.29},lyric:{x:.5,y:.8},logo:{x:.82,y:.08}}[selectedObject])};objectKeyframes[selectedObject]=[];commit();};
 $o('objectCenter').onclick=()=>{positions[selectedObject]={x:.5,y:.5};commit();};
 $o('objectKeyframeAdd').onclick=()=>{const state=getObjectState(selectedObject,audio.currentTime);objectKeyframes[selectedObject]=window.WaveForgeKeyframes.upsert(objectKeyframes[selectedObject],audio.currentTime,{...state.position,scale:state.settings.scale,rotation:state.settings.rotation,opacity:state.settings.opacity});updateKeyframeControls();saveSettings();setStatus('Keyframe added at '+fmt(audio.currentTime));};
 $o('objectKeyframeRemove').onclick=()=>{const result=window.WaveForgeKeyframes.removeNearest(objectKeyframes[selectedObject],audio.currentTime,.25);if(!result.removed){setStatus('No keyframe near the playhead.');return;}objectKeyframes[selectedObject]=result.frames;updateKeyframeControls();saveSettings();setStatus('Nearest keyframe removed');};
 audio.addEventListener('timeupdate',updateKeyframeControls);
 sync();updateKeyframeControls();
}

function openMediaDB(){
 if(!window.indexedDB)return Promise.resolve(null);
 if(!mediaDbPromise)mediaDbPromise=new Promise((resolve,reject)=>{
  const request=indexedDB.open('waveforge-media-v1',1);
  request.onupgradeneeded=()=>{const db=request.result;if(!db.objectStoreNames.contains('assets'))db.createObjectStore('assets',{keyPath:'id'});};
  request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
 }).catch(()=>null);
 return mediaDbPromise;
}
async function saveMediaAsset(id,file){
 try{const db=await openMediaDB();if(!db)return false;await new Promise((resolve,reject)=>{const tx=db.transaction('assets','readwrite');tx.objectStore('assets').put({id,blob:file,name:file.name,type:file.type,lastModified:file.lastModified||Date.now()});tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});return true;}catch(e){setStatus('Media storage unavailable');return false;}
}
async function getMediaAsset(id){
 try{const db=await openMediaDB();if(!db)return null;return await new Promise((resolve,reject)=>{const tx=db.transaction('assets','readonly'),req=tx.objectStore('assets').get(id);req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error);});}catch(e){return null;}
}
async function deleteMediaAsset(id){
 try{const db=await openMediaDB();if(!db)return;await new Promise((resolve,reject)=>{const tx=db.transaction('assets','readwrite');tx.objectStore('assets').delete(id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});}catch(e){}
}
async function restoreSavedMedia(){
 const logo=await getMediaAsset('logo');if(logo&&logo.blob&&!logoImage){const file=new File([logo.blob],logo.name||'Restored logo.png',{type:logo.type||'image/png',lastModified:logo.lastModified||Date.now()});logoUrl=URL.createObjectURL(file);const image=new Image();image.onload=()=>{logoImage=image;};image.src=logoUrl;}
 const background=await getMediaAsset('background');if(background&&background.blob&&!mediaUrl){const file=new File([background.blob],background.name||'Restored background',{type:background.type||background.blob.type,lastModified:background.lastModified||Date.now()});const input=$('mediaInput'),transfer=new DataTransfer();transfer.items.add(file);input.files=transfer.files;input.dispatchEvent(new Event('change',{bubbles:true}));}
 const main=await getMediaAsset('main');
 if(main&&main.blob&&!audioFile){const file=new File([main.blob],main.name||'Restored track', {type:main.type||'audio/mpeg',lastModified:main.lastModified||Date.now()});loadAudio(file);}
 const layers=Array.isArray(savedProjectData.layers)?savedProjectData.layers:[];
 for(const meta of layers){
  const stored=await getMediaAsset(meta.id);
  if(!stored||!stored.blob)continue;
  const file=new File([stored.blob],stored.name||'Restored layer',{type:stored.type||'audio/mpeg',lastModified:stored.lastModified||Date.now()});
  addMixerLayer(file,meta.role||'Other',meta,false);
 }
 const restored=mixerLayers.length;if((main&&main.blob)||restored)setStatus('Project media restored · '+restored+' extra layer(s)');
}

function captureUndoState(){
 return {
  title:$('titleInput').value,subtitle:$('subtitleInput').value,caption:$('captionInput').value,
  color:$('visualColor').value,style,ratio:$('exportRatio').value,quality:$('quality').value,
  font:$('fontStyle').value,textColor:$('textColor').value,template,lyricSize:$('lyricSize').value,
  lyricPosition:$('lyricPosition').value,positions:JSON.parse(JSON.stringify(positions)),
  objectSettings:JSON.parse(JSON.stringify(objectSettings)),objectKeyframes:JSON.parse(JSON.stringify(objectKeyframes)),
  typography:window.WaveForgeTypography?window.WaveForgeTypography.getAll():null,
  filter:window.WaveForgeFilters?window.WaveForgeFilters.getSettings():null,
  chromaKey:window.WaveForgeChromaKey?window.WaveForgeChromaKey.getSettings():null,
  aiSegmentation:window.WaveForgeSegmentation?window.WaveForgeSegmentation.getSettings():null,
  lyrics:JSON.parse(JSON.stringify(lyrics)),manualBpm,tapBeatOffset,
  intensity:$('intensity').value,sensitivity:$('sensitivity').value,
  mainPitch:$('mainPitch')?$('mainPitch').value:0,mainEffects:readMainEffects(),
  volume:$('volume').value,fadeIn:$('fadeIn').value,fadeOut:$('fadeOut').value
 };
}
function updateHistoryButtons(state){
 const undo=$('historyUndo'),redo=$('historyRedo');
 if(undo)undo.disabled=!state.canUndo;
 if(redo)redo.disabled=!state.canRedo;
 const count=$('historyCount');if(count)count.textContent=(state.undoCount||0)+' undo · '+(state.redoCount||0)+' redo';
}
function restoreUndoState(state){
 if(!state)return;
 historyRestoring=true;
 $('titleInput').value=state.title||'';$('subtitleInput').value=state.subtitle||'';$('captionInput').value=state.caption||'';
 if(state.color)$('visualColor').value=state.color;if(state.ratio)$('exportRatio').value=state.ratio;
 if(state.quality)$('quality').value=state.quality;if(state.font)$('fontStyle').value=state.font;
 if(state.textColor)$('textColor').value=state.textColor;if(state.lyricSize)$('lyricSize').value=state.lyricSize;
 if(state.lyricPosition)$('lyricPosition').value=state.lyricPosition;
 if(state.positions)Object.assign(positions,state.positions);
 if(state.objectSettings)Object.keys(objectDefaults).forEach(k=>objectSettings[k]={...objectDefaults[k],...(state.objectSettings[k]||{})});
 if(state.objectKeyframes)Object.keys(objectKeyframes).forEach(k=>objectKeyframes[k]=Array.isArray(state.objectKeyframes[k])?state.objectKeyframes[k]:[]);
 if(window.WaveForgeTypography&&state.typography)window.WaveForgeTypography.setAll(state.typography);
 if(window.WaveForgeFilters&&state.filter)window.WaveForgeFilters.set(state.filter.filterPreset,state.filter.filterIntensity);
 if(window.WaveForgeChromaKey&&state.chromaKey)window.WaveForgeChromaKey.set(state.chromaKey);
 if(window.WaveForgeSegmentation&&state.aiSegmentation){window.WaveForgeSegmentation.setSettings(state.aiSegmentation);if($('aiSegmentationEnabled'))$('aiSegmentationEnabled').checked=state.aiSegmentation.enabled;}
 if(Array.isArray(state.lyrics))lyrics=JSON.parse(JSON.stringify(state.lyrics));
 if(Number.isFinite(state.manualBpm))manualBpm=state.manualBpm;
 if(Number.isFinite(state.tapBeatOffset))tapBeatOffset=state.tapBeatOffset;
 $('intensity').value=state.intensity||65;$('sensitivity').value=state.sensitivity||55;
 if($('mainPitch')){$('mainPitch').value=state.mainPitch||0;$('mainPitch').dispatchEvent(new Event('input'));audio.playbackRate=Math.pow(2,Number(state.mainPitch||0)/12);audio.preservesPitch=false;}
 if(state.mainEffects)Object.keys(state.mainEffects).forEach(k=>{const input=$('main'+k.charAt(0).toUpperCase()+k.slice(1));if(input){input.value=state.mainEffects[k];input.dispatchEvent(new Event('input'));}});
 if(state.volume!==undefined){$('volume').value=state.volume;if(engine)engine.setVolume(Number(state.volume));else audio.volume=Number(state.volume);}
 if(state.fadeIn!==undefined){$('fadeIn').value=state.fadeIn;$('fadeIn').dispatchEvent(new Event('input'));}if(state.fadeOut!==undefined){$('fadeOut').value=state.fadeOut;$('fadeOut').dispatchEvent(new Event('input'));}
 style=state.style||style;selectTemplate(state.template||template);
 document.querySelectorAll('.style-card').forEach(b=>b.classList.toggle('selected',b.dataset.style===style));
 updateText();renderLyricList();resizeCanvas();applyMainEffects();
 const select=$('objectSelect');if(select){select.value=selectedObject;select.dispatchEvent(new Event('change'));}
 saveSettings();historyRestoring=false;updateHistoryButtons({canUndo:history.canUndo(),canRedo:history.canRedo(),undoCount:0,redoCount:0});
}
function initHistoryUI(){
 const host=$('overlayPanel');if(!host||$('historyStudio'))return;
 const panel=document.createElement('section');panel.id='historyStudio';panel.className='history-studio';
 panel.innerHTML='<div><span class="eyebrow">EDIT HISTORY</span><h3>Undo / redo</h3><p>Revert text, layout, typography, lyrics, visual filters and master effects. Imported media and mixer-layer add/remove actions are not in this history yet.</p></div><div class="history-actions"><button type="button" class="btn small" id="historyUndo" disabled>↶ Undo</button><button type="button" class="btn small" id="historyRedo" disabled>↷ Redo</button><small id="historyCount">0 undo · 0 redo</small></div>';
 host.appendChild(panel);
 history=window.WaveForgeHistory.create({limit:50,delay:240,onChange:updateHistoryButtons});
 $('historyUndo').onclick=()=>restoreUndoState(history.undo());
 $('historyRedo').onclick=()=>restoreUndoState(history.redo());
 history.seed(captureUndoState());
}
function saveSettings(){
 const data={mainPitch:$('mainPitch')?$('mainPitch').value:0,mainEffects:readMainEffects(),typography:window.WaveForgeTypography?window.WaveForgeTypography.getAll():null,layers:mixerLayers.map(l=>({id:l.id,role:l.role,volume:l.volume,rate:l.rate,pitch:l.pitch,offset:l.offset,muted:l.muted,solo:l.solo,pan:l.pan,bass:l.bass,treble:l.treble,delay:l.delay,reverb:l.reverb,distortion:l.distortion||0,compression:l.compression||0,voiceStyle:l.voiceStyle||'natural',pitchPreserving:!!l.pitchPreserving,formantStrength:Number(l.formantStrength)||0,trimStart:l.trimStart||0,trimEnd:l.trimEnd||0,loop:!!l.loop,preset:l.preset||'clean'})),title:$('titleInput').value,subtitle:$('subtitleInput').value,caption:$('captionInput').value,color:$('visualColor').value,style,ratio:$('exportRatio').value,quality:$('quality').value,font:$('fontStyle').value,textColor:$('textColor').value,template,lyricSize:$('lyricSize').value,lyricPosition:$('lyricPosition').value,positions,objectSettings,objectKeyframes,manualBpm,tapBeatOffset,filterPreset:window.WaveForgeFilters?window.WaveForgeFilters.getSettings().filterPreset:'f01',filterIntensity:window.WaveForgeFilters?window.WaveForgeFilters.getSettings().filterIntensity:100,chromaKey:window.WaveForgeChromaKey?window.WaveForgeChromaKey.getSettings():null,aiSegmentation:window.WaveForgeSegmentation?window.WaveForgeSegmentation.getSettings():null,threeStudio:window.WaveForge3D?window.WaveForge3D.getSettings():null,lyrics,trackName:audioFile?audioFile.name:savedTrackName};
 try{localStorage.setItem('waveforge-v1',JSON.stringify(data));setStatus('Saved locally');}catch(e){setStatus('Ready');}
 if(history&&!historyRestoring)history.record(captureUndoState());
}
function loadSettings(){
 try{const d=JSON.parse(localStorage.getItem('waveforge-v1')||'{}');if(d.title!==undefined)$('titleInput').value=d.title;if(d.subtitle!==undefined)$('subtitleInput').value=d.subtitle;if(d.caption!==undefined)$('captionInput').value=d.caption;if(d.color)$('visualColor').value=d.color;if(d.ratio)$('exportRatio').value=d.ratio;if(d.quality)$('quality').value=d.quality;if(d.font)$('fontStyle').value=d.font;if(d.textColor)$('textColor').value=d.textColor;if(window.WaveForgeTypography&&d.typography)window.WaveForgeTypography.setAll(d.typography);if(Number.isFinite(d.manualBpm))manualBpm=d.manualBpm;if(Number.isFinite(d.tapBeatOffset))tapBeatOffset=d.tapBeatOffset;if(window.WaveForgeFilters)window.WaveForgeFilters.set(d.filterPreset||'f01',d.filterIntensity===undefined?100:d.filterIntensity);if(window.WaveForgeChromaKey&&d.chromaKey)window.WaveForgeChromaKey.set(d.chromaKey);if(window.WaveForgeSegmentation&&d.aiSegmentation)window.WaveForgeSegmentation.setSettings(d.aiSegmentation);if(window.WaveForge3D&&d.threeStudio)window.WaveForge3D.setSettings(d.threeStudio);if(d.style)style=d.style;if(d.template)template=d.template;savedProjectData=d;if(d.lyricSize)$('lyricSize').value=d.lyricSize;if(d.lyricPosition)$('lyricPosition').value=d.lyricPosition;if(d.positions)Object.assign(positions,d.positions);if(d.objectKeyframes)Object.keys(objectKeyframes).forEach(k=>objectKeyframes[k]=Array.isArray(d.objectKeyframes[k])?d.objectKeyframes[k]:[]);if(d.objectSettings)Object.keys(objectDefaults).forEach(k=>objectSettings[k]={...objectDefaults[k],...(d.objectSettings[k]||{})});if(Array.isArray(d.lyrics))lyrics=d.lyrics;savedTrackName=d.trackName||'';}catch(e){}
 updateText();selectTemplate(template);renderLyricList();resizeCanvas();
}
function selectTemplate(value){template=value;document.querySelectorAll('.template-card').forEach(b=>b.classList.toggle('selected',b.dataset.template===template));}
function loadAudio(file){
 if(!file)return;if(!file.type.startsWith('audio/')){alert('Please choose a valid audio file.');return;}
 if(audio.src)URL.revokeObjectURL(audio.src);audioFile=file;audio.src=URL.createObjectURL(file);saveMediaAsset('main',file);
 $('trackName').textContent=file.name;$('trackMeta').textContent=(file.type||'Audio')+' · '+(file.size/1024/1024).toFixed(1)+' MB';$('playBtn').textContent='▶';$('timeLabel').textContent='00:00 / 00:00';if(file.name!==savedTrackName)lyrics=[];savedTrackName=file.name;renderLyricList();setStatus('Audio loaded');saveSettings();
}
function updateWordSyncPanel(){
 const panel=$('wordSyncPanel');if(!panel||!wordSync)return;
 const total=wordSync.words.length,done=wordSync.marks.length,next=wordSync.words[done];
 $('wordSyncProgress').textContent=done+'/'+total+' words marked';
 $('wordSyncCurrent').textContent=next?'Next word: “'+next+'”':'All words marked · finish to apply timing';
 $('wordSyncMark').disabled=done>=total;$('wordSyncFinish').disabled=done!==total;
 $('wordSyncUndo').disabled=done===0;
}
function beginWordSync(index){
 const line=lyrics[index];if(!line)return;
 const words=String(line.text||'').trim().split(/\s+/).filter(Boolean);
 if(!words.length)return;
 wordSync={lineIndex:index,words,marks:[]};$('wordSyncPanel').hidden=false;updateWordSyncPanel();
 $('wordSyncStatus').textContent='Play the song, then tap Mark word as each word begins.';
 $('wordSyncPanel').scrollIntoView({behavior:'smooth',block:'nearest'});
}
function markSyncWord(){
 if(!wordSync)return;
 if(!audioFile){$('wordSyncStatus').textContent='Import a song before syncing word timing.';return;}
 if(audio.paused){$('wordSyncStatus').textContent='Play the song, then tap Mark word as each word begins.';return;}
 const line=lyrics[wordSync.lineIndex],time=audio.currentTime||0,last=wordSync.marks[wordSync.marks.length-1];
 if(time<line.start||time>=line.end){$('wordSyncStatus').textContent='Move playback inside this lyric line ('+fmt(line.start)+'–'+fmt(line.end)+').';return;}
 if(last&&time<=last.time){$('wordSyncStatus').textContent='Play forward before marking the next word.';return;}
 wordSync.marks.push({time});updateWordSyncPanel();
 $('wordSyncStatus').textContent=wordSync.marks.length===wordSync.words.length?'All words marked. Tap Finish to apply word timing.':'Word start saved at '+fmt(time)+'. Keep playing and mark the next word.';
}
function undoSyncWord(){if(!wordSync||!wordSync.marks.length)return;wordSync.marks.pop();updateWordSyncPanel();$('wordSyncStatus').textContent='Last word mark removed.';}
function finishWordSync(){
 if(!wordSync)return;
 if(wordSync.marks.length!==wordSync.words.length){$('wordSyncStatus').textContent='Mark every word before finishing.';return;}
 const line=lyrics[wordSync.lineIndex],marks=wordSync.marks;
 if(marks.some((m,i)=>i&&m.time<=marks[i-1].time)||marks[marks.length-1].time>=line.end){$('wordSyncStatus').textContent='Word timings must increase and finish before the lyric line ends.';return;}
 line.words=wordSync.words.map((text,i)=>({text,start:marks[i].time,end:i+1<marks.length?marks[i+1].time:line.end}));
 wordSync=null;$('wordSyncPanel').hidden=true;renderLyricList();saveSettings();
}
function cancelWordSync(){wordSync=null;$('wordSyncPanel').hidden=true;}
function renderLyricList(){
 const host=$('lyricList');host.innerHTML='';
 if(!lyrics.length){host.innerHTML='<span class="hint">Generated or imported lyric lines will appear here.</span>';return;}
 lyrics.forEach((line,i)=>{const row=document.createElement('div');row.className='lyric-row';const time=document.createElement('time');time.textContent=fmt(line.start);const text=document.createElement('span');text.textContent=line.text;const edit=document.createElement('button');edit.textContent='Edit';decorateActionButton(edit);edit.onclick=()=>{const v=prompt('Edit lyric line',line.text);if(v!==null){line.text=v;if(Array.isArray(line.words))delete line.words;$('captionInput').value=lyrics.map(x=>x.text).join('\n');renderLyricList();saveSettings();}};const sync=document.createElement('button');sync.textContent='Sync words';decorateActionButton(sync);sync.onclick=()=>beginWordSync(i);row.append(time,text,sync,edit);host.appendChild(row);});
}
function manualLyrics(){
 const lines=$('captionInput').value.split(/\n+/).map(x=>x.trim()).filter(Boolean),duration=audio.duration||Math.max(4,lines.length*4),previous=lyrics;
 lyrics=lines.map((text,i)=>{const prior=previous[i];if(prior){const next={...prior,text};if(prior.text!==text&&Array.isArray(prior.words))delete next.words;return next;}return{text,start:duration*i/Math.max(1,lines.length),end:duration*(i+1)/Math.max(1,lines.length)};});
 renderLyricList();saveSettings();
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
$('wordSyncMark').onclick=markSyncWord;$('wordSyncUndo').onclick=undoSyncWord;$('wordSyncFinish').onclick=finishWordSync;$('wordSyncCancel').onclick=cancelWordSync;
document.querySelectorAll('.template-card').forEach(b=>b.onclick=()=>{selectTemplate(b.dataset.template);saveSettings();});
$('lyricSize').oninput=saveSettings;
$('lyricPosition').onchange=e=>{positions.lyric.y=e.target.value==='upper'?.36:e.target.value==='middle'?.56:.80;saveSettings();};
$('exportRatio').onchange=()=>{resizeCanvas();saveSettings();};document.querySelectorAll('.ratio').forEach(b=>b.onclick=()=>{$('exportRatio').value=b.dataset.ratio;resizeCanvas();saveSettings();});$('quality').onchange=()=>{resizeCanvas();saveSettings();};
document.querySelectorAll('[data-scroll]').forEach(b=>b.onclick=()=>$(b.dataset.scroll).scrollIntoView({behavior:'smooth'}));
$('themeToggle').onclick=()=>{document.body.classList.toggle('light');$('themeToggle').textContent=document.body.classList.contains('light')?'Dark mode':'Light mode';};
function loadLogoFile(file){
 return new Promise((resolve,reject)=>{
  if(!file||!file.type.startsWith('image/')){const error=new Error('Choose a valid image or SVG logo.');setStatus(error.message);reject(error);return;}
  if(logoUrl)URL.revokeObjectURL(logoUrl);
  logoUrl=URL.createObjectURL(file);
  const img=new Image();
  img.onload=async()=>{try{logoImage=img;$('stageLogo').innerHTML='';const stored=await saveMediaAsset('logo',file);saveSettings();setStatus(stored?'Logo loaded':'Logo loaded for this session; media storage is unavailable.');resolve(stored);}catch(error){reject(error);}};
  img.onerror=()=>{if(logoUrl)URL.revokeObjectURL(logoUrl);logoUrl=null;logoImage=null;const error=new Error('Could not decode this logo image.');setStatus(error.message);reject(error);};
  img.src=logoUrl;
 });
}
function initSymbolLibrary(){if(window.WaveForgeSymbols)window.WaveForgeSymbols.mount($('overlayPanel'),{onLogo:loadLogoFile});}
function initThreeStudio(){if(window.WaveForge3D)window.WaveForge3D.mount($('overlayPanel'),{onLogo:loadLogoFile,onChange:saveSettings});}
 $('logoInput').onchange=e=>loadLogoFile(e.target.files[0]).catch(error=>setStatus(error.message));
$('clearLogo').onclick=()=>{$('stageLogo').innerHTML='';if(logoUrl)URL.revokeObjectURL(logoUrl);logoUrl=null;logoImage=null;deleteMediaAsset('logo');saveSettings();};
$('mediaInput').onchange=e=>{
 const f=e.target.files[0];if(!f)return;if(!f.type.startsWith('image/')&&!f.type.startsWith('video/')){alert('Choose an image or video file.');return;}
 if(mediaUrl)URL.revokeObjectURL(mediaUrl);mediaUrl=URL.createObjectURL(f);saveMediaAsset('background',f);
 const img=$('backgroundImage'),vid=$('backgroundVideo');img.classList.add('hidden');vid.classList.add('hidden');vid.pause();vid.removeAttribute('src');img.removeAttribute('src');
 if(f.type.startsWith('image/')){mediaKind='image';img.onload=()=>{$('mediaStatus').textContent='Photo ready · '+f.name;};img.onerror=()=>{$('mediaStatus').textContent='Could not load this photo.';};img.src=mediaUrl;img.classList.remove('hidden');}
 else{mediaKind='video';vid.muted=true;vid.loop=true;vid.playsInline=true;vid.onloadeddata=()=>{$('mediaStatus').textContent='Video ready · '+f.name;vid.play().catch(()=>{});};vid.src=mediaUrl;vid.classList.remove('hidden');}
};
$('clearMedia').onclick=()=>{if(mediaUrl)URL.revokeObjectURL(mediaUrl);deleteMediaAsset('background');mediaUrl=null;mediaKind='';$('backgroundImage').removeAttribute('src');$('backgroundVideo').pause();$('backgroundVideo').removeAttribute('src');$('backgroundImage').classList.add('hidden');$('backgroundVideo').classList.add('hidden');$('mediaStatus').textContent='No background selected.';};
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
 const lyricPos=getObjectState('lyric',audio.currentTime).position,titlePos=getObjectState('title',audio.currentTime).position,subtitlePos=getObjectState('subtitle',audio.currentTime).position,logoPos=getObjectState('logo',audio.currentTime).position;
 dragTarget=near(lyricPos,.46,.12)&&currentLyric()?'lyric':near(titlePos,.46,.07)?'title':near(subtitlePos,.46,.06)?'subtitle':logoImage&&near(logoPos,.15,.1)?'logo':null;
 if(dragTarget){selectedObject=dragTarget;const sel=document.getElementById('objectSelect');if(sel){sel.value=dragTarget;sel.dispatchEvent(new Event('change'));}const selectedPos=getObjectState(dragTarget,audio.currentTime).position;dragOffset={x:p.x-selectedPos.x,y:p.y-selectedPos.y};canvas.setPointerCapture(e.pointerId);$('dragHint').textContent='Moving '+dragTarget+' layer — release to place it.';updateSelectionOverlay();}
});
canvas.addEventListener('pointermove',e=>{if(!dragTarget)return;const p=point(e);positions[dragTarget]={x:Math.max(.08,Math.min(.92,p.x-dragOffset.x)),y:Math.max(.05,Math.min(.94,p.y-dragOffset.y))};if((objectKeyframes[dragTarget]||[]).length)objectKeyframes[dragTarget]=window.WaveForgeKeyframes.upsert(objectKeyframes[dragTarget],audio.currentTime,getBaseKeyframe(dragTarget));updateSelectionOverlay();});
canvas.addEventListener('pointerup',()=>{if(dragTarget){dragTarget=null;$('dragHint').textContent='Position saved. Touch another text layer to move it.';const x=document.getElementById('objectX'),y=document.getElementById('objectY');if(x){x.value=Math.round(positions[selectedObject].x*100);y.value=Math.round(positions[selectedObject].y*100);x.dispatchEvent(new Event('input'));}saveSettings();updateSelectionOverlay();}});
canvas.addEventListener('pointercancel',()=>{dragTarget=null;updateSelectionOverlay();});
async function doExport(){
 if(!audio.src){alert('Add an audio track first.');return;}const status=$('exportStatus');
 try{resizeCanvas();await ensureEngine();audio.currentTime=0;status.textContent='Preparing recording…';$('exportBtn').disabled=true;$('exportBtnSide').disabled=true;
  const result=await WaveForgeExport.record(canvas,audio,{fps:$('fps').value,quality:$('quality').value,audioStream:engine.getExportStream()},p=>status.textContent='Rendering in real time… '+p+'%');
  status.textContent='Export complete · '+result.ext.toUpperCase()+' · '+(result.size/1024/1024).toFixed(1)+' MB';
 }catch(e){status.textContent='Export unavailable: '+e.message;alert(e.message);}
 finally{$('exportBtn').disabled=false;$('exportBtnSide').disabled=false;}
}
$('exportBtn').onclick=doExport;$('exportBtnSide').onclick=doExport;
loadSettings();audio.volume=.85;initObjectEditor();initTypographyStudio();initMixerUI();initHistoryUI();initMediaTools();initFilterStudio();initChromaKey();initAISegmentation();initSymbolLibrary();initThreeStudio();restoreSavedMedia();decorateButtonIcons();startDraw();
window.addEventListener('beforeunload',()=>{if(history)history.flush();if(mediaUrl)URL.revokeObjectURL(mediaUrl);if(logoUrl)URL.revokeObjectURL(logoUrl);if(audio.src)URL.revokeObjectURL(audio.src);});
})();