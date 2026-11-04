'use strict';
const fs=require('fs');
const path=require('path');
function addMicrophonePermission(xml){
 if(typeof xml!=='string'||!/<manifest\b[^>]*>/.test(xml))throw new Error('Android manifest root element was not found.');
 if(xml.includes('android.permission.RECORD_AUDIO'))return xml;
 return xml.replace(/(<manifest\b[^>]*>)/,'$1\n    <uses-permission android:name="android.permission.RECORD_AUDIO" />');
}
function patchManifest(filePath=path.join(process.cwd(),'android','app','src','main','AndroidManifest.xml')){
 if(!fs.existsSync(filePath))throw new Error('Generated AndroidManifest.xml was not found at '+filePath);
 const original=fs.readFileSync(filePath,'utf8'),updated=addMicrophonePermission(original);
 if(updated!==original)fs.writeFileSync(filePath,updated,'utf8');
 return updated;
}
if(require.main===module){try{patchManifest();process.stdout.write('Android microphone permission is present.\\n');}catch(error){process.stderr.write(error.message+'\\n');process.exitCode=1;}}
module.exports={addMicrophonePermission,patchManifest};
