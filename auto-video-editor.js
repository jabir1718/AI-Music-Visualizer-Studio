'use strict';
(function(root){
 const MAX_CLIPS=8,MAX_FILE=120*1024*1024,MAX_TOTAL=180*1024*1024,MAX_DURATION=180,MAX_SEGMENTS=300;
 const PRESETS={
  social:{label:'Fast social montage',beats:1},
  cinematic:{label:'Cinematic',beats:4},
  travel:{label:'Travel',beats:2},
  vlog:{label:'Vlog',beats:2},
  calm:{label:'Calm aesthetic',beats:4}
 };
 let host=null,bridge=null,assets=new Map(),segments=[],style='social',intensity=3,selected=null;
 const $=id=>host&&host.querySelector('#'+id);
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)||0));
 const id=()=> 'vclip-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7);
 function durationOf(asset){return Math.max(0,Number(asset&&asset.video&&asset.video.duration)||0);}
 function totalDuration(){return segments.reduce((m,s)=>Math.max(m,s.timelineStart+(s.sourceEnd-s.sourceStart)/Math.max(.1,s.rate||1)),0);}
 function relayout(){let t=0;segments.forEach(s=>{s.timelineStart=t;t+=(s.sourceEnd-s.sourceStart)/Math.max(.1,s.rate||1);});}
 function updateStatus(message){const out=$('autoVideoStatus');if(out)out.textContent=message;}
 function persist(){if(bridge&&bridge.onChange)bridge.onChange();}
 function render(){
  const list=$('autoVideoSegments');if(!list)return;
  list.innerHTML='';
  if(!assets.size){list.innerHTML='<p class="hint">Import up to 8 short video clips. Your original files stay untouched.</p>';}
  segments.forEach((segment,index)=>{
   const asset=assets.get(segment.assetId);if(!asset)return;
   const card=document.createElement('article');card.className='auto-video-clip'+(selected===segment.id?' selected':'');
   const top=document.createElement('div');top.className='auto-video-clip-head';
   const name=document.createElement('b');name.textContent=(index+1)+'. '+asset.name;
   const time=document.createElement('small');time.textContent=segment.timelineStart.toFixed(1)+'s · '+(segment.sourceEnd-segment.sourceStart).toFixed(1)+'s';
   top.append(name,time);card.append(top);
   const actions=document.createElement('div');actions.className='auto-video-clip-actions';
   [['↑',()=>move(index,-1),'Move earlier'],['↓',()=>move(index,1),'Move later'],['Remove',()=>removeSegment(segment.id),'Remove segment']].forEach(([label,fn,title])=>{const b=document.createElement('button');b.type='button';b.className='btn small';b.textContent=label;b.title=title;b.disabled=(label==='↑'&&index===0)||(label==='↓'&&index===segments.length-1);b.addEventListener('click',fn);actions.appendChild(b);});
   card.append(actions);
   const trim=document.createElement('label');trim.className='auto-video-trim';const trimText=document.createElement('span');trimText.textContent='Segment length · '+(segment.sourceEnd-segment.sourceStart).toFixed(1)+' sec';
   const range=document.createElement('input');range.type='range';range.min='.2';range.max=Math.max(.2,Math.min(20,segment.sourceEnd-segment.sourceStart));range.step='.1';range.value=Math.max(.2,segment.sourceEnd-segment.sourceStart);
   range.addEventListener('input',()=>{const len=clamp(range.value,.2,Math.max(.2,segment.sourceEnd-segment.sourceStart));segment.sourceEnd=segment.sourceStart+len;trimText.textContent='Segment length · '+len.toFixed(1)+' sec';relayout();persist();});
   trim.append(trimText,range);card.append(trim);list.appendChild(card);
  });
  const count=$('autoVideoCount');if(count)count.textContent=segments.length+' editable segment(s) · '+totalDuration().toFixed(1)+' sec';
 }
 function createVideo(file){
  const video=document.createElement('video');video.muted=true;video.playsInline=true;video.preload='metadata';video.setAttribute('playsinline','');video.src=URL.createObjectURL(file);
  return new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>reject(new Error('Video metadata took too long. Try a shorter or supported MP4 video.')),15000);
   video.onloadedmetadata=()=>{clearTimeout(timer);if(!Number.isFinite(video.duration)||video.duration<=0||video.duration>MAX_DURATION){URL.revokeObjectURL(video.src);reject(new Error('Each video must be 1–180 seconds long.'));return;}resolve(video);};
   video.onerror=()=>{clearTimeout(timer);URL.revokeObjectURL(video.src);reject(new Error('This video codec is not supported by your phone browser. Try MP4/H.264.'));};
   video.load();
  });
 }
 async function addFiles(fileList){
  const files=Array.from(fileList||[]).filter(f=>f&&f.type.startsWith('video/'));
  if(!files.length)throw new Error('Choose one or more video files.');
  if(assets.size+files.length>MAX_CLIPS)throw new Error('Maximum 8 source videos per project.');
  let bytes=Array.from(assets.values()).reduce((n,a)=>n+a.size,0);
  for(const file of files){
   if(file.size>MAX_FILE)throw new Error(file.name+' is larger than 200 MB.');
   if(bytes+file.size>MAX_TOTAL)throw new Error('Video sources are limited to 600 MB total to protect phone storage.');
   const assetId=id(),video=await createVideo(file);
   const saved=await bridge.saveMediaAsset(assetId,file);
   if(!saved){URL.revokeObjectURL(video.src);throw new Error('Could not save '+file.name+' to local project storage.');}
   assets.set(assetId,{id:assetId,name:file.name,type:file.type,size:file.size,video});
   const d=durationOf(assets.get(assetId));
   segments.push({id:id(),assetId,sourceStart:0,sourceEnd:d,timelineStart:0,rate:1});
   bytes+=file.size;
  }
  relayout();render();updateStatus('Imported '+files.length+' video(s). Your source files are stored locally.');persist();return segments.length;
 }
 function move(index,delta){const next=index+delta;if(next<0||next>=segments.length)return;[segments[index],segments[next]]=[segments[next],segments[index]];relayout();render();persist();}
 function removeSegment(segmentId){segments=segments.filter(s=>s.id!==segmentId);relayout();render();persist();}
 function generateAutoCut(options={}){
  if(!assets.size)throw new Error('Import video clips first.');
  const bpm=clamp(options.bpm||120,30,240),beat=60/bpm,preset=PRESETS[style]||PRESETS.social;
  const beatsPerCut=Math.max(.5,preset.beats*(1.2-intensity*.15)),totalSource=Array.from(assets.values()).reduce((n,a)=>n+durationOf(a),0),cutLength=Math.max(.35,beat*beatsPerCut,totalSource/300);
  const sources=Array.from(assets.values()),cursors=sources.map(()=>0),out=[];let active=0,guard=0;
  while(guard++<1200&&out.length<MAX_SEGMENTS){
   let found=-1;for(let k=0;k<sources.length;k++){const ix=(active+k)%sources.length;if(cursors[ix]<durationOf(sources[ix])-.15){found=ix;break;}}
   if(found<0)break;
   const source=sources[found],start=cursors[found],end=Math.min(durationOf(source),start+cutLength);
   if(end-start>=.2){out.push({id:id(),assetId:source.id,sourceStart:start,sourceEnd:end,timelineStart:0,rate:1});cursors[found]=end;}
   else cursors[found]=durationOf(source);
   active=(found+1)%sources.length;
  }
  if(!out.length)throw new Error('No usable video segments were found.');
  segments=out;relayout();selected=segments[0].id;render();
  updateStatus(PRESETS[style].label+' draft created · '+bpm+' BPM · cuts about '+cutLength.toFixed(2)+' sec. Review and edit every segment.');
  persist();return{count:segments.length,duration:totalDuration(),cutLength,bpm,style};
 }
 function sync(time,isPlaying){
  let active=segments.find(s=>time>=s.timelineStart&&time<s.timelineStart+(s.sourceEnd-s.sourceStart)/Math.max(.1,s.rate||1));
  assets.forEach(asset=>{if(!active||asset.id!==active.assetId){if(!asset.video.paused)asset.video.pause();}});
  if(!active)return null;
  const asset=assets.get(active.assetId);if(!asset)return null;
  const video=asset.video,expected=active.sourceStart+(time-active.timelineStart)*(active.rate||1);
  if(Number.isFinite(expected)&&Math.abs(video.currentTime-expected)>.28){try{video.currentTime=clamp(expected,active.sourceStart,Math.max(active.sourceStart,active.sourceEnd-.03));}catch(e){}}
  if(isPlaying&&video.paused)video.play().catch(()=>{});
  if(!isPlaying&&!video.paused)video.pause();
  return video.readyState>=2&&video.videoWidth?video:null;
 }
 function getState(){return{style,intensity,assets:Array.from(assets.values()).map(({id,name,type,size})=>({id,name,type,size})),segments:segments.map(s=>({...s}))};}
 async function restore(state){
  if(!state||!Array.isArray(state.assets)||!state.assets.length)return 0;
  style=PRESETS[state.style]?state.style:'social';intensity=clamp(state.intensity||3,1,5);
  for(const meta of state.assets.slice(0,MAX_CLIPS)){
   const stored=await bridge.getMediaAsset(meta.id);if(!stored||!stored.blob)continue;
   const file=new File([stored.blob],meta.name||'Restored video.mp4',{type:meta.type||stored.type||'video/mp4'});
   try{const video=await createVideo(file);assets.set(meta.id,{...meta,size:file.size,video});}catch(e){}
  }
  segments=(Array.isArray(state.segments)?state.segments:[]).filter(s=>assets.has(s.assetId)&&Number.isFinite(s.sourceStart)&&Number.isFinite(s.sourceEnd)&&s.sourceEnd>s.sourceStart).slice(0,300).map(s=>({...s,rate:clamp(s.rate||1,.5,2)}));
  relayout();render();return assets.size;
 }
 function mount(container,api){
  host=container;bridge=api;
  const input=$('autoVideoInput'),add=$('autoVideoAdd'),run=$('autoVideoCut'),styleInput=$('autoVideoStyle'),power=$('autoVideoIntensity');
  if(add&&input)add.addEventListener('click',()=>input.click());
  if(input)input.addEventListener('change',async()=>{const files=input.files;input.value='';try{await addFiles(files);}catch(e){updateStatus(e.message);}});
  if(styleInput){styleInput.value=style;styleInput.addEventListener('change',()=>{style=PRESETS[styleInput.value]?styleInput.value:'social';persist();});}
  if(power){power.value=String(intensity);power.addEventListener('input',()=>{intensity=clamp(power.value,1,5);const label=$('autoVideoIntensityValue');if(label)label.textContent=String(intensity);persist();});}
  if(run)run.addEventListener('click',()=>{try{const result=generateAutoCut({bpm:api.getBpm()});updateStatus('Draft ready · '+result.count+' cuts · '+result.duration.toFixed(1)+' sec. Press Play to preview with the music.');}catch(e){updateStatus(e.message);}});
  render();
 }
 function dispose(){assets.forEach(a=>{a.video.pause();URL.revokeObjectURL(a.video.src);});assets.clear();segments=[];}
 root.WaveForgeAutoVideo={mount,addFiles,generateAutoCut,move,removeSegment,sync,getState,restore,dispose,getDuration:totalDuration,getCount:()=>segments.length,PRESETS};
 if(typeof module!=='undefined'&&module.exports)module.exports=root.WaveForgeAutoVideo;
})(typeof window!=='undefined'?window:globalThis);
