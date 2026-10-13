import { VAULT_GOLD as DATA } from '../../data/gold/vault.js';
import {
  findVault, checkRequirements,
} from '../logic/vault.js';
import { SKILL_STATUSES, skillKey } from '../store.js';
import { esc, fmt } from '../ui.js';
import { startValue as svFor } from '../logic/vault.js';
import {
  rulesPanel as sharedRules, wireRules, collapsiblePanel, checklist, filterBar, statusGroup, statusChip, readyBadge, startValueMath,
} from './shared.js';

/** Shown in the plan bar next to the plan name. */
export function headline(plan) {
  return { label: 'Start value', value: fmt(svFor(DATA, plan.events.vault.board)) };
}

const SLOTS = [
  { id: 'vault1', label: 'Vault 1' },
  { id: 'vault2', label: 'Vault 2' },
];

// View-only UI state (not saved): catalog filter.
let filter = 'all';
// null = follow the board choice (open when alternative is picked).
let boardHelpOpen = null;

export function render(root, ctx) {
  const { state, plan, update } = ctx;
  const vp = plan.events.vault;
  const statusOf = (code) => state.skills[skillKey('vault', code)] || null;

  root.innerHTML = `
    <div class="page-head">
      <h1>${esc(DATA.title)}</h1>
    </div>

    ${rulesPanel()}

    <div class="layout">
      <div class="col-main">
        ${requirementsPanel(vp)}
        ${slotsPanel(vp, statusOf)}
      </div>
      <div class="col-side">
        ${catalogPanel(vp, statusOf)}
      </div>
    </div>`;

  wire(root, ctx);
}

// ---------- Sections ----------

function slotsPanel(vp, statusOf) {
  const options = (selected) => `
    <option value="">None</option>
    ${Object.entries(DATA.tiers).map(([tier, t]) => `
      <optgroup label="${esc(t.label)}">
        ${DATA.elements.filter((v) => v.tier === tier).map((v) => `
          <option value="${v.code}"${v.code === selected ? ' selected' : ''}>${esc(v.code)} ${esc(v.name)}</option>`).join('')}
      </optgroup>`).join('')}`;

  return `
    <section class="panel" aria-labelledby="slots-h">
      <div class="panel-head">
        <h2 id="slots-h">Your vaults</h2>
        <p class="muted">You get two tries. The higher score counts, so many gymnasts do the same vault twice.</p>
      </div>
      <div class="slots">
        ${SLOTS.map((s) => {
          const v = findVault(DATA, vp[s.id]);
          const st = v ? statusOf(v.code) : null;
          return `
          <div class="slot${v ? ' is-filled' : ''}">
            <label class="slot-label" for="sel-${s.id}">${s.label}${s.id === 'vault2' ? ' <span class="muted">(optional)</span>' : ''}</label>
            <select id="sel-${s.id}" data-slot="${s.id}">${options(vp[s.id])}</select>
            ${v ? `<p class="slot-desc">${esc(v.desc)}</p>
                   ${statusChip(st)}`
                : '<p class="slot-desc muted">Choose from the list, or tap "Use as V1" or "Use as V2" on any vault below.</p>'}
          </div>`;
        }).join('')}
      </div>
      ${vp.vault1 && !vp.vault2 ? `<button type="button" class="btn btn-ghost" id="same-twice">Do ${esc(findVault(DATA, vp.vault1).name)} for Vault 2 too</button>` : ''}
      <fieldset class="board-toggle">
        <legend>Springboard</legend>
        <label><input type="radio" name="board" value="standard"${vp.board !== 'alternative' ? ' checked' : ''}> Standard board <span class="muted">(10.0)</span></label>
        <label><input type="radio" name="board" value="alternative"${vp.board === 'alternative' ? ' checked' : ''}> Alternative springboard <span class="muted">(9.5)</span></label>
      </fieldset>
      <details class="help" id="board-help"${(boardHelpOpen ?? vp.board === 'alternative') ? ' open' : ''}>
        <summary>What is an alternative springboard?</summary>
        <p>${esc(DATA.boardHelp.summary)}</p>
        <ul>${DATA.boardHelp.points.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
      </details>
    </section>`;
}

function requirementsPanel(vp) {
  const reqs = checkRequirements(DATA, vp);
  const done = reqs.filter((r) => !r.optional).every((r) => r.met);
  return collapsiblePanel({
    id: 'req',
    title: 'Requirements',
    prefKey: 'req-open-vault',
    badge: readyBadge(done, 'Missing a vault'),
    body: `
      ${checklist(reqs)}
      ${startValueMath(DATA.startValue.standard,
        vp.board === 'alternative' ? [{ label: 'Alternative springboard', amount: DATA.startValue.standard - DATA.startValue.alternativeBoard }] : [],
        svFor(DATA, vp.board))}`,
  });
}

