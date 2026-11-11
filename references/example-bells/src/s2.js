'use strict';
C.rope = '#f3cf86';
function stars(g, t, n, seed, y1, o = {}) {
  for (let i = 0; i < n; i++) { const x = hash(i * 3.3 + seed) * (o.w || W) + (o.x0 || 0), y = hash(i * 5.9 + seed) * y1 + (o.y0 || 0), tw = .5 + .5 * Math.sin(t * 3 + i * 2.4); if (hash(i + seed * 3) > .8) star4(g, x, y, 7 + tw * 6, o.col || C.paper, 0, .22); else circ(g, x, y, 1.6 + tw * 1.6, o.col || C.paper); }
}
function hills(g, y, amp, seed, col, x0 = -200, x1 = W + 200) {
  g.beginPath(); g.moveTo(x0, 2000); for (let x = x0; x <= x1; x += 40) g.lineTo(x, y - noise1(x * .0035 + seed) * amp - noise1(x * .011 + seed * 3) * amp * .3); g.lineTo(x1, 2000); g.closePath(); g.fillStyle = col; g.fill();
}

/* ============ S3a — thunder rolls in ============ */
function S3a(g, t, u) {
  g.fillStyle = C.night; g.fillRect(0, 0, W, H);
  const z = 1 + u * .05;
  withCam(g, lerp(960, 1040, u / 2.2), 540, z, 0, () => {
    stars(g, t, 70, 3, 620, { x0: -100, w: 2200 });
    circ(g, 1560, 190, 62, C.paper); circ(g, 1586, 172, 54, C.night);
    hills(g, 800, 190, 2, C.storm);
    g.save(); g.beginPath(); g.rect(-200, 0, 2400, 2000); g.clip(); g.restore();
    townRow(g, -100, 2100, 905, 21, { col: mix(C.night, C.ink, .45), win: C.gold, hmin: 70, hmax: 170, lit: .35 });
    // the church
    g.save(); g.translate(1290, 0); g.scale(.62, .62);
    const B = belfry(g, 0, { tw: 250, bw: 290, floor: 800, top: 610, apex: 420, base: 1700, wall: mix(C.night, C.ink, .45), carve: C.night, roof: C.ink, roofCarve: C.storm });
    bell(g, 0, B.pivot[1] - 4, 118, Math.sin(t * 1.2) * .06);
    g.restore();
    townRow(g, -150, 2100, 1010, 22, { col: C.ink, win: C.gold, hmin: 90, hmax: 210, lit: .5 });
    g.fillStyle = C.ink; g.fillRect(-200, 1005, 2400, 300);
    // the storm front
    const e = E.out(seg(t, 11.7, 14.3)), off = lerp(-2300, -250, e);
    const fl = pulse(t, 12.62, .22) > 0 && Math.floor(t * 24) % 2 === 0 || pulse(t, 13.2, .12) > 0;
    cloud(g, off + 700, 40, 2600, 420, 31, t, { up: 600, carve: C.storm, a0: t * 1.6, lw: 7 });
    cloud(g, off + 1000, 250, 1900, 400, 32, t, { carve: fl ? C.paper : C.storm, a0: t * 2.2, lw: 8 });
    cloud(g, off + 1500, 420, 1100, 330, 33, t, { carve: fl ? C.gold : C.mist, a0: t * 2.8, lw: 8 });
    if (fl) bolt(g, off + 1700, 520, off + 1780, 760, 41 + Math.floor(t * 12), { w: 14, amp: 26, n: 5, branches: 1, col: C.paper });
    rain(g, t, { n: Math.round(90 * e), seed: 5, alpha: .45, x1: off + 2300, len: 60 });
  });
  flash(g, .28 * pulse(t, 12.62, .18));
}

