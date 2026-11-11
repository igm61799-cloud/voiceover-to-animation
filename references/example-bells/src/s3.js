'use strict';
/* ============ S5 — the iron rod ============ */
function quillHand(g, x, y, a = 1) {
  g.save(); g.translate(x, y); g.globalAlpha = a;
  // feather
  g.save(); g.rotate(.12);
  g.beginPath(); g.moveTo(70, -110); g.bezierCurveTo(150, -200, 250, -370, 300, -470); g.bezierCurveTo(250, -440, 150, -330, 96, -190); g.closePath(); g.fillStyle = C.gold; g.fill();
  g.beginPath(); g.moveTo(70, -110); g.bezierCurveTo(120, -230, 220, -380, 300, -470); g.bezierCurveTo(300, -380, 210, -230, 120, -130); g.closePath(); g.fillStyle = C.red; g.fill();
  line(g, 0, 0, 300, -470, C.ink, 6);
  for (let i = 0; i < 6; i++) line(g, 120 + i * 28, -190 - i * 44, 160 + i * 28, -200 - i * 44, C.ink, 3);
  g.restore();
  // arm + cuff + hand
  poly(g, [[160, 20], [1500, 760], [1400, 960], [96, 140]], C.ink);
  g.save(); g.translate(150, 60); g.rotate(.5); for (let i = 0; i < 5; i++) circ(g, -60 + i * 30, 0, 26, C.paper); g.fillStyle = C.paper; g.fillRect(-70, 0, 140, 40); g.restore();
  g.beginPath(); g.ellipse(84, -6, 70, 52, .5, 0, TAU); g.fillStyle = C.ink; g.fill();
  line(g, 40, -52, 14, -20, C.ink, 30); line(g, 60, 26, 20, -6, C.ink, 26);
  g.restore();
}
function S5(g, t, u) {
  const night = E.inOut(seg(t, 27.25, 27.72));
  const bgc = mix(C.paper, C.night, night), ln = mix(C.ink, C.paper, night), add = mix(C.red, C.gold, night);
  g.fillStyle = bgc; g.fillRect(0, 0, W, H);
  const X = 800, GY = 900, APEX = [800, 250], TIP = [800, 84];
  const wire = [[800, 250], [752, 330], [700, 418], [690, 430], [690, 900], [690, 1010]];
  const follow = E.inOut(seg(t, 28.1, 29.6));
  const z = lerp(lerp(1.06, 1, E.out(seg(u, 0, 1.5))), .78, night) + follow * .32;
  const cy = lerp(lerp(540, 350, night), 800, follow), cx = lerp(lerp(960, 900, night), 820, follow);
  const sh = shake(t, 14 * pulse(t, 27.74, .45));
  withCam(g, cx + sh[0], cy + sh[1], z, 0, () => {
    // page furniture
    if (night < 1) { g.save(); g.globalAlpha = 1 - night; g.strokeStyle = C.ink; g.lineWidth = 6; g.strokeRect(50, 44, W - 100, H - 88); g.lineWidth = 2; g.strokeStyle = C.mist; g.beginPath(); for (let y = 130; y < 1000; y += 58) { g.moveTo(90, y); g.lineTo(W - 90, y); } g.stroke();
      // kite & key doodle
      const kx = 1500, ky = 250; poly(g, [[kx, ky - 90], [kx + 62, ky], [kx, ky + 110], [kx - 62, ky]], null, C.ink, 5); line(g, kx, ky - 90, kx, ky + 110, C.ink, 3); line(g, kx - 62, ky, kx + 62, ky, C.ink, 3);
      g.strokeStyle = C.ink; g.lineWidth = 4; g.beginPath(); g.moveTo(kx, ky + 110); g.bezierCurveTo(kx - 40, ky + 220, kx + 70, ky + 280, kx + 20, ky + 400); g.stroke(); circ(g, kx + 20, ky + 420, 16, null, C.ink, 5); line(g, kx + 20, ky + 436, kx + 20, ky + 490, C.ink, 5); line(g, kx + 20, ky + 470, kx + 38, ky + 470, C.ink, 5); line(g, kx + 20, ky + 488, kx + 34, ky + 488, C.ink, 5);
      // tiny storm sketch
      const sx = 330, sy = 250; g.beginPath(); for (const c of [[sx - 70, sy, 44], [sx, sy - 20, 58], [sx + 74, sy, 46]]) { g.moveTo(c[0] - c[2], c[1]); g.arc(c[0], c[1], c[2], PI, 0); } g.moveTo(sx - 116, sy); g.lineTo(sx + 122, sy); g.stroke();
      pathLine(g, [[sx + 10, sy + 20], [sx - 24, sy + 90], [sx + 14, sy + 86], [sx - 26, sy + 170]], C.ink, 5, 'miter');
      for (let i = 0; i < 4; i++) line(g, sx - 90 + i * 60, sy + 200 + i % 2 * 14, sx - 60 + i * 60, sy + 200 + i % 2 * 14, C.ink, 4);
      g.restore(); }
    // sky after dark
    if (night > 0) {
      g.save(); g.globalAlpha = night;
      stars(g, t, 40, 5, 700, { x0: -400, w: 2700, y0: -100 });
      const e = E.out(night); cloud(g, 900, -330 - (1 - e) * 300, 3200, 300, 101, t, { up: 500, carve: C.storm, lw: 6 }); cloud(g, 700, -210 - (1 - e) * 300, 1300, 240, 102, t, { carve: t > 27.6 && t < 27.74 ? C.paper : C.storm, lw: 7 });
      rain(g, t, { n: 90, seed: 2, alpha: .4, y0: -500, span: 1800, x0: -500, x1: 2900 });
      g.restore();
    }
    // ground
    g.fillStyle = mix(C.paper, C.ink, night); g.fillRect(-600, GY, 3200, 900);
    line(g, 240, GY, 1660, GY, ln, 6); if (night > 0) line(g, -600, GY, 2600, GY, mix(C.paper, C.storm, night), 6, 'butt');
    for (let i = 0; i < 26; i++) { const x = 270 + i * 54; line(g, x, GY + 14, x - 22, GY + 40, mix(C.ink, C.storm, night), 3); }
    if (night > 0) { g.save(); g.globalAlpha = night; g.strokeStyle = C.night; g.lineWidth = 6; g.lineCap = 'round'; for (let j = 0; j < 5; j++) { g.beginPath(); for (let x = -600; x <= 2600; x += 60) { const y = GY + 110 + j * 110 + noise1(x * .004 + j * 7) * 60; x === -600 ? g.moveTo(x, y) : g.lineTo(x, y); } g.setLineDash([90, 40, 30, 50]); g.stroke(); } g.setLineDash([]); g.restore(); }
    // church elevation
    const body = mix(C.paper, C.storm, night);
    g.fillStyle = body;
    poly(g, [[700, GY], [700, 420], [800, 250], [900, 420], [900, GY]], body, ln, 6);
    poly(g, [[900, GY], [900, 640], [1125, 520], [1350, 640], [1350, GY]], body, ln, 6);
    line(g, 700, 420, 900, 420, ln, 5); line(g, 900, 640, 1350, 640, ln, 5);
    g.save(); g.beginPath(); g.moveTo(700, 420); g.lineTo(800, 250); g.lineTo(900, 420); g.clip(); hatch(g, 690, 240, 220, 190, 16, ln, 3, -1.05); g.restore();
    g.save(); g.beginPath(); g.moveTo(900, 640); g.lineTo(1125, 520); g.lineTo(1350, 640); g.clip(); hatch(g, 900, 510, 460, 140, 18, ln, 3, -.5); g.restore();
    const lit = mix(C.paper, C.gold, night);
    g.beginPath(); g.roundRect(765, 470, 70, 120, [35, 35, 0, 0]); g.fillStyle = mix(C.paper, C.ink, night); g.fill(); g.strokeStyle = ln; g.lineWidth = 5; g.stroke();
    bell(g, 800, 492, 66, Math.sin(t * 1.3) * .05, { col: mix(C.paper, C.gold, night), dark: ln, yoke: ln, hi: C.paper });
    for (const wx of [960, 1250]) { g.beginPath(); g.roundRect(wx, 700, 46, 96, [23, 23, 0, 0]); g.fillStyle = lit; g.fill(); g.stroke(); }
    g.beginPath(); g.roundRect(1070, 730, 110, 170, [55, 55, 0, 0]); g.fillStyle = lit; g.fill(); g.stroke();
    line(g, 1125, 520, 1125, 468, ln, 6, 'butt'); line(g, 1107, 488, 1143, 488, ln, 6, 'butt');
    for (const wy of [640, 770]) { rr(g, 782, wy, 36, 62, 18, mix(C.paper, C.ink, night)); g.strokeStyle = ln; g.lineWidth = 4; g.stroke(); }
    if (night > .5) { g.save(); g.globalAlpha = seg(night, .5, 1); ringer(g, 1125, 898, 104, { look: [-.7, -.8], hands: [[1150, 842], [1158, 846]], mouth: 'smile' }); rr(g, 1146, 828, 24, 26, 5, C.paper); smoke(g, 1158, 826, 16, t, .9, C.ink); g.restore(); }
    // the proposal, drawn in red
    const pr = E.inOut(seg(t, 25.25, 26.1)), pw = E.inOut(seg(t, 26.3, 27.15));
    if (pr > 0) { const top = [800, lerp(250, TIP[1], pr)]; line(g, 800, 250, top[0], top[1], add, 9, 'butt'); if (pr >= 1) poly(g, [[791, TIP[1] + 4], [800, TIP[1] - 34], [809, TIP[1] + 4]], add); }
    if (pw > 0) { pathLine(g, partial(wire, pw), add, 7, 'round'); if (pw >= 1) for (let i = 0; i < 3; i++) line(g, 690 - 30 + i * 9, 1010 + i * 12, 690 + 30 - i * 9, 1010 + i * 12, add, 6); }
    // strike + pulse into the ground
    const d = t - 27.74;
    if (d >= 0 && d < .42) bolt(g, 880, -150, TIP[0], TIP[1] - 30, 7 + (d > .2 ? 4 : 0), { w: 34 * (1 - d * 1.5), amp: 60, n: 7, core: C.gold, glow: C.gold, prog: seg(d, 0, .05), branches: 3 });
    const pp = seg(t, 27.8, 29.55);
    if (pp > 0 && t < 30.62) {
      const full = [[800, TIP[1] - 30]].concat(wire);
      const head = pointAt(full, E.inOut(pp)), tail = partial(full, E.inOut(pp));
      if (pp < 1) { const k = Math.max(0, tail.length - 3); g.save(); g.globalAlpha = .9; pathLine(g, tail.slice(k), C.paper, 13); g.restore(); star4(g, head[0], head[1], 54 + Math.sin(t * 50) * 10, C.gold, t * 4, .26); star4(g, head[0], head[1], 26, C.paper, -t * 4, .3); circ(g, head[0], head[1], 80, null, C.gold, 4); }
      const gp = seg(t, 29.4, 30.25);
      if (gp > 0) { const fade = 1 - seg(t, 30.0, 30.6) * .75; g.save(); g.globalAlpha = fade;
        for (let i = 0; i < 9; i++) { const a = PI * (.08 + .84 * i / 8), L = 190 + hash(i * 3.3) * 230; const pts = boltPts(690, 1014, 690 + Math.cos(a) * L, 1014 + Math.sin(a) * L * .8, 50 + i, 5, 20); pathLine(g, partial(pts, E.out(gp)), i % 2 ? C.gold : C.paper, 6 - gp * 2, 'round'); }
        circ(g, 690, 1014, 20 + gp * 120, null, C.gold, 5 * (1 - gp)); g.restore(); }
    }
    // hand
    if (t < 27.75) {
      let hp;
      if (t < 25.25) { const e = E.inOut(seg(t, 23.3, 24.75)); hp = [lerp(1500, 800, e), lerp(1150, 250, e) - Math.sin(e * PI) * 90]; }
      else if (t < 26.2) hp = [800 + Math.sin(t * 40) * 1.5, lerp(250, TIP[1], pr)];
      else if (t < 26.3) { const e = seg(t, 26.2, 26.3); hp = [800, lerp(TIP[1], 250, e)]; }
      else if (t < 27.15) hp = pointAt(wire, pw);
      else { const e = E.in(seg(t, 27.15, 27.7)); hp = [690 + e * 900, 1010 + e * 500]; }
      quillHand(g, hp[0], hp[1], 1 - night);
    }
  });
  flash(g, pulse(t, 27.74, .1) + .5 * pulse(t, 27.94, .08));
}

