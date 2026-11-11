'use strict';
/* row of little houses */
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

/* ============ S1 — the hook ============ */
function S1(g, t) {
  const { TX, FLOOR } = TWR, S = 120;
  g.fillStyle = C.night; g.fillRect(0, 0, W, H);
  const a = E.inOut(seg(t, .15, 2.5)), b = E.inOut(seg(t, 3.95, 4.42));
  const z = lerp(lerp(1.75, .8, a), 2.3, b), cx = lerp(lerp(1150, 960, a), TX, b), cy = lerp(lerp(650, 405, a), 905, b);
  const STR = [3.54, 4.78, 5.42];
  const sh = shake(t, 18 * pulse(t, 3.54, .5) + 9 * pulse(t, 4.78, .3) + 9 * pulse(t, 5.42, .3));
  const amp = t < 3.54 ? .62 : .62 * Math.exp(-(t - 3.54) * 1.1) + .2;
  const sw = Math.sin(TAU * t / 1.0), ang = amp * sw, clap = -amp * 1.1 * Math.sin(TAU * (t - .14));
  const ropeY = 920 + 20 * sw;
  const rings = []; for (let k = 0; k < 7; k++) rings.push(.25 + k * .5);
  withCam(g, cx + sh[0], cy + sh[1], z, 0, () => {
    const fl = t > 3.25 && t < 3.54 && hash(Math.floor(t * 24)) > .45;
    const open = E.back(seg(t, 1.95, 2.35)) * (1 - .5 * seg(t, 3.05, 3.5)) + .5 * seg(t, 3.6, 3.75);
    const set = stormTower(g, t, { ang, clap, ropeY, rings, eyes: open, fl, hot: STR.some(s => t - s > 0 && t - s < .4) });
    const tip = set.tip;
    for (const [ts, sd] of [[3.54, 5], [3.74, 8]]) { const d = t - ts; if (d >= 0 && d < .3) bolt(g, 840, 20, tip[0], tip[1], sd, { w: 36 * (1 - d * 1.6), amp: 70, core: C.gold, glow: C.gold, n: 7, prog: seg(d, 0, .05), branches: 3 }); }
    g.save(); roomClip(g);
    const R = [{ x: 1112, tin: -1, from: 1112, ts: STR[0] }, { x: 1252, tin: 4.22, from: 1345, ts: STR[1] }, { x: 1180, tin: 5.0, from: 1010, ts: STR[2] }];
    for (let i = 0; i < 3; i++) {
      const r = R[i], dz = t - r.ts;
      if (t < r.tin) continue;
      if (dz < .05) {
        const e = E.out(seg(t, r.tin, r.tin + .34)), x = lerp(r.from, r.x, e), hop = Math.abs(Math.sin(e * PI * 3)) * 16 * (1 - e);
        const grab = i ? seg(t, r.tin + .3, r.tin + .42) : 1, hy = ropeY - 44;
        const hands = grab > 0 ? [[lerp(x - 20, TX - 3, grab), lerp(FLOOR - 60, hy + 10, grab)], [lerp(x + 20, TX + 3, grab), lerp(FLOOR - 60, hy - 14, grab)]] : null;
        ringer(g, x, FLOOR - hop, S, { hands, look: [i === 1 ? -.6 : .6, -.7], lean: (TX - x) * .0012, sy: 1 + .04 * sw });
      } else if (dz < .44) skeleton(g, r.x + (hash(Math.floor(t * 30)) - .5) * 8, FLOOR - 16, S * 1.04, Math.floor(t * 24) % 2);
      else { puff(g, r.x, FLOOR - 60, 58, (dz - .44) / .36); sandals(g, r.x, FLOOR - 2 - (1 - E.bounce(seg(dz, .44, .8))) * 30, 34, t + i, { smoke: seg(dz, .6, .9) * .9 }); }
    }
    if (t > 5.78) { const e = E.back(seg(t, 5.78, 6.02)); ringer(g, 1348 - 62 * e, FLOOR, S, { look: [-1, .8], wide: true, lean: -.16 * e, mouth: 'o' }); }
    g.restore();
    for (const s of STR) { const d = t - s; if (d > .02 && d < .42) ropeCurrent(g, t, tip[1], ropeY); }
    rain(g, t, { n: 90, seed: 8, alpha: .5, len: 80, w: 4, x0: -800, x1: 3200, y0: -600, span: 1900 });
  });
  flash(g, pulse(t, 3.54, .1) + .55 * pulse(t, 3.74, .1) + .6 * pulse(t, 4.78, .1) + .6 * pulse(t, 5.42, .1));
}

