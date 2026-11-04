const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'www');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
for (const file of ['index.html', 'style.css', 'app.js', 'audio-engine.js', 'export.js', 'lyrics-engine.js']) {
  fs.copyFileSync(path.join(root, file), path.join(out, file));
}
console.log('Web app copied to www/');
