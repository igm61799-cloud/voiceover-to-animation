'use strict';
/* engine.js — tiny deterministic Canvas-2D toolkit. Everything here is a pure function of its inputs:
   no Math.random(), no Date.now(), no state carried between frames. That is what makes random-access
   stills and parallel chunk rendering possible. */
/* ---------- constants & math ---------- */
const W = 1920, H = 1080, PI = Math.PI, TAU = Math.PI * 2;
/* default palette (five-ink print look). Reassign entries in scenes.js to restyle the whole film. */
const C = {
  ink: '#10132a', night: '#1a2147', storm: '#303d78', mist: '#8a97c9',
  paper: '#f3e8d0', red: '#e5412b', gold: '#f7b92f', rust: '#a3472c'
};
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const pulse = (t, t0, d) => (t < t0 ? 0 : Math.max(0, 1 - (t - t0) / d));
const E = {
  in: t => t * t * t,
  out: t => 1 - Math.pow(1 - t, 3),
  out5: t => 1 - Math.pow(1 - t, 5),
  inOut: t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  back: t => { if (t <= 0) return 0; const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  bounce: t => { const n = 7.5625, d = 2.75; if (t < 1 / d) return n * t * t; if (t < 2 / d) return n * (t -= 1.5 / d) * t + .75; if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + .9375; return n * (t -= 2.625 / d) * t + .984375; },
  elastic: t => (t === 0 || t === 1 ? t : Math.pow(2, -10 * t) * Math.sin((t * 10 - .75) * TAU / 3) + 1)
};
function hash(n) { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
function noise1(x) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u); }
function rng(seed) { let a = (seed * 2654435761) >>> 0 || 1; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hex(c) { const n = parseInt(c.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function mix(c1, c2, t) { const a = hex(c1), b = hex(c2); t = clamp(t); return `rgb(${Math.round(lerp(a[0], b[0], t))},${Math.round(lerp(a[1], b[1], t))},${Math.round(lerp(a[2], b[2], t))})`; }
function shake(t, amp, seed = 0) { return [(noise1(t * 31 + seed) - .5) * 2 * amp, (noise1(t * 37 + seed + 50) - .5) * 2 * amp]; }

/* ---------- drawing basics ---------- */
function poly(g, pts, fill, stroke, lw) { g.beginPath(); for (let i = 0; i < pts.length; i++) i ? g.lineTo(pts[i][0], pts[i][1]) : g.moveTo(pts[i][0], pts[i][1]); g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw || 4; g.lineJoin = 'round'; g.stroke(); } }
function circ(g, x, y, r, fill, stroke, lw) { g.beginPath(); g.arc(x, y, Math.max(0, r), 0, TAU); if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw || 4; g.stroke(); } }
function line(g, x1, y1, x2, y2, col, w, cap) { g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.strokeStyle = col; g.lineWidth = w; g.lineCap = cap || 'round'; g.stroke(); }
function pathLine(g, pts, col, w, join) { if (pts.length < 2) return; g.beginPath(); for (let i = 0; i < pts.length; i++) i ? g.lineTo(pts[i][0], pts[i][1]) : g.moveTo(pts[i][0], pts[i][1]); g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = join || 'round'; g.stroke(); }
function rr(g, x, y, w, h, r, fill) { g.beginPath(); g.roundRect(x, y, w, h, r); if (fill) { g.fillStyle = fill; g.fill(); } }
function withCam(g, cx, cy, z, rot, fn) { g.save(); g.translate(W / 2, H / 2); g.scale(z, z); if (rot) g.rotate(rot); g.translate(-cx, -cy); fn(); g.restore(); }
function flash(g, a, col) { if (a <= 0) return; g.save(); g.globalAlpha = clamp(a); g.fillStyle = col || C.paper; g.fillRect(0, 0, W, H); g.restore(); }
/* partial polyline (0..1 of total length) */
function partial(pts, p) {
  if (p >= 1) return pts; if (p <= 0) return [pts[0]];
  let tot = 0; const L = []; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); tot += d; }
  let rem = tot * p; const out = [pts[0]];
  for (let i = 1; i < pts.length; i++) { if (rem >= L[i - 1]) { out.push(pts[i]); rem -= L[i - 1]; } else { const k = rem / L[i - 1]; out.push([lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)]); break; } }
  return out;
}
function pointAt(pts, p) { const q = partial(pts, clamp(p)); return q[q.length - 1]; }
/* carved hatch lines (call inside a clip) */
function hatch(g, x, y, w, h, gap, col, lw, ang = -0.6) {
  g.save(); g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round'; g.beginPath();
  const dx = Math.cos(ang), dy = Math.sin(ang), d = Math.hypot(w, h);
  const cx = x + w / 2, cy = y + h / 2;
  for (let o = -d; o <= d; o += gap) { const px = cx - dy * o, py = cy + dx * o; g.moveTo(px - dx * d, py - dy * d); g.lineTo(px + dx * d, py + dy * d); }
  g.stroke(); g.restore();
}
function star4(g, x, y, r, col, rot = 0, pinch = .28) { g.save(); g.translate(x, y); g.rotate(rot); g.beginPath(); for (let i = 0; i < 8; i++) { const a = i * PI / 4, r2 = i % 2 ? r * pinch : r; g.lineTo(Math.cos(a) * r2, Math.sin(a) * r2); } g.closePath(); g.fillStyle = col; g.fill(); g.restore(); }
function burst(g, x, y, r1, r2, n, col, rot = 0) { g.beginPath(); for (let i = 0; i < n * 2; i++) { const a = rot + i * PI / n, r = i % 2 ? r1 : r2; g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } g.closePath(); g.fillStyle = col; g.fill(); }

