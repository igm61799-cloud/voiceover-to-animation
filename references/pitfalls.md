# Pitfalls (each of these happened)

## Composition

- **Vertical action needs screen height you may not have.** A tower plus a storm cloud plus a lightning bolt between them does not fit comfortably in 1080 px: the bolt ends up a short horizontal scribble. Plan by on-screen pixels, not world pixels - zooming the camera out does not make the bolt longer on screen. Fix by going diagonal (cloud upper-left, target lower-right), or by building a taller world and using a wider shot only for the strike.
- **The subject is too small.** A 100 px character in a 1920 px frame is a dot. Either the camera goes to the character, or the shot is about something else. Check every wide shot on the contact sheet at thumbnail size: if you cannot tell what it is, neither can the viewer.
- **Dead frame.** A diagram centred at its natural size often leaves half the frame empty. Scale and offset the camera until the drawing fills the safe area.
- **Low contrast neighbours.** Dark figure on dark interior, paper-coloured hand on a paper-coloured rope. Before drawing an element, name what is behind it and pick the opposite value.
- **Zoom-outs reveal the edge of the set.** Any shot whose zoom drops below 1, or that shakes, needs backgrounds, ground and skylines drawn well beyond the 1920x1080 rectangle.

## Code

- **`E.back(0)` must be exactly 0.** The textbook formula returns ~2e-16 at zero, so `if (pop > 0)` draws things early. The bundled easing guards this; keep the guard if you add easings, and gate on `seg(...) > 0` rather than on the eased value.
- **`burst()` with inner radius 0 draws nothing.** A star polygon whose every second vertex is the centre has zero area. Give sunbursts and rays a real inner radius.
- **State between frames.** A counter incremented per frame, a particle array pushed to, a cached "previous position" - all break under out-of-order rendering. Derive everything from `t`: particle `i` is at `f(hash(i), t - birth_i)`.
- **Clip interiors.** Characters walking into a room from "outside" need a `g.clip()` to the room's rectangle or they slide over the walls.
- **Reset what you set.** `setLineDash`, `globalAlpha`, `filter` and `globalCompositeOperation` leak into later draws. Wrap in `g.save()/g.restore()` or reset explicitly.
- **Dash-reveal needs a long enough dash.** Drawing a line on with `setLineDash([len * p, big])` requires `big` to exceed the total path length, or the line repeats.

## Timing

- **Cutting exactly on the word feels late.** Cut 0.1-0.2 s early.
- **A visual gag needs three beats of time**: set up, hit, aftermath. If the narration leaves only 0.5 s, extend the film past the end of the audio rather than cramming it.
- **Flash frames on a contact sheet look broken.** A still taken during a 3-frame white flash is washed out. That is expected; sample 0.2 s later to judge the shot.
- **Speech-to-text timestamps drift a little** on long pauses. If a beat must be frame-accurate, check the word's start against the neighbours and trust the later of the two readings.

## Output

- **Film grain makes large files.** With the print texture on, CRF 15 gives ~165 MB per minute; CRF 20-21 gives ~75 MB per minute with no visible loss. The renderer defaults to 20.
- **JPEG frames at quality 0.95** piped to ffmpeg are much faster than PNG screenshots and indistinguishable after H.264.
- **Chunks must come from the same code.** Do not edit `src/` while a full render is running; some workers will have loaded the old file.
- **GPU transcription may be unavailable** (missing CUDA libraries). `transcribe.py` falls back to CPU automatically; it is slower but fine for a few minutes of audio.
