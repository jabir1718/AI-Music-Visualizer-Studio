(function(){
'use strict';
function init(){
 const editor=document.querySelector('.editor'),stageWrap=editor&&editor.querySelector('.stage-wrap');
 if(!editor||!stageWrap||document.getElementById('wfDashboard'))return;
 const topbar=document.querySelector('.topbar'),topActions=topbar&&topbar.querySelector('.top-actions');
 if(topActions&&!document.getElementById('wfMenuToggle')){
  const menu=document.createElement('button');menu.type='button';menu.id='wfMenuToggle';menu.className='btn ghost wf-header-icon';menu.textContent='☰';menu.setAttribute('aria-label','Toggle navigation');
  const settings=document.createElement('button');settings.type='button';settings.id='wfHeaderSettings';settings.className='btn ghost wf-header-icon';settings.textContent='⚙';settings.setAttribute('aria-label','Open settings');
  topActions.insertBefore(menu,topActions.firstChild);topActions.insertBefore(settings,menu.nextSibling);
  menu.addEventListener('click',()=>{const collapsed=document.querySelector('.app-shell').classList.toggle('wf-sidebar-collapsed');menu.setAttribute('aria-expanded',String(!collapsed));});
  settings.addEventListener('click',()=>document.querySelector('.wf-bottom-dock [data-dock="settings"]')?.click());
 }
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
 timeline.innerHTML='<div class="wf-timeline-head"><div><span class="wf-kicker">EDIT TIMELINE</span><b>Media & music tracks</b></div><span class="wf-timeline-hint">Tap a tool below to edit</span></div><div class="wf-transport"><span class="wf-time-readout" id="wfTimeReadout">00:00 / 00:00</span><button type="button" data-transport="prev" aria-label="Back five seconds">|◀</button><button type="button" data-transport="play" aria-label="Play or pause">▶</button><button type="button" data-transport="next" aria-label="Forward five seconds">▶|</button><span class="wf-transport-spacer"></span><button type="button" data-transport="undo" aria-label="Undo">↶</button><button type="button" data-transport="redo" aria-label="Redo">↷</button><button type="button" data-transport="fullscreen" aria-label="Fullscreen">⛶</button></div><div class="wf-clip-lane"><button type="button" class="wf-add-clip" id="wfAddClip">＋<small>Add photo / video clips</small></button><div class="wf-clip-placeholder" id="wfDashboardClips"><span>PHOTO / VIDEO TRACK</span><b>Import media to build your timeline</b></div></div><div class="wf-audio-lane"><span class="wf-audio-icon">♫</span><div class="wf-audio-lane-main"><b id="wfAudioName">No music track</b><div class="wf-waveform" aria-hidden="true"></div></div><span class="wf-audio-lane-end">♫</span></div>';
 const toolSection=document.createElement('section');toolSection.className='wf-tools-section';
 toolSection.innerHTML='<div class="wf-section-title"><div><span class="wf-kicker">YOUR CREATIVE TOOLKIT</span><b>Studio tools</b></div><span>15 TOOLS</span></div><div class="wf-tool-grid" id="wfToolGrid"></div>';
 const bottom=document.createElement('nav');bottom.className='wf-bottom-dock';bottom.setAttribute('aria-label','Main navigation');
 bottom.innerHTML='<button type="button" data-dock="project"><span>▰</span><b>Project</b></button><button type="button" data-dock="timeline"><span>▤</span><b>Timeline</b></button><button type="button" class="wf-dock-play" data-dock="play" aria-label="Play"><span>▶</span></button><button type="button" data-dock="preview"><span>◉</span><b>Preview</b></button><button type="button" data-dock="settings"><span>⚙</span><b>Settings</b></button>';
 const modal=document.createElement('div');modal.className='wf-tool-modal';modal.id='wfToolModal';modal.hidden=true;
 modal.innerHTML='<div class="wf-modal-backdrop" data-close="1"></div><section class="wf-modal-sheet" role="dialog" aria-modal="true" aria-labelledby="wfModalTitle"><header class="wf-modal-head"><div><span class="wf-kicker">WAVEFORGE STUDIO</span><h2 id="wfModalTitle">Tool</h2></div><button type="button" class="wf-modal-close" data-close="1" aria-label="Close">×</button></header><div class="wf-modal-preview"><span class="wf-modal-orb">✦</span><div><small>QUICK PREVIEW</small><b id="wfModalPreviewTitle">Selected tool</b><span id="wfModalPreviewText">Your controls are ready.</span></div></div><div class="wf-modal-tabs" id="wfModalTabs"></div><div class="wf-modal-content" id="wfModalContent"></div></section>';
 editor.insertBefore(dashboard,stageWrap);
 dashboard.append(hero,timeline,toolSection);
 const legacyHeading=editor.querySelector(':scope > .section-heading');if(legacyHeading)legacyHeading.remove();
 const showcase=document.createElement('section');showcase.className='wf-showcase-strip';
 showcase.innerHTML='<button type="button" data-showcase="templates"><span>▣</span><b>Templates</b></button><button type="button" data-showcase="visualizers"><span>◎</span><b>Visualizer styles</b></button><button type="button" data-showcase="effects"><span>✦</span><b>Effects preview</b></button><button type="button" data-showcase="save"><span>⇩</span><b>Save project</b></button><button type="button" data-showcase="share"><span>↗</span><b>Share app</b></button><button type="button" data-showcase="reset"><span>⟲</span><b>Reset preview</b></button>';
 dashboard.append(showcase);
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
  ['visualPanel','▧','Filters','Choose visualizer looks and available visual filter controls.'],
  ['threeDStudio','⬡','3D Object Studio','Build and export a 3D object or text overlay.']
 ];
 const grid=toolSection.querySelector('#wfToolGrid');
 const descriptions=new Map(tools.map(t=>[t[0],t[3]]));
 function focusToolTarget(id,p){
  const targets={threeDStudio:['#threeObjectStudio'],filterStudio:['#filterStudio','.filter-studio'],colorTools:['#visualColor'],stickerTools:['#symbolLibrary','.symbol-library'],overlayTools:['#artworkLayerPanel'],transitionTools:['#autoVideoSegments'],speedTools:['#autoVideoSegments']};
  const selectors=targets[id]||[];
  for(const selector of selectors){const target=p&&p.querySelector(selector);if(target){target.scrollIntoView({block:'start',behavior:'smooth'});return true;}}
  return false;
 }
 function panelFor(id){
  if(id==='filterStudio')return editor.querySelector('#filterStudio')?.closest('.panel')||panelMap.get('visualPanel');
  if(id==='transitionTools'||id==='speedTools')return panelMap.get('autoVideoPanel');
  if(id==='stickerTools'||id==='overlayTools')return panelMap.get('overlayPanel');
  if(id==='colorTools')return panelMap.get('visualPanel');
  if(id==='threeDStudio')return panelMap.get('overlayPanel');
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
  related.forEach(t=>{const tab=document.createElement('button');tab.type='button';tab.textContent=t[2];tab.className=t[0]===id?'active':'';tab.addEventListener('click',()=>{modal.querySelector('#wfModalTitle').textContent=t[2];modal.querySelector('#wfModalPreviewTitle').textContent=t[2];modal.querySelector('#wfModalPreviewText').textContent=t[3];tabs.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===tab));focusToolTarget(t[0],p);});tabs.append(tab);});
  const host=modal.querySelector('#wfModalContent');host.replaceChildren();host.append(p);p.hidden=false;
  modal.querySelector('.wf-modal-sheet').scrollTop=0;
  requestAnimationFrame(()=>focusToolTarget(id,p));
 }
 function renderDashboardClips(state){
  const lane=timeline.querySelector('#wfDashboardClips');if(!lane)return;
  lane.replaceChildren();
  const assets=state&&Array.isArray(state.assets)?state.assets:[],segments=state&&Array.isArray(state.segments)?state.segments:[];
  if(!segments.length){const label=document.createElement('span');label.textContent='PHOTO / VIDEO TRACK';const empty=document.createElement('b');empty.textContent=assets.length?'Press Create beat-synced Auto Cut to arrange your clips':'Import media to build your timeline';lane.append(label,empty);return;}
  const heading=document.createElement('span');heading.textContent='PHOTO / VIDEO TRACK · '+segments.length+' CLIPS';lane.append(heading);
  segments.forEach((segment,index)=>{
   const asset=assets.find(item=>item.id===segment.assetId);if(!asset)return;
   const card=document.createElement('button');card.type='button';card.className='wf-mini-clip';card.title=asset.name;
   if(asset.previewUrl){const img=document.createElement('img');img.src=asset.previewUrl;img.alt='';card.append(img);}
   else{const glyph=document.createElement('span');glyph.className='wf-mini-clip-glyph';glyph.textContent='▶';card.append(glyph);}
   const caption=document.createElement('small');caption.textContent=(index+1)+' · '+(asset.kind==='image'?'PHOTO':'VIDEO');card.append(caption);
   card.addEventListener('click',()=>{const panel=panelMap.get('autoVideoPanel');if(panel){openTool('autoVideoPanel','Auto Cut','Build beat-synced photo and video montages.',panel);if(window.WaveForgeAutoVideo)window.WaveForgeAutoVideo.selectSegment(segment.id);}});
   lane.append(card);
  });
 }
 document.addEventListener('waveforge:video-timeline-change',event=>renderDashboardClips(event.detail));
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
 showcase.addEventListener('click',async event=>{
  const button=event.target.closest('[data-showcase]');if(!button)return;
  const action=button.dataset.showcase;
  if(action==='templates')openTool('autoVideoPanel','Templates','Choose a montage template and create a beat-synced edit.',panelMap.get('autoVideoPanel'));
  if(action==='visualizers')openTool('visualPanel','Visualizer styles','Choose a live audio-reactive visualizer.',panelMap.get('visualPanel'));
  if(action==='effects'){const p=panelFor('filterStudio');openTool('filterStudio','Effects preview','Apply one of the available photo and video filter looks.',p);}
  if(action==='save'){const save=document.getElementById('saveProjectFile');if(save)save.click();else bottom.querySelector('[data-dock="settings"]').click();}
  if(action==='share'){
   const shareData={title:'WaveForge Studio',text:'Create music visualizers with WaveForge Studio.',url:location.href};
   try{if(navigator.share)await navigator.share(shareData);else if(navigator.clipboard&&navigator.clipboard.writeText){await navigator.clipboard.writeText(location.href);button.querySelector('b').textContent='Link copied';setTimeout(()=>button.querySelector('b').textContent='Share app',1800);}else{button.querySelector('b').textContent='Share unavailable';}}catch(error){if(error&&error.name!=='AbortError')button.querySelector('b').textContent='Share unavailable';}
  }
  if(action==='reset'){
   const defaults=[['titleInput','YOUR TRACK'],['subtitleInput','Create something unforgettable'],['visualColor','aurora'],['intensity','65'],['sensitivity','55'],['exportRatio','9:16']];
   defaults.forEach(([id,value])=>{const control=document.getElementById(id);if(control){control.value=value;control.dispatchEvent(new Event(control.tagName==='SELECT'?'change':'input',{bubbles:true}));}});
   document.querySelector('.style-card[data-style="bars"]')?.click();document.querySelector('.ratio[data-ratio="9:16"]')?.click();
   button.querySelector('b').textContent='Preview reset';setTimeout(()=>button.querySelector('b').textContent='Reset preview',1800);
  }
 });
 const media=stageWrap.querySelector('.media-tools');if(media)hero.append(media);
 const drag=stageWrap.querySelector('.drag-hint');if(drag)hero.append(drag);
 const addClip=timeline.querySelector('#wfAddClip');if(addClip)addClip.addEventListener('click',()=>document.getElementById('autoVideoAdd')?.click());
 timeline.addEventListener('click',e=>{const b=e.target.closest('[data-transport]');if(!b)return;const a=document.getElementById('audio');if(a){if(b.dataset.transport==='play')document.getElementById('playBtn')?.click();if(b.dataset.transport==='prev')a.currentTime=Math.max(0,a.currentTime-5);if(b.dataset.transport==='next')a.currentTime=Math.min(a.duration||0,a.currentTime+5);}if(b.dataset.transport==='undo')document.getElementById('historyUndo')?.click();if(b.dataset.transport==='redo')document.getElementById('historyRedo')?.click();if(b.dataset.transport==='fullscreen'){const st=document.getElementById('stage');if(st?.requestFullscreen)st.requestFullscreen().catch(()=>{});}});
 const time=document.getElementById('timeLabel'),duration=document.getElementById('trackMeta');
 if(time)new MutationObserver(()=>{timeline.querySelector('#wfTimeReadout').textContent=time.textContent;}).observe(time,{childList:true,characterData:true,subtree:true});
 const titleInput=document.getElementById('titleInput'),projectName=dashboard.querySelector('#wfProjectName');
 if(titleInput&&projectName){const syncTitle=()=>projectName.textContent=titleInput.value.trim()||'My Music Project';titleInput.addEventListener('input',syncTitle);syncTitle();}
 const ratioSelect=document.getElementById('exportRatio'),qualitySelect=document.getElementById('quality');
 function syncProjectInfo(){
  const ratio=ratioSelect&&ratioSelect.value||'9:16';
  const canvas=dashboard.querySelector('.wf-project-info span:nth-child(3) b');
  if(canvas)canvas.textContent=ratio;
  const quality=qualitySelect&&qualitySelect.value||'1080';
  const resolution=dashboard.querySelector('#wfResolution');
  if(resolution)resolution.textContent=quality+'P';
 }
 ratioSelect?.addEventListener('change',syncProjectInfo);qualitySelect?.addEventListener('change',syncProjectInfo);syncProjectInfo();
 const audioElement=document.getElementById('audio'),wave=timeline.querySelector('.wf-waveform');
 if(audioElement&&wave){
  const updateWave=()=>{const duration=Number.isFinite(audioElement.duration)&&audioElement.duration>0?audioElement.duration:0;const progress=duration?Math.max(0,Math.min(100,audioElement.currentTime/duration*100)):0;wave.style.setProperty('--wf-audio-progress',progress+'%');};
  audioElement.addEventListener('timeupdate',updateWave);audioElement.addEventListener('loadedmetadata',updateWave);audioElement.addEventListener('seeked',updateWave);updateWave();
 }
 const play=document.getElementById('playBtn');if(play)new MutationObserver(()=>{const p=timeline.querySelector('[data-transport="play"]');if(p)p.textContent=play.textContent.trim()==='❚❚'?'❚❚':'▶';}).observe(play,{childList:true,characterData:true,subtree:true});
 if(duration)new MutationObserver(()=>{const m=duration.textContent.match(/(\d{1,2}:\d{2})/);if(m)timeline.querySelector('#wfDuration').textContent=m[1];}).observe(duration,{childList:true,characterData:true,subtree:true});
 const ratio=document.querySelector('.ratio.active');if(ratio)timeline.querySelector('#wfResolution').textContent=ratio.dataset.ratio==='9:16'?'1080P':ratio.dataset.ratio;
 editor.classList.add('wf-reference-dashboard');
 document.body.classList.add('wf-dashboard-app');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();