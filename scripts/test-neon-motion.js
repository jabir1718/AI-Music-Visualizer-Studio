'use strict';
const assert=require('assert');
const fs=require('fs');
const read=name=>fs.readFileSync(require('path').join(__dirname,'..',name),'utf8');
const html=read('index.html');
const app=read('app.js');
const shell=read('studio-shell.js');
const timeline=read('timeline-view.js');
const css=read('professional-studio.css');
const themeValues=['aurora','cyber','toxic','purple','synthwave','ice','crimson','gold','ocean','rose','emerald','mono'];
for(const theme of themeValues){
 assert(html.includes('value="'+theme+'"'),'Missing theme option: '+theme);
 assert(app.includes(theme+':['),'Missing palette implementation: '+theme);
}
assert(!shell.includes("querySelectorAll(':scope > .panel')"),'Dashboard must not depend on :scope child selector in Android WebView');
assert(shell.includes("editor.querySelector('#visualTimelineEditor')"),'Full timeline should be mounted on the main dashboard');
assert(timeline.includes("opts.getVideoSegments()"),'Timeline should render imported video/photo segments');
assert(timeline.includes('wf-video-clip'),'Video/photo timeline clips should be selectable');
assert(css.includes('Neon Motion mobile editing layout'),'Neon Motion mobile layout styles are missing');
console.log('Neon Motion dashboard, theme and timeline regression checks passed.');
