---
name: voiceover-to-animation
description: Turn a voiceover or narration audio file into a finished, fully coded 2D animated video (MP4) with no video-generation models and no stock footage - every frame is drawn by code (Canvas 2D), cut to the exact word timings of the narration, and rendered with headless Chromium + ffmpeg. Use this whenever the user hands over an audio file (voiceover.mp3, lektor, narration, podcast clip) and wants an animation, animated short, explainer, motion graphics, "Kurzgesagt-style" video, coded animation or b-roll made from scratch for it; when they say things like "animate this voiceover", "make a video for this audio", "zrób animację do tego lektora", "zanimuj ten voiceover"; and also when they have only a script and want a coded animated video (make or request the audio first). Prefer this over one-off improvised HTML/CSS animation whenever the result has to be a real video file synced to speech.
---

# Voiceover -> coded 2D animated short

You are making a short film, not a slideshow. The narration is fixed; your job is to invent what the viewer *sees* at every moment, draw it in code, and deliver an MP4 whose cuts and visual beats land on the right words.

The whole pipeline is deterministic: each scene is a pure function of time, so any frame can be rendered on its own. That one property gives you everything else - instant stills for review, parallel rendering, perfect audio sync.

## What you need on the machine

Check these before starting; they are the only moving parts.

```bash
python -c "import faster_whisper, playwright, PIL; print('ok')"
ffmpeg -version
```

Missing pieces: `pip install faster-whisper playwright pillow`, then `python -m playwright install chromium`. ffmpeg must be on PATH. If something cannot be installed, tell the user what is missing rather than switching to a weaker approach.

## The workflow

Keep the user's view simple: they gave you audio and want a film. Work through these steps in order, and keep a visible task list.

### 1. Listen first: word timings

```bash
python <skill>/scripts/transcribe.py voiceover.mp3 work
```

It prints sentences with start/end times and every word as `word@start`, and saves `work/words.json`. Everything downstream is planned against these numbers. Note the total duration.

### 2. Set up the project next to the audio

Copy `<skill>/assets/template/` into the working folder so it looks like this:

```
voiceover.mp3
render.py
src/index.html  src/engine.js  src/scenes.js  src/main.js
```

Read `src/engine.js` once (it is short) and skim `references/engine-api.md` so you know what you already have: easing, seeded randomness, a camera, partial-path drawing, and print-style motifs (clouds, rain, lightning, smoke, skylines).

### 3. Decide the art direction, then storyboard against the words

Pick ONE visual language and hold it for the whole film: a small palette (five or six colours), one treatment for edges and texture, one way of drawing people. The template ships a linocut/print look (bone paper, navy inks, vermilion, gold, wobbling hand-cut edges). Use it, or restyle it by changing the palette in `scenes.js` and the `POST` switches - but do not mix styles between scenes. Variety comes from which colour dominates each scene (a night scene, a paper scene, a red scene), not from changing the rules.

Then write the storyboard before writing code: a table of shots with absolute start/end times, the words each shot covers, what is on screen, and the exact word each beat lands on. Read `references/storyboarding.md` for how to turn narration into images - it is the part that decides whether the film is good.

The short version:
- One idea per phrase. A sentence with three clauses is usually three shots or three beats inside one shot.
- Show the thing, do not caption it. On-screen text that repeats the narration makes the viewer read instead of watch. Default to no text at all; names, real data and a short neutral label on a chart are the exceptions. If the user has stated text preferences, those win.
- Give the film a spine: a recurring character or motif, and a callback at the end to something from the opening.
- Change scale and camera on purpose: wide, close-up, diagram, map, cross-section. Two consecutive shots should not have the same composition.
- If the narration ends on a punchline, add 1-2 s of silent tail after the last word so the final image can land. `render.py` pads the audio.

### 4. Build one scene end to end before writing the rest

Write the first shot in `src/scenes.js`, register it in `SHOTS`, and look at it:

```bash
python render.py stills 0.3,1.5,2.9 first
```

Then open `work/first.png` with the Read tool. Do this before coding the other scenes: it proves the pipeline and, more importantly, lets you judge the style while changing it is still cheap.

### 5. Write the remaining scenes, a few at a time

Rules that keep the system working (each one exists because breaking it causes a specific failure):

- **Pure functions of time.** A shot is `function name(g, t, u)` where `t` is absolute seconds and `u` is seconds since the shot began. No variables that accumulate between frames, no `Math.random()`, no `Date`. Use `hash(n)`, `noise1(x)`, `rng(seed)`. Frames are rendered out of order by several browsers at once; anything stateful shows up as flicker or as chunks that do not match.
- **Animate with absolute times.** Write `E.out(seg(t, 12.62, 13.1))`, using numbers straight from the word list. When the edit changes, the beats stay on their words.
- **Everything moves a little.** A held frame reads as a bug. Give every shot a slow camera drift (`1 + u * .01` zoom is enough) and some secondary motion (rain, smoke, a swinging object).
- **Ease everything.** `E.out` for things arriving, `E.inOut` for camera moves, `E.back` for pops, `E.bounce` for landings. Linear motion looks mechanical.
- **Draw the world bigger than the frame** whenever the camera zooms out or shakes; fill backgrounds and ground well past 0..1920 so no edge is ever exposed.
- **Impacts get three things**: a 2-3 frame full-screen `flash`, a decaying `shake`, and something that reacts (a puff, a recoil, a colour flip).
- **Split scene code across files** (`s1.js`, `s2.js`, ...) once a file passes a few hundred lines, and add them to `index.html` before `scenes.js`.

Write two or three shots, render a contact sheet of them, look, fix, continue. Do not write the whole film blind.

### 6. Review with stills - this is your eyes

You cannot watch the video, so the contact sheet is the review. For every shot, sample at least the start, the middle of the main action, and the end, plus the exact frame of each beat:

```bash
python render.py stills 12.2,13.3,14.3,15.4,16.5 act2     # up to ~16 timestamps per sheet
python render.py sheet 4                                   # whole film, one frame every 4 s
```

Read the PNG and check, shot by shot: Is the subject big enough to read at a glance? Is anything clipped, overlapping or floating? Does the important thing have contrast against what is behind it? Does it look designed, or is half the frame empty? Then fix and re-render the same timestamps. `references/pitfalls.md` lists the mistakes that are easy to make and hard to notice.

Page errors are printed by `render.py` as `PAGE ERROR:` lines - a black or half-drawn frame usually means an exception in that shot.

### 7. Render and verify

```bash
python render.py full --workers 8
```

Run it in the background; a 70 s film is about 2,100 frames and takes a few minutes. It writes `output.mp4` (1920x1080, H.264 + AAC, audio padded to the full length). Then verify the file itself, not just the stills:

```bash
ffprobe -v error -show_entries format=duration:stream=codec_name,width,height -of default=nw=1 output.mp4
python render.py sheet 6
```

Confirm the duration, that there is an audio stream, and that the overview sheet has no empty frames. Say plainly in your report that you checked stills and file properties but have not watched it in motion - the user should watch it once.

### 8. Hand over

Give the user the path to `output.mp4`, the overview sheet, and one line on how to re-render after edits. `src/index.html` opened in a browser is a live player with the audio, which is the fastest way for them to check timing.

## Sound

Deliver the voiceover only unless the user asked for music or sound effects. If they did, add them as extra ffmpeg inputs in the final mux, timed from the same beat list you used for the visuals.

## Reference files

- `references/storyboarding.md` - turning narration into shots; beat placement; visual metaphors; what makes a scene feel designed. Read before step 3.
- `references/engine-api.md` - every helper in `engine.js` with a one-line use. Read before step 5.
- `references/pitfalls.md` - failure modes found the hard way, with fixes. Read before step 6.
- `references/example-bells/` - a complete 71-second film (16 shots, ~900 lines of scene code) with its storyboard. Read `storyboard.md` to see the level of planning expected; open the `src/s*.js` files when you want to see how a specific effect was built (a camera that follows a climbing character, an explosion, a map, a quill that draws a line, an eye that narrows).
