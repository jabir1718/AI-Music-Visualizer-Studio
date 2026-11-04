const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function node(extra = {}) {
  return { connections: [], connect(target) { this.connections.push(target); }, disconnect(target) { this.connections = target ? this.connections.filter(x => x !== target) : []; }, ...extra };
}
class FakeSoundTouchNode {
  constructor() { this.connections=[];this.pitchSemitones={value:0,setTargetAtTime(v){this.value=v;}};this.playbackRate={value:1,setTargetAtTime(v){this.value=v;}}; }
  connect(target){this.connections.push(target);}
  disconnect(){this.connections=[];}
}
class FakeFormantNode extends FakeSoundTouchNode {
  constructor(){super();this.formantStrength={value:1,setTargetAtTime(v){this.value=v;}};}
}
class FakeAudioContext {
  constructor() { this.currentTime = 0; this.sampleRate = 48000; this.state = 'running'; this.destination = node(); }
  createAnalyser() { return node({ fftSize: 2048, smoothingTimeConstant: 0, frequencyBinCount: 1024, getByteFrequencyData(a) { a.fill(0); }, getByteTimeDomainData(a) { a.fill(128); } }); }
  createGain() { return node({ gain: { value: 1, setTargetAtTime(v) { this.value = v; } } }); }
  createMediaElementSource(audio) { return node({ audio }); }
  createMediaStreamDestination() { return node({ stream: { getAudioTracks: () => [], getTracks: () => [] } }); }
  createBiquadFilter() { return node({ type: '', frequency: { value: 0 }, gain: { value: 0, setTargetAtTime(v) { this.value = v; } } }); }
  createStereoPanner() { return node({ pan: { value: 0, setTargetAtTime(v) { this.value = v; } } }); }
  createDelay() { return node({ delayTime: { value: 0 } }); }
  createConvolver() { return node({ buffer: null }); }
  createWaveShaper() { return node({ curve: null, oversample: 'none' }); }
  createDynamicsCompressor() { const param=()=>({value:0,setTargetAtTime(v){this.value=v;}});return node({threshold:param(),knee:param(),ratio:param(),attack:param(),release:param()}); }
  createBuffer(channels, length) { return { getChannelData: () => new Float32Array(length) }; }
  async resume() {}
  async close() { this.state = 'closed'; }
}
const window = { AudioContext: FakeAudioContext };
const context = vm.createContext({ window, Uint8Array, Float32Array, Math, performance: { now: () => 1000 } });
vm.runInContext(fs.readFileSync('audio-engine.js', 'utf8'), context);
const Engine = window.AudioEngine;
assert.equal(typeof Engine, 'function', 'AudioEngine should be exported');
const mainAudio = { volume: .85, currentTime: 2, duration: 30, playbackRate: 1 };
(async () => {
  const engine = new Engine(mainAudio);
  await engine.connect();
  assert.ok(engine.mainSoloGain, 'main solo gain node must be initialized');
  assert.ok(engine.mainCompressor,'main dynamics compressor must be initialized');
  assert.ok(engine.mainHigh.connections.includes(engine.mainCompressor),'main EQ should feed main compressor');
  assert.ok(engine.mainCompressor.connections.includes(engine.mainShaper),'main compressor should feed master distortion/pan path');
  await assert.rejects(engine.loadSoundTouch(),/AudioWorklet support/,'unsupported browsers must receive a clear pitch-preserving error');
  await assert.rejects(engine.loadFormantCorrection(),/AudioWorklet support/,'unsupported browsers must receive a clear formant-correction error');
  assert.ok(engine.mainPanner.connections.includes(engine.mainSoloGain), 'main effects chain must route through solo gain');
  assert.ok(engine.gain.connections.includes(engine.mainLow), 'master gain must feed the main EQ chain');
  assert.equal(mainAudio.volume, 1, 'element volume must not double-attenuate master gain');
  engine.setMainSoloMute(true);
  assert.equal(engine.mainSoloGain.gain.value, 0, 'solo must mute original background track');
  engine.setMainSoloMute(false);
  assert.equal(engine.mainSoloGain.gain.value, 1, 'solo off must restore background track');
  engine.setVolume(.6);
  assert.equal(engine.gain.gain.value, .6);
  engine.setMainEQ(4,-3);engine.setMainCompression(50);assert.equal(engine.mainCompressor.ratio.value,6.5,'main compression ratio should respond to amount');engine.setMainPan(.35);engine.setMainDelay(50);engine.setMainReverb(25);engine.setMainDistortion(40);
  assert.equal(engine.mainLow.gain.value,4,'main bass EQ should be independent');
  assert.equal(engine.mainHigh.gain.value,-3,'main treble EQ should be independent');
  assert.equal(engine.mainPanner.pan.value,.35,'main pan should update');
  assert.equal(engine.mainDelaySend.gain.value,.21,'main echo send should update');
  assert.equal(engine.mainReverbSend.gain.value,.12,'main reverb send should update');
  assert.equal(engine.mainShaper.curve.length,44100,'main distortion should apply a real waveshaper curve');
  engine.setMainDistortion(0);assert.equal(engine.mainShaper.curve,null,'zero distortion should bypass waveshaper');
  const layerAudio = { playbackRate: 1, pause() {} };
  engine.addLayer('voice', layerAudio, .7, {});
  engine.SoundTouchNode=FakeSoundTouchNode;engine.soundTouchRegistered=true;engine.FormantCorrectionNode=FakeFormantNode;engine.formantRegistered=true;
  await engine.enableLayerPitchPreserving('voice',5,1.1);
  assert.equal(engine.layers.get('voice').pitchNode.pitchSemitones.value,5,'pitch preserving node should receive semitone value');
  assert.equal(engine.layers.get('voice').pitchNode.playbackRate.value,1.1,'worklet playback rate must mirror source speed');
  assert.equal(layerAudio.playbackRate,1.1,'source playback rate should remain the timeline speed');
  assert.ok(engine.layers.get('voice').compressor.connections.includes(engine.layers.get('voice').pitchNode),'compressor should feed pitch-preserving processor');
  assert.ok(engine.layers.get('voice').pitchNode.connections.includes(engine.layers.get('voice').pan),'pitch processor should feed mixer effects');
  engine.setLayerPitch('voice',-3);engine.setLayerRate('voice',.9);
  assert.equal(engine.layers.get('voice').pitchNode.pitchSemitones.value,-3);
  assert.equal(engine.layers.get('voice').pitchNode.pitchSemitones.value,-3);
  assert.equal(engine.layers.get('voice').pitchNode.playbackRate.value,.9);
  await engine.enableLayerFormantCorrection('voice',4,1.1,.85);
  assert.equal(engine.layers.get('voice').pitchNodeType,'formant','voice layer should switch to formant-correction processor');
  assert.equal(engine.layers.get('voice').pitchNode.formantStrength.value,.85,'formant strength should be applied');
  engine.setLayerFormantStrength('voice',.5);assert.equal(engine.layers.get('voice').pitchNode.formantStrength.value,.5);
  await engine.enableLayerPitchPreserving('voice',-2,.9);
  assert.equal(engine.layers.get('voice').pitchNodeType,'soundtouch','formant processor should switch back to standard pitch processor');
  engine.disableLayerPitchPreserving('voice',1.25);
  assert.equal(engine.layers.get('voice').pitchNode,null,'disable should remove pitch processor');
  assert.ok(engine.layers.get('voice').compressor.connections.includes(engine.layers.get('voice').pan),'disable should restore compressor-to-mixer route');
  assert.ok(!engine.layers.get('voice').compressor.connections.includes(activePitchProcessor),'disabled pitch processor must be disconnected from compressor');
  engine.setLayerVolume('voice', .4);
  engine.setLayerRate('voice', 1.2);
  engine.setLayerEQ('voice', 3, -2);
  engine.setLayerCompression('voice',40);assert.equal(engine.layers.get('voice').compressor.ratio.value,5.4,'per-layer compression should update independently');
  assert.ok(engine.layers.get('voice').high.connections.includes(engine.layers.get('voice').compressor),'layer EQ should feed its independent compressor');
  engine.setLayerPan('voice', .25);
  engine.setLayerDelay('voice', .5);
  engine.setLayerReverb('voice', .5);
  engine.setLayerDistortion('voice', 50);
  assert.equal(engine.layers.get('voice').shaper.curve.length,44100,'per-layer distortion should use its own waveshaper');
  engine.setLayerDistortion('voice',0);assert.equal(engine.layers.get('voice').shaper.curve,null,'per-layer distortion bypasses at zero');
  assert.equal(engine.layers.get('voice').gain.gain.value, .4);
  assert.equal(layerAudio.playbackRate, 1.2);
  assert.equal(engine.layers.get('voice').low.gain.value, 3);
  assert.equal(engine.layers.get('voice').high.gain.value, -2);
  assert.equal(engine.layers.get('voice').pan.pan.value, .25);
  assert.ok(engine.layers.get('voice').pan.connections.includes(engine.layers.get('voice').shaper),'each mixer layer must route through its own distortion node');
  engine.removeLayer('voice');
  assert.equal(engine.layers.has('voice'), false);
  await engine.destroy();
  process.stdout.write('AudioEngine tests passed.\n');
})().catch(error => { console.error(error); process.exitCode = 1; });


