(function(root){
'use strict';
const LABEL=136;
function clipLayout(layer,totalDuration,pixelsPerSecond){
 const duration=Math.max(0,Number(layer&&layer.audio&&layer.audio.duration)||0);
 const trimStart=Math.max(0,Number(layer&&layer.trimStart)||0);
 const requestedEnd=Math.max(0,Number(layer&&layer.trimEnd)||0);
 const trimEnd=requestedEnd>trimStart?Math.min(duration||requestedEnd,requestedEnd):duration;
 const span=Math.max(0,trimEnd-trimStart);
 const offset=Math.max(0,Number(layer&&layer.offset)||0);
 const pps=Math.max(1,Number(pixelsPerSecond)||40);
 return{left:offset*pps,width:span*pps,start:offset,end:offset+span,span,trimStart,trimEnd};
}
function formatTime(value){
 const s=Math.max(0,Number(value)||0),m=Math.floor(s/60),sec=Math.floor(s%60);
 return String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0');
}
function mount(host,before,options={}){
 if(!host||!root.document)return null;
 const existing=root.document.getElementById('visualTimelineEditor');if(existing)return existing.__api;
 const panel=root.document.createElement('section');panel.id='visualTimelineEditor';panel.className='visual-timeline-editor';
 panel.innerHTML='<div class="wf-timeline-head"><div><span class="eyebrow">MULTI-TRACK ARRANGEMENT</span><h3>Audio timeline</h3><p>Drag each imported clip left or right to set its start time. Tap an empty lane to move the song playhead.</p></div><label class="wf-timeline-zoom">Zoom <output id="wfTimelineZoomValue">40 px/s</output><input id="wfTimelineZoom" type="range" min="12" max="100" step="4" value="40"></label></div><div class="wf-timeline-scroll" id="wfTimelineScroll"><div class="wf-timeline-stage" id="wfTimelineStage"><div class="wf-timeline-ruler-row"><div class="wf-timeline-label">TRACK</div><div class="wf-timeline-ruler" id="wfTimelineRuler"></div></div><div id="wfTimelineRows"></div><div class="wf-timeline-playhead" id="wfTimelinePlayhead"><span id="wfTimelinePlayheadLabel">00:00</span></div></div></div><div class="wf-timeline-foot"><span id="wfTimelineDuration">No audio loaded</span><span>Drag clips to arrange · Tap lane to seek</span></div>';
 host.insertBefore(panel,before||null);
 const $=id=>panel.querySelector('#'+id),zoom=$('wfTimelineZoom'),scroll=$('wfTimelineScroll'),stage=$('wfTimelineStage'),rows=$('wfTimelineRows'),ruler=$('wfTimelineRuler');
 let pps=40,disposed=false;
 const opts=options;
 function getLayers(){return typeof opts.getLayers==='function'?opts.getLayers():[];}
 function mainDuration(){return Math.max(0,Number(opts.getMainDuration&&opts.getMainDuration())||0);}
 function totalDuration(){
  const main=mainDuration(),layers=getLayers();
  const end=layers.reduce((max,l)=>{const b=clipLayout(l,0,1);return Math.max(max,b.end);},0);
  return Math.max(30,main,end+5);
 }
 function seekAt(event,lane){
  const rect=lane.getBoundingClientRect(),time=Math.max(0,(event.clientX-rect.left)/pps);
  if(typeof opts.onSeek==='function')opts.onSeek(Math.min(mainDuration()||time,time));
 }
 function updatePlayhead(){
  const time=Math.max(0,Number(opts.getCurrentTime&&opts.getCurrentTime())||0);
  const line=$('wfTimelinePlayhead'),label=$('wfTimelinePlayheadLabel');
  line.style.left=(LABEL+time*pps)+'px';label.textContent=formatTime(time);
 }
 function render(){
  if(disposed)return;
  pps=Number(zoom.value)||40;
  const duration=totalDuration(),width=Math.max(620,duration*pps);
  stage.style.width=(LABEL+width)+'px';$('wfTimelineZoomValue').textContent=pps+' px/s';
  $('wfTimelineDuration').textContent=(mainDuration()?formatTime(mainDuration()):'Main track not loaded')+' · '+getLayers().length+' extra layer(s)';
  ruler.style.width=width+'px';ruler.innerHTML='';
  const tickStep=pps>=60?2:pps>=28?5:10;
  for(let t=0;t<=duration;t+=tickStep){
   const tick=root.document.createElement('span');tick.className='wf-timeline-tick';tick.style.left=(t*pps)+'px';tick.textContent=formatTime(t);ruler.appendChild(tick);
  }
  rows.innerHTML='';
  const main=root.document.createElement('div');main.className='wf-timeline-row';
  const mainLabel=root.document.createElement('div');mainLabel.className='wf-timeline-label';mainLabel.textContent='♫ '+(opts.getMainName&&opts.getMainName()||'Background music');
  const mainLane=root.document.createElement('div');mainLane.className='wf-timeline-lane';mainLane.style.width=width+'px';
  const mainClip=root.document.createElement('div');mainClip.className='wf-timeline-clip main';mainClip.style.left='0px';mainClip.style.width=Math.max(20,mainDuration()*pps)+'px';mainClip.textContent='MAIN AUDIO';mainLane.appendChild(mainClip);
  mainLane.addEventListener('click',e=>{if(e.target===mainLane)seekAt(e,mainLane);});
  main.append(mainLabel,mainLane);rows.appendChild(main);
  getLayers().forEach((layer,index)=>{
   const row=root.document.createElement('div');row.className='wf-timeline-row';
   const label=root.document.createElement('div');label.className='wf-timeline-label';label.textContent=(layer.role||'Layer')+' '+(index+1);
   label.title=layer.file&&layer.file.name||layer.role||'Audio layer';
   const lane=root.document.createElement('div');lane.className='wf-timeline-lane';lane.style.width=width+'px';
   const clip=root.document.createElement('button');clip.type='button';clip.className='wf-timeline-clip';clip.textContent=(layer.file&&layer.file.name)||('Audio layer '+(index+1));clip.title='Drag to move clip start time';clip.style.left=(Math.max(0,Number(layer.offset)||0)*pps)+'px';
   const layout=clipLayout(layer,duration,pps);clip.style.width=Math.max(24,layout.width)+'px';clip.dataset.layerId=layer.id;
   let pointerStart=0,offsetStart=0,dragging=false;
   clip.addEventListener('pointerdown',e=>{if(e.button!==undefined&&e.button!==0)return;dragging=true;pointerStart=e.clientX;offsetStart=Math.max(0,Number(layer.offset)||0);clip.classList.add('dragging');clip.setPointerCapture&&clip.setPointerCapture(e.pointerId);e.preventDefault();});
   clip.addEventListener('pointermove',e=>{if(!dragging)return;const next=Math.max(0,offsetStart+(e.clientX-pointerStart)/pps);clip.style.left=(next*pps)+'px';});
   const finish=e=>{if(!dragging)return;dragging=false;clip.classList.remove('dragging');const next=Math.max(0,offsetStart+(e.clientX-pointerStart)/pps);if(Math.abs(next-offsetStart)>.015&&typeof opts.onMove==='function')opts.onMove(layer,Math.round(next*1000)/1000);};
   clip.addEventListener('pointerup',finish);clip.addEventListener('pointercancel',finish);
   lane.addEventListener('click',e=>{if(e.target===lane)seekAt(e,lane);});
   lane.appendChild(clip);row.append(label,lane);rows.appendChild(row);
  });
  updatePlayhead();
 }
 zoom.addEventListener('input',render);
 if(opts.audioElement){
  ['timeupdate','durationchange','seeked','loadedmetadata'].forEach(event=>opts.audioElement.addEventListener(event,updatePlayhead));
 }
 const api={render,updatePlayhead,dispose(){disposed=true;if(opts.audioElement)['timeupdate','durationchange','seeked','loadedmetadata'].forEach(event=>opts.audioElement.removeEventListener(event,updatePlayhead));panel.remove();}};
 panel.__api=api;render();return api;
}
const api={clipLayout,formatTime,mount};
root.WaveForgeTimelineView=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
