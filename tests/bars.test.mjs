// Run with: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BARS_GOLD as D } from '../data/gold/bars.js';
import { valueParts, checkRequirements, startValue, findSkill } from '../js/logic/bars.js';
import { normalize, encodePlan, decodePlan, defaultState } from '../js/store.js';

let n = 0;
const e = (id, bar, connected = false) => ({ uid: `u${n++}`, id, bar: bar || findSkill(D, id).bar, connected });
const met = (routine) => Object.fromEntries(checkRequirements(D, routine).map((r) => [r.id, r.met]));

test('data: unique ids, valid families, only A/B values', () => {
  assert.equal(new Set(D.elements.map((x) => x.id)).size, D.elements.length);
  D.elements.forEach((x) => {
    assert.ok(D.families[x.family], `${x.id} family`);
    assert.ok(['A', 'B'].includes(x.value), `${x.id} value`);
    assert.ok(['low', 'high'].includes(x.bar), `${x.id} bar`);
  });
  assert.ok(D.elements.some((x) => x.dismount), 'has dismounts');
});

test('empty routine: 10 - 0.60 VP - 2.00 SR - 0.30 no dismount = 7.10', () => {
  const sv = startValue(D, []);
  assert.equal(sv.value, 7.1);
  assert.equal(sv.items.length, 3);
});

test('typical Gold routine reaches 10.0', () => {
  // pullover, cast, back hip circle, back hip circle (connected), cast squat on, long hang kip, tap, flyaway
  const r = [e('1.003a'), e('2.001'), e('7.101'), e('7.101', 'low', true), e('2.102'), e('lh-kip'), e('tap'), e('fly-tuck')];
  assert.deepEqual(met(r), { 'clear-support': true, 'circle-1': true, 'circle-2': true, dismount: true });
  const sv = startValue(D, r);
  assert.equal(sv.vp.credited, 8);
  assert.equal(sv.value, 10);
});

test('same circle twice: needs direct connection or other bar', () => {
  // cast, BHC, cast, BHC  -> not connected (cast between)
  assert.equal(met([e('2.001'), e('7.101'), e('2.001'), e('7.101', 'low', true)])['circle-2'], false);
  // adjacent but not marked connected
  assert.equal(met([e('7.101'), e('7.101')])['circle-2'], false);
  // adjacent and connected
  assert.equal(met([e('7.101'), e('7.101', 'low', true)])['circle-2'], true);
  // one on each bar
  assert.equal(met([e('7.101', 'low'), e('lh-kip'), e('7.101', 'high')])['circle-2'], true);
  // two different circles
  assert.equal(met([e('front-hip'), e('2.001'), e('7.101')])['circle-2'], true);
});

test('mounts and dismounts do not fill circling or clear support', () => {
  const m = met([e('1.003a'), e('8.009')]);
  assert.equal(m['circle-1'], false);
  assert.equal(m['clear-support'], false);
  assert.equal(m['dismount'], true);
});

test('dismount must be from the high bar', () => {
  const r = [e('fly-tuck', 'low')];
  assert.equal(met(r).dismount, false);
  const sv = startValue(D, r);
  assert.ok(!sv.items.some((i) => i.id === 'nodis'), 'has a dismount, so no extra 0.30');
});

test('repeats: twice in different connections, never three times', () => {
  // tap swings and underswings are the same element (#2.003)
  const vp = valueParts(D, [e('tap'), e('lh-kip'), e('underswing'), e('2.001'), e('tap')]);
  assert.deepEqual(vp.entries.map((x) => x.earns), [true, true, true, true, false]);
});

test('repeats: book example, exact same connection earns nothing', () => {
  // Pullover, Cast, BHC, Cast, BHC (same connection: no VP), Cast (no VP), BHC (A), Underswing dismount
  const r = [e('1.003a'), e('2.001'), e('7.101'), e('2.001'), e('7.101'), e('2.001'), e('7.101'), e('8.101')];
  const vp = valueParts(D, r);
  assert.deepEqual(vp.entries.map((x) => x.earns), [true, true, true, true, false, false, true, true]);
  assert.equal(vp.credited, 6);
});

test('book Gold example routines', () => {
  // Example 2: pullover, cast, clear hip (B), glide kip, cast squat on, long hang pullover, flyaway = 10.0
  const ex2 = [e('1.003a'), e('2.001'), e('3.204'), e('kip'), e('2.102'), e('7.005'), e('fly-tuck')];
  assert.equal(startValue(D, ex2).value, 10);
  // Not met #3: glide kip, cast squat, long hang kip, back hip circle, flyaway (short casts are not elements)
  const bad3 = [e('1.101m'), e('2.102'), e('lh-kip'), e('7.101'), e('fly-tuck')];
  assert.equal(startValue(D, bad3).value, 8.9);
});

test('front and back hip circle count as different circles', () => {
  assert.equal(met([e('front-hip'), e('2.001'), e('7.101')])['circle-2'], true);
  assert.equal(met([e('7.004f'), e('2.001'), e('7.004b')])['circle-2'], true);
});

test('unknown ids are ignored', () => {
  assert.equal(valueParts(D, [{ uid: 'x', id: 'giant', bar: 'high' }]).credited, 0);
});

test('store: bars routine normalizes and survives share links', () => {
  const s = normalize({ plan: { events: { vault: {} } } });
  assert.deepEqual(s.plan.events.bars, { routine: [] });
  const bad = normalize({ plan: { events: { bars: { routine: [null, { id: '7.101', bar: 'top' }, { nope: 1 }] } } } });
  assert.equal(bad.plan.events.bars.routine.length, 1);
  assert.equal(bad.plan.events.bars.routine[0].bar, 'low');

  const p = defaultState().plan;
  p.events.bars.routine = [e('7.101'), e('7.101', 'low', true)];
  const back = decodePlan(encodePlan(p));
  assert.equal(back.events.bars.routine.length, 2);
  assert.equal(back.events.bars.routine[1].connected, true);
});

test('renamed ids all point at real skills', () => {
  Object.entries(D.renamed).forEach(([oldId, newId]) => {
    if (newId !== null) assert.ok(findSkill(D, newId), `${oldId} -> ${newId}`);
    assert.equal(findSkill(D, oldId), null, `${oldId} should no longer exist`);
  });
});

test('book-confirmed details', () => {
  assert.equal(findSkill(D, '3.204').value, 'B');           // clear hip is always B at Gold
  assert.ok(findSkill(D, '7.005').circling);                 // long hang pullover counts as circling at Gold
  assert.ok(findSkill(D, '7.004f').circling);               // stride circles count as circling (book examples)
  assert.ok(findSkill(D, '3.207').circling && findSkill(D, '3.207').clearSupport); // Weiler kip
  assert.equal(findSkill(D, 'cast-off'), null);              // cast off to stand is Bronze only
});