// BPM analyser regression test: synthetic 120 BPM pulse train through the
// same decodeAudioData path used by the browser implementation.
class FakeDecodeAudioContext {
  async decodeAudioData() {
    const sampleRate = 16000, duration = 24, length = sampleRate * duration;
    const samples = new Float32Array(length);
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate, beatPhase = t % 0.5;
      const envelope = beatPhase < 0.14 ? 0.85 * Math.exp(-beatPhase * 38) : 0.001;
      samples[i] = envelope * Math.sin(2 * Math.PI * 220 * t);
    }
    return { sampleRate, duration, length, numberOfChannels: 1, getChannelData: () => samples };
  }
  async close() {}
}
(async () => {
  const bpmWindow = { AudioContext: FakeDecodeAudioContext };
  const bpmContext = vm.createContext({ window: bpmWindow, Float32Array, Math });
  vm.runInContext(fs.readFileSync('bpm-engine.js', 'utf8'), bpmContext);
  const audioFile = { type: 'audio/wav', async arrayBuffer() { return new ArrayBuffer(8); } };
  const result = await bpmWindow.WaveForgeBPM.detect(audioFile);
  assert.ok(Math.abs(result.bpm - 120) <= 2, `expected approximately 120 BPM, received ${result.bpm}`);
  assert.ok(result.confidence >= 0 && result.confidence <= 1, 'BPM confidence must be normalized');
  const tapped=bpmWindow.WaveForgeBPM.fromTaps([0,.5,1,1.5,2]);
  assert.equal(tapped.bpm,120,'tap tempo should calculate 120 BPM');
  assert.ok(tapped.confidence>.99,'steady taps should have high consistency');
  assert.throws(()=>bpmWindow.WaveForgeBPM.fromTaps([0,.5]),/three beats/);
  await assert.rejects(
    bpmWindow.WaveForgeBPM.detect({ type: 'text/plain', async arrayBuffer() { return new ArrayBuffer(0); } }),
    /Import an audio track/
  );
  process.stdout.write('BPM analyser tests passed.\\n');
})().catch(error => { console.error(error); process.exitCode = 1; });
