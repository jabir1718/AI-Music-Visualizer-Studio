(function(){
'use strict';
function init(){
 const editor=document.querySelector('.editor'),stageWrap=editor&&editor.querySelector('.stage-wrap');
 if(!editor||!stageWrap||document.getElementById('wfDashboard'))return;
 const panels=Array.from(editor.querySelectorAll(':scope > .panel'));
 const inspector=document.querySelector('.inspector');
 const panelMap=new Map(panels.map(p=>[p.id,p]));
 const dashboard=document.createElement('div');dashboard.id='wfDashboard';dashboard.className='wf-dashboard';
 const hero=document.createElement('div');hero.className='wf-hero';
 const heroTop=document.createElement('div');heroTop.className='wf-hero-top';
 heroTop.innerHTML='<div><span class="wf-kicker">NOW CREATING</span><strong id="wfProjectName">My Music Project</strong></div><span class="wf-project-badge"><i></i> LOCAL PROJECT</span>';
 const projectInfo=document.createElement('div');projectInfo.className='wf-project-info';
 projectInfo.innerHTML='<span><b id="wfDuration">00:00</b><small>DURATION</small></span><span><b id="wfResolution">1080P</b><small>QUALITY</small></span><span><b>9:16</b><small>CANVAS</small></span>';
 hero.append(heroTop,stageWrap,projectInfo);
 const timeline=document.createElement('section');timeline.className='wf-timeline';
 timeline.innerHTML='<div class="wf-timeline-head"><div><span class="wf-kicker">EDIT TIMELINE</span><b>Project layers</b></div><span class="wf-timeline-hint">Tap a tool below to edit</span></div><div class="wf-transport"><span class="wf-time-readout" id="wfTimeReadout">00:00 / 00:00</span><span class="wf-transport-spacer"></span><span class="wf-transport-label">PLAYBACK</span></div><div class="wf-audio-lane"><span class="wf-audio-icon">♫</span><div class="wf-audio-lane-main"><b id="wfAudioName">My Music Track</b><div class="wf-waveform" aria-hidden="true"></div></div><span class="wf-audio-lane-end">♫</span></div>';
 const toolSection=document.createElement('section');toolSection.className='wf-tools-section';
 toolSection.innerHTML='<div class="wf-section-title"><div><span class="wf-kicker">YOUR CREATIVE TOOLKIT</span><b>Studio tools</b></div><span>14 TOOLS</span></div><div class="wf-tool-grid" id="wfToolGrid"></div>';
 const bottom=document.createElement('nav');bottom.className='wf-bottom-dock';bottom.setAttribute('aria-label','Main navigation');
 bottom.innerHTML='<button type="button" data-dock="project"><span>▰</span><b>Project</b></button><button type="button" data-dock="timeline"><span>▤</span><b>Timeline</b></button><button type="button" class="wf-dock-play" data-dock="play" aria-label="Play"><span>▶</span></button><button type="button" data-dock="preview"><span>◉</span><b>Preview</b></button><button type="button" data-dock="settings"><span>⚙</span><b>Settings</b></button>';
 const modal=document.createElement('div');modal.className='wf-tool-modal';modal.id='wfToolModal';modal.hidden=true;
 modal.innerHTML='<div class="wf-modal-backdrop" data-close="1"></div><section class="wf-modal-sheet" role="dialog" aria-modal="true" aria-labelledby="wfModalTitle"><header class="wf-modal-head"><div><span class="wf-kicker">WAVEFORGE STUDIO</span><h2 id="wfModalTitle">Tool</h2></div><button type="button" class="wf-modal-close" data-close="1" aria-label="Close">×</button></header><div class="wf-modal-preview"><span class="wf-modal-orb">✦</span><div><small>QUICK PREVIEW</small><b id="wfModalPreviewTitle">Selected tool</b><span id="wfModalPreviewText">Your controls are ready.</span></div></div><div class="wf-modal-tabs" id="wfModalTabs"></div><div class="wf-modal-content" id="wfModalContent"></div></section>';
 editor.insertBefore(dashboard,stageWrap);
 dashboard.append(hero,timeline,toolSection);
 editor.append(bottom,modal);
 const audioPanel=panelMap.get('audioPanel');
 if(audioPanel){
  const row=audioPanel.querySelector('.track-row'),seek=audioPanel.querySelector('#seekBar');
  const transport=timeline.querySelector('.wf-transport');
  if(row){row.classList.add('wf-dashboard-track-row');transport.append(row.querySelector('#playBtn'),row.querySelector('#timeLabel'));const name=row.querySelector('#trackName');if(name){const sync=()=>timeline.querySelector('#wfAudioName').textContent=name.textContent;new MutationObserver(sync).observe(name,{childList:true,subtree:true,characterData:true});sync();}}
  if(seek){seek.classList.add('wf-dashboard-seek');timeline.append(seek);}
 }
 const tools=[
  ['audioPanel','♫','Music & Audio','Mix vocals, ad-libs, instruments, effects and audio layers.'],
  ['visualPanel','◇','Visuals & 3D','Visualizer styles, colors, filters and 3D objects.'],
  ['overlayPanel','T','Text & Art','Titles, logos, artwork layers and overlays.'],
  ['captionPanel','♬','Lyrics','Generate, import, sync and style lyrics.'],
  ['autoVideoPanel','✂','Auto Cut','Build beat-synced photo and video montages.'],
  ['offlineEditPanel','✧','AI Assistant','Preview supported quick edits with the offline helper.'],
  ['filterStudio','◉','Effects','Open available visual filters and effect controls.'],
  ['transitionTools','⇄','Transitions','Clip transition controls when available in Auto Cut.'],
  ['speedTools','◴','Speed & Motion','Clip timing, speed ramps and motion tools.'],
  ['stickerTools','☻','Stickers','Symbols and artwork elements.'],
  ['overlayTools','▱','Overlay','Independent image and text artwork layers.'],
  ['colorTools','◍','Colors','Visualizer and artwork color controls.'],
  ['riskPanel','▦','More Tools','Project checks and additional studio utilities.'],
  ['wfExportPanel','⇧','Export','Resolution, format and render settings.']
 ];
 const grid=toolSection.querySelector('#wfToolGrid');
 const descriptions=new Map(tools.map(t=>[t[0],t[3]]));
 function panelFor(id){
  if(id==='filterStudio')return editor.querySelector('#filterStudio')?.closest('.panel')||panelMap.get('visualPanel');
  if(id==='transitionTools'||id==='speedTools')return panelMap.get('autoVideoPanel');
  if(id==='stickerTools'||id==='overlayTools')return panelMap.get('overlayPanel');
  if(id==='colorTools')return panelMap.get('visualPanel');
  return id==='wfExportPanel'?exportPanel:panelMap.get(id);
 }
 let exportPanel=null;
 if(inspector){
  exportPanel=document.createElement('section');exportPanel.id='wfExportPanel';exportPanel.className='panel wf-export-panel';
  while(inspector.firstChild)exportPanel.append(inspector.firstChild);
  panels.push(exportPanel);panelMap.set('wfExportPanel',exportPanel);
  inspector.remove();
 }
 tools.forEach(([id,icon,label,desc])=>{
  const p=panelFor(id);if(!p)return;
  const b=document.createElement('button');b.type='button';b.className='wf-tool-card';b.dataset.tool=id;
  b.innerHTML='<span class="wf-tool-card-icon">'+icon+'</span><b>'+label+'</b><small>'+desc+'</small>';
  b.addEventListener('click',()=>openTool(id,label,desc,p));grid.append(b);
 });
 const available=Array.from(new Set(tools.map(t=>panelFor(t[0])).filter(Boolean)));
 panels.forEach(p=>{p.hidden=true;p.classList.add('wf-modal-panel');});
 if(exportPanel)exportPanel.hidden=true;
 function openTool(id,label,desc,p){
  if(!p)return;
  modal.hidden=false;document.body.classList.add('wf-modal-open');
  modal.querySelector('#wfModalTitle').textContent=label;
  modal.querySelector('#wfModalPreviewTitle').textContent=label;
  modal.querySelector('#wfModalPreviewText').textContent=desc;
  const tabs=modal.querySelector('#wfModalTabs');tabs.replaceChildren();
  const related=tools.filter(t=>panelFor(t[0])===p);
  related.forEach(t=>{const tab=document.createElement('button');tab.type='button';tab.textContent=t[2];tab.className=t[0]===id?'active':'';tab.addEventListener('click',()=>{modal.querySelector('#wfModalTitle').textContent=t[2];modal.querySelector('#wfModalPreviewTitle').textContent=t[2];modal.querySelector('#wfModalPreviewText').textContent=t[3];tabs.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===tab));});tabs.append(tab);});
  const host=modal.querySelector('#wfModalContent');host.replaceChildren();host.append(p);p.hidden=false;
  modal.querySelector('.wf-modal-sheet').scrollTop=0;
 }
 function close(){modal.hidden=true;document.body.classList.remove('wf-modal-open');modal.querySelectorAll('.wf-modal-content>.panel').forEach(p=>p.hidden=true);}
 modal.addEventListener('click',e=>{if(e.target.closest('[data-close]'))close();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden)close();});
 bottom.addEventListener('click',e=>{
  const b=e.target.closest('[data-dock]');if(!b)return;
  const a=b.dataset.dock;
  if(a==='play')document.getElementById('playBtn')?.click();
  if(a==='project')openTool('riskPanel','Project','Project checks and local project information.',panelMap.get('riskPanel'));
  if(a==='timeline')openTool('autoVideoPanel','Timeline','Edit and arrange your video segments.',panelMap.get('autoVideoPanel'));
  if(a==='settings')openTool('wfExportPanel','Settings','Project output and export settings.',exportPanel);
  if(a==='preview'){stageWrap.classList.toggle('wf-preview-focus');b.classList.toggle('active',stageWrap.classList.contains('wf-preview-focus'));}
 });
 const media=stageWrap.querySelector('.media-tools');if(media)hero.append(media);
 const drag=stageWrap.querySelector('.drag-hint');if(drag)hero.append(drag);
 const time=document.getElementById('timeLabel'),duration=document.getElementById('trackMeta');
 if(time)new MutationObserver(()=>{timeline.querySelector('#wfTimeReadout').textContent=time.textContent;}).observe(time,{childList:true,characterData:true,subtree:true});
 if(duration)new MutationObserver(()=>{const m=duration.textContent.match(/(\d{1,2}:\d{2})/);if(m)timeline.querySelector('#wfDuration').textContent=m[1];}).observe(duration,{childList:true,characterData:true,subtree:true});
 const ratio=document.querySelector('.ratio.active');if(ratio)timeline.querySelector('#wfResolution').textContent=ratio.dataset.ratio==='9:16'?'1080P':ratio.dataset.ratio;
 editor.classList.add('wf-reference-dashboard');
 document.body.classList.add('wf-dashboard-app');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();