// Xcel Gold: Balance Beam
//
// Paraphrased from the USA Gymnastics Xcel Code of Points, Balance Beam (revision
// packets Aug 2023 and Aug 2026): Beam rules chart, Chapter 1-2, the "Additional A
// Elements" chart, and element pages for Groups 1, 2, 4 and 9. Skills with a `code`
// match the book. The packets skip some element pages, so a few common skills are
// marked `verify: true`.
//
// Skill fields:
//   family     mount | leap | turn | wave | hold | acro | dismount
//   value      'A' or 'B'
//   split      leap/jump with a cross or side split: value and the split part of the
//              dance requirement depend on the split angle chosen in the routine
//   fullTurn   a turn of at least 1/1 on one foot (turn requirement)
//   acro       counts as an acro element (acro requirement)
//   inverted   achieves or passes through inverted vertical (hips over shoulders)
//   vpKey      groups skills the book treats as the same element (defaults to code, then id)

export const BEAM_GOLD = {
  event: 'beam',
  level: 'gold',
  title: 'Beam',
  tagline: 'Six A skills and four special requirements in a routine of up to 1:00.',

  scoring: {
    max: 10.0,
    vpNeeded: 6,
    vpEach: 0.10,
    srEach: 0.50,
    noDismount: 0.30,
    maxRepeats: 2,
  },

  // Split angle choices for leaps and jumps with a cross or side split (Gold needs 120°).
  splitOptions: [
    { id: 'low', label: 'Under 100°', short: '<100°', value: 'A', splitOk: false,
      note: 'Too far from 120°: counts as an A, but not as the split leap or jump' },
    { id: 'mid', label: '100° to 134°', short: '100–134°', value: 'A', splitOk: true,
      note: 'Within 20° of 120°: counts for the split requirement as an A (up to 0.20 off for split)' },
    { id: 'high', label: '135° or more', short: '135°+', value: 'B', splitOk: true,
      note: '135° or more earns the full B value' },
  ],
  defaultSplit: 'mid',

  rules: [
    { id: 'vp', text: 'You need at least 6 value parts. Any A or B skill counts; each missing one takes 0.10 off your start value.' },
    { id: 'sr', text: 'There are 4 special requirements worth 0.50 each (see the checklist).' },
    { id: 'restricted', text: 'Not allowed at Gold (0.50 off each time, and no credit): any C or harder skill. A restricted dismount also costs 0.30 for no dismount.' },
    { id: 'split', text: 'Leaps and jumps with a cross or side split need 120° at Gold. Within 20° (100° or more) still counts, with up to 0.20 off. A split leap, split jump, straddle jump, or sissonne needs 135° or more to be a B; below that it is an A.' },
    { id: 'acro', text: 'Acro skills must start and finish on the beam to count for the acro requirement, so acro mounts and dismounts do not count toward it.' },
    { id: 'vertical', text: 'Inverted vertical means hips over shoulders: a handstand, headstand, cartwheel, or back walkover all qualify, with no hold needed. A partial handstand does not.' },
    { id: 'repeat', text: 'Any skill can earn credit twice, as long as the second time comes before or after a different skill. A third time, or a repeat in the exact same connection, earns nothing and cannot fill a requirement.' },
    { id: 'turns', text: 'If a full turn is short by 90° or more, it only gets credit for the smaller turn it reached. A turn is finished when your heel drops.' },
    { id: 'jump-dismount', text: 'Simple jump dismounts are only valued at Bronze and Silver. At Gold, pick a dismount from the list.' },
    { id: 'walkovers', text: 'Walkovers should show the 120° split at some point, or lose up to 0.20.' },
    { id: 'mounts', text: 'Any mount not listed in the book is an A.' },
    { id: 'timing', text: 'Routine time limit is 1:00 (no minimum), with 1:00 of warm-up. After a fall you have 45 seconds from standing up to get back on.' },
  ],

  families: {
    mount: { label: 'Mounts', note: 'Value parts only; acro mounts do not count for the acro requirement' },
    leap: { label: 'Leaps, jumps, and hops', note: 'Group 2: the dance requirement needs two different ones' },
    turn: { label: 'Turns', note: 'Gold needs at least a full turn on one foot' },
    wave: { label: 'Body waves', note: 'Dance value parts' },
    hold: { label: 'Holds', note: 'Value parts only' },
    acro: { label: 'Acro', note: 'Handstands, rolls, walkovers, cartwheels, handsprings' },
    dismount: { label: 'Dismounts', note: 'Required; a fall without landing feet first gets no credit' },
  },

  elements: [
    // ---- Mounts (all mounts are A unless the book lists another value)
    { id: 'm-other', name: 'Other mount (front support, step-on, etc.)', value: 'A', family: 'mount',
      desc: 'Any mount not listed in the book is valued as an A.' },
    { id: '1.104', code: '1.104', name: 'Jump to straddle stand or split sit', value: 'A', family: 'mount',
      desc: 'From the side, jump (with or without hands) to a straddle stand or split sit.' },
    { id: '1.105', code: '1.105', name: 'Leap to cross split sit', value: 'A', family: 'mount',
      desc: 'From a diagonal approach, leap from one foot to a cross split sit.' },
    { id: '1.106', code: '1.106', name: 'Jump to squat or stoop through', value: 'A', family: 'mount',
      desc: 'From the side, jump to a tuck stand, or squat or stoop through to rear support.' },
    { id: '1.109', code: '1.109', name: 'Back hip pullover mount', value: 'A', family: 'mount',
      desc: 'Facing the beam, take off from one or two feet (or a knee or seat) and pull over to front support.' },
    { id: '1.204', code: '1.204', name: 'Jump with 1/2 turn to clear straddle support', value: 'B', family: 'mount',
      desc: 'From a 90° approach, jump with a half turn to a clear straddle support.' },
    { id: '1.210', code: '1.210', name: 'Press to handstand mount', value: 'B', family: 'mount',
      desc: 'Jump or press to a side or cross handstand, then lower to touch the beam or to a clear support.' },

    // ---- Leaps, jumps, and hops (Group 2)
    { id: '2.108', code: '2.108', name: 'Straight jump', value: 'A', family: 'leap',
      desc: 'Stretched jump, with or without arch or a change or beat of legs (all the same element).' },
    { id: '2.110', code: '2.110', name: 'Tuck jump', value: 'A', family: 'leap',
      desc: 'Knees at horizontal or above, with about 90° at the hips and knees.' },
    { id: '2.111', code: '2.111', name: 'Wolf jump or hop', value: 'A', family: 'leap',
      desc: 'One leg extended and the other bent, both thighs at or above horizontal, knees together.' },
    { id: '2.101', code: '2.101', name: 'Stag leap', value: 'A', family: 'leap',
      desc: 'Stag or stag-split leap forward from one foot. Also with a 1/4 turn.' },
    { id: '2.105', code: '2.105', name: 'Stag leap with leg change', value: 'A', family: 'leap',
      desc: 'Stag leap forward with a change of legs. Also a stride leap with leg change to wolf position.' },
    { id: '2.201', code: '2.201', name: 'Split leap', value: 'B', family: 'leap', split: true, vpKey: '2.201-leap',
      desc: 'Split leap forward from one foot. Value depends on your split.' },
    { id: '2.201j', code: '2.201', name: 'Split jump', value: 'B', family: 'leap', split: true, vpKey: '2.201-jump',
      desc: 'Split jump in place, from two feet to two feet. Counts as different from a split leap.' },
    { id: '2.202', code: '2.202', name: 'Straddle jump (cross)', value: 'B', family: 'leap', split: true,
      desc: 'Straddle-pike or side-split jump facing the end of the beam. Value depends on your split.' },
    { id: '2.207', code: '2.207', name: 'Sissonne', value: 'B', family: 'leap', split: true,
      desc: 'Take off from two feet, land on one, legs on a diagonal with the front leg at least 45° down from the beam. Raised to a B for 2026-27 (with enough split).' },
    { id: '2.206', code: '2.206', name: 'Pike jump (cross)', value: 'B', family: 'leap',
      desc: 'Pike jump facing the end of the beam, closing to at least 90° at the hips.' },

    // ---- Turns (Group 3)
    { id: '3.101', code: '3.101', name: 'Full turn on one foot', value: 'A', family: 'turn', fullTurn: true,
      desc: '1/1 (360°) turn on one foot, free leg in any position below horizontal.' },
    { id: '3.203', code: '3.203', name: 'Full turn, free leg at horizontal', value: 'B', family: 'turn', fullTurn: true,
      desc: '1/1 turn with the free leg held at horizontal or higher.' },
    { id: '3.206', code: '3.206', name: 'Full turn in tuck stand', value: 'B', family: 'turn', fullTurn: true,
      desc: '1/1 turn in a tuck stand on one foot. Finished when the free leg touches the beam.' },
    { id: '3.201', code: '3.201', name: '1 1/2 turn on one foot', value: 'B', family: 'turn', fullTurn: true,
      desc: '540° turn on one foot.' },

    // ---- Body waves (Group 4, dance value parts)
    { id: '4.101', code: '4.101', name: 'Body wave to balance stand (both legs)', value: 'A', family: 'wave',
      desc: 'Body wave forward, backward, or sideward to a 2-second balance stand on both feet.' },
    { id: '4.201', code: '4.201', name: 'Body wave to balance stand (one leg)', value: 'B', family: 'wave',
      desc: 'Body wave forward or backward to a 2-second balance stand on one foot.' },

    // ---- Holds
    { id: '5.101', code: '5.101', name: 'Scale', value: 'A', family: 'hold',
      desc: 'Scale held for 2 seconds. Not an acro element.' },

    // ---- Acro (Groups 5-7)
    { id: '5.002', code: '5.002', name: 'Partial handstand', value: 'A', family: 'acro', acro: true,
      desc: 'Kick toward handstand with feet together, at least 45° from vertical. Does not reach inverted vertical.' },
    { id: '5.106a', code: '5.106a', name: 'Cross handstand', value: 'A', family: 'acro', acro: true, inverted: true,
      desc: 'Handstand facing the end of the beam, within 10° of vertical. No hold needed for A credit.' },
    { id: '5.106b', code: '5.106b', name: 'Side handstand', value: 'A', family: 'acro', acro: true, inverted: true,
      desc: 'Handstand facing sideways on the beam. Counts as a different element from a cross handstand.' },
    { id: '5.107', code: '5.107', name: 'Headstand', value: 'A', family: 'acro', acro: true, inverted: true,
      desc: 'Headstand with legs together or straddled. No hold needed.' },
    { id: '6.101', code: '6.101', name: 'Forward roll', value: 'A', family: 'acro', acro: true,
      desc: 'Forward roll on the beam.' },
    { id: '6.104', code: '6.104', name: 'Backward shoulder roll', value: 'A', family: 'acro', acro: true,
      desc: 'Backward roll over one shoulder.' },
    { id: '6.203', code: '6.203', name: 'Handstand forward roll', value: 'B', family: 'acro', acro: true, inverted: true,
      desc: 'Kick to handstand and roll forward out of it.' },
    { id: '6.202', code: '6.202', name: 'Free forward roll', value: 'B', family: 'acro', acro: true,
      desc: 'Forward roll without hands, stepping out.' },
    { id: '6.204', code: '6.204', name: 'Back extension roll', value: 'B', family: 'acro', acro: true, inverted: true,
      desc: 'Backward roll pushing up through handstand, stepping out.' },
    { id: '7.103', code: '7.103', name: 'Cartwheel', value: 'A', family: 'acro', acro: true, inverted: true,
      desc: 'Cartwheel on the beam, any entrance or exit. Passes through vertical.' },
    { id: '7.104', code: '7.104', name: 'Back walkover', value: 'A', family: 'acro', acro: true, inverted: true,
      desc: 'Back walkover, step-out or to a kneel. Show a 120° split during it.' },
    { id: 'front-walkover', name: 'Front walkover', value: 'A', family: 'acro', acro: true, inverted: true, verify: true,
      desc: 'Front walkover on the beam. Show a 120° split during it.' },
    { id: '7.203', code: '7.203', name: 'Round-off (on the beam)', value: 'B', family: 'acro', acro: true, inverted: true,
      desc: 'Round-off that lands on the beam (not as a dismount).' },
    { id: '7.202', code: '7.202', name: 'Front handspring', value: 'B', family: 'acro', acro: true, inverted: true,
      desc: 'Front handspring on the beam. Step-out and landing on two feet count as different elements.' },
    { id: '7.206', code: '7.206', name: 'Valdez', value: 'B', family: 'acro', acro: true, inverted: true,
      desc: 'From a sit, push off one leg through handstand to a step-out.' },
    { id: '7.208', code: '7.208', name: 'Back handspring step-out', value: 'B', family: 'acro', acro: true, inverted: true,
      desc: 'Flic-flac landing one foot at a time. Without flight it counts as a back walkover (A).' },
    { id: '7.210', code: '7.210', name: 'Back handspring to two feet', value: 'B', family: 'acro', acro: true, inverted: true,
      desc: 'Flic-flac landing on both feet. Different element from the step-out.' },

    // ---- Dismounts (Group 9)
    { id: '9.103', code: '9.103', name: 'Round-off dismount', value: 'A', family: 'dismount', dismount: true,
      desc: 'Round-off off the end of the beam.' },
    { id: '9.101', code: '9.101', name: 'Front handspring dismount', value: 'A', family: 'dismount', dismount: true,
      desc: 'Front handspring off the end of the beam.' },
    { id: '9.003', code: '9.003', name: 'Cartwheel to handstand, 1/4 turn dismount', value: 'A', family: 'dismount', dismount: true,
      desc: 'Cartwheel (any entrance) to handstand with a 1/4 turn off the side or end.' },
    { id: '9.102', code: '9.102', name: 'Aerial walkover forward dismount', value: 'A', family: 'dismount', dismount: true,
      desc: 'Free (aerial) walkover forward from one foot off the beam.' },
    { id: '9.104', code: '9.104', name: 'Front salto dismount', value: 'A', family: 'dismount', dismount: true, verify: true,
      desc: 'Salto forward off the end of the beam (piked confirmed; tucked assumed the same).' },
    { id: '9.106', code: '9.106', name: 'Back salto dismount', value: 'A', family: 'dismount', dismount: true,
      desc: 'From one foot (swing through) or two feet, salto backward tucked, piked, or stretched.' },
    { id: '9.201', code: '9.201', name: 'Front handspring with full twist dismount', value: 'B', family: 'dismount', dismount: true,
      desc: 'Front handspring off the end with a 1/1 twist.' },
    { id: '9.204', code: '9.204', name: 'Front salto stretched with 1/2 turn dismount', value: 'B', family: 'dismount', dismount: true,
      desc: 'From two feet, salto forward stretched with a half turn.' },
    { id: '9.205', code: '9.205', name: 'Arabian salto dismount', value: 'B', family: 'dismount', dismount: true,
      desc: 'Jump backward, half twist, salto forward tucked or piked.' },
    { id: '9.206', code: '9.206', name: 'Back salto with 1/2 or full twist dismount', value: 'B', family: 'dismount', dismount: true,
      desc: 'Salto backward tucked, piked, or stretched with a 1/2 or 1/1 twist.' },
  ],
};
