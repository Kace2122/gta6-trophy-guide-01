// Leonida Legend boot: loads the trophy data, wires the toolbar, tabs and
// detail pane, and keeps every view in sync with the saved progress.
// Deep links: ?view=roadmap|missables, ?trophy=<id>, ?seed=demo, ?spoilers=on.
import { defaultFilters } from './filters.js';
import {
  downloadText,
  loadState,
  resetState,
  saveState,
  seedDemo,
  setNote,
  stateFromFileText,
  stateToFile,
  toggleEarned,
} from './store.js';
import {
  renderChecklist,
  renderDetail,
  renderMissables,
  renderProgress,
  renderRoadmap,
} from './views.js';

const params = new URLSearchParams(location.search);
const data = await (await fetch('data/trophies.json')).json();
const trophies = data.trophies;

let state = loadState();
if (params.get('seed') === 'demo' && state.earned.length === 0) state = seedDemo(state);

const filters = defaultFilters();
if (params.get('spoilers') === 'on') filters.spoilers = true;

let selectedId = Number(params.get('trophy')) || null;
if (!trophies.some((t) => t.id === selectedId)) selectedId = null;

const nodes = {
  bigCount: document.getElementById('bigCount'),
  meter: document.getElementById('meterFill'),
  gradeChips: document.getElementById('gradeChips'),
  missableChip: document.getElementById('missableChip'),
  checklist: document.getElementById('checklist'),
  roadmap: document.getElementById('roadmap'),
  missables: document.getElementById('missables'),
  detail: document.getElementById('detail'),
  shownCount: document.getElementById('shownCount'),
  statusLine: document.getElementById('statusLine'),
};

const views = {
  checklist: document.getElementById('viewChecklist'),
  roadmap: document.getElementById('viewRoadmap'),
  missables: document.getElementById('viewMissables'),
};
const tabs = {
  checklist: document.getElementById('tabChecklist'),
  roadmap: document.getElementById('tabRoadmap'),
  missables: document.getElementById('tabMissables'),
};

let currentView = 'checklist';

function showView(name) {
  currentView = name;
  for (const [key, section] of Object.entries(views)) section.hidden = key !== name;
  for (const [key, tab] of Object.entries(tabs)) tab.setAttribute('aria-selected', key === name ? 'true' : 'false');
}

const callbacks = {
  onToggleEarned(id) {
    state = toggleEarned(state, id);
    renderAll();
  },
  onSelectTrophy(id) {
    selectedId = id;
    showView('checklist');
    renderAll();
    nodes.detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },
  onSetNote(id, text) {
    state = setNote(state, id, text);
    nodes.statusLine.textContent = 'Note saved in this browser.';
  },
};

function renderAll() {
  renderProgress(trophies, state, nodes);
  const shown = renderChecklist(nodes.checklist, trophies, state, filters, callbacks);
  updateShownCount(shown);
  renderRoadmap(nodes.roadmap, trophies, state, callbacks);
  renderMissables(nodes.missables, trophies, state, filters, callbacks);
  const selected = trophies.find((t) => t.id === selectedId) ?? null;
  renderDetail(nodes.detail, selected, state, filters, callbacks);
  document.getElementById('tabChecklistCount').textContent = `${trophies.length}`;
  document.getElementById('tabMissablesCount').textContent = `${trophies.filter((t) => t.missable).length}`;
}

function updateShownCount(shown) {
  if (currentView === 'roadmap') {
    nodes.shownCount.textContent = '5 roadmap stages taking all 55 trophies in order';
  } else if (currentView === 'missables') {
    nodes.shownCount.textContent = '13 missable trophies — do them on your first playthrough';
  } else {
    nodes.shownCount.textContent = `Showing ${shown} of ${trophies.length} trophies`;
  }
}

function bindToolbar() {
  const search = document.getElementById('search');
  search.addEventListener('input', () => {
    filters.query = search.value;
    const shown = renderChecklist(nodes.checklist, trophies, state, filters, callbacks);
    updateShownCount(shown);
  });
  document.getElementById('kind').addEventListener('change', (event) => {
    filters.kind = event.target.value;
    renderAll();
  });
  document.getElementById('grade').addEventListener('change', (event) => {
    filters.grade = event.target.value;
    renderAll();
  });
  document.getElementById('status').addEventListener('change', (event) => {
    filters.status = event.target.value;
    renderAll();
  });
  const spoilers = document.getElementById('spoilers');
  spoilers.checked = filters.spoilers;
  spoilers.addEventListener('change', () => {
    filters.spoilers = spoilers.checked;
    renderAll();
  });
  document.getElementById('export').addEventListener('click', () => {
    downloadText('leonida-legend-progress.json', stateToFile(state));
    nodes.statusLine.textContent = 'Progress exported as leonida-legend-progress.json.';
  });
  document.getElementById('import').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const next = stateFromFileText(await file.text(), trophies.map((t) => t.id));
      state = next;
      saveState(state);
      renderAll();
      nodes.statusLine.textContent = `Imported ${next.earned.length} earned trophies.`;
    } catch {
      nodes.statusLine.textContent = 'That file could not be read as a progress export.';
    }
    event.target.value = '';
  });
  document.getElementById('reset').addEventListener('click', () => {
    if (window.confirm('Clear all earned ticks and notes? This cannot be undone.')) {
      state = resetState();
      selectedId = null;
      renderAll();
      nodes.statusLine.textContent = 'Progress cleared.';
    }
  });
  for (const [name, tab] of Object.entries(tabs)) {
    tab.addEventListener('click', () => {
      showView(name);
      renderAll();
    });
  }
}

bindToolbar();
const startView = params.get('view');
if (startView === 'roadmap' || startView === 'missables') showView(startView);
renderAll();
