// Views for the roadmap, missables, about and guide-detail panels. All text is our own;
// facts that come from a source are labelled with that source in the guide itself.
const PHASES = [
  { n: 1, title: 'Play the story, Chapters 1–5', ids: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], note: 'Twelve unmissable story trophies. Before you leave Chapter 1, do Lucia’s balcony meditation for Positive Mental Attitude — it may not come back. Keep a manual save at the start of every chapter: there is no mission replay.' },
  { n: 2, title: 'Side stories & strangers', ids: [22, 23, 24, 25, 26, 27, 29], note: 'The five side-story finales (Andy, Kenton, Billy, Randy, Tyrone) plus Bret’s hunt and the 8 stranger strands. Finales stay open after the credits. Andy’s, Billy’s and Tyrone’s strands do not count toward Strangers & Freaks — check its counter after each strand.' },
  { n: 3, title: 'Partner crime & free-roam stunts', ids: [33, 34, 36, 37, 38, 39, 40, 41, 43, 44, 45, 46, 47, 48, 49, 50, 51], note: 'Partner robberies, vaults, the jet and the tank, the cryptic story trophies and the Criminal Profile counter. Bring your partner to the vault jobs: one escape can pop Hot Together and Maximum Withdrawal together.' },
  { n: 4, title: 'Activities & races', ids: [16, 17, 18, 19, 20, 21], note: 'Try every activity once, gold the 42 shooting-range challenges, win the 14 drone races and 20 different races, beat Cal at fishing and finish one arcade game.' },
  { n: 5, title: 'The long grind & 100%', ids: [14, 15, 28, 30, 31, 32, 35, 42, 52, 53, 54, 55], note: 'Stunts to 250 (300 for 100%), 18 meditation spots, card sets, WAiNK locations, 50 challenges, 100 vehicles, all 52 areas, marked bills, spending and the garages. Do these last — most of the counts fill themselves in while you play the earlier phases. The 100% checklist appears under Progress › Stats after the story.' },
];

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

export function renderRoadmap({ trophies, byId, earned, displayName }) {
  const wrap = el('div');
  const h = el('h2', 'serif', 'Roadmap to the platinum');
  const intro = el('p', null, 'Five phases, in the order to play them. The platinum — Vice Got a Price! — pops when the other 54 are done, so the roadmap is the whole list, sequenced. Story first, side stories second, then the free-roam crime, then activities, then the grind that is left.');
  wrap.append(h, intro);
  const plat = byId.get(1);
  const platLine = el('p', 'count-line', `Platinum: ${plat.name} — ${earned.has(1) ? 'earned ✓' : 'earn the other 54 first'}`);
  wrap.append(platLine);
  for (const ph of PHASES) {
    const sec = el('section', 'phase');
    const done = ph.ids.filter((id) => earned.has(id)).length;
    sec.append(el('h2', 'serif', ''));
    sec.querySelector('h2').innerHTML = `<span class="n">Phase ${ph.n}</span> — ${ph.title} <span class="count-line">(${done}/${ph.ids.length} earned)</span>`;
    sec.append(el('p', null, ph.note));
    const ul = el('ul');
    for (const id of ph.ids) {
      const t = byId.get(id);
      const li = el('li', earned.has(id) ? 'earned' : '', `${earned.has(id) ? '✓ ' : ''}${displayName(t)}`);
      li.addEventListener('click', () => { location.hash = `#/guide/${id}`; });
      ul.append(li);
    }
    sec.append(ul);
    wrap.append(sec);
  }
  return wrap;
}

export function renderMissables({ trophies, byId, earned, displayName, displayDesc }) {
  const wrap = el('div');
  const box = el('div', 'warnbox');
  box.append(el('h2', 'serif', 'One trophy is possibly missable'));
  const m = byId.get(28);
  const p = el('p', null, `${m.name} — ${m.description} There is no mission replay, and Lucia’s balcony meditation in Chapter 1 disappears once that chapter ends. Do it in Chapter 1 and keep a Chapter 1 save until the trophy pops. Everything else on the list can be earned after the credits.`);
  box.append(p);
  wrap.append(box);
  const h = el('h2', 'serif', 'Missables, flagged');
  wrap.append(h);
  for (const t of trophies.filter((x) => x.missable)) {
    const sec = el('section', 'phase');
    sec.append(el('h2', 'serif', ''));
    sec.querySelector('h2').textContent = `${earned.has(t.id) ? '✓ ' : '⚠ '}${t.name} — ${t.grade}`;
    sec.append(el('p', null, t.guide));
    const btn = el('button', null, 'Open the full guide');
    btn.addEventListener('click', () => { location.hash = `#/guide/${t.id}`; });
    sec.append(btn);
    wrap.append(sec);
  }
  const watch = el('section', 'note');
  watch.append(el('h2', 'serif', 'At risk, not missable'));
  watch.append(el('p', null, 'Strangers & Freaks: the Chapter 3 Race Against Yago in Yago’s street-racing strand is time-sensitive (hourglass icon). Save first and race it the moment it appears. The five side-story finales (Andy, Kenton, Billy, Randy, Tyrone) stay open after the credits, and the 100% checklist only appears after the story — none of them can be missed, but do not leave the timed race.'));
  wrap.append(watch);
  const safe = el('section', 'note');
  safe.append(el('h2', 'serif', 'Safe after the credits'));
  safe.append(el('p', null, 'All 54 other trophies stay earnable in free roam after the final mission: collectibles, activities, robberies, races and the 100% cleanup. Keep 15 manual save slots in mind — one at the start of each chapter and one untouched save from just before the final mission.'));
  wrap.append(safe);
  return wrap;
}

