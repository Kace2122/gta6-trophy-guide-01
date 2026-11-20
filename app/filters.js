// Leonida Legend filters: kind, grade, earned status, search text, and the
// spoiler rule — story trophies stay hidden (name and description masked)
// until they are earned, when spoilers are on.
export const KINDS = ['story', 'missable', 'collectibles', 'activities', 'completion'];

export function defaultFilters() {
  return { kind: 'all', grade: 'all', status: 'all', query: '', spoilers: false };
}

export function trophyKinds(trophy) {
  const kinds = [trophy.kind];
  if (trophy.missable && !kinds.includes('missable')) kinds.push('missable');
  return kinds;
}

export function matchesFilters(trophy, filters, earnedSet) {
  if (filters.kind !== 'all' && !trophyKinds(trophy).includes(filters.kind)) return false;
  if (filters.grade !== 'all' && trophy.grade !== filters.grade) return false;
  const earned = earnedSet.has(trophy.id);
  if (filters.status === 'earned' && !earned) return false;
  if (filters.status === 'remaining' && earned) return false;
  if (filters.query) {
    const hay = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
    if (!hay.includes(filters.query.toLowerCase())) return false;
  }
  return true;
}

// A story trophy is spoiler-masked when spoilers are on and it is not earned.
export function isSpoilerMasked(trophy, filters, earnedSet) {
  return filters.spoilers && trophy.kind === 'story' && !earnedSet.has(trophy.id);
}

export function maskedName(trophy) {
  return `Hidden trophy #${trophy.id}`;
}

export function maskedDescription() {
  return 'Hidden on PlayStation until earned. Earn it to reveal its name and description.';
}
