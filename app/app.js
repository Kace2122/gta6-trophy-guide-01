// Leonida Legend — GTA VI trophy tracker. Offline, localStorage only, no network at runtime.
// State keys: gta6-earned (array of trophy ids), gta6-spoiler ('1'/'0'), gta6-theme ('paper'/'night').
import { renderRoadmap, renderMissables, renderAbout, renderGuideDetail } from './views.js';

const EARNED_KEY = 'gta6-earned';
const SPOILER_KEY = 'gta6-spoiler';
const THEME_KEY = 'gta6-theme';
// Fixed demo seed shown only when ?demo=1 and no progress is saved yet (for screenshots).
const DEMO_EARNED = [2, 3, 5, 8, 20, 21, 33, 36, 44, 46, 51, 53, 55];

const params = new URLSearchParams(location.search);
const view = document.getElementById('view');
const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const byId = new Map(trophies.map((t) => [t.id, t]));
const SOURCE_LABELS = {
  exophase: ['Exophase — official trophy list', doc.sources.exophase, 'name, description and grade'],
  psnprofiles: ['PSNProfiles — GTA VI trophies', doc.sources.psnprofiles, 'rarity percentages and progress counter'],
  outputlag: ['OutputLag — GTA 6 trophy list', doc.sources.outputlag, 'how-to detail (gates, missions, counts)'],
};

let earned = new Set(JSON.parse(localStorage.getItem(EARNED_KEY) ?? '[]'));
if (params.get('demo') === '1' && earned.size === 0) {
  earned = new Set(DEMO_EARNED);
  save();
}
let spoiler = localStorage.getItem(SPOILER_KEY) === '1' || params.get('spoiler') === '1';
let night = localStorage.getItem(THEME_KEY) === 'night' || params.get('theme') === 'night';
let selected = null;

function save() {
  localStorage.setItem(EARNED_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

function applyPrefs() {
  document.documentElement.setAttribute('data-theme', night ? 'night' : 'paper');
  document.getElementById('spoiler').checked = spoiler;
  document.getElementById('night').checked = night;
}

export function isHidden(t) {
  return t.hidden && !earned.has(t.id) && spoiler;
}
export function displayName(t) {
  return isHidden(t) ? 'Hidden trophy' : t.name;
}
export function displayDesc(t) {
  return isHidden(t) ? 'Hidden until earned — turn spoilers off to reveal it.' : t.description;
}
export function gradeChip(t) {
  return `<span class="chip ${t.grade}">${t.grade}</span>`;
}
export function rarityLine(t) {
  const bits = [];
  if (t.hidden) bits.push('<span class="chip hidden">hidden</span>');
  if (t.missable) bits.push('<span class="chip missable">possibly missable</span>');
  bits.push(`<span class="chip">${t.kind}</span>`);
  if (t.target) bits.push(`<span class="chip">target: ${t.target.toLocaleString('en-US')}</span>`);
  bits.push(`<span class="chip">PSNProfiles ${t.psn.toFixed(1)}% · PSN ${t.psn_official.toFixed(2)}%</span>`);
  return bits.join(' ');
}

function renderProgress() {
  const total = trophies.length;
  const per = { platinum: [0, 0], gold: [0, 0], silver: [0, 0], bronze: [0, 0] };
  for (const t of trophies) {
    per[t.grade][1] += 1;
    if (earned.has(t.id)) per[t.grade][0] += 1;
  }
  document.getElementById('earnedCount').textContent = earned.size;
  document.getElementById('barFill').style.width = `${(earned.size / total) * 100}%`;
  document.getElementById('gradeCounts').textContent =
    `Platinum ${per.platinum[0]}/${per.platinum[1]} · Gold ${per.gold[0]}/${per.gold[1]} · Silver ${per.silver[0]}/${per.silver[1]} · Bronze ${per.bronze[0]}/${per.bronze[1]}`;
  document.getElementById('pct').textContent =
    `${Math.round((earned.size / total) * 100)}% of the list — ${total - earned.size} to go`;
}

function trophyRow(t) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = `trophy${earned.has(t.id) ? ' earned' : ''}${selected === t.id ? ' selected' : ''}`;
  b.dataset.id = t.id;
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.id);
  box.setAttribute('aria-label', `Mark ${displayName(t)} earned`);
  box.addEventListener('click', (e) => {
    e.stopPropagation();
    if (box.checked) earned.add(t.id);
    else earned.delete(t.id);
    save();
    route();
  });
  const mid = document.createElement('span');
  const nm = document.createElement('span');
  nm.className = 'name';
  nm.textContent = displayName(t);
  const ds = document.createElement('span');
  ds.className = 'desc';
  ds.textContent = displayDesc(t);
  const mt = document.createElement('span');
  mt.className = 'meta';
  mt.innerHTML = `${gradeChip(t)} ${rarityLine(t)}`;
  mid.append(nm, document.createElement('br'), ds, document.createElement('br'), mt);
  const right = document.createElement('span');
  right.className = 'meta';
  right.textContent = earned.has(t.id) ? '✓ earned' : '';
  b.append(box, mid, right);
  b.addEventListener('click', () => {
    selected = t.id;
    location.hash = `#/guide/${t.id}`;
  });
  return b;
}