/* ============ S6 — "a rod, on God's house?" ============ */
function gent(g, x, y, s, o = {}) {
  const look = o.look || [0, 0];
  g.save(); g.translate(x, y); g.scale(o.sx || 1, o.sy || 1);
  line(g, -s * .08, -s * .3, -s * .09, -s * .02, C.paper, s * .06); line(g, s * .08, -s * .3, s * .09, -s * .02, C.paper, s * .06);
  rr(g, -s * .17, -s * .05, s * .14, s * .05, s * .02, C.ink); rr(g, s * .03, -s * .05, s * .14, s * .05, s * .02, C.ink);
  poly(g, [[-s * .15, -s * .74], [-s * .27, -s * .24], [s * .27, -s * .24], [s * .15, -s * .74]], C.ink);
  line(g, 0, -s * .7, 0, -s * .28, C.gold, s * .02); for (let i = 0; i < 3; i++) circ(g, s * .05, -s * (.62 - i * .1), s * .014, C.gold);
  poly(g, [[-s * .06, -s * .74], [0, -s * .62], [s * .06, -s * .74]], C.paper);
  circ(g, -s * .13, -s * .82, s * .07, C.mist); circ(g, s * .13, -s * .82, s * .07, C.mist);
  circ(g, 0, -s * .85, s * .13, C.paper);
  poly(g, [[-s * .27, -s * .95], [0, -s * 1.1], [s * .27, -s * .95], [s * .17, -s * .92], [-s * .17, -s * .92]], C.ink);
  const ex = look[0] * s * .03, ey = look[1] * s * .02;
  circ(g, -s * .045 + ex, -s * .86 + ey, s * (o.wide ? .028 : .02), C.ink); circ(g, s * .045 + ex, -s * .86 + ey, s * (o.wide ? .028 : .02), C.ink);
  if (o.mouth === 'smile') { g.strokeStyle = C.ink; g.lineWidth = s * .016; g.beginPath(); g.arc(ex, -s * .81, s * .04, .2, PI - .2); g.stroke(); }
  else if (o.mouth === 'o') circ(g, ex, -s * .775, s * .02, C.ink);
  else line(g, -s * .03 + ex, -s * .78, s * .03 + ex, -s * .785, C.ink, s * .014);
  g.restore();
  if (o.hands) for (let i = 0; i < 2; i++) { const sn = i ? 1 : -1; line(g, x + sn * s * .13, y - s * .66, o.hands[i][0], o.hands[i][1], C.ink, s * .08); circ(g, o.hands[i][0], o.hands[i][1], s * .045, C.paper); }
}
function planSheet(g, x, y, s, rot) {
  g.save(); g.translate(x, y); g.rotate(rot || 0);
  rr(g, -s * .5, -s * .62, s, s * 1.24, s * .04, C.paper);
  poly(g, [[-s * .16, s * .46], [-s * .16, -s * .06], [0, -s * .3], [s * .16, -s * .06], [s * .16, s * .46]], null, C.ink, s * .04);
  line(g, -s * .36, s * .46, s * .36, s * .46, C.ink, s * .04);
  line(g, 0, -s * .3, 0, -s * .52, C.red, s * .05, 'butt');
  g.restore();
}
function S6(g, t, u) {
  g.fillStyle = C.red; g.fillRect(0, 0, W, H);
  const rise = E.out5(seg(t, 30.75, 31.7)), leanIn = E.inOut(seg(t, 31.7, 32.5));
  const tilt = E.inOut(seg(t, 34.4, 34.9)), brow = E.back(seg(t, 34.45, 34.75));
  const cower = E.inOut(seg(t, 31.2, 32.3));
  withCam(g, lerp(900, 960, E.out(seg(u, 0, 2))), 540, lerp(1.08, 1, E.out(seg(u, 0, 2))), 0, () => {
    // sunburst pattern
    g.save(); g.globalAlpha = .5; burst(g, 1380, 420, 80, 2400, 18, C.rust, t * .03); g.restore();
    // the shadow he casts
    g.save(); g.globalAlpha = .55 * rise; poly(g, [[-200, 1300], [-200, 700 - leanIn * 260], [1000, 760], [1200, 1300]], C.rust); g.restore();
    // floor
    g.fillStyle = C.ink; g.fillRect(-200, 940, 2400, 400);
    // bishop
    g.save(); g.translate(1400, 1080 + (1 - rise) * 1150); g.rotate(-.1 * leanIn); g.translate(-1400, -1080);
    // crozier
    line(g, 1790, 1100, 1790, 250, C.gold, 20, 'butt'); g.strokeStyle = C.gold; g.lineWidth = 20; g.lineCap = 'round'; g.beginPath(); for (let k = 0; k <= 30; k++) { const a = PI / 2 - k / 30 * 5.2, r = 78 * (1 - k / 30 * .75); const px = 1712 + Math.cos(a) * r * 1 , py = 250 - 0 + Math.sin(a) * r - 78; k ? g.lineTo(px + 0, py + 78) : g.moveTo(px, py + 78); } g.stroke();
    // body
    poly(g, [[1080, 620], [900, 1300], [1900, 1300], [1720, 620], [1560, 560], [1240, 560]], C.ink);
    // stole
    poly(g, [[1250, 560], [1330, 560], [1300, 1300], [1180, 1300]], C.gold); poly(g, [[1470, 560], [1550, 560], [1620, 1300], [1500, 1300]], C.gold);
    for (const [sx, sy] of [[1262, 800], [1535, 800]]) { line(g, sx, sy - 40, sx, sy + 46, C.ink, 9, 'butt'); line(g, sx - 26, sy - 12, sx + 26, sy - 12, C.ink, 9, 'butt'); }
    for (const sx of [1240, 1560]) for (let i = 0; i < 3; i++) line(g, sx - 60 + i * 0, 1000 + i * 26, sx + 60, 1000 + i * 26, C.ink, 0.01);
    // head
    g.save(); g.translate(1400, 440); g.rotate(-.14 * tilt - .06 * leanIn);
    // mitre
    poly(g, [[-150, -90], [-130, -330], [0, -470], [130, -330], [150, -90]], C.paper);
    poly(g, [[-150, -90], [-146, -150], [146, -150], [150, -90]], C.gold);
    line(g, 0, -420, 0, -170, C.gold, 26, 'butt'); line(g, -70, -300, 70, -300, C.gold, 26, 'butt');
    g.save(); g.beginPath(); g.moveTo(-150, -90); g.lineTo(-130, -330); g.lineTo(0, -470); g.lineTo(130, -330); g.lineTo(150, -90); g.clip(); hatch(g, -160, -480, 110, 400, 20, C.mist, 4, -1.2); g.restore();
    // face
    g.beginPath(); g.ellipse(0, 20, 150, 170, 0, 0, TAU); g.fillStyle = C.paper; g.fill();
    // jowls / beard
    g.beginPath(); g.moveTo(-150, 40); g.bezierCurveTo(-150, 260, 150, 260, 150, 40); g.bezierCurveTo(100, 150, -100, 150, -150, 40); g.fillStyle = C.mist; g.fill();
    // eyes
    const lk = t < 32.6 ? [-.8, .9] : t < 33.5 ? [-.9, -.2] : t < 34.4 ? [-.7, -.6] : [-.8, .9];
    for (const sx of [-1, 1]) { g.beginPath(); g.ellipse(sx * 62, 0, 30, 22, 0, 0, TAU); g.fillStyle = C.ink; g.fill(); circ(g, sx * 62 + lk[0] * 11, lk[1] * 8, 9, C.paper); }
    // brows: left one rises on "house?"
    line(g, -100, -58 - brow * 44, -26, -30 - brow * 30, C.ink, 20); line(g, 100, -52, 26, -26, C.ink, 20);
    // nose + mouth
    g.strokeStyle = C.ink; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.moveTo(-6, 6); g.quadraticCurveTo(-26, 76, 8, 78); g.stroke();
    const talk = t > 32.6 && t < 34.9 ? Math.abs(Math.sin(t * 14)) : 0;
    g.beginPath(); g.ellipse(0, 122, 34, 6 + talk * 16, 0, 0, TAU); g.fillStyle = C.ink; g.fill(); line(g, -44, 128, -34, 122, C.ink, 7); line(g, 44, 128, 34, 122, C.ink, 7);
    g.restore();
    // pointing hand
    const pt = E.back(seg(t, 33.9, 34.25));
    if (pt > 0) { const hx = 1010, hy = 760 - pt * 250; line(g, 1150, 760, hx, hy, C.ink, 90); circ(g, hx, hy, 52, C.paper); line(g, hx, hy, hx - 10, hy - 110 * pt, C.paper, 30); circ(g, hx - 22, hy + 6, 22, C.gold); }
    g.restore();
    // the proposer
    const px = 430, sy = 1 - .16 * cower - .1 * tilt, s = 250;
    const sheetUp = 1 - E.inOut(seg(t, 34.5, 35.2));
    const hx = px + 150, hy = 940 - s * (.62 + .46 * sheetUp) * sy;
    gent(g, px, 940, s, { sy, look: [.9, -1], wide: cower > .5, mouth: cower > .6 ? 'o' : 'smile', hands: [[px - 70, 940 - s * .45 * sy], [hx, hy]] });
    planSheet(g, hx + 30, hy - 60, 130, .12 + (1 - sheetUp) * .5);
    if (cower > .7) for (let i = 0; i < 2; i++) { const yy = 940 - s * sy * .98 + ((t * 70 + i * 30) % 50), xx = px - 80 - i * 22; g.beginPath(); g.moveTo(xx, yy - 18); g.quadraticCurveTo(xx + 10, yy, xx, yy + 7); g.quadraticCurveTo(xx - 10, yy, xx, yy - 18); g.fillStyle = C.paper; g.fill(); }
    // the speech bubble: a rod, on God's house?
    const bp = E.back(seg(t, 32.5, 32.85));
    if (bp > 0) {
      const bx = 660, by = 300;
      g.save(); g.translate(bx + 300, by + 190); g.scale(bp, bp); g.translate(-bx - 300, -by - 190);
      poly(g, [[bx + 230, by + 60], [bx + 420, by + 100], [bx + 250, by + 150]], C.paper);
      g.beginPath(); g.ellipse(bx, by, 330, 240, 0, 0, TAU); g.fillStyle = C.paper; g.fill();
      // pictogram
      const poke = E.out5(seg(t, 33.45, 33.62)), rodTop = by + 20 - poke * 96, jolt = pulse(t, 33.62, .35);
      const cx0 = bx, base = by + 180;
      poly(g, [[cx0 - 60, base], [cx0 - 60, by + 70], [cx0, by + 20], [cx0 + 60, by + 70], [cx0 + 60, base]], C.ink);
      rr(g, cx0 - 18, base - 62, 36, 62, [18, 18, 0, 0], C.gold);
      poly(g, [[cx0 + 60, base], [cx0 + 60, by + 110], [cx0 + 190, by + 110], [cx0 + 190, base]], C.ink);
      line(g, cx0 - 150, base, cx0 + 240, base, C.ink, 8);
      line(g, cx0, by + 24, cx0, rodTop, C.red, 11, 'butt'); poly(g, [[cx0 - 8, rodTop + 2], [cx0, rodTop - 24], [cx0 + 8, rodTop + 2]], C.red);
      // little heaven
      const hy2 = by - 150 - jolt * 26;
      g.save(); g.translate((hash(Math.floor(t * 30)) - .5) * 12 * jolt, 0);
      g.strokeStyle = C.gold; g.lineWidth = 9; g.beginPath(); g.ellipse(cx0, hy2 - 62, 62, 16, 0, 0, TAU); g.stroke();
      cloud(g, cx0, hy2, 250, 96, 61, t, { fill: C.mist, carve: C.paper, lw: 4 });
      const ang = seg(t, 33.62, 33.8);
      if (ang > 0) { circ(g, cx0 - 26, hy2 - 4, 10, C.ink); circ(g, cx0 + 26, hy2 - 4, 10, C.ink); line(g, cx0 - 44, hy2 - 26, cx0 - 12, hy2 - 16, C.ink, 6); line(g, cx0 + 44, hy2 - 26, cx0 + 12, hy2 - 16, C.ink, 6); }
      else { line(g, cx0 - 36, hy2 - 4, cx0 - 16, hy2 - 4, C.ink, 5); line(g, cx0 + 16, hy2 - 4, cx0 + 36, hy2 - 4, C.ink, 5); }
      g.restore();
      if (jolt > 0) burst(g, cx0, rodTop - 20, 12, 44 * jolt + 16, 7, C.gold, t * 2);
      g.restore();
    }
  });
}

