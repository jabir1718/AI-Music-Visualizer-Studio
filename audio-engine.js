(function(){
  class AudioEngine {
    constructor(audio){this.audio=audio;this.context=null;this.analyser=null;this.source=null;this.gain=null;this.data=null;this.lastBeat=0;this.energy=0;this.ready=false;}
    async connect(){if(this.ready)return;const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)throw new Error('Web Audio is not supported in this browser.');this.context=new Ctx();this.analyser=this.context.createAnalyser();this.analyser.fftSize=2048;this.analyser.smoothingTimeConstant=.78;this.gain=this.context.createGain();this.gain.gain.value=.85;this.source=this.context.createMediaElementSource(this.audio);this.source.connect(this.analyser);this.analyser.connect(this.gain);this.gain.connect(this.context.destination);this.data=new Uint8Array(this.analyser.frequencyBinCount);this.ready=true;}
    async resume(){if(this.context&&this.context.state==='suspended')await this.context.resume();}
    setVolume(v){if(this.gain)this.gain.gain.setTargetAtTime(v,this.context.currentTime,.025);else this.audio.volume=v;}
    getFrequency(){if(!this.analyser)return new Uint8Array(128);this.analyser.getByteFrequencyData(this.data);return this.data;}
    getWaveform(){const a=new Uint8Array(this.analyser?this.analyser.fftSize:128);if(this.analyser)this.analyser.getByteTimeDomainData(a);return a;}
    detectBeat(sensitivity){const f=this.getFrequency();let sum=0;for(let i=2;i<Math.min(18,f.length);i++)sum+=f[i];const low=sum/16;const now=performance.now();const threshold=90-(sensitivity*.55);const hit=low>threshold&&low>this.energy*1.23&&now-this.lastBeat>220;if(hit)this.lastBeat=now;this.energy=this.energy*.82+low*.18;return{hit,energy:low/255};}
    get duration(){return this.audio.duration||0;}
    destroy(){if(this.context)this.context.close();this.ready=false;}
  }
  window.AudioEngine=AudioEngine;
})();