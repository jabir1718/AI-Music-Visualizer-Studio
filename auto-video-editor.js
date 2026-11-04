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
 function totalDuration(){return segments.reduce((m,s)=>Math.max(m,s.timelineStart+(s.sourceEnd-s.sourceStart)/Math.max(.1,s.rate||1)),0);}
 function relayout(){let t=0;segments.forEach(s=>{s.timelineStart=t;t+=(s.sourceEnd-s.sourceStart)/Math.max(.1,s.rate||1);});}
 function updateStatus(message){const out=$('autoVideoStatus');if(out)out.textContent=message;}
 function persist(){if(bridge&&bridge.onChange)bridge.onChange();}
 function render(){
  const list=$('autoVideoSegments');if(!list)return;list.innerHTML='';
  if(!assets.size){list.innerHTML='<p class="hint">Import photos and/or short video clips. Your original files stay untouched.</p>';}
  segments.forEach((segment,index)=>{
   const asset=assets.get(segment.assetId);if(!asset)return;
   const card=document.createElement('article');card.className='auto-video-clip'+(selected===segment.id?' selected':'');
   const top=document.createElement('div');top.className='auto-video-clip-head';
   const name=document.createElement('b');name.textContent=(index+1)+'. '+(isPhoto(asset)?'PHOTO · ':'VIDEO · ')+asset.name;
   const time=document.createElement('small');time.textContent=segment.timelineStart.toFixed(1)+'s · '+(segment.sourceEnd-segment.sourceStart).toFixed(1)+'s';
   top.append(name,time);card.append(top);
   const actions=document.createElement('div');actions.className='auto-video-clip-actions';
   [['↑',()=>move(index,-1),'Move earlier'],['↓',()=>move(index,1),'Move later'],['Split',()=>splitSegment(segment.id),'Split at midpoint'],['Remove',()=>removeSegment(segment.id),'Remove segment']].forEach(([label,fn,title])=>{const b=document.createElement('button');b.type='button';b.className='btn small';b.textContent=label;b.title=title;b.disabled=(label==='↑'&&index===0)||(label==='↓'&&index===segments.length-1);b.addEventListener('click',fn);actions.appendChild(b);});
   card.append(actions);
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
   const asset={id:assetId,name:file.name,type:file.type,size:file.size,kind:photo?'image':'video',media,virtualDuration:0};
   assets.set(assetId,asset);if(!photo)segments.push({id:id(),assetId,sourceStart:0,sourceEnd:durationOf(asset),timelineStart:0,rate:1});
   bytes+=file.size;
  }
  relayout();render();updateStatus('Imported '+newPhotos+' photo(s) and '+newVideos+' video(s). Original files are stored locally.');persist();return assets.size;
 }
 function move(index,delta){const next=index+delta;if(next<0||next>=segments.length)return;[segments[index],segments[next]]=[segments[next],segments[index]];relayout();render();persist();}
 function splitSegment(segmentId){const index=segments.findIndex(s=>s.id===segmentId);if(index<0||segments.length>=MAX_SEGMENTS)return false;const source=segments[index],mid=(source.sourceStart+source.sourceEnd)/2;if(mid-source.sourceStart<.1||source.sourceEnd-mid<.1)return false;const first={...source,id:id(),sourceEnd:mid},second={...source,id:id(),sourceStart:mid};segments.splice(index,1,first,second);relayout();selected=first.id;render();persist();return true;}
 function removeSegment(segmentId){segments=segments.filter(s=>s.id!==segmentId);relayout();render();persist();}
 function generateAutoCut(options={}){
  if(!assets.size)throw new Error('Import photos or videos first.');
  const bpm=clamp(options.bpm||120,30,240),beat=60/bpm,preset=PRESETS[style]||PRESETS.social;
  const beatsPerCut=Math.max(.5,preset.beats*(1.2-intensity*.15)),cutLength=Math.max(.35,beat*beatsPerCut);
  const photos=Array.from(assets.values()).filter(isPhoto),videos=Array.from(assets.values()).filter(a=>!isPhoto(a));
  const musicDuration=clamp(options.musicDuration||0,0,3600);
  if(photos.length){const target=musicDuration>0?musicDuration:Math.max(photos.length*3,3);photos.forEach(p=>p.virtualDuration=target/photos.length);}
  const sources=[...videos,...photos];if(preset.mode==='round')sources.sort((a,b)=>a.id.localeCompare(b.id));
  const cursors=sources.map(()=>0),out=[];let active=0,guard=0;
  const totalSource=sources.reduce((n,a)=>n+durationOf(a),0),videoDuration=videos.reduce((n,a)=>n+durationOf(a),0),targetDuration=musicDuration>0?(photos.length?musicDuration:Math.min(musicDuration,videoDuration)):totalSource;
  while(guard++<1800&&out.length<MAX_SEGMENTS&&totalDurationFor(out)<targetDuration-.1){
   let found=-1;for(let k=0;k<sources.length;k++){const ix=(active+k)%sources.length;if(cursors[ix]<durationOf(sources[ix])-.12){found=ix;break;}}
   if(found<0)break;
   const source=sources[found],start=cursors[found],remaining=durationOf(source)-start,remainingTimeline=targetDuration-totalDurationFor(out),end=Math.min(durationOf(source),start+cutLength,start+remainingTimeline);
   if(end-start>=.2){out.push({id:id(),assetId:source.id,sourceStart:start,sourceEnd:end,timelineStart:0,rate:1});cursors[found]=end;}else cursors[found]=durationOf(source);
   active=preset.mode==='sequence'?(found+1)%sources.length:(found+1)%sources.length;
  }
  if(!out.length)throw new Error('No usable media segments were found.');
  if(photos.length&&musicDuration>0&&totalDurationFor(out)<targetDuration-.15){let i=0;while(totalDurationFor(out)<targetDuration-.15&&out.length<MAX_SEGMENTS){const p=photos[i++%photos.length],start=0,end=Math.min(durationOf(p),cutLength,targetDuration-totalDurationFor(out));out.push({id:id(),assetId:p.id,sourceStart:start,sourceEnd:end,timelineStart:0,rate:1});}}
  segments=out;relayout();selected=segments[0].id;render();
  updateStatus(preset.label+' draft · '+bpm+' BPM · '+out.length+' editable cuts. Review before export.');
  persist();return{count:segments.length,duration:totalDuration(),cutLength,bpm,style,photoCount:photos.length,videoCount:videos.length};
 }
 function totalDurationFor(list){return list.reduce((n,s)=>n+(s.sourceEnd-s.sourceStart)/Math.max(.1,s.rate||1),0);}
 function sync(time,isPlaying){
  const active=segments.find(s=>time>=s.timelineStart&&time<s.timelineStart+(s.sourceEnd-s.sourceStart)/Math.max(.1,s.rate||1));
  assets.forEach(asset=>{if(asset.kind==='video'&&(!active||asset.id!==active.assetId)&&!asset.media.paused)asset.media.pause();});
  if(!active)return null;const asset=assets.get(active.assetId);if(!asset)return null;
  if(isPhoto(asset))return asset.media;
  const video=asset.media,expected=active.sourceStart+(time-active.timelineStart)*(active.rate||1);
  if(Number.isFinite(expected)&&Math.abs(video.currentTime-expected)>.28){try{video.currentTime=clamp(expected,active.sourceStart,Math.max(active.sourceStart,active.sourceEnd-.03));}catch(e){}}
  if(isPlaying&&video.paused)video.play().catch(()=>{});if(!isPlaying&&!video.paused)video.pause();return video.readyState>=2&&video.videoWidth?video:null;
 }
 function getMotion(time){
  const active=segments.find(s=>time>=s.timelineStart&&time<s.timelineStart+(s.sourceEnd-s.sourceStart)/Math.max(.1,s.rate||1));
  if(!active)return{scale:1,x:0,y:0};const asset=assets.get(active.assetId);if(!isPhoto(asset))return{scale:1,x:0,y:0};
  const progress=clamp((time-active.timelineStart)/Math.max(.2,active.sourceEnd-active.sourceStart),0,1),motion=(PRESETS[style]||PRESETS.social).motion;
  const scale=motion==='slow'?1.08+progress*.10:motion==='pulse'?1.04+Math.sin(progress*Math.PI)*.10:motion==='pan'?1.04+progress*.04:motion==='flash'?1.01+progress*.02:1.06+progress*.12;
  return{scale,x:(progress-.5)*(motion==='pan'?.06:.018),y:(.5-progress)*(motion==='pan'?.04:.012),flash:motion==='flash'&&progress<.12?(1-progress/.12)*.22:0};
 }
 function getState(){return{style,intensity,assets:Array.from(assets.values()).map(({id,name,type,size,kind,virtualDuration})=>({id,name,type,size,kind,virtualDuration})),segments:segments.map(s=>({...s}))};}
 async function restore(state){
  if(!state||!Array.isArray(state.assets)||!state.assets.length)return 0;
  style=PRESETS[state.style]?state.style:'social';intensity=clamp(state.intensity||3,1,5);
  for(const meta of state.assets.slice(0,MAX_VIDEO+MAX_PHOTO)){
   const stored=await bridge.getMediaAsset(meta.id);if(!stored||!stored.blob)continue;
   const type=meta.type||stored.type||'',photo=(meta.kind==='image'||type.startsWith('image/'));
   const file=new File([stored.blob],meta.name|| (photo?'Restored photo.jpg':'Restored video.mp4'),{type:type||(photo?'image/jpeg':'video/mp4')});
   try{const media=photo?await createImage(file):await createVideo(file);assets.set(meta.id,{...meta,kind:photo?'image':'video',virtualDuration:Number(meta.virtualDuration)||0,size:file.size,media});}catch(e){}
  }
  segments=(Array.isArray(state.segments)?state.segments:[]).filter(s=>assets.has(s.assetId)&&Number.isFinite(s.sourceStart)&&Number.isFinite(s.sourceEnd)&&s.sourceEnd>s.sourceStart).slice(0,MAX_SEGMENTS).map(s=>({...s,rate:clamp(s.rate||1,.5,2)}));
  relayout();render();return assets.size;
 }
 function mount(container,api){
  host=container;bridge=api;const input=$('autoVideoInput'),add=$('autoVideoAdd'),run=$('autoVideoCut'),styleInput=$('autoVideoStyle'),power=$('autoVideoIntensity');
  if(add&&input)add.addEventListener('click',()=>input.click());
  if(input)input.addEventListener('change',async()=>{const files=input.files;input.value='';try{await addFiles(files);}catch(e){updateStatus(e.message);}});
  if(styleInput){styleInput.value=style;styleInput.addEventListener('change',()=>{style=PRESETS[styleInput.value]?styleInput.value:'social';persist();});}
  if(power){power.value=String(intensity);power.addEventListener('input',()=>{intensity=clamp(power.value,1,5);const label=$('autoVideoIntensityValue');if(label)label.textContent=String(intensity);persist();});}
  if(run)run.addEventListener('click',async()=>{try{let bpm=api.getBpm?api.getBpm():0;if(!bpm&&api.detectBpm){updateStatus('Analysing your uploaded song tempo…');try{const detected=await api.detectBpm(message=>updateStatus(message));bpm=detected&&detected.bpm;}catch(error){bpm=120;updateStatus('Tempo analysis unavailable; using the clearly marked 120 BPM fallback.');}}const result=generateAutoCut({bpm:bpm||120,musicDuration:api.getMusicDuration?api.getMusicDuration():0});updateStatus('Draft ready · '+result.count+' cuts · '+result.duration.toFixed(1)+' sec · '+result.bpm+' BPM. Press Play to preview with the music.');}catch(e){updateStatus(e.message);}});
  render();
 }
 function dispose(){assets.forEach(a=>{if(a.kind==='video')a.media.pause();URL.revokeObjectURL(a.media.src);});assets.clear();segments=[];}
 root.WaveForgeAutoVideo={mount,addFiles,generateAutoCut,move,splitSegment,removeSegment,sync,getMotion,getState,restore,dispose,getDuration:totalDuration,getCount:()=>segments.length,PRESETS};if(typeof module!=='undefined'&&module.exports)module.exports=root.WaveForgeAutoVideo;
})(typeof window!=='undefined'?window:globalThis);