/* ============ S3b — the climb ============ */
function S3b(g, t, u) {
  const TX = 960, GROUND = 1000, TOP = -1000, IW = 280, FH = 125, NF = (GROUND - TOP) / FH;
  g.fillStyle = C.night; g.fillRect(0, 0, W, H);
  // climber
  const p = clamp(lerp(.02, 1, Math.pow(seg(t, 13.75, 16.2), .92)));
  const fpos = p * NF, k = Math.min(NF - 1, Math.floor(fpos)), f = fpos - k;
  const dirR = k % 2 === 0, xl = TX - IW / 2 + 46, xr = TX + IW / 2 - 46;
  const rx = dirR ? lerp(xl, xr, f) : lerp(xr, xl, f), ry = GROUND - k * FH - f * FH;
  const end = E.inOut(seg(t, 15.95, 16.65));
  const cy = lerp(ry - 150, TOP - 190, end), z = lerp(1.12, .86, end);
  withCam(g, TX, cy, z, 0, () => {
    // parallax backdrop
    g.save(); g.translate(0, cy * .72);
    stars(g, t, 50, 9, 900, { y0: -700, x0: -200, w: 2400 });
    hills(g, 560, 160, 6, C.storm, -400, 2400);
    g.restore();
    g.save(); g.translate(0, cy * .45 - 250);
    cloud(g, 300, 40, 900, 200, 51, t, { carve: C.storm, lw: 5 }); cloud(g, 1650, -60, 1000, 220, 52, t, { carve: C.storm, lw: 5 });
    cloud(g, 960, -420, 2800, 300, 53, t, { carve: C.storm, lw: 6, up: 900 });
    g.restore();
    g.save(); g.translate(0, cy * .25);
    townRow(g, -300, 2300, 900, 61, { col: mix(C.night, C.ink, .5), win: C.gold, hmin: 60, hmax: 150, lit: .4 });
    g.restore();
    townRow(g, -300, 2300, GROUND + 4, 62, { col: C.ink, win: C.gold, hmin: 110, hmax: 260, lit: .5 });
    g.fillStyle = C.ink; g.fillRect(-400, GROUND, 2800, 900);
    rain(g, t, { n: 80, seed: 6, alpha: .35, y0: cy - 800, span: 1700, x0: -400, x1: 2700 });
    // tower shell
    g.fillStyle = C.storm; g.fillRect(TX - IW / 2 - 44, TOP - 20, IW + 88, GROUND - TOP + 60);
    bricks(g, TX - IW / 2 - 44, TOP, IW + 88, GROUND - TOP, 7, C.night, 4, 52);
    g.fillStyle = C.ink; g.fillRect(TX - IW / 2, TOP + 26, IW, GROUND - TOP);
    // lantern light
    const lx = rx + (dirR ? 34 : -34), ly = ry - 58;
    g.save(); g.beginPath(); g.rect(TX - IW / 2, TOP + 26, IW, GROUND - TOP); g.clip();
    g.globalAlpha = .16; circ(g, lx, ly, 210, C.gold); g.globalAlpha = .2; circ(g, lx, ly, 120, C.gold); g.globalAlpha = 1;
    // stairs
    for (let i = 0; i < NF; i++) {
      const y0 = GROUND - i * FH, r = i % 2 === 0, near = Math.abs((y0 - FH / 2) - ry) < 150;
      const pts = []; const n = 6;
      for (let s = 0; s <= n; s++) { const xa = r ? lerp(xl - 30, xr + 30, s / n) : lerp(xr + 30, xl - 30, s / n), ya = y0 - s / n * FH; if (s) pts.push([xa, ya + FH / n]); pts.push([xa, ya]); }
      pathLine(g, pts, near ? C.gold : C.storm, near ? 7 : 6, 'miter');
    }
    g.restore();
    // window slits
    for (let i = 1; i < NF; i += 3) { rr(g, TX - IW / 2 - 30, GROUND - i * FH - 90, 16, 60, 8, C.ink); rr(g, TX + IW / 2 + 14, GROUND - (i + 1) * FH - 90, 16, 60, 8, C.ink); }
    // belfry on top
    const bt = TOP - 330;
    g.fillStyle = C.storm; g.fillRect(TX - IW / 2 - 70, TOP - 26, IW + 140, 34); g.fillRect(TX - IW / 2 - 70, bt - 10, IW + 140, 34);
    g.fillRect(TX - IW / 2 - 50, bt, 54, 330); g.fillRect(TX + IW / 2 - 4, bt, 54, 330);
    poly(g, [[TX - IW / 2 - 74, bt - 10], [TX, bt - 330], [TX + IW / 2 + 74, bt - 10]], C.ink);
    g.save(); g.beginPath(); g.moveTo(TX - IW / 2 - 74, bt - 10); g.lineTo(TX, bt - 330); g.lineTo(TX + IW / 2 + 74, bt - 10); g.clip(); g.strokeStyle = C.storm; g.lineWidth = 6; g.setLineDash([30, 18]);
    for (let yy = bt - 44; yy > bt - 300; yy -= 40) { g.beginPath(); g.moveTo(TX - 300, yy); g.lineTo(TX + 300, yy); g.stroke(); } g.setLineDash([]); g.restore();
    line(g, TX, bt - 320, TX, bt - 410, C.gold, 11, 'butt'); line(g, TX - 28, bt - 372, TX + 28, bt - 372, C.gold, 11, 'butt');
    bell(g, TX, bt + 40, 210, Math.sin(t * 1.5) * .05 + .5 * end * Math.sin((t - 16.2) * 5) * seg(t, 16.3, 16.6), {});
    line(g, TX + 96, bt + 40, TX + 96, TOP - 70 + 0, C.rope, 7, 'butt');
    // climber
    const hop = Math.abs(Math.sin(fpos * 6 * PI)) * 10;
    const top = seg(t, 16.2, 16.5);
    const cxr = lerp(rx, TX + 40, top), cyr = lerp(ry, TOP + 0, top) - hop * (1 - top);
    line(g, cxr + (dirR ? 16 : -16), cyr - 70, lx, ly + 6, C.red, 10);
    ringer(g, cxr, cyr, 96, { look: [dirR ? .8 : -.8, -.6], lean: (dirR ? .08 : -.08) * (1 - top) });
    // lantern
    rr(g, lx - 9, ly - 4, 18, 26, 4, C.gold); line(g, lx, ly - 4, lx, ly - 14, C.paper, 3); star4(g, lx, ly + 9, 20 + Math.sin(t * 20) * 3, C.paper, t, .2);
    rain(g, t, { n: 50, seed: 16, alpha: .5, y0: cy - 800, span: 1700, x0: -400, x1: 2700, len: 90, w: 4 });
  });
}

