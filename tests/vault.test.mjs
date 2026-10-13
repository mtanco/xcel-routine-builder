// Run with: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { VAULT_GOLD as D } from '../data/gold/vault.js';
import {
  startValue, checkRequirements, plannedVaults, meetsRequired, findVault,
} from '../js/logic/vault.js';
import { normalize, encodePlan, decodePlan, defaultState } from '../js/store.js';

test('data: 12 Gold vaults, unique codes, valid tiers, board help present', () => {
  assert.equal(D.elements.length, 12);
  assert.equal(new Set(D.elements.map((v) => v.code)).size, 12);
  D.elements.forEach((v) => assert.ok(D.tiers[v.tier], `${v.code} tier`));
  assert.ok(findVault(D, '1.101'), 'front handspring present');
  assert.ok(D.boardHelp.summary && D.boardHelp.points.length);
});

test('start value: 10.0 standard, 9.5 alternative board', () => {
  assert.equal(startValue(D, 'standard'), 10);
  assert.equal(startValue(D, undefined), 10);
  assert.equal(startValue(D, 'alternative'), 9.5);
});

test('requirements: need at least one vault', () => {
  assert.equal(meetsRequired(D, { vault1: null, vault2: null }), false);
  assert.equal(meetsRequired(D, { vault1: '1.101' }), true);
  assert.equal(meetsRequired(D, { vault2: '1.101' }), true);
  const r = checkRequirements(D, { vault1: '1.101', vault2: '1.101', board: 'alternative' });
  assert.deepEqual(r.map((x) => x.met), [true, true, false]);
});

test('unknown vault code does not count', () => {
  assert.equal(meetsRequired(D, { vault1: '4.101' }), false);
});

test('plannedVaults dedupes the same vault done twice', () => {
  assert.deepEqual(plannedVaults({ vault1: '1.101', vault2: '1.101' }), ['1.101']);
  assert.deepEqual(plannedVaults({ vault1: null, vault2: '1.102' }), ['1.102']);
});

test('store: a single plan; old multi-plan saves keep the open one', () => {
  const fresh = defaultState();
  assert.ok(fresh.plan && fresh.plan.events.vault);
  assert.equal('plans' in fresh, false);

  // A save from earlier versions (several plans, plan types, estimator deductions) still loads.
  const s = normalize({
    activePlanId: 'b',
    plans: [
      { id: 'a', name: 'Meet', kind: 'meet', events: { vault: { vault1: '1.102' } } },
      { id: 'b', name: 'Stretch', kind: 'stretch', events: { vault: { vault1: '1.101', ded: { '1.101': { steps: 2 } } } } },
    ],
    skills: { 'vault:1.101': 'have' },
  });
  assert.equal(s.plan.events.vault.vault1, '1.101');
  assert.equal(s.plan.events.vault.board, 'standard');
  assert.equal('ded' in s.plan.events.vault, false);
  assert.equal(s.skills['vault:1.101'], 'have');
  assert.equal(normalize(null).plan.events.vault.vault1, null);
});

test('store: share links round-trip', () => {
  const p = defaultState().plan;
  p.events.vault.vault1 = '1.101';
  p.events.vault.board = 'alternative';
  const back = decodePlan(encodePlan(p));
  assert.equal(back.events.vault.vault1, '1.101');
  assert.equal(back.events.vault.board, 'alternative');
  assert.equal(decodePlan('not-valid!!'), null);
});
