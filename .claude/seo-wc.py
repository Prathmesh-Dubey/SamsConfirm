"""Count visible words inside <main> for market pages.
Usage: python .claude/seo-wc.py markets/kuwait/knpc.html [more files...]   (or a directory)
"""
import re, sys, os, glob, html

def words(path):
    s = open(path, encoding='utf-8').read()
    m = re.search(r'<main[\s\S]*?</main>', s)
    s = m.group(0) if m else s
    s = re.sub(r'<(script|style|svg)[\s\S]*?</\1>', ' ', s)
    s = re.sub(r'<[^>]+>', ' ', s)
    return len(html.unescape(s).split())

if __name__ == '__main__':
    files = []
    for a in sys.argv[1:]:
        files += sorted(glob.glob(os.path.join(a, '*.html'))) if os.path.isdir(a) else [a]
    for f in files:
        print(words(f), f.replace(chr(92), '/'))
