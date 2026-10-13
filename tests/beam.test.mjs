// Run with: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BEAM_GOLD as D } from '../data/gold/beam.js';
import {
  valueParts, checkRequirements, startValue, findSkill, entryValue, hasSplit,
} from '../js/logic/beam.js';
import { normalize, encodePlan, decodePlan, defaultState } from '../js/store.js';

let n = 0;
const e = (id, split) => ({ uid: `u${n++}`, id, ...(split ? { split } : {}) });
const met = (routine) => Object.fromEntries(checkRequirements(D, routine).map((r) => [r.id, r.met]));

test('data: unique ids, valid families, only A/B values, no jump dismount', () => {
  assert.equal(new Set(D.elements.map((x) => x.id)).size, D.elements.length);
  D.elements.forEach((x) => {
    assert.ok(D.families[x.family], `${x.id} family`);
    assert.ok(['A', 'B'].includes(x.value), `${x.id} value`);
  });
  assert.equal(findSkill(D, '9.001'), null, 'jump dismounts are Bronze/Silver only');
  assert.equal(findSkill(D, '2.207').value, 'B', 'sissonne raised to B for 2026-27');
});

test('empty routine: 10 - 0.60 - 2.00 - 0.30 = 7.10', () => {
  assert.equal(startValue(D, []).value, 7.1);
});

test('split angle decides value and the split requirement', () => {
  assert.equal(entryValue(D, e('2.201', 'high')), 'B');
  assert.equal(entryValue(D, e('2.201', 'mid')), 'A');
  assert.equal(entryValue(D, e('2.201', 'low')), 'A');
  assert.equal(entryValue(D, e('2.201')), 'A', 'defaults to 100-134°');
  assert.equal(hasSplit(D, e('2.201', 'mid')), true);
  assert.equal(hasSplit(D, e('2.201', 'low')), false);
  assert.equal(hasSplit(D, e('2.108')), false);
});

test('dance requirement: two different Group 2 elements, one with the split', () => {
  assert.equal(met([e('2.201', 'mid'), e('2.108')]).dance, true);
  assert.equal(met([e('2.201', 'low'), e('2.108')]).dance, false, 'split too small');
  assert.equal(met([e('2.108'), e('3.101'), e('2.110')]).dance, false, 'no split skill');
  assert.equal(met([e('2.201', 'high'), e('3.101'), e('2.201', 'high')]).dance, false, 'same element twice');
  assert.equal(met([e('2.201', 'high'), e('2.201j', 'high')]).dance, true, 'split leap and split jump differ');
});

test('acro requirement: two acro skills on the beam, one inverted', () => {
  assert.equal(met([e('6.101'), e('6.104')]).acro, false, 'no inverted skill');
  assert.equal(met([e('7.103'), e('3.101'), e('6.101')]).acro, true);
  assert.equal(met([e('1.210'), e('7.103')]).acro, false, 'mount does not count');
  assert.equal(met([e('7.104'), e('9.103')]).acro, false, 'dismount does not count');
  assert.equal(met([e('5.002'), e('6.101')]).acro, false, 'partial handstand is not inverted');
});

test('turn requirement needs a full turn on one foot', () => {
  assert.equal(met([e('3.101')]).turn, true);
  assert.equal(met([e('2.108')]).turn, false);
});

test('a complete Gold routine reaches 10.0', () => {
  // jump to squat mount, full turn, split leap + straight jump, cartwheel + back walkover, round-off dismount
  const r = [e('1.106'), e('3.101'), e('2.201', 'mid'), e('2.108'), e('7.103'), e('7.104'), e('9.103')];
  const sv = startValue(D, r);
  assert.deepEqual(met(r), { turn: true, dance: true, acro: true, dismount: true });
  assert.equal(sv.vp.credited, 7);
  assert.equal(sv.value, 10);
});

test('book example: flic-flac, stop, flic-flac (same connection rule)', () => {
  // Back walkover, BWO, BWO all in the same connection pattern: third earns nothing
  const vp = valueParts(D, [e('7.104'), e('7.104'), e('7.104')]);
  assert.deepEqual(vp.entries.map((x) => x.earns), [true, true, false]);
});

test('store: beam routine normalizes and survives share links', () => {
  const s = normalize({ plan: { events: { beam: { routine: [null, { id: '2.201', split: 'huge' }, { id: '3.101', split: 'high' }] } } } });
  assert.equal(s.plan.events.beam.routine.length, 2);
  assert.equal('split' in s.plan.events.beam.routine[0], false, 'bad split dropped');
  assert.equal(s.plan.events.beam.routine[1].split, 'high');
  const p = defaultState().plan;
  p.events.beam.routine = [e('2.201', 'high'), e('7.103')];
  const back = decodePlan(encodePlan(p));
  assert.equal(back.events.beam.routine[0].split, 'high');
  assert.equal(back.events.beam.routine.length, 2);
});
