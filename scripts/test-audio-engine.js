const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function node(extra = {}) {
  return { connections: [], connect(target) { this.connections.push(target); }, disconnect() {}, ...extra };
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
  assert.ok(engine.gain.connections.includes(engine.mainSoloGain), 'master gain must route through solo gain');
  assert.equal(mainAudio.volume, 1, 'element volume must not double-attenuate master gain');
  engine.setMainSoloMute(true);
  assert.equal(engine.mainSoloGain.gain.value, 0, 'solo must mute original background track');
  engine.setMainSoloMute(false);
  assert.equal(engine.mainSoloGain.gain.value, 1, 'solo off must restore background track');
  engine.setVolume(.6);
  assert.equal(engine.gain.gain.value, .6);
  const layerAudio = { playbackRate: 1, pause() {} };
  engine.addLayer('voice', layerAudio, .7, {});
  engine.setLayerVolume('voice', .4);
  engine.setLayerRate('voice', 1.2);
  engine.setLayerEQ('voice', 3, -2);
  engine.setLayerPan('voice', .25);
  engine.setLayerDelay('voice', .5);
  engine.setLayerReverb('voice', .5);
  assert.equal(engine.layers.get('voice').gain.gain.value, .4);
  assert.equal(layerAudio.playbackRate, 1.2);
  assert.equal(engine.layers.get('voice').low.gain.value, 3);
  assert.equal(engine.layers.get('voice').high.gain.value, -2);
  assert.equal(engine.layers.get('voice').pan.pan.value, .25);
  engine.removeLayer('voice');
  assert.equal(engine.layers.has('voice'), false);
  await engine.destroy();
  process.stdout.write('AudioEngine tests passed.\n');
})().catch(error => { console.error(error); process.exitCode = 1; });
