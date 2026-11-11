'use strict';
/* ============ S7a — Italy, 1769 ============ */
const ITALY = {
  main: [[6.6, 45.1], [7.0, 45.9], [7.9, 46.0], [8.4, 46.4], [9.3, 46.5], [10.5, 46.9], [12.2, 47.1], [13.7, 46.5], [13.8, 45.6], [13.1, 45.7], [12.3, 45.3], [12.5, 44.6], [12.4, 44.2], [13.6, 43.55], [14.2, 42.4], [15.1, 41.95], [16.2, 41.9], [15.9, 41.55], [17.0, 41.05], [18.1, 40.6], [18.5, 40.1], [18.3, 39.8], [17.9, 40.3], [17.2, 40.45], [16.6, 39.9], [17.15, 39.0], [16.55, 38.4], [16.1, 37.9], [15.65, 37.95], [15.9, 38.7], [16.1, 39.2], [15.7, 40.0], [14.9, 40.6], [14.2, 40.8], [13.6, 41.2], [12.6, 41.45], [12.2, 41.75], [11.6, 42.3], [11.1, 42.4], [10.5, 42.95], [10.3, 43.55], [9.8, 44.1], [8.9, 44.4], [8.2, 44.0], [7.5, 43.8], [7.0, 44.3], [6.9, 44.7]],
  sic: [[12.45, 38.0], [13.3, 38.2], [14.5, 38.05], [15.6, 38.3], [15.1, 37.5], [15.3, 37.05], [15.1, 36.65], [14.3, 37.0], [13.5, 37.3], [12.6, 37.6]],
  sar: [[8.2, 40.9], [9.2, 41.25], [9.75, 40.5], [9.6, 39.2], [9.0, 39.0], [8.45, 39.1], [8.45, 40.1]]
};
const proj = (p) => [1020 + (p[0] - 12.3) * 66, 548 - (p[1] - 42.0) * 89];
function smoothPath(g, pts) {
  const n = pts.length; g.beginPath();
  for (let i = 0; i < n; i++) { const a = pts[i], b = pts[(i + 1) % n], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2; if (!i) { const z = pts[n - 1]; g.moveTo((z[0] + a[0]) / 2, (z[1] + a[1]) / 2); } g.quadraticCurveTo(a[0], a[1], mx, my); }
  g.closePath();
}
function S7a(g, t, u) {
  g.fillStyle = C.ink; g.fillRect(0, 0, W, H);
  const B = proj([10.22, 45.54]);
  const zin = E.in(seg(t, 40.05, 40.95)), z = lerp(1.0 + u * .012, 9, zin);
  withCam(g, lerp(960, B[0], E.out(zin) * .999 + zin * .001), lerp(540, B[1], E.out(zin)), z, lerp(-.02, 0, seg(u, 0, 2)), () => {
    // rhumb lines from a compass rose
    const R0 = [330, 800];
    g.save(); g.globalAlpha = .55; for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; line(g, R0[0], R0[1], R0[0] + Math.cos(a) * 2600, R0[1] + Math.sin(a) * 2600, C.night, 3); } g.restore();
    // sea dashes
    g.save(); g.strokeStyle = C.storm; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath();
    for (let i = 0; i < 150; i++) { const x = hash(i * 2.3) * 2100 - 90 + Math.sin(t * .8 + i) * 6, y = hash(i * 5.1) * 1160 - 40, L = 18 + hash(i * 7.7) * 30; g.moveTo(x, y); g.quadraticCurveTo(x + L / 2, y - 7, x + L, y); }
    g.stroke(); g.restore();
    // land
    const dr = E.inOut(seg(t, 38.25, 39.5)), fill = seg(t, 39.2, 39.7);
    for (const key of ['main', 'sic', 'sar']) {
      const pts = ITALY[key].map(proj);
      smoothPath(g, pts);
      g.save(); g.globalAlpha = fill; g.fillStyle = C.storm; g.fill(); g.clip(); hatch(g, 400, 0, 1300, 1100, 22, C.night, 4, -.5); g.restore();
      smoothPath(g, pts); g.strokeStyle = C.paper; g.lineWidth = 7; g.lineJoin = 'round'; g.lineCap = 'round'; g.setLineDash([5200 * dr, 9000]); g.stroke(); g.setLineDash([]);
    }
    // mountains
    if (fill > 0) { g.save(); g.globalAlpha = fill; for (let i = 0; i < 9; i++) { const p = proj([7.4 + i * .68, 46.25 + Math.sin(i * 1.3) * .2]); pathLine(g, [[p[0] - 16, p[1] + 12], [p[0], p[1] - 12], [p[0] + 16, p[1] + 12]], C.mist, 4, 'miter'); } for (let i = 0; i < 7; i++) { const p = proj([11.2 + i * .62, 44.0 - i * .52]); pathLine(g, [[p[0] - 13, p[1] + 10], [p[0], p[1] - 10], [p[0] + 13, p[1] + 10]], C.mist, 4, 'miter'); } g.restore(); }
    // compass rose
    const ce = E.back(seg(u, .25, .8));
    if (ce > 0) { g.save(); g.translate(R0[0], R0[1]); g.scale(ce, ce); g.rotate(Math.sin(t * .6) * .05); circ(g, 0, 0, 96, null, C.mist, 4); star4(g, 0, 0, 78, C.mist, PI / 4, .2); star4(g, 0, 0, 120, C.paper, 0, .18); poly(g, [[0, -120], [14, 0], [-14, 0]], C.red); circ(g, 0, 0, 9, C.ink); g.restore(); }
    // Brescia
    const be = E.back(seg(t, 39.44, 39.85));
    if (seg(t, 39.44, 39.85) > 0) {
      for (let k = 0; k < 3; k++) { const ph = ((t - 39.44) * .9 + k / 3) % 1; g.save(); g.globalAlpha = (1 - ph) * (1 - zin); circ(g, B[0], B[1], 14 + ph * 80, null, C.gold, 5); g.restore(); }
      star4(g, B[0], B[1], 34 * be / (1 + zin * 3), C.gold, t * .8, .3); circ(g, B[0], B[1], 11 * be / (1 + zin * 2), C.red);
    }
  });
  // iris into the city
  const ir = E.in(seg(t, 40.6, 40.95)); if (ir > 0) { g.save(); g.globalAlpha = 1; circ(g, 960, 540, ir * 1200, C.gold); g.restore(); }
}

