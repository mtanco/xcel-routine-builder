import { EVENTS } from '../data/events.js';
import {
  load, save, activePlan, newPlan, encodePlan, decodePlan, normalize,
} from './store.js';
import { esc, toast } from './ui.js';
import * as vaultView from './views/vault.js';
import * as barsView from './views/bars.js';
import * as beamView from './views/beam.js';
import * as floorView from './views/floor.js';

const VIEWS = { vault: vaultView, bars: barsView, beam: beamView, floor: floorView };

let state = load();

const els = {
  tabs: document.getElementById('event-tabs'),
  planBar: document.getElementById('plan-bar'),
  main: document.getElementById('main'),
};

/** Apply a change to state, save it, and optionally re-render. */
function update(mutator, { render: doRender = true } = {}) {
  mutator(state);
  if (!save(state)) toast('Could not save in this browser (private mode?). Use Export to keep a copy.');
  if (doRender) render();
}

function currentRoute() {
  const [path, query = ''] = location.hash.replace(/^#\/?/, '').split('?');
  const id = EVENTS.some((e) => e.id === path) ? path : 'vault';
  return { id, params: new URLSearchParams(query) };
}

// ---------- Tabs ----------
function renderTabs(active) {
  els.tabs.innerHTML = EVENTS.map((e) => `
    <a href="#/${e.id}" class="tab${e.id === active ? ' is-active' : ''}"
       ${e.id === active ? 'aria-current="page"' : ''}>
      <span class="tab-name">${esc(e.name)}</span>
    </a>`).join('');
}

// ---------- Top bar: start value + share / export / import ----------
function renderPlanBar(view) {
  const plan = activePlan(state);
  const head = view?.headline?.(plan);
  els.planBar.innerHTML = `
    ${head ? `
    <div class="plan-field plan-stat" aria-live="polite">
      <span class="eyebrow">${esc(head.label)}</span>
      <span class="plan-stat-value">${esc(head.value)}</span>
    </div>` : ''}
    <div class="plan-actions">
      <button type="button" class="btn" id="plan-share">Share link</button>
      <details class="menu">
        <summary class="btn" aria-label="More actions">More</summary>
        <div class="menu-panel" role="menu">
          <button type="button" role="menuitem" id="plan-export">Export (.json backup)</button>
          <button type="button" role="menuitem" id="plan-import">Import…</button>
          <button type="button" role="menuitem" class="danger" id="plan-reset">Start over</button>
        </div>
      </details>
      <input type="file" id="import-file" accept="application/json,.json" hidden>
    </div>`;

  const $ = (id) => document.getElementById(id);

  $('plan-share').addEventListener('click', async () => {
    const { id } = currentRoute();
    const url = `${location.origin}${location.pathname}#/${id}?plan=${encodePlan(activePlan(state))}`;
    try {
      await navigator.clipboard.writeText(url);
      toast('Link copied. Anyone who opens it can load a copy of your routines.');
    } catch {
      window.prompt('Copy this link:', url);
    }
  });

  $('plan-export').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `xcel-routines-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  });

  $('plan-import').addEventListener('click', () => $('import-file').click());
  $('import-file').addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const incoming = normalize(JSON.parse(await file.text()));
      if (!confirm('Replace your routines and skill statuses with the ones in this file?')) return;
      update((s) => Object.assign(s, incoming));
      toast('Imported');
    } catch {
      toast('That file did not look like an export from this app.');
    }
  });

  $('plan-reset').addEventListener('click', () => {
    if (!confirm('Clear your routines on every event? Your Have / Learning / Goal marks are kept.')) return;
    update((s) => { s.plan = newPlan(); });
    toast('Routines cleared');
  });

  // Close the "More" menu after picking an item or clicking elsewhere.
  const menu = els.planBar.querySelector('.menu');
  menu.querySelectorAll('[role="menuitem"]').forEach((b) => b.addEventListener('click', () => { menu.open = false; }));
}

document.addEventListener('click', (e) => {
  document.querySelectorAll('details.menu[open]').forEach((m) => { if (!m.contains(e.target)) m.open = false; });
});

// ---------- Shared links ----------
function consumeSharedPlan() {
  const { id, params } = currentRoute();
  const encoded = params.get('plan');
  if (!encoded) return;
  const plan = decodePlan(encoded);
  history.replaceState(null, '', `#/${id}`);
  if (!plan) { toast('That share link could not be read.'); return; }
  if (!confirm('Load the routines from this shared link? This replaces your current routines.')) return;
  update((s) => { s.plan = plan; }, { render: false });
  toast('Shared routines loaded');
}

// ---------- Render ----------
function render() {
  try {
    renderInner();
  } catch (err) {
    console.error(err);
    window.__showAppError?.(err);
  }
}

function renderInner() {
  const { id } = currentRoute();
  const event = EVENTS.find((e) => e.id === id);
  document.title = `${event.name} · Xcel Routine Builder`;
  renderTabs(id);
  const view = VIEWS[id];
  renderPlanBar(view);
  const focusedId = document.activeElement?.id;
  view.render(els.main, { state, plan: activePlan(state), event, update });
  // Re-rendering replaces the DOM; put keyboard focus back where it was.
  if (focusedId && focusedId !== 'main') {
    const el = document.getElementById(focusedId);
    if (el && !el.disabled) el.focus({ preventScroll: true });
  }
}

window.addEventListener('hashchange', () => {
  consumeSharedPlan();
  render();
  els.main.focus({ preventScroll: true });
});

consumeSharedPlan();
render();
