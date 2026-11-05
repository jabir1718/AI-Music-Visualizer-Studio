(function(){
'use strict';
const TOOLBOXES=[
{id:'media',icon:'▣',label:'Media',desc:'Bring in video, photo, music or voice.',subs:[
{icon:'▤',label:'Video / photo background',desc:'Behind the visualizer',panel:'visualPanel',target:null},
{icon:'♫',label:'Add music (MP3)',desc:'Your song file',panel:'audioPanel',target:'#audioInput'},
{icon:'🎙',label:'Record voice',desc:'Mic input',panel:'audioPanel',target:'#audioPickBtn'},
{icon:'⇄',label:'Audio from video',desc:'Extract the sound',panel:'autoVideoPanel',target:'#autoVideoAdd'}]},
{id:'layer',icon:'▱',label:'Layers',desc:'Photo or PNG on top. Zoom and place.',subs:[
{icon:'＋',label:'Add photo on top',desc:'Artwork image layer',panel:'overlayPanel',target:'#addArtworkLayerBtn'},
{icon:'◱',label:'Add PNG logo',desc:'Transparent PNG',panel:'overlayPanel',target:'#logoInput'},
{icon:'◍',label:'Zoom / size / rotate',desc:'Per layer controls',panel:'overlayPanel',target:'#artworkLayerList'},
{icon:'T',label:'Title and subtitle',desc:'Text on the video',panel:'overlayPanel',target:'#titleInput'}]},
{id:'visualizer',icon:'◉',label:'Visualizer',desc:'Style, shape, colours, beat.',subs:[
{icon:'▂▅',label:'Visualizer style',desc:'Pick a look',panel:'visualPanel',target:'.style-grid'},
{icon:'▣',label:'Photo inside visualizer',desc:'Background artwork',panel:'visualPanel',target:null},
{icon:'◍',label:'Colour theme',desc:'Aurora, sunset, ice',panel:'visualPanel',target:'#visualColor'},
{icon:'✳',label:'Intensity and beat',desc:'Reaction strength',panel:'visualPanel',target:'#intensity'}]},
{id:'voice',icon:'🎙',label:'Voice',desc:'Pitch, changer and effects.',subs:[
{icon:'↑↓',label:'Voice pitch',desc:'Pitch control',panel:'audioPanel',target:null},
{icon:'◈',label:'Voice changer',desc:'Voice effects',panel:'audioPanel',target:null},
{icon:'♫',label:'Voice volume',desc:'Separate from music',panel:'audioPanel',target:'#volume'},
{icon:'✦',label:'Echo and reverb',desc:'Audio effects',panel:'audioPanel',target:null}]},
{id:'music',icon:'♫',label:'Music',desc:'Bass, BPM, EQ, fades.',subs:[
{icon:'▁▅',label:'Bass and EQ',desc:'Audio controls',panel:'audioPanel',target:null},
{icon:'◴',label:'BPM and beat grid',desc:'Tap or auto-detect',panel:'audioPanel',target:null},
{icon:'◐',label:'Volume and fades',desc:'Main track',panel:'audioPanel',target:'#volume'},
{icon:'▤',label:'Mixer layers',desc:'Available audio layers',panel:'audioPanel',target:null}]},
{id:'text',icon:'T',label:'Text & Art',desc:'Titles, logos, artwork.',subs:[
{icon:'T',label:'Title',desc:'Main heading',panel:'overlayPanel',target:'#titleInput'},
{icon:'t',label:'Subtitle',desc:'Second line',panel:'overlayPanel',target:'#subtitleInput'},
{icon:'◱',label:'Logo',desc:'PNG import',panel:'overlayPanel',target:'#logoInput'},
{icon:'▦',label:'Artwork layers',desc:'Image stack',panel:'overlayPanel',target:'#artworkLayerList'}]},
{id:'lyrics',icon:'♬',label:'Lyrics',desc:'Generate, import, style.',subs:[
{icon:'✦',label:'Auto lyrics',desc:'On-device transcription',panel:'captionPanel',target:'#transcribeBtn'},
{icon:'▤',label:'Import SRT / VTT',desc:'Subtitle file',panel:'captionPanel',target:'#srtInput'},
{icon:'◫',label:'Text template',desc:'Caption styles',panel:'captionPanel',target:'.template-grid'},
{icon:'↑↓',label:'Size and position',desc:'Placement',panel:'captionPanel',target:'#lyricSize'}]},
{id:'autocut',icon:'✂',label:'Auto Cut',desc:'Beat-synced montage.',subs:[
{icon:'＋',label:'Import clips',desc:'Photos and videos',panel:'autoVideoPanel',target:'#autoVideoAdd'},
{icon:'◈',label:'Editing style',desc:'Available presets',panel:'autoVideoPanel',target:'#autoVideoStyle'},
{icon:'✦',label:'Create Auto Cut',desc:'Follows the beat',panel:'autoVideoPanel',target:'#autoVideoCut'},
{icon:'▤',label:'Segments',desc:'Select and edit clips',panel:'autoVideoPanel',target:'#autoVideoSegments'}]},
{id:'effects',icon:'✧',label:'Effects',desc:'Filters and transitions.',subs:[
{icon:'◉',label:'Visual filters',desc:'Filter controls',panel:'visualPanel',target:'.style-grid'},
{icon:'⇄',label:'Transitions',desc:'Between clips',panel:'autoVideoPanel',target:'#autoVideoSegments'},
{icon:'◴',label:'Speed ramps',desc:'Slow or fast',panel:'autoVideoPanel',target:'#autoVideoSegments'},
{icon:'▦',label:'More tools',desc:'Additional controls',panel:'riskPanel',target:null}]},
{id:'project',icon:'▰',label:'Project',desc:'Save, open, check rights.',subs:[
{icon:'✓',label:'Copyright checklist',desc:'Rights reminder',panel:'riskPanel',target:'#riskCheck'},
{icon:'▤',label:'Project info',desc:'Current project',panel:'riskPanel',target:null},
{icon:'⚙',label:'Output settings',desc:'Ratio, quality, FPS',panel:'wfExportPanel',target:null},
{icon:'↗',label:'Export video',desc:'Render now',panel:'wfExportPanel',target:'#exportBtnSide'}]}
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
const toolSection=document.createElement('section');toolSection.className='wf-tools-section';
toolSection.innerHTML='<div class="wf-section-title"><div><span class="wf-kicker">YOUR TOOLBOXES</span><b>Studio tools</b></div><span>'+TOOLBOXES.length+' BOXES</span></div><div class="wf-tool-grid" id="wfToolGrid"></div>';
const bottom=document.createElement('nav');bottom.className='wf-bottom-dock';bottom.setAttribute('aria-label','Main navigation');
bottom.innerHTML='<button type="button" data-dock="project"><span>▰</span><b>Project</b></button><button type="button" data-dock="timeline"><span>▤</span><b>Timeline</b></button><button type="button" class="wf-dock-play" data-dock="play" aria-label="Play"><span>▶</span></button><button type="button" data-dock="preview"><span>◉</span><b>Preview</b></button><button type="button" data-dock="settings"><span>⚙</span><b>Settings</b></button>';
const modal=document.createElement('div');modal.className='wf-tool-modal';modal.id='wfToolModal';modal.hidden=true;
modal.innerHTML='<div class="wf-modal-backdrop" data-close="1"></div><section class="wf-modal-sheet" role="dialog" aria-modal="true" aria-labelledby="wfModalTitle"><header class="wf-modal-head"><div><span class="wf-kicker">WAVEFORGE STUDIO</span><h2 id="wfModalTitle">Toolbox</h2></div><button type="button" class="wf-modal-close" data-close="1" aria-label="Close">×</button></header><button type="button" class="wf-back-btn" id="wfBackBtn" hidden>‹ Back to boxes</button><div class="wf-modal-preview"><span class="wf-modal-orb">✦</span><div><small>INSIDE THIS BOX</small><b id="wfModalPreviewTitle">Choose a control</b><span id="wfModalPreviewText">Pick the sub-tool you need.</span></div></div><div class="wf-modal-content" id="wfModalContent"></div></section>';
editor.prepend(dashboard);dashboard.append(hero,timeline,toolSection);editor.append(bottom,modal);
let exportPanel=null;
if(inspector){exportPanel=document.createElement('section');exportPanel.id='wfExportPanel';exportPanel.className='panel';while(inspector.firstChild)exportPanel.append(inspector.firstChild);panels.push(exportPanel);panelMap.set('wfExportPanel',exportPanel);inspector.remove();}
const audioPanel=panelMap.get('audioPanel');
if(audioPanel){const row=audioPanel.querySelector('.track-row'),seek=audioPanel.querySelector('#seekBar'),transport=timeline.querySelector('.wf-transport');
if(row){const play=row.querySelector('#playBtn'),time=row.querySelector('#timeLabel');if(play)transport.insertBefore(play,transport.querySelector('[data-transport="next"]'));if(time)transport.insertBefore(time,transport.querySelector('.wf-transport-spacer'));const name=row.querySelector('#trackName');if(name){const sync=()=>{timeline.querySelector('#wfAudioName').textContent=name.textContent;};new MutationObserver(sync).observe(name,{childList:true,subtree:true,characterData:true});sync();}}
if(seek)timeline.append(seek);}
const grid=toolSection.querySelector('#wfToolGrid');
TOOLBOXES.forEach(tb=>{const b=document.createElement('button');b.type='button';b.className='wf-tool-card tb-'+tb.id;b.innerHTML='<span class="wf-tool-card-icon">'+tb.icon+'</span><b>'+tb.label+'</b><small>'+tb.desc+'</small>';b.addEventListener('click',()=>openToolbox(tb));grid.append(b);});
panels.forEach(p=>{p.hidden=true;p.classList.add('wf-modal-panel');});if(exportPanel)exportPanel.hidden=true;
function openToolbox(tb){if(!tb)return;modal.hidden=false;document.body.classList.add('wf-modal-open');modal.querySelector('#wfModalTitle').textContent=tb.label;modal.querySelector('#wfModalPreviewTitle').textContent=tb.label+' toolbox';modal.querySelector('#wfModalPreviewText').textContent=tb.desc;modal.querySelector('#wfBackBtn').hidden=true;const host=modal.querySelector('#wfModalContent');host.replaceChildren();const wrap=document.createElement('div');wrap.className='wf-subbox-grid';tb.subs.forEach(sub=>{const s=document.createElement('button');s.type='button';s.className='wf-subbox';s.innerHTML='<span class="wf-subbox-icon">'+sub.icon+'</span><div><b>'+sub.label+'</b><small>'+sub.desc+'</small></div><span class="wf-subbox-go">›</span>';s.addEventListener('click',()=>openLeaf(tb,sub));wrap.append(s);});host.append(wrap);modal.querySelector('.wf-modal-sheet').scrollTop=0;}
function openLeaf(tb,sub){const panel=panelMap.get(sub.panel);if(!panel)return;modal.querySelector('#wfModalTitle').textContent=sub.label;modal.querySelector('#wfModalPreviewTitle').textContent=sub.label;modal.querySelector('#wfModalPreviewText').textContent=sub.desc;modal.querySelector('#wfBackBtn').hidden=false;const host=modal.querySelector('#wfModalContent');host.replaceChildren();host.append(panel);panel.hidden=false;modal.querySelector('.wf-modal-sheet').scrollTop=0;if(sub.target){const target=panel.querySelector(sub.target);if(target){target.classList.add('wf-highlight');setTimeout(()=>target.classList.remove('wf-highlight'),1200);requestAnimationFrame(()=>target.scrollIntoView({block:'center',behavior:'smooth'}));}}}
modal.querySelector('#wfBackBtn').addEventListener('click',()=>{const current=modal.querySelector('#wfModalTitle').textContent;const tb=TOOLBOXES.find(t=>t.subs.some(s=>s.label===current))||TOOLBOXES[0];openToolbox(tb);});
function renderDashboardClips(state){const lane=timeline.querySelector('#wfDashboardClips');if(!lane)return;lane.replaceChildren();const assets=state&&Array.isArray(state.assets)?state.assets:[],segments=state&&Array.isArray(state.segments)?state.segments:[];if(!segments.length){const label=document.createElement('span');label.textContent='PHOTO / VIDEO TRACK';const empty=document.createElement('b');empty.textContent=assets.length?'Press Create beat-synced Auto Cut to arrange your clips':'Import media to build your timeline';lane.append(label,empty);return;}const heading=document.createElement('span');heading.textContent='PHOTO / VIDEO TRACK · '+segments.length+' CLIPS';lane.append(heading);segments.forEach((segment,index)=>{const asset=assets.find(item=>item.id===segment.assetId);if(!asset)return;const card=document.createElement('button');card.type='button';card.className='wf-mini-clip';card.title=asset.name;if(asset.previewUrl){const img=document.createElement('img');img.src=asset.previewUrl;img.alt='';card.append(img);}else{const glyph=document.createElement('span');glyph.className='wf-mini-clip-glyph';glyph.textContent='▶';card.append(glyph);}const caption=document.createElement('small');caption.textContent=(index+1)+' · '+(asset.kind==='image'?'PHOTO':'VIDEO');card.append(caption);card.addEventListener('click',()=>{openLeaf(TOOLBOXES[7],TOOLBOXES[7].subs[3]);if(window.WaveForgeAutoVideo)window.WaveForgeAutoVideo.selectSegment(segment.id);});lane.append(card);});}
document.addEventListener('waveforge:video-timeline-change',e=>renderDashboardClips(e.detail));
function close(){modal.hidden=true;document.body.classList.remove('wf-modal-open');modal.querySelectorAll('.wf-modal-content > .panel').forEach(p=>p.hidden=true);}
modal.addEventListener('click',e=>{if(e.target.closest('[data-close]'))close();});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden)close();});
bottom.addEventListener('click',e=>{const b=e.target.closest('[data-dock]');if(!b)return;const action=b.dataset.dock;if(action==='play')document.getElementById('playBtn')?.click();if(action==='project'||action==='settings')openToolbox(TOOLBOXES[9]);if(action==='timeline')openToolbox(TOOLBOXES[7]);if(action==='preview'){stageWrap.classList.toggle('wf-preview-focus');b.classList.toggle('active',stageWrap.classList.contains('wf-preview-focus'));}});
if(topActions&&!document.getElementById('wfMenuToggle')){const menu=document.createElement('button');menu.type='button';menu.id='wfMenuToggle';menu.className='btn ghost';menu.textContent='☰';menu.setAttribute('aria-label','Toggle navigation');const settings=document.createElement('button');settings.type='button';settings.id='wfHeaderSettings';settings.className='btn ghost';settings.textContent='⚙';settings.setAttribute('aria-label','Open settings');topActions.insertBefore(menu,topActions.firstChild);topActions.insertBefore(settings,menu.nextSibling);menu.addEventListener('click',()=>{const shell=document.querySelector('.app-shell');if(shell){const collapsed=shell.classList.toggle('wf-sidebar-collapsed');menu.setAttribute('aria-expanded',String(!collapsed));}});settings.addEventListener('click',()=>openToolbox(TOOLBOXES[9]));}
const media=stageWrap.querySelector('.media-tools');if(media)hero.append(media);const drag=stageWrap.querySelector('.drag-hint');if(drag)hero.append(drag);
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