(function(){
  class AudioEngine {
    constructor(audio){
      this.audio=audio;this.context=null;this.analyser=null;this.source=null;this.gain=null;
      this.exportDestination=null;this.masterVolume=.85;this.data=null;this.lastBeat=0;
      this.energy=0;this.ready=false;this.layers=new Map();
    }
    async connect(){
      if(this.ready)return;
      const Ctx=window.AudioContext||window.webkitAudioContext;
      if(!Ctx)throw new Error('Web Audio is not supported in this browser.');
      this.context=new Ctx();this.analyser=this.context.createAnalyser();
      this.analyser.fftSize=2048;this.analyser.smoothingTimeConstant=.78;
      this.gain=this.context.createGain();this.gain.gain.value=this.masterVolume;
      this.source=this.context.createMediaElementSource(this.audio);
      this.source.connect(this.analyser);this.analyser.connect(this.gain);
      this.gain.connect(this.context.destination);
      this.exportDestination=this.context.createMediaStreamDestination();
      this.gain.connect(this.exportDestination);
      this.data=new Uint8Array(this.analyser.frequencyBinCount);this.ready=true;
    }
    async resume(){if(this.context&&this.context.state==='suspended')await this.context.resume();}
    setVolume(v){this.masterVolume=v;if(this.gain)this.gain.gain.setTargetAtTime(v,this.context.currentTime,.025);else this.audio.volume=v;}
    applyFade(fadeIn,fadeOut){
      if(!this.gain||!this.context)return;
      const t=this.audio.currentTime,d=this.audio.duration||0;let factor=1;
      if(fadeIn>0&&t<fadeIn)factor=Math.min(factor,t/fadeIn);
      if(fadeOut>0&&d>0&&t>d-fadeOut)factor=Math.min(factor,Math.max(0,(d-t)/fadeOut));
      this.gain.gain.setTargetAtTime(this.masterVolume*factor,this.context.currentTime,.035);
    }
    addLayer(id,audio,volume=1){
      if(!this.ready)throw new Error('Start the main audio engine before adding a mixer layer.');
      if(this.layers.has(id))return;
      const source=this.context.createMediaElementSource(audio),gain=this.context.createGain();
      gain.gain.value=volume;source.connect(gain);gain.connect(this.analyser);
      this.layers.set(id,{audio,source,gain});
    }
    setLayerVolume(id,volume){
      const layer=this.layers.get(id);if(layer)layer.gain.gain.setTargetAtTime(volume,this.context.currentTime,.02);
    }
    setLayerRate(id,rate){
      const layer=this.layers.get(id);if(layer)layer.audio.playbackRate=rate;
    }
    removeLayer(id){
      const layer=this.layers.get(id);if(!layer)return;
      layer.audio.pause();layer.source.disconnect();layer.gain.disconnect();this.layers.delete(id);
    }
    getExportStream(){return this.exportDestination?this.exportDestination.stream:null;}
    getFrequency(){if(!this.analyser)return new Uint8Array(128);this.analyser.getByteFrequencyData(this.data);return this.data;}
    getWaveform(){const a=new Uint8Array(this.analyser?this.analyser.fftSize:128);if(this.analyser)this.analyser.getByteTimeDomainData(a);return a;}
    detectBeat(sensitivity){
      const f=this.getFrequency();let sum=0;
      for(let i=2;i<Math.min(18,f.length);i++)sum+=f[i];
      const low=sum/16,now=performance.now(),threshold=90-(sensitivity*.55);
      const hit=low>threshold&&low>this.energy*1.23&&now-this.lastBeat>220;
      if(hit)this.lastBeat=now;this.energy=this.energy*.82+low*.18;
      return{hit,energy:low/255};
    }
    get duration(){return this.audio.duration||0;}
    destroy(){
      this.layers.forEach((layer)=>{layer.audio.pause();layer.source.disconnect();layer.gain.disconnect();});
      this.layers.clear();if(this.context)this.context.close();this.ready=false;
    }
  }
  window.AudioEngine=AudioEngine;
})();