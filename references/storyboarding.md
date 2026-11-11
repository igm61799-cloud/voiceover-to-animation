# Storyboarding against a voiceover

The storyboard is where the film is made. Code only executes it.

## 1. Break the narration into beats

Take the sentence list from `transcribe.py`. For each sentence ask: how many separate pictures does this contain?

> "So whenever thunder rolled in, someone climbed to the highest point in town, grabbed a wet rope, and started ringing a giant metal bell."

That is four pictures: the storm arriving, the climb, the wet rope, the giant bell. Each gets its own shot, cut on the comma. The viewer should never be looking at picture 2 while hearing picture 3.

A sentence that is a single thought ("You see the problem.") gets a single, simple, held image - often a diagram that summarises what was just shown.

Typical density: a new shot or a clear new beat every 1.5-4 seconds. Slower than that feels like a slideshow; faster than one second per image is unreadable unless it is a deliberate rapid-fire gag.

## 2. Write the shot table

For every shot:

| field | example |
|---|---|
| time | 16.68 - 18.14 |
| words | "grabbed a wet rope," |
| picture | extreme close-up: two hands clamp a thick rope, water squeezes out |
| beats | hands close on "grabbed" (16.80); splash on contact; rope pulled down on "rope" (17.60) |
| palette | night blue, rope in tan, sleeves red |
| camera | slight dutch tilt, slow push |

Cut 0.1-0.2 s *before* the first word of the phrase the shot belongs to. The eye needs a few frames to read a new image; if the cut lands exactly on the word, the picture feels late.

Land the main visual event on the stressed word, not on the start of the sentence. "Lightning **struck** a church" - the bolt hits on "struck".

## 3. Find the picture

For each beat, try these in order until one is clearly the best:

1. **Show the literal thing happening**, staged as dramatically as it allows (low angle, extreme close-up, cross-section).
2. **Show the consequence** instead of the action (the sandals left smoking, not the electrocution).
3. **Show the mechanism** as a diagram: a path traced through the parts, a cutaway, a map, a top-down plan. Good for "why" and "because" sentences.
4. **Show the comparison**: two things side by side, big against small, before against after. Good for irony.
5. **Personify the abstract**: a belief becomes a medallion in a manuscript; an authority becomes one giant face; "heaven" becomes an eye that can look offended.

Abstract or emotional sentences ("thousands of people were killed") deserve restraint: a field of small lights going out says more than anything literal, and the tone shift is part of the storytelling.

Avoid on-screen words that repeat what is being said. Dates, place names and numbers that the narration speaks do not need to be printed; a map with a pulsing dot does the job of a place-name caption and is nicer to look at. Text is for things the narration does *not* say (a real label on a chart) or when the user asks for it.

## 4. Make it one film

- **A recurring character or object.** One small figure who appears in most scenes gives the viewer someone to follow. Keep the design simple enough to read at 100 px tall: one strong colour, a round head, two dot eyes.
- **Motifs that return.** If the storm has eyes in scene 1, something should have eyes later. If a gag pays off in the opening, the ending should call it back.
- **Colour as structure.** Assign each act a dominant colour and let the story's turns be colour changes: calm night blue, the red of an argument, the white flash of the event, back to night.
- **Scale contrast inside a shot.** Tiny person, giant bell. Tiny proposal, enormous bishop. One element should be much larger than the others.
- **Camera with intent.** Push in for realisation, pull back to reveal scale, track with a moving character, tilt up to reveal what is above. One move per shot.

## 5. Transitions

Hard cuts on phrase boundaries are the default and are almost always right. Use a designed transition only where it means something:
- a lightning flash that becomes the paper of the next scene,
- a dot on a map that grows into an iris opening on the city,
- smoke that fills the frame and clears to reveal the aftermath,
- a drawing that inverts into the real night scene it described.

## 6. Check the board before coding

Read the table top to bottom at speaking pace. Flag any shot that is (a) the same composition as its neighbour, (b) on screen longer than five seconds without a new beat, (c) dependent on text to be understood, or (d) impossible to read in one second. Fix those on paper.

See `example-bells/storyboard.md` for a complete board.
