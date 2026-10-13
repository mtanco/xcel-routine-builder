// Pure beam logic: no DOM, no storage. Covered by tests/beam.test.mjs.
// Entries: { uid, id, split?: 'low'|'mid'|'high' }  (split only matters for split leaps/jumps)
import { round2, findSkill, resolve, vpKey, valueParts } from './common.js';

export { findSkill, resolve, valueParts };

export function splitOption(data, entry) {
  const id = entry?.split || data.defaultSplit;
  return data.splitOptions.find((o) => o.id === id) || data.splitOptions.find((o) => o.id === data.defaultSplit);
}

/** The value this entry earns: split skills depend on the split angle chosen. */
export function entryValue(data, entry, skill = findSkill(data, entry.id)) {
  if (!skill) return null;
  return skill.split ? splitOption(data, entry).value : skill.value;
}

/** True when this entry counts as the 120° split leap or jump. */
export function hasSplit(data, entry, skill = findSkill(data, entry.id)) {
  return Boolean(skill?.split && splitOption(data, entry).splitOk);
}

/** The four Gold special requirements, each with a `met` flag. */
export function checkRequirements(data, routine) {
  // An element must earn value part credit to fill a special requirement.
  const earns = new Set(valueParts(data, routine).entries.filter((e) => e.earns).map((e) => e.uid));
  const list = resolve(data, routine).filter((e) => earns.has(e.uid));
  const leaps = list.filter((e) => e.skill.family === 'leap');
  const acro = list.filter((e) => e.skill.acro && e.skill.family !== 'mount' && !e.skill.dismount);

  const splitLeaps = leaps.filter((e) => hasSplit(data, e, e.skill));
  const twoGroup2 = splitLeaps.some((s) => leaps.some((o) => vpKey(o.skill) !== vpKey(s.skill)));

  return [
    {
      id: 'turn',
      text: 'A full (1/1) turn on one foot',
      met: list.some((e) => e.skill.fullTurn),
    },
    {
      id: 'dance',
      text: 'Two different leaps, jumps, or hops, one with a 120° split (isolated or in a series)',
      met: twoGroup2,
    },
    {
      id: 'acro',
      text: 'Two acro skills on the beam, one reaching or passing through inverted vertical (not the mount or dismount)',
      met: acro.length >= 2 && acro.some((e) => e.skill.inverted),
    },
    {
      id: 'dismount',
      text: 'A dismount',
      met: list.some((e) => e.skill.dismount),
    },
  ];
}

/** Start value with an itemized breakdown of what is being taken off. */
export function startValue(data, routine) {
  const s = data.scoring;
  const vp = valueParts(data, routine);
  const reqs = checkRequirements(data, routine);
  const list = resolve(data, routine);

  const missingVP = Math.max(0, s.vpNeeded - vp.credited);
  const missingSR = reqs.filter((r) => !r.met).length;
  const noDismount = !list.some((e) => e.skill.dismount);

  const items = [];
  if (missingVP) items.push({ id: 'vp', label: `${missingVP} missing value part${missingVP > 1 ? 's' : ''}`, amount: round2(missingVP * s.vpEach) });
  if (missingSR) items.push({ id: 'sr', label: `${missingSR} missing special requirement${missingSR > 1 ? 's' : ''}`, amount: round2(missingSR * s.srEach) });
  if (noDismount) items.push({ id: 'nodis', label: 'No dismount', amount: s.noDismount });

  const total = round2(items.reduce((t, i) => t + i.amount, 0));
  return { value: Math.max(0, round2(s.max - total)), items, vp, reqs };
}
