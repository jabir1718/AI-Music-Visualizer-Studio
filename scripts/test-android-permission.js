'use strict';
const assert=require('assert');
const {addMicrophonePermission}=require('./patch-android-manifest.js');
const xml='<?xml version="1.0"?><manifest xmlns:android="http://schemas.android.com/apk/res/android"><application /></manifest>';
const patched=addMicrophonePermission(xml);
assert(patched.includes('android.permission.RECORD_AUDIO'));
assert.strictEqual(addMicrophonePermission(patched),patched,'permission patch must be idempotent');
assert.throws(()=>addMicrophonePermission('<application/>'),/manifest root/);
console.log('Android microphone manifest permission tests passed.');
