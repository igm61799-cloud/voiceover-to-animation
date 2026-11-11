'use strict';
/* ---------- constants & math ---------- */
const W = 1920, H = 1080, PI = Math.PI, TAU = Math.PI * 2;
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
/* woodcut cloud: union of discs + carved spirals */
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
/* lightning */
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
/* bell (pivot at x,y; s ≈ height) */
function bell(g, x, y, s, ang, o = {}) {
  const col = o.col || C.gold, dark = o.dark || C.ink, hi = o.hi || C.paper;
  g.save(); g.translate(x, y); g.rotate(ang);
  g.save(); g.translate(0, s * .5); g.rotate(o.clap || 0); line(g, 0, 0, 0, s * .52, o.clapCol || dark, s * .05); circ(g, 0, s * .56, s * .085, o.clapCol || dark); g.restore();
  if (o.noYoke) circ(g, 0, s * .02, s * .09, null, col, s * .05); else rr(g, -s * .5, -s * .1, s, s * .19, s * .04, o.yoke || dark);
  g.beginPath(); g.moveTo(-s * .2, s * .08); g.bezierCurveTo(-s * .3, s * .28, -s * .28, s * .7, -s * .56, s * .97);
  g.lineTo(s * .56, s * .97); g.bezierCurveTo(s * .28, s * .7, s * .3, s * .28, s * .2, s * .08); g.closePath(); g.fillStyle = col; g.fill();
  g.save(); g.clip();
  line(g, -s, s * .3, s, s * .3, dark, s * .028, 'butt'); line(g, -s, s * .36, s, s * .36, dark, s * .014, 'butt'); line(g, -s, s * .8, s, s * .8, dark, s * .03, 'butt');
  g.strokeStyle = hi; g.lineWidth = s * .05; g.lineCap = 'round'; g.beginPath(); g.moveTo(-s * .13, s * .16); g.bezierCurveTo(-s * .2, s * .4, -s * .2, s * .62, -s * .34, s * .76); g.stroke();
  g.lineWidth = s * .022; g.beginPath(); g.moveTo(-s * .05, s * .18); g.bezierCurveTo(-s * .1, s * .4, -s * .1, s * .55, -s * .16, s * .72); g.stroke();
  if (o.gleam != null) { g.globalAlpha = .9; g.fillStyle = hi; const gx = lerp(-s * 1.0, s * 1.2, o.gleam); g.beginPath(); g.moveTo(gx, 0); g.lineTo(gx + s * .16, 0); g.lineTo(gx - s * .1, s); g.lineTo(gx - s * .26, s); g.fill(); g.beginPath(); g.moveTo(gx + s * .24, 0); g.lineTo(gx + s * .29, 0); g.lineTo(gx + s * .03, s); g.lineTo(gx - s * .02, s); g.fill(); g.globalAlpha = 1; }
  g.restore();
  rr(g, -s * .62, s * .93, s * 1.24, s * .1, s * .05, col);
  g.restore();
}
/* the bell ringer (feet at x,y; s = height) */
function ringer(g, x, y, s, o = {}) {
  const col = o.col || C.red, look = o.look || [0, 0];
  g.save(); g.translate(x, y); g.rotate(o.lean || 0); g.scale(o.sx || 1, o.sy || 1);
  g.fillStyle = col; g.beginPath(); g.moveTo(-s * .15, -s * .7); g.quadraticCurveTo(-s * .2, -s * .3, -s * .28, 0); g.lineTo(s * .28, 0); g.quadraticCurveTo(s * .2, -s * .3, s * .15, -s * .7); g.closePath(); g.fill();
  g.strokeStyle = o.belt || C.paper; g.lineWidth = s * .03; g.lineCap = 'round'; g.beginPath(); g.moveTo(-s * .2, -s * .36); g.lineTo(s * .2, -s * .36); g.moveTo(s * .06, -s * .36); g.lineTo(s * .09, -s * .2); g.stroke();
  circ(g, 0, -s * .8, s * .19, col);
  poly(g, [[-s * .12, -s * .95], [s * .02, -s * 1.06], [s * .1, -s * .94]], col);
  const fx = look[0] * s * .05, fy = look[1] * s * .035, ex = look[0] * s * .03, ey = look[1] * s * .02;
  circ(g, fx, -s * .78 + fy, s * .135, o.face || C.paper);
  if (o.blink) { line(g, fx - s * .075 + ex, -s * .79 + fy, fx - s * .025 + ex, -s * .79 + fy, C.ink, s * .02); line(g, fx + s * .025 + ex, -s * .79 + fy, fx + s * .075 + ex, -s * .79 + fy, C.ink, s * .02); }
  else { const er = s * (o.wide ? .034 : .024); circ(g, fx - s * .05 + ex, -s * .79 + fy + ey, er, C.ink); circ(g, fx + s * .05 + ex, -s * .79 + fy + ey, er, C.ink); }
  if (o.mouth === 'o') circ(g, fx, -s * .715 + fy, s * .022, C.ink);
  if (o.mouth === 'smile') { g.strokeStyle = C.ink; g.lineWidth = s * .018; g.beginPath(); g.arc(fx, -s * .745 + fy, s * .04, .25, PI - .25); g.stroke(); }
  g.restore();
  if (o.hands) for (let i = 0; i < 2; i++) { const sxn = i ? 1 : -1, hx = o.hands[i][0], hy = o.hands[i][1]; line(g, x + sxn * s * .13, y - s * .6, hx, hy, col, s * .1); circ(g, hx, hy, s * .055, o.face || C.paper); }
}
function skeleton(g, x, y, s, k) {
  const body = k ? C.paper : C.ink, bone = k ? C.ink : C.paper;
  g.save(); g.translate(x, y);
  g.fillStyle = body; g.beginPath(); g.moveTo(-s * .17, -s * .7); g.lineTo(-s * .34, 0); g.lineTo(s * .34, 0); g.lineTo(s * .17, -s * .7); g.closePath(); g.fill();
  circ(g, 0, -s * .8, s * .2, body);
  line(g, -s * .13, -s * .62, -s * .42, -s * .95, body, s * .12); line(g, s * .13, -s * .62, s * .42, -s * .95, body, s * .12);
  for (let i = 0; i < 9; i++) { const a = -PI + i * PI / 8, r1 = s * .5, r2 = s * (.66 + .12 * hash(i + k * 5)); line(g, Math.cos(a) * r1, -s * .5 + Math.sin(a) * r1, Math.cos(a) * r2, -s * .5 + Math.sin(a) * r2, C.gold, s * .03); }
  circ(g, 0, -s * .82, s * .13, bone); circ(g, -s * .05, -s * .83, s * .032, body); circ(g, s * .05, -s * .83, s * .032, body);
  line(g, 0, -s * .68, 0, -s * .26, bone, s * .035);
  for (let i = 0; i < 3; i++) line(g, -s * (.12 - i * .015), -s * (.6 - i * .09), s * (.12 - i * .015), -s * (.6 - i * .09), bone, s * .03);
  line(g, -s * .13, -s * .62, -s * .42, -s * .95, bone, s * .03); line(g, s * .13, -s * .62, s * .42, -s * .95, bone, s * .03);
  line(g, 0, -s * .26, -s * .16, -s * .02, bone, s * .03); line(g, 0, -s * .26, s * .16, -s * .02, bone, s * .03);
  g.restore();
}
function smoke(g, x, y, s, t, a = 1, col) {
  g.save(); g.strokeStyle = col || C.mist; g.lineCap = 'round'; g.lineJoin = 'round'; g.globalAlpha = a;
  for (let j = 0; j < 2; j++) { g.lineWidth = s * .09; g.beginPath(); for (let k = 0; k <= 14; k++) { const u = k / 14, px = x + (j ? .3 : -.25) * s + Math.sin(u * 6 + t * 3.2 + j * 2) * s * .22 * u, py = y - u * s * (1.9 + j * .5); k ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke(); }
  g.restore();
}
function sandals(g, x, y, s, t, o = {}) {
  for (const sx of [-1, 1]) { g.save(); g.translate(x + sx * s * .5, y); g.rotate(sx * .12); g.beginPath(); g.ellipse(0, -s * .12, s * .36, s * .13, 0, 0, TAU); g.fillStyle = o.col || C.paper; g.fill(); line(g, -s * .1, -s * .26, s * .14, -s * .12, C.red, s * .09); g.restore(); }
  if (o.smoke !== 0) smoke(g, x, y - s * .3, s, t, o.smoke ?? 1);
}
function puff(g, x, y, r, p, col) {
  if (p <= 0 || p >= 1) return; g.save(); g.globalAlpha = 1 - p * p;
  for (let i = 0; i < 7; i++) { const a = i / 7 * TAU + .3, d = r * (.25 + E.out(p) * .9); circ(g, x + Math.cos(a) * d, y + Math.sin(a) * d * .8, r * .34 * (1 - p * .6), col || C.mist); }
  g.restore();
}
/* eyes in the storm */
function stormEyes(g, x, y, s, open, look, col) {
  if (open <= 0.02) return;
  for (const sx of [-1, 1]) {
    g.save(); g.translate(x + sx * s * 1.45, y); g.rotate(-sx * .24);
    g.beginPath(); g.rect(-s * 1.3, -s * .2 * open, s * 2.6, s * 2); g.clip();
    g.beginPath(); g.ellipse(0, 0, s, s * .58 * open, 0, 0, TAU); g.fillStyle = col || C.gold; g.fill(); g.clip();
    circ(g, (look ? look[0] : 0) * s * .5, (look ? look[1] : 0) * s * .3, s * .3, C.ink);
    g.restore();
  }
}
/* brick-like carved dashes */
function bricks(g, x, y, w, h, seed, col, lw = 4, row = 46) {
  const R = rng(seed); g.save(); g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round'; g.beginPath();
  for (let yy = y + row * .6; yy < y + h; yy += row) { let xx = x + 10 + R() * 40; while (xx < x + w - 30) { const L = 22 + R() * 46; if (R() > .35) { g.moveTo(xx, yy); g.lineTo(Math.min(xx + L, x + w - 10), yy); } xx += L + 18 + R() * 30; } }
  g.stroke(); g.restore();
}
/* bell tower used in several scenes */
function belfry(g, x, o) {
  const tw = o.tw, bw = o.bw, wall = o.wall || C.storm, dark = o.dark || C.ink, carve = o.carve || C.night;
  g.fillStyle = wall; g.fillRect(x - tw / 2, o.floor, tw, o.base - o.floor);
  bricks(g, x - tw / 2, o.floor + 30, tw, o.base - o.floor - 30, 5, carve);
  if (o.cut) { g.fillStyle = dark; g.fillRect(x - tw / 2 + 34, o.floor + 44, tw - 68, o.base - o.floor); }
  g.fillStyle = wall; g.fillRect(x - bw / 2, o.top, bw, o.floor - o.top + 10);
  bricks(g, x - bw / 2, o.top, bw, o.floor - o.top, 9, carve);
  g.fillStyle = wall; g.fillRect(x - bw / 2 - 16, o.top - 18, bw + 32, 24); g.fillRect(x - bw / 2 - 16, o.floor + 2, bw + 32, 26);
  const aw = bw * .62, ah = (o.floor - o.top) * .86;
  g.fillStyle = dark; g.beginPath(); g.moveTo(x - aw / 2, o.floor + 2); g.lineTo(x - aw / 2, o.floor - ah + aw / 2); g.arc(x, o.floor - ah + aw / 2, aw / 2, PI, 0); g.lineTo(x + aw / 2, o.floor + 2); g.fill();
  poly(g, [[x - bw / 2 - 16, o.top - 18], [x, o.apex], [x + bw / 2 + 16, o.top - 18]], o.roof || C.ink);
  g.save(); g.beginPath(); g.moveTo(x - bw / 2 - 16, o.top - 18); g.lineTo(x, o.apex); g.lineTo(x + bw / 2 + 16, o.top - 18); g.clip();
  g.strokeStyle = o.roofCarve || C.storm; g.lineWidth = 5; g.lineCap = 'round'; g.setLineDash([26, 16]);
  for (let yy = o.top - 44; yy > o.apex + 30; yy -= 34) { const hw = (bw / 2 + 16) * (yy - o.apex) / (o.top - 18 - o.apex) - 14; g.beginPath(); g.moveTo(x - hw, yy); g.lineTo(x + hw, yy); g.stroke(); }
  g.setLineDash([]); g.restore();
  const cc = o.cross || C.gold; line(g, x, o.apex + 12, x, o.apex - 62, cc, 9, 'butt'); line(g, x - 22, o.apex - 36, x + 22, o.apex - 36, cc, 9, 'butt');
  return { aw, ah, tip: [x, o.apex - 62], pivot: [x, o.floor - ah + 26] };
}
/* small church silhouettes */
function church(g, x, y, s, v = 0, o = {}) {
  const col = o.col || C.ink, win = o.win || C.gold, R = rng(v * 17 + 3);
  const tw = s * (.26 + R() * .08), th = s * (1.0 + R() * .5), nw = s * (.9 + R() * .4), nh = s * (.5 + R() * .15), side = v % 2 ? 1 : -1;
  g.save(); g.translate(x, y);
  const nx = side > 0 ? tw / 2 - 4 : -tw / 2 - nw + 4;
  g.fillStyle = col; g.fillRect(nx, -nh, nw, nh + 2); poly(g, [[nx - s * .04, -nh], [nx + nw / 2, -nh - s * .3], [nx + nw + s * .04, -nh]], col);
  g.fillRect(-tw / 2, -th, tw, th + 2);
  const sp = v % 3;
  if (sp === 0) poly(g, [[-tw / 2 - 5, -th], [0, -th - s * .55], [tw / 2 + 5, -th]], col);
  else if (sp === 1) { circ(g, 0, -th, tw * .55, col); poly(g, [[-tw * .16, -th - tw * .4], [0, -th - s * .42], [tw * .16, -th - tw * .4]], col); }
  else { g.fillRect(-tw / 2 - 5, -th - s * .06, tw + 10, s * .06); poly(g, [[-tw * .4, -th - s * .05], [0, -th - s * .34], [tw * .4, -th - s * .05]], col); }
  const top = -th - (sp === 0 ? s * .55 : sp === 1 ? s * .42 : s * .34);
  if (o.cross !== 0) { line(g, 0, top + 4, 0, top - s * .16, o.crossCol || col, s * .035, 'butt'); line(g, -s * .055, top - s * .1, s * .055, top - s * .1, o.crossCol || col, s * .035, 'butt'); }
  g.fillStyle = win;
  g.beginPath(); g.roundRect(-tw * .2, -th + s * .1, tw * .4, s * .2, [tw * .2, tw * .2, 0, 0]); g.fill();
  const dn = nx + nw / 2; if (o.door !== 0) { g.fillStyle = o.doorCol || win; g.beginPath(); g.roundRect(dn - s * .08, -s * .24, s * .16, s * .24, [s * .08, s * .08, 0, 0]); g.fill(); }
  g.fillStyle = win; for (let i = 0; i < 2; i++) { g.beginPath(); g.roundRect(nx + nw * (.16 + i * .56), -nh * .78, s * .07, s * .16, [s * .035, s * .035, 0, 0]); g.fill(); }
  g.restore();
  return { top: [x, y + top - s * .16], tw, th, doorX: x + dn };
}
function barrel(g, x, y, s, o = {}) {
  const col = o.col || C.rust, band = o.band || C.ink, w = s * .78;
  g.save(); g.translate(x, y);
  g.beginPath(); g.moveTo(-w * .4, 0); g.bezierCurveTo(-w * .58, -s * .3, -w * .58, -s * .7, -w * .4, -s); g.lineTo(w * .4, -s); g.bezierCurveTo(w * .58, -s * .7, w * .58, -s * .3, w * .4, 0); g.closePath(); g.fillStyle = col; g.fill();
  g.save(); g.clip();
  line(g, -w, -s * .22, w, -s * .22, band, s * .07, 'butt'); line(g, -w, -s * .78, w, -s * .78, band, s * .07, 'butt');
  g.strokeStyle = o.hi || C.gold; g.lineWidth = s * .035; g.lineCap = 'round'; g.beginPath(); g.moveTo(-w * .22, -s * .68); g.quadraticCurveTo(-w * .3, -s * .5, -w * .22, -s * .32); g.stroke();
  g.restore(); g.restore();
}
