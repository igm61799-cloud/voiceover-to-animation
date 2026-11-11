'use strict';
/* timeline + print post-process + player */
const out = document.getElementById('c'), octx = out.getContext('2d');
const scene = document.createElement('canvas'); scene.width = W; scene.height = H;
const G = scene.getContext('2d');
const DUR = 71.5;
const stub = (g) => { g.fillStyle = C.ink; g.fillRect(0, 0, W, H); };
const fn = (name) => (typeof window[name] === 'function' ? window[name] : stub);
const SHOTS = [
  [0, 6.32, 'S1'], [6.32, 11.85, 'S2'], [11.85, 14.0, 'S3a'], [14.0, 16.68, 'S3b'], [16.68, 18.14, 'S3c'], [18.14, 21.05, 'S3d'],
  [21.05, 23.15, 'S4'], [23.15, 30.62, 'S5'], [30.62, 35.5, 'S6'], [35.5, 38.15, 'S6c'], [38.15, 40.95, 'S7a'], [40.95, 48.62, 'S7b'],
  [48.62, 52.3, 'S9'], [52.3, 57.2, 'S10'], [57.2, 64.0, 'S11'], [64.0, DUR + 1, 'S12']
];
/* textures */
function makeGrain(seed) {
  const c = document.createElement('canvas'); c.width = W / 2; c.height = H / 2; const x = c.getContext('2d'), id = x.createImageData(c.width, c.height), R = rng(seed);
  for (let i = 0; i < id.data.length; i += 4) { const v = 205 + (R() * 50 | 0); id.data[i] = v; id.data[i + 1] = v; id.data[i + 2] = v; id.data[i + 3] = 255; }
  x.putImageData(id, 0, 0); return c;
}
function makeSpecks(seed) {
  const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'), R = rng(seed);
  for (let i = 0; i < 1100; i++) { x.globalAlpha = .12 + R() * .3; x.fillStyle = C.paper; x.beginPath(); x.ellipse(R() * W, R() * H, .6 + R() * 1.9, .6 + R() * 1.5, R() * 3, 0, TAU); x.fill(); }
  for (let i = 0; i < 700; i++) { x.globalAlpha = .1 + R() * .22; x.fillStyle = C.ink; x.beginPath(); x.ellipse(R() * W, R() * H, .6 + R() * 1.8, .6 + R() * 1.4, R() * 3, 0, TAU); x.fill(); }
  x.lineCap = 'round';
  for (let i = 0; i < 26; i++) { x.globalAlpha = .1 + R() * .12; x.strokeStyle = R() > .5 ? C.paper : C.ink; x.lineWidth = 1 + R(); const px = R() * W, py = R() * H, a = R() * TAU, L = 10 + R() * 34; x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + Math.cos(a) * L * .5 + (R() - .5) * 12, py + Math.sin(a) * L * .5 + (R() - .5) * 12, px + Math.cos(a) * L, py + Math.sin(a) * L); x.stroke(); }
  return c;
}
const GRAIN = [makeGrain(1), makeGrain(2), makeGrain(3)], SPECKS = [makeSpecks(4), makeSpecks(5), makeSpecks(6)];
const VIG = (() => { const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'); const gr = x.createRadialGradient(W / 2, H / 2, H * .55, W / 2, H / 2, H * 1.08); gr.addColorStop(0, 'rgba(16,19,42,0)'); gr.addColorStop(1, 'rgba(16,19,42,.42)'); x.fillStyle = gr; x.fillRect(0, 0, W, H); return c; })();
let ROUGH = true;
function present(t) {
  const k = Math.floor(t * 8) % 3;
  octx.setTransform(1, 0, 0, 1, 0, 0); octx.globalAlpha = 1; octx.globalCompositeOperation = 'source-over';
  octx.filter = 'none'; octx.drawImage(scene, 0, 0);
  if (ROUGH) { octx.filter = `url(#rough${k})`; octx.drawImage(scene, -12, -7, W + 24, H + 14); octx.filter = 'none'; }
  octx.globalCompositeOperation = 'multiply'; octx.drawImage(GRAIN[k], 0, 0, W, H);
  octx.globalCompositeOperation = 'source-over'; octx.drawImage(SPECKS[Math.floor(t * 6) % 3], 0, 0); octx.drawImage(VIG, 0, 0);
}
function renderFrame(t) {
  t = clamp(t, 0, DUR - 0.001);
  let shot = SHOTS[SHOTS.length - 1]; for (const s of SHOTS) if (t >= s[0] && t < s[1]) { shot = s; break; }
  G.setTransform(1, 0, 0, 1, 0, 0); G.globalAlpha = 1; G.globalCompositeOperation = 'source-over'; G.setLineDash([]);
  G.save(); fn(shot[2])(G, t, t - shot[0]); G.restore();
  present(t);
}
window.renderFrame = renderFrame;
/* live player (ignored by the offline renderer) */
if (!navigator.webdriver) {
  const vo = document.getElementById('vo'), btn = document.getElementById('play'); btn.style.display = 'flex'; renderFrame(1.2);
  btn.onclick = () => {
    btn.style.display = 'none'; vo.currentTime = 0; vo.play(); const t0 = performance.now();
    const loop = () => { const t = (performance.now() - t0) / 1000; if (t >= DUR) { btn.style.display = 'flex'; return; } renderFrame(!vo.ended && vo.currentTime > 0 ? vo.currentTime : t); requestAnimationFrame(loop); };
    loop();
  };
}
