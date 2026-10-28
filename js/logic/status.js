// Skill-status filtering, shared by every event page. Pure functions (unit tested).
//
// "Uninterested" skills are hidden from the default "All" view and from the
// "Add a skill" dropdowns, so the list only shows skills you might compete.

export const HIDDEN_STATUS = 'uninterested';

/** Filter chip ids, in display order. */
export const FILTER_IDS = ['all', 'have', 'learning', 'goal', 'uninterested', 'none'];

/** Fall back to "all" for unknown or missing saved values. */
export function normalizeFilter(v) {
  return FILTER_IDS.includes(v) ? v : 'all';
}

/** Does a skill with this status show under this filter? */
export function matchesFilter(status, filter) {
  switch (filter) {
    case 'all': return status !== HIDDEN_STATUS;
    case 'none': return !status;
    default: return status === filter;
  }
}

/** Number of skills each filter chip would show. statusOf(item) -> status id or null. */
export function statusCounts(items, statusOf) {
  const counts = Object.fromEntries(FILTER_IDS.map((f) => [f, 0]));
  items.forEach((item) => {
    const s = statusOf(item);
    FILTER_IDS.forEach((f) => { if (matchesFilter(s, f)) counts[f] += 1; });
  });
  return counts;
}

/** Items that show under the given filter. */
export function filterItems(items, statusOf, filter) {
  const f = normalizeFilter(filter);
  return items.filter((item) => matchesFilter(statusOf(item), f));
}

/**
 * Items offered in an "Add a skill" / vault select: everything except Uninterested.
 * keep(item) -> true keeps an item anyway (e.g. the vault already chosen in that slot).
 */
export function pickableItems(items, statusOf, keep = () => false) {
  return items.filter((item) => statusOf(item) !== HIDDEN_STATUS || keep(item));
}
