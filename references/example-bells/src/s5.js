'use strict';
/* ============ S10 — across the city ============ */
const CITY = (() => {
  const R = rng(77), blocks = [], rot = -.14, O = [585, 690];
  for (let i = -9; i <= 9; i++) for (let j = -6; j <= 6; j++) {
    if (R() < .07) { R(); R(); R(); R(); R(); R(); continue; }
    const cx = i * 124 + (R() - .5) * 14, cy = j * 100 + (R() - .5) * 12, w = 106 - R() * 20, h = 84 - R() * 18;
    const x = 960 + cx * Math.cos(rot) - cy * Math.sin(rot), y = 540 + cx * Math.sin(rot) + cy * Math.cos(rot), jr = R(), sd = R();
    if (((x - 960) / 930) ** 2 + ((y - 540) / 540) ** 2 > 1 + (jr - .5) * .12) continue;
    blocks.push({ x, y, w, h, r: rot + (jr - .5) * .06, sd, dist: Math.hypot(x - O[0], y - O[1]) });
  }
  const dots = [];
  for (let i = 0; i < 1500; i++) { const a = R() * TAU, rr2 = Math.sqrt(R()) * (430 + R() * 60); dots.push([O[0] + Math.cos(a) * rr2, O[1] + Math.sin(a) * rr2 * .92, rr2, R(), R()]); }
  return { blocks, dots, O, rot };
})();
function S10(g, t, u) {
  g.fillStyle = C.ink; g.fillRect(0, 0, W, H);
  const O = CITY.O, RAD = 440;
  const Rr = E.out(seg(t, 52.5, 54.7)) * 1250, mourn = E.inOut(seg(t, 55.0, 55.7));
  const sh = shake(t, 16 * pulse(t, 52.4, 1.2));
  withCam(g, lerp(900, 960, E.out(seg(u, 0, 2.5))) + sh[0] + mourn * -120 * seg(t, 55, 57.2), 540 + sh[1] + mourn * 40 * seg(t, 55, 57.2), lerp(1.16, 1.02, E.out(seg(u, 0, 2.6))) + .1 * E.inOut(seg(t, 55, 57.2)), 0, () => {
    // fields outside the walls
    g.save(); g.globalAlpha = .7; for (let i = 0; i < 16; i++) { const a = i / 16 * TAU + .2, x = 960 + Math.cos(a) * 1130, y = 540 + Math.sin(a) * 690; g.save(); g.beginPath(); g.ellipse(x, y, 170, 120, a, 0, TAU); g.clip(); hatch(g, x - 200, y - 200, 400, 400, 18, C.night, 4, a + i); g.restore(); } g.restore();
    // walls with bastions
    const wp = []; for (let i = 0; i < 40; i++) { const a = i / 40 * TAU, k = i % 4 === 0 ? 1.115 : 1.045; wp.push([960 + Math.cos(a) * 955 * k, 540 + Math.sin(a) * 560 * k]); }
    poly(g, wp, null, mix(C.storm, C.mist, .4 * (1 - mourn)), 9);
    // blocks
    for (const b of CITY.blocks) {
      const gone = b.dist < RAD + (b.sd - .5) * 90, dp = Rr - b.dist, hitT = dp > 0;
      const wob = hitT ? Math.exp(-dp * .006) * Math.sin(dp * .05) * 9 : 0, dx = (b.x - O[0]) / (b.dist || 1), dy = (b.y - O[1]) / (b.dist || 1);
      g.save(); g.translate(b.x + dx * wob, b.y + dy * wob); g.rotate(b.r);
      if (gone && hitT) {
        const p = clamp(dp / 260);
        g.setLineDash([10, 12]); g.strokeStyle = C.night; g.lineWidth = 4; g.strokeRect(-b.w / 2, -b.h / 2, b.w, b.h); g.setLineDash([]);
        for (let k = 0; k < 6; k++) { const a = hash(b.sd * 90 + k) * TAU, d = (10 + hash(b.sd * 50 + k) * 46) * E.out(p), s = (16 - k * 1.6) * (1 - p * .55); g.save(); g.translate(Math.cos(a) * d + dx * 30 * E.out(p), Math.sin(a) * d + dy * 30 * E.out(p)); g.rotate(a + p * 3); g.globalAlpha = 1 - mourn * .6; g.fillStyle = p < .3 ? C.gold : k % 2 ? C.red : C.rust; g.fillRect(-s / 2, -s / 2, s, s * .7); g.restore(); }
      } else {
        g.globalAlpha = 1 - mourn * .6;
        rr(g, -b.w / 2, -b.h / 2, b.w, b.h, 5, hitT && dp < 60 ? C.mist : C.storm);
        line(g, -b.w / 2 + 12, 0, b.w / 2 - 12, 0, C.night, 4);
        if (b.sd > .7) rr(g, -b.w * .18, -b.h * .2, b.w * .36, b.h * .4, 3, C.ink);
        if (b.sd < .12) { line(g, 0, -14, 0, 14, C.paper, 5, 'butt'); line(g, -9, -4, 9, -4, C.paper, 5, 'butt'); }
        if (b.sd > .3 && b.sd < .6) circ(g, b.w * .25, b.h * .22, 3.5, C.gold);
      }
      g.restore();
    }
    // the shockwave
    const ra = 1 - seg(t, 53.6, 54.8);
    if (Rr > 0 && ra > 0) { g.save(); g.globalAlpha = ra; circ(g, O[0], O[1], Rr, null, C.red, 34 * ra + 6); circ(g, O[0], O[1], Rr * .93, null, C.gold, 10 * ra + 2); g.globalAlpha = ra * .25; circ(g, O[0], O[1], Rr * .8, null, C.red, 60); g.restore(); }
    // crater
    const cr = E.out(seg(t, 52.4, 53.2));
    burst(g, O[0], O[1], 40 * cr, 78 * cr, 11, mix(C.red, C.rust, mourn), .3); circ(g, O[0], O[1], 44 * cr, C.ink);
    for (let i = 0; i < 5; i++) { const ph = ((t * .25 + i / 5) % 1), a = 1 - ph; g.save(); g.globalAlpha = a * .5 * cr * (1 - mourn); circ(g, O[0] + ph * 120 + Math.sin(ph * 6 + i) * 20, O[1] - ph * 200, 30 + ph * 60, C.night); g.restore(); }
    // the people: thousands of small lights, leaving
    if (t > 55.1) for (const d of CITY.dots) {
      const on = seg(t, 55.12 + d[3] * .4, 55.42 + d[3] * .4), ts = 55.85 + d[2] / 430 * .5 + d[4] * .55, lv = Math.max(0, t - ts), a = on * clamp(1 - lv / 1.0);
      if (a <= 0) continue; g.globalAlpha = a; circ(g, d[0] + Math.sin(lv * 4 + d[3] * 9) * 5, d[1] - lv * lv * 70 - lv * 14, 3.6 - lv * 1.2, lv > .05 ? C.paper : C.gold);
    }
    g.globalAlpha = 1;
  });
  // out of the smoke
  const sm = 1 - E.out(seg(u, 0, .7)); if (sm > 0) for (let i = 0; i < 16; i++) { const a = i / 16 * TAU, R2 = lerp(1500, 260, sm); circ(g, 960 + Math.cos(a) * R2 * 1.3, 540 + Math.sin(a) * R2 * .8, 470 * sm + 120 * sm, C.ink); }
}

