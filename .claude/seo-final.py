import re, glob, os, subprocess, sys, html
os.chdir(r'S:\Projects\parth-mob')
sys.argv = ['x']
import importlib.util
sp = importlib.util.spec_from_file_location('seo', '.claude/seo-apply.py'); seo = importlib.util.module_from_spec(sp); sp.loader.exec_module(seo)

def head_title(path):
    try:
        out = subprocess.run(['git', 'show', 'HEAD:' + path], capture_output=True, check=True).stdout.decode('utf-8', 'replace')
        return html.unescape(re.search(r'<title>(.*?)</title>', out).group(1))
    except Exception:
        return ''

# force description regeneration from the (new) hero lede for sub-pages that had bare titles originally
n = 0
for f in sorted(glob.glob('markets/*/*.html')):
    f = f.replace(chr(92), '/')
    t = head_title(f)
    if t.endswith(' | SAMS Mobile') and not re.match(r'(Explosion|ATEX|Zone|Flameproof|Ex )', t):
        s = open(f, encoding='utf-8', newline='').read()
        # mark description so seo.process regenerates it
        s2 = re.sub(r'(<meta name="description" content=")(.*?)(">)', lambda m: m.group(1) + 'Zone 1 and 21.' + m.group(3), s, count=1)
        if s2 != s: open(f, 'w', encoding='utf-8', newline='').write(s2); n += 1
print('forced description regen on', n)
for f in sorted(glob.glob('markets/**/*.html', recursive=True)):
    seo.process(f)
print('seo applied')
