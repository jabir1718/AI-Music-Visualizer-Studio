(function(){
'use strict';
const TOOLBOXES=[
{id:'media',icon:'▣',label:'Media',desc:'Import and place your source files.',subs:[
{icon:'▤',label:'Photo / video background',desc:'Place an image or video behind the visualizer.',panel:'visualPanel',target:'.media-tools'},
{icon:'♫',label:'Import MP3 / audio',desc:'Add the main song track.',panel:'audioPanel',target:'#audioDrop'},
{icon:'🎙',label:'Record a voice take',desc:'Record voice, ad-libs or humming as a separate layer.',panel:'audioPanel',target:'#musicCategoryNav',category:'Voice'},
{icon:'⇄',label:'Extract audio from video',desc:'Import a video source for audio extraction.',panel:'autoVideoPanel',target:'#autoVideoAdd'}]},
{id:'layers',icon:'▱',label:'Photo & PNG layers',desc:'Add and transform artwork over the video.',subs:[
{icon:'＋',label:'Add photo / PNG layer',desc:'Add an independent image layer.',panel:'overlayPanel',target:'#addArtworkLayerBtn'},
{icon:'⌖',label:'Zoom and position',desc:'Adjust X, Y, size, rotation and opacity for each layer.',panel:'overlayPanel',target:'#artworkLayerList'},
{icon:'◱',label:'Logo overlay',desc:'Import a transparent PNG logo.',panel:'overlayPanel',target:'#logoInput'},
{icon:'▤',label:'Layer stack',desc:'Select, hide or remove artwork layers.',panel:'overlayPanel',target:'#artworkLayerList'}]},
{id:'visualizer',icon:'◉',label:'Visualizer',desc:'Choose the audio-reactive look and background.',subs:[
{icon:'▂▅',label:'Visualizer styles',desc:'Bars, waveform, circle and neon pulse.',panel:'visualPanel',target:'.style-grid'},
{icon:'▣',label:'Photo inside visualizer',desc:'Set a photo or video as the visualizer background.',panel:'visualPanel',target:'.media-tools'},
{icon:'◍',label:'Colour and intensity',desc:'Choose palette, intensity and beat sensitivity.',panel:'visualPanel',target:'#visualColor'},
{icon:'✦',label:'3D visual objects',desc:'Add and configure a 3D object layer.',panel:'visualPanel',target:'#threeObjectStudio'},
{icon:'◌',label:'Background removal',desc:'AI person cutout and chroma-key controls.',panel:'visualPanel',target:'#aiSegmentationPanel'}]},
{id:'voice',icon:'🎙',label:'Voice Studio',desc:'Separate voice tools and independent voice layers.',subs:[
{icon:'↑↓',label:'Voice pitch',desc:'Pitch control for an imported voice layer; enable pitch-preserving mode to separate pitch from speed.',panel:'audioPanel',target:'#musicCategoryDetail',category:'Voice'},
{icon:'◈',label:'Voice changer',desc:'Natural, telephone, radio, monster, chipmunk, robot and alien presets.',panel:'audioPanel',target:'#musicCategoryDetail',category:'Voice FX'},
{icon:'●',label:'Record voice',desc:'Record a new independent voice track.',panel:'audioPanel',target:'#musicCategoryDetail',category:'Voice'},
{icon:'♫',label:'Ad-libs and humming',desc:'Record or import separate takes.',panel:'audioPanel',target:'#musicCategoryDetail',category:'Ad-lib'},
{icon:'♬',label:'Harmony layers',desc:'Import a separate backing-vocal layer.',panel:'audioPanel',target:'#musicCategoryDetail',category:'Harmony'},
{icon:'⌁',label:'Noise cleanup',desc:'Clean an imported voice track using a noise sample.',panel:'audioPanel',target:'#musicCategoryDetail',category:'Cleanup'},
{icon:'✂',label:'Vocal / instrument separation',desc:'Not connected yet: automatic stem separation from a mixed MP3 is not implemented.',panel:'audioPanel',target:'#musicCategoryDetail',category:'Separation'}]},
{id:'music',icon:'♫',label:'Music & DJ',desc:'Tempo, EQ, mixer and track effects.',subs:[
{icon:'◴',label:'BPM and beat grid',desc:'Detect tempo, tap tempo and align beat subdivisions.',panel:'audioPanel',target:'.bpm-tool'},
{icon:'▁▅',label:'Bass and treble EQ',desc:'Adjust the original song independently.',panel:'audioPanel',target:'.main-effects-panel'},
{icon:'◐',label:'Music effects',desc:'Pan, echo, reverb, distortion and compression.',panel:'audioPanel',target:'.main-effects-panel'},
{icon:'▤',label:'Track mixer',desc:'Import separate voice and instrument stems; mute, solo and balance them.',panel:'audioPanel',target:'#mixerList'},
{icon:'✂',label:'Trim, split and loop',desc:'Edit imported layer timing and clips.',panel:'audioPanel',target:'#mixerList'},
{icon:'♫',label:'Instrument tracks',desc:'Choose bass, drums, piano, guitar or instrumental source.',panel:'audioPanel',target:'#musicCategoryDetail',category:'Instruments'}]},
{id:'text',icon:'T',label:'Text & Art',desc:'Titles, logos and typography.',subs:[
{icon:'T',label:'Title and subtitle',desc:'Edit the main title and second line.',panel:'overlayPanel',target:'#titleInput'},
{icon:'◱',label:'Logo',desc:'Add a PNG logo to the canvas.',panel:'overlayPanel',target:'#logoInput'},
{icon:'▦',label:'Artwork layers',desc:'Add and adjust separate images.',panel:'overlayPanel',target:'#artworkLayerList'},
{icon:'✎',label:'Typography styles',desc:'Choose font, colour and text treatment.',panel:'overlayPanel',target:'#fontStyle'}]},
{id:'lyrics',icon:'♬',label:'Lyrics & Captions',desc:'Timed lyrics and caption styles.',subs:[
{icon:'✦',label:'Generate lyrics',desc:'Run local speech transcription on the imported song.',panel:'captionPanel',target:'#transcribeBtn'},
{icon:'▤',label:'Import subtitles',desc:'Load an SRT or VTT file.',panel:'captionPanel',target:'#srtInput'},
{icon:'◫',label:'Caption templates',desc:'Choose karaoke, neon, poetry and other styles.',panel:'captionPanel',target:'.template-grid'},
{icon:'↑↓',label:'Caption size and position',desc:'Adjust lyric layout.',panel:'captionPanel',target:'#lyricSize'}]},
{id:'autocut',icon:'✂',label:'Cut / Trim / Speed',desc:'Precision clip editing and beat-synced montage.',subs:[
{icon:'＋',label:'Import photos / videos',desc:'Add media clips to the montage.',panel:'autoVideoPanel',target:'#autoVideoAdd'},
{icon:'◈',label:'Editing template',desc:'Choose one of 10 montage presets.',panel:'autoVideoPanel',target:'#autoVideoStyle'},
{icon:'✂',label:'Split / cut at playhead',desc:'Select a segment and split it at the playhead.',panel:'autoVideoPanel',target:'#autoVideoSegments'},
{icon:'⌗',label:'Trim start / end',desc:'Adjust the selected segment duration.',panel:'autoVideoPanel',target:'#autoVideoSegments'},
{icon:'◴',label:'Speed ramps',desc:'Edit slow motion and speed changes on a selected segment.',panel:'autoVideoPanel',target:'#autoVideoSegments'},
{icon:'✦',label:'Create beat-synced cut',desc:'Arrange clips to the music tempo.',panel:'autoVideoPanel',target:'#autoVideoCut'},
{icon:'▤',label:'Edit segments',desc:'Reorder, split, trim, change speed and transitions.',panel:'autoVideoPanel',target:'#autoVideoSegments'}]},
{id:'effects',icon:'✧',label:'Effects & Filters',desc:'Visual looks and clip effects.',subs:[
{icon:'◉',label:'Visual filters',desc:'Choose a filter preset.',panel:'visualPanel',target:'#filterStudio'},
{icon:'⇄',label:'Clip transitions',desc:'Set transitions between montage segments.',panel:'autoVideoPanel',target:'#autoVideoSegments'},
{icon:'◴',label:'Speed ramps',desc:'Adjust clip speed ramps.',panel:'autoVideoPanel',target:'#autoVideoSegments'},
{icon:'▦',label:'Chroma key',desc:'Remove a selected solid background colour.',panel:'visualPanel',target:'#chromaKeyStudio'}]},
{id:'project',icon:'▰',label:'Project & Export',desc:'Save, review and export the project.',subs:[
{icon:'✓',label:'Copyright checklist',desc:'Review the audio and visual rights checklist.',panel:'riskPanel',target:'#riskCheck'},
{icon:'▤',label:'Project information',desc:'Project details and local save status.',panel:'riskPanel',target:null},
{icon:'⚙',label:'Output settings',desc:'Choose canvas, quality and frame rate.',panel:'wfExportPanel',target:null},
{icon:'↗',label:'Export video',desc:'Render the current project.',panel:'wfExportPanel',target:'#exportBtnSide'}]},
{id:'joker',icon:'◉',label:'Joker Voice',desc:'Voice FX, pitch, recording and cleanup.',subs:[
{icon:'◈',label:'Voice changer presets',desc:'Open the available voice character and effect presets.',panel:'audioPanel',target:'#musicCategoryNav',category:'Voice FX'},
{icon:'↑↓',label:'Pitch & formant',desc:'Adjust pitch and formant on a separate voice layer.',panel:'audioPanel',target:'#musicCategoryNav',category:'Voice'},
{icon:'●',label:'Record Joker voice take',desc:'Record a separate voice layer, then apply supported effects.',panel:'audioPanel',target:'#musicCategoryNav',category:'Voice'},
{icon:'⌁',label:'Noise cleanup',desc:'Clean a voice take with the local noise cleanup tool.',panel:'audioPanel',target:'#musicCategoryNav',category:'Cleanup'}]},
{id:'dj',icon:'♫',label:'DJ Mixer',desc:'Beat grid, effects and multitrack controls.',subs:[
{icon:'◴',label:'BPM / Tap Tempo',desc:'Detect or tap the song tempo and align beat divisions.',panel:'audioPanel',target:'.bpm-tool'},
{icon:'▤',label:'Mixer tracks',desc:'Balance, mute and solo separate imported tracks.',panel:'audioPanel',target:'#mixerList'},
{icon:'◐',label:'EQ / FX sweep',desc:'Control bass, treble, pan, echo, reverb and distortion.',panel:'audioPanel',target:'.main-effects-panel'},
{icon:'♫',label:'Sound effects library',desc:'Browse available sound effects and add them as mixer layers.',panel:'audioPanel',target:'#musicCategoryNav',category:'Sound effect'}]}
];
function init(){
const editor=document.querySelector('.editor'),stageWrap=editor&&editor.querySelector('.stage-wrap');
if(!editor||!stageWrap||document.getElementById('wfDashboard'))return;
const panels=Array.from(editor.children).filter(el=>el.classList&&el.classList.contains('panel'));
const panelMap=new Map(panels.map(p=>[p.id,p]));
const inspector=document.querySelector('.inspector'),topbar=document.querySelector('.topbar'),topActions=topbar&&topbar.querySelector('.top-actions');
const dashboard=document.createElement('div');dashboard.id='wfDashboard';dashboard.className='wf-dashboard';
const hero=document.createElement('div');hero.className='wf-hero';
const heroTop=document.createElement('div');heroTop.className='wf-hero-top';
heroTop.innerHTML='<div><span class="wf-kicker">NOW CREATING</span><strong id="wfProjectName">My Music Project</strong></div><span class="wf-project-badge"><i></i> LOCAL PROJECT</span>';
const projectInfo=document.createElement('div');projectInfo.className='wf-project-info';
projectInfo.innerHTML='<span><b id="wfDuration">00:00</b><small>DURATION</small></span><span><b id="wfResolution">1080P</b><small>QUALITY</small></span><span><b>9:16</b><small>CANVAS</small></span>';
hero.append(heroTop,stageWrap,projectInfo);
const timeline=document.createElement('section');timeline.className='wf-timeline';
timeline.innerHTML='<div class="wf-timeline-head"><div><span class="wf-kicker">EDIT TIMELINE</span><b>Media &amp; music tracks</b></div><span class="wf-timeline-hint">Tap a toolbox below</span></div><div class="wf-transport"><span class="wf-time-readout" id="wfTimeReadout">00:00 / 00:00</span><button type="button" data-transport="prev" aria-label="Back five seconds">|◀</button><button type="button" data-transport="play" aria-label="Play or pause">▶</button><button type="button" data-transport="next" aria-label="Forward five seconds">▶|</button><span class="wf-transport-spacer"></span><button type="button" data-transport="undo" aria-label="Undo">↶</button><button type="button" data-transport="redo" aria-label="Redo">↷</button><button type="button" data-transport="fullscreen" aria-label="Fullscreen">⛶</button></div><div class="wf-clip-lane"><button type="button" class="wf-add-clip" id="wfAddClip">＋<small>Add photo / video clips</small></button><div class="wf-clip-placeholder" id="wfDashboardClips"><span>PHOTO / VIDEO TRACK</span><b>Import media to build your timeline</b></div></div><div class="wf-audio-lane"><span class="wf-audio-icon">♫</span><div class="wf-audio-lane-main"><b id="wfAudioName">No music track</b><div class="wf-waveform" aria-hidden="true"></div></div><span class="wf-audio-icon">♫</span></div>';
const actionBar=document.createElement('section');actionBar.className='wf-action-bar';actionBar.innerHTML='<button type="button" data-edit-action="undo"><span>↶</span><b>Undo</b></button><button type="button" data-edit-action="redo"><span>↷</span><b>Redo</b></button><button type="button" data-edit-action="delete"><span>⌫</span><b>Delete</b></button><button type="button" data-edit-action="safe"><span>▧</span><b>Safe Zone</b></button><button type="button" class="wf-action-export" data-edit-action="export"><span>↥</span><b>Export</b></button>';
const toolSection=document.createElement('section');toolSection.className='wf-tools-section';
toolSection.innerHTML='<div class="wf-context-head"><div><span class="wf-kicker">SELECTED TOOLBOX</span><b id="wfContextTitle">UNIVERSAL MEDIA IMPORT</b></div><span class="wf-context-status">ADVANCED ENGINE</span></div><div class="wf-context-buttons" id="wfContextButtons"></div>';
const bottom=document.createElement('nav');bottom.className='wf-bottom-dock wf-category-dock';bottom.setAttribute('aria-label','Main editing categories');bottom.id='wfCategoryDock';
const modal=document.createElement('div');modal.className='wf-tool-modal';modal.id='wfToolModal';modal.hidden=true;
modal.innerHTML='<div class="wf-modal-backdrop" data-close="1"></div><section class="wf-modal-sheet" role="dialog" aria-modal="true" aria-labelledby="wfModalTitle"><header class="wf-modal-head"><div><span class="wf-kicker">WAVEFORGE STUDIO</span><h2 id="wfModalTitle">Toolbox</h2></div><button type="button" class="wf-modal-close" data-close="1" aria-label="Close">×</button></header><button type="button" class="wf-back-btn" id="wfBackBtn" hidden>‹ Back to boxes</button><div class="wf-modal-preview"><span class="wf-modal-orb">✦</span><div><small>INSIDE THIS BOX</small><b id="wfModalPreviewTitle">Choose a control</b><span id="wfModalPreviewText">Pick the sub-tool you need.</span></div></div><div class="wf-modal-content" id="wfModalContent"></div></section>';
editor.prepend(dashboard);dashboard.append(hero,actionBar,timeline,toolSection);editor.append(bottom,modal);
let exportPanel=null;
if(inspector){exportPanel=document.createElement('section');exportPanel.id='wfExportPanel';exportPanel.className='panel';while(inspector.firstChild)exportPanel.append(inspector.firstChild);panels.push(exportPanel);panelMap.set('wfExportPanel',exportPanel);inspector.remove();}
const audioPanel=panelMap.get('audioPanel');
if(audioPanel){const row=audioPanel.querySelector('.track-row'),seek=audioPanel.querySelector('#seekBar'),transport=timeline.querySelector('.wf-transport');
if(row){const play=row.querySelector('#playBtn'),time=row.querySelector('#timeLabel');if(play)transport.insertBefore(play,transport.querySelector('[data-transport="next"]'));if(time)transport.insertBefore(time,transport.querySelector('.wf-transport-spacer'));const name=row.querySelector('#trackName');if(name){const sync=()=>{timeline.querySelector('#wfAudioName').textContent=name.textContent;};new MutationObserver(sync).observe(name,{childList:true,subtree:true,characterData:true});sync();}}
if(seek)timeline.append(seek);}
const contextTitle=toolSection.querySelector('#wfContextTitle'),contextButtons=toolSection.querySelector('#wfContextButtons');
function selectCategory(tb){if(!tb)return;bottom.querySelectorAll('[data-category]').forEach(x=>x.classList.toggle('active',x.dataset.category===tb.id));contextTitle.textContent=tb.label.toUpperCase()+' · '+tb.desc;contextButtons.replaceChildren();tb.subs.forEach(sub=>{const b=document.createElement('button');b.type='button';b.className='wf-context-btn';b.innerHTML='<span>'+sub.icon+'</span><b>'+sub.label+'</b>';b.title=sub.desc;b.addEventListener('click',()=>openLeaf(tb,sub));contextButtons.append(b);});}
TOOLBOXES.forEach(tb=>{const b=document.createElement('button');b.type='button';b.dataset.category=tb.id;b.className='wf-category-btn';b.innerHTML='<span>'+tb.icon+'</span><b>'+tb.label+'</b>';b.addEventListener('click',()=>selectCategory(tb));bottom.append(b);});selectCategory(TOOLBOXES[0]);
panels.forEach(p=>{p.hidden=true;p.classList.add('wf-modal-panel');});if(exportPanel)exportPanel.hidden=true;
function openToolbox(tb){if(!tb)return;modal.hidden=false;document.body.classList.add('wf-modal-open');modal.querySelector('#wfModalTitle').textContent=tb.label;modal.querySelector('#wfModalPreviewTitle').textContent=tb.label+' toolbox';modal.querySelector('#wfModalPreviewText').textContent=tb.desc;modal.querySelector('#wfBackBtn').hidden=true;const host=modal.querySelector('#wfModalContent');host.replaceChildren();const wrap=document.createElement('div');wrap.className='wf-subbox-grid';tb.subs.forEach(sub=>{const s=document.createElement('button');s.type='button';s.className='wf-subbox';s.innerHTML='<span class="wf-subbox-icon">'+sub.icon+'</span><div><b>'+sub.label+'</b><small>'+sub.desc+'</small></div><span class="wf-subbox-go">›</span>';s.addEventListener('click',()=>openLeaf(tb,sub));wrap.append(s);});host.append(wrap);modal.querySelector('.wf-modal-sheet').scrollTop=0;}
function openLeaf(tb,sub){const panel=panelMap.get(sub.panel);if(!panel)return;modal.querySelector('#wfModalTitle').textContent=sub.label;modal.querySelector('#wfModalPreviewTitle').textContent=sub.label;modal.querySelector('#wfModalPreviewText').textContent=sub.desc;modal.querySelector('#wfBackBtn').hidden=false;const host=modal.querySelector('#wfModalContent');host.replaceChildren();host.append(panel);panel.hidden=false;if(sub.category){const category=panel.querySelector('.music-category[data-category=\"'+sub.category+'\"]');if(category)category.click();}modal.querySelector('.wf-modal-sheet').scrollTop=0;if(sub.target){const target=panel.querySelector(sub.target)||document.querySelector(sub.target);if(target){target.classList.add('wf-highlight');setTimeout(()=>target.classList.remove('wf-highlight'),1500);requestAnimationFrame(()=>target.scrollIntoView({block:'center',behavior:'smooth'}));}}}
modal.querySelector('#wfBackBtn').addEventListener('click',()=>{const current=modal.querySelector('#wfModalTitle').textContent;const tb=TOOLBOXES.find(t=>t.subs.some(s=>s.label===current))||TOOLBOXES[0];openToolbox(tb);});
function renderDashboardClips(state){const lane=timeline.querySelector('#wfDashboardClips');if(!lane)return;lane.replaceChildren();const assets=state&&Array.isArray(state.assets)?state.assets:[],segments=state&&Array.isArray(state.segments)?state.segments:[];if(!segments.length){const label=document.createElement('span');label.textContent='PHOTO / VIDEO TRACK';const empty=document.createElement('b');empty.textContent=assets.length?'Press Create beat-synced Auto Cut to arrange your clips':'Import media to build your timeline';lane.append(label,empty);return;}const heading=document.createElement('span');heading.textContent='PHOTO / VIDEO TRACK · '+segments.length+' CLIPS';lane.append(heading);segments.forEach((segment,index)=>{const asset=assets.find(item=>item.id===segment.assetId);if(!asset)return;const card=document.createElement('button');card.type='button';card.className='wf-mini-clip';card.title=asset.name;if(asset.previewUrl){const img=document.createElement('img');img.src=asset.previewUrl;img.alt='';card.append(img);}else{const glyph=document.createElement('span');glyph.className='wf-mini-clip-glyph';glyph.textContent='▶';card.append(glyph);}const caption=document.createElement('small');caption.textContent=(index+1)+' · '+(asset.kind==='image'?'PHOTO':'VIDEO');card.append(caption);card.addEventListener('click',()=>{openLeaf(TOOLBOXES[7],TOOLBOXES[7].subs[3]);if(window.WaveForgeAutoVideo)window.WaveForgeAutoVideo.selectSegment(segment.id);});lane.append(card);});}
document.addEventListener('waveforge:video-timeline-change',e=>renderDashboardClips(e.detail));
function close(){modal.hidden=true;document.body.classList.remove('wf-modal-open');modal.querySelectorAll('.wf-modal-content > .panel').forEach(p=>p.hidden=true);}
modal.addEventListener('click',e=>{if(e.target.closest('[data-close]'))close();});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden)close();});
bottom.addEventListener('wheel',e=>{if(Math.abs(e.deltaY)>Math.abs(e.deltaX)){bottom.scrollLeft+=e.deltaY;e.preventDefault();}},{passive:false});
if(topActions&&!document.getElementById('wfMenuToggle')){const menu=document.createElement('button');menu.type='button';menu.id='wfMenuToggle';menu.className='btn ghost';menu.textContent='☰';menu.setAttribute('aria-label','Toggle navigation');const settings=document.createElement('button');settings.type='button';settings.id='wfHeaderSettings';settings.className='btn ghost';settings.textContent='⚙';settings.setAttribute('aria-label','Open settings');topActions.insertBefore(menu,topActions.firstChild);topActions.insertBefore(settings,menu.nextSibling);menu.addEventListener('click',()=>{const shell=document.querySelector('.app-shell');if(shell){const collapsed=shell.classList.toggle('wf-sidebar-collapsed');menu.setAttribute('aria-expanded',String(!collapsed));}});settings.addEventListener('click',()=>openToolbox(TOOLBOXES[9]));}
const media=stageWrap.querySelector('.media-tools');if(media)hero.append(media);const safeOverlay=document.createElement('div');safeOverlay.className='wf-safe-zone';safeOverlay.hidden=true;safeOverlay.innerHTML='<span>SHORT VIDEO SAFE AREA</span><span>KEEP IMPORTANT TEXT INSIDE</span>';const stage=document.getElementById('stage');if(stage)stage.append(safeOverlay);actionBar.addEventListener('click',async e=>{const b=e.target.closest('[data-edit-action]');if(!b)return;const action=b.dataset.editAction;if(action==='undo')document.getElementById('historyUndo')?.click();if(action==='redo')document.getElementById('historyRedo')?.click();if(action==='safe'){safeOverlay.hidden=!safeOverlay.hidden;b.classList.toggle('active',!safeOverlay.hidden);}if(action==='export')document.getElementById('exportBtnSide')?.click();if(action==='delete'){const removed=window.WaveForgeArtworkLayers?.removeSelected?await window.WaveForgeArtworkLayers.removeSelected():false;if(!removed){const visible=document.querySelector('#objectVisible');if(visible){visible.checked=false;visible.dispatchEvent(new Event('change',{bubbles:true}));}else document.getElementById('clearLogo')?.click();}}});const drag=stageWrap.querySelector('.drag-hint');if(drag)hero.append(drag);
const addClip=timeline.querySelector('#wfAddClip');if(addClip)addClip.addEventListener('click',()=>document.getElementById('autoVideoAdd')?.click());
timeline.addEventListener('click',e=>{const b=e.target.closest('[data-transport]');if(!b)return;const audio=document.getElementById('audio');if(audio){if(b.dataset.transport==='play')document.getElementById('playBtn')?.click();if(b.dataset.transport==='prev')audio.currentTime=Math.max(0,audio.currentTime-5);if(b.dataset.transport==='next')audio.currentTime=Math.min(audio.duration||0,audio.currentTime+5);}if(b.dataset.transport==='undo')document.getElementById('historyUndo')?.click();if(b.dataset.transport==='redo')document.getElementById('historyRedo')?.click();if(b.dataset.transport==='fullscreen'){const stage=document.getElementById('stage');if(stage&&stage.requestFullscreen)stage.requestFullscreen().catch(()=>{});}});
const time=document.getElementById('timeLabel');if(time)new MutationObserver(()=>{timeline.querySelector('#wfTimeReadout').textContent=time.textContent;}).observe(time,{childList:true,characterData:true,subtree:true});
const play=document.getElementById('playBtn');if(play)new MutationObserver(()=>{const p=timeline.querySelector('[data-transport="play"]');if(p)p.textContent=play.textContent.trim()==='❚❚'?'❚❚':'▶';}).observe(play,{childList:true,characterData:true,subtree:true});
const duration=document.getElementById('trackMeta');if(duration)new MutationObserver(()=>{const m=duration.textContent.match(/(\d{1,2}:\d{2})/);if(m)timeline.querySelector('#wfDuration').textContent=m[1];}).observe(duration,{childList:true,characterData:true,subtree:true});
editor.classList.add('wf-reference-dashboard');document.body.classList.add('wf-dashboard-app');
}
function boot(){
try{init();}
catch(error){
const bar=document.createElement('div');
bar.id='wfShellError';
bar.setAttribute('role','alert');
bar.style.cssText='position:fixed;z-index:999999;left:10px;right:10px;bottom:10px;padding:12px 14px;background:#5b1020;color:#fff;border:1px solid #ff405f;border-radius:10px;font:12px/1.45 monospace;white-space:pre-wrap;box-shadow:0 8px 28px #0009';
bar.textContent='Shell error: '+(error&&error.stack?error.stack:String(error));
(document.body||document.documentElement).append(bar);
}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();