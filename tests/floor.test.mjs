// Run with: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FLOOR_GOLD as D } from '../data/gold/floor.js';
import {
  valueParts, checkRequirements, startValue, findSkill, entryValue, hasSplit,
} from '../js/logic/floor.js';
import { normalize, encodePlan, decodePlan, defaultState } from '../js/store.js';

let n = 0;
const e = (id, connected = false, split) => ({ uid: `u${n++}`, id, connected, ...(split ? { split } : {}) });
const c = (id, split) => e(id, true, split); // connected to the previous skill
const met = (routine) => Object.fromEntries(checkRequirements(D, routine).map((r) => [r.id, r.met]));

test('data: unique ids, valid families, A/B only, no twisting B saltos', () => {
  assert.equal(new Set(D.elements.map((x) => x.id)).size, D.elements.length);
  D.elements.forEach((x) => {
    assert.ok(D.families[x.family], `${x.id} family`);
    assert.ok(['A', 'B'].includes(x.value), `${x.id} value`);
    if (x.salto) assert.ok(!/twist/i.test(x.name), `${x.id} should not be a twisting salto`);
  });
});

test('empty routine: 10 - 0.60 - 2.00 = 7.40 (no dismount deduction on floor)', () => {
  assert.equal(startValue(D, []).value, 7.4);
});

test('split values: split leap is always A; side/switch leap and straddle jump need 135° for B', () => {
  assert.equal(entryValue(D, e('1.101l', false, 'high')), 'A');
  assert.equal(entryValue(D, e('1.204', false, 'high')), 'B');
  assert.equal(entryValue(D, e('1.204', false, 'mid')), 'A');
  assert.equal(entryValue(D, e('1.207')), 'A', 'defaults to 100-134°');
  assert.equal(hasSplit(D, e('1.202', false, 'low')), false);
});

test('book example (Platinum #1 pattern): RO + BHS + back tuck, then a front salto alone', () => {
  const r = [e('5.105'), c('5.106'), c('8.101t'), e('2.101'), e('6.201p')];
  const m = met(r);
  assert.equal(m.pass1, true);
  assert.equal(m.pass2, true);
});

test('book example: pass 1 and pass 2 cannot be the same pass', () => {
  const m = met([e('5.105'), c('5.106'), c('8.101s')]);
  assert.equal(m.pass1, true);
  assert.equal(m.pass2, false);
});

test('two separate two-flight passes fill both acro requirements', () => {
  const m = met([e('5.105'), c('5.106'), e('2.101'), e('5.102'), c('5.102')]);
  assert.deepEqual([m.pass1, m.pass2], [true, true]);
});

test('connections matter: unconnected flight skills are not a pass', () => {
  assert.equal(met([e('5.105'), e('5.106')]).pass1, false);
  assert.equal(met([e('5.104'), c('5.106')]).pass1, false, 'cartwheel has no flight');
});

test('dance passage: two different Group 1 skills, one a leap with the split', () => {
  assert.equal(met([e('1.204', false, 'mid'), c('1.116')]).dance, true, 'switch leap + wolf jump');
  assert.equal(met([e('1.101j', false, 'high'), c('1.116')]).dance, false, 'split jump is not a leap');
  assert.equal(met([e('1.101l', false, 'low'), c('1.116')]).dance, false, 'split too small');
  assert.equal(met([e('1.101l'), e('1.116')]).dance, false, 'not connected');
  assert.equal(met([e('1.101l'), c('1.101l')]).dance, false, 'same element twice');
  // book example: split leap - roundoff + Schuschunova: the roundoff breaks the passage
  assert.equal(met([e('1.101l'), c('5.105'), c('1.208')]).dance, false);
});

test('hand-support flight earns credit every time; other skills only twice', () => {
  const vp = valueParts(D, [e('5.105'), c('5.106'), e('5.105'), c('5.106'), e('5.105'), c('5.106')]);
  assert.equal(vp.credited, 6);
  const vp2 = valueParts(D, [e('6.101'), e('2.101'), e('6.101'), e('1.116'), e('6.101')]);
  assert.deepEqual(vp2.entries.map((x) => x.earns), [true, true, true, true, false]);
});

test('a complete Gold routine reaches 10.0', () => {
  const r = [
    e('5.105'), c('5.106'), c('8.101t'),          // pass 1
    e('1.101l', false, 'mid'), c('1.116'),         // dance passage
    e('2.101'),                                    // full turn
    e('5.102'), c('6.101'),                        // pass 2
  ];
  const sv = startValue(D, r);
  assert.deepEqual(met(r), { pass1: true, pass2: true, dance: true, turn: true });
  assert.equal(sv.value, 10);
});

test('store: floor routine normalizes and survives share links', () => {
  const s = normalize({ plan: { events: { floor: { routine: [null, { id: '5.105', connected: 1 }, { id: '1.204', split: 'x' }] } } } });
  assert.equal(s.plan.events.floor.routine.length, 2);
  assert.equal(s.plan.events.floor.routine[0].connected, true);
  assert.equal('split' in s.plan.events.floor.routine[1], false);
  const p = defaultState().plan;
  p.events.floor.routine = [e('5.105'), c('5.106'), e('1.204', false, 'high')];
  const back = decodePlan(encodePlan(p));
  assert.equal(back.events.floor.routine[1].connected, true);
  assert.equal(back.events.floor.routine[2].split, 'high');
  assert.ok(findSkill(D, '5.105').unlimited);
});
