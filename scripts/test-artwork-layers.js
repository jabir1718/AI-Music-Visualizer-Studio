'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const source=fs.readFileSync(require('path').join(__dirname,'..','artwork-layers.js'),'utf8');
const store=new Map();let draws=0,saved=0,removed=0;
class MockImage{constructor(){this.complete=false;this.naturalWidth=400;this.naturalHeight=200;}set src(v){this._src=v;this.complete=true;if(this.onload)this.onload();}}
const context={console,Math,Date,Promise,Image:MockImage,URL:{createObjectURL:()=> 'blob:mock',revokeObjectURL:()=>{}},localStorage:{setItem:(k,v)=>store.set(k,v),getItem:k=>store.get(k)||null},window:{}};
vm.runInNewContext(source,context);
const api=context.window.WaveForgeArtworkLayers;
api.mount(null,{saveMediaAsset:async()=>{saved++;return true;},getMediaAsset:async()=>null,deleteMediaAsset:async()=>{removed++;},onChange:()=>{}});
(async()=>{
 await api.add({type:'image/png',size:1024,name:'poster.png'},'artwork');
 assert.strictEqual(api.getCount(),1);
 const state=api.getState()[0];
 assert.strictEqual(state.name,'poster.png');
 assert.strictEqual(state.target,'artwork');
 assert.strictEqual(saved,1);
 api.draw({save(){},restore(){},translate(){},rotate(){},drawImage(){draws++;}},1080,1920);
 assert.strictEqual(draws,1,'independent image must render to canvas');
 assert.ok(store.has('waveforge-artwork-layers-v1'),'layer metadata must persist');
 await api.add({type:'image/png',size:1024,name:'deco.png'},'text-decoration');
 assert.strictEqual(api.getCount(),2);
 assert.strictEqual(api.getState()[1].target,'text-decoration');
 console.log('Artwork layer tests passed: independent imports, canvas rendering and local metadata persistence.');
})().catch(error=>{console.error(error);process.exit(1);});