/* ============ S7b — Brescia: the strike, and what lay underneath ============ */
function skylineIT(g, x0, x1, baseY, seed, o = {}) {
  const R = rng(seed), col = o.col || C.ink, win = o.win || C.gold, sc = o.sc || 1; let x = x0;
  while (x < x1) {
    const k = R(), w = (50 + R() * 90) * sc;
    g.fillStyle = col;
    if (k < .62) { const h = (60 + R() * 110) * sc; g.fillRect(x, baseY - h, w + 2, h + 4); poly(g, [[x - 5, baseY - h + 1], [x + w * .5, baseY - h - 16 * sc], [x + w + 5, baseY - h + 1]], col);
      g.fillStyle = win; for (let i = 0; i < 3; i++) if (R() < (o.lit ?? .45)) g.fillRect(x + w * (.14 + i * .27), baseY - h * (.3 + R() * .5), 8 * sc, 12 * sc); }
    else if (k < .82) { const h = (190 + R() * 130) * sc, tw = 34 * sc; g.fillRect(x, baseY - h, tw, h + 4); g.fillRect(x - 5 * sc, baseY - h - 8 * sc, tw + 10 * sc, 10 * sc); poly(g, [[x, baseY - h - 6 * sc], [x + tw / 2, baseY - h - 40 * sc], [x + tw, baseY - h - 6 * sc]], col); g.fillStyle = win; if (R() < .7) g.fillRect(x + tw * .32, baseY - h + 16 * sc, tw * .36, 20 * sc); x += tw - w; x += w * .4; }
    else { const h = (90 + R() * 50) * sc, r = w * .5; g.fillRect(x, baseY - h, w, h + 4); g.beginPath(); g.arc(x + w / 2, baseY - h, r * .86, PI, 0); g.fill(); g.fillRect(x + w / 2 - 5 * sc, baseY - h - r - 14 * sc, 10 * sc, 22 * sc); g.fillStyle = win; if (R() < .6) g.fillRect(x + w * .44, baseY - h * .6, 9 * sc, 14 * sc); }
    x += w;
  }
}
const CRACK = [[960, 392], [954, 520], [967, 640], [951, 760], [960, 862], [938, 902], [978, 940], [948, 985], [962, 1034]];
function S7b(g, t, u) {
  g.fillStyle = C.night; g.fillRect(0, 0, W, H);
  const down = E.inOut(seg(t, 44.1, 46.0)), back = E.inOut(seg(t, 45.8, 48.3));
  const z = lerp(lerp(lerp(1.02, .9, E.out(seg(t, 40.95, 43.5))), 1.0, down), .6, back);
  const cy = lerp(lerp(470, 1270, down), 960, back);
  const sh = shake(t, 20 * pulse(t, 41.5, .6));
  const GY = 860;
  withCam(g, 960 + sh[0], cy + sh[1], z, 0, () => {
    stars(g, t, 90, 7, 700, { x0: -1000, w: 3900, y0: -200 });
    const lf = pulse(t, 41.5, .12) > 0 || (t > 41.72 && t < 41.8);
    cloud(g, 960, -260, 4400, 330, 201, t, { up: 600, carve: C.storm, lw: 7 });
    cloud(g, 1250, -40, 1500, 290, 202, t, { carve: lf ? C.paper : C.storm, lw: 7 }); cloud(g, 200, -90, 1300, 260, 203, t, { carve: C.storm, lw: 7 });
    hills(g, 720, 260, 15, C.storm, -1100, 3000);
    // castle on the hill
    g.fillStyle = C.storm; g.fillRect(1520, 470, 190, 80); for (let i = 0; i < 5; i++) g.fillRect(1520 + i * 42, 452, 24, 22); g.fillRect(1590, 410, 50, 70); for (let i = 0; i < 3; i++) g.fillRect(1588 + i * 20, 398, 12, 14);
    skylineIT(g, -1100, 3000, GY - 40, 31, { col: mix(C.night, C.ink, .5), lit: .3, sc: .9 });
    rain(g, t, { n: Math.round(110 * seg(t, 41.6, 43.2)), seed: 12, alpha: .4, x0: -1200, x1: 3400, y0: -300, span: 1300 });
    // San Nazaro
    const body = mix(C.storm, C.ink, .25);
    g.fillStyle = body; g.fillRect(1010, 640, 330, 224); poly(g, [[996, 642], [1175, 548], [1354, 642]], body);
    g.fillRect(905, 500, 110, 364); g.fillRect(897, 488, 126, 16); poly(g, [[903, 490], [960, 392], [1017, 490]], C.ink);
    line(g, 960, 400, 960, 348, C.gold, 8, 'butt'); line(g, 944, 366, 976, 366, C.gold, 8, 'butt');
    bricks(g, 905, 520, 110, 330, 3, C.night, 3, 34);
    const hot = pulse(t, 41.5, 1.6);
    g.fillStyle = mix(C.ink, C.paper, hot); g.beginPath(); g.roundRect(938, 520, 44, 76, [22, 22, 0, 0]); g.fill(); bell(g, 960, 532, 40, Math.sin(t * 2) * .05 + .5 * hot * Math.sin(t * 16));
    g.fillStyle = C.gold; circ(g, 1175, 640, 26, C.gold); for (const wx of [1060, 1270]) { g.beginPath(); g.roundRect(wx, 700, 30, 76, [15, 15, 0, 0]); g.fill(); } g.beginPath(); g.roundRect(1146, 760, 58, 104, [29, 29, 0, 0]); g.fill();
    line(g, 1175, 548, 1175, 512, C.ink, 6, 'butt'); line(g, 1163, 526, 1187, 526, C.ink, 6, 'butt');
    skylineIT(g, -1100, 880, GY + 4, 32, { col: C.ink, lit: .5, sc: 1.15 }); skylineIT(g, 1370, 3000, GY + 4, 33, { col: C.ink, lit: .5, sc: 1.15 });
    // the strike
    const d = t - 41.5;
    if (d >= 0 && d < .5) for (const [o2, sd] of [[0, 3], [.22, 9]]) { const dd = d - o2; if (dd >= 0 && dd < .26) bolt(g, 1180, -20, 960, 350, sd, { w: 40 * (1 - dd * 2.4), amp: 70, n: 8, core: C.gold, glow: C.gold, prog: seg(dd, 0, .04), branches: 3 }); }
    // rampart and earth
    g.fillStyle = C.storm; g.fillRect(-1300, GY, 4500, 110); bricks(g, -1300, GY, 4500, 110, 8, C.night, 4, 36);
    poly(g, [[700, GY + 110], [640, GY - 30], [1280, GY - 30], [1220, GY + 110]], C.storm); bricks(g, 660, GY - 20, 600, 120, 11, C.night, 4, 34);
    g.fillStyle = C.ink; g.fillRect(-1300, GY + 110, 4500, 1600);
    g.save(); g.strokeStyle = C.night; g.lineWidth = 7; g.lineCap = 'round'; g.setLineDash([120, 50, 40, 70]);
    for (let j = 0; j < 9; j++) { g.beginPath(); for (let x = -1300; x <= 3200; x += 80) { const y = GY + 190 + j * 130 + noise1(x * .003 + j * 9) * 70; x === -1300 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke(); }
    g.setLineDash([]); g.restore();
    // the magazine
    for (let r = 0; r < 3; r++) for (let c = 0; c < 7; c++) {
      const bx = 960 + (c - 3) * 236, top = 1040 + r * 236, w = 208, h = 196;
      const rev = seg(t, 44.9 + r * .45 + Math.abs(c - 3) * .16, 45.35 + r * .45 + Math.abs(c - 3) * .16); if (rev <= 0) continue;
      g.save(); g.globalAlpha = rev;
      g.beginPath(); g.moveTo(bx - w / 2, top + h); g.lineTo(bx - w / 2, top + 70); g.quadraticCurveTo(bx - w / 2, top, bx, top); g.quadraticCurveTo(bx + w / 2, top, bx + w / 2, top + 70); g.lineTo(bx + w / 2, top + h); g.closePath();
      g.fillStyle = C.night; g.fill(); g.strokeStyle = C.storm; g.lineWidth = 7; g.stroke();
      const fy = top + h - 3, s = 54;
      for (const [ox, k] of [[-64, 0], [0, 0], [64, 0], [-32, 1], [32, 1], [0, 2]]) barrel(g, bx + ox, fy - k * 48, s);
      g.restore();
    }
    // the current creeping down
    const pc = lerp(lerp(0, .62, E.out(seg(t, 41.52, 41.9))), 1, E.inOut(seg(t, 44.3, 48.4)));
    if (pc > 0) { const vis = partial(CRACK, pc); pathLine(g, vis, C.gold, 9, 'miter'); pathLine(g, vis, C.paper, 3.5, 'miter'); const h = vis[vis.length - 1]; star4(g, h[0], h[1], (22 + Math.sin(t * 40) * 6) / Math.min(1, z + .2), C.paper, t * 3, .25); }
  });
  flash(g, pulse(t, 41.5, .12) + .55 * pulse(t, 41.72, .1));
  flash(g, 1 - seg(t, 40.95, 41.2), C.gold);
}

/* ============ S9 — one strike ============ */
function S9(g, t, u) {
  const BOOM = 50.8, d = t - BOOM, FY = 930, PILE = [860, FY - 62];
  if (d < 0) {
    g.fillStyle = C.night; g.fillRect(0, 0, W, H);
    const sh = shake(t, 5 * pulse(t, 48.62, .5));
    withCam(g, lerp(960, 900, E.inOut(seg(t, 49.2, 50.6))) + sh[0], lerp(540, 600, E.inOut(seg(t, 49.2, 50.6))) + sh[1], lerp(1, 1.22, E.inOut(seg(t, 49.2, 50.7))), 0, () => {
      // vault wall
      g.strokeStyle = C.storm; g.lineWidth = 9; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(300 + i * 560, 620, 330, PI, 0); g.stroke(); }
      bricks(g, -100, 320, 2200, 560, 5, C.storm, 5, 70);
      g.fillStyle = C.storm; g.fillRect(-200, -200, 2400, 330); bricks(g, -200, -100, 2400, 220, 6, C.night, 6, 56);
      g.fillStyle = C.ink; g.fillRect(-200, FY, 2400, 400); line(g, -200, FY, 2200, FY, C.storm, 9, 'butt');
      // barrels
      const s = 236;
      for (const [x, k] of [[1150, 0], [1350, 0], [1550, 0], [1750, 0], [1950, 0], [1250, 1], [1450, 1], [1650, 1], [1850, 1], [1350, 2], [1550, 2], [1750, 2], [1450, 3], [1650, 3]]) barrel(g, x, FY - k * 208, s);
      barrel(g, 150, FY, s); barrel(g, 350, FY, s); barrel(g, 250, FY - 208, s);
      // a keg on its side, spilling
      g.save(); g.translate(560, FY - 78); g.rotate(PI / 2 + .08); barrel(g, 0, 100, 200); g.restore();
      g.beginPath(); g.ellipse(655, FY - 80, 30, 70, .08, 0, TAU); g.fillStyle = C.ink; g.fill();
      g.beginPath(); g.moveTo(640, FY); g.quadraticCurveTo(760, FY - 30, 800, FY - 50); g.quadraticCurveTo(860, FY - 80, 930, FY - 44); g.quadraticCurveTo(1010, FY - 8, 1090, FY); g.closePath(); g.fillStyle = C.ink; g.fill();
      for (let i = 0; i < 46; i++) { const x = 660 + hash(i * 3.1) * 420, hgt = Math.max(0, 60 * Math.exp(-Math.pow((x - 860) / 130, 2))) + 6, y = FY - hash(i * 5.7) * hgt; circ(g, x, y, 2 + hash(i) * 2.5, i % 3 ? C.storm : C.mist); }
      // dim
      const dim = E.inOut(seg(t, 49.2, 50.2)) * .72; flash(g, 0); g.save(); g.globalAlpha = dim; g.fillStyle = C.ink; g.fillRect(-400, -400, 2800, 1900); g.restore();
      // the crack arrives through the ceiling
      const cr = [[905, -200], [880, -90], [915, -20], [872, 60], [884, 132]], cp = E.out(seg(t, 48.62, 49.1));
      pathLine(g, partial(cr, cp), C.gold, 12, 'miter'); pathLine(g, partial(cr, cp), C.paper, 5, 'miter');
      for (let i = 0; i < 8; i++) { const dd = t - 48.75 - i * .05; if (dd > 0 && dd < 1) circ(g, 870 + (hash(i) - .5) * 90, 140 + 700 * dd * dd, 5 * (1 - dd), C.mist); }
      // the spark
      const fall = seg(t, 49.18, 50.44);
      if (cp >= 1 && t < 50.44) {
        const p = Math.pow(fall, 1.7), sx = lerp(884, PILE[0], p) + Math.sin(fall * 9) * 16 * (1 - fall), sy = lerp(132, PILE[1], p);
        g.save(); g.globalAlpha = .14; circ(g, sx, sy, 300, C.gold); g.globalAlpha = .2; circ(g, sx, sy, 150, C.gold); g.restore();
        for (let i = 1; i < 7; i++) { const pf = Math.pow(Math.max(0, fall - i * .025), 1.7); circ(g, lerp(884, PILE[0], pf) + Math.sin((fall - i * .025) * 9) * 16 * (1 - fall), lerp(132, PILE[1], pf), 7 - i, C.gold); }
        star4(g, sx, sy, 34 + Math.sin(t * 46) * 8, C.gold, t * 5, .25); star4(g, sx, sy, 16, C.paper, -t * 5, .3);
      }
      // ignition
      const ig = seg(t, 50.44, BOOM);
      if (ig > 0) {
        for (let i = 0; i < 22; i++) { const a = -PI * hash(i * 2.2), L = (40 + hash(i * 4.1) * 180) * E.out(ig); line(g, PILE[0] + Math.cos(a) * L * .4, PILE[1] + Math.sin(a) * L * .4, PILE[0] + Math.cos(a) * L, PILE[1] + Math.sin(a) * L, i % 2 ? C.gold : C.paper, 6); }
        burst(g, PILE[0], PILE[1], 30 + ig * 60, 70 + ig * 260, 9, C.gold, t * 6); burst(g, PILE[0], PILE[1], 16 + ig * 40, 40 + ig * 150, 7, C.paper, -t * 8);
        pathLine(g, [[PILE[0] - 190 * ig, FY - 14], [PILE[0], PILE[1] + 4], [PILE[0] + 200 * ig, FY - 12]], C.gold, 10);
      }
    });
    flash(g, E.in(seg(t, 50.68, BOOM)));
    return;
  }
  /* ---- the explosion ---- */
  const cx0 = 900, cy0 = 620;
  g.fillStyle = C.red; g.fillRect(0, 0, W, H);
  const sh = shake(t, 46 * Math.exp(-d * 1.6));
  withCam(g, 960 + sh[0], 540 + sh[1], 1.06 + d * .05, Math.sin(d * 30) * .012 * Math.exp(-d * 2), () => {
    burst(g, cx0, cy0, 500, 3200, 22, C.rust, d * .25);
    const e = E.out5(seg(d, 0, .7));
    // ink smoke ring
    for (let i = 0; i < 18; i++) { const a = i / 18 * TAU + d * .2, R = 250 + e * 900 + d * 160; circ(g, cx0 + Math.cos(a) * R, cy0 + Math.sin(a) * R, 250 + hash(i) * 120 + d * 60, C.ink); }
    for (let i = 0; i < 18; i++) { const a = i / 18 * TAU + d * .2, R = 250 + e * 900 + d * 160, r = 250 + hash(i) * 120 + d * 60; g.strokeStyle = C.storm; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.arc(cx0 + Math.cos(a) * R, cy0 + Math.sin(a) * R, r * .7, a + 2.2, a + 4.2); g.stroke(); }
    burst(g, cx0, cy0, (360 + d * 120) * e, (980 + d * 200) * e, 16, C.red, -d * .5);
    burst(g, cx0, cy0, (270 + d * 90) * e, (760 + d * 120) * e, 13, C.gold, d * .7);
    const inner = E.out5(seg(d, 0, .35)) * (1 - E.in(seg(d, .5, 1.4)));
    burst(g, cx0, cy0, 200 * inner, 520 * inner, 11, C.paper, -d);
    // debris flying at the lens
    for (let i = 0; i < 34; i++) {
      const a = hash(i * 1.9) * TAU, v = 500 + hash(i * 3.7) * 1100, p = E.out(seg(d, 0, 1.5)), x = cx0 + Math.cos(a) * v * p, y = cy0 + Math.sin(a) * v * p + 260 * d * d, sc = (.5 + hash(i * 5.3)) * (1 + d * 1.3), rot = d * (4 + hash(i * 7.1) * 9) * (i % 2 ? 1 : -1);
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(sc, sc);
      const k = i % 5;
      if (i === 3) bell(g, 0, -90, 180, 0, {});
      else if (i === 8) { line(g, 0, -90, 0, 90, C.gold, 20, 'butt'); line(g, -50, -36, 50, -36, C.gold, 20, 'butt'); }
      else if (k === 0) { rr(g, -44, -22, 88, 44, 6, C.storm); line(g, -24, 0, 20, 0, C.night, 5); }
      else if (k === 1) { rr(g, -10, -70, 20, 140, 8, C.rust); line(g, -10, -30, 10, -30, C.ink, 8, 'butt'); }
      else if (k === 2) { g.beginPath(); g.ellipse(0, 0, 60, 34, 0, 0, TAU); g.strokeStyle = C.ink; g.lineWidth = 11; g.stroke(); }
      else if (k === 3) poly(g, [[-36, 20], [-10, -30], [34, -8], [22, 28]], C.ink);
      else poly(g, [[-30, 14], [0, -26], [30, 14]], C.paper);
      g.restore();
    }
  });
  flash(g, 1 - seg(d, 0, .14));
  // smoke swallows the frame
  const cl = E.inOut(seg(d, .85, 1.5));
  if (cl > 0) for (let i = 0; i < 16; i++) { const a = i / 16 * TAU, R = lerp(1500, 260, cl); circ(g, 960 + Math.cos(a) * R * 1.3, 540 + Math.sin(a) * R * .8, 470 * cl + 120, C.ink); if (cl > .98) { g.fillStyle = C.ink; g.fillRect(0, 0, W, H); } }
}