/* ============ S11 — the safest object / an insult to heaven ============ */
function S11(g, t, u) {
  g.fillStyle = C.paper; g.fillRect(0, 0, W, H);
  const e = E.inOut(seg(t, 59.45, 60.4)), tilt = E.inOut(seg(t, 60.45, 61.35));
  const z = lerp(1.04 + u * .012, .6, e) + .07 * E.inOut(seg(t, 62.2, 64));
  const cy = lerp(540, -430, tilt);
  const H0 = [960, -720];
  const anger = E.inOut(seg(t, 62.25, 62.9));
  const sh = shake(t, 7 * anger);
  withCam(g, 960 + sh[0], cy + sh[1], z, 0, () => {
    // heaven
    if (tilt > 0) {
      g.save(); g.globalAlpha = tilt;
      burst(g, H0[0], H0[1], 700, 3400, 20, mix(C.gold, C.red, anger), t * .05);
      circ(g, H0[0], H0[1], 880, mix(C.paper, C.gold, .35));
      burst(g, H0[0], H0[1], 800, 960, 36, mix(C.gold, C.red, anger), -t * .08);
      poly(g, [[960, -1250], [470, -420], [1450, -420]], C.gold, C.ink, 16);
      // the eye
      const nar = E.back(seg(t, 61.75, 62.12)), lookDown = E.inOut(seg(t, 61.5, 61.75));
      const lx = lerp(Math.sin(t * 1.4) * 46, 0, lookDown), ly = lerp(-18 + Math.cos(t * 1.1) * 10, 52, lookDown);
      const eye = () => { g.beginPath(); g.moveTo(690, -700); g.quadraticCurveTo(960, -930, 1230, -700); g.quadraticCurveTo(960, -470, 690, -700); g.closePath(); };
      eye(); g.fillStyle = C.paper; g.fill();
      g.save(); eye(); g.clip();
      circ(g, 960 + lx, -700 + ly, 104, C.storm); circ(g, 960 + lx, -700 + ly, 50 - nar * 12, C.ink); circ(g, 930 + lx, -728 + ly, 15, C.paper);
      for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; line(g, 960 + lx + Math.cos(a) * 62, -700 + ly + Math.sin(a) * 62, 960 + lx + Math.cos(a) * 92, -700 + ly + Math.sin(a) * 92, C.mist, 5); }
      // the lid comes down
      if (nar > 0) { const yS = lerp(-940, -775, nar), yC = lerp(-940, -690, nar); poly(g, [[640, -1000], [1280, -1000], [1280, yS], [960, yC], [640, yS]], C.gold); pathLine(g, [[660, yS], [960, yC], [1260, yS]], C.ink, 20, 'miter'); }
      g.restore();
      eye(); g.strokeStyle = C.ink; g.lineWidth = 14; g.lineJoin = 'round'; g.stroke();
      // clouds of glory
      for (let i = 0; i < 11; i++) { const a = PI * .12 + i / 10 * PI * .76, R2 = 720 + (i % 2) * 70, jx = (hash(Math.floor(t * 14) + i) - .5) * 14 * anger; const x = H0[0] + Math.cos(a) * R2 * 1.25 + jx, y = H0[1] + Math.sin(a) * R2 + 60;
        cloud(g, x, y, 420, 170, 300 + i, t, { fill: anger > .5 && Math.floor(t * 10 + i) % 5 === 0 ? C.paper : C.mist, carve: C.paper, lw: 6 }); }
      if (anger > .3) for (let i = 0; i < 4; i++) { if (Math.floor(t * 9 + i * 2.3) % 4) continue; const a = PI * (.25 + i * .17), x = H0[0] + Math.cos(a) * 880, y = H0[1] + Math.sin(a) * 720 + 80; bolt(g, x, y, x + (960 - x) * .25, y + 190, 60 + i + Math.floor(t * 9), { w: 14, amp: 22, n: 4, branches: 0, col: C.ink }); }
      g.restore();
    }
    // specimen page
    if (e < 1) { g.save(); g.globalAlpha = 1 - e; g.strokeStyle = C.ink; g.lineWidth = 7; g.strokeRect(46, 44, W - 92, H - 88); g.lineWidth = 2.5; g.strokeRect(64, 62, W - 128, H - 124);
      const k = E.out(seg(u, .5, 1.1)); line(g, 640, 660, 640 + 640 * k, 660, C.ink, 4, 'butt'); for (let i = 0; i <= 16 * k; i++) line(g, 640 + i * 40, 660, 640 + i * 40, 660 + (i % 4 ? 14 : 28), C.ink, 4, 'butt');
      g.save(); g.beginPath(); g.rect(650, 566, 620 * E.out(seg(u, .15, .7)), 26); g.clip(); hatch(g, 640, 560, 660, 40, 12, C.mist, 4, -.9); g.restore();
      for (const [cx2, cy2] of [[130, 120], [1790, 120], [130, 960], [1790, 960]]) star4(g, cx2, cy2, 22, C.ink, PI / 4, .25);
      g.restore(); }
    // the roof arrives underneath
    const rf = E.out5(seg(t, 59.85, 60.5));
    if (rf > 0) { const oy = (1 - rf) * 1000; poly(g, [[960, 760 + oy], [-200, 1700 + oy], [2120, 1700 + oy]], C.ink);
      g.save(); g.beginPath(); g.moveTo(960, 760 + oy); g.lineTo(-200, 1700 + oy); g.lineTo(2120, 1700 + oy); g.clip(); g.strokeStyle = C.storm; g.lineWidth = 8; g.setLineDash([46, 26]); for (let y = 860; y < 1700; y += 60) { g.beginPath(); g.moveTo(-200, y + oy); g.lineTo(2200, y + oy); g.stroke(); } g.setLineDash([]); g.restore(); }
    // the rod itself
    const B = [lerp(640, 960, e), lerp(540, 762, e)], th = lerp(0, -PI / 2, e), len = 640 * E.out(seg(u, .1, .6));
    const tr = anger * Math.sin(t * 60) * 3;
    g.save(); g.translate(B[0] + tr, B[1]); g.rotate(th);
    line(g, 0, 0, Math.max(0, len - 36), 0, C.ink, 17, 'butt'); if (len > 60) poly(g, [[len - 40, -8.5], [len, 0], [len - 40, 8.5]], C.ink);
    rr(g, -6, -15, 46, 30, 4, C.ink); rr(g, -14, -30, 12, 60, 3, C.ink);
    line(g, 70, -3.5, Math.max(70, len - 80), -3.5, C.mist, 3, 'butt');
    const gl = seg(t, 58.74, 59.4); if (gl > 0 && gl < 1) { const gx = lerp(40, 600, E.inOut(gl)), s = Math.sin(gl * PI); star4(g, gx, -4, 64 * s, C.gold, t * 3, .2); star4(g, gx, -4, 30 * s, C.paper, -t * 3, .28); }
    g.restore();
  });
}

