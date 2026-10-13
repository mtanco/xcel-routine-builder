// Pure vault logic: no DOM, no storage. Covered by tests/vault.test.mjs.

export function findVault(data, code) {
  if (!code) return null;
  return data.elements.find((v) => v.code === code) || null;
}

export function startValue(data, board) {
  return board === 'alternative' ? data.startValue.alternativeBoard : data.startValue.standard;
}

/** Returns each requirement with a `met` flag for the given vault plan. */
export function checkRequirements(data, plan) {
  const ctx = {
    vault1: findVault(data, plan?.vault1),
    vault2: findVault(data, plan?.vault2),
    board: plan?.board || 'standard',
  };
  return data.requirements.map((r) => ({
    id: r.id,
    text: r.text,
    optional: Boolean(r.optional),
    met: Boolean(r.check(ctx)),
  }));
}

/** True when every non-optional requirement is met. */
export function meetsRequired(data, plan) {
  return checkRequirements(data, plan).every((r) => r.optional || r.met);
}

/** Distinct vault codes in the plan, in slot order. */
export function plannedVaults(plan) {
  return [...new Set([plan?.vault1, plan?.vault2].filter(Boolean))];
}
