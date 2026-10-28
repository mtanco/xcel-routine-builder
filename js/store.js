// App state + persistence. Everything lives in this browser's localStorage.
// No accounts, no server: use Export / Import or a share link to move your plan around.

const KEY = 'xcel-routine-builder:v1';
const VERSION = 2;

export const SKILL_STATUSES = [
  { id: 'have', label: 'Have it', short: 'Have' },
  { id: 'learning', label: 'Learning', short: 'Learning' },
  { id: 'goal', label: 'Goal', short: 'Goal' },
  // Hidden from the default skill list and the "Add a skill" dropdowns.
  { id: 'uninterested', label: 'Uninterested', short: 'Uninterested' },
];

export const uid = () => Math.random().toString(36).slice(2, 9);

export function emptyEvents() {
  return {
    vault: { vault1: null, vault2: null, board: 'standard' },
    bars: { routine: [] },
    beam: { routine: [] },
    floor: { routine: [] },
  };
}

export function newPlan() {
  return { events: emptyEvents() };
}

export function defaultState() {
  return { version: VERSION, plan: newPlan(), skills: {} };
}

/** Clean up one plan's events so older or hand-edited data still loads. */
function normalizePlan(p) {
  const events = { ...emptyEvents(), ...(p?.events || {}) };
  const { vault1, vault2, board } = { ...emptyEvents().vault, ...(events.vault || {}) };
  events.vault = { vault1, vault2, board };
  const routine = Array.isArray(events.bars?.routine) ? events.bars.routine : [];
  events.bars = {
    routine: routine
      .filter((e) => e && typeof e.id === 'string')
      .map((e) => ({ uid: e.uid || uid(), id: e.id, bar: e.bar === 'high' ? 'high' : 'low', connected: Boolean(e.connected) })),
  };
  const beam = Array.isArray(events.beam?.routine) ? events.beam.routine : [];
  events.beam = {
    routine: beam
      .filter((e) => e && typeof e.id === 'string')
      .map((e) => {
        const out = { uid: e.uid || uid(), id: e.id };
        if (['low', 'mid', 'high'].includes(e.split)) out.split = e.split;
        return out;
      }),
  };
  const floor = Array.isArray(events.floor?.routine) ? events.floor.routine : [];
  events.floor = {
    routine: floor
      .filter((e) => e && typeof e.id === 'string')
      .map((e) => {
        const out = { uid: e.uid || uid(), id: e.id, connected: Boolean(e.connected) };
        if (['low', 'mid', 'high'].includes(e.split)) out.split = e.split;
        return out;
      }),
  };
  return { events };
}

/** Fill in anything missing. Older saves with several plans keep the one that was open. */
export function normalize(raw) {
  if (!raw || typeof raw !== 'object') return defaultState();
  let source = raw.plan;
  if (!source && Array.isArray(raw.plans) && raw.plans.length) {
    source = raw.plans.find((p) => p && p.id === raw.activePlanId) || raw.plans[0];
  }
  if (!source) return defaultState();
  return { version: VERSION, plan: normalizePlan(source), skills: { ...(raw.skills || {}) } };
}

export function load() {
  try {
    const txt = localStorage.getItem(KEY);
    return normalize(txt ? JSON.parse(txt) : null);
  } catch {
    return defaultState();
  }
}

export function save(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function activePlan(state) {
  return state.plan;
}

export function skillKey(event, code) {
  return `${event}:${code}`;
}

// ---- Share links: one plan, encoded into the URL hash ----

function toBase64Url(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  bytes.forEach((b) => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(s) {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodePlan(plan) {
  return toBase64Url(JSON.stringify({ events: plan.events }));
}

export function decodePlan(s) {
  try {
    const p = JSON.parse(fromBase64Url(s));
    if (!p || typeof p !== 'object' || !p.events) return null;
    return normalizePlan(p);
  } catch {
    return null;
  }
}
