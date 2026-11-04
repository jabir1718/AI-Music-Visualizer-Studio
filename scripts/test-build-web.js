'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const root = path.resolve(__dirname, '..');
const result = spawnSync(process.execPath, [path.join(__dirname, 'build-web.js')], { cwd: root, encoding: 'utf8' });
if (result.status !== 0) throw new Error(result.stderr || 'Web asset build failed.');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const refs = [...html.matchAll(/\b(?:src|href)\s*=\s*["']([^"']+)["']/gi)]
  .map(match => match[1].split(/[?#]/, 1)[0])
  .filter(ref => ref && !ref.startsWith('#') && !/^(?:[a-z]+:)?\/\//i.test(ref) && !ref.startsWith('/'));
for (const ref of refs) {
  const source = path.join(root, decodeURIComponent(ref));
  const built = path.join(root, 'www', decodeURIComponent(ref));
  if (!fs.existsSync(built)) throw new Error('Referenced asset missing from Android web bundle: ' + ref);
  if (!fs.readFileSync(source).equals(fs.readFileSync(built))) throw new Error('Bundled asset differs from source: ' + ref);
}
console.log('Android web bundle test passed: all ' + refs.length + ' local HTML assets are present and byte-identical.');
