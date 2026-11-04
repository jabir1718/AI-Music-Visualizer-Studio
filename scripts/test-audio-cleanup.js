'use strict';
const assert=require('assert');
const cleanup=require('../audio-cleanup.js');
const sampleRate=16000,duration=2,length=sampleRate*duration;
const samples=new Float32Array(length);
let seed=17;
function random(){seed=(seed*16807)%2147483647;return(seed/2147483647)*2-1;}
for(let i=0;i<length;i++){
 const t=i/sampleRate,noise=random()*.035,voice=t>.5?.22*Math.sin(2*Math.PI*440*t):0;
 samples[i]=noise+voice;
}
const cleaned=cleanup.denoiseChannel(samples,sampleRate,{noiseStart:0,noiseEnd:.45,strength:1.5});
function power(arr,start,end){let sum=0,n=0;for(let i=Math.floor(start*sampleRate);i<Math.floor(end*sampleRate);i++){sum+=arr[i]*arr[i];n++;}return sum/n;}
const beforeNoise=power(samples,0,.45),afterNoise=power(cleaned,0,.45);
const beforeVoice=power(samples,.7,1.8),afterVoice=power(cleaned,.7,1.8);
assert(afterNoise<beforeNoise*.45,'noise-only section should be reduced');
assert(afterVoice>beforeVoice*.45,'voice signal should remain audible');
const wav=cleanup.encodeWav({sampleRate,channels:[cleaned],length:cleaned.length});
assert.strictEqual(wav.type,'audio/wav');
assert.strictEqual(wav.size,44+cleaned.length*2,'WAV header and PCM payload length must match');
console.log('Spectral noise cleanup tests passed.');