/* ============ S3c — a wet rope ============ */
function fist(g, x, y, dir, o = {}) {
  // dir: -1 arm comes from left, +1 from right
  const fw = 176, fh = 50;
  // sleeve
  g.save(); g.translate(x, y + fh * 2);
  poly(g, [[dir * 70, -fh * 1.7], [dir * 1300, 560], [dir * 1300, 980], [dir * 60, fh * 1.9]], C.red);
  line(g, dir * 150, -fh * 1.2, dir * 105, fh * 1.6, C.paper, 12);
  g.restore();
  // thumb
  g.save(); g.translate(x - dir * 40, y - 12); g.rotate(-dir * .5); rr(g, -34, -30, 68, 96, 30, C.paper); g.restore();
  for (let i = 0; i < 4; i++) { rr(g, x - fw / 2 + dir * 14 - (i === 3 ? -dir * 8 : 0), y + i * fh, fw - (i === 3 ? 16 : 0), fh - 5, 22, C.paper); }
  rr(g, x + dir * 52, y - 6, 78, fh * 4 + 8, 30, C.paper);
  for (let i = 0; i < 4; i++) line(g, x + dir * 62, y + i * fh + 12, x + dir * 62, y + i * fh + 32, C.ink, 4);
}
function S3c(g, t, u) {
  g.fillStyle = C.night; g.fillRect(0, 0, W, H);
  const grab = E.out5(seg(t, 16.74, 16.92)), pull = E.inOut(seg(t, 17.42, 17.95)) * 190 - 26 * Math.sin(seg(t, 17.1, 17.42) * PI);
  const sh = shake(t, 10 * pulse(t, 16.9, .25));
  withCam(g, 960 + sh[0], 540 + sh[1], 1.02 + u * .03, -.035, () => {
    rain(g, t, { n: 60, seed: 4, alpha: .35, len: 150, w: 6, speed: 2800 });
    hatch(g, -100, -100, 2200, 1400, 90, mix(C.night, C.storm, .45), 5, 1.25);
    // rope
    const RX = 960, RW = 116;
    g.fillStyle = C.rope; g.fillRect(RX - RW / 2, -200, RW, 1500);
    g.save(); g.beginPath(); g.rect(RX - RW / 2, -200, RW, 1500); g.clip();
    g.strokeStyle = C.ink; g.lineWidth = 7; g.lineCap = 'round';
    for (let y = -400 + (pull % 74); y < 1400; y += 74) { g.beginPath(); g.moveTo(RX - RW / 2 - 6, y + 70); g.bezierCurveTo(RX - 20, y + 60, RX + 10, y + 18, RX + RW / 2 + 6, y); g.stroke(); }
    g.strokeStyle = C.paper; g.lineWidth = 9; g.beginPath(); g.moveTo(RX - RW / 2 + 16, -200); g.lineTo(RX - RW / 2 + 16, 1400); g.setLineDash([120, 60, 30, 80]); g.lineDashOffset = -pull; g.stroke(); g.setLineDash([]);
    g.restore();
    // running drops on the rope
    for (let i = 0; i < 7; i++) { const sp = 260 + hash(i) * 260, y = ((hash(i * 3.1) * 1400 + t * sp) % 1500) - 150, x = RX - RW / 2 + 14 + hash(i * 7.7) * (RW - 28); g.beginPath(); g.moveTo(x, y - 30); g.quadraticCurveTo(x + 13, y, x, y + 10); g.quadraticCurveTo(x - 13, y, x, y - 30); g.fillStyle = C.mist; g.fill(); }
    // hands
    const y1 = 250 + pull, y2 = 560 + pull;
    fist(g, RX + lerp(520, 0, grab), y1 - lerp(120, 0, grab), 1);
    fist(g, RX - lerp(520, 0, grab), y2 + lerp(120, 0, grab), -1);
    // squeeze splash + drips
    const d = t - 16.9;
    if (d > 0) for (let i = 0; i < 26; i++) {
      const a = hash(i * 1.7) * TAU, v = 380 + hash(i * 2.9) * 620, x = RX + (i % 2 ? 60 : -60) + Math.cos(a) * v * d * (i % 2 ? 1 : 1), y = (i % 2 ? y1 : y2) + 100 + Math.sin(a) * v * d * .7 + 1500 * d * d, r = (9 + hash(i * 4.1) * 10) * clamp(1.2 - d * .9);
      if (r > 0) circ(g, x, y, r, C.mist);
    }
    for (let i = 0; i < 6; i++) { const ph = (t * 1.6 + hash(i * 9.1)) % 1, by = (i % 2 ? y1 : y2) + 205, x = RX - 50 + hash(i * 3.3) * 100, y = by + ph * ph * 900; if (t > 16.95) { g.beginPath(); g.moveTo(x, y - 34); g.quadraticCurveTo(x + 15, y, x, y + 12); g.quadraticCurveTo(x - 15, y, x, y - 34); g.fillStyle = C.mist; g.fill(); } }
    rain(g, t, { n: 26, seed: 14, alpha: .6, len: 220, w: 8, speed: 3200 });
  });
}

