// Leonida Legend views: the checklist rows, the guide detail pane, the
// platinum roadmap and the missables page. All rendering is plain DOM code;
// nothing here fetches anything over the network.
import { isSpoilerMasked, maskedDescription, maskedName, trophyKinds } from './filters.js';

export const ROADMAP_STAGES = [
  {
    stage: 1,
    title: 'Stage 1 — Play the story',
    text: 'Chapters 1 to 4, the named story missions and the final mission. Do the missable missions on your first run — they are the only trophies that can pass you by.',
  },
  {
    stage: 2,
    title: 'Stage 2 — Partners & strangers',
    text: 'Finish the five character mission strands (Andy, Kenton, Billy, Randy, Tyrone), the 8 stranger strands, and the partner trophies that need your partner beside you.',
  },
  {
    stage: 3,
    title: 'Stage 3 — Activities & challenges',
    text: 'The long grind: 250 stunts, 42 gold Shooting Range challenges, 20 races, 14 drone-race locations, 50 challenges, fishing, arcade, bowling, meditation and hunting.',
  },
  {
    stage: 4,
    title: 'Stage 4 — Collectibles & Leonida',
    text: '3 card sets, WAiNK at 100 locations, 100 vehicles discovered, all 52 areas explored, 8 garages, 10 Scooter Bros registrations, and the money trophies.',
  },
  {
    stage: 5,
    title: 'Stage 5 — Cleanup & platinum',
    text: 'Sweep up the stragglers, push the 500-choice count, reach 100% completion for the second gold, and the platinum is yours.',
  },
];

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function gradeWord(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

function kindLabel(kind) {
  if (kind === 'story') return 'Story';
  if (kind === 'missable') return 'Missable';
  if (kind === 'collectibles') return 'Collectibles';
  if (kind === 'activities') return 'Activities';
  return 'Completion';
}

export function renderProgress(trophies, state, nodes) {
  const earned = new Set(state.earned);
  const total = trophies.length;
  nodes.bigCount.innerHTML = '';
  nodes.bigCount.append(`${earned.size} `, el('small', null, `of ${total} earned`));
  nodes.meter.style.width = `${Math.round((earned.size / total) * 100)}%`;
  const grades = ['platinum', 'gold', 'silver', 'bronze'];
  nodes.gradeChips.replaceChildren();
  for (const grade of grades) {
    const inGrade = trophies.filter((t) => t.grade === grade);
    const got = inGrade.filter((t) => earned.has(t.id)).length;
    const chip = el('span', 'chip');
    chip.append(el('b', null, `${got}/${inGrade.length} `), document.createTextNode(gradeWord(grade)));
    nodes.gradeChips.append(chip);
  }
  nodes.missableChip.textContent = `${trophies.filter((t) => t.missable && earned.has(t.id)).length}/${trophies.filter((t) => t.missable).length} missable`;
}

export function trophyRow(trophy, state, filters, callbacks) {
  const earnedSet = new Set(state.earned);
  const earned = earnedSet.has(trophy.id);
  const masked = isSpoilerMasked(trophy, filters, earnedSet);
  const row = el('button', `trophy${earned ? ' earned' : ''}`);
  row.type = 'button';
  row.setAttribute('aria-pressed', earned ? 'true' : 'false');

  const tick = document.createElement('input');
  tick.type = 'checkbox';
  tick.className = 'tick';
  tick.checked = earned;
  tick.setAttribute('aria-label', `Mark ${masked ? maskedName(trophy) : trophy.name} as earned`);
  tick.addEventListener('click', (event) => event.stopPropagation());
  tick.addEventListener('change', () => callbacks.onToggleEarned(trophy.id));
  row.append(tick);

  const medal = el('span', `medal ${trophy.grade}`, trophy.grade === 'platinum' ? 'P' : trophy.grade.charAt(0).toUpperCase());
  medal.setAttribute('aria-hidden', 'true');
  row.append(medal);

  const body = el('div');
  body.append(el('h3', null, masked ? maskedName(trophy) : trophy.name));
  body.append(el('p', null, masked ? maskedDescription() : trophy.description));
  const meta = el('div', 'meta');
  for (const kind of trophyKinds(trophy)) meta.append(el('span', `tag kind-${kind}`, kindLabel(kind)));
  if (trophy.missable) meta.append(el('span', 'tag missable', 'MISSABLE'));
  if (trophy.hidden) meta.append(el('span', 'tag', 'Hidden on PSN'));
  if (trophy.target) meta.append(el('span', 'tag', `Target: ${trophy.target.toLocaleString()} ${trophy.target_label}`));
  body.append(meta);
  row.append(body);

  row.append(el('span', 'grade-word', gradeWord(trophy.grade)));
  row.addEventListener('click', () => callbacks.onSelectTrophy(trophy.id));
  return row;
}

export function renderChecklist(container, trophies, state, filters, callbacks) {
  const earnedSet = new Set(state.earned);
  const shown = trophies.filter((t) => {
    if (filters.kind !== 'all' && !trophyKinds(t).includes(filters.kind)) return false;
    if (filters.grade !== 'all' && t.grade !== filters.grade) return false;
    if (filters.status === 'earned' && !earnedSet.has(t.id)) return false;
    if (filters.status === 'remaining' && earnedSet.has(t.id)) return false;
    if (filters.query) {
      const hay = `${t.name} ${t.description} ${t.guide}`.toLowerCase();
      if (!hay.includes(filters.query.toLowerCase())) return false;
    }
    return true;
  });
  container.replaceChildren();
  if (!shown.length) {
    container.append(el('p', 'empty', 'No trophies match these filters. Clear the search or widen the filters.'));
    return shown.length;
  }
  const list = el('ul', 'trophy-list');
  for (const trophy of shown) {
    const item = el('li');
    item.append(trophyRow(trophy, state, filters, callbacks));
    list.append(item);
  }
  container.append(list);
  return shown.length;
}

export function renderDetail(container, trophy, state, filters, callbacks) {
  container.replaceChildren();
  if (!trophy) {
    container.append(el('p', 'placeholder', 'Pick a trophy from the checklist to read its guide, sources and missable warning here.'));
    return;
  }
  const earnedSet = new Set(state.earned);
  const earned = earnedSet.has(trophy.id);
  const masked = isSpoilerMasked(trophy, filters, earnedSet);

  const medal = el('span', `medal ${trophy.grade}`, trophy.grade === 'platinum' ? 'P' : trophy.grade.charAt(0).toUpperCase());
  container.append(medal);
  container.append(el('h2', null, masked ? maskedName(trophy) : trophy.name));
  container.append(el('p', 'desc', masked ? maskedDescription() : trophy.description));

  const meta = el('div', 'meta');
  meta.append(el('span', 'tag', gradeWord(trophy.grade)));
  for (const kind of trophyKinds(trophy)) meta.append(el('span', `tag kind-${kind}`, kindLabel(kind)));
  if (trophy.missable) meta.append(el('span', 'tag missable', 'MISSABLE'));
  if (trophy.target) meta.append(el('span', 'tag', `Target: ${trophy.target.toLocaleString()} ${trophy.target_label}`));
  container.append(meta);

  container.append(el('h4', null, 'Guide'));
  if (masked) {
    container.append(el('p', 'guide-text', 'Spoilers are on and this story trophy is not earned yet, so its guide stays hidden. Earn it, or turn spoilers off, to read the guide.'));
  } else {
    container.append(el('p', 'guide-text', trophy.guide));
  }

  container.append(el('h4', null, 'Sources'));
  const sources = el('ul', 'sources');
  for (const source of trophy.sources) sources.append(el('li', null, source));
  container.append(sources);

  const row = el('div', 'row');
  const toggle = el('button', `btn${earned ? '' : ' primary'}`, earned ? 'Mark as not earned' : 'Mark as earned');
  toggle.type = 'button';
  toggle.addEventListener('click', () => callbacks.onToggleEarned(trophy.id));
  row.append(toggle);
  container.append(row);

  container.append(el('h4', null, 'Your note'));
  const note = document.createElement('textarea');
  note.value = state.notes[trophy.id] ?? '';
  note.placeholder = 'Where is it? What worked? (saved in this browser only)';
  note.setAttribute('aria-label', `Note for ${trophy.name}`);
  note.addEventListener('change', () => callbacks.onSetNote(trophy.id, note.value));
  container.append(note);
}

export function renderRoadmap(container, trophies, state, callbacks) {
  const earned = new Set(state.earned);
  container.replaceChildren();
  for (const stage of ROADMAP_STAGES) {
    const members = trophies.filter((t) => t.stage === stage.stage);
    const got = members.filter((t) => earned.has(t.id)).length;
    const card = el('section', 'stage');
    const heading = el('h3', null, stage.title);
    heading.append(el('span', 'stage-count', `${got}/${members.length} earned`));
    card.append(heading);
    card.append(el('p', null, stage.text));
    const names = el('div', 'trophy-names');
    for (const trophy of members) {
      const chip = el('button', earned.has(trophy.id) ? 'done' : '', trophy.name);
      chip.type = 'button';
      chip.addEventListener('click', () => callbacks.onSelectTrophy(trophy.id));
      names.append(chip);
    }
    card.append(names);
    container.append(card);
  }
}

export function renderMissables(container, trophies, state, filters, callbacks) {
  const earned = new Set(state.earned);
  const missable = trophies.filter((t) => t.missable);
  const got = missable.filter((t) => earned.has(t.id)).length;
  container.replaceChildren();
  const warn = el('div', 'warn');
  warn.append(el('strong', null, `${got} of ${missable.length} missable trophies earned. `));
  warn.append(document.createTextNode('These 13 trophies are tied to specific story missions or one-time moments. Do them on your first playthrough — a missed one means mission replay or a second playthrough.'));
  container.append(warn);
  const list = el('ul', 'trophy-list');
  for (const trophy of missable) {
    const item = el('li');
    item.append(trophyRow(trophy, state, filters, callbacks));
    list.append(item);
  }
  container.append(list);
}