export function renderAbout({ doc }) {
  const wrap = el('div');
  wrap.append(el('h2', 'serif', 'About this guide'));
  const intro = el('p', null, 'Leonida Legend is an offline trophy guide and tracker for Grand Theft Auto VI on PlayStation 5. It lists the official 55 trophies — 1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden — and gives each one a guide written in our own words, with its sources named beside it. Your progress is saved in your browser only (localStorage); export it to a file to back it up or move it to another machine.');
  wrap.append(intro);
  const src = el('section', 'note');
  src.append(el('h2', 'serif', 'Sources'));
  const ul = document.createElement('ul');
  const items = [
    ['Exophase — official trophy list', doc.sources.exophase, 'Trophy names, descriptions and grades.'],
    ['PSNProfiles — GTA VI trophies', doc.sources.psnprofiles, 'Rarity percentages and progress counters (checked 2026-11-19).'],
    ['OutputLag — GTA 6 trophy list', doc.sources.outputlag, 'How-to detail: gates, missions, counts and the missable warning.'],
  ];
  for (const [label, url, what] of items) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = url; a.textContent = label;
    li.append(a, document.createTextNode(` — ${what}`));
    ul.append(li);
  }
  src.append(ul);
  wrap.append(src);
  const hon = el('section', 'note');
  hon.append(el('h2', 'serif', 'How honest is this guide?'));
  hon.append(el('p', null, 'GTA VI is not out yet, so no guide can claim a method has been played through. Every specific place or step in this guide cites the source that pins it down. Everything else is labelled in the guide itself as our own advice from the official description, not yet checked in the game. No text is copied from another guide, wiki or forum, and no Rockstar logo or official artwork is used anywhere.'));
  wrap.append(hon);
  return wrap;
}

export function renderGuideDetail(id, ctx) {
  const { byId, earned, SOURCE_LABELS, displayName, displayDesc, gradeChip, rarityLine } = ctx;
  const box = el('aside', 'detail');
  const t = id ? byId.get(id) : null;
  if (!t) {
    box.append(el('h2', 'serif', 'Pick a trophy'));
    box.append(el('p', null, 'Select any trophy in the list to read its guide and sources here.'));
    return box;
  }
  box.append(el('h2', 'serif', displayName(t)));
  const off = el('p', 'official', `Official: “${displayDesc(t)}”`);
  box.append(off);
  const meta = el('p', 'meta', '');
  meta.innerHTML = `${gradeChip(t)} ${rarityLine(t)}`;
  box.append(meta);
  const earnedLine = el('p', 'count-line', earned.has(t.id) ? '✓ You have earned this trophy.' : 'Not earned yet — tick it off in the list when it pops.');
  box.append(earnedLine);
  box.append(el('h3', null, 'Sources'));
  const ul = el('ul', 'sources');
  for (const key of t.sources) {
    const [label, url, what] = SOURCE_LABELS[key];
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = url; a.textContent = label;
    li.append(a, document.createTextNode(` — ${what}`));
    ul.append(li);
  }
  box.append(ul);
  box.append(el('h3', null, 'Guide'));
  const g = el('div', 'guide');
  for (const para of t.guide.split(/(?<=[.!?])\s+(?=[A-Z“])/)) {
    if (para.trim()) g.append(el('p', null, para.trim()));
  }
  box.append(g);
  box.append(el('p', 'own', 'Guides are written in our own words. A place or step is given only when a source above pins it down; anything else in the guide is our own advice from the official description, not yet checked in the game.'));
  const prev = byId.get(t.id - 1);
  const next = byId.get(t.id + 1);
  const pager = el('div', 'pager');
  if (prev) {
    const a = document.createElement('a');
    a.href = `#/guide/${prev.id}`; a.textContent = `← ${displayName(prev)}`;
    pager.append(a);
  } else pager.append(el('span'));
  if (next) {
    const a = document.createElement('a');
    a.href = `#/guide/${next.id}`; a.textContent = `${displayName(next)} →`;
    pager.append(a);
  }
  box.append(pager);
  return box;
}