/* ============ S3d — a giant metal bell ============ */
function S3d(g, t, u) {
  g.fillStyle = C.ink; g.fillRect(0, 0, W, H);
  const per = 1.5, ph = TAU * (t - 18.0) / per, A = .4 * E.out(seg(u, -.6, .9));
  const ang = A * Math.sin(ph), clap = -A * 1.5 * Math.sin(ph - .9);
  const hit = Math.max(pulse(t, 18.0 + per * .25 + .2, .3), pulse(t, 18.0 + per * .75 + .2, .3), pulse(t, 18.0 + per * 1.25 + .2, .3), pulse(t, 18.0 + per * 1.75 + .2, .3));
  const strikeT = [19.88]; const lf = pulse(t, 19.88, .5);
  const sh = shake(t, 9 * hit + 6 * lf);
  withCam(g, 960 + sh[0], 540 + sh[1], lerp(1.12, 1, E.out(seg(u, 0, 1.2))), 0, () => {
    // arched opening to the storm
    g.save(); g.beginPath(); g.moveTo(330, 1200); g.lineTo(330, 520); g.arc(960, 520, 630, PI, 0); g.lineTo(1590, 1200); g.closePath(); g.clip();
    g.fillStyle = lf > .75 ? C.paper : C.night; g.fillRect(0, -200, W, 1500);
    cloud(g, 700, 60, 1500, 300, 71, t, { carve: lf > .5 ? C.mist : C.storm, up: 300 }); cloud(g, 1300, 200, 900, 240, 72, t, { carve: C.storm });
    hills(g, 900, 120, 4, C.storm);
    townRow(g, 200, 1700, 940, 77, { col: mix(C.night, C.ink, .6), win: C.gold, hmin: 30, hmax: 70, lit: .5 });
    if (lf > 0 && lf < .96) bolt(g, 1260, 250, 1330, 880, 91, { w: 18 * lf, amp: 40, n: 7, branches: 2, core: C.gold });
    rain(g, t, { n: 90, seed: 9, alpha: .45 });
    g.restore();
    // arch frame carving
    g.strokeStyle = C.storm; g.lineWidth = 10; g.beginPath(); g.moveTo(300, 1200); g.lineTo(300, 520); g.arc(960, 520, 660, PI, 0); g.lineTo(1620, 1200); g.stroke();
    bricks(g, -40, 40, 330, 1000, 3, C.night, 6, 70); bricks(g, 1630, 40, 330, 1000, 4, C.night, 6, 70);
    // floor
    g.fillStyle = C.ink; g.fillRect(-100, 1000, 2200, 200); line(g, -100, 1000, 2100, 1000, C.storm, 10, 'butt');
    for (let i = 0; i < 9; i++) line(g, 60 + i * 240, 1012, 20 + i * 240, 1100, C.storm, 6);
    // beam + bell
    g.fillStyle = C.ink; g.fillRect(-100, -120, 2200, 150); line(g, -100, 30, 2100, 30, C.storm, 8, 'butt');
    const gl = seg(t, 19.86, 20.36);
    bell(g, 960, -30, 760, ang, { clap, gleam: gl > 0 && gl < 1 ? gl : null, col: lf > .8 ? C.paper : C.gold });
    // strike marks at the lip
    if (hit > .1) { const side = Math.sin(ph - .9) > 0 ? -1 : 1; const bx = 960 + side * 430 * Math.cos(ang) - 700 * Math.sin(ang), by = -30 + 700 * Math.cos(ang) + side * 430 * Math.sin(ang);
      for (let i = 0; i < 3; i++) { g.save(); g.globalAlpha = hit; g.strokeStyle = C.paper; g.lineWidth = 9; g.beginPath(); g.arc(bx, by, 70 + i * 46 + (1 - hit) * 90, side > 0 ? -.9 : PI - .9, side > 0 ? .9 : PI + .9); g.stroke(); g.restore(); } }
    // rope over a pulley, ringer dangling
    const lift = (Math.sin(ph) * .5 + .5) * 230 * (A / .4);
    const RX = 1650, hy = 700 - lift;
    line(g, RX, -100, RX, hy + 40, C.rope, 12, 'butt');
    for (let i = 0; i < 4; i++) line(g, RX, hy - 20 + i * 22, RX, hy - 9 + i * 22, i % 2 ? C.paper : C.red, 24, 'butt');
    const fy = Math.min(1000, hy + 240);
    ringer(g, RX - 8, fy, 230, { hands: [[RX - 4, hy + 6], [RX + 4, hy - 26]], look: [-.8, -.9], wide: lift > 120, mouth: lift > 120 ? 'o' : null, lean: Math.sin(ph + 1) * .06 });
  });
  flash(g, .5 * pulse(t, 19.88, .1));
}

