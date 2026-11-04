'use strict';
const fs=require('fs');
const path=require('path');
function addMicrophonePermission(xml){
 if(typeof xml!=='string'||!xml.includes('<manifest'))throw new Error('Android manifest root element was not found.');
 if(xml.includes('android.permission.RECORD_AUDIO'))return xml;
 const match=xml.match(/<manifest\b[^>]*>/);
 if(!match)throw new Error('Android manifest opening tag could not be parsed.');
 return xml.replace(match[0],match[0]+'\n    <uses-permission android:name="android.permission.RECORD_AUDIO" />');
}
if(require.main===module){
 const file=process.argv[2];if(!file)throw new Error('Pass the generated AndroidManifest.xml path.');
 const resolved=path.resolve(file);const xml=fs.readFileSync(resolved,'utf8');fs.writeFileSync(resolved,addMicrophonePermission(xml),'utf8');
 console.log('Android RECORD_AUDIO permission enabled.');
}
module.exports={addMicrophonePermission};
