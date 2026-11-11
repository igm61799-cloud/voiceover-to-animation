"""Word-level timestamps for a voiceover (faster-whisper).

  python transcribe.py path/to/voiceover.mp3 [out_dir]

Writes <out_dir>/words.json  ([{"w": word, "s": start, "e": end}, ...]) and prints two views:
  - sentences with start/end  -> where shots begin and end
  - word@start on one line    -> which exact word a visual beat should land on
Tries the GPU first and falls back to CPU, so it works on any machine (CPU takes ~1x realtime).
Needs: pip install faster-whisper
"""
import json, pathlib, sys

from faster_whisper import WhisperModel

audio = sys.argv[1]
out_dir = pathlib.Path(sys.argv[2] if len(sys.argv) > 2 else "work")
out_dir.mkdir(parents=True, exist_ok=True)

segs = info = None
for name, device, ctype in (("large-v3", "cuda", "float16"), ("medium", "cpu", "int8")):
    try:
        model = WhisperModel(name, device=device, compute_type=ctype)
        it, info = model.transcribe(audio, word_timestamps=True, vad_filter=False)
        segs = list(it)
        break
    except Exception as e:  # missing CUDA libraries are the usual reason
        print(f"[{device} unavailable: {str(e)[:80]}]", file=sys.stderr)
if segs is None:
    raise SystemExit("transcription failed on both GPU and CPU")

print(f"language={info.language} duration={info.duration:.2f}s\n")
words = []
for s in segs:
    print(f"[{s.start:6.2f} - {s.end:6.2f}] {s.text.strip()}")
    words += [{"w": w.word.strip(), "s": round(w.start, 2), "e": round(w.end, 2)} for w in s.words]
(out_dir / "words.json").write_text(json.dumps(words, ensure_ascii=False), encoding="utf-8")
print("\n" + " ".join(f"{w['w']}@{w['s']}" for w in words))
print(f"\nwrote {out_dir / 'words.json'}")
