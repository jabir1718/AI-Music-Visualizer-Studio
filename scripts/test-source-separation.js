'use strict';
const assert=require('assert');
const utils=require('../source-separation-utils.js');
assert.strictEqual(utils.MODEL_CHOICES.length,4);
assert.strictEqual(utils.validateAudioFile(null),'Choose an audio file or use the current background song.');
assert.strictEqual(utils.validateAudioFile({type:'image/png',size:10}),'Choose a supported audio file.');
assert.match(utils.validateAudioFile({type:'audio/mpeg',size:utils.MAX_FILE_BYTES+1}),/30 MB/);
assert.strictEqual(utils.validateAudioFile({type:'audio/mpeg',size:1024}),'');
const vocalPrimary=utils.mapStemOutputs(['secondary-url','primary-url'],'vocals');
assert.deepStrictEqual(vocalPrimary.map(x=>[x.stem,x.role,x.url]),[
 ['instrumental','Instrumental','secondary-url'],['vocals','Voice','primary-url']
]);
const instrumentalPrimary=utils.mapStemOutputs(['secondary-url','primary-url'],'instrumental');
assert.deepStrictEqual(instrumentalPrimary.map(x=>[x.stem,x.role,x.url]),[
 ['vocals','Voice','secondary-url'],['instrumental','Instrumental','primary-url']
]);
assert.match(utils.progressLabel({stage:'loading-model',fraction:.5},'Kim_Vocal_2'),/50%/);
assert.match(utils.progressLabel({stage:'demixing',chunk:2,totalChunks:8},'Kim_Vocal_2'),/2 \\/ 8/);
assert.strictEqual(utils.stemFilename('song.mp3','vocals'),'song-vocals.wav');
assert.throws(()=>utils.mapStemOutputs(['only-one'],'vocals'),/both vocal and instrumental/);
console.log('On-device AI source separation helpers passed.');
