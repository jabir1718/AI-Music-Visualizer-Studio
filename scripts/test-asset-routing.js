'use strict';
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const app=read('app.js'),images=read('image-search.js'),symbols=read('symbol-library.js'),html=read('index.html');
for(const [label,source,pattern] of [
 ['asset bridge exposed',app,/WaveForgeAssetBridge\s*=\s*\{/],
 ['background import routed through shared loader',app,/if\(target==='background'\)return setBackgroundFile\(file\)/],
 ['artwork has independent placement',app,/target==='artwork'[\s\S]*positions\.logo=\{x:\.5,y:\.55\}/],
 ['text decoration has independent placement',app,/target==='text-decoration'[\s\S]*positions\.logo=\{x:\.5,y:\.34\}/],
 ['image search supports background',images,/importImage\(item,'background'/],
 ['image search supports logo',images,/importImage\(item,'logo'/],
 ['image search supports artwork',images,/importImage\(item,'artwork'/],
 ['image search supports text decoration',images,/importImage\(item,'text-decoration'/],
 ['image search uses editor bridge',images,/WaveForgeAssetBridge\.importFile\(file,target\)/],
 ['symbol picker supports background',symbols,/useSelected\('background'/],
 ['symbol picker supports artwork',symbols,/useSelected\('artwork'/],
 ['symbol picker supports text decoration',symbols,/useSelected\('text-decoration'/],
 ['symbol picker supports logo',symbols,/useSelected\('logo'/],
 ['symbol library loaded by app',html,/symbol-library\.js/],
 ['image search loaded by app',html,/image-search\.js/]
])if(!pattern.test(source))throw new Error('Asset routing regression: '+label);
console.log('Asset routing tests passed: image search and OpenMoji connect to background, logo, artwork and text-decoration workflows.');
