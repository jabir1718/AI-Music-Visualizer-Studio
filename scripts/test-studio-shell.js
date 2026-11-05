'use strict';
const assert = require('assert');
const shell = require('../studio-shell.js');

assert.strictEqual(typeof shell.activatePanel,'function','dashboard must expose its shared panel activation helper');
assert.strictEqual(typeof shell.bindToolButton,'function','dashboard must expose its guarded click binding helper');

const listeners = {};
const button = {
 addEventListener(type,handler){listeners[type]=handler;}
};
const modal = {hidden:true};
const body = {classes:new Set(),classList:{add(name){body.classes.add(name);}}};
const host = {
 children:[],
 replaceChildren(){this.children=[];},
 append(node){this.children.push(node);}
};
const panel = {hidden:true};
let opened = 0;
assert.strictEqual(shell.bindToolButton(button,()=>{
 opened++;
 assert.strictEqual(shell.activatePanel(modal,body,host,panel),true);
}),true,'click listener should attach to an available button');
assert.strictEqual(typeof listeners.click,'function','click listener should be registered');
listeners.click();
assert.strictEqual(opened,1,'simulated click should execute the tool handler');
assert.strictEqual(modal.hidden,false,'simulated click should show the tool modal');
assert.strictEqual(body.classes.has('wf-modal-open'),true,'modal open state should be applied to body');
assert.deepStrictEqual(host.children,[panel],'selected panel should be mounted in modal content');
assert.strictEqual(panel.hidden,false,'selected panel should become visible');

const missingButton={};
assert.strictEqual(shell.bindToolButton(missingButton,()=>{}),false,'missing event targets should fail safely');
assert.strictEqual(shell.activatePanel(modal,body,host,null),false,'missing panels should fail safely');
console.log('Studio shell interaction tests passed: simulated tool click opens and mounts its panel.');
