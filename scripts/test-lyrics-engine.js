'use strict';
const assert=require('assert');
global.window={};
const lyrics=require('../lyrics-engine.js');
const chunks=[
 {text:'Hello',timestamp:[0.12,0.48]},
 {text:'world!',timestamp:[0.51,0.94]},
 {text:'This is',timestamp:[1.1,1.8]},
 {text:'music',timestamp:[2.0,2.4]}
];
const tokens=lyrics.tokensFromResult({chunks},4);
assert.deepStrictEqual(tokens.slice(0,2).map(x=>[x.text,x.start,x.end]),[
 ['Hello',0.12,0.48],['world!',0.51,0.94]
]);
assert.strictEqual(tokens[2].start,1.1);
assert.strictEqual(tokens[2].end,1.45);
assert.strictEqual(tokens[3].start,1.45);
assert.strictEqual(tokens[3].end,1.8);
assert.strictEqual(tokens[0].source,'whisper-word-timestamp');
const lines=lyrics.groupTokens(tokens,3);
assert.strictEqual(lines.length,2);
assert.strictEqual(lines[0].text,'Hello world! This');
assert.strictEqual(lines[0].timingSource,'whisper-word-timestamps');
const estimated=lyrics.tokensFromResult({text:'one two three'},3);
assert.deepStrictEqual(estimated.map(x=>x.source),['estimated','estimated','estimated']);
assert.strictEqual(lyrics.groupTokens(estimated)[0].timingSource,'estimated');
assert.strictEqual(lyrics.tokensFromResult({chunks:[]},2).length,0);
console.log('Whisper word timestamp alignment tests passed.');
