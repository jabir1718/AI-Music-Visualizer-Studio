(function(){
'use strict';
function init(){
 const dock=document.getElementById('wfStudioDock');if(!dock||dock.dataset.previewReady)return;
 dock.dataset.previewReady='1';
 const content=dock.querySelector('.wf-tool-content');if(!content)return;
 const card=document.createElement('aside');card.className='wf-option-preview';card.setAttribute('aria-live','polite');
 card.innerHTML='<div class="wf-preview-art" aria-hidden="true"><span class="wf-preview-orb"></span><span class="wf-preview-glyph">✦</span></div><div class="wf-preview-copy"><small>OPTION PREVIEW</small><b>Tap any option</b><span>See a quick visual guide before choosing a style or setting.</span></div><span class="wf-preview-tag">LIVE</span>';
 dock.insertBefore(card,content);
 const art=card.querySelector('.wf-preview-art'),glyph=card.querySelector('.wf-preview-glyph'),title=card.querySelector('.wf-preview-copy b'),desc=card.querySelector('.wf-preview-copy span'),tag=card.querySelector('.wf-preview-tag');
 const info={
  bars:'Animated vertical bars react to the music energy.',
  wave:'A flowing waveform follows the sound amplitude.',
  circle:'A circular spectrum surrounds the centre point.',
  neon:'A glowing pulse effect reacts to the beat.',
  trend:'Large bold lyric words designed for short-form videos.',
  karaoke:'Glowing karaoke text for sing-along timing.',
  poetry:'Editorial poetry styling with a softer type treatment.',
  minimal:'Clean, quiet typography with minimal decoration.',
  neonLyrics:'Bright neon lyric treatment with a pulse look.',
  social:'Fast beat-synced cuts for short social videos.',
  cinematic:'Longer, smoother cinematic shot timing.',
  travel:'Travel montage pacing with gentle motion.',
  vlog:'Story-style cuts for vlog footage.',
  calm:'Slow, relaxed cuts and subtle movement.',
  photo:'Photo-memory montage with animated pan and zoom.',
  lyric:'Cuts aligned to lyric-focused visual rhythm.',
  flash:'Very short flash-accented cuts.',
  memories:'A slower memory-film sequence.',
  documentary:'Longer documentary-style shot timing.'
 };
 const categoryInfo={
  Voice:'Separate vocal stem controls. Import an isolated vocal recording to edit it independently.',
  'Ad-lib':'Add a separate ad-lib or doubled vocal layer.',
  Humming:'Import or record a humming layer; automatic humming generation is not available.',
  Harmony:'Work with imported harmony or backing-vocal stems.',
  Instruments:'Add separate bass, drums, piano, guitar or instrumental stems.',
  'Sound effect':'Add a sound-effect audio layer.',
  Engine:'Browse engine and vehicle sound effects.',
  Character:'Browse character and voice-style sound effects.',
  'Voice FX':'Apply available voice effects to a selected vocal layer.',
  Separation:'Inspect the available local stem-separation tools and their limits.',
  Cleanup:'Use the available local noise-cleanup controls.'
 };
 function show(name,detail,kind,source){
  title.textContent=name||'Selected option';desc.textContent=detail||'Preview guide for this setting.';tag.textContent=kind||'PREVIEW';
  art.classList.remove('is-color','is-meter','is-sample');art.style.setProperty('--preview-fill','58%');glyph.textContent='✦';
  const old=art.querySelector('.wf-preview-sample');if(old)old.remove();
  if(source){
   const sample=source.cloneNode(true);sample.className='wf-preview-sample';sample.removeAttribute('id');sample.setAttribute('aria-hidden','true');art.append(sample);art.classList.add('is-sample');
   glyph.hidden=true;
  }else{glyph.hidden=false;}
 }
 function labelFor(el){
  return el.getAttribute('aria-label')||el.dataset.preview||el.querySelector('b')?.textContent||el.textContent.trim().replace(/\s+/g,' ').slice(0,54)||el.id||'Selected option';
 }
 function handleClick(e){
  const el=e.target.closest('.wf-tool-tab,.music-category,.style-card,.template-card,.ratio,[role="option"],button[data-preview],button[data-style],button[data-template]');
  if(!el||!dock.contains(el))return;
  const name=labelFor(el),key=el.dataset.style||el.dataset.template||el.dataset.category||'';
  const sample=el.querySelector('.style-preview,.template-sample');
  show(name,categoryInfo[key]||info[key]||el.dataset.previewDescription||'This option is selected in the editor. Check the main preview and settings panel to see its effect.',el.classList.contains('wf-tool-tab')?'TOOL':el.classList.contains('music-category')?'WORKSPACE':'STYLE',sample);
 }
 function handleChange(e){
  const el=e.target;if(!dock.contains(el))return;
  if(el.matches('select')){
   const opt=el.selectedOptions&&el.selectedOptions[0];if(!opt)return;
   const name=opt.textContent.trim(),key=(opt.value||'').toLowerCase();
   const details=info[key]||('Current setting: '+name+'. This controls '+(el.closest('label')?.childNodes[0]?.textContent||'this editor option').trim().replace(/\s+/g,' ')+'.');
   show(name,details,'SETTING');return;
  }
  if(el.matches('input[type="range"]')){
   const label=el.closest('label')?.childNodes[0]?.textContent?.trim()||el.id||'Adjustment';
   const min=Number(el.min||0),max=Number(el.max||100),val=Number(el.value||0),pct=max===min?0:Math.max(0,Math.min(100,(val-min)/(max-min)*100));
   show(label+' · '+val, 'Small meter shows the current position of this adjustment. Move the slider to compare values.','ADJUSTMENT');
   art.classList.add('is-meter');art.style.setProperty('--preview-fill',pct+'%');return;
  }
  if(el.matches('input[type="color"]')){
   show((el.closest('label')?.childNodes[0]?.textContent||'Color').trim(), 'Current color swatch. Change it to update the main design.','COLOR');
   art.classList.add('is-color');art.style.setProperty('--preview-color',el.value);return;
  }
 }
 dock.addEventListener('click',handleClick,true);
 dock.addEventListener('change',handleChange,true);
 dock.addEventListener('input',e=>{if(e.target.matches('input[type="range"],input[type="color"]'))handleChange(e);},true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,0),{once:true});else setTimeout(init,0);
})();
