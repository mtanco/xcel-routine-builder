import { FLOOR_GOLD as DATA } from '../../data/gold/floor.js';
import {
  findSkill, resolve, startValue, entryValue, splitOption,
} from '../logic/floor.js';
import { skillKey, uid } from '../store.js';
import { statusCounts, filterItems, pickableItems } from '../logic/status.js';
import { esc, fmt } from '../ui.js';
import {
  rulesPanel, wireRules, checklist, filterBar, getFilter, setFilter, emptyFilterText, statusGroup, collapsiblePanel, statusChip, readyBadge, startValueMath,
} from './shared.js';

/** Shown in the plan bar next to the plan name. */
export function headline(plan) {
  return { label: 'Start value', value: fmt(startValue(DATA, plan.events.floor.routine).value) };
}

export function render(root, ctx) {
  const { state, plan } = ctx;
  const routine = plan.events.floor.routine;
  const statusOf = (id) => state.skills[skillKey('floor', id)] || null;
  const sv = startValue(DATA, routine);

  root.innerHTML = `
    <div class="page-head">
      <h1>${esc(DATA.title)}</h1>
    </div>

    ${rulesPanel({ title: 'Gold floor rules, quick reference', intro: DATA.tagline, rules: DATA.rules, prefKey: 'rules-open-floor' })}

    <div class="layout">
      <div class="col-main">
        ${requirementsPanel(sv)}
        ${routinePanel(routine, sv, statusOf)}
      </div>
      <div class="col-side">
        ${catalogPanel(routine, statusOf)}
      </div>
    </div>`;

  wire(root, ctx);
}

// ---------- Your routine ----------

function skillOptions(statusOf) {
  const pickable = pickableItems(DATA.elements, (e) => statusOf(e.id));
  return Object.entries(DATA.families).map(([fam, f]) => {
    const list = pickable.filter((e) => e.family === fam);
    return list.length ? `
    <optgroup label="${esc(f.label)}">
      ${list.map((e) => `
        <option value="${esc(e.id)}">${esc(e.name)} (${e.split && e.value === 'B' ? 'A or B' : e.value})</option>`).join('')}
    </optgroup>` : '';
  }).join('');
}

function tags(skill) {
  const t = [];
  if (skill.fullTurn) t.push('<span class="tag tag-circle">Full turn</span>');
  if (skill.leap) t.push('<span class="tag tag-circle">Leap</span>');
  if (skill.split) t.push('<span class="tag tag-circle">Split</span>');
  if (skill.flight) t.push('<span class="tag tag-support">Flight</span>');
  if (skill.salto) t.push('<span class="tag tag-support">Aerial/salto</span>');
  return t.join('');
}

