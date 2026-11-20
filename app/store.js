// Leonida Legend progress store: earned ticks and per-trophy notes, saved in
// localStorage, with export to a file and import back. Nothing leaves the browser.
export const STORAGE_KEY = 'leonida-legend-progress-v1';
export const DEMO_EARNED_IDS = [2, 3, 15, 16, 17, 19, 20, 21, 28, 33, 44, 46, 51];

export function blankState() {
  return { earned: [], notes: {} };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return blankState();
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.earned)) return blankState();
    return {
      earned: parsed.earned.filter((id) => Number.isInteger(id)),
      notes: parsed.notes && typeof parsed.notes === 'object' ? parsed.notes : {},
    };
  } catch {
    return blankState();
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function toggleEarned(state, id) {
  const at = state.earned.indexOf(id);
  if (at >= 0) state.earned.splice(at, 1);
  else state.earned.push(id);
  saveState(state);
  return state;
}

export function setNote(state, id, text) {
  if (text.trim()) state.notes[id] = text.trim();
  else delete state.notes[id];
  saveState(state);
  return state;
}

export function resetState() {
  const fresh = blankState();
  saveState(fresh);
  return fresh;
}

export function stateToFile(state) {
  return JSON.stringify(
    { app: 'leonida-legend', version: 1, exportedAt: new Date().toISOString(), ...state },
    null,
    2,
  );
}

export function stateFromFileText(text, trophyIds) {
  const parsed = JSON.parse(text);
  const ids = new Set(trophyIds);
  const earned = (Array.isArray(parsed.earned) ? parsed.earned : [])
    .filter((id) => Number.isInteger(id) && ids.has(id));
  const notes = {};
  if (parsed.notes && typeof parsed.notes === 'object') {
    for (const [key, value] of Object.entries(parsed.notes)) {
      const id = Number(key);
      if (ids.has(id) && typeof value === 'string' && value.trim()) notes[id] = value.trim();
    }
  }
  return { earned, notes };
}

export function downloadText(filename, text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// Demo progress for screenshots and first looks: 13 earned, only when the
// reader has no saved progress yet. Seeded from the ?seed=demo deep link.
export function seedDemo(state) {
  const seeded = { earned: [...DEMO_EARNED_IDS], notes: {} };
  saveState(seeded);
  return seeded;
}
