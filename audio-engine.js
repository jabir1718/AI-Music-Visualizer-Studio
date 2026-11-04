(function(){
  class AudioEngine {
    constructor(audio){this.audio=audio;this.context=null;this.analyser=null;this.source=null;this.gain=null;this.mainSoloGain=null;this.exportDestination=null;this.monitorGain=null;this.masterVolume=.85;this.data=null;this.lastBeat=0;this.energy=0;this.ready=false;this.layers=new Map();this.reverbBuffer=null;}
    async connect(){
      if(this.ready)return;const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)throw new Error('Web Audio is not supported in this browser.');
      this.context=new Ctx();this.analyser=this.context.createAnalyser();this.analyser.fftSize=2048;this.analyser.smoothingTimeConstant=.78;
      this.gain=this.context.createGain();this.gain.gain.value=this.masterVolume;this.source=this.context.createMediaElementSource(this.audio);
      this.exportDestination=this.context.createMediaStreamDestination();this.monitorGain=this.context.createGain();this.monitorGain.gain.value=0;
      this.source.connect(this.analyser);this.analyser.connect(this.monitorGain);this.monitorGain.connect(this.context.destination);
      this.source.connect(this.gain);this.gain.connect(this.mainSoloGain);this.mainSoloGain.connect(this.context.destination);this.mainSoloGain.connect(this.exportDestination);
      this.data=new Uint8Array(this.analyser.frequencyBinCount);this.ready=true;
    }
    async resume(){if(this.context&&this.context.state==='suspended')await this.context.resume();}
    setMainSoloMute(muted){if(this.mainSoloGain&&this.context)this.mainSoloGain.gain.setTargetAtTime(muted?0:1,this.context.currentTime,.025);}
    setVolume(v){this.masterVolume=v;if(this.gain)this.gain.gain.setTargetAtTime(v,this.context.currentTime,.025);else this.audio.volume=v;}
    applyFade(fadeIn,fadeOut){if(!this.gain||!this.context)return;const t=this.audio.currentTime,d=this.audio.duration||0;let factor=1;if(fadeIn>0&&t<fadeIn)factor=Math.min(factor,t/fadeIn);if(fadeOut>0&&d>0&&t>d-fadeOut)factor=Math.min(factor,Math.max(0,(d-t)/fadeOut));this.gain.gain.setTargetAtTime(this.masterVolume*factor,this.context.currentTime,.035);}
    makeReverbBuffer(){if(this.reverbBuffer)return this.reverbBuffer;const length=Math.floor(this.context.sampleRate*1.8),buffer=this.context.createBuffer(2,length,this.context.sampleRate);for(let ch=0;ch<2;ch++){const data=buffer.getChannelData(ch);for(let i=0;i<length;i++)data[i]=(Math.random()*2-1)*Math.pow(1-i/length,2.8);}this.reverbBuffer=buffer;return buffer;}
    addLayer(id,audio,volume=1,settings={}){
      if(!this.ready)throw new Error('Start the main audio engine before adding a mixer layer.');if(this.layers.has(id))return;
      const c=this.context,source=c.createMediaElementSource(audio),gain=c.createGain(),low=c.createBiquadFilter(),high=c.createBiquadFilter();
      low.type='lowshelf';low.frequency.value=160;high.type='highshelf';high.frequency.value=6500;
      const hasPan=typeof c.createStereoPanner==='function',panner=hasPan?c.createStereoPanner():c.createGain();
      const delay=c.createDelay(1),feedback=c.createGain(),delaySend=c.createGain();delay.delayTime.value=.24;feedback.gain.value=.18;delaySend.gain.value=0;
      const convolver=c.createConvolver(),reverbSend=c.createGain();convolver.buffer=this.makeReverbBuffer();reverbSend.gain.value=0;gain.gain.value=volume;
      source.connect(this.analyser);source.connect(gain);gain.connect(low);low.connect(high);high.connect(panner);panner.connect(c.destination);panner.connect(this.exportDestination);
      high.connect(delay);delay.connect(feedback);feedback.connect(delay);delay.connect(delaySend);delaySend.connect(panner);
      high.connect(convolver);convolver.connect(reverbSend);reverbSend.connect(panner);
      const layer={audio,source,gain,low,high,pan:panner,hasPan,delay,feedback,delaySend,convolver,reverbSend};this.layers.set(id,layer);
      this.setLayerEQ(id,settings.bass||0,settings.treble||0);this.setLayerPan(id,settings.pan||0);this.setLayerDelay(id,settings.delay||0);this.setLayerReverb(id,settings.reverb||0);
    }
    setLayerVolume(id,v){const l=this.layers.get(id);if(l)l.gain.gain.setTargetAtTime(v,this.context.currentTime,.02);}
    setLayerRate(id,v){const l=this.layers.get(id);if(l)l.audio.playbackRate=v;}
    setLayerPan(id,v){const l=this.layers.get(id);if(l&&l.hasPan)l.pan.pan.setTargetAtTime(v,this.context.currentTime,.025);}
    setLayerEQ(id,bass,treble){const l=this.layers.get(id);if(!l)return;l.low.gain.setTargetAtTime(bass,this.context.currentTime,.025);l.high.gain.setTargetAtTime(treble,this.context.currentTime,.025);}
    setLayerDelay(id,v){const l=this.layers.get(id);if(l)l.delaySend.gain.setTargetAtTime(v*.42,this.context.currentTime,.04);}
    setLayerReverb(id,v){const l=this.layers.get(id);if(l)l.reverbSend.gain.setTargetAtTime(v*.48,this.context.currentTime,.06);}
    removeLayer(id){const l=this.layers.get(id);if(!l)return;l.audio.pause();['source','gain','low','high','pan','delay','feedback','delaySend','convolver','reverbSend'].forEach(k=>{try{l[k].disconnect();}catch(e){}});this.layers.delete(id);}
    getExportStream(){return this.exportDestination?this.exportDestination.stream:null;}
    getFrequency(){if(!this.analyser)return new Uint8Array(128);this.analyser.getByteFrequencyData(this.data);return this.data;}
    getWaveform(){const a=new Uint8Array(this.analyser?this.analyser.fftSize:128);if(this.analyser)this.analyser.getByteTimeDomainData(a);return a;}
    detectBeat(sensitivity){const f=this.getFrequency();let sum=0;for(let i=2;i<Math.min(18,f.length);i++)sum+=f[i];const low=sum/16,now=performance.now(),threshold=90-(sensitivity*.55);const hit=low>threshold&&low>this.energy*1.23&&now-this.lastBeat>220;if(hit)this.lastBeat=now;this.energy=this.energy*.82+low*.18;return{hit,energy:low/255};}
    get duration(){return this.audio.duration||0;}
    destroy(){this.layers.forEach(l=>{l.audio.pause();['source','gain','low','high','pan','delay','feedback','delaySend','convolver','reverbSend'].forEach(k=>{try{l[k].disconnect();}catch(e){}});});this.layers.clear();if(this.context)this.context.close();this.ready=false;}
  }
  window.AudioEngine=AudioEngine;
})();