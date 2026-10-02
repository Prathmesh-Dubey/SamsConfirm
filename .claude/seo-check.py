import re, glob, json, os, html
os.chdir(r'S:\Projects\parth-mob')
bad = 0; n = 0; titles = []; descs = []; noalt = 0; faqmis = 0
for p in glob.glob('markets/**/*.html', recursive=True):
    s = open(p, encoding='utf-8').read(); n += 1
    m = re.search(r'<script type="application/ld\+json">(.*?)</script>', s, re.S)
    j = json.loads(m.group(1).replace('<\\/', '</'))
    assert s.count('<meta name="robots"') == 1 and s.count('rel="canonical"') == 1, p
    titles.append(re.search(r'<title>(.*?)</title>', s).group(1))
    d = html.unescape(re.search(r'name="description" content="(.*?)"', s).group(1)); descs.append(d)
    if re.search(r'<img[^>]*alt=""[^>]*phone-front', s) or re.search(r'<img[^>]*cretLogos[^>]*alt=""', s): noalt += 1
    g = j['@graph']
    nq = len(re.findall(r'<details class="s2-pg-qa"', s))
    fq = [x for x in g if x['@type'] == 'FAQPage']
    if nq and (not fq or len(fq[0]['mainEntity']) != nq): faqmis += 1; print('FAQ mismatch', p, nq)
print(n, 'pages | unique titles', len(set(titles)), '| unique descs', len(set(descs)), '| img alt missing', noalt, '| faq mismatches', faqmis)
print('titles >70:', sum(len(html.unescape(t)) > 70 for t in titles), ' descs >160:', sum(len(d) > 160 for d in descs), ' descs <70:', sum(len(d) < 70 for d in descs))
