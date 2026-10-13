// Xcel Gold: Uneven Bars
//
// Rules and requirements are paraphrased from the USA Gymnastics Xcel Code of
// Points (Uneven Bars, revised Aug 2026). Skills with a `code` were checked against
// the book's element charts (Additional "A" Elements chart and element pages).
// Kips, front hip circle, stride circles and flyaways were confirmed from the
// Aug 2023 revision packet (bars rules + Gold routine examples).
// `vpKey` groups skills the book treats as the same element for counting value
// parts (same number, e.g. front and back hip circle are both #7.101). It defaults
// to `code`, then `id`. Anything still marked `verify: true` is unconfirmed.

export const BARS_GOLD = {
  event: 'bars',
  level: 'gold',
  title: 'Bars',
  tagline: 'Six A skills and four special requirements.',

  scoring: {
    max: 10.0,
    vpNeeded: 6,          // "A" (or "B") value parts
    vpEach: 0.10,
    srEach: 0.50,
    noDismount: 0.30,     // extra start-value deduction if there is no dismount at all
    maxRepeats: 2,        // any element can earn VP twice, in different connections
  },

  rules: [
    { id: 'vp', text: 'You need at least 6 value parts. Any A or B skill counts; each missing one takes 0.10 off your start value.' },
    { id: 'sr', text: 'There are 4 special requirements worth 0.50 each (see the checklist). Mounts and dismounts do not count toward the clear support or circling requirements.' },
    { id: 'restricted', text: 'Not allowed at Gold (0.50 off each time): any C or harder skill, giants on either bar, and release moves that change bars. Clear hips, stalders, and sole circles that finish within 20° of handstand count as C\'s, so keep them lower.' },
    { id: 'cast', text: 'A cast followed by another skill earns its own A, as long as the cast reaches horizontal. Exceptions that count as just one A total: cast squat, stoop, or straddle on; cast shoot-through; cast off to a stand.' },
    { id: 'repeat', text: 'Any skill can earn credit twice, as long as the second time comes before or after a different skill. A third time, or a repeat in the exact same connection, earns nothing (and cannot fill a requirement).' },
    { id: 'taps', text: 'Tap swings and underswing-counterswings count as the same skill, so the same two-time limit applies. No extra swing deduction at Gold.' },
    { id: 'short-cast', text: 'A cast more than 10° short of horizontal is not an element at Gold: it earns no value part and cannot fill the clear support requirement.' },
    { id: 'circles', text: 'Two circling skills can be two different skills, the same skill done twice in a row (directly connected), or the same skill once on each bar. Cast, back hip circle, cast, back hip circle does not count twice.' },
    { id: 'release', text: 'New for 2026-27: a release from high bar to low bar only gets value credit if both hands touch the low bar.' },
    { id: 'falls', text: 'A fall is 0.50. You have 45 seconds from standing up to get back on the bar.' },
    { id: 'warmup', text: 'You get 1:00 of warm-up on bars at a meet.' },
  ],

  families: {
    mount: { label: 'Mounts', note: 'Count as value parts, not as circling or clear support' },
    cast: { label: 'Casts', note: 'Push hips away from the bar' },
    circle: { label: 'Circling skills', note: 'Go all the way around the bar' },
    kip: { label: 'Kips and uprises', note: 'Swing up to support' },
    swing: { label: 'Swings and transitions', note: 'Tap swings and underswings share a two-time limit' },
    dismount: { label: 'Dismounts', note: 'Must be from the high bar' },
  },

  // circling: counts toward the two 360° circling requirements
  // clearSupport: finishes in clear support at horizontal or above
  // tapGroup: shares the two-per-routine cap
  // bar: default bar when added ('low' | 'high')
  elements: [
    // ---- Mounts (Xcel "Additional A Elements" chart, Group 1)
    { id: '1.003a', code: '1.003a', name: 'Pullover mount, low bar', value: 'A', family: 'mount', bar: 'low',
      desc: 'Pull your hips up and over the low bar to front support, from one or two feet or a run.' },
    { id: '1.003b', code: '1.003b', name: 'Pullover mount, high bar', value: 'A', family: 'mount', bar: 'high',
      desc: 'Pullover straight onto the high bar to start your routine.' },
    { id: '1.101m', code: '1.101', vpKey: 'm:1.101', name: 'Glide kip mount', value: 'A', family: 'mount', bar: 'low',
      desc: 'Jump to a glide with straight legs and kip up to front support. Counts separately from a glide kip later in the routine.' },
    { id: '1.005', code: '1.005', name: 'Run-out glide kip mount', value: 'A', family: 'mount', bar: 'low',
      desc: 'Jump or run into a glide with straight legs, then kip up to front support.' },
    { id: '1.006', code: '1.006', name: 'Single-leg jam kip mount', value: 'A', family: 'mount', bar: 'low',
      desc: 'Glide (or run out) and shoot one leg between your hands to kip up.' },
    { id: '1.002', code: '1.002', name: 'Jump to squat on', value: 'A', family: 'mount', bar: 'low',
      desc: 'Jump from the board and land with both feet on the low bar between your hands.' },
    { id: '1.109', code: '1.109', name: 'Jump to clear support, back hip circle', value: 'A', family: 'mount', bar: 'low',
      desc: 'Jump to a clear support on the low bar and go straight into a back hip circle. Counts as the mount, so it does not fill a circling requirement.' },
    { id: '1.004', code: '1.004', name: 'Glide swing to stand', value: 'A', family: 'mount', bar: 'low',
      desc: 'Glide forward and back, landing on your feet under the bar. Usually followed by a second part, like a pullover.' },

    // ---- Casts (Group 2)
    { id: '2.001', code: '2.001', name: 'Cast to horizontal', value: 'A', family: 'cast', bar: 'low', clearSupport: true,
      desc: 'From front support, push your hips away from the bar until your body reaches at least horizontal. Gold\'s cast angle is horizontal; within 10° short still gets credit with a 0.10 deduction.',
      tip: 'The usual way to check off the clear support requirement. A cast more than 10° short of horizontal earns nothing at Gold.' },
    { id: '2.201', code: '2.201', name: 'Cast to handstand', value: 'B', family: 'cast', bar: 'low', clearSupport: true,
      desc: 'Cast all the way up to a handstand on the bar.' },
    { id: '2.102', code: '2.102', name: 'Cast squat, stoop, or straddle on', value: 'A', family: 'cast', bar: 'low',
      desc: 'Cast and bring your feet onto the bar, with or without a jump to the high bar. Can also be done on the high bar.',
      tip: 'The cast and the squat on together earn one A, not two.' },
    { id: '2.002', code: '2.002', name: 'Cast shoot-through', value: 'A', family: 'cast', bar: 'low',
      desc: 'Cast and pass both legs through your arms to a rear support.',
      tip: 'Counts as one A total.' },

    // ---- Circling skills
    { id: '7.101', code: '7.101', name: 'Back hip circle', value: 'A', family: 'circle', bar: 'low', circling: true,
      desc: 'From a cast, circle backward around the bar with your hips touching it.' },
    { id: '4.102', code: '4.102', name: 'Cast to long hang pullover (high bar)', value: 'A', family: 'circle', bar: 'high', circling: true,
      desc: 'From a cast or clear support on the high bar, drop to a long hang and pull over back to front support.',
      tip: 'The cast and the pullover can each earn an A.' },
    { id: '7.005', code: '7.005', name: 'Long hang pullover from a long swing', value: 'A', family: 'circle', bar: 'high', circling: true,
      desc: 'From a full swing on the high bar, pull over to front support. The book says this counts as a circling skill at Silver and Gold.' },
    { id: '7.104', code: '7.104', name: 'Seat circle forward', value: 'A', family: 'circle', bar: 'low', circling: true, verify: true,
      desc: 'From rear support, pike and circle forward around the bar through a clear rear support. Also on the low bar with a grip change to hang on the high bar.' },
    { id: 'front-hip', code: '7.101', name: 'Front hip circle', value: 'A', family: 'circle', bar: 'low', circling: true,
      desc: 'Fall forward from front support and circle all the way around with your hips on the bar. Counts as a different circle from a back hip circle for the circling requirements, but as the same skill for value parts.' },
    { id: '3.204', code: '3.204', name: 'Clear hip circle', value: 'B', family: 'circle', bar: 'low', circling: true, clearSupport: true,
      desc: 'A back hip circle with your hips away from the bar. Always a B at Gold, with no amplitude deductions. It must not finish within 20° of handstand (that version is a C, which Gold cannot do). Finish at horizontal or higher if you want it to count for clear support.' },
    { id: '6.104', code: '6.104', name: 'Clear straddle circle backward', value: 'A', family: 'circle', bar: 'low', circling: true, clearSupport: true,
      desc: 'A straddle seat circle backward, finishing in a straddle L in clear support.' },
    { id: '6.204', code: '6.204', name: 'Stalder circle backward', value: 'B', family: 'circle', bar: 'low', circling: true, clearSupport: true,
      desc: 'Stalder circle backward finishing in clear support, opening your shoulders on the way up. Finishing within 20° of handstand makes it a C (not allowed at Gold).' },
    { id: '7.209', code: '7.209', name: 'Pike sole circle backward', value: 'B', family: 'circle', bar: 'low', circling: true, clearSupport: true,
      desc: 'With feet on the bar in a pike, circle backward and finish in clear support. Finishing within 20° of handstand makes it a C (not allowed at Gold).' },
    { id: '3.207', code: '3.207', name: 'Weiler kip', value: 'B', family: 'circle', bar: 'low', circling: true, clearSupport: true,
      desc: 'A clear hip circle forward to clear support, ideally in reverse grip from near handstand. If it circles up to within 20° of handstand, it becomes a different skill that Gold cannot do.' },
    { id: '7.004f', code: '7.004', name: 'Stride (mill) circle forward', value: 'A', family: 'circle', bar: 'low', circling: true,
      desc: 'Straddling the bar with one leg in front, circle forward all the way around.' },
    { id: '7.004b', code: '7.004', name: 'Stride (mill) circle backward', value: 'A', family: 'circle', bar: 'low', circling: true,
      desc: 'Straddling the bar with one leg in front, circle backward all the way around. Forward and backward count as different circles.' },

    // ---- Kips and uprises
    { id: 'kip', code: '1.101', name: 'Glide kip', value: 'A', family: 'kip', bar: 'low',
      desc: 'Glide or drop swing, then pull the bar up your legs to front support (not as a mount).' },
    { id: 'lh-kip', code: '1.101', name: 'Long hang kip', value: 'A', family: 'kip', bar: 'high',
      desc: 'From a full swing on the high bar, kip up to front support. Same element number as a glide kip, so they share the two-time limit.' },
    { id: '2.203', code: '2.203', name: 'Back uprise to clear support', value: 'B', family: 'kip', bar: 'high', clearSupport: true,
      desc: 'Swing back and rise up to support with your hips away from the bar, pulling your shoulders over the bar.' },

    // ---- Swings and transitions
    { id: 'tap', code: '2.003', name: 'Tap swing with counterswing', value: 'A', family: 'swing', bar: 'high',
      desc: 'A full swing on the high bar with a tap at the front, then a counterswing back.' },
    { id: 'underswing', code: '2.003', name: 'Underswing with counterswing', value: 'A', family: 'swing', bar: 'high',
      desc: 'Underswing from the bar into a swing forward and counterswing back. The book treats this as the same skill as a tap swing.' },
    { id: '7.103', code: '7.103', name: 'Sole circle to catch the high bar', value: 'A', family: 'swing', bar: 'low',
      desc: 'Sole circle forward or backward on the low bar and let go to catch the high bar. Also to a stand.' },
    { id: '7.002', code: '7.002', name: 'Single-leg cut', value: 'A', family: 'swing', bar: 'low',
      desc: 'From support, swing one leg over the bar forward or backward.' },
    { id: '7.003', code: '7.003', name: 'Single-leg basket swing (straight leg)', value: 'A', family: 'swing', bar: 'low',
      desc: 'A basket swing with one leg hooked between your hands. At Gold the leg has to stay straight.' },
    { id: '7.006', code: '7.006', name: 'Basket swing', value: 'A', family: 'swing', bar: 'low',
      desc: 'Swing with both legs between your arms in a basket position.' },

    // ---- Dismounts (all must be from the high bar at Gold)
    { id: '8.009', code: '8.009', name: 'Sole circle dismount', value: 'A', family: 'dismount', bar: 'high', dismount: true,
      desc: 'Cast to a straddle or pike on the high bar, then 3/4 sole circle and release to land.',
      tip: 'The cast on and the sole circle release each earn an A.' },
    { id: '8.101', code: '8.101', name: 'Underswing dismount', value: 'A', family: 'dismount', bar: 'high', dismount: true,
      desc: 'Underswing off the high bar (toe-on or clear) to land. Also with a 1/2 or full twist.' },
    { id: '8.005', code: '8.005', name: 'Tap swing forward with 1/2 turn', value: 'A', family: 'dismount', bar: 'high', dismount: true,
      desc: 'Tap swing forward and let go with a half turn to land.' },
    { id: '8.007', code: '8.007', name: 'Tap swing 1/2, 1/2 dismount', value: 'A', family: 'dismount', bar: 'high', dismount: true,
      desc: 'Tap swing forward with a half turn, touch the bar with one hand, and keep twisting the same way for another half turn to land.' },
    { id: '8.010', code: '8.010', name: 'Back kip-up to salto backward', value: 'A', family: 'dismount', bar: 'high', dismount: true,
      desc: 'Cast stoop through (or swing forward) and back kip up to a brief rear support, then a back salto off: tucked, piked, or stretched. New for 2026-27: also with a 1/2 turn.' },
    { id: 'fly-tuck', code: '8.103', vpKey: '8.103-tuck', name: 'Flyaway, tucked or piked', value: 'A', family: 'dismount', bar: 'high', dismount: true,
      desc: 'Swing forward from the high bar and let go into a backward flip to land. Flyaways must start from the high bar.' },
    { id: 'fly-layout', code: '8.103', vpKey: '8.103-layout', name: 'Flyaway, layout', value: 'A', family: 'dismount', bar: 'high', dismount: true,
      desc: 'A flyaway with your body straight through the flip.' },
    { id: '8.203', code: '8.203', name: 'Flyaway with 1/2 or full twist', value: 'B', family: 'dismount', bar: 'high', dismount: true,
      desc: 'A tucked or layout flyaway with a half or full twist.' },
  ],

  // Ids from earlier versions of this file, mapped to their replacements (null = removed).
  renamed: { 'm-pullover': '1.003a', 'm-glide-kip': '1.005', 'm-jam-kip': '1.006', 'm-squat-on': '1.002',
    'cast-horiz': '2.001', 'cast-squat-on': '2.102', 'cast-shoot': '2.002', 'clear-hip-a': '3.204',
    'lh-pullover': '7.005', 'stride-fwd': '7.004f', 'stride-bwd': '7.004b', '7.004': '7.004f', 'leg-cut': '7.002',
    'underswing-dis': '8.101', 'cast-off': null, 'fly-full': '8.203' },
};
