'use strict';
(function(root){
 const MAX_VIDEO=8,MAX_PHOTO=12,MAX_FILE=120*1024*1024,MAX_PHOTO_FILE=20*1024*1024,MAX_TOTAL=180*1024*1024,MAX_DURATION=180,MAX_SEGMENTS=300;
 const PRESETS={
  social:{label:'Beat Snap',beats:1,mode:'round',motion:'pulse'},
  cinematic:{label:'Cinematic Flow',beats:4,mode:'sequence',motion:'slow'},
  travel:{label:'Travel Diary',beats:2,mode:'round',motion:'pan'},
  vlog:{label:'Vlog Story',beats:2,mode:'sequence',motion:'pulse'},
  calm:{label:'Calm Aesthetic',beats:4,mode:'sequence',motion:'slow'},
  photo:{label:'Photo Memories',beats:4,mode:'sequence',motion:'zoom'},
  lyric:{label:'Lyric Pulse',beats:1,mode:'round',motion:'pulse'},
  flash:{label:'Flash Cuts',beats:.5,mode:'round',motion:'flash'},
  memories:{label:'Memory Film',beats:3,mode:'sequence',motion:'slow'},
  documentary:{label:'Documentary',beats:8,mode:'sequence',motion:'pan'}
 };
 let host=null,bridge=null,assets=new Map(),segments=[],style='social',intensity=3,selected=null;
 const $=id=>host&&host.querySelector('#'+id);
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)||0));
 const id=()=> 'vclip-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7);
 const isPhoto=a=>a&&a.kind==='image';
 function durationOf(asset){return isPhoto(asset)?Math.max(.5,Number(asset.virtualDuration)||3):Math.max(0,Number(asset.media&&asset.media.duration)||0);}
 function averageRate(s){return Math.max(.25,((Number(s.rateStart)||Number(s.rate)||1)+(Number(s.rateEnd)||Number(s.rate)||1))/2);}
 function segmentDuration(s){return (s.sourceEnd-s.sourceStart)/averageRate(s);}
 function sourceAt(s,elapsed){const duration=segmentDuration(s),p=clamp(elapsed/Math.max(.001,duration),0,1),start=Number(s.rateStart)||Number(s.rate)||1,end=Number(s.rateEnd)||Number(s.rate)||1;return s.sourceStart+elapsed*(start+(end-start)*p/2);}
 function totalDuration(){return segments.reduce((m,s)=>Math.max(m,s.timelineStart+segmentDuration(s)),0);}
 function relayout(){let t=0;segments.forEach(s=>{s.timelineStart=t;t+=segmentDuration(s);});}
 function updateStatus(message){const out=$('autoVideoStatus');if(out)out.textContent=message;}
 function persist(){if(bridge&&bridge.onChange)bridge.onChange();}
 function render(){
  const list=$('autoVideoSegments');if(!list)return;list.innerHTML='';
  if(!assets.size){list.innerHTML='<p class="hint">Import photos and/or short video clips. Your original files stay untouched.</p>';}
  segments.forEach((segment,index)=>{
   const asset=assets.get(segment.assetId);if(!asset)return;
   const card=document.createElement('article');card.className='auto-video-clip'+(selected===segment.id?' selected':'');
   const top=document.createElement('div');top.className='auto-video-clip-head';top.addEventListener('click',()=>{selected=segment.id;render();});
   const name=document.createElement('b');name.textContent=(index+1)+'. '+(isPhoto(asset)?'PHOTO · ':'VIDEO · ')+asset.name;
   const time=document.createElement('small');time.textContent=segment.timelineStart.toFixed(1)+'s · '+segmentDuration(segment).toFixed(1)+'s · '+averageRate(segment).toFixed(1)+'× avg';
   top.append(name,time);card.append(top);
   const actions=document.createElement('div');actions.className='auto-video-clip-actions';
   [['↑',()=>move(index,-1),'Move earlier'],['↓',()=>move(index,1),'Move later'],['Split',()=>splitSegment(segment.id),'Split at midpoint'],['Remove',()=>removeSegment(segment.id),'Remove segment']].forEach(([label,fn,title])=>{const b=document.createElement('button');b.type='button';b.className='btn small';b.textContent=label;b.title=title;b.disabled=(label==='↑'&&index===0)||(label==='↓'&&index===segments.length-1);b.addEventListener('click',fn);actions.appendChild(b);});
   card.append(actions);
   const speed=document.createElement('div');speed.className='auto-video-speed';
   [['Start speed','rateStart'],['End speed','rateEnd']].forEach(([label,key])=>{const wrap=document.createElement('label');wrap.className='auto-video-trim';const caption=document.createElement('span');caption.textContent=label+' · '+(Number(segment[key])||Number(segment.rate)||1).toFixed(1)+'×';const slider=document.createElement('input');slider.type='range';slider.min='.5';slider.max='2';slider.step='.1';slider.value=Number(segment[key])||Number(segment.rate)||1;slider.addEventListener('input',()=>{setSpeedRamp(segment.id,key==='rateStart'?slider.value:segment.rateStart,key==='rateEnd'?slider.value:segment.rateEnd,false);caption.textContent=label+' · '+Number(slider.value).toFixed(1)+'×';});slider.addEventListener('change',()=>render());wrap.append(caption,slider);speed.appendChild(wrap);});card.append(speed);
   const transition=document.createElement('label');transition.className='auto-video-trim';const transitionLabel=document.createElement('span');transitionLabel.textContent='Transition into this clip';const transitionSelect=document.createElement('select');[['cut','Hard cut'],['fade','Fade through black'],['flash','White flash'],['wipe','Wipe reveal'],['zoom','Zoom reveal']].forEach(([value,label])=>{const option=document.createElement('option');option.value=value;option.textContent=label;transitionSelect.appendChild(option);});transitionSelect.value=segment.transition||'cut';transitionSelect.addEventListener('change',()=>setTransition(segment.id,transitionSelect.value));transition.append(transitionLabel,transitionSelect);card.append(transition);
   const trim=document.createElement('label');trim.className='auto-video-trim';const trimText=document.createElement('span');trimText.textContent='Segment length · '+(segment.sourceEnd-segment.sourceStart).toFixed(1)+' sec';
   const range=document.createElement('input');range.type='range';range.min='.2';range.max=Math.max(.2,Math.min(20,segment.sourceEnd-segment.sourceStart));range.step='.1';range.value=Math.max(.2,segment.sourceEnd-segment.sourceStart);
   range.addEventListener('input',()=>{const len=clamp(range.value,.2,Math.max(.2,segment.sourceEnd-segment.sourceStart));segment.sourceEnd=segment.sourceStart+len;trimText.textContent='Segment length · '+len.toFixed(1)+' sec';relayout();persist();});
   trim.append(trimText,range);card.append(trim);list.appendChild(card);
  });
  const count=$('autoVideoCount');if(count)count.textContent=segments.length+' editable segments · '+totalDuration().toFixed(1)+' sec';
 }
 function createVideo(file){
  const video=document.createElement('video');video.muted=true;video.playsInline=true;video.preload='metadata';video.setAttribute('playsinline','');video.src=URL.createObjectURL(file);
  return new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Video metadata took too long. Try a shorter MP4/H.264 video.')),15000);
   video.onloadedmetadata=()=>{clearTimeout(timer);if(!Number.isFinite(video.duration)||video.duration<=0||video.duration>MAX_DURATION){URL.revokeObjectURL(video.src);reject(new Error('Each video must be 1–180 seconds long.'));return;}resolve(video);};
   video.onerror=()=>{clearTimeout(timer);URL.revokeObjectURL(video.src);reject(new Error('This video codec is not supported. Try MP4/H.264.'));};video.load();
  });
 }
 function createImage(file){
  const img=document.createElement('img');img.decoding='async';img.src=URL.createObjectURL(file);
  return new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Photo took too long to load. Try a smaller JPG or PNG.')),15000);
   img.onload=()=>{clearTimeout(timer);if(!img.naturalWidth||!img.naturalHeight){URL.revokeObjectURL(img.src);reject(new Error('This photo could not be decoded.'));return;}resolve(img);};
   img.onerror=()=>{clearTimeout(timer);URL.revokeObjectURL(img.src);reject(new Error('This photo format is not supported. Try JPG, PNG or WebP.'));};
  });
 }
 async function addFiles(fileList){
  const files=Array.from(fileList||[]).filter(f=>f&&(/^(image|video)\//).test(f.type));
  if(!files.length)throw new Error('Choose photo or video files.');
  const newVideos=files.filter(f=>f.type.startsWith('video/')).length,newPhotos=files.filter(f=>f.type.startsWith('image/')).length;
  if(Array.from(assets.values()).filter(a=>a.kind==='video').length+newVideos>MAX_VIDEO)throw new Error('Maximum 8 video clips per project.');
  if(Array.from(assets.values()).filter(a=>a.kind==='image').length+newPhotos>MAX_PHOTO)throw new Error('Maximum 12 photos per project.');
  let bytes=Array.from(assets.values()).reduce((n,a)=>n+a.size,0);
  for(const file of files){
   const photo=file.type.startsWith('image/');if(file.size>(photo?MAX_PHOTO_FILE:MAX_FILE))throw new Error(file.name+(photo?' is larger than 20 MB.':' is larger than 120 MB.'));
   if(bytes+file.size>MAX_TOTAL)throw new Error('All source photos/videos are limited to 180 MB total to protect phone storage.');
   const assetId=id(),media=photo?await createImage(file):await createVideo(file),saved=await bridge.saveMediaAsset(assetId,file);
   if(!saved){URL.revokeObjectURL(media.src);throw new Error('Could not save '+file.name+' to local project storage.');}
   const asset={id:assetId,name:file.name,type:file.type,size:file.size,kind:photo?'image':'video',media,file,virtualDuration:0};
   assets.set(assetId,asset);if(!photo)segments.push({id:id(),assetId,sourceStart:0,sourceEnd:durationOf(asset),timelineStart:0,rate:1});
   bytes+=file.size;
  }
  relayout();render();updateStatus('Imported '+newPhotos+' photo(s) and '+newVideos+' video(s). Original files are stored locally.');persist();return assets.size;
 }
 function move(index,delta){const next=index+delta;if(next<0||next>=segments.length)return;[segments[index],segments[next]]=[segments[next],segments[index]];relayout();render();persist();}
 function splitSegment(segmentId){const index=segments.findIndex(s=>s.id===segmentId);if(index<0||segments.length>=MAX_SEGMENTS)return false;const source=segments[index],mid=(source.sourceStart+source.sourceEnd)/2;if(mid-source.sourceStart<.1||source.sourceEnd-mid<.1)return false;const midRate=((Number(source.rateStart)||1)+(Number(source.rateEnd)||1))/2;const first={...source,id:id(),sourceEnd:mid,rateEnd:midRate,rate:(Number(source.rateStart||1)+midRate)/2},second={...source,id:id(),sourceStart:mid,rateStart:midRate,rate:(midRate+Number(source.rateEnd||1))/2};segments.splice(index,1,first,second);relayout();selected=first.id;render();persist();return true;}
 function removeSegment(segmentId){segments=segments.filter(s=>s.id!==segmentId);relayout();render();persist();}
 function buildQueue(asset,cutLength){
  const duration=durationOf(asset),ranges=[];
  if(asset.kind==='video'){
   const points=[0,...(Array.isArray(asset.sceneCuts)?asset.sceneCuts:[]),...(Array.isArray(asset.audioPauses)?asset.audioPauses.map(g=>g.midpoint):[])].filter(t=>t>0&&t<duration).sort((a,b)=>a-b).filter((t,i,a)=>i===0||t-a[i-1]>.35);points.push(duration);
   for(let i=0;i<points.length-1;i++){let cursor=points[i];while(cursor<points[i+1]-.12){const end=Math.min(points[i+1],cursor+cutLength);if(end-cursor>=.2)ranges.push({id:id(),assetId:asset.id,sourceStart:cursor,sourceEnd:end,timelineStart:0,rateStart:1,rateEnd:1,transition:'cut'});cursor=end;}}
  }else{let cursor=0;while(cursor<duration-.12){const end=Math.min(duration,cursor+cutLength);if(end-cursor>=.2)ranges.push({id:id(),assetId:asset.id,sourceStart:cursor,sourceEnd:end,timelineStart:0,rateStart:1,rateEnd:1,transition:'cut'});cursor=end;}}
  return ranges;
 }
 function generateAutoCut(options={}){
  if(!assets.size)throw new Error('Import photos or videos first.');
  const bpm=clamp(options.bpm||120,30,240),beat=60/bpm,preset=PRESETS[style]||PRESETS.social;
  const beatsPerCut=Math.max(.5,preset.beats*(1.2-intensity*.15)),cutLength=Math.max(.35,beat*beatsPerCut);
  const photos=Array.from(assets.values()).filter(isPhoto),videos=Array.from(assets.values()).filter(a=>!isPhoto(a));
  const musicDuration=clamp(options.musicDuration||0,0,3600);
  if(photos.length){const target=musicDuration>0?musicDuration:Math.max(photos.length*3,3);photos.forEach(p=>p.virtualDuration=target/photos.length);}
  const sources=[...videos,...photos];if(preset.mode==='round')sources.sort((a,b)=>a.id.localeCompare(b.id));
  const queues=sources.map(asset=>buildQueue(asset,cutLength)),indexes=queues.map(()=>0),out=[];
  const videoDuration=videos.reduce((n,a)=>n+durationOf(a),0),targetDuration=musicDuration>0?(photos.length?musicDuration:Math.min(musicDuration,videoDuration)):sources.reduce((n,a)=>n+durationOf(a),0);
  let guard=0,active=0;
  while(guard++<MAX_SEGMENTS*4&&out.length<MAX_SEGMENTS&&totalDurationFor(out)<targetDuration-.08){
   let found=-1;for(let k=0;k<queues.length;k++){const ix=(active+k)%queues.length;if(indexes[ix]<queues[ix].length){found=ix;break;}}
   if(found<0)break;
   const next={...queues[found][indexes[found]++]};const remaining=targetDuration-totalDurationFor(out);
   if(segmentDuration(next)>remaining+.001){const wanted=remaining*averageRate(next);next.sourceEnd=next.sourceStart+wanted;}
   if(next.sourceEnd-next.sourceStart>=.18)out.push(next);
   active=(found+1)%queues.length;
  }
  if(!out.length)throw new Error('No usable media segments were found.');
  segments=out;relayout();selected=segments[0].id;render();
  updateStatus(preset.label+' draft · '+bpm+' BPM · '+out.length+' editable cuts. Scene cuts, speed ramps and transitions can be adjusted below.');
  persist();return{count:segments.length,duration:totalDuration(),cutLength,bpm,style,photoCount:photos.length,videoCount:videos.length};
 }
 function totalDurationFor(list){return list.reduce((n,s)=>n+segmentDuration(s),0);}
 function setSpeedRamp(segmentId,start,end,doRender=true){const s=segments.find(x=>x.id===segmentId);if(!s)return false;s.rateStart=clamp(start,.5,2);s.rateEnd=clamp(end,.5,2);s.rate=(s.rateStart+s.rateEnd)/2;relayout();if(doRender)render();persist();return true;}
 function setTransition(segmentId,value){const s=segments.find(x=>x.id===segmentId);if(!s)return false;s.transition=['cut','fade','flash','wipe','zoom'].includes(value)?value:'cut';render();persist();return true;}
 function sync(time,isPlaying){
  const active=segments.find(s=>time>=s.timelineStart&&time<s.timelineStart+segmentDuration(s));
  assets.forEach(asset=>{if(asset.kind==='video'&&(!active||asset.id!==active.assetId)&&!asset.media.paused)asset.media.pause();});
  if(!active)return null;const asset=assets.get(active.assetId);if(!asset)return null;
  if(isPhoto(asset))return asset.media;
  const video=asset.media,elapsed=time-active.timelineStart,progress=clamp(elapsed/Math.max(.001,segmentDuration(active)),0,1),speed=(Number(active.rateStart)||Number(active.rate)||1)+((Number(active.rateEnd)||Number(active.rate)||1)-(Number(active.rateStart)||Number(active.rate)||1))*progress,expected=sourceAt(active,elapsed);if(Math.abs((video.playbackRate||1)-speed)>.04)video.playbackRate=speed;
  if(Number.isFinite(expected)&&Math.abs(video.currentTime-expected)>.22){try{video.currentTime=clamp(expected,active.sourceStart,Math.max(active.sourceStart,active.sourceEnd-.03));}catch(e){}}
  if(isPlaying&&video.paused)video.play().catch(()=>{});if(!isPlaying&&!video.paused)video.pause();return video.readyState>=2&&video.videoWidth?video:null;
 }
 function getVisualEffect(time){
  const active=segments.find(s=>time>=s.timelineStart&&time<s.timelineStart+segmentDuration(s));
  if(!active)return{type:'cut',progress:1,opacity:0,scale:1};
  const type=active.transition||'cut',elapsed=time-active.timelineStart,duration=Math.min(.65,segmentDuration(active)*.35),progress=clamp(elapsed/Math.max(.12,duration),0,1);
  return{type,progress,opacity:type==='fade'?(1-progress):type==='flash'?(1-progress)*.85:type==='wipe'?(1-progress):0,scale:type==='zoom'?(1.18-.18*progress):1};
 }
 function getMotion(time){
  const active=segments.find(s=>time>=s.timelineStart&&time<s.timelineStart+segmentDuration(s));
  if(!active)return{scale:1,x:0,y:0};const asset=assets.get(active.assetId),effect=getVisualEffect(time);if(!isPhoto(asset))return{scale:effect.scale,x:0,y:0,flash:0};
  const progress=clamp((time-active.timelineStart)/Math.max(.2,segmentDuration(active)),0,1),motion=(PRESETS[style]||PRESETS.social).motion;
  const scale=motion==='slow'?1.08+progress*.10:motion==='pulse'?1.04+Math.sin(progress*Math.PI)*.10:motion==='pan'?1.04+progress*.04:motion==='flash'?1.01+progress*.02:1.06+progress*.12;
  return{scale:scale*effect.scale,x:(progress-.5)*(motion==='pan'?.06:.018),y:(.5-progress)*(motion==='pan'?.04:.012),flash:motion==='flash'&&progress<.12?(1-progress/.12)*.22:0};
 }
 function getState(){return{style,intensity,assets:Array.from(assets.values()).map(({id,name,type,size,kind,virtualDuration,sceneCuts,audioPauses})=>({id,name,type,size,kind,virtualDuration,sceneCuts,audioPauses})),segments:segments.map(s=>({...s}))};}
 async function restore(state){
  if(!state||!Array.isArray(state.assets)||!state.assets.length)return 0;
  style=PRESETS[state.style]?state.style:'social';intensity=clamp(state.intensity||3,1,5);
  for(const meta of state.assets.slice(0,MAX_VIDEO+MAX_PHOTO)){
   const stored=await bridge.getMediaAsset(meta.id);if(!stored||!stored.blob)continue;
   const type=meta.type||stored.type||'',photo=(meta.kind==='image'||type.startsWith('image/'));
   const file=new File([stored.blob],meta.name|| (photo?'Restored photo.jpg':'Restored video.mp4'),{type:type||(photo?'image/jpeg':'video/mp4')});
   try{const media=photo?await createImage(file):await createVideo(file);assets.set(meta.id,{...meta,kind:photo?'image':'video',virtualDuration:Number(meta.virtualDuration)||0,size:file.size,media,file});}catch(e){}
  }
  segments=(Array.isArray(state.segments)?state.segments:[]).filter(s=>assets.has(s.assetId)&&Number.isFinite(s.sourceStart)&&Number.isFinite(s.sourceEnd)&&s.sourceEnd>s.sourceStart).slice(0,MAX_SEGMENTS).map(s=>({...s,rateStart:clamp(s.rateStart||s.rate||1,.5,2),rateEnd:clamp(s.rateEnd||s.rate||1,.5,2),transition:['cut','fade','flash','wipe','zoom'].includes(s.transition)?s.transition:'cut'}));
  relayout();render();return assets.size;
 }
 function seekVideo(video,time){
  return new Promise((resolve,reject)=>{const old=video.currentTime;let done=false;const finish=()=>{if(done)return;done=true;clearTimeout(timer);video.removeEventListener&&video.removeEventListener('seeked',finish);resolve();};const timer=setTimeout(()=>{if(done)return;done=true;reject(new Error('Video seek timed out during scene detection.'));},4000);video.addEventListener&&video.addEventListener('seeked',finish,{once:true});try{video.currentTime=clamp(time,0,Math.max(0,video.duration-.04));if(Math.abs(video.currentTime-old)<.03)finish();}catch(error){clearTimeout(timer);reject(error);}});
 }
 async function detectScenes(assetId,onProgress){
  const asset=assets.get(assetId);if(!asset||asset.kind!=='video')throw new Error('Choose an imported video clip first.');
  const video=asset.media,oldTime=video.currentTime,wasPlaying=!video.paused,canvas=document.createElement('canvas');canvas.width=32;canvas.height=18;const c=canvas.getContext('2d',{willReadFrequently:true});if(!c)throw new Error('Scene detection is unavailable on this device.');
  const sampleStep=1,cuts=[];let prev=null;
  try{video.pause();for(let t=0;t<video.duration-.2;t+=sampleStep){await seekVideo(video,t);c.drawImage(video,0,0,32,18);const pixels=c.getImageData(0,0,32,18).data;let diff=0;if(prev){for(let i=0;i<pixels.length;i+=4)diff+=(Math.abs(pixels[i]-prev[i])+Math.abs(pixels[i+1]-prev[i+1])+Math.abs(pixels[i+2]-prev[i+2]))/(3*255);diff/=32*18;if(diff>.24&&t>1)cuts.push(Number(t.toFixed(2)));}prev=new Uint8ClampedArray(pixels);if(onProgress)onProgress(Math.min(100,Math.round(t/video.duration*100)));}}
  finally{try{await seekVideo(video,oldTime);}catch(e){}if(wasPlaying)video.play().catch(()=>{});}
  asset.sceneCuts=cuts;persist();return cuts;
 }
 async function detectAllScenes(onProgress){
  const videos=Array.from(assets.values()).filter(a=>a.kind==='video');let total=0;
  for(let i=0;i<videos.length;i++){const cuts=await detectScenes(videos[i].id,p=>onProgress&&onProgress(i,videos.length,p));total+=cuts.length;}
  return total;
 }
 async function detectQuietGaps(assetId,onProgress){
  const asset=assets.get(assetId);if(!asset||asset.kind!=='video')throw new Error('Choose an imported video clip first.');
  const AudioCtor=root.AudioContext||root.webkitAudioContext;if(!AudioCtor)throw new Error('Local audio analysis is not supported by this Android WebView.');
  if(!asset.file||typeof asset.file.arrayBuffer!=='function')throw new Error('The original video file is unavailable. Re-import this clip to analyse its audio.');
  const audioContext=new AudioCtor();let buffer;
  try{
   buffer=await audioContext.decodeAudioData(await asset.file.arrayBuffer());
   const rate=buffer.sampleRate,windowSize=Math.max(1,Math.floor(rate*.05)),channels=buffer.numberOfChannels||1,length=buffer.length,levels=[];
   for(let start=0;start<length;start+=windowSize){
    let sum=0,count=0;for(let channel=0;channel<channels;channel++){const samples=buffer.getChannelData(channel);const end=Math.min(length,start+windowSize);for(let i=start;i<end;i++){sum+=samples[i]*samples[i];count++;}}
    levels.push(Math.sqrt(sum/Math.max(1,count)));
    if(onProgress&&levels.length%50===0)onProgress(Math.min(99,Math.round(start/length*100)));
   }
   const quietThreshold=.012,minFrames=7,gaps=[];let begin=-1;
   for(let i=0;i<=levels.length;i++){
    const quiet=i<levels.length&&levels[i]<quietThreshold;
    if(quiet&&begin<0)begin=i;
    if(!quiet&&begin>=0){const end=i,duration=(end-begin)*.05,startTime=begin*.05,endTime=end*.05;if(duration>=minFrames*.05&&startTime>.25&&endTime<buffer.duration-.25)gaps.push({start:Number(startTime.toFixed(2)),end:Number(endTime.toFixed(2)),midpoint:Number(((startTime+endTime)/2).toFixed(2))});begin=-1;}
   }
   asset.audioPauses=gaps;persist();return gaps;
  }finally{if(audioContext.close)await audioContext.close().catch(()=>{});}
 }
 async function detectAllQuietGaps(onProgress){
  const videos=Array.from(assets.values()).filter(a=>a.kind==='video');let total=0;
  for(let i=0;i<videos.length;i++){const gaps=await detectQuietGaps(videos[i].id,p=>onProgress&&onProgress(i,videos.length,p));total+=gaps.length;}
  return total;
 }
 function mount(container,api){
  host=container;bridge=api;const input=$('autoVideoInput'),add=$('autoVideoAdd'),run=$('autoVideoCut'),sceneButton=$('autoVideoScenes'),pauseButton=$('autoVideoPauses'),styleInput=$('autoVideoStyle'),power=$('autoVideoIntensity');
  if(add&&input)add.addEventListener('click',()=>input.click());
  if(input)input.addEventListener('change',async()=>{const files=input.files;input.value='';try{await addFiles(files);}catch(e){updateStatus(e.message);}});
  if(styleInput){styleInput.value=style;styleInput.addEventListener('change',()=>{style=PRESETS[styleInput.value]?styleInput.value:'social';persist();});}
  if(power){power.value=String(intensity);power.addEventListener('input',()=>{intensity=clamp(power.value,1,5);const label=$('autoVideoIntensityValue');if(label)label.textContent=String(intensity);persist();});}
  if(sceneButton)sceneButton.addEventListener('click',async()=>{try{sceneButton.disabled=true;const total=await detectAllScenes((i,n,p)=>updateStatus('Analysing scene changes · clip '+(i+1)+'/'+n+' · '+p+'%'));updateStatus('Scene analysis complete · '+total+' scene boundary/boundaries found. Create Auto Cut again to use them.');}catch(e){updateStatus(e.message);}finally{sceneButton.disabled=false;}});
  if(pauseButton)pauseButton.addEventListener('click',async()=>{try{pauseButton.disabled=true;const total=await detectAllQuietGaps((i,n,p)=>updateStatus('Analysing quiet audio gaps · clip '+(i+1)+'/'+n+' · '+p+'%'));updateStatus('Quiet-gap analysis complete · '+total+' gap(s) found. The next Auto Cut draft can use these as cut points.');}catch(e){updateStatus(e.message+' This is audio-level analysis, not speech recognition.');}finally{pauseButton.disabled=false;}});
  if(run)run.addEventListener('click',async()=>{try{let bpm=api.getBpm?api.getBpm():0;if(!bpm&&api.detectBpm){updateStatus('Analysing your uploaded song tempo…');try{const detected=await api.detectBpm(message=>updateStatus(message));bpm=detected&&detected.bpm;}catch(error){bpm=120;updateStatus('Tempo analysis unavailable; using the clearly marked 120 BPM fallback.');}}const result=generateAutoCut({bpm:bpm||120,musicDuration:api.getMusicDuration?api.getMusicDuration():0});updateStatus('Draft ready · '+result.count+' cuts · '+result.duration.toFixed(1)+' sec · '+result.bpm+' BPM. Press Play to preview with the music.');}catch(e){updateStatus(e.message);}});
  render();
 }
 function dispose(){assets.forEach(a=>{if(a.kind==='video')a.media.pause();URL.revokeObjectURL(a.media.src);});assets.clear();segments=[];}
 root.WaveForgeAutoVideo={mount,addFiles,generateAutoCut,move,splitSegment,removeSegment,setSpeedRamp,setTransition,detectScenes,detectAllScenes,detectQuietGaps,detectAllQuietGaps,sync,getMotion,getVisualEffect,getState,getSelectedSegment:()=>segments.find(s=>s.id===selected)||null,getSelectedSegmentId:()=>selected,selectSegment:segmentId=>{if(!segments.some(s=>s.id===segmentId))return false;selected=segmentId;render();return true;},restore,dispose,getDuration:totalDuration,getCount:()=>segments.length,PRESETS};if(typeof module!=='undefined'&&module.exports)module.exports=root.WaveForgeAutoVideo;
})(typeof window!=='undefined'?window:globalThis);
