#!/usr/bin/env python3
"""Screenshots of the sketches, shown in place of each [!sketch] callout until it is clicked (_includes/callouts.html).

Finds every [!sketch] callout in the posts, pages and drafts, opens the sketch at the size it is embedded at in
headless Chrome, and saves the picture next to it: folder/index.html -> folder/poster.jpg, x.html -> x.poster.jpg.
The sketch's own controls are hidden (sketch-ui.js, with ?poster in the URL); the page shows them below the poster.

    python3 _tools/make-posters.py              # all sketches
    python3 _tools/make-posters.py --missing    # only the ones without a poster
    python3 _tools/make-posters.py hexagonal    # only sketches whose path contains "hexagonal"

Rerun after changing a sketch. Needs Google Chrome (and macOS's sips, to make the JPEGs).
"""
import argparse, glob, os, re, shutil, socket, subprocess, sys, tempfile, time, urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
WIDTH, SQUARE = 800, 500          # px: a sketch across the column; a square one
WAIT_MS = 8000                    # how long a sketch gets to draw itself
CALLOUT = re.compile(r'^\s*>\s*\[!sketch(?:\|([^\]]*))?\][+-]?[ \t]*(.+?)\s*$', re.M)


def callouts():
    """{sketch file: (width, height)} for every [!sketch] callout, the first size seen for each sketch."""
    found = {}
    files = glob.glob(os.path.join(ROOT, '**', '*.md'), recursive=True)
    for f in files:
        if '/_site/' in f or '/node_modules/' in f:
            continue
        for meta, path in CALLOUT.findall(open(f, encoding='utf-8').read()):
            path = path.strip('/')
            src = 'sketch/' + path + ('' if re.search(r'\.html?$', path, re.I) else '/index.html')
            if re.search(r'\bsquare\b', meta or '', re.I):
                size = (SQUARE, SQUARE)
            else:
                h = re.match(r'\s*(\d+)', meta or '')
                size = (WIDTH, int(h.group(1)) if h else 400)
            found.setdefault(src, size)
    return found


def poster_of(src):
    return re.sub(r'index\.html?$', 'poster.jpg', src) if re.search(r'/index\.html?$', src) else re.sub(r'\.html?$', '.poster.jpg', src)


def free_port():
    with socket.socket() as s:
        s.bind(('127.0.0.1', 0))
        return s.getsockname()[1]


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('match', nargs='?', default='', help='only sketches whose path contains this')
    ap.add_argument('--missing', action='store_true', help='only sketches without a poster')
    args = ap.parse_args()
    if not os.path.exists(CHROME):
        sys.exit('Google Chrome not found at ' + CHROME)

    todo = {src: size for src, size in sorted(callouts().items())
            if args.match in src and not (args.missing and os.path.exists(os.path.join(ROOT, poster_of(src))))}
    if not todo:
        print('nothing to do')
        return

    port = free_port()
    server = subprocess.Popen([sys.executable, '-m', 'http.server', str(port), '--bind', '127.0.0.1'],
                              cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    tmp = tempfile.mkdtemp()
    try:
        time.sleep(0.5)
        for src, (w, h) in todo.items():
            if not os.path.exists(os.path.join(ROOT, src)):
                print(f'  missing  {src}')
                continue
            url = f'http://127.0.0.1:{port}/' + urllib.parse.quote(src) + '?poster'
            png = os.path.join(tmp, 'shot.png')
            subprocess.run([CHROME, '--headless=new', '--hide-scrollbars', '--mute-audio', '--no-first-run',
                            '--use-angle=swiftshader', '--enable-unsafe-swiftshader',   # WebGL without a GPU
                            f'--window-size={w},{h}', f'--virtual-time-budget={WAIT_MS}', f'--user-data-dir={tmp}/profile',
                            f'--screenshot={png}', url], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=120)
            if not os.path.exists(png):
                print(f'  FAILED   {src}')
                continue
            out = os.path.join(ROOT, poster_of(src))
            subprocess.run(['sips', '-s', 'format', 'jpeg', '-s', 'formatOptions', '82', png, '--out', out],
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
            os.remove(png)
            print(f'  {w}x{h}  {poster_of(src)}  ({os.path.getsize(out) // 1024} KB)')
    finally:
        server.terminate()
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == '__main__':
    main()
