'use strict';
/* scenes.js — the film. Replace the two demo shots with your own.

   A shot is a function (g, t, u):
     g = CanvasRenderingContext2D of a 1920x1080 scene buffer
     t = absolute time in seconds (same clock as the voiceover)
     u = seconds since this shot started
   It must be a PURE function of time: no state kept between calls, no Math.random(), no Date.
   Use hash(n), noise1(x) and rng(seed) from engine.js for anything random. */

const FPS = 30;
const DUR = 8.0;                      // total length in seconds (voiceover length + optional tail)
const AUDIO = '../voiceover.mp3';     // used by the live player only; render.py muxes the real file
const POST = { rough: true, grain: true, specks: true, vignette: true };

/* restyle by reassigning palette entries, e.g.  C.red = '#ff5a36'; */

/* ---- demo shot A: night, a storm, one strike on the beat ---- */
function demoStorm(g, t, u) {
  g.fillStyle = C.night; g.fillRect(0, 0, W, H);
  const STRIKE = 2.4;                                    // absolute time of the word this lands on
  const z = lerp(1.25, 1, E.out(seg(u, 0, 2)));          // slow settle
  const sh = shake(t, 16 * pulse(t, STRIKE, .5));        // camera shake that decays after the hit
  withCam(g, 960 + sh[0], 540 + sh[1], z, 0, () => {
    stars(g, t, 60, 3, 600, { x0: -200, w: 2400 });
    hills(g, 860, 180, 2, C.storm);
    townRow(g, -200, 2200, 1000, 21, { col: C.ink, win: C.gold, hmin: 80, hmax: 200, lit: .5 });
    g.fillStyle = C.ink; g.fillRect(-300, 996, 2600, 400);
    cloud(g, 960, 60, 2600, 320, 11, t, { up: 500, carve: C.storm, lw: 7 });
    const d = t - STRIKE;
    if (d >= 0 && d < .3) bolt(g, 1040, 220, 1180, 900, 5, { w: 34 * (1 - d * 1.6), amp: 70, core: C.gold, glow: C.gold, prog: seg(d, 0, .05), branches: 3 });
    rain(g, t, { n: 110, seed: 8, alpha: .5 });
  });
  flash(g, pulse(t, STRIKE, .1));                        // screen-space flash, after the camera
}

/* ---- demo shot B: paper, a diagram that draws itself ---- */
function demoPaper(g, t, u) {
  g.fillStyle = C.paper; g.fillRect(0, 0, W, H);
  withCam(g, 960, 540, 1 + u * .01, 0, () => {
    g.strokeStyle = C.ink; g.lineWidth = 7; g.strokeRect(46, 44, W - 92, H - 88);
    const path = [[420, 760], [760, 420], [1080, 640], [1500, 300]];
    pathLine(g, partial(path, E.inOut(seg(u, .2, 1.6))), C.red, 12, 'round');   // draw-on
    for (let i = 0; i < path.length; i++) {
      const pop = E.back(seg(u, .3 + i * .4, .6 + i * .4));                      // staggered pop-in
      circ(g, path[i][0], path[i][1], 26 * pop, C.ink); star4(g, path[i][0], path[i][1], 14 * pop, C.gold, t);
    }
  });
}

/* ---- the edit: [start, end, shot]. Cut a beat (~0.1-0.2 s) before the phrase the shot belongs to. ---- */
const SHOTS = [
  [0, 4.0, demoStorm],
  [4.0, DUR + 1, demoPaper],   // let the last shot run past DUR so the final frame is never empty
];