/* ============ shared storm-and-tower set (S1 + S12) ============ */
const TWR = { TX: 1180, FLOOR: 1030, T: { tw: 300, bw: 330, floor: 790, top: 600, apex: 470, base: 1500, cut: true } };
function stormTower(g, t, o) {
  const { TX, FLOOR, T } = TWR, BY = 650;
  townRow(g, -700, 2700, 1034, 4, { col: mix(C.night, C.ink, .55), hmin: 40, hmax: 120, win: o.lit ? C.gold : null, lit: .25 });
  rain(g, t, { n: 110, seed: 3, alpha: .3, len: 46, w: 3, x0: -800, x1: 3200, y0: -600, span: 1900 });
  for (const tk of o.rings || []) { const age = t - tk; if (age < 0 || age > 1.8) continue; const r = 90 + age * 500; g.save(); g.globalAlpha = (1 - age / 1.8) * .95; g.strokeStyle = C.paper; g.lineWidth = 10 - age * 3.5; g.lineCap = 'round'; g.beginPath(); g.arc(TX, BY, r, PI * 1.02, PI * 1.98); g.stroke(); g.restore(); }
  for (const b of o.bolts || []) { const d = t - b[0]; if (d >= 0 && d < .3) bolt(g, b[1], b[2] ?? -20, b[3] ?? b[1] + 60, b[4] ?? 1010, b[5] || 3, { w: (b[6] || 22) * (1 - d * 2.4), amp: 60, n: 9, core: C.gold, prog: seg(d, 0, .05), branches: 3 }); }
  const fl = o.fl;
  cloud(g, 960, -330, 4200, 280, 13, t, { up: 500, carve: C.storm });
  cloud(g, 1780, -210, 1300, 260, 12, t, { carve: fl ? C.mist : C.storm });
  cloud(g, 520, -150, 1500, 340, 11, t, { carve: fl ? C.paper : C.storm, lw: 7 });
  stormEyes(g, 640, -105, 52, o.eyes ?? 0, o.look || [.75, .6]);
  const B = belfry(g, TX, T);
  g.fillStyle = C.ink; g.fillRect(-800, FLOOR, 3800, 600);
  const ry = o.ropeY;
  line(g, TX, T.floor - 10, TX, ry, C.rope, 7, 'butt');
  for (let i = 0; i < 4; i++) line(g, TX, ry - 78 + i * 20, TX, ry - 68 + i * 20, i % 2 ? C.paper : C.red, 15, 'butt');
  bell(g, TX, B.pivot[1] - 6, 132, o.ang, { clap: o.clap, col: o.hot && Math.floor(t * 24) % 2 ? C.paper : C.gold });
  return { tip: [TX, T.apex - 62], B };
}
function ropeCurrent(g, t, y0, y1) {
  const { TX } = TWR, pts = [[TX, y0]], R2 = rng(Math.floor(t * 30) + 3), n = 16;
  for (let k = 1; k <= n; k++) pts.push([TX + (R2() - .5) * 34, lerp(y0, y1, k / n)]);
  pathLine(g, pts, C.gold, 9, 'miter'); pathLine(g, pts, C.paper, 3.5, 'miter');
}
function roomClip(g) { const { TX, T } = TWR; g.beginPath(); g.rect(TX - 116, T.floor + 44, 232, 700); g.clip(); }

