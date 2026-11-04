'use strict';
const fs=require('fs');
const assert=require('assert');
const app=fs.readFileSync('app.js','utf8');
const images=fs.readFileSync('image-search.js','utf8');
const project=fs.readFileSync('project-file.js','utf8');
for(const id of ['objectSelect','objectTextValue','objectX','objectY','objectScale','objectRotation','objectOpacity','objectColor','objectVisible','objectReset','objectCenter']){
 assert(app.includes(id),'Object editor control missing: '+id);
}
for(const object of ['title','subtitle','lyric','logo']){
 assert(app.includes(object+':{visible:true,scale:1,rotation:0,opacity:1,color:'));
}
assert(/objectSettings,lyrics/.test(app),'Object settings are not persisted in editor settings');
assert(/d\.objectSettings/.test(app),'Object settings are not restored');
assert(/objectSettings\.title\.visible/.test(app)&&/objectSettings\.subtitle\.visible/.test(app),'Text visibility not applied to canvas');
assert(/objectSettings\.lyric\.visible/.test(app)&&/objectSettings\.logo\.visible/.test(app),'Lyric/logo visibility not applied to canvas');
assert(/getMediaAsset\('logo'\)/.test(app)&&/saveMediaAsset\('logo',f\)/.test(app),'Logo media is not restored and persisted');
assert(/getMediaAsset\('background'\)/.test(app)&&/saveMediaAsset\('background',f\)/.test(app),'Background media is not restored and persisted');
assert(/deleteMediaAsset\('logo'\)/.test(app)&&/deleteMediaAsset\('background'\)/.test(app),'Clearing media does not remove saved assets');
assert(/image\/jpeg':'jpg'/.test(images)&&/image\/webp':'webp'/.test(images),'Image import must preserve supported file extensions');
assert(/commons\.wikimedia\.org\/w\/api\.php/.test(images),'Wikimedia Commons search endpoint missing');
assert(/safeName\(item\.title,blob\.type\)/.test(images),'Imported image filename does not use MIME type');
assert(/sourceUrl/.test(images),'Image source/licence page link missing');
assert(/MAX_BYTES=250\*1024\*1024/.test(project),'Portable project media limit missing');
console.log('Object editor and image import regression tests passed.');