/* ============ S2 — the belief (illuminated medallion) ============ */
function S2(g, t, u) {
  g.fillStyle = C.paper; g.fillRect(0, 0, W, H);
  const cx = 960, cy = 540;
  const zoom = lerp(1.1, 1, E.out(seg(u, 0, 1.3))) + u * .004;
  withCam(g, cx, cy, zoom, lerp(-.035, 0, E.out(seg(u, 0, 1.5))), () => {
    g.strokeStyle = C.ink; g.lineWidth = 8; g.strokeRect(40, 40, W - 80, H - 80); g.lineWidth = 3; g.strokeRect(60, 60, W - 120, H - 120);
    // ornamental bells
    for (const side of [-1, 1]) for (let c = 0; c < 2; c++) for (let r = 0; r < 5; r++) {
      const x = cx + side * (640 + c * 132), y = 118 + r * 182 + (c ? 91 : 0); if (y > 930) continue;
      const on = E.back(seg(u, .1 + (r + c) * .07, .5 + (r + c) * .07)); if (on <= 0) continue;
      const sw = Math.sin(TAU * t / 1.0 + (r + c) * PI) * .3;
      bell(g, x, y, 78 * on, sw, { col: C.ink, dark: C.paper, noYoke: true, clapCol: C.red, clap: -sw * 1.6, hi: C.paper });
    }
    // astronomical ring
    circ(g, cx, cy, 506, C.ink); circ(g, cx, cy, 440, C.paper);
    const rot = -PI / 2 + TAU * 2.25 * E.out5(seg(u, 0, 3.6)) + u * .1;
    for (let i = 0; i < 48; i++) { const a = rot + i / 48 * TAU, r1 = i % 4 ? 492 : 484; line(g, cx + Math.cos(a) * r1, cy + Math.sin(a) * r1, cx + Math.cos(a) * 500, cy + Math.sin(a) * 500, C.paper, 3); }
    for (let i = 1; i < 12; i++) { if (i === 6) continue; const a = rot + i / 12 * TAU; star4(g, cx + Math.cos(a) * 468, cy + Math.sin(a) * 468, i % 2 ? 9 : 14, i % 3 ? C.paper : C.gold, a); }
    { const sx = cx + Math.cos(rot) * 468, sy = cy + Math.sin(rot) * 468; burst(g, sx, sy, 17, 30, 10, C.gold, rot * 2); circ(g, sx, sy, 14, C.paper);
      const mx = cx - Math.cos(rot) * 468, my = cy - Math.sin(rot) * 468; circ(g, mx, my, 21, C.paper); circ(g, mx + 9, my - 5, 17, C.ink); }
    // the picture
    g.save(); g.beginPath(); g.arc(cx, cy, 428, 0, TAU); g.clip();
    const clear = E.inOut(seg(t, 9.75, 11.5));
    g.fillStyle = mix(C.storm, C.gold, clear); g.fillRect(cx - 440, cy - 440, 880, 880);
    if (clear > 0) { g.save(); g.globalAlpha = clear; burst(g, cx, cy + 60, 60, 1000, 14, C.paper, t * .12); g.restore(); circ(g, cx, cy + 60, 210 * E.back(clear), C.paper); }
    else hatch(g, cx - 440, cy - 440, 880, 880, 26, C.night, 4, .9);
    const CH = { x: cx, y: cy + 268 };
    const by = CH.y - 268;
    // rings from the bell
    for (let k = 0; k < 12; k++) {
      const tk = 7.05 + k * .5, age = t - tk; if (age < 0 || age > 1.9) continue;
      g.save(); g.globalAlpha = (1 - age / 1.9); g.strokeStyle = clear > .5 ? C.ink : C.paper; g.lineWidth = 9 - age * 3; g.beginPath(); g.arc(cx, by, 40 + age * 300, 0, TAU); g.stroke(); g.restore();
    }
    // storm clouds with faces
    const CL = [[-215, -175, -1, -.35, 21], [215, -215, 1, -.4, 22], [-20, -300, -.15, -1, 23], [240, -40, 1, .05, 24], [-270, 0, -1, .1, 25]];
    const push = E.in(seg(t, 9.55, 11.35)) * 760, scared = seg(t, 9.2, 9.5);
    for (let i = 0; i < CL.length; i++) {
      const c = CL[i]; const hit = Math.max(0, Math.sin((t - 7.05) * TAU / .5 - i)) * (t > 7.05 ? 1 : 0);
      const jx = (hash(Math.floor(t * 12) + i) - .5) * 10 * scared, enter = E.out(seg(u, .2 + i * .08, 1.2 + i * .08));
      const x = cx + c[0] + c[2] * (push + hit * 9 + (1 - enter) * 500) + jx, y = cy + c[1] + c[3] * (push + hit * 9 + (1 - enter) * 500);
      if (t > 7.6 + i * .31 && t < 9.3) { const d = (t - 7.6 - i * .31) % 1.24; if (d < .16) bolt(g, x, y + 50, x + (i % 2 ? 30 : -30), y + 170, 30 + i + Math.floor(t * 2), { w: 12, amp: 18, n: 4, branches: 0, col: C.gold }); }
      cloud(g, x, y, 290, 150, c[4], t, { fill: C.ink, carve: C.mist, lw: 4 });
      const ey = y - 4, s = 1 + scared * .5;
      circ(g, x - 26, ey, 9 * s, C.paper); circ(g, x + 26, ey, 9 * s, C.paper); circ(g, x - 26 + c[2] * 3 * scared, ey, 3.5, C.ink); circ(g, x + 26 + c[2] * 3 * scared, ey, 3.5, C.ink);
      const br = lerp(10, -10, scared);
      line(g, x - 42, ey - 18 - br, x - 12, ey - 18 + br, C.paper, 5); line(g, x + 42, ey - 18 - br, x + 12, ey - 18 + br, C.paper, 5);
      if (scared > .5) circ(g, x, ey + 26, 9, C.paper); else line(g, x - 14, ey + 26, x + 14, ey + 26, C.paper, 5);
    }
    // hill, church, believers
    g.beginPath(); g.ellipse(cx, cy + 600, 640, 350, 0, 0, TAU); g.fillStyle = C.ink; g.fill();
    const chc = clear > .5 ? C.ink : C.ink;
    const ch = church(g, CH.x, CH.y, 230, 0, { col: chc, win: C.gold, crossCol: C.ink });
    bell(g, CH.x, by - 18, 40, Math.sin(TAU * t / 1.0) * .7, { col: C.ink, dark: C.gold, yoke: C.ink, hi: C.gold });
    const PX = [-300, -215, -135, 175, 255, 330];
    for (let i = 0; i < PX.length; i++) {
      const e = E.back(seg(t, 7.72 + i * .09, 8.05 + i * .09)); if (e <= 0) continue;
      const x = cx + PX[i], y = cy + 600 - 350 * Math.sqrt(Math.max(0, 1 - (PX[i] / 640) ** 2)) + 8, s = 88 * e, wv = Math.sin(t * 5 + i * 1.3) * 8;
      ringer(g, x, y, s, { col: i % 2 ? C.red : C.rust, look: [PX[i] < 0 ? .7 : -.7, -1], hands: [[x - s * .32 + wv * .4, y - s * 1.02 + wv], [x + s * .32 + wv * .4, y - s * 1.02 - wv]] });
    }
    g.restore();
    circ(g, cx, cy, 429, null, C.ink, 6);
  });
}
