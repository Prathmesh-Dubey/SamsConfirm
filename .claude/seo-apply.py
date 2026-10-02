import re, glob, html, json, os, sys
os.chdir(r'S:\Projects\parth-mob')
DRY = '--dry' in sys.argv
LIVE = 'https://sams-mobile.com'
BRAND = ' | SAMS Mobile'
SHORT = {'united-arab-emirates': 'UAE', 'united-kingdom': 'UK', 'united-states': 'USA'}

# country slug -> display name (from markets.html tiles)
mk = open('markets.html', encoding='utf-8').read()
NAMES = {m.group(1): html.unescape(m.group(2)) for m in re.finditer(
    r'<a class="s2-mk-tile" href="markets/([a-z-]+)\.html">.*?s2-mk-tile__name">(.*?)</span>', mk, re.S)}

KUWAIT_TITLES = {
    'knpc': 'Explosion Proof Mobile Phone for KNPC Refineries, Kuwait',
    'kipic': 'Explosion Proof Phone for KIPIC Al-Zour Refinery & LNG',
    'kuwait-oil-company': 'Explosion Proof Mobile Phone for Kuwait Oil Company (KOC)',
    'pic-kuwait': 'Zone 1 Explosion Proof Phone for PIC Shuaiba, Kuwait',
    'oil-gas': 'Explosion Proof Mobile Phone for Kuwait Oil & Gas',
    'refining': 'Zone 1 Mobile Phone for Kuwait Refineries',
    'petrochemical-utilities': 'Explosion Proof Phone for Kuwait Petrochemical & Utility Plants',
}

def esc(t): return html.escape(t, quote=False)
def jesc(o): return json.dumps(o, ensure_ascii=False).replace('</', '<\\/')
def strip(t): return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', t))).strip()

def first_sentence(t):
    t = t.rstrip('…').strip()
    m = re.match(r'(.+?[.!?])(\s|$)', t)
    return m.group(1) if m else t

def trim(t, n):
    if len(t) <= n: return t
    cut = t[:n - 1]
    k = cut.rfind(' ')
    return cut[:k].rstrip(' ,;:') + '…'

def sub_title(name, country, short):
    n = name
    nm = n.replace(' — ' + country, '').replace(' - ' + country, '')
    use_c = country.lower() not in nm.lower()
    for stem in ('Explosion Proof Mobile Phone for ', 'Explosion Proof Phone for ', 'Zone 1 Phone for '):
        t = stem + nm + (', ' + short if use_c else '')
        if len(t + BRAND) <= 68: return t + BRAND
    return t if len(t) <= 72 else t.replace('Zone 1 Phone for ', 'Zone 1 Phone: ')

