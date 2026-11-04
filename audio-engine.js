(function(){
  class AudioEngine {
    constructor(audio){this.audio=audio;this.context=null;this.analyser=null;this.source=null;this.gain=null;this.mainSoloGain=null;this.exportDestination=null;this.monitorGain=null;this.masterVolume=.85;this.data=null;this.lastBeat=0;this.energy=0;this.ready=false;this.layers=new Map();this.reverbBuffer=null;this.mainLow=null;this.mainHigh=null;this.mainPanner=null;this.mainDelay=null;this.mainFeedback=null;this.mainDelaySend=null;this.mainConvolver=null;this.mainReverbSend=null;this.mainShaper=null;this.SoundTouchNode=null;this.soundTouchLoadPromise=null;this.soundTouchRegistered=false;}
    async connect(){
      if(this.ready)return;const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)throw new Error('Web Audio is not supported in this browser.');
      this.context=new Ctx();this.analyser=this.context.createAnalyser();this.analyser.fftSize=2048;this.analyser.smoothingTimeConstant=.78;
      this.gain=this.context.createGain();this.gain.gain.value=this.masterVolume;this.mainSoloGain=this.context.createGain();this.mainSoloGain.gain.value=1;this.audio.volume=1;this.source=this.context.createMediaElementSource(this.audio);
      this.exportDestination=this.context.createMediaStreamDestination();this.monitorGain=this.context.createGain();this.monitorGain.gain.value=0;
      this.source.connect(this.analyser);this.analyser.connect(this.monitorGain);this.monitorGain.connect(this.context.destination);
      this.mainLow=this.context.createBiquadFilter();this.mainLow.type='lowshelf';this.mainLow.frequency.value=160;this.mainHigh=this.context.createBiquadFilter();this.mainHigh.type='highshelf';this.mainHigh.frequency.value=6500;this.mainPanner=typeof this.context.createStereoPanner==='function'?this.context.createStereoPanner():this.context.createGain();this.mainDelay=this.context.createDelay(1);this.mainDelay.delayTime.value=.24;this.mainFeedback=this.context.createGain();this.mainFeedback.gain.value=.18;this.mainDelaySend=this.context.createGain();this.mainDelaySend.gain.value=0;this.mainConvolver=this.context.createConvolver();this.mainConvolver.buffer=this.makeReverbBuffer();this.mainReverbSend=this.context.createGain();this.mainReverbSend.gain.value=0;this.mainShaper=this.context.createWaveShaper();this.mainShaper.curve=null;this.mainShaper.oversample='2x';
      this.source.connect(this.gain);this.gain.connect(this.mainLow);this.mainLow.connect(this.mainHigh);this.mainHigh.connect(this.mainShaper);this.mainShaper.connect(this.mainPanner);this.mainPanner.connect(this.mainSoloGain);this.mainSoloGain.connect(this.context.destination);this.mainSoloGain.connect(this.exportDestination);this.mainHigh.connect(this.mainDelay);this.mainDelay.connect(this.mainFeedback);this.mainFeedback.connect(this.mainDelay);this.mainDelay.connect(this.mainDelaySend);this.mainDelaySend.connect(this.mainPanner);this.mainHigh.connect(this.mainConvolver);this.mainConvolver.connect(this.mainReverbSend);this.mainReverbSend.connect(this.mainPanner);
      this.data=new Uint8Array(this.analyser.frequencyBinCount);this.ready=true;
    }
    async resume(){if(this.context&&this.context.state==='suspended')await this.context.resume();}
    async loadSoundTouch(){
      if(this.soundTouchRegistered)return true;
      if(!this.context||!this.context.audioWorklet)throw new Error('Pitch-preserving processing requires AudioWorklet support in a secure browser context.');
      if(!this.soundTouchLoadPromise){
        this.soundTouchLoadPromise=(async()=>{
          const mod=await import('https://cdn.jsdelivr.net/npm/@soundtouchjs/audio-worklet@2.1.1/+esm');
          const Node=mod.SoundTouchNode||(mod.default&&mod.default.SoundTouchNode);
          if(!Node)throw new Error('SoundTouch processor module did not expose SoundTouchNode.');
          await Node.register(this.context,'https://cdn.jsdelivr.net/npm/@soundtouchjs/audio-worklet@2.1.1/.dist/soundtouch-processor.js');
          this.SoundTouchNode=Node;this.soundTouchRegistered=true;return true;
        })().catch(error=>{this.soundTouchLoadPromise=null;throw error;});
      }
      return this.soundTouchLoadPromise;
    }
    async enableLayerPitchPreserving(id,semitones=0,rate=1){
      const layer=this.layers.get(id);if(!layer)throw new Error('Mixer layer not found.');
      await this.loadSoundTouch();
      if(layer.pitchNode){this.setLayerPitch(id,semitones);this.setLayerRate(id,rate);return true;}
      const node=new this.SoundTouchNode({context:this.context});
      layer.high.disconnect(layer.pan);layer.high.disconnect(layer.delay);layer.high.disconnect(layer.convolver);layer.high.connect(node);node.connect(layer.pan);node.connect(layer.delay);node.connect(layer.convolver);layer.pitchNode=node;
      node.pitchSemitones.value=Math.max(-12,Math.min(12,Number(semitones)||0));
      node.playbackRate.value=Math.max(.5,Math.min(2,Number(rate)||1));
      layer.audio.preservesPitch=false;layer.audio.playbackRate=node.playbackRate.value;return true;
    }
    disableLayerPitchPreserving(id,rate=1){
      const layer=this.layers.get(id);if(!layer)return;
      if(layer.pitchNode){try{layer.high.disconnect(layer.pitchNode);}catch(e){}try{layer.pitchNode.disconnect();}catch(e){}layer.pitchNode=null;layer.high.connect(layer.pan);layer.high.connect(layer.delay);layer.high.connect(layer.convolver);}
      layer.audio.preservesPitch=false;layer.audio.playbackRate=rate;
    }
    setLayerPitch(id,semitones){const layer=this.layers.get(id);if(layer&&layer.pitchNode)layer.pitchNode.pitchSemitones.setTargetAtTime(Math.max(-12,Math.min(12,Number(semitones)||0)),this.context.currentTime,.025);}

    setMainSoloMute(muted){if(this.mainSoloGain&&this.context)this.mainSoloGain.gain.setTargetAtTime(muted?0:1,this.context.currentTime,.025);}
    setVolume(v){this.masterVolume=v;if(this.gain)this.gain.gain.setTargetAtTime(v,this.context.currentTime,.025);else this.audio.volume=v;}
    setMainEQ(bass,treble){if(!this.context||!this.mainLow)return;this.mainLow.gain.setTargetAtTime(bass,this.context.currentTime,.025);this.mainHigh.gain.setTargetAtTime(treble,this.context.currentTime,.025);}
    setMainPan(value){if(!this.context||!this.mainPanner||!this.mainPanner.pan)return;this.mainPanner.pan.setTargetAtTime(Math.max(-1,Math.min(1,value)),this.context.currentTime,.025);}
    setMainDelay(value){if(this.mainDelaySend&&this.context)this.mainDelaySend.gain.setTargetAtTime(Math.max(0,Math.min(100,value))*.0042,this.context.currentTime,.04);}
    setMainReverb(value){if(this.mainReverbSend&&this.context)this.mainReverbSend.gain.setTargetAtTime(Math.max(0,Math.min(100,value))*.0048,this.context.currentTime,.06);}
    setMainDistortion(value){if(!this.mainShaper)return;const amount=Math.max(0,Math.min(100,Number(value)||0));if(amount===0){this.mainShaper.curve=null;return;}const samples=44100,curve=new Float32Array(samples),k=amount*.32;for(let i=0;i<samples;i++){const x=i*2/samples-1;curve[i]=(1+k)*x/(1+k*Math.abs(x));}this.mainShaper.curve=curve;}
    applyFade(fadeIn,fadeOut){if(!this.gain||!this.context)return;const t=this.audio.currentTime,d=this.audio.duration||0;let factor=1;if(fadeIn>0&&t<fadeIn)factor=Math.min(factor,t/fadeIn);if(fadeOut>0&&d>0&&t>d-fadeOut)factor=Math.min(factor,Math.max(0,(d-t)/fadeOut));this.gain.gain.setTargetAtTime(this.masterVolume*factor,this.context.currentTime,.035);}
    makeReverbBuffer(){if(this.reverbBuffer)return this.reverbBuffer;const length=Math.floor(this.context.sampleRate*1.8),buffer=this.context.createBuffer(2,length,this.context.sampleRate);for(let ch=0;ch<2;ch++){const data=buffer.getChannelData(ch);for(let i=0;i<length;i++)data[i]=(Math.random()*2-1)*Math.pow(1-i/length,2.8);}this.reverbBuffer=buffer;return buffer;}
    addLayer(id,audio,volume=1,settings={}){
      if(!this.ready)throw new Error('Start the main audio engine before adding a mixer layer.');if(this.layers.has(id))return;
      const c=this.context,source=c.createMediaElementSource(audio),gain=c.createGain(),low=c.createBiquadFilter(),high=c.createBiquadFilter();
      low.type='lowshelf';low.frequency.value=160;high.type='highshelf';high.frequency.value=6500;
      const hasPan=typeof c.createStereoPanner==='function',panner=hasPan?c.createStereoPanner():c.createGain();
      const delay=c.createDelay(1),feedback=c.createGain(),delaySend=c.createGain(),shaper=c.createWaveShaper();delay.delayTime.value=.24;feedback.gain.value=.18;delaySend.gain.value=0;shaper.curve=null;shaper.oversample='2x';
      const convolver=c.createConvolver(),reverbSend=c.createGain();convolver.buffer=this.makeReverbBuffer();reverbSend.gain.value=0;gain.gain.value=volume;
      source.connect(this.analyser);source.connect(gain);gain.connect(low);low.connect(high);high.connect(panner);panner.connect(shaper);shaper.connect(c.destination);shaper.connect(this.exportDestination);
      high.connect(delay);delay.connect(feedback);feedback.connect(delay);delay.connect(delaySend);delaySend.connect(panner);
      high.connect(convolver);convolver.connect(reverbSend);reverbSend.connect(panner);
      const layer={audio,source,gain,low,high,pan:panner,hasPan,delay,feedback,delaySend,convolver,reverbSend,shaper,pitchNode:null};this.layers.set(id,layer);
      this.setLayerEQ(id,settings.bass||0,settings.treble||0);this.setLayerPan(id,settings.pan||0);this.setLayerDelay(id,settings.delay||0);this.setLayerReverb(id,settings.reverb||0);this.setLayerDistortion(id,(settings.distortion||0)*100);
    }
    setLayerVolume(id,v){const l=this.layers.get(id);if(l)l.gain.gain.setTargetAtTime(v,this.context.currentTime,.02);}
    setLayerRate(id,v){const l=this.layers.get(id);if(!l)return;l.audio.playbackRate=v;if(l.pitchNode)l.pitchNode.playbackRate.setTargetAtTime(Math.max(.5,Math.min(2,Number(v)||1)),this.context.currentTime,.025);}
    setLayerPan(id,v){const l=this.layers.get(id);if(l&&l.hasPan)l.pan.pan.setTargetAtTime(v,this.context.currentTime,.025);}
    setLayerEQ(id,bass,treble){const l=this.layers.get(id);if(!l)return;l.low.gain.setTargetAtTime(bass,this.context.currentTime,.025);l.high.gain.setTargetAtTime(treble,this.context.currentTime,.025);}
    setLayerDelay(id,v){const l=this.layers.get(id);if(l)l.delaySend.gain.setTargetAtTime(v*.42,this.context.currentTime,.04);}
    setLayerReverb(id,v){const l=this.layers.get(id);if(l)l.reverbSend.gain.setTargetAtTime(v*.48,this.context.currentTime,.06);}
    setLayerDistortion(id,value){const l=this.layers.get(id);if(!l||!l.shaper)return;const amount=Math.max(0,Math.min(100,Number(value)||0));if(amount===0){l.shaper.curve=null;return;}const samples=44100,curve=new Float32Array(samples),k=amount*.32;for(let i=0;i<samples;i++){const x=i*2/samples-1;curve[i]=(1+k)*x/(1+k*Math.abs(x));}l.shaper.curve=curve;}
    removeLayer(id){const l=this.layers.get(id);if(!l)return;l.audio.pause();['source','gain','low','high','pan','delay','feedback','delaySend','convolver','reverbSend','shaper','pitchNode'].forEach(k=>{try{if(l[k])l[k].disconnect();}catch(e){}});this.layers.delete(id);}
    getExportStream(){return this.exportDestination?this.exportDestination.stream:null;}
    getFrequency(){if(!this.analyser)return new Uint8Array(128);this.analyser.getByteFrequencyData(this.data);return this.data;}
    getWaveform(){const a=new Uint8Array(this.analyser?this.analyser.fftSize:128);if(this.analyser)this.analyser.getByteTimeDomainData(a);return a;}
    detectBeat(sensitivity){const f=this.getFrequency();let sum=0;for(let i=2;i<Math.min(18,f.length);i++)sum+=f[i];const low=sum/16,now=performance.now(),threshold=90-(sensitivity*.55);const hit=low>threshold&&low>this.energy*1.23&&now-this.lastBeat>220;if(hit)this.lastBeat=now;this.energy=this.energy*.82+low*.18;return{hit,energy:low/255};}
    get duration(){return this.audio.duration||0;}
    destroy(){this.layers.forEach(l=>{l.audio.pause();['source','gain','low','high','pan','delay','feedback','delaySend','convolver','reverbSend','shaper','pitchNode'].forEach(k=>{try{if(l[k])l[k].disconnect();}catch(e){}});});this.layers.clear();if(this.context)this.context.close();this.ready=false;}
  }
  window.AudioEngine=AudioEngine;
})();