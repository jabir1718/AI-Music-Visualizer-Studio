(function(){
'use strict';
function init(){
 const editor=document.querySelector('.editor');if(!editor||document.getElementById('wfStudioDock'))return;
 const panels=Array.from(editor.querySelectorAll(':scope > .panel'));
 const inspector=document.querySelector('.inspector');
 const dock=document.createElement('section');dock.id='wfStudioDock';dock.className='wf-studio-dock';
 const nav=document.createElement('nav');nav.className='wf-tool-nav';nav.setAttribute('aria-label','Studio tools');
 const content=document.createElement('div');content.className='wf-tool-content';
 dock.append(nav,content);
 const stage=editor.querySelector('.stage-wrap');
 if(stage&&stage.nextSibling)editor.insertBefore(dock,stage.nextSibling);else editor.append(dock);
 const entries=[
  ['audioPanel','🎵','Music & Audio'],['visualPanel','◉','Visuals & 3D'],['overlayPanel','✎','Text & Art'],
  ['captionPanel','字幕','Lyrics'],['autoVideoPanel','✂','Auto Cut'],['offlineEditPanel','✦','AI Assistant'],['wfExportPanel','↗','Export'],['riskPanel','☰','More Tools']
 ];
 const byId=new Map(panels.map(p=>[p.id,p]));
 const used=new Set();
 function activate(id){
  content.querySelectorAll(':scope > .panel').forEach(p=>{p.hidden=p.id!==id;p.classList.toggle('wf-active-panel',p.id===id);});
  nav.querySelectorAll('button').forEach(b=>{const active=b.dataset.panel===id;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
 }
 entries.forEach(([id,icon,label])=>{
  let panel=id==='wfExportPanel'?null:byId.get(id);if(!panel)return;
  used.add(id);content.append(panel);
  const b=document.createElement('button');b.type='button';b.className='wf-tool-tab';b.dataset.panel=id;b.setAttribute('aria-label',label);b.title=label;b.innerHTML='<span class="wf-tab-icon" aria-hidden="true">'+icon+'</span><span>'+label+'</span>';b.addEventListener('click',()=>activate(id));nav.append(b);
 });
 if(inspector){
  const exportPanel=document.createElement('section');exportPanel.id='wfExportPanel';exportPanel.className='panel wf-export-panel';
  const head=document.createElement('div');head.className='panel-head';head.innerHTML='<div><div class="eyebrow">FINAL OUTPUT</div><h2>Export settings</h2></div><span class="tag">On device</span>';exportPanel.append(head);
  while(inspector.firstChild)exportPanel.append(inspector.firstChild);
  content.append(exportPanel);
  const b=document.createElement('button');b.type='button';b.className='wf-tool-tab';b.dataset.panel='wfExportPanel';b.innerHTML='<span class="wf-tab-icon" aria-hidden="true">↗</span><span>Export</span>';b.addEventListener('click',()=>activate('wfExportPanel'));nav.append(b);
  inspector.hidden=true;
 }
 panels.filter(p=>!used.has(p.id)).forEach(p=>{content.append(p);const id=p.id||('tool-'+nav.children.length);p.id=id;const b=document.createElement('button');b.type='button';b.className='wf-tool-tab';b.dataset.panel=id;b.innerHTML='<span class="wf-tab-icon">⚙</span><span>'+(p.querySelector('h2')?.textContent||'Tools')+'</span>';b.addEventListener('click',()=>activate(id));nav.append(b);});
 activate('audioPanel');
 editor.classList.add('wf-single-screen');
 document.body.classList.add('wf-studio-app');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();