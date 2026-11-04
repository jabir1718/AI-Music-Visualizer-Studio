'use strict';
const assert=require('assert');
const segmentation=require('../ai-segmentation.js');
assert.deepStrictEqual(segmentation.getSettings(),{enabled:false});
assert.deepStrictEqual(segmentation.setSettings({enabled:true}),{enabled:true});
assert.deepStrictEqual(segmentation.setSettings({enabled:false}),{enabled:false});
assert.strictEqual(segmentation.draw({},null,0,0,0,0,0,0),false,'disabled segmentation must not alter canvas');
assert.strictEqual(typeof segmentation.loadModel,'function');
console.log('AI segmentation settings and safe-fallback tests passed.');
