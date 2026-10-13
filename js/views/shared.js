// Pieces shared by the event pages.
import { SKILL_STATUSES } from '../store.js';
import { esc, fmt } from '../ui.js';

// ---- Per-viewer UI preferences. Storage can be unavailable (private mode), so never throw.
const PREF = 'xcel-routine-builder:ui:';
export function prefGet(k) { try { return localStorage.getItem(PREF + k); } catch { return null; } }
export function prefSet(k, v) { try { localStorage.setItem(PREF + k, v); } catch { /* ignore */ } }

/** Collapsible rules quick reference. Starts open; remembers if the viewer collapses it. */
export function rulesPanel({ title, intro, rules, prefKey }) {
  const open = prefGet(prefKey) !== '0';
  return `
    <details class="panel rules" id="rules" data-pref="${esc(prefKey)}"${open ? ' open' : ''}>
      <summary><h2>${esc(title)}</h2></summary>
      <p class="rules-intro">${esc(intro)}</p>
      <ul class="rule-list">${rules.map((r) => `<li>${esc(r.text)}</li>`).join('')}</ul>
    </details>`;
}

/** Remember open/closed for every collapsible panel on the page (rules, requirements). */
export function wireRules(root) {
  root.querySelectorAll('details[data-pref]').forEach((d) => {
    d.addEventListener('toggle', () => prefSet(d.dataset.pref, d.open ? '1' : '0'));
  });
}

/** A collapsible panel whose header (title + status badge) stays visible when closed. Starts open. */
export function collapsiblePanel({ id, title, badge = '', body, prefKey }) {
  const open = prefGet(prefKey) !== '0';
  return `
    <details class="panel collapsible" id="${esc(id)}" data-pref="${esc(prefKey)}" aria-labelledby="${esc(id)}-h"${open ? ' open' : ''}>
      <summary class="panel-head row">
        <h2 id="${esc(id)}-h">${esc(title)}</h2>
        ${badge}
      </summary>
      <div class="collapsible-body">${body}</div>
    </details>`;
}

/** Requirement checklist rows. reqs: [{ text, met, optional? }] */
export function checklist(reqs) {
  return `
    <ul class="checklist">
      ${reqs.map((r) => `
        <li class="${r.met ? 'met' : ''} ${r.optional ? 'optional' : ''}">
          <span class="check" aria-hidden="true">${r.met ? '✓' : ''}</span>
          <span>${esc(r.text)}${r.optional ? ' <span class="tag">nice to have</span>' : ''}</span>
          <span class="sr-only">${r.met ? 'done' : 'not done'}</span>
        </li>`).join('')}
    </ul>`;
}

/** All / Have / Learning / Goal filter chips. */
export function filterBar(active, counts, label) {
  return `
    <div class="filters" role="group" aria-label="${esc(label)}">
      ${[{ id: 'all', short: 'All' }, ...SKILL_STATUSES].map((f) => `
        <button type="button" id="filter-${f.id}" class="filter${active === f.id ? ' is-active' : ''}" data-filter="${f.id}" aria-pressed="${active === f.id}">
          ${esc(f.short)} <span class="count">${counts[f.id] ?? 0}</span>
        </button>`).join('')}
    </div>`;
}

/** Have / Learning / Goal toggle buttons for one skill. */
export function statusGroup(id, name, status) {
  return `
    <div class="status-group" role="group" aria-label="My status for ${esc(name)}">
      ${SKILL_STATUSES.map((s) => `
        <button type="button" id="st-${esc(id)}-${s.id}" class="status-btn status-${s.id}${status === s.id ? ' is-on' : ''}"
          data-status="${s.id}" data-code="${esc(id)}" aria-pressed="${status === s.id}">${esc(s.short)}</button>`).join('')}
    </div>`;
}

/** Read-only Have / Learning / Goal chip, shown next to skills in your routine. */
export function statusChip(status) {
  const s = SKILL_STATUSES.find((x) => x.id === status);
  return s
    ? `<span class="chip chip-${s.id}">${esc(s.label)}</span>`
    : '<span class="chip chip-none" title="Set it in the skill list">Status not set</span>';
}

/** "Ready to compete" when everything is met, otherwise the given text. */
export function readyBadge(done, notDoneText) {
  return `<span class="status-badge ${done ? 'ok' : 'todo'}">${done ? 'Ready to compete' : esc(notDoneText)}</span>`;
}

/** Start value breakdown: full value, each deduction, and the result. items: [{ label, amount }] */
export function startValueMath(max, items, value) {
  return `
    <div class="sv-math">
      <div class="sv-line"><span>Full start value</span><span>${fmt(max)}</span></div>
      ${items.map((i) => `<div class="sv-line minus"><span>${esc(i.label)}</span><span>−${fmt(i.amount)}</span></div>`).join('')}
      <div class="sv-line total"><span>Your start value</span><span>${fmt(value)}</span></div>
    </div>`;
}