/* ============ S4 — you see the problem ============ */
function S4(g, t, u) {
  g.fillStyle = C.ink; g.fillRect(0, 0, W, H);
  const TX = 880;
  withCam(g, 1010, 610, 1.22 + u * .025, 0, () => {
    g.save(); g.globalAlpha = .5; g.strokeStyle = C.storm; g.lineWidth = 2;
    g.beginPath(); for (let x = -120; x <= W + 120; x += 60) { g.moveTo(x, -120); g.lineTo(x, H + 120); } for (let y = -120; y <= H + 120; y += 60) { g.moveTo(-120, y); g.lineTo(W + 120, y); } g.stroke(); g.restore();
    const dr = E.out(seg(u, 0, .32)), P = C.paper, lw = 5;
    const D = (pts, c) => pathLine(g, partial(pts, dr), c || P, lw, 'miter');
    // cloud
    g.save(); g.strokeStyle = P; g.lineWidth = lw; g.lineCap = 'round'; g.setLineDash([2000]); g.lineDashOffset = 2000 * (1 - dr) * 0;
    g.beginPath(); const cb = [[TX - 250, 120, 70], [TX - 140, 90, 90], [TX, 80, 100], [TX + 140, 95, 86], [TX + 250, 125, 66]];
    for (const c of cb) { g.moveTo(c[0] - c[2], c[1]); g.arc(c[0], c[1], c[2], PI, PI + PI * dr); } g.stroke();
    g.beginPath(); g.moveTo(TX - 320, 172); g.lineTo(TX - 320 + 640 * dr, 172); g.stroke(); g.restore();
    // tower outline
    D([[TX - 110, 1010], [TX - 110, 660], [TX - 140, 660], [TX - 140, 440], [TX, 310], [TX + 140, 440], [TX + 140, 660], [TX + 110, 660], [TX + 110, 1010]]);
    D([[TX - 140, 440], [TX + 140, 440]]); D([[TX, 310], [TX, 240]]); D([[TX - 22, 268], [TX + 22, 268]]);
    D([[TX - 600, 1010], [TX + 900, 1010]]);
    // bell outline
    g.save(); g.globalAlpha = dr; g.strokeStyle = P; g.lineWidth = lw; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(TX - 22, 490); g.bezierCurveTo(TX - 34, 520, TX - 30, 580, TX - 66, 622); g.lineTo(TX + 66, 622); g.bezierCurveTo(TX + 30, 580, TX + 34, 520, TX + 22, 490); g.closePath(); g.stroke();
    g.restore();
    // rope
    D([[TX, 622], [TX, 880]]);
    // dimension bracket: highest point in town
    const k1 = E.back(seg(t, 21.38, 21.62)), k2 = E.back(seg(t, 21.66, 21.9)), k3 = E.back(seg(t, 21.94, 22.18));
    townRow(g, TX + 330, TX + 900, 1010, 81, { col: C.storm, hmin: 50, hmax: 120 });
    townRow(g, TX - 600, TX - 240, 1010, 82, { col: C.storm, hmin: 50, hmax: 120 });
    if (k1 > 0) { g.save(); g.globalAlpha = clamp(k1); const bx = TX + 250; pathLine(g, [[bx - 16, 240], [bx + 16, 240]], C.gold, 6); pathLine(g, [[bx - 16, 1010], [bx + 16, 1010]], C.gold, 6); const yy = lerp(1010, 240, clamp(k1)); line(g, bx, 1010, bx, yy, C.gold, 6); poly(g, [[bx - 16, yy + 26], [bx, yy], [bx + 16, yy + 26]], C.gold); g.setLineDash([10, 14]); line(g, TX + 30, 240, bx - 24, 240, C.gold, 4); g.setLineDash([]); g.restore(); }
    if (k2 > 0) { g.save(); g.translate(TX, 560); g.scale(clamp(k2, 0, 1.2), clamp(k2, 0, 1.2)); g.translate(-TX, -560); g.fillStyle = C.gold; g.beginPath(); g.moveTo(TX - 22, 490); g.bezierCurveTo(TX - 34, 520, TX - 30, 580, TX - 66, 622); g.lineTo(TX + 66, 622); g.bezierCurveTo(TX + 30, 580, TX + 34, 520, TX + 22, 490); g.closePath(); g.fill(); line(g, TX - 16, 520, TX - 30, 596, C.paper, 6); g.restore(); }
    if (k3 > 0) for (let i = 0; i < 3; i++) { const x = TX + 30 + i * 4, y = 700 + i * 62 + ((t * 60) % 30), s = clamp(k3) * (1 - i * .12); g.beginPath(); g.moveTo(x, y - 22 * s); g.quadraticCurveTo(x + 13 * s, y, x, y + 9 * s); g.quadraticCurveTo(x - 13 * s, y, x, y - 22 * s); g.fillStyle = C.mist; g.fill(); }
    // the ringer
    const pth = [[TX + 60, 172], [TX + 30, 205], [TX, 240], [TX, 490], [TX, 622], [TX, 868]];
    const p = E.inOut(seg(t, 21.3, 22.3)), head = pointAt(pth, p);
    const lookCam = seg(t, 22.36, 22.5), blink = (t > 22.72 && t < 22.84);
    const fx = TX - 62, fy = 1008;
    ringer(g, fx, fy, 128, { hands: [[TX - 4, 880], [TX + 2, 856]], look: [lerp(.7, 0, lookCam), lerp(clamp((head[1] - 800) / 500, -1, 0), 0, lookCam)], blink, wide: lookCam > .5 && !blink });
    if (lookCam > 0) { const sy = 880 + seg(t, 22.4, 23.15) * 40; g.globalAlpha = lookCam; g.beginPath(); g.moveTo(fx - 34, sy - 16); g.quadraticCurveTo(fx - 24, sy, fx - 34, sy + 6); g.quadraticCurveTo(fx - 44, sy, fx - 34, sy - 16); g.fillStyle = C.mist; g.fill(); g.globalAlpha = 1; }
    // the red path
    if (p > 0) {
      const vis = partial(pth, p); g.setLineDash([22, 14]); g.lineDashOffset = -t * 120; pathLine(g, vis, C.red, 9, 'miter'); g.setLineDash([]);
      const h = vis[vis.length - 1]; star4(g, h[0], h[1], 34 + Math.sin(t * 40) * 6, C.red, t * 3, .3); circ(g, h[0], h[1], 9, C.paper);
      const nodes = [[TX, 240, .13], [TX, 556, .52], [TX, 868, .99]];
      for (const n of nodes) if (p >= n[2]) { const a = seg(t, 21.3 + n[2], 21.3 + n[2] + .5); circ(g, n[0], n[1], 14, C.red); g.save(); g.globalAlpha = 1 - a; circ(g, n[0], n[1], 14 + a * 70, null, C.red, 6); g.restore(); }
    }
  });
}