/* ============ S12 — meanwhile ============ */
function S12(g, t, u) {
  const { TX, FLOOR } = TWR, S = 120, ZAP = 68.92;
  g.fillStyle = C.night; g.fillRect(0, 0, W, H);
  const push = E.inOut(seg(t, 67.62, 68.5)), drift = seg(t, 64, 67.7);
  const z = lerp(lerp(.8, .92, drift), 2.3, push), cx = lerp(lerp(960, 1000, drift), TX, push), cy = lerp(lerp(405, 440, drift), 905, push);
  const BOLTS = [[64.55, 180, -30, 260, 1005, 3, 20], [65.62, 2020, -60, 1900, 1005, 5, 24], [66.42, 470, -10, 560, 1005, 7, 28], [67.22, 1640, -60, 1560, 1005, 9, 34]];
  let amp = .68; const dz = t - ZAP;
  const nxt = 70.0, grabT = nxt + .95;
  if (dz > 0) amp = .68 * Math.exp(-dz * 1.0) + (t > grabT ? .5 * seg(t, grabT, grabT + .5) : 0);
  const sw = Math.sin(TAU * t / 1.0), ang = amp * sw, clap = -amp * 1.1 * Math.sin(TAU * (t - .14)), ropeY = 920 + 20 * sw * (amp / .68);
  const rings = []; for (let k = 0; k < 10; k++) { const tk = 64.25 + k * .5; if (tk < ZAP) rings.push(tk); } if (t > grabT + .2) rings.push(grabT + .25);
  let shk = 16 * pulse(t, ZAP, .5); for (const b of BOLTS) shk += 6 * pulse(t, b[0], .3);
  const sh = shake(t, shk);
  withCam(g, cx + sh[0], cy + sh[1], z, 0, () => {
    const eyeOpen = dz < -.3 ? 1 : dz < 0 ? .45 : 1;
    const set = stormTower(g, t, { ang, clap, ropeY, rings, bolts: BOLTS, eyes: eyeOpen, look: [.8, .65], fl: dz > -.25 && dz < 0 && Math.floor(t * 24) % 2, hot: dz > 0 && dz < .4, lit: true });
    if (dz >= 0 && dz < .34) bolt(g, 840, 20, set.tip[0], set.tip[1], 5 + (dz > .17 ? 3 : 0), { w: 36 * (1 - dz * 2), amp: 70, core: C.gold, glow: C.gold, n: 7, prog: seg(dz, 0, .05), branches: 3 });
    g.save(); roomClip(g);
    const x = 1112;
    if (dz < .05) { const bob = 1 + .05 * sw; ringer(g, x, FLOOR, S, { hands: [[TX - 3, ropeY - 34], [TX + 3, ropeY - 58]], look: [.6, -.5], lean: .08, sy: bob, blink: true, mouth: 'smile' });
      // a little tune of obliviousness
      for (let i = 0; i < 2; i++) { const ph = ((t * .9 + i * .5) % 1); g.save(); g.globalAlpha = (1 - ph) * push; const nx = x - 46 - ph * 26 + Math.sin(ph * 7 + i) * 8, ny = FLOOR - 128 - ph * 50; circ(g, nx, ny, 6, C.paper); line(g, nx + 5, ny, nx + 5, ny - 20, C.paper, 3); line(g, nx + 5, ny - 20, nx + 14, ny - 15, C.paper, 3); g.restore(); } }
    else if (dz < .46) skeleton(g, x + (hash(Math.floor(t * 30)) - .5) * 8, FLOOR - 16, S * 1.04, Math.floor(t * 24) % 2);
    else { puff(g, x, FLOOR - 60, 62, (dz - .46) / .4); sandals(g, x, FLOOR - 2 - (1 - E.bounce(seg(dz, .46, .84))) * 30, 34, t, { smoke: seg(dz, .62, .95) * .9 }); }
    // and the next one reports for duty
    if (t > nxt) {
      const e = E.out(seg(t, nxt, nxt + .4)), nx = lerp(1350, 1252, e), hop = Math.abs(Math.sin(e * PI * 3)) * 16 * (1 - e);
      const lookUp = seg(t, nxt + .72, nxt + .86), grab = E.out(seg(t, grabT - .12, grabT));
      const hy = ropeY - 44, hands = grab > 0 ? [[lerp(nx - 20, TX - 3, grab), lerp(FLOOR - 60, hy + 10, grab)], [lerp(nx + 20, TX + 3, grab), lerp(FLOOR - 60, hy - 14, grab)]] : null;
      ringer(g, nx, FLOOR - hop, S, { hands, look: [lerp(-1, -.6, lookUp), lerp(.9, -.8, lookUp)], lean: -.08 * grab, sy: 1 + (t > grabT ? .04 * sw : 0), wide: lookUp < .5 && e >= 1 });
    }
    g.restore();
    if (dz > .02 && dz < .44) ropeCurrent(g, t, set.tip[1], ropeY);
    rain(g, t, { n: 90, seed: 8, alpha: .5, len: 80, w: 4, x0: -800, x1: 3200, y0: -600, span: 1900 });
  });
  let f = pulse(t, ZAP, .12) + .5 * pulse(t, ZAP + .18, .1); for (const b of BOLTS) f += .32 * pulse(t, b[0], .12);
  flash(g, f);
}
