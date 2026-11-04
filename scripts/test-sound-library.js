'use strict';
const assert=require('assert');
const fs=require('fs');
const vm=require('vm');
const window={};
vm.runInNewContext(fs.readFileSync('sound-library.js','utf8'),{window,URLSearchParams,encodeURIComponent,fetch:async()=>({ok:true,json:async()=>({query:{pages:{}}})}),Number,String,RegExp});
const api=window.WaveForgeSoundLibrary;
assert(api,'Sound library API should load');
assert.equal(api.isAudioMime('audio/ogg'),true);
assert.equal(api.isAudioMime('image/png'),false);
const url=api.makeSearchUrl('race car engine');
assert(url.includes('gsrsearch=race+car+engine'));
assert(url.includes('iiprop=url%7Cmime%7Csize%7Cextmetadata'));
const items=api.normalisePages({query:{pages:{
 1:{title:'File:Engine rev.ogg',imageinfo:[{url:'https://upload.wikimedia.org/a.ogg',mime:'audio/ogg',size:1000,extmetadata:{LicenseShortName:{value:'CC BY-SA'}}}]},
 2:{title:'File:Photo.png',imageinfo:[{url:'https://upload.wikimedia.org/a.png',mime:'image/png',size:1000}]}
}}});
assert.equal(items.length,1);
assert.equal(items[0].license,'CC BY-SA');
assert(items[0].source.includes('commons.wikimedia.org/wiki/'));
console.log('Open sound library search and licence metadata tests passed.');
