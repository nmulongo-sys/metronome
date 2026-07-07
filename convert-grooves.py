#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Passe 3 étape 3 — conversion déterministe des 6 grooves-*.md en table JS.
Suit metronome-passe3-spec.md §5.1 (schéma), §5.2 (correspondance), §5.3 (fiabilité).
X->2 (accent), x->1 (frappe), .->0 (silence). grid.length === count (16 bin / 12 tern).
"""
import re, json, unicodedata, sys, os

ROOT = '/home/user/metronome'

# ---------------------------------------------------------------------------
# §5.2 — TABLE DE CORRESPONDANCE (le « verrou »). Instrument nommé -> (instr, voiceKind).
# Timbres dédiés (étapes 1-2) : djembe, cajon, dunduns, clave, agogo, surdo, recoreco.
# Tout le reste = SUBSTITUTION PAR TESSITURE (arbitrage D) -> sub=True (approximation).
# Clé de routage audio réelle = instr + '.' + voiceKind (doit exister dans playPerc).
# ---------------------------------------------------------------------------
def strip_accents(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn')

# rôle (tessiture) normalisé
ROLES = {'grave':'basse','basse':'basse','medium':'medium','médium':'medium',
         'aigu':'aigu','aigu-grave':'basse','timekeeper':'timekeeper','aigü':'aigu'}

def norm_role(r):
    r = strip_accents(r.strip().lower())
    return ROLES.get(r, {'grave':'basse','medium':'medium','aigu':'aigu'}.get(r,'medium'))

# Chaque règle : (motif sur nom normalisé sans accents, instr, voiceKind, sub)
# évaluées dans l'ordre, première correspondance gagne.
MAP_RULES = [
    # --- brésil / afro : timbres dédiés étape 2 ---
    (r'surdo.*(primeira|1|fundo|segunda|2)|surdo\b', None, None, False),  # traité par fonction (voir map_surdo)
    (r'agogo.*grave|agogo.*(basse|bass)', 'agogo', 'grave', False),
    (r'agogo', 'agogo', 'aigu', False),        # agogô aigu / agogô 1 ligne
    (r'reco.?reco', 'recoreco', 'raclement', False),
    (r'gongue', 'dunduns', 'cloche', True),    # grande cloche -> cloche (substitution)
    # --- djembé (ouest-africain B/T/S) ---
    (r'djembe.*\b(b|basse)\b|djembe b\b', 'djembe', 'basse', False),
    (r'djembe.*\b(t|tone|tonique)\b|djembe t\b', 'djembe', 'tone', False),
    (r'djembe.*\b(s|slap|claque)\b|djembe s\b', 'djembe', 'slap', False),
    # --- dununs ---
    (r'dundun|dununba', 'dunduns', 'dundunba', False),
    (r'sangban', 'dunduns', 'sangban', False),
    (r'kenkeni', 'dunduns', 'kenkeni', False),
    (r'cloche|kenken\b', 'dunduns', 'cloche', False),
    # --- atabaques (mains, tessiture) ---
    (r'rum\b|rumpi|atabaque.*grave', 'djembe', 'basse', True),
    (r'atabaque', 'djembe', 'tone', True),
    # --- alfaia / zabumba (grosses caisses brésiliennes) -> surdo ---
    (r'alfaia.*(marcante|grave)', 'surdo', 'grave', True),
    (r'alfaia', 'surdo', 'marcante', True),
    (r'zabumba.*grave', 'surdo', 'grave', True),
    (r'zabumba', 'djembe', 'tone', True),      # peau aiguë étouffée -> tone médium
    # --- caisses claires / peaux aiguës (snap) ---
    (r'caixa|tarol', 'cajon', 'aigu', True),
    (r'tamborim', 'cajon', 'aigu', True),
    (r'repique|repinique', 'cajon', 'aigu', True),
    # --- métaux / shakers aigus ---
    (r'triangle', 'cajon', 'aigu', True),
    (r'ganza|chocalho|mineiro|caxixi', 'cajon', 'aigu', True),
    (r'agbe|xequere|xekere|shaker|shekere', 'cajon', 'aigu', True),
    # --- batterie (funk/hiphop/rock/reggae) ---
    (r'kick|grosse caisse|bass drum|bombo', 'djembe', 'basse', True),
    (r'snare|caisse claire|rimshot|rim.?tap|rim\b', 'djembe', 'slap', True),
    (r'hi.?hat|charley|charle|ride|cymbal|cymbale|hh\b', 'cajon', 'aigu', True),
    (r'clap|hand.?clap', 'djembe', 'slap', True),
    (r'stomp', 'surdo', 'grave', True),
    (r'cowbell|cloche|bell', 'dunduns', 'cloche', True),
    (r'tom', 'djembe', 'tone', True),
    (r'perc|shaker|tambourine|tambourin', 'cajon', 'aigu', True),
]

def map_surdo(name, role):
    n = strip_accents(name.lower())
    if re.search(r'segunda|\b2\b', n): return ('surdo','marcante',False)
    if re.search(r'primeira|\b1\b|fundo', n): return ('surdo','grave',False)
    if re.search(r'\b3\b|cortador|dobra|virado|dobrado|meio|marcante', n):
        return ('surdo','marcante',False)  # surdo aigu / de coupe
    # défaut surdo par tessiture
    return ('surdo','grave' if role=='basse' else 'marcante', False)

def map_instrument(name, role):
    n = strip_accents(name.lower())
    if re.search(r'surdo', n):
        return map_surdo(name, role)
    for pat, instr, vk, sub in MAP_RULES:
        if pat.startswith('surdo'):
            continue
        if re.search(pat, n):
            if instr is None:
                return map_surdo(name, role)
            return (instr, vk, sub)
    # repli ultime par tessiture pure (arbitrage D)
    fallback = {'basse':('djembe','basse'),'medium':('djembe','tone'),
                'aigu':('cajon','aigu'),'timekeeper':('dunduns','cloche')}
    instr, vk = fallback.get(role, ('djembe','tone'))
    return (instr, vk, True)

# ---------------------------------------------------------------------------
# Utilitaires de parsing
# ---------------------------------------------------------------------------
def slugify(s):
    s = strip_accents(s).lower()
    s = re.sub(r'[^a-z0-9]+', '-', s).strip('-')
    return s or 'x'

def grid_to_steps(g, count):
    g = g.strip()
    steps = [2 if c=='X' else (1 if c=='x' else 0) for c in g]
    if len(steps) < count:            # xote 15->16 : complétée à droite (spec §5.3)
        steps = steps + [0]*(count-len(steps))
    elif len(steps) > count:
        steps = steps[:count]
    return steps

BREAK_KW = re.compile(r'break|virada|virado|chamada|parada|quebra|remate|fill|appel|coupure|resposta|dobrado', re.I)

FAMILY_RELIABILITY = {
    'bresil':'elevee','ouest-africain':'faible','funk':'moyenne',
    'reggae':'moyenne','hiphop':'elevee','rock':'moyenne',
}

# ---------------------------------------------------------------------------
# Parsing d'une ligne de grille (les deux formats)
# ---------------------------------------------------------------------------
RUN_RE = re.compile(r'(?<![Xx.])[Xx.]{8,}(?![Xx.])')

def find_grid(line, count):
    runs = [(m.start(), m.end(), m.group()) for m in RUN_RE.finditer(line)]
    if not runs:
        return None
    # privilégie une longueur == count, sinon la plus proche
    runs.sort(key=lambda r: (abs(len(r[2])-count), -len(r[2])))
    return runs[0]

ROLE_WORDS = re.compile(r'\b(grave|m[ée]dium|aigu-grave|aigu|timekeeper)\b', re.I)

def parse_grid_line(line, count):
    raw = line.rstrip('\n')
    # ignore lignes d'en-tête (1e&a...) et lignes sans grille
    g = find_grid(raw, count)
    if not g:
        return None
    start, end, grid = g
    if len(grid) < 8:
        return None
    # --- FORMAT C : ligne de tableau Markdown (reggae) « | label | tessiture | rôle | `GRID` | » ---
    if raw.lstrip().startswith('|') and raw.count('|') >= 3:
        cells = [c.strip(' `') for c in raw.strip().strip('|').split('|')]
        gcell = next((i for i, c in enumerate(cells) if RUN_RE.search(c)), None)
        if gcell is not None:
            label = cells[0]
            tess = cells[1] if len(cells) > 1 else ''
            desc = cells[2] if len(cells) > 2 else ''
            rw = tess if ROLE_WORDS.search(tess) else raw
            mr = ROLE_WORDS.search(rw)
            role = norm_role(mr.group(1) if mr else 'medium')
            return {'label': re.sub(r'\s+', ' ', label).strip(' -–—:'), 'role': role,
                    'grid': grid_to_steps(grid, count), 'desc': re.sub(r'\s+', ' ', desc).strip(),
                    'uncertain': 'INCERTAIN' in raw,
                    'isBreak': bool(BREAK_KW.search(label) or BREAK_KW.search(desc))}
    left = raw[:start]
    right = raw[end:]
    fmt_a = left.rstrip().endswith(':')
    if fmt_a:
        head = left.rstrip()[:-1].strip()          # "Label (role) — desc"
        mrole = re.search(r'\(([^)]*)\)', head)
        role_txt = mrole.group(1) if mrole else ''
        label = head[:mrole.start()].strip() if mrole else head
        desc = ''
        if '—' in head:
            desc = head.split('—', 1)[1].strip()
        rest_after = role_txt.split('|', 1)[1].strip() if '|' in role_txt else ''
        if rest_after and not desc:
            desc = rest_after
        role_word = role_txt.split('|',1)[0].strip()
    else:
        label = left.strip()
        # right : "grave  | desc  [INCERTAIN]"
        rw = right.strip()
        role_word = ''
        m = ROLE_WORDS.search(rw)
        if m: role_word = m.group(1)
        desc = ''
        if '|' in rw:
            desc = rw.split('|',1)[1]
        desc = re.sub(r'\[[^\]]*\]', '', desc).strip()
    # rôle
    if not ROLE_WORDS.search(role_word or ''):
        m2 = ROLE_WORDS.search(raw)
        role_word = m2.group(1) if m2 else 'medium'
    role = norm_role(role_word)
    label = re.sub(r'\s+', ' ', label).strip(' -–—:')
    uncertain = 'INCERTAIN' in raw
    is_break = bool(BREAK_KW.search(label) or BREAK_KW.search(desc))
    return {'label': label, 'role': role, 'grid': grid_to_steps(grid, count),
            'desc': re.sub(r'\s+',' ',desc).strip(), 'uncertain': uncertain, 'isBreak': is_break}

# ---------------------------------------------------------------------------
# Extraction des blocs et métadonnées d'un groove
# ---------------------------------------------------------------------------
def fenced_blocks(text):
    return re.findall(r'```(.*?)```', text, re.S)

def extract_after(text, *labels):
    """Retourne le paragraphe suivant un des labels (Grille de base / Variations…)."""
    for lab in labels:
        m = re.search(re.escape(lab), text, re.I)
        if m:
            return text[m.end():]
    return ''

def parse_tempo(text):
    tmin = tmax = jam = None
    m = re.search(r'(\d{2,3})\s*[–\-]\s*(\d{2,3})\s*bpm', text, re.I)
    if m: tmin, tmax = int(m.group(1)), int(m.group(2))
    j = re.search(r'jam[^0-9]{0,30}?(\d{2,3})\s*bpm', text, re.I) or re.search(r'jam[^0-9]{0,20}?(\d{2,3})', text, re.I)
    if j: jam = int(j.group(1))
    return {'min': tmin, 'max': tmax, 'jam': jam}

def parse_count(text):
    m = re.search(r'(\d{1,2})\s*pas', text)
    count = int(m.group(1)) if m else 16
    if count not in (12,16): count = 16
    tern = bool(re.search(r'ternaire|12/8|triolet', text, re.I)) or count==12
    return count, ('tern' if tern else 'bin')

def parse_context(text):
    m = re.search(r'(?:^|\n)\s*(?:-\s*Contexte\s*:|\*\*Contexte\.\*\*)\s*(.+)', text)
    if not m: return ''
    seg = m.group(1).strip()
    seg = re.split(r'(?<=[.!?])\s', seg)[0]
    return seg.strip()

def parse_sources(text):
    m = re.search(r'(?:\*\*Sources[^\n:]*[:.]\*\*|Sources[^\n:]*:)\s*(.+)', text)
    if not m: return ''
    s = m.group(1).strip()
    s = re.split(r'(?:\n\n|\bStandardisation\b)', s)[0]
    return re.sub(r'\s+',' ', s).strip()[:400]

DIFF_RE = re.compile(r'(\d+)\s*[.)]\s*\**([^()·;\n*]+?)\**\s*\(([^)]*?(facile|moyen|difficile)[^)]*)\)', re.I)
def parse_enter_order(text):
    seg = extract_after(text, "Ordre d'entrée en jam", "Ordre d’entrée en jam")
    seg = seg[:600]
    out = []
    for m in DIFF_RE.finditer(seg):
        rank = int(m.group(1)); name = m.group(2).strip()
        diff = strip_accents(m.group(4).lower())
        diff = {'facile':'facile','moyen':'moyen','difficile':'difficile'}.get(diff,'')
        out.append((rank, name, diff))
    return out

STOP_TOK = {'de','la','le','du','des','en','et','a','au','aux','1','ligne','perc','sa'}
def _toks(s):
    return {t for t in re.split(r'[^a-z0-9]+', strip_accents(s.lower())) if len(t) > 1 and t not in STOP_TOK}

def attach_enter_order(voices, orders):
    """Associe chaque entrée d'ordre à la voix au meilleur recouvrement de tokens
    distinctifs (évite que « surdo de segunda » se colle au premier surdo venu)."""
    taken = set()
    for rank, name, diff in orders:
        nt = _toks(name)
        best, best_score = None, 0
        for i, v in enumerate(voices):
            if i in taken: continue
            score = len(nt & _toks(v['label']))
            if score > best_score:
                best, best_score, bi = v, score, i
        if best and best_score > 0:
            taken.add(bi)
            best['enterOrder'] = rank
            if diff: best['difficulty'] = diff

# ---------------------------------------------------------------------------
# Driver
# ---------------------------------------------------------------------------
FILES = [
    ('bresil', 'grooves-bresil.md'),
    ('ouest-africain', 'grooves-ouest-africain.md'),
    ('funk', 'grooves-funk.md'),
    ('reggae', 'grooves-reggae.md'),
    ('hiphop', 'grooves-hiphop.md'),
    ('rock', 'grooves-rock.md'),
]
RELIABILITY_LABEL = {'elevee':'élevée','moyenne':'moyenne','faible':'faible'}

def clean_label(lbl):
    lbl = re.sub(r'\s+(pk|cl|pd)$', '', lbl.strip())   # marqueurs peau/cloche ouest-afr.
    lbl = re.sub(r'\s+', ' ', lbl).strip(' -–—:«»`')
    return lbl[:48].strip()

def bound_section(body, starts, stops):
    """Texte après un label 'starts', tronqué avant le premier label 'stops' (et avant ###)."""
    seg = ''
    for lab in starts:
        m = re.search(re.escape(lab), body, re.I)
        if m: seg = body[m.end():]; break
    if not seg: return ''
    cut = len(seg)
    for st in stops + ['\n### ', '\n---']:
        m = re.search(re.escape(st), seg, re.I)
        if m: cut = min(cut, m.start())
    return seg[:cut]

def grid_lines(seg, allow_prose=True):
    """Choisit la source des grilles : bloc(s) ``` si présents, sinon lignes de tableau |,
    sinon (si allow_prose) toutes les lignes. Les variations n'autorisent PAS la prose
    (labels narratifs peu fiables) : structuré seulement (fence + tableau)."""
    fenced = fenced_blocks(seg)
    if fenced:
        out = []
        for b in fenced: out.extend(b.splitlines())
        return out
    tbl = [ln for ln in seg.splitlines() if ln.lstrip().startswith('|')]
    if tbl:
        return tbl
    return seg.splitlines() if allow_prose else []

def build_voice(gid, pl, family_uncertain, used_ids, is_var):
    instr, vk, sub = map_instrument(pl['label'], pl['role'])
    base = gid + '.' + slugify(pl['label'])
    vid = base; k = 2
    while vid in used_ids:
        vid = base + '-' + str(k); k += 1
    used_ids.add(vid)
    v = {'id': vid, 'label': clean_label(pl['label']), 'instr': instr, 'voiceKind': vk,
         'role': pl['role'], 'grid': pl['grid'],
         'uncertain': bool(pl['uncertain'] or family_uncertain)}
    if sub: v['approx'] = True
    if is_var:
        v['isBreak'] = pl['isBreak']
        if pl['desc']: v['note'] = pl['desc']
    else:
        if pl['desc']: v['description'] = pl['desc']
    return v

def parse_groove(section, family):
    head, body = section.split('\n', 1) if '\n' in section else (section, '')
    title = head.strip()
    label = title.split('—')[0].strip()
    origin = title.split('—',1)[1].strip() if '—' in title else ''
    gid = family + '-' + slugify(label)
    count, meter = parse_count(body[:800])
    family_uncertain = (family == 'ouest-africain')
    # blocs — bornage puis stratégie de scan (fence / tableau / prose)
    END_BASE = ["Ordre d'entrée", "Ordre d’entrée", 'Variations', 'Sources', '**Swing']
    mb = re.search('Grille de base', body, re.I)   # si absent (samba) : début du corps
    base_seg = body[mb.end():] if mb else body
    cut = len(base_seg)
    for st in END_BASE + ['\n### ', '\n---']:
        mm = re.search(re.escape(st), base_seg, re.I)
        if mm: cut = min(cut, mm.start())
    base_seg = base_seg[:cut]
    var_seg = bound_section(body, ['Variations'],
                            ['Sources', '**Swing', 'AUTO-CRITIQUE', "Ordre d'entrée"])
    used = set()
    voices = []
    for ln in grid_lines(base_seg, allow_prose=True):
        pl = parse_grid_line(ln, count)
        if pl: voices.append(build_voice(gid, pl, family_uncertain, used, False))
    variations = []
    for ln in grid_lines(var_seg, allow_prose=False):   # structuré seulement
        pl = parse_grid_line(ln, count)
        if pl: variations.append(build_voice(gid, pl, family_uncertain, used, True))
    attach_enter_order(voices, parse_enter_order(body))
    for v in voices:
        v.setdefault('enterOrder', None); v.setdefault('difficulty', '')
    rel = FAMILY_RELIABILITY[family]
    return {
        'id': gid, 'family': family, 'label': label, 'origin': origin,
        'context': parse_context(body), 'count': count, 'family_meter': meter,
        'tempo': parse_tempo(body[:1200]),
        'reliability': RELIABILITY_LABEL[rel],
        'sources': parse_sources(body),
        'voices': voices, 'variations': variations,
    }

def main():
    grooves = []
    report = []
    for family, fn in FILES:
        path = os.path.join(ROOT, fn)
        text = open(path, encoding='utf-8').read()
        # coupe l'entête + auto-critique
        parts = re.split(r'\n###\s+', text)
        secs = parts[1:]
        n_g = 0
        for sec in secs:
            if sec.strip().startswith('AUTO') or sec.strip().startswith('Conventions') or sec.strip().startswith('Avertissement'):
                continue
            g = parse_groove(sec, family)
            if not g['voices'] and not g['variations']:
                continue
            grooves.append(g); n_g += 1
        report.append((family, n_g))
    # ---- contrôles d'intégrité ----
    errors = []; nvoices = 0; nvar = 0; approx = 0; uncertain = 0; breaks = 0
    instr_used = {}
    for g in grooves:
        allv = g['voices'] + g['variations']
        for v in allv:
            if len(v['grid']) != g['count']:
                errors.append(f"{g['id']}/{v['id']}: len {len(v['grid'])} != count {g['count']}")
            key = v['instr']+'.'+v['voiceKind']
            instr_used[key] = instr_used.get(key,0)+1
            if v.get('approx'): approx += 1
            if v.get('uncertain'): uncertain += 1
            if v.get('isBreak'): breaks += 1
        nvoices += len(g['voices']); nvar += len(g['variations'])
    print("=== EXTRACTION ===")
    for fam, n in report: print(f"  {fam:16} {n} grooves")
    print(f"  TOTAL: {len(grooves)} grooves · {nvoices} voix base · {nvar} variations · {nvoices+nvar} grilles")
    print(f"  uncertain={uncertain}  approx(substitution)={approx}  isBreak={breaks}")
    print("=== ROUTAGE (instr.voiceKind utilisés) ===")
    ROUTES = {'djembe.basse','djembe.tone','djembe.slap','cajon.grave','cajon.aigu',
              'dunduns.dundunba','dunduns.sangban','dunduns.kenkeni','dunduns.cloche',
              'agogo.grave','agogo.aigu','surdo.grave','surdo.marcante','recoreco.raclement',
              'clave.grave','clave.aigu'}
    for k in sorted(instr_used):
        flag = '' if k in ROUTES else '  <<< PAS DE ROUTAGE !'
        print(f"  {k:22} {instr_used[k]:3}{flag}")
    print("=== INTÉGRITÉ ===")
    if errors:
        print("  ERREURS DE LONGUEUR:")
        for e in errors: print("   ", e)
    else:
        print("  OK — toutes les grilles ont grid.length === count")
    bad_routes = [k for k in instr_used if k not in ROUTES]
    print("  Routage: " + ("OK — toutes les clés existent dans playPerc" if not bad_routes else f"MANQUANT: {bad_routes}"))
    if '--emit' in sys.argv:
        dump = json.dumps(grooves, ensure_ascii=False, indent=1)
        # grilles sur une seule ligne (tableaux d'entiers purs) — lisibilité + taille
        dump = re.sub(r'\[\s*((?:\d+,?\s*)+)\]',
                      lambda m: '[' + re.sub(r'\s+', '', m.group(1)) + ']', dump)
        js = "  const GROOVES = " + dump + ";\n"
        open('/tmp/claude-0/-home-user-metronome/aa541eaf-e7d8-533d-9906-6056d0745feb/scratchpad/grooves.js','w',encoding='utf-8').write(js)
        print(f"=== ÉMIS: grooves.js ({len(js)} octets) ===")
    return grooves

if __name__ == '__main__':
    main()