def process(p):
    p = p.replace(chr(92), '/')
    s = open(p, encoding='utf-8', newline='').read()
    o = s
    parts = p[:-5].split('/')          # markets/kuwait or markets/kuwait/knpc
    top = len(parts) == 2
    cslug = parts[1]; sslug = None if top else parts[2]
    country = NAMES[cslug]; short = SHORT.get(cslug, country)

    # ---- title / description -------------------------------------------------
    tm = re.search(r'<title>(.*?)</title>', s)
    cur_title = html.unescape(tm.group(1))
    dm = re.search(r'<meta name="description" content="(.*?)">', s)
    cur_desc = html.unescape(dm.group(1))
    if top:
        t = 'Explosion Proof Mobile Phone ' + short + ' | Zone 1 & 21' + BRAND
        if len(t) > 66: t = 'Explosion Proof Phone ' + short + ' | Zone 1 & 21' + BRAND
        new_title = t
        new_desc = cur_desc
        if len(new_desc) > 160: new_desc = trim(new_desc, 158)
    else:
        bare = cur_title.endswith(BRAND) and not re.match(r'(Explosion|ATEX|Zone|Flameproof|Ex )', cur_title)
        if bare:
            name = cur_title[:-len(BRAND)]
            if cslug == 'kuwait' and sslug in KUWAIT_TITLES:
                new_title = KUWAIT_TITLES[sslug] + BRAND
            else:
                new_title = sub_title(name, country, short)
        else:
            new_title = cur_title
        new_desc = cur_desc
        if new_desc.endswith('…') or len(new_desc) > 160 or 'Zone 1 and 21.' in new_desc:
            hp = re.search(r'<h1[^>]*>.*?</h1>\s*<p[^>]*>(.*?)</p>', s, re.S)
            s1 = first_sentence(strip(hp.group(1))) if hp else first_sentence(new_desc)
            has_kw = 'explosion proof' in s1.lower()
            tails = ((' Designed for Zone 1 and 21. Launching Q4 2026.', ' Designed for Zone 1 and 21.') if has_kw else
                     (' Explosion proof mobile phone, Zone 1 and 21. Launching Q4 2026.',))
            for tail in tails + (' Explosion proof mobile phone, Zone 1 and 21. Launching Q4 2026.',
                         ' Explosion proof phone, Zone 1 and 21. Launching Q4 2026.',
                         ' Explosion proof phone, Zone 1 and 21.'):
                if len(s1 + tail) <= 158: break
            if len(s1 + tail) > 158:
                tail = ''
                if len(s1) > 158: s1 = trim(s1, 158)
            new_desc = (s1 + tail).strip()
    s = s.replace(tm.group(0), '<title>' + esc(new_title) + '</title>', 1)
    s = s.replace(dm.group(0), '<meta name="description" content="' + html.escape(new_desc, quote=True) + '">', 1)

    # ---- head block: noindex, canonical, JSON-LD --------------------------------
    s = re.sub(r'<!-- staging-noindex -->.*?<!-- /staging-noindex -->\s*', '', s, flags=re.S)
    s = re.sub(r'<!-- seo:start -->.*?<!-- seo:end -->\s*', '', s, flags=re.S)
    url = LIVE + '/' + '/'.join(parts) + '/'
    crumbs = [('Home', LIVE + '/'), ('Markets', LIVE + '/markets/'), (country, LIVE + '/markets/' + cslug + '/')]
    if not top:
        h1 = strip(re.search(r'<h1[^>]*>(.*?)</h1>', s, re.S).group(1))
        label = re.sub(re.escape(BRAND) + '$', '', new_title)
        label = re.sub(r'^(Explosion Proof (Mobile )?Phone for |Zone 1 (Explosion Proof )?(Mobile )?Phone for )', '', label)
        label = re.sub(r',\s*' + re.escape(short) + '$', '', label)
        crumbs.append((label, url))
    graph = [{'@type': 'BreadcrumbList', 'itemListElement': [
        {'@type': 'ListItem', 'position': i + 1, 'name': n, 'item': u} for i, (n, u) in enumerate(crumbs)]}]
    if top:
        graph.append({'@type': 'Product', 'name': 'SAMS EX-04Z1', 'brand': {'@type': 'Brand', 'name': 'SAMS Mobile'},
                      'category': 'Explosion proof mobile phone',
                      'description': 'Zone 1 / Zone 21 explosion proof Android smartphone for hazardous areas.',
                      'image': LIVE + '/img/phone-front.webp'})
    qas = re.findall(r'<details class="s2-pg-qa"[^>]*>\s*<summary>(.*?)</summary>\s*<div class="s2-pg-qa__a">(.*?)</div>\s*</details>', s, re.S)
    if qas:
        graph.append({'@type': 'FAQPage', 'mainEntity': [
            {'@type': 'Question', 'name': strip(q), 'acceptedAnswer': {'@type': 'Answer', 'text': strip(a)}} for q, a in qas]})
    block = ('<!-- staging-noindex --><meta name="robots" content="noindex, nofollow"><!-- /staging-noindex -->\n'
             '<!-- seo:start -->\n<link rel="canonical" href="' + url + '">\n'
             '<script type="application/ld+json">' + jesc({'@context': 'https://schema.org', '@graph': graph}) + '</script>\n<!-- seo:end -->\n')
    s = s.replace('</head>', block + '</head>', 1)

    # ---- alt text ------------------------------------------------------------------
    ALT = {'img/phone-front.webp': 'SAMS EX-04Z1 explosion proof mobile phone, front view',
           'img/cretLogos/iecex.png': 'IECEx certification scheme logo',
           'img/cretLogos/atex.png': 'ATEX certification scheme logo',
           'img/cretLogos/nec-500.png': 'NEC 500 certification scheme logo',
           'img/cretLogos/peso.png': 'PESO approval logo',
           'img/cretLogos/android-enterprise.png': 'Android Enterprise logo',
           'img/cretLogos/qualcomm-snapdragon.png': 'Qualcomm Snapdragon logo'}
    def alt(m):
        t = m.group(0)
        src = re.sub(r'^(\.\./)+', '', re.search(r'src="([^"]+)"', t).group(1))
        if 'alt=""' in t and src in ALT: return t.replace('alt=""', 'alt="' + ALT[src] + '"')
        return t
    s = re.sub(r'<img\b[^>]*>', alt, s)

    # ---- sub-page H1 keyword --------------------------------------------------------
    if not top:
        m = re.search(r'(<h1[^>]*>)(.*?)(</h1>)', s, re.S)
        if not re.search(r'explosion|zone|atex|flameproof|ex phone|iecex', strip(m.group(2)), re.I):
            s = s.replace(m.group(0), m.group(1) + 'Explosion proof mobile phone for ' + m.group(2) + m.group(3), 1)

    # ---- lead-ins (country pages) ----------------------------------------------------
    if top:
        s = re.sub(r'[ \t]*<p class="s2-pg-head__lede" data-seo>.*?</p>\n?', '', s)   # idempotency
        s = re.sub(r'\n[ \t]*<p data-seo>.*?</p>', '', s)
        def lead(txt): return '          <p class="s2-pg-head__lede" data-seo>' + txt + '</p>\n'
        def join(a):
            a = list(a)
            return a[0] if len(a) == 1 else ', '.join(a[:-1]) + ' and ' + a[-1]

        # 1. operators and sites
        m = re.search(r'(<div class="s2-pg-dlcols">)(.*?)(</section>)', s, re.S)
        if m:
            cols = re.findall(r'<dl class="s2-pg-dl">(.*?)</dl>', m.group(2), re.S)
            if len(cols) >= 2:
                ops = [strip(x) for x in re.findall(r'<dt>(.*?)</dt>', cols[0])][:3]
                sites = [strip(x) for x in re.findall(r'<dt>(.*?)</dt>', cols[1])][:3]
                if ops and sites:
                    txt = ('Operators and contractors such as ' + join(ops) + ' need an explosion proof mobile phone they can carry into '
                           'classified areas at ' + join(sites) + '. The EX-04Z1 is designed for Zone 1 and Zone 21 duty there.')
                    s = re.sub(r'(\s*</div>\s*)(<div class="s2-pg-dlcols">)', lambda mm: '\n' + lead(esc(txt)).rstrip('\n') + mm.group(1) + mm.group(2), s, count=1)

        # 2. built-for conditions
        m = re.search(r'<div class="s2-pg-fits">(.*?)</section>', s, re.S)
        if m:
            hs = [strip(x) for x in re.findall(r'<h3>(.*?)</h3>', m.group(1))]
            if hs:
                txt = ('For evaluators in ' + country + ', the EX-04Z1 explosion proof mobile phone is designed around these points: '
                       + '; '.join(hs) + '.')
                s = re.sub(r'(<div class="s2-pg-device__text">.*?</p>)', lambda mm: mm.group(1) + '\n              <p data-seo>' + esc(txt) + '</p>', s, count=1, flags=re.S)

        # 3. where it goes to work
        m = re.search(r'<div class="s2-pg-cases">(.*?)</section>', s, re.S)
        if m:
            hs = [strip(x) for x in re.findall(r'<h3>(.*?)</h3>', m.group(1))]
            if hs:
                txt = ('Typical Zone 1 and Zone 21 duty for the EX-04Z1 explosion proof mobile phone in ' + country + ' includes: '
                       + '; '.join(hs) + '.')
                s = re.sub(r'(\s*</div>\s*)(<div class="s2-pg-cases">)', lambda mm: '\n' + lead(esc(txt)).rstrip('\n') + mm.group(1) + mm.group(2), s, count=1)

        # 4. descriptive links to sub-pages (industries / sites grids)
        def grid(mm):
            tiles = re.findall(r'<a class="s2-pg-market s2-pg-market--link" href="([^"]+)">.*?s2-pg-market__name">(.*?)</span>', mm.group(3), re.S)
            if not tiles: return mm.group(0)
            links = ['<a href="' + h + '">explosion proof phone for ' + n + '</a>' for h, n in tiles]
            txt = 'Go deeper with the EX-04Z1: ' + '; '.join(links) + '.'
            return '\n' + lead(txt).rstrip('\n') + mm.group(1) + mm.group(2) + mm.group(3)
        s = re.sub(r'(\s*</div>\s*)(<div class="s2-pg-markets" data-reveal>)(.*?</div>)', grid, s, flags=re.S)

    if s != o and not DRY:
        open(p, 'w', encoding='utf-8', newline='').write(s)
    return p, new_title, new_desc, s != o

if __name__ == '__main__':
    files = sorted(glob.glob('markets/**/*.html', recursive=True))
    only = [a for a in sys.argv[1:] if not a.startswith('--')]
    if only: files = [f for f in files if any(o in f.replace(chr(92), '/') for o in only)]
    longt = 0
    for f in files:
        p, t, d, ch = process(f)
        if len(t) > 70: longt += 1
        if only: print(p, '\n  ', t, len(t), '\n  ', d, len(d))
    print(len(files), 'pages; titles >70:', longt, '(dry)' if DRY else '')