/* ---------- motifs ---------- */
/* diagonal rain streaks; o: n, ang, speed, len, seed, col, w, alpha, x0, x1, y0, span */
function rain(g, t, o = {}) {
  const n = o.n || 130, ang = o.ang ?? .28, speed = o.speed || 2300, len = o.len || 70, seed = o.seed || 1;
  const x0 = o.x0 ?? -300, x1 = o.x1 ?? W + 600, y0 = o.y0 ?? -200, span = o.span || 1500;
  g.save(); g.strokeStyle = o.col || C.mist; g.lineWidth = o.w || 3.5; g.globalAlpha = o.alpha ?? .55; g.lineCap = 'round'; g.beginPath();
  for (let i = 0; i < n; i++) {
    const bx = lerp(x0, x1, hash(i * 7.13 + seed)), sp = speed * (.7 + .6 * hash(i * 1.7 + seed + 9));
    const y = ((hash(i * 3.71 + seed * 2) * span + t * sp) % span) + y0, x = bx - (y - y0) * ang, L = len * (.5 + hash(i * 1.31 + seed));
    g.moveTo(x, y); g.lineTo(x - L * ang, y + L);
  }
  g.stroke(); g.restore();
}
function cloudBlobs(cx, cy, w, h, seed, t, n) {
  const R = rng(seed), out = [];
  for (let i = 0; i < n; i++) {
    const a = n > 1 ? i / (n - 1) : .5;
    const r = h * (.34 + .3 * Math.sin(a * PI)) * (.8 + R() * .45);
    const x = cx + (a - .5) * (w - h * .6) + (R() - .5) * w * .05 + Math.sin(t * .7 + i * 2.1 + seed) * h * .025;
    const y = cy + (R() - .5) * h * .22 + Math.cos(t * .9 + i * 1.3 + seed) * h * .02;
    out.push([x, y, r, R()]);
  }
  return out;
}
/* woodcut cloud: union of discs + carved spirals; o: fill, carve (null = none), lw, up (fill a slab above), a0 (spin the spirals) */
function cloud(g, cx, cy, w, h, seed, t, o = {}) {
  const n = o.n || Math.max(4, Math.round(w / h * 2.6)), blobs = cloudBlobs(cx, cy, w, h, seed, t, n);
  g.fillStyle = o.fill || C.ink; g.beginPath();
  for (const b of blobs) { g.moveTo(b[0] + b[2], b[1]); g.arc(b[0], b[1], b[2], 0, TAU); }
  if (o.up) g.rect(cx - w / 2 + h * .2, cy - o.up, w - h * .4, o.up);
  g.fill();
  if (o.carve !== null) {
    g.strokeStyle = o.carve || C.storm; g.lineWidth = o.lw || 6; g.lineCap = 'round';
    for (const b of blobs) {
      const a0 = (o.a0 ?? .5) + (b[3] - .5) * .7, turns = 5.2;
      g.beginPath();
      for (let k = 0; k <= 30; k++) { const u = k / 30, th = a0 + u * turns, r = b[2] * .76 * (u < .42 ? 1 : 1 - (u - .42) / .58 * .72); const px = b[0] + Math.cos(th) * r, py = b[1] + Math.sin(th) * r; k ? g.lineTo(px, py) : g.moveTo(px, py); }
      g.stroke();
    }
  }
  return blobs;
}
function boltPts(x1, y1, x2, y2, seed, n = 8, amp = 55) {
  const R = rng(seed), pts = [[x1, y1]], dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  for (let i = 1; i < n; i++) { const a = i / n + (R() - .5) * .45 / n, off = (i % 2 ? 1 : -1) * amp * (.45 + R() * .8); pts.push([x1 + dx * a + nx * off, y1 + dy * a + ny * off]); }
  pts.push([x2, y2]); return pts;
}
function taper(g, pts, w0, w1, col) {
  const n = pts.length; if (n < 2) return; const L = [], Rr = [];
  for (let i = 0; i < n; i++) {
    const p = pts[Math.max(0, i - 1)], q = pts[Math.min(n - 1, i + 1)]; let dx = q[0] - p[0], dy = q[1] - p[1]; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
    const w = lerp(w0, w1, i / (n - 1)) / 2; L.push([pts[i][0] - dy * w, pts[i][1] + dx * w]); Rr.push([pts[i][0] + dy * w, pts[i][1] - dx * w]);
  }
  poly(g, L.concat(Rr.reverse()), col);
}
/* lightning from (x1,y1) to (x2,y2); o: w, n, amp, prog (0..1 reveal), col, core, glow, branches */
function bolt(g, x1, y1, x2, y2, seed, o = {}) {
  const w = o.w || 26, n = o.n || 8, amp = o.amp || 55, prog = o.prog ?? 1, col = o.col || C.paper;
  const pts = boltPts(x1, y1, x2, y2, seed, n, amp), vis = partial(pts, prog);
  const R = rng(seed + 77);
  if (o.branches !== 0) {
    const nb = o.branches || 2;
    for (let b = 0; b < nb; b++) {
      const i = 1 + Math.floor(R() * (n - 2)); const sgn = R() > .5 ? 1 : -1, r1 = R(), r2 = R();
      if (i >= vis.length - 1) continue;
      const p = pts[i], dir = Math.atan2(y2 - y1, x2 - x1) + sgn * (.5 + r1 * .5), len = Math.hypot(x2 - x1, y2 - y1) * (.22 + r2 * .2);
      taper(g, boltPts(p[0], p[1], p[0] + Math.cos(dir) * len, p[1] + Math.sin(dir) * len, seed + b * 13 + 5, 4, amp * .45), w * .45, 2, col);
    }
  }
  if (o.glow) { g.save(); g.globalAlpha = .25; pathLine(g, vis, o.glow, w * 2.6, 'miter'); g.restore(); }
  taper(g, vis, w, w * .28, col);
  if (o.core) taper(g, vis, w * .38, w * .08, o.core);
  return pts;
}
/* two wavy smoke wisps rising from x,y */
function smoke(g, x, y, s, t, a = 1, col) {
  g.save(); g.strokeStyle = col || C.mist; g.lineCap = 'round'; g.lineJoin = 'round'; g.globalAlpha = a;
  for (let j = 0; j < 2; j++) { g.lineWidth = s * .09; g.beginPath(); for (let k = 0; k <= 14; k++) { const u = k / 14, px = x + (j ? .3 : -.25) * s + Math.sin(u * 6 + t * 3.2 + j * 2) * s * .22 * u, py = y - u * s * (1.9 + j * .5); k ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke(); }
  g.restore();
}
/* poof ring, p = 0..1 */
function puff(g, x, y, r, p, col) {
  if (p <= 0 || p >= 1) return; g.save(); g.globalAlpha = 1 - p * p;
  for (let i = 0; i < 7; i++) { const a = i / 7 * TAU + .3, d = r * (.25 + E.out(p) * .9); circ(g, x + Math.cos(a) * d, y + Math.sin(a) * d * .8, r * .34 * (1 - p * .6), col || C.mist); }
  g.restore();
}
/* carved dashes that read as masonry */
function bricks(g, x, y, w, h, seed, col, lw = 4, row = 46) {
  const R = rng(seed); g.save(); g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round'; g.beginPath();
  for (let yy = y + row * .6; yy < y + h; yy += row) { let xx = x + 10 + R() * 40; while (xx < x + w - 30) { const L = 22 + R() * 46; if (R() > .35) { g.moveTo(xx, yy); g.lineTo(Math.min(xx + L, x + w - 10), yy); } xx += L + 18 + R() * 30; } }
  g.stroke(); g.restore();
}
/* twinkling star field; o: w, x0, y0, col */
function stars(g, t, n, seed, y1, o = {}) {
  for (let i = 0; i < n; i++) { const x = hash(i * 3.3 + seed) * (o.w || W) + (o.x0 || 0), y = hash(i * 5.9 + seed) * y1 + (o.y0 || 0), tw = .5 + .5 * Math.sin(t * 3 + i * 2.4); if (hash(i + seed * 3) > .8) star4(g, x, y, 7 + tw * 6, o.col || C.paper, 0, .22); else circ(g, x, y, 1.6 + tw * 1.6, o.col || C.paper); }
}
/* noise ridge silhouette */
function hills(g, y, amp, seed, col, x0 = -200, x1 = W + 200) {
  g.beginPath(); g.moveTo(x0, 2000); for (let x = x0; x <= x1; x += 40) g.lineTo(x, y - noise1(x * .0035 + seed) * amp - noise1(x * .011 + seed * 3) * amp * .3); g.lineTo(x1, 2000); g.closePath(); g.fillStyle = col; g.fill();
}
/* row of little houses; o: col, win (window colour or null), lit, hmin, hmax */
function townRow(g, x0, x1, baseY, seed, o = {}) {
  const R = rng(seed), col = o.col || C.ink, win = o.win, hmin = o.hmin || 50, hmax = o.hmax || 130;
  let x = x0;
  while (x < x1) {
    const w = 60 + R() * 80, h = lerp(hmin, hmax, R()), roof = R();
    g.fillStyle = col; g.fillRect(x, baseY - h, w + 2, h + 4);
    if (roof > .3) poly(g, [[x - 6, baseY - h + 1], [x + w / 2, baseY - h - w * (.3 + R() * .25)], [x + w + 6, baseY - h + 1]], col);
    else { g.fillRect(x + w * .6, baseY - h - 26, 14, 28); }
    if (win) { g.fillStyle = win; const nw = 1 + Math.floor(R() * 2.4); for (let i = 0; i < nw; i++) { if (R() < (o.lit ?? .6)) g.fillRect(x + w * (.2 + i * .34), baseY - h * (.35 + R() * .45), 10, 14); else R(); } }
    x += w;
  }
}
