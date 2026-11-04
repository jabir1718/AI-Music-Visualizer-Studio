'use strict';
const assert=require('assert');
const timeline=require('../timeline-view.js');
const layer={offset:3,trimStart:2,trimEnd:8,audio:{duration:10}};
assert.deepStrictEqual(timeline.clipLayout(layer,30,40),{left:120,width:240,start:3,end:9,span:6,trimStart:2,trimEnd:8});
assert.strictEqual(timeline.clipLayout({...layer,trimEnd:0},30,20).width,160);
assert.strictEqual(timeline.formatTime(125.9),'02:05');
assert.strictEqual(timeline.clipLayout({...layer,offset:-2},30,40).left,0);
console.log('Visual multitrack timeline layout tests passed.');