function routinePanel(routine, sv, statusOf) {
  const vpByUid = Object.fromEntries(sv.vp.entries.map((e) => [e.uid, e]));
  const rows = resolve(DATA, routine);

  return `
    <section class="panel" aria-labelledby="routine-h">
      <div class="panel-head">
        <h2 id="routine-h">Your routine</h2>
        <p class="muted">Add skills in the order you do them. Tick "Connected" when a skill flows from the one before it: the same tumbling pass for acro, or the same dance passage for leaps and jumps (steps or a chassé in between are fine). For split skills, pick the split you usually hit.</p>
      </div>

      ${rows.length ? `
        <ol class="routine">
          ${rows.map((e, i) => {
            const vp = vpByUid[e.uid];
            const value = entryValue(DATA, e, e.skill);
            const opt = e.skill.split ? splitOption(DATA, e) : null;
            return `
            <li class="r-row${vp && !vp.earns ? ' no-credit' : ''}">
              <span class="r-num" aria-hidden="true">${i + 1}</span>
              <div class="r-main">
                <div class="r-title">
                  <span class="value-badge v-${value}">${value}</span>
                  <span class="r-name">${esc(e.skill.name)}</span>
                  ${tags(e.skill)}
                  ${statusChip(statusOf(e.skill.id))}
                </div>
                ${vp && !vp.earns ? `<p class="r-note">No credit: ${esc(vp.reason)}</p>` : ''}
                ${opt ? `<p class="r-hint">${esc(opt.note)}</p>` : ''}
                <div class="r-controls">
                  ${i > 0 ? `
                  <label class="r-conn">
                    <input type="checkbox" id="conn-${e.uid}" data-conn="${e.uid}"${e.connected ? ' checked' : ''}> Connected
                  </label>` : ''}
                  ${opt ? `
                  <div class="seg" role="group" aria-label="Split angle for ${esc(e.skill.name)}">
                    ${DATA.splitOptions.map((o) => `
                      <button type="button" id="split-${e.uid}-${o.id}" class="seg-btn${opt.id === o.id ? ' is-on' : ''}" data-split="${o.id}" data-uid="${e.uid}"
                        aria-pressed="${opt.id === o.id}" title="${esc(o.label)}">${esc(o.short)}</button>`).join('')}
                  </div>` : ''}
                  <span class="r-move">
                    <button type="button" class="btn btn-sm icon-btn" id="up-${e.uid}" data-move="-1" data-uid="${e.uid}" aria-label="Move ${esc(e.skill.name)} up"${i === 0 ? ' disabled' : ''}>↑</button>
                    <button type="button" class="btn btn-sm icon-btn" id="down-${e.uid}" data-move="1" data-uid="${e.uid}" aria-label="Move ${esc(e.skill.name)} down"${i === rows.length - 1 ? ' disabled' : ''}>↓</button>
                    <button type="button" class="btn btn-sm icon-btn" id="rm-${e.uid}" data-remove="${e.uid}" aria-label="Remove ${esc(e.skill.name)}">✕</button>
                  </span>
                </div>
              </div>
            </li>`;
          }).join('')}
        </ol>` : '<p class="muted empty-routine">No skills yet. Add one below, or tap "Add to routine" on any skill in the list.</p>'}

      <div class="add-row">
        <label class="sr-only" for="add-skill">Add a skill</label>
        <select id="add-skill"><option value="">Add a skill…</option>${skillOptions(statusOf)}</select>
        <button type="button" class="btn btn-primary" id="add-btn">Add</button>
      </div>
      ${rows.length ? '<button type="button" class="btn btn-ghost btn-sm" id="clear-routine">Clear routine</button>' : ''}
    </section>`;
}

// ---------- Requirements + start value ----------

function requirementsPanel(sv) {
  const { vp, reqs, items, value } = sv;
  const done = !items.length;
  const dots = Array.from({ length: vp.needed }, (_, i) => `<span class="dot${i < vp.credited ? ' on' : ''}"></span>`).join('');
  return collapsiblePanel({
    id: 'req',
    title: 'Requirements',
    prefKey: 'req-open-floor',
    badge: readyBadge(done, `Start value ${fmt(value)}`),
    body: `
      <div class="vp-meter">
        <span class="vp-label">Value parts</span>
        <span class="dots" aria-hidden="true">${dots}</span>
        <span class="vp-count">${Math.min(vp.credited, vp.needed)} of ${vp.needed}${vp.credited > vp.needed ? ` <span class="muted">(+${vp.credited - vp.needed} extra)</span>` : ''}</span>
      </div>

      <h3 class="sub-h">Special requirements <span class="muted">0.50 each</span></h3>
      ${checklist(reqs)}

      ${startValueMath(DATA.scoring.max, items, value)}`,
  });
}

// ---------- Skill list ----------

function catalogPanel(routine, statusOf) {
  const filter = getFilter('floor');
  const counts = statusCounts(DATA.elements, (e) => statusOf(e.id));
  const visible = filterItems(DATA.elements, (e) => statusOf(e.id), filter);
  const inRoutine = {};
  routine.forEach((r) => { inRoutine[r.id] = (inRoutine[r.id] || 0) + 1; });

  return `
    <section class="panel" aria-labelledby="cat-h">
      <div class="panel-head">
        <h2 id="cat-h">Gold floor skills</h2>
        <p class="muted">A and B skills allowed at Gold, grouped by type. Tags show which skills can fill the pass, dance, and turn requirements. "Check value" means the value is a best guess: confirm it with your coach.</p>
      </div>
      ${filterBar(filter, counts, 'Filter skills')}
      ${Object.entries(DATA.families).map(([fam, f]) => {
        const list = visible.filter((e) => e.family === fam);
        if (!list.length) return '';
        return `
          <h3 class="tier-h">${esc(f.label)} <span class="muted">${esc(f.note)}</span></h3>
          <ul class="cards">${list.map((e) => skillCard(e, statusOf(e.id), inRoutine[e.id] || 0)).join('')}</ul>`;
      }).join('') || `<p class="muted empty-filter">${esc(emptyFilterText(filter))}</p>`}
    </section>`;
}

