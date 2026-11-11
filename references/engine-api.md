# engine.js reference

All coordinates are in a 1920x1080 space (`W`, `H`). `g` is a `CanvasRenderingContext2D`. Nothing here keeps state.

## Time and easing

| helper | use |
|---|---|
| `seg(t, a, b)` | 0..1 progress of `t` between absolute times `a` and `b`, clamped. The basic building block: `E.out(seg(t, 12.6, 13.1))`. |
| `pulse(t, t0, d)` | 1 at `t0`, falling linearly to 0 over `d` seconds, 0 before. For flashes, shakes, recoils. |
| `E.in / out / out5 / inOut` | cubic and quintic easings. `out` for arrivals, `inOut` for camera moves. |
| `E.back` | overshoot pop. `E.bounce` landing. `E.elastic` wobble. |
| `clamp`, `lerp` | the usual. |

## Deterministic randomness

| helper | use |
|---|---|
| `hash(n)` | number -> 0..1, stable. `hash(i * 3.1)` for per-item variation; `hash(Math.floor(t * 12))` for a value that changes 12 times a second (flicker, jitter). |
| `noise1(x)` | smooth 1-D value noise, 0..1. Terrain lines, drifting motion. |
| `rng(seed)` | returns a generator function; call it repeatedly for a reproducible sequence. For building a layout once. |
| `shake(t, amp, seed)` | `[dx, dy]` camera shake. Multiply `amp` by a `pulse` so it decays. |

## Colour

`C` is the palette: `ink, night, storm, mist, paper, red, gold, rust`. Reassign entries in `scenes.js` to restyle. `mix(c1, c2, t)` blends two hex colours (returns `rgb()`), which is how a scene changes mood over time.

## Camera and screen

| helper | use |
|---|---|
| `withCam(g, cx, cy, zoom, rot, fn)` | draw `fn` with world point `(cx, cy)` at screen centre. Animate the arguments for pans, pushes and tilts. Everything inside is world space. |
| `flash(g, alpha, col)` | full-screen colour wash. Call after `withCam` so it is in screen space. |

## Drawing

| helper | use |
|---|---|
| `poly(g, pts, fill, stroke, lw)` | closed polygon from `[[x,y],...]`. |
| `circ(g, x, y, r, fill, stroke, lw)` | circle. |
| `line(g, x1, y1, x2, y2, col, w, cap)` | one segment. |
| `pathLine(g, pts, col, w, join)` | open polyline. |
| `rr(g, x, y, w, h, r, fill)` | rounded rectangle. |
| `partial(pts, p)` | the first `p` (0..1) of a polyline by length - draw-on effects: `pathLine(g, partial(path, E.inOut(seg(...))), ...)`. |
| `pointAt(pts, p)` | the point at fraction `p` along a polyline - move a pen, a spark or a character along a path. |
| `hatch(g, x, y, w, h, gap, col, lw, ang)` | parallel carved lines over a rectangle. Call inside a `g.clip()` to shade a shape. |
| `star4(g, x, y, r, col, rot, pinch)` | four-point sparkle. |
| `burst(g, x, y, r1, r2, n, col, rot)` | n-point star/sunburst between inner radius `r1` (must be > 0) and outer `r2`. Huge `r2` = background rays. |
| `taper(g, pts, w0, w1, col)` | polyline drawn as a ribbon that narrows from `w0` to `w1`. |

## Motifs

| helper | use |
|---|---|
| `rain(g, t, o)` | diagonal streaks. Draw one sparse layer behind the subject and one in front for depth. |
| `cloud(g, cx, cy, w, h, seed, t, o)` | woodcut cloud. `o.up` fills a slab above (cloud ceiling), `o.carve: null` removes the spirals, `o.a0: t * 2` makes them roll. Returns the blob list if you want to place a face. |
| `bolt(g, x1, y1, x2, y2, seed, o)` | lightning. Show for ~0.3 s with `o.prog: seg(d, 0, .05)` and a shrinking `o.w`; change the seed halfway for a re-strike. |
| `smoke(g, x, y, s, t, a, col)` | two rising wisps. |
| `puff(g, x, y, r, p, col)` | poof ring for `p` 0..1 - disappearances and impacts. |
| `bricks(g, x, y, w, h, seed, col, lw, row)` | broken dashes that read as masonry on a filled wall. |
| `stars(g, t, n, seed, y1, o)` | twinkling field. |
| `hills(g, y, amp, seed, col, x0, x1)` | noise ridge silhouette for a horizon. |
| `townRow(g, x0, x1, baseY, seed, o)` | row of houses with optional lit windows. Two rows in different shades give depth. |

## Post-process (main.js)

`POST = { rough, grain, specks, vignette }` in `scenes.js`.
- `rough`: an SVG displacement filter that makes every edge slightly hand-cut, re-seeded 8 times a second so the image "boils". Turn off for a clean vector look. Strength is the `scale` attribute in `index.html`.
- `grain`, `specks`: paper tooth and print dust. `vignette`: darkened corners.

## Patterns worth copying

```js
// one-shot event at absolute time T
const d = t - T;
if (d >= 0 && d < .3) bolt(g, x1, y1, x2, y2, 5, { w: 34 * (1 - d * 1.6), prog: seg(d, 0, .05) });

// staggered entrance of N items
for (let i = 0; i < N; i++) { const pop = E.back(seg(u, .2 + i * .08, .5 + i * .08)); if (pop <= 0) continue; /* draw scaled by pop */ }

// particles without state: item i is a function of its own age
for (let i = 0; i < 30; i++) { const a = hash(i * 1.7) * TAU, v = 400 + hash(i * 2.9) * 600; circ(g, x0 + Math.cos(a) * v * d, y0 + Math.sin(a) * v * d + 900 * d * d, 8 * (1 - d), C.mist); }

// camera that follows something
const p = pointAt(path, E.inOut(seg(t, 28.1, 29.6)));
withCam(g, p[0], p[1] - 100, 1.1, 0, () => { /* world */ });

// a repeated cycle (swing, bob, blink)
const swing = Math.sin(TAU * t / 1.0) * .6;          // period 1 s
const blink = (t % 3.1) < .12;
```
