// Logic shared by routine-based events (bars, beam, floor). Pure: no DOM, no storage.
//
// A routine is an ordered list of entries: { uid, id, ...event-specific fields }.

export const round2 = (n) => Math.round(n * 100) / 100;

export function findSkill(data, id) {
  if (!id) return null;
  return data.elements.find((e) => e.id === id) || null;
}

/** Routine entries joined with their skill data; unknown ids are dropped. */
export function resolve(data, routine = []) {
  return routine
    .map((entry, index) => ({ ...entry, index, skill: findSkill(data, entry.id) }))
    .filter((e) => e.skill);
}

/** The book's notion of "the same element" for counting value parts. */
export const vpKey = (skill) => skill.vpKey || skill.code || skill.id;

/**
 * Which entries earn value part credit, and why not when they don't.
 *
 * Book rule: any element can earn VP twice, provided the second time is in a
 * different connection (preceded or followed by a different element). A third
 * time, or a repeat in the exact same connection, earns nothing. An element that
 * earned nothing does not use up one of the two credits.
 *
 * Returns { credited, needed, entries: [{ uid, earns: bool, reason? }] }
 */
export function valueParts(data, routine) {
  const { maxRepeats, vpNeeded } = data.scoring;
  const list = resolve(data, routine);
  const keys = list.map((e) => vpKey(e.skill));
  const creditedBy = {};   // key -> [{ prev, next }]
  let credited = 0;

  const entries = list.map((e, i) => {
    const key = keys[i];
    const conn = { prev: keys[i - 1] ?? null, next: keys[i + 1] ?? null };
    if (e.skill.unlimited) { credited += 1; return { uid: e.uid, earns: true }; } // e.g. floor hand-support flight
    const prior = creditedBy[key] || [];
    if (prior.length >= maxRepeats) {
      return { uid: e.uid, earns: false, reason: `this skill already earned credit ${maxRepeats} times` };
    }
    if (prior.some((c) => c.prev === conn.prev && c.next === conn.next)) {
      return { uid: e.uid, earns: false, reason: 'same skills before and after as last time (exact same connection)' };
    }
    creditedBy[key] = [...prior, conn];
    credited += 1;
    return { uid: e.uid, earns: true };
  });
  return { credited, needed: vpNeeded, entries };
}
