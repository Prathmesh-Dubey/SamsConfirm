# Brief: expand thin market sub-pages (SAMS EX-04Z1 static site)

Project: `S:\Projects\parth-mob` — static HTML rebuild of sams-mobile.com. The product is the **SAMS EX-04Z1**, an intrinsically safe Android smartphone for Zone 1 / Zone 21 hazardous areas, **pre-launch (Q4 2026)**.

## Your job
For ONE country (given in your prompt) rewrite/expand every sub-page in `markets/<country>/*.html` whose main-content word count is **under 900** to **about 900–1,200 words of real, page-specific text**. Pages already ≥ 900 words: leave alone. Measure with:

    python .claude/seo-wc.py markets/<country>/

(counts visible words inside `<main>`). Aim for 950–1,150. Do not pad; every paragraph must say something particular to that company/sector/site.

## Why
Google flags short pages that share one template as near-duplicates and never indexes them. Each page must therefore carry content that **only fits that company, site or sector**.

## What each expanded page must contain
1. The named real sites / plants / facilities / terminals / fields (by name) and the hazardous-area types found there (gas groups, dust, Zone 1 / 2 / 21 / 22 situations, sour gas, hydrogen, solvent, grain/sugar/coal/mineral dust, etc., whichever is true for that operator/sector).
2. How work is organised there: turnaround/shutdown patterns, contractor presence, shift and round patterns, remote or offshore logistics — what that means for a handset.
3. What that operator's/sector's contractor or vendor registration / approval / site-access process asks of equipment suppliers — **only if you can verify it**. If you cannot verify specifics, describe generically ("ask the operator's procurement and HSE teams for…") rather than inventing a programme name.
4. 2–4 FAQs specific to that page (not copied from the country page or other sub-pages), as `<details class="s2-pg-qa">` blocks in the existing format.
5. The keyword phrase "explosion proof mobile phone" (and the country name) in the first paragraph and in at least one H2; natural, not stuffed. Other useful phrases: Zone 1 mobile phone, intrinsically safe phone, ATEX/IECEx phone — but see claims rules.

## Facts policy (important — wrong facts about a company's own sites get noticed by its HSE/procurement staff)
- Use the existing country page (`markets/<country>.html`) and the existing sub-page text as your starting facts; they were written earlier. Keep what is correct; deepen it.
- For anything beyond that, verify with WebSearch / WebFetch (company sites, annual reports, regulators, reputable trade press). Prefer official sources. Aim for 3–6 lookups per page, not dozens.
- Never invent: plant capacities, headcounts, dates, project names, regulation numbers, registration-portal names, person names, quotations. If unsure, leave it out or phrase generally.
- Ownership/merger/rename claims: only if confirmed by an official source; otherwise omit.
- Do not mention competitors' products.

## Claims policy
- The EX-04Z1 is **pre-launch**. **No certificate has been issued.** IECEx, ATEX, NEC 500 (and any local scheme) are *in progress*. Use wording like "designed for", "being certified to", "certification in progress", "ahead of the Q4 2026 launch". Never "certified", "approved", "compliant" as an accomplished fact.
- Never claim SAMS has customers, distributors, pilots, orders or relationships with the operator you write about. The page may say what the operator's teams *would ask for* and what the device is *designed for*.
- Device facts you may use (and only these): IP68, 4,000 mAh battery, 50 MP camera, Android 16, Android Enterprise, Qualcomm Snapdragon, 4-constellation GNSS, Arabic/English where already stated on the country page, managed from existing MDM consoles, Zone 1 / Zone 21 design target. Check the country page for any further device claims already made. Do not invent specs.

## Voice
British English, plain, specific, engineer-to-engineer. No marketing fluff, no exclamation marks, no emoji, **no decorative icons** (the site owner dislikes them; keep existing icon markup only where the template already has it).

## Markup rules
- Edit only `markets/<country>/*.html` for your country. Touch nothing else (no CSS, no other country, no country page, no head).
- **Do not edit `<head>`** (title, description, canonical, robots, JSON-LD are managed by a script that I re-run afterwards). Do not add `<script>`.
- Keep the page shell exactly: nav, hero (H1 text may stay; you may refine the hero lede paragraph), breadcrumb, the bottom "Kuwait"-style country strip section, partner/CTA section, footer. Add/expand only the content sections between hero and the bottom strip.
- Reuse existing section classes exactly as in the model page **`markets/kuwait/ahmadi.html`** (1,379 words — read it first and copy its markup patterns): `s2-pg-sec` / `s2-pg-sec--ice` alternate; `s2-pg-head` + `s2-pg-head__lede`; two-column `s2-pg-dlcols` with `s2-pg-dl` (`<dt>`/`<dd>`); `s2-pg-fits` / `s2-pg-fit` cards; `s2-pg-cases` / `s2-pg-case`; FAQ block `s2-pg-split` with `details.s2-pg-qa`. Keep `data-reveal` attributes as in the model. Alternate section background classes so white and light-blue alternate.
- Valid, balanced HTML. Escape `&` as `&amp;`. Keep the file's existing line endings.
- Internal links: only to files that exist; use correct relative paths (sub-pages are two levels deep: `../../contact.html`, `../kuwait.html` style).
- A sub-page about a *sector* (e.g. oil-gas, mining) should name the real operators and sites in that sector in that country, and link to sibling company pages that exist in the same folder (descriptive link text, e.g. "explosion proof phone for KNPC").
- Each page in the same country must be distinct from its siblings: no copied paragraphs. Do not reuse text from other countries' pages.

## Finish
1. Run `python .claude/seo-wc.py markets/<country>/` and make sure every page you were responsible for is 900–1,250 words.
2. Check tags balance (count `<div`/`</div>`, `<section`/`</section>`, `<details`/`</details>` in each file).
3. Do NOT run git commands, do NOT run other scripts, do NOT touch other files.
4. Report back in under 200 words: pages changed with before→after word counts; any fact you could not verify and left generic; any claim on the existing pages that looks wrong and should be reviewed by SAMS.

## Additions after the Kuwait pilot
- **Ownership / merger / rename / closure claims** (e.g. "X merged into Y", "plant closed in 2018"): state them only if an official source (company, regulator, exchange filing) confirms them. If only press reports exist, either leave the claim out or attribute it ("press reports say…") and list it in your final report under "claims to confirm". Never put an unconfirmed ownership change in the hero paragraph or a heading.
- Be efficient: at most ~4 web lookups per page; do not re-read the same files repeatedly. Write each page in one pass, then count and fix.
- If an existing statement on the site turns out to be factually wrong (e.g. wrong gas group, closed plant), correct it on the pages you own and list it in your report; do not edit pages you don't own.
