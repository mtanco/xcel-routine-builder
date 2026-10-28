// Run with: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  HIDDEN_STATUS, FILTER_IDS, normalizeFilter, matchesFilter, statusCounts, filterItems, pickableItems,
} from '../js/logic/status.js';
import { SKILL_STATUSES, normalize, skillKey } from '../js/store.js';
import { BARS_GOLD } from '../data/gold/bars.js';
import { VAULT_GOLD } from '../data/gold/vault.js';

const items = [
  { id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }, { id: 'e' }, { id: 'f' },
];
const statuses = { a: 'have', b: 'learning', c: 'goal', d: 'uninterested', e: 'uninterested' }; // f: none
const statusOf = (x) => statuses[x.id] || null;
const ids = (list) => list.map((x) => x.id).join('');

test('Uninterested is a skill status, and every status has a filter chip', () => {
  assert.ok(SKILL_STATUSES.some((s) => s.id === HIDDEN_STATUS));
  SKILL_STATUSES.forEach((s) => assert.ok(FILTER_IDS.includes(s.id), s.id));
  assert.deepEqual(FILTER_IDS, ['all', 'have', 'learning', 'goal', 'uninterested', 'none']);
});

test('"All" hides Uninterested skills; the Uninterested filter shows only them', () => {
  assert.equal(ids(filterItems(items, statusOf, 'all')), 'abcf');
  assert.equal(ids(filterItems(items, statusOf, 'uninterested')), 'de');
  assert.equal(ids(filterItems(items, statusOf, 'have')), 'a');
  assert.equal(ids(filterItems(items, statusOf, 'learning')), 'b');
  assert.equal(ids(filterItems(items, statusOf, 'goal')), 'c');
  assert.equal(ids(filterItems(items, statusOf, 'none')), 'f');
});

test('counts match what each filter shows', () => {
  const counts = statusCounts(items, statusOf);
  assert.deepEqual(counts, { all: 4, have: 1, learning: 1, goal: 1, uninterested: 2, none: 1 });
  FILTER_IDS.forEach((f) => assert.equal(counts[f], filterItems(items, statusOf, f).length, f));
});

test('unknown or missing saved filters fall back to "all"', () => {
  assert.equal(normalizeFilter(null), 'all');
  assert.equal(normalizeFilter('bogus'), 'all');
  assert.equal(normalizeFilter('none'), 'none');
  assert.equal(ids(filterItems(items, statusOf, 'bogus')), 'abcf');
  assert.equal(matchesFilter(null, 'all'), true);
});

test('dropdowns leave out Uninterested skills', () => {
  assert.equal(ids(pickableItems(items, statusOf)), 'abcf');
  // with real bar data
  const [first, second] = BARS_GOLD.elements;
  const skills = { [skillKey('bars', first.id)]: 'uninterested', [skillKey('bars', second.id)]: 'goal' };
  const of = (e) => skills[skillKey('bars', e.id)] || null;
  const pick = pickableItems(BARS_GOLD.elements, of);
  assert.equal(pick.length, BARS_GOLD.elements.length - 1);
  assert.ok(!pick.includes(first));
  assert.ok(pick.includes(second));
});

test('vault select keeps an Uninterested vault that is already chosen', () => {
  const v = VAULT_GOLD.elements[0];
  const of = (x) => (x.code === v.code ? 'uninterested' : null);
  assert.ok(!pickableItems(VAULT_GOLD.elements, of).includes(v));
  assert.ok(pickableItems(VAULT_GOLD.elements, of, (x) => x.code === v.code).includes(v));
});

test('saves with Uninterested load as-is (no migration needed)', () => {
  const raw = { plan: { events: {} }, skills: { 'bars:x': 'uninterested', 'beam:y': 'have' } };
  assert.deepEqual(normalize(raw).skills, raw.skills);
});
