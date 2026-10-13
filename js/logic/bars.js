// Pure bars logic: no DOM, no storage. Covered by tests/bars.test.mjs.
// Entries: { uid, id, bar: 'low'|'high', connected: boolean }
// `connected` means "directly connected to the skill before it".
import { round2, findSkill, resolve, vpKey, valueParts } from './common.js';

export { findSkill, resolve, vpKey, valueParts };

function circlingPairMet(circles) {
  for (let i = 0; i < circles.length; i += 1) {
    for (let j = i + 1; j < circles.length; j += 1) {
      const a = circles[i];
      const b = circles[j];
      if (a.id !== b.id) return true;                       // two different circling skills
      if (a.bar !== b.bar) return true;                     // same skill, one on each bar
      if (b.index === a.index + 1 && b.connected) return true; // same skill, directly connected
    }
  }
  return false;
}

/** The four Gold special requirements, each with a `met` flag. */
export function checkRequirements(data, routine) {
  // An element must earn value part credit to fill a special requirement.
  const earns = new Set(valueParts(data, routine).entries.filter((e) => e.earns).map((e) => e.uid));
  const list = resolve(data, routine).filter((e) => earns.has(e.uid));
  const middle = list.filter((e) => e.skill.family !== 'mount' && !e.skill.dismount);
  const circles = middle.filter((e) => e.skill.circling);

  return [
    {
      id: 'clear-support',
      text: 'A skill finishing in clear support at horizontal or above (not a mount or dismount)',
      met: middle.some((e) => e.skill.clearSupport),
    },
    {
      id: 'circle-1',
      text: 'A 360° circling skill (not a mount or dismount)',
      met: circles.length >= 1,
    },
    {
      id: 'circle-2',
      text: 'A second circling skill: a different one, the same one directly connected, or the same one on the other bar',
      met: circlingPairMet(circles),
    },
    {
      id: 'dismount',
      text: 'A dismount from the high bar',
      met: list.some((e) => e.skill.dismount && e.bar === 'high'),
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
