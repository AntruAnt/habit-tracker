#!/usr/bin/env node

/**
 * Renders the brand SVGs in assets/brand/ to the PNGs referenced by app.json
 * (app icon, Android adaptive icon layers, splash icon, favicon) using headless Chrome.
 *
 * Usage: node scripts/render-brand-assets.mjs <path-to-chrome-or-chromium>
 */
import { Buffer } from 'node:buffer';
import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const chrome = process.argv[2];
if (!chrome) {
  console.error('Usage: node scripts/render-brand-assets.mjs <path-to-chrome-or-chromium>');
  process.exit(1);
}
const root = join(import.meta.dirname, '..');
const brandDir = join(root, 'assets/brand');
const imagesDir = join(root, 'assets/images');
const workDir = mkdtempSync(join(tmpdir(), 'brand-assets-'));

const inner = (file) =>
  readFileSync(join(brandDir, file), 'utf8')
    .replace(/<svg[^>]*>/, '')
    .replace('</svg>', '')
    .replace(/<!--.*?-->/gs, '');

const markInner = inner('logo-mark.svg');
const monochromeInner = markInner.replaceAll('#1abc9c', '#ffffff');

/**
 * Each job places 100x100 artwork on a square canvas. `scale` is the artwork size as a
 * fraction of the canvas, centered. `background` is a CSS color or transparent.
 */
const jobs = [
  { out: 'icon.png', size: 1024, art: inner('app-icon.svg'), scale: 1, background: '#2c3e50' },
  { out: 'favicon.png', size: 48, art: inner('logo-tile.svg'), scale: 1, background: 'transparent' },
  { out: 'splash-icon.png', size: 512, art: markInner, scale: 1, background: 'transparent' },
  // Adaptive icon: 108dp canvas, 72dp visible, 66dp safe circle. The ring fills ~60% of the visible area.
  { out: 'android-icon-foreground.png', size: 512, art: markInner, scale: 0.52, background: 'transparent' },
  { out: 'android-icon-monochrome.png', size: 432, art: monochromeInner, scale: 0.52, background: 'transparent' },
  { out: 'android-icon-background.png', size: 512, art: '', scale: 1, background: '#2c3e50' },
];

const port = 9334;
const profile = join(workDir, 'profile');
const proc = spawn(chrome, [
  '--headless=new', '--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
  `--remote-debugging-port=${port}`, '--window-size=1200,1200', `--user-data-dir=${profile}`, 'about:blank',
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let page;
for (let i = 0; i < 100 && !page; i++) {
  try {
    const targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
    page = targets.find((t) => t.type === 'page');
  } catch {}
  if (!page) await sleep(200);
}
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r));
let id = 0;
const pending = new Map();
ws.addEventListener('message', (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
});
const send = (method, params = {}) =>
  new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });

await send('Page.enable');
await send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });

for (const { out, size, art, scale, background } of jobs) {
  const artSize = size * scale;
  const offset = (size - artSize) / 2;
  const html = `<!doctype html><html><head><style>
    html, body { margin: 0; background: transparent; }
    .canvas { position: absolute; left: 0; top: 0; width: ${size}px; height: ${size}px; background: ${background}; }
    svg { position: absolute; left: ${offset}px; top: ${offset}px; }
  </style></head><body><div class="canvas">
  <svg xmlns="http://www.w3.org/2000/svg" width="${artSize}" height="${artSize}" viewBox="0 0 100 100">${art}</svg>
  </div></body></html>`;
  const file = join(workDir, `${out}.html`);
  writeFileSync(file, html);
  await send('Page.navigate', { url: `file://${file}` });
  await sleep(400);
  const res = await send('Page.captureScreenshot', {
    format: 'png',
    clip: { x: 0, y: 0, width: size, height: size, scale: 1 },
  });
  writeFileSync(join(imagesDir, out), Buffer.from(res.result.data, 'base64'));
  console.log('wrote', out);
}

await send('Browser.close');
ws.close();
proc.kill('SIGKILL');
rmSync(workDir, { recursive: true, force: true });
process.exit(0);