function renderChecklist() {
  const q = (document.getElementById('q').value || '').toLowerCase();
  const kind = document.getElementById('kind').value;
  const grade = document.getElementById('grade').value;
  const status = document.getElementById('status').value;
  const list = trophies.filter((t) => {
    if (kind === 'online') return false;
    if (kind === 'missable' && !t.missable) return false;
    if (kind !== 'all' && kind !== 'missable' && t.kind !== kind) return false;
    if (grade !== 'all' && t.grade !== grade) return false;
    if (status === 'earned' && !earned.has(t.id)) return false;
    if (status === 'remaining' && earned.has(t.id)) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))) return false;
    return true;
  });
  const wrap = document.createElement('div');
  wrap.className = 'split';
  const left = document.createElement('div');
  const count = document.createElement('p');
  count.className = 'count-line';
  if (kind === 'online') {
    count.textContent = 'No online trophies — all 55 are single-player and offline.';
  } else {
    count.textContent = `Showing ${list.length} of 55 trophies · ${earned.size} earned`;
  }
  left.append(count);
  const listEl = document.createElement('div');
  listEl.className = 'list';
  if (kind === 'online') {
    const e = document.createElement('div');
    e.className = 'empty';
    e.textContent = 'There are no online trophies in GTA VI. Every trophy on this list is earned offline, in single-player — nothing here needs PS Plus or a connection.';
    listEl.append(e);
  } else if (list.length === 0) {
    const e = document.createElement('div');
    e.className = 'empty';
    e.textContent = 'No trophies match those filters. Clear the search or widen the filters.';
    listEl.append(e);
  } else {
    for (const t of list) listEl.append(trophyRow(t));
  }
  left.append(listEl);
  const right = document.createElement('div');
  right.append(renderGuideDetail(selected ?? (list[0]?.id ?? null), { byId, earned, SOURCE_LABELS, displayName, displayDesc, gradeChip, rarityLine }));
  wrap.append(left, right);
  view.replaceChildren(wrap);
}

export function route() {
  renderProgress();
  const hash = location.hash || '#/';
  document.querySelectorAll('[data-nav]').forEach((a) => {
    a.classList.toggle('active', hash.startsWith(`#/${a.dataset.nav}`) || (a.dataset.nav === 'checklist' && (hash === '#/' || hash.startsWith('#/guide/'))));
  });
  if (hash.startsWith('#/roadmap')) {
    view.replaceChildren(renderRoadmap({ trophies, byId, earned, displayName }));
  } else if (hash.startsWith('#/missables')) {
    view.replaceChildren(renderMissables({ trophies, byId, earned, displayName, displayDesc }));
  } else if (hash.startsWith('#/about')) {
    view.replaceChildren(renderAbout({ doc }));
  } else if (hash.startsWith('#/guide/')) {
    const id = Number(hash.split('/')[2]);
    selected = byId.has(id) ? id : null;
    renderChecklist();
  } else {
    selected = null;
    renderChecklist();
  }
  window.scrollTo(0, 0);
}

document.getElementById('q').addEventListener('input', renderChecklist);
document.getElementById('kind').addEventListener('change', renderChecklist);
document.getElementById('grade').addEventListener('change', renderChecklist);
document.getElementById('status').addEventListener('change', renderChecklist);
document.getElementById('spoiler').addEventListener('change', (e) => {
  spoiler = e.target.checked;
  localStorage.setItem(SPOILER_KEY, spoiler ? '1' : '0');
  route();
});
document.getElementById('night').addEventListener('change', (e) => {
  night = e.target.checked;
  localStorage.setItem(THEME_KEY, night ? 'night' : 'paper');
  applyPrefs();
});
document.getElementById('export').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify({ game: 'Grand Theft Auto VI', exportedAt: new Date().toISOString(), earned: [...earned].sort((x, y) => x - y) }, null, 2)], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
document.getElementById('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const ids = Array.isArray(data) ? data : data.earned;
    const valid = ids.filter((id) => byId.has(Number(id))).map(Number);
    earned = new Set(valid);
    save();
    route();
  } catch {
    alert('That file is not a trophy-progress export from this guide.');
  }
  e.target.value = '';
});
document.getElementById('reset').addEventListener('click', () => {
  if (confirm('Clear all earned trophies?')) {
    earned = new Set();
    save();
    route();
  }
});

applyPrefs();
addEventListener('hashchange', route);
route();