function catalogPanel(vp, statusOf) {
  const counts = { all: DATA.elements.length };
  SKILL_STATUSES.forEach((s) => { counts[s.id] = DATA.elements.filter((v) => statusOf(v.code) === s.id).length; });
  const visible = DATA.elements.filter((v) => filter === 'all' || statusOf(v.code) === filter);

  return `
    <section class="panel" aria-labelledby="cat-h">
      <div class="panel-head">
        <h2 id="cat-h">Gold vault list</h2>
        <p class="muted">All ${DATA.elements.length} vaults allowed at Gold. Every one starts from 10.0, so a harder vault earns no extra credit here: pick the one you land cleanest. Grouping is a rough learning order, not official.</p>
      </div>
      ${filterBar(filter, counts, 'Filter vaults')}
      ${Object.entries(DATA.tiers).map(([tier, t]) => {
        const list = visible.filter((v) => v.tier === tier);
        if (!list.length) return '';
        return `
          <h3 class="tier-h">${esc(t.label)} <span class="muted">${esc(t.note)}</span></h3>
          <ul class="cards">${list.map((v) => vaultCard(v, vp, statusOf(v.code))).join('')}</ul>`;
      }).join('') || '<p class="muted empty-filter">No vaults marked with this status yet.</p>'}
    </section>`;
}

function vaultCard(v, vp, status) {
  const inSlot = SLOTS.filter((s) => vp[s.id] === v.code).map((s) => s.label);
  return `
    <li class="card${inSlot.length ? ' is-picked' : ''}">
      <div class="card-top">
        <h4>${esc(v.name)}</h4>
        <span class="code">${esc(v.code)}</span>
        ${inSlot.length ? `<span class="tag tag-accent">In routine: ${inSlot.join(' + ')}</span>` : ''}
      </div>
      <p class="card-desc">${esc(v.desc)}</p>
      ${v.tip ? `<p class="card-tip">${esc(v.tip)}</p>` : ''}
      <div class="card-actions">
        ${statusGroup(v.code, v.name, status)}
        <div class="use-group">
          ${SLOTS.map((s) => `
            <button type="button" id="use-${s.id}-${v.code}" class="btn btn-sm${vp[s.id] === v.code ? ' btn-primary' : ''}" data-use="${s.id}" data-code="${v.code}"
              aria-pressed="${vp[s.id] === v.code}">Use as ${s.label.replace('Vault ', 'V')}</button>`).join('')}
        </div>
      </div>
    </li>`;
}

function rulesPanel() {
  return sharedRules({ title: 'Gold vault rules, quick reference', intro: DATA.tagline, rules: DATA.rules, prefKey: 'rules-open' });
}

// ---------- Events ----------

function wire(root, { plan, update }) {
  const vp = () => plan.events.vault;

  root.querySelectorAll('select[data-slot]').forEach((sel) => sel.addEventListener('change', () => {
    update(() => { vp()[sel.dataset.slot] = sel.value || null; });
  }));

  root.querySelector('#same-twice')?.addEventListener('click', () => update(() => { vp().vault2 = vp().vault1; }));

  root.querySelectorAll('input[name="board"]').forEach((r) => r.addEventListener('change', () => {
    if (r.value === 'alternative') boardHelpOpen = true;
    update(() => { vp().board = r.value; });
  }));

  root.querySelectorAll('[data-use]').forEach((b) => b.addEventListener('click', () => {
    const slot = b.dataset.use;
    update(() => { vp()[slot] = vp()[slot] === b.dataset.code ? null : b.dataset.code; });
  }));

  root.querySelectorAll('[data-status]').forEach((b) => b.addEventListener('click', () => {
    const key = skillKey('vault', b.dataset.code);
    update((s) => {
      if (s.skills[key] === b.dataset.status) delete s.skills[key];
      else s.skills[key] = b.dataset.status;
    });
  }));

  root.querySelectorAll('[data-filter]').forEach((b) => b.addEventListener('click', () => {
    filter = b.dataset.filter;
    update(() => {}, {});
  }));

  const help = root.querySelector('#board-help');
  help?.addEventListener('toggle', () => { boardHelpOpen = help.open; });

  wireRules(root);
}
