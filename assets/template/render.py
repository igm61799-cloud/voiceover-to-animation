"""Offline renderer for the coded animation in ./src (headless Chromium -> ffmpeg).

  python render.py stills 1.0,2.5,7 [name]     work/<name>.png contact sheet of exact timestamps
  python render.py sheet [every_seconds]       work/overview.png, one frame every N seconds (default 4)
  python render.py full [--workers 8] [--audio voiceover.mp3] [--out output.mp4] [--crf 20]

Duration and frame rate come from DUR / FPS in src/scenes.js, so there is nothing to keep in sync here.
Needs: pip install playwright pillow && python -m playwright install chromium ; ffmpeg on PATH.
"""
import argparse, base64, io, pathlib, subprocess, sys

ROOT = pathlib.Path(__file__).resolve().parent
URL = (ROOT / "src" / "index.html").as_uri()
JS = "t=>{renderFrame(t);return document.getElementById('c').toDataURL('image/jpeg',0.95)}"


def open_page(p):
    b = p.chromium.launch(args=["--disable-web-security", "--allow-file-access-from-files"])
    page = b.new_page(viewport={"width": 1920, "height": 1080})
    msgs = []
    page.on("console", lambda m: msgs.append(m.text) if m.type == "error" else None)
    page.on("pageerror", lambda e: msgs.append(str(e)))
    page.goto(URL)
    try:
        page.wait_for_function("typeof renderFrame==='function'", timeout=8000)
    except Exception:
        print("PAGE FAILED TO LOAD. Errors:", *msgs[:10], sep="\n  ")
        raise SystemExit(1)
    return b, page, msgs


def meta(page):
    return page.evaluate("[DUR, typeof FPS==='number'?FPS:30]")


def frame(page, t):
    return base64.b64decode(page.evaluate(JS, t).split(",", 1)[1])


def stills(times, name="sheet", cols=3, tw=640):
    from PIL import Image
    from playwright.sync_api import sync_playwright
    (ROOT / "work").mkdir(exist_ok=True)
    ims = []
    with sync_playwright() as p:
        b, page, msgs = open_page(p)
        if times is None:
            dur, _ = meta(page)
            step = float(name) if name.replace(".", "").isdigit() else 4.0
            times, name, cols, tw = [min(dur - .05, i * step + step / 2) for i in range(int(dur // step) or 1)], "overview", 4, 480
        for t in times:
            ims.append(Image.open(io.BytesIO(frame(page, t))).convert("RGB"))
        b.close()
    for m in msgs[:12]:
        print("PAGE ERROR:", m)
    th = tw * 9 // 16
    rows = (len(ims) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * tw, rows * th), (0, 0, 0))
    for i, im in enumerate(ims):
        sheet.paste(im.resize((tw, th), Image.LANCZOS), ((i % cols) * tw, (i // cols) * th))
    outp = ROOT / "work" / f"{name}.png"
    sheet.save(outp)
    print("wrote", outp, sheet.size, "frames:", len(ims), "(row-major, left to right)")


def chunk(a, b_, fps, crf, out):
    from playwright.sync_api import sync_playwright
    ff = subprocess.Popen(
        ["ffmpeg", "-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", str(fps), "-c:v", "mjpeg", "-i", "-",
         "-c:v", "libx264", "-preset", "slow", "-crf", str(crf), "-pix_fmt", "yuv420p", out], stdin=subprocess.PIPE)
    with sync_playwright() as p:
        br, page, msgs = open_page(p)
        for f in range(a, b_):
            ff.stdin.write(frame(page, f / fps))
        br.close()
    ff.stdin.close(); ff.wait()
    if msgs:
        print("PAGE ERRORS:", msgs[:5])


def full(workers, audio, out, crf):
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b, page, _ = open_page(p); dur, fps = meta(page); b.close()
    n = round(dur * fps)
    tmp = ROOT / "work" / "chunks"; tmp.mkdir(parents=True, exist_ok=True)
    step = (n + workers - 1) // workers
    procs, files = [], []
    for i in range(workers):
        a, b_ = i * step, min(n, (i + 1) * step)
        if a >= b_:
            break
        f = tmp / f"c{i:02d}.mp4"; files.append(f)
        procs.append(subprocess.Popen([sys.executable, str(ROOT / "render.py"), "chunk", str(a), str(b_), str(fps), str(crf), str(f)]))
    if any(pr.wait() for pr in procs):
        raise SystemExit("a render worker failed")
    lst = tmp / "list.txt"
    lst.write_text("".join(f"file '{f.as_posix()}'\n" for f in files))
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", str(lst)]
    apath = ROOT / audio
    if apath.exists():  # pad with silence so a visual tail after the last word keeps its length
        cmd += ["-i", str(apath), "-filter_complex", f"[1:a]apad=whole_dur={dur}[a]", "-map", "0:v", "-map", "[a]", "-c:a", "aac", "-b:a", "192k"]
    else:
        print("no audio file at", apath, "- writing a silent video")
    cmd += ["-c:v", "copy", "-t", str(dur), "-movflags", "+faststart", str(ROOT / out)]
    subprocess.check_call(cmd)
    for f in files + [lst]:
        f.unlink()
    print(f"done {ROOT / out}  ({n} frames, {dur}s @ {fps}fps)")


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "chunk":  # internal
        chunk(int(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5]), sys.argv[6]); sys.exit()
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    s = sub.add_parser("stills"); s.add_argument("times"); s.add_argument("name", nargs="?", default="sheet")
    s = sub.add_parser("sheet"); s.add_argument("every", nargs="?", default="4")
    s = sub.add_parser("full"); s.add_argument("--workers", type=int, default=8); s.add_argument("--audio", default="voiceover.mp3")
    s.add_argument("--out", default="output.mp4"); s.add_argument("--crf", type=int, default=20)
    a = ap.parse_args()
    if a.cmd == "stills":
        stills([float(x) for x in a.times.split(",")], a.name)
    elif a.cmd == "sheet":
        stills(None, a.every)
    else:
        full(a.workers, a.audio, a.out, a.crf)
