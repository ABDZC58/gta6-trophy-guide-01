// Filtering and the spoiler rule: which trophies a list shows, and what a
// hidden trophy looks like before it is earned.
export function trophyMatchesKind(trophy, kind) {
  if (kind === 'all') return true;
  if (kind === 'online') return false; // GTA VI has no online trophies.
  return trophy.kinds.includes(kind);
}

export function trophyMatchesGrade(trophy, grade) {
  return grade === 'all' || trophy.grade === grade;
}

export function trophyMatchesSearch(trophy, query) {
  if (!query) return true;
  const q = query.trim().toLowerCase();
  return trophy.name.toLowerCase().includes(q) || trophy.description.toLowerCase().includes(q);
}

export function filterTrophies(trophies, { kind, grade, query, hideEarned, earned }) {
  return trophies.filter((t) => {
    if (!trophyMatchesKind(t, kind)) return false;
    if (!trophyMatchesGrade(t, grade)) return false;
    if (!trophyMatchesSearch(t, query)) return false;
    if (hideEarned && earned.has(t.id)) return false;
    return true;
  });
}

// A hidden trophy stays masked while spoilers are on and it is not earned.
export function isSpoilerMasked(trophy, spoilersOn, earned) {
  return spoilersOn && trophy.hidden && !earned.has(trophy.id);
}

export const KIND_COUNTS_LABEL = {
  all: 'All',
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  online: 'Online',
};
