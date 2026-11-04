(function(root){
'use strict';
const fonts=[
'Roboto','Open Sans','Lato','Montserrat','Oswald','Raleway','Poppins','Nunito','Merriweather','Playfair Display',
'Roboto Condensed','Source Sans 3','Ubuntu','Rubik','Work Sans','PT Sans','PT Serif','Noto Sans','Noto Serif','Fira Sans',
'Fira Mono','Inconsolata','Space Grotesk','Space Mono','DM Sans','DM Serif Display','Manrope','Inter','Outfit','Sora',
'Archivo','Barlow','Barlow Condensed','Bebas Neue','Anton','League Spartan','Archivo Black','Urbanist','Plus Jakarta Sans','Lexend',
'Karla','Mulish','Cabin','Quicksand','Comfortaa','Josefin Sans','Josefin Slab','Cormorant Garamond','Libre Baskerville','Bodoni Moda',
'Cinzel','Abril Fatface','Alfa Slab One','Righteous','Bungee','Black Ops One','Orbitron','Audiowide','Exo 2','Rajdhani',
'Chakra Petch','Share Tech Mono','Share Tech','VT323','Press Start 2P','Silkscreen','IBM Plex Sans','IBM Plex Mono','IBM Plex Serif','Source Code Pro',
'JetBrains Mono','Fira Code','Roboto Slab','Zilla Slab','Arvo','Bitter','Lora','Crimson Text','EB Garamond','Spectral',
'Cormorant','Playfair Display SC','Alegreya','Alegreya Sans','Newsreader','Literata','Teko','Bowlby One SC','Lilita One','Fredoka',
'Baloo 2','Kanit','Tajawal','Cairo','Amiri','Noto Sans Arabic','Noto Naskh Arabic','Noto Sans JP','Noto Sans KR','Noto Sans SC'
];
const defaults=()=>({
 title:{family:'Montserrat',weight:800,scale:1,spacing:0,depth:0,outline:0,glow:0,depthColor:'#10172b',outlineColor:'#ffffff'},
 subtitle:{family:'Inter',weight:500,scale:1,spacing:0,depth:0,outline:0,glow:0,depthColor:'#10172b',outlineColor:'#ffffff'},
 lyric:{family:'Montserrat',weight:800,scale:1,spacing:0,depth:0,outline:0,glow:0,depthColor:'#10172b',outlineColor:'#ffffff'}
});
let styles=defaults();
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function normalize(key,value){
 const d=defaults()[key]||defaults().title,s={...d,...(value||{})};
 s.family=fonts.includes(s.family)?s.family:d.family;
 s.weight=Math.max(300,Math.min(900,Math.round(Number(s.weight)||d.weight)));
 s.scale=Math.max(.5,Math.min(2,Number(s.scale)||1));
 s.spacing=Math.max(-4,Math.min(16,Number(s.spacing)||0));
 s.depth=Math.max(0,Math.min(18,Math.round(Number(s.depth)||0)));
 s.outline=Math.max(0,Math.min(8,Number(s.outline)||0));
 s.glow=Math.max(0,Math.min(40,Number(s.glow)||0));
 s.depthColor=/^#[0-9a-f]{6}$/i.test(s.depthColor)?s.depthColor:d.depthColor;
 s.outlineColor=/^#[0-9a-f]{6}$/i.test(s.outlineColor)?s.outlineColor:d.outlineColor;
 return s;
}
function setAll(value){const d=defaults();Object.keys(d).forEach(k=>styles[k]=normalize(k,value&&value[k]));return getAll();}
function getAll(){return JSON.parse(JSON.stringify(styles));}
function getStyle(key){return {...(styles[key]||styles.title)};}
function loadFont(family){
 if(!fonts.includes(family)||!root.document)return;
 const id='wf-font-'+family.toLowerCase().replace(/[^a-z0-9]+/g,'-');
 if(!root.document.getElementById(id)){
  const link=root.document.createElement('link');link.id=id;link.rel='stylesheet';
  const q=new URLSearchParams({family:family.replace(/ /g,'+')+':wght@300;400;500;600;700;800;900',display:'swap'});
  link.href='https://fonts.googleapis.com/css2?'+q.toString();root.document.head.appendChild(link);
 }
 if(root.document.fonts&&root.document.fonts.load)root.document.fonts.load('700 "'+family+'"').catch(()=>{});
}
function apply(ctx,key,baseSize,fallback){
 const s=getStyle(key);loadFont(s.family);
 ctx.font=s.weight+' '+Math.max(1,Math.round(baseSize*s.scale))+'px "'+s.family+'", '+(fallback||'sans-serif');
 if('letterSpacing' in ctx)ctx.letterSpacing=s.spacing+'px';
 ctx.lineJoin='round';ctx.lineWidth=s.outline;ctx.strokeStyle=s.outlineColor;
 ctx.shadowColor=s.glow?'#ffffff':'transparent';ctx.shadowBlur=s.glow;
 return s;
}
function drawGlyph(ctx,key,text,x,y,maxWidth){
 const s=getStyle(key),fill=ctx.fillStyle;
 ctx.save();
 if(s.depth>0){ctx.shadowBlur=0;ctx.strokeStyle=s.depthColor;ctx.lineWidth=Math.max(1,s.depth*.7);for(let i=s.depth;i>=1;i--)ctx.strokeText(String(text),x+i,y+i,maxWidth);}
 if(s.outline>0){ctx.strokeStyle=s.outlineColor;ctx.lineWidth=s.outline*2;ctx.strokeText(String(text),x,y,maxWidth);}
 ctx.fillStyle=fill;ctx.shadowColor=s.glow?'#ffffff':'transparent';ctx.shadowBlur=s.glow;
 ctx.fillText(String(text),x,y,maxWidth);
 ctx.restore();
}
function mount(host,onChange){
 if(!host||host.querySelector('#typographyStudio'))return;
 const panel=root.document.createElement('section');panel.id='typographyStudio';panel.className='typography-studio';
 panel.innerHTML='<div class="typography-head"><div><span class="eyebrow">TYPE LAB</span><h3>100-font typography studio</h3><p>Independent styles for title, subtitle and lyrics. Google Fonts load when online; system fallback remains available.</p></div><span class="font-count">100</span></div>'+
 '<label>Text layer<select id="typeTarget"><option value="title">Title</option><option value="subtitle">Subtitle</option><option value="lyric">Lyrics / poetry</option></select></label>'+
 '<label>Search fonts<input id="typeSearch" type="search" placeholder="Search 100 font families…"></label>'+
 '<label>Font family<select id="typeFamily"></select></label>'+
 '<div class="typography-grid"><label>Weight<select id="typeWeight"><option value="300">Light</option><option value="400">Regular</option><option value="500">Medium</option><option value="600">Semi-bold</option><option value="700">Bold</option><option value="800">Extra bold</option><option value="900">Black</option></select></label>'+
 '<label>Scale <output id="typeScaleValue">100%</output><input id="typeScale" type="range" min="50" max="200" value="100"></label>'+
 '<label>Letter spacing <output id="typeSpacingValue">0 px</output><input id="typeSpacing" type="range" min="-4" max="16" value="0"></label>'+
 '<label>3D depth <output id="typeDepthValue">0</output><input id="typeDepth" type="range" min="0" max="18" value="0"></label>'+
 '<label>Outline <output id="typeOutlineValue">0</output><input id="typeOutline" type="range" min="0" max="8" value="0"></label>'+
 '<label>Glow <output id="typeGlowValue">0</output><input id="typeGlow" type="range" min="0" max="40" value="0"></label></div>'+
 '<div class="typography-grid"><label>Depth color<input id="typeDepthColor" type="color" value="#10172b"></label><label>Outline color<input id="typeOutlineColor" type="color" value="#ffffff"></label></div>'+
 '<div class="typography-actions"><button type="button" class="btn small" id="typeReset">Reset this layer</button><button type="button" class="btn small" id="typeApplyAll">Copy title style to all</button></div>'+
 '<p class="typography-note">3D depth is a layered canvas extrusion effect, not a volumetric 3D mesh. Font download requires internet access.</p>';
 host.appendChild(panel);
 const $=id=>panel.querySelector('#'+id);
 let target='title',query='';
 function fillFonts(){
  const sel=$('typeFamily'),old=sel.value;sel.replaceChildren();
  fonts.filter(f=>f.toLowerCase().includes(query)).forEach(f=>{const o=root.document.createElement('option');o.value=f;o.textContent=f;sel.appendChild(o);});
  if([...sel.options].some(o=>o.value===old))sel.value=old;
 }
 function sync(){
  const s=styles[target];$('typeTarget').value=target;$('typeFamily').value=s.family;$('typeWeight').value=String(s.weight);
  $('typeScale').value=Math.round(s.scale*100);$('typeSpacing').value=s.spacing;$('typeDepth').value=s.depth;$('typeOutline').value=s.outline;$('typeGlow').value=s.glow;
  $('typeDepthColor').value=s.depthColor;$('typeOutlineColor').value=s.outlineColor;
  $('typeScaleValue').textContent=Math.round(s.scale*100)+'%';$('typeSpacingValue').textContent=s.spacing+' px';$('typeDepthValue').textContent=s.depth;$('typeOutlineValue').textContent=s.outline;$('typeGlowValue').textContent=s.glow;
 }
 function change(patch){styles[target]=normalize(target,{...styles[target],...patch});sync();loadFont(styles[target].family);if(onChange)onChange(getAll());}
 $('typeTarget').onchange=e=>{target=e.target.value;sync();};
 $('typeSearch').oninput=e=>{query=e.target.value.toLowerCase();fillFonts();};
 $('typeFamily').onchange=e=>change({family:e.target.value});
 $('typeWeight').onchange=e=>change({weight:Number(e.target.value)});
 [['typeScale','scale',v=>Number(v)/100],['typeSpacing','spacing',Number],['typeDepth','depth',Number],['typeOutline','outline',Number],['typeGlow','glow',Number]].forEach(([id,key,parse])=>$(id).oninput=e=>change({[key]:parse(e.target.value)}));
 $('typeDepthColor').oninput=e=>change({depthColor:e.target.value});$('typeOutlineColor').oninput=e=>change({outlineColor:e.target.value});
 $('typeReset').onclick=()=>{styles[target]=defaults()[target];sync();if(onChange)onChange(getAll());};
 $('typeApplyAll').onclick=()=>{const s=getStyle('title');styles.title={...s};styles.subtitle={...s};styles.lyric={...s};target='title';sync();if(onChange)onChange(getAll());};
 fillFonts();sync();loadFont(styles.title.family);
}
const api={fonts,setAll,getAll,getStyle,apply,drawGlyph,mount};
root.WaveForgeTypography=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
