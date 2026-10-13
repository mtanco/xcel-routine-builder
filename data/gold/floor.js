// Xcel Gold: Floor Exercise
//
// Paraphrased from the USA Gymnastics Xcel Code of Points, Floor Exercise (revision
// packets Aug 2023 and Aug 2026): Floor rules chart, Chapters 1-3, the "Additional A
// Elements" chart, element pages for Groups 1-4, 6 and 7, and the Platinum/Diamond
// routine examples (for element numbers of handsprings and back saltos, whose pages
// are not in the packets). Anything marked `verify: true` is unconfirmed.
//
// Skill fields:
//   family     dance | turn | acro | flight | salto
//   value      'A' or 'B' (for split skills: the value at 135°+ split)
//   split      cross/side split leap or jump: value and split credit depend on the angle chosen
//   leap       one-foot take-off leap (the dance passage needs a leap with the split)
//   fullTurn   at least a 1/1 turn on one foot
//   flight     acro flight element (round-off, handsprings, aerials, saltos; not a dive roll)
//   salto      aerial or salto (can fill the 2nd acro pass by itself)
//   unlimited  flight with hand support: earns credit any number of times (book rule)
//   vpKey      groups skills the book treats as the same element (defaults to code, then id)

export const FLOOR_GOLD = {
  event: 'floor',
  level: 'gold',
  title: 'Floor',
  tagline: 'Two tumbling passes, a dance passage, and a full turn, in a routine of up to 1:00.',

  scoring: {
    max: 10.0,
    vpNeeded: 6,
    vpEach: 0.10,
    srEach: 0.50,
    maxRepeats: 2,
  },

  splitOptions: [
    { id: 'low', label: 'Under 100°', short: '<100°', splitOk: false, high: false,
      note: 'Too far from 120°: counts as an A, but not as your split leap' },
    { id: 'mid', label: '100° to 134°', short: '100–134°', splitOk: true, high: false,
      note: 'Within 20° of 120°: counts for the split requirement as an A (up to 0.20 off for split)' },
    { id: 'high', label: '135° or more', short: '135°+', splitOk: true, high: true,
      note: '135° or more earns the skill\'s full value' },
  ],
  defaultSplit: 'mid',

  rules: [
    { id: 'vp', text: 'You need at least 6 value parts. Any A or B skill counts (except B twisting saltos); each missing one takes 0.10 off your start value.' },
    { id: 'sr', text: 'There are 4 special requirements worth 0.50 each (see the checklist). Your first and second acro passes have to be different passes.' },
    { id: 'restricted', text: 'Not allowed at Gold (0.50 off each time, and no credit): any C or harder skill, and B twisting saltos. Front pikes and front layouts are fine; a front tuck with a 1/2 twist or a back layout with a twist is not.' },
    { id: 'hand-flight', text: 'Flight skills with hands on the floor (round-off, back handspring, front handspring) earn credit every time, and can fill requirements in different passes.' },
    { id: 'repeat', text: 'Other skills earn credit twice at most, and the second time needs a different skill before or after it.' },
    { id: 'flight', text: 'A dive roll does not count as flight. A flight skill done without flight counts as the non-flight version.' },
    { id: 'dance', text: 'The dance passage needs two different leaps, jumps, or hops, connected directly or with steps, runs, or chassés in between. An acro skill in the middle breaks it. One of the two has to be a leap (one-foot take-off) with a 120° split.' },
    { id: 'split', text: 'Within 20° of 120° (100° or more) still counts, with up to 0.20 off. A side leap, switch leap, or straddle jump needs 135° or more to be a B; below that it is an A.' },
    { id: 'saltos', text: 'Aerials and saltos that do not land feet first get no credit and a 0.50 fall.' },
    { id: 'turns', text: 'If a full turn is short by 90° or more, it only gets credit for the turn actually done. A turn is finished when your heel drops.' },
    { id: 'timing', text: 'Routine time limit is 1:00 with no minimum. Going over is 0.10. Music must have no words (1.00 off).' },
    { id: 'bounds', text: 'Each step out of bounds is 0.10. Coaches may stand on the floor.' },
  ],

  families: {
    dance: { label: 'Leaps, jumps, and hops', note: 'Group 1: the dance passage needs two different ones' },
    turn: { label: 'Turns', note: 'Gold needs at least a full turn on one foot' },
    acro: { label: 'Acro without flight', note: 'Rolls, handstands, walkovers, cartwheels' },
    flight: { label: 'Flight with hands', note: 'Earn credit every time; two in a row fill a pass' },
    salto: { label: 'Aerials and saltos', note: 'One by itself can be your second pass' },
  },

  elements: [
    // ---- Leaps, jumps, and hops (Group 1)
    { id: '1.101l', code: '1.101', vpKey: '1.101-leap', name: 'Split leap', value: 'A', family: 'dance', split: true, leap: true,
      desc: 'Split (or stride) leap forward from one foot. An A at any split on floor.' },
    { id: '1.202', code: '1.202', name: 'Side leap', value: 'B', family: 'dance', split: true, leap: true,
      desc: 'Leap sideways into a side split. B with 135° or more.' },
    { id: '1.204', code: '1.204', name: 'Switch leap', value: 'B', family: 'dance', split: true, leap: true,
      desc: 'Split leap with a leg change: swing the first leg forward to at least 45°, then switch. B with 135° or more; a stag-switch counts as a split leap (A).' },
    { id: '1.101j', code: '1.101', vpKey: '1.101-jump', name: 'Split jump', value: 'A', family: 'dance', split: true,
      desc: 'Split jump from two feet to two feet. Not a leap, so it cannot be the split leap in the dance passage.' },
    { id: '1.207', code: '1.207', name: 'Straddle jump', value: 'B', family: 'dance', split: true,
      desc: 'Straddle-pike jump. B with 135° or more.' },
    { id: '1.110', code: '1.110', name: 'Sissonne', value: 'A', family: 'dance',
      desc: 'Two-foot take-off, one-foot landing, legs on a diagonal with the front leg at least 45° down. Not a leap.' },
    { id: '1.109', code: '1.109', name: 'Hitch kick', value: 'A', family: 'dance',
      desc: 'Scissor kick forward, switching legs in the air.' },
    { id: '1.113', code: '1.113', name: 'Cat leap', value: 'A', family: 'dance',
      desc: 'Leap forward with bent legs (scissors leap). Also with a 1/2 turn.' },
    { id: '1.112', code: '1.112', name: 'Straight jump with 1/2 or 1/1 turn', value: 'A', family: 'dance',
      desc: 'Stretched jump from two feet with a 1/2 or full turn. Also chassé or passé hop with a full turn.' },
    { id: '1.114', code: '1.114', name: 'Hop with 1/2 turn', value: 'A', family: 'dance',
      desc: 'Hop from one foot with a half turn, free leg extended above horizontal.' },
    { id: '1.115', code: '1.115', name: 'Tuck jump', value: 'A', family: 'dance',
      desc: 'Tuck jump with knees at horizontal or higher.' },
    { id: '1.116', code: '1.116', name: 'Wolf jump or hop', value: 'A', family: 'dance',
      desc: 'One leg tucked, one extended forward, both at or above horizontal. From one or two feet.' },
    { id: '1.216', code: '1.216', name: 'Wolf jump with 1/2 turn', value: 'B', family: 'dance',
      desc: 'Wolf jump or hop with a half turn.' },
    { id: '1.215', code: '1.215', name: 'Tuck jump with full turn', value: 'B', family: 'dance',
      desc: 'Tuck hop or jump (legs together) with a 1/1 turn.' },
    { id: '1.213', code: '1.213', name: 'Cat leap with full turn', value: 'B', family: 'dance',
      desc: 'Cat leap with a 1/1 turn.' },
    { id: '1.212', code: '1.212', name: 'Straight jump with 1 1/2 turn', value: 'B', family: 'dance',
      desc: 'Stretched jump from two feet with a 540° turn.' },
    { id: '1.214', code: '1.214', name: 'Fouetté hop to scale', value: 'B', family: 'dance',
      desc: 'Kick forward, hop with a half turn, and land in a scale.' },
    { id: '1.208', code: '1.208', name: 'Schuschunova', value: 'B', family: 'dance',
      desc: 'Straddle (side split) jump, then rotate the legs back to land in front support.' },

    // ---- Turns (Group 2)
    { id: '2.101', code: '2.101', name: 'Full turn on one foot', value: 'A', family: 'turn', fullTurn: true,
      desc: '1/1 (360°) turn on one foot, free leg optional.' },
    { id: '2.201', code: '2.201', name: '1 1/2 turn on one foot', value: 'B', family: 'turn', fullTurn: true,
      desc: '540° turn on one foot.' },
    { id: '2.202', code: '2.202', name: 'Full turn, free leg at horizontal', value: 'B', family: 'turn', fullTurn: true,
      desc: 'Full turn with the free leg (heel forward, bent or straight) held at horizontal or higher the whole way, without holding it.' },
    { id: '2.206', code: '2.206', name: 'Full turn in tuck stand', value: 'B', family: 'turn', fullTurn: true,
      desc: 'Full turn on one foot in a tuck stand.' },
    { id: '2.208', code: '2.208', name: 'Full turn, leg held at 180°', value: 'B', family: 'turn', fullTurn: true,
      desc: 'Full turn holding the free leg up in a split (at least 135° for credit).' },

    // ---- Acro without flight (Groups 3-5)
    { id: '4.101', code: '4.101', name: 'Forward roll', value: 'A', family: 'acro',
      desc: 'Forward roll, handstand forward roll, or dive roll (end position optional). A dive roll is not flight.' },
    { id: '4.102', code: '4.102', name: 'Backward roll', value: 'A', family: 'acro',
      desc: 'Backward roll tucked or piked, to push-up, or to handstand (back extension roll).' },
    { id: '3.003', code: '3.003', name: 'Handstand', value: 'A', family: 'acro',
      desc: 'Handstand to vertical, legs optional.' },
    { id: '3.101', code: '3.101', name: 'Handstand with 1/2 to full turn', value: 'A', family: 'acro',
      desc: 'Kick or press to handstand and turn 1/2 to 1/1 in it.' },
    { id: '3.201', code: '3.201', name: 'Handstand with 1 1/2 turn', value: 'B', family: 'acro',
      desc: 'Kick or press to handstand and turn 540° or more.' },
    { id: '3.001', code: '3.001', name: 'Headstand', value: 'A', family: 'acro',
      desc: 'Headstand.' },
    { id: '5.001', code: '5.001', name: 'Bridge kickover', value: 'A', family: 'acro',
      desc: 'From standing or lying, bridge and kick over.' },
    { id: '5.104', code: '5.104', name: 'Cartwheel', value: 'A', family: 'acro',
      desc: 'Cartwheel (no flight).' },
    { id: '5.101', code: '5.101', name: 'Front walkover', value: 'A', family: 'acro',
      desc: 'Front walkover. Show the 120° split during it.' },
    { id: 'back-walkover', name: 'Back walkover', value: 'A', family: 'acro', verify: true,
      desc: 'Back walkover. Show the 120° split during it.' },

    // ---- Flight with hand support (unlimited credit)
    { id: '5.105', code: '5.105', name: 'Round-off', value: 'A', family: 'flight', flight: true, unlimited: true,
      desc: 'Round-off. The usual entry to a tumbling pass.' },
    { id: '5.106', code: '5.106', name: 'Back handspring (flic-flac)', value: 'A', family: 'flight', flight: true, unlimited: true,
      desc: 'Back handspring with flight.' },
    { id: '5.102', code: '5.102', name: 'Front handspring', value: 'A', family: 'flight', flight: true, unlimited: true,
      desc: 'Front handspring, step-out or two feet.' },

    // ---- Aerials and saltos
    { id: '7.101', code: '7.101', name: 'Aerial cartwheel or side salto', value: 'A', family: 'salto', flight: true, salto: true,
      desc: 'From one or two feet, side salto tucked, piked, or stretched. From one foot it looks like an aerial cartwheel.' },
    { id: '6.101', code: '6.101', name: 'Front tuck', value: 'A', family: 'salto', flight: true, salto: true,
      desc: 'Salto forward tucked. Step-out or two-foot landing count as the same skill.' },
    { id: '6.201p', code: '6.201', vpKey: '6.201-pike', name: 'Front pike', value: 'B', family: 'salto', flight: true, salto: true,
      desc: 'Salto forward piked. Allowed at Gold (not a twisting salto).' },
    { id: '6.201s', code: '6.201', vpKey: '6.201-layout', name: 'Front layout', value: 'B', family: 'salto', flight: true, salto: true,
      desc: 'Salto forward stretched. Allowed at Gold (not a twisting salto).' },
    { id: '8.101t', code: '8.101', vpKey: '8.101-tuck', name: 'Back tuck', value: 'A', family: 'salto', flight: true, salto: true,
      desc: 'Salto backward tucked.' },
    { id: '8.101p', code: '8.101', vpKey: '8.101-pike', name: 'Back pike', value: 'A', family: 'salto', flight: true, salto: true, verify: true,
      desc: 'Salto backward piked (assumed the same element number as the back tuck).' },
    { id: '8.101s', code: '8.101', vpKey: '8.101-layout', name: 'Back layout', value: 'A', family: 'salto', flight: true, salto: true,
      desc: 'Salto backward stretched.' },
    { id: '7.201', code: '7.201', name: 'Side salto stretched (backward take-off)', value: 'B', family: 'salto', flight: true, salto: true,
      desc: 'From a backward take-off, salto sideward stretched.' },
  ],
};
