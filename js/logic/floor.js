// Pure floor logic: no DOM, no storage. Covered by tests/floor.test.mjs.
// Entries: { uid, id, connected: boolean, split?: 'low'|'mid'|'high' }
// `connected` = flows from the skill before it: the same tumbling pass for acro,
// or the same dance passage for leaps/jumps (steps or a chassé in between are fine).
import { round2, findSkill, resolve, vpKey, valueParts } from './common.js';

export { findSkill, resolve, valueParts };

export function splitOption(data, entry) {
  const id = entry?.split || data.defaultSplit;
  return data.splitOptions.find((o) => o.id === id) || data.splitOptions.find((o) => o.id === data.defaultSplit);
}

/** Value earned: split skills only reach their listed value at 135°+, otherwise A. */
export function entryValue(data, entry, skill = findSkill(data, entry.id)) {
  if (!skill) return null;
  if (!skill.split) return skill.value;
  return splitOption(data, entry).high ? skill.value : 'A';
}

export function hasSplit(data, entry, skill = findSkill(data, entry.id)) {
  return Boolean(skill?.split && splitOption(data, entry).splitOk);
}

/** Split the routine into chains of connected entries (each chain = one pass or passage). */
export function chains(list) {
  const out = [];
  list.forEach((e, i) => {
    const prev = list[i - 1];
    if (i > 0 && e.connected && prev && e.index === prev.index + 1) out[out.length - 1].push(e);
    else out.push([e]);
  });
  return out;
}

/** Longest run of directly connected flight skills in a chain. */
function flightRun(chain) {
  let best = 0;
  let run = 0;
  chain.forEach((e) => { run = e.skill.flight ? run + 1 : 0; best = Math.max(best, run); });
  return best;
}

/** True if a chain holds a dance passage meeting the Gold requirement. */
function danceOk(data, chain) {
  // An acro skill breaks the passage, so look at runs of consecutive dance skills.
  const runs = [];
  chain.forEach((e) => {
    if (e.skill.family !== 'dance') { runs.push(null); return; }
    if (!runs.length || runs[runs.length - 1] === null) runs.push([e]);
    else runs[runs.length - 1].push(e);
  });
  return runs.filter(Boolean).some((run) => run.some((a) => a.skill.leap && hasSplit(data, a, a.skill)
    && run.some((b) => vpKey(b.skill) !== vpKey(a.skill))));
}

/** The four Gold special requirements, each with a `met` flag. */
export function checkRequirements(data, routine) {
  const earns = new Set(valueParts(data, routine).entries.filter((e) => e.earns).map((e) => e.uid));
  // Only elements that earn value part credit can fill a requirement.
  const list = resolve(data, routine).filter((e) => earns.has(e.uid));
  const all = chains(list);

  const pass1 = all.filter((c) => flightRun(c) >= 2);
  const pass2 = all.filter((c) => flightRun(c) >= 2 || c.some((e) => e.skill.salto));
  const sr1 = pass1.length > 0;
  // SR1 and SR2 must come from different passes.
  const sr2 = sr1 ? pass1.some((p) => pass2.some((q) => q !== p)) : pass2.length > 0;

  return [
    {
      id: 'pass1',
      text: 'A tumbling pass with two directly connected flight skills (like round-off, back handspring)',
      met: sr1,
    },
    {
      id: 'pass2',
      text: 'A different 2nd pass: two more connected flight skills, or one aerial or salto',
      met: sr2,
    },
    {
      id: 'dance',
      text: 'A dance passage: two different leaps, jumps, or hops, one a leap with a 120° split',
      met: all.some((c) => danceOk(data, c)),
    },
    {
      id: 'turn',
      text: 'A full (1/1) turn on one foot',
      met: list.some((e) => e.skill.fullTurn),
    },
  ];
}

/** Start value with an itemized breakdown (floor has no dismount deduction). */
export function startValue(data, routine) {
  const s = data.scoring;
  const vp = valueParts(data, routine);
  const reqs = checkRequirements(data, routine);

  const missingVP = Math.max(0, s.vpNeeded - vp.credited);
  const missingSR = reqs.filter((r) => !r.met).length;
  const items = [];
  if (missingVP) items.push({ id: 'vp', label: `${missingVP} missing value part${missingVP > 1 ? 's' : ''}`, amount: round2(missingVP * s.vpEach) });
  if (missingSR) items.push({ id: 'sr', label: `${missingSR} missing special requirement${missingSR > 1 ? 's' : ''}`, amount: round2(missingSR * s.srEach) });

  const total = round2(items.reduce((t, i) => t + i.amount, 0));
  return { value: Math.max(0, round2(s.max - total)), items, vp, reqs };
}