/* ============ S6c — so many churches refused ============ */
function S6c(g, t, u) {
  g.fillStyle = C.red; g.fillRect(0, 0, W, H);
  withCam(g, 960 + u * 26, 540, 1.04, 0, () => {
    g.save(); g.globalAlpha = .5; burst(g, 960, 1500, 200, 2600, 22, C.rust, -PI / 2 + t * .02); g.restore();
    hills(g, 860, 110, 12, C.rust);
    const N = 7;
    for (let i = 0; i < N; i++) {
      const x = 150 + i * 275, hillY = 905 - Math.sin(i * 1.9) * 26, s = 150 + hash(i * 2.2) * 60, tr = 36.02 + i * .16;
      const up = E.back(seg(u, .0 + i * .05, .4 + i * .05)), d = t - tr, slam = pulse(t, tr + .06, .22);
      g.save(); g.translate(x, hillY + (1 - up) * 500 + slam * 6); g.rotate((hash(i) - .5) * .03 - slam * .03 * (i % 2 ? 1 : -1));
      const ch = church(g, 0, 0, s, i + 1, { col: C.ink, win: C.gold, doorCol: d > .06 ? C.ink : C.gold, cross: 0 });
      // bell keeps ringing, defiantly
      if (d > .3) { const sw = Math.sin((t - tr) * 9) * .6; bell(g, 0, -ch.th + s * .1, s * .2, sw, { col: C.gold, yoke: C.ink }); }
      // rod
      const top = ch.top[1] + s * .16;
      if (d < 0) { line(g, 0, top + 6, 0, top - s * .5, C.paper, 7, 'butt'); poly(g, [[-6, top - s * .5], [0, top - s * .5 - 20], [6, top - s * .5]], C.paper); }
      else { const vx = (i % 2 ? 1 : -1) * (260 + hash(i * 5) * 160), fx = vx * d, fy = top - s * .25 - 900 * d + 1900 * d * d; g.save(); g.translate(fx, fy); g.rotate(d * 14 * (i % 2 ? 1 : -1)); line(g, 0, s * .25, 0, -s * .25, C.paper, 7, 'butt'); g.restore();
        if (d < .25) { burst(g, 0, top, 10, 50 * (1 - d * 4) + 14, 6, C.paper, i); } }
      if (slam > 0) { const dx = ch.doorX; for (const sgn of [-1, 1]) line(g, dx + sgn * (s * .13 + (1 - slam) * 20), -s * .26, dx + sgn * (s * .2 + (1 - slam) * 30), -s * .34, C.paper, 6); }
      g.restore();
    }
    g.fillStyle = C.ink; g.fillRect(-200, 1010, 2600, 300);
    hills(g, 1040, 90, 3, C.ink);
  });
}
