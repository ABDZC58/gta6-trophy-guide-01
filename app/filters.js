// Which trophies a list shows, and when a hidden trophy stays masked.
// Kinds come from the data: story, missable, collectibles, activities.
// GTA VI has no online trophies, so the online filter shows an empty list.
export function kindMatches(trophy, kind) {
  if (kind === 'all') return true;
  if (kind === 'online') return false;
  return trophy.kinds.includes(kind);
}

export function gradeMatches(trophy, grade) {
  return grade === 'all' || trophy.grade === grade;
}

export function searchMatches(trophy, query) {
  if (!query) return true;
  const q = query.trim().toLowerCase();
  const hay = `${trophy.name} ${trophy.description} ${trophy.chapter ?? ''}`.toLowerCase();
  return hay.includes(q);
}

export function visibleTrophies(trophies, { kind, grade, query, hideEarned, earned }) {
  return trophies.filter((t) => {
    if (!kindMatches(t, kind)) return false;
    if (!gradeMatches(t, grade)) return false;
    if (!searchMatches(t, query)) return false;
    if (hideEarned && earned.has(t.id)) return false;
    return true;
  });
}

// A hidden trophy stays masked while spoilers are on and it is not earned.
// Earned trophies are always shown, masked or not.
export function spoilerMasked(trophy, spoilersOn, earned) {
  return spoilersOn && trophy.hidden && !earned.has(trophy.id);
}

export const KIND_LABELS = {
  all: 'All',
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  online: 'Online',
};