function skillCard(e, status, count) {
  return `
    <li class="card${count ? ' is-picked' : ''}">
      <div class="card-top">
        <span class="value-badge v-${e.split && e.value === 'B' ? 'AB' : e.value}" ${e.split ? `title="${e.value === 'B' ? 'A below 135° split, B at 135° or more' : 'An A at any split'}"` : ''}>${e.split && e.value === 'B' ? 'A/B' : e.value}</span>
        <h4>${esc(e.name)}</h4>
        ${e.code ? `<span class="code">${esc(e.code)}</span>` : ''}
        ${tags(e)}
        ${e.verify ? '<span class="tag tag-verify" title="Best-guess value: confirm with your coach">check value</span>' : ''}
        ${count ? `<span class="tag tag-accent">In routine${count > 1 ? ` ×${count}` : ''}</span>` : ''}
      </div>
      <p class="card-desc">${esc(e.desc)}</p>
      ${e.tip ? `<p class="card-tip">${esc(e.tip)}</p>` : ''}
      <div class="card-actions">
        ${statusGroup(e.id, e.name, status)}
        <div class="use-group">
          <button type="button" class="btn btn-sm" id="add-${esc(e.id)}" data-add="${esc(e.id)}">Add to routine</button>
        </div>
      </div>
    </li>`;
}

// ---------- Events ----------

function wire(root, { plan, update }) {
  const routine = () => plan.events.floor.routine;
  const find = (id) => routine().findIndex((r) => r.uid === id);

  const add = (id) => {
    const skill = findSkill(DATA, id);
    if (!skill) return;
    update(() => { routine().push({ uid: uid(), id, connected: false, ...(skill.split ? { split: DATA.defaultSplit } : {}) }); });
  };

  root.querySelector('#add-btn')?.addEventListener('click', () => add(root.querySelector('#add-skill').value));
  root.querySelector('#add-skill')?.addEventListener('keydown', (e) => { if (e.key === 'Enter') add(e.target.value); });
  root.querySelectorAll('[data-add]').forEach((b) => b.addEventListener('click', () => add(b.dataset.add)));

  root.querySelectorAll('[data-conn]').forEach((c) => c.addEventListener('change', () => {
    update(() => { routine()[find(c.dataset.conn)].connected = c.checked; });
  }));
  root.querySelectorAll('[data-split]').forEach((b) => b.addEventListener('click', () => {
    update(() => { routine()[find(b.dataset.uid)].split = b.dataset.split; });
  }));
  root.querySelectorAll('[data-move]').forEach((b) => b.addEventListener('click', () => {
    update(() => {
      const r = routine();
      const i = find(b.dataset.uid);
      const j = i + Number(b.dataset.move);
      if (j < 0 || j >= r.length) return;
      [r[i], r[j]] = [r[j], r[i]];
      r[0].connected = false; // the first skill can't be connected to anything
    });
  }));
  root.querySelectorAll('[data-remove]').forEach((b) => b.addEventListener('click', () => {
    update(() => {
      const r = routine();
      r.splice(find(b.dataset.remove), 1);
      if (r[0]) r[0].connected = false;
    });
  }));
  root.querySelector('#clear-routine')?.addEventListener('click', () => {
    if (confirm('Remove every skill from this floor routine?')) update(() => { routine().length = 0; });
  });

  root.querySelectorAll('[data-status]').forEach((b) => b.addEventListener('click', () => {
    const key = skillKey('floor', b.dataset.code);
    update((s) => {
      if (s.skills[key] === b.dataset.status) delete s.skills[key];
      else s.skills[key] = b.dataset.status;
    });
  }));

  root.querySelectorAll('[data-filter]').forEach((b) => b.addEventListener('click', () => {
    setFilter('floor', b.dataset.filter);
    update(() => {});
  }));

  wireRules(root);
}
