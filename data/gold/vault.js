// Xcel Gold: Vault
//
// Facts here are paraphrased (not copied) from the USA Gymnastics Xcel Code of
// Points, Vault section (revised Aug 2026). The vault list and start values were
// checked against the Gold column of the book's vault chart. Numbers in `code` match
// the vault chart so you can look each one up in the official book.
// If you spot a mistake, fix it here: the UI reads everything from this file.

export const VAULT_GOLD = {
  event: 'vault',
  level: 'gold',
  title: 'Vault',
  tagline: 'Two tries, best score counts. Every Gold-allowed vault starts from the same 10.0.',

  startValue: {
    standard: 10.0,
    alternativeBoard: 9.5,
  },

  // Rules every Gold vaulter should know. Shown as a quick-reference list.
  rules: [
    { id: 'two-vaults', text: 'You may perform two vaults. They can be the same vault or two different ones.' },
    { id: 'best-counts', text: 'Each vault is scored separately and the higher score counts.' },
    { id: 'ask-score', text: 'Your coach may ask for your first score before you do your second vault (new for 2026-27).' },
    { id: 'attempts', text: 'You get three run attempts total to finish one or both vaults. No fourth attempt.' },
    { id: 'balk', text: 'One balk is free; any extra balk counts as a void vault. A balk is stopping, falling, or running off the runway, or touching the board or table without getting up onto it.' },
    { id: 'void', text: 'A vault scores 0 (void) if you do not land feet first, you end up sitting, standing, or lying on the table, or you land on your hands on the table without going over it.' },
    { id: 'restricted', text: 'If either vault is not on the Gold list, your whole vault score is 0, even if the other vault was fine.' },
    { id: 'board', text: 'Using an alternative springboard is allowed at Gold, but drops your start value to 9.5.' },
    { id: 'warmup', text: 'At a meet, Gold gets two guaranteed warm-up vaults, plus one run-back and one jump-off from the table.' },
    { id: 'no-roundoff', text: 'Round-off entry (Yurchenko-style) vaults are not on the Gold list.' },
  ],

  // Special requirements, checked live against the current plan.
  // `check` receives { vault1, vault2, board } where vault1/vault2 are element objects (or null).
  requirements: [
    {
      id: 'allowed-vault',
      text: 'At least one Gold-allowed vault planned (minimum: front handspring over the table)',
      check: ({ vault1, vault2 }) => Boolean(vault1 || vault2),
    },
    {
      id: 'second-vault',
      text: 'Second vault planned (optional, but it is a free second chance)',
      optional: true,
      check: ({ vault1, vault2 }) => Boolean(vault1 && vault2),
    },
    {
      id: 'full-sv',
      text: 'Standard springboard, so you start from the full 10.0',
      optional: true,
      check: ({ board }) => board !== 'alternative',
    },
  ],

  // Gold-allowed vaults. `tier` is an unofficial, rough learning order to help you
  // browse; it does NOT change the score (all of these start from 10.0 at Gold).
  elements: [
    {
      code: '1.101', name: 'Front handspring', tier: 'foundation', twist: false,
      desc: 'Hurdle, punch the board, hands on the table, and flip over to land facing away from the table.',
      tip: 'The Gold minimum. Most gymnasts compete this; a clean, high handspring is hard to beat.',
    },
    {
      code: '1.102', name: 'Front handspring, 1/2 turn off', tier: 'variation', twist: true,
      desc: 'A front handspring that adds a half turn after leaving the table, landing facing the table.',
    },
    {
      code: '1.103', name: 'Yamashita', tier: 'variation', twist: false,
      desc: 'A handspring where you pike sharply after leaving the table, then open up before landing.',
    },
    {
      code: '1.104', name: 'Yamashita, 1/2 turn off', tier: 'variation', twist: true,
      desc: 'Yamashita pike, then a half turn before landing facing the table.',
    },
    {
      code: '1.105', name: '1/2 on, 1/2 off', tier: 'variation', twist: true,
      desc: 'Half turn before your hands reach the table, then a half turn off. Also counts: 1/4 turn on, 3/4 turn off.',
    },
    {
      code: '1.106', name: '1/4 to 1/2 on, repulsion off', tier: 'variation', twist: true,
      desc: 'Turn a quarter to a half onto the table, push straight off, and land facing the table.',
    },
    {
      code: '1.108', name: '1/4 on, 1/4 off', tier: 'variation', twist: true,
      desc: 'Quarter turn onto the table and a quarter turn off, landing facing away from the table.',
    },
    {
      code: '1.201', name: 'Front handspring, full turn off', tier: 'advanced', twist: true,
      desc: 'A front handspring with a full twist after the table.',
    },
    {
      code: '1.203', name: 'Yamashita, full turn off', tier: 'advanced', twist: true,
      desc: 'Yamashita pike, then open into a full twist before landing.',
    },
    {
      code: '1.206', name: '1/2 on, full off', tier: 'advanced', twist: true,
      desc: 'Half turn onto the table and a full twist off. Also counts: 1/4 on, 1 1/4 off.',
    },
    {
      code: '1.207', name: 'Full on, handspring or Yamashita off', tier: 'advanced', twist: true,
      desc: 'A full turn before your hands reach the table, then a handspring or Yamashita off.',
    },
    {
      code: '1.208', name: 'Full on, 1/2 off', tier: 'advanced', twist: true,
      desc: 'A full turn onto the table, then a half turn off.',
    },
  ],

  tiers: {
    foundation: { label: 'Foundation', note: 'The Gold minimum' },
    variation: { label: 'Variations', note: 'Pikes and half or quarter turns' },
    advanced: { label: 'Advanced', note: 'Full twists on or off' },
  },

  // Help text for the springboard choice. Paraphrased from the USA Gymnastics
  // Equipment Specifications (Xcel Bronze/Silver/Gold section) and the Xcel code.
  boardHelp: {
    summary: 'An alternative springboard is a vault board that bounces differently: instead of coil springs, it uses an air bladder or a small trampoline bed (often called a "tramp board").',
    points: [
      'It still has to be shaped like a vault board: no more than 15 in (38 cm) tall at the high end and 4 in (10 cm) at the low end.',
      'It must be made by a gymnastics equipment company. A stand-alone mini trampoline does not count.',
      'Gold may use one with a 9.5 start value (0.5 lower). Bronze and Silver use one with no penalty; at Platinum and up it voids the vault.',
      'Meets must provide a regular coil springboard, but not an alternative one. Ask your coach or the meet host before planning on it.',
    ],
  },
};
