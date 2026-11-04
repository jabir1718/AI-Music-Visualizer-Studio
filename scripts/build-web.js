'use strict';
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'www');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const assets = new Set(['index.html']);
const references = html.matchAll(/\\b(?:src|href)\\s*=\\s*["']([^"']+)["']/gi);

for (const match of references) {
  const reference = match[1].split(/[?#]/, 1)[0];
  if (!reference || reference.startsWith('#') || /^(?:[a-z]+:)?\\/\\//i.test(reference) || reference.startsWith('/')) continue;
  const source = path.resolve(root, decodeURIComponent(reference));
  if (source !== root && !source.startsWith(root + path.sep)) {
    throw new Error('Asset path escapes project root: ' + reference);
  }
  if (!fs.existsSync(source) || !fs.statSync(source).isFile()) {
    throw new Error('Referenced web asset is missing: ' + reference);
  }
  assets.add(path.relative(root, source));
}

fs.rmSync(out, { recursive: true, force: true });
for (const asset of assets) {
  const destination = path.join(out, asset);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(path.join(root, asset), destination);
}
console.log('Web app copied to www/ (' + assets.size + ' local assets).');
