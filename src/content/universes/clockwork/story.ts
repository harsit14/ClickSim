import { amountFromNumber, gteAmount } from '../../../core/numeric/amount'
import type { EchoDef } from '../../echoes'
import type { LumenLine } from '../../lumen'
import { questionHookReady } from '../../question-gate'
import type { StorySceneDef } from '../types'

const owns = (owned: Readonly<Record<string, number>>, id: string, count = 1) => (owned[id] ?? 0) >= count

export const CLOCKWORK_LUMEN: LumenLine[] = [
  {
    id: 'clockwork-lumen-awake',
    text: 'That click was accepted before you made it. I dislike how neatly this place remembers.',
    remembranceText: 'The schedule knew we would return. I remember how we left the interval open; the machine does too.',
    when: (game) => game.clicks >= 1,
  },
  { id: 'clockwork-lumen-tooth', text: 'One Tooth. It is refusing to turn until there is somewhere for the work to go.', when: (game) => owns(game.owned, 'clockwork-tooth') },
  { id: 'clockwork-lumen-route', text: 'The line is not decoration. Power entered here and arrived there. The machine insists we inspect the whole sentence.', when: (game) => owns(game.owned, 'clockwork-cog') },
  { id: 'clockwork-lumen-heart', text: 'An escapement is a promise to release only what can be used. Hearts could learn from that.', when: (game) => owns(game.owned, 'clockwork-escapement') },
  { id: 'clockwork-lumen-automaton', text: 'It repairs the tool that repairs it. Please do not call that comforting.', when: (game) => owns(game.owned, 'clockwork-clockmaker-automaton') },
  { id: 'clockwork-lumen-signal', text: 'The Maintenance Signal is not an Omen. It filed a schedule and arrived exactly when threatened.', when: (game) => game.starsCaught >= 1 },
  { id: 'clockwork-lumen-ledger', text: 'A Patent Ledger is an archive that believes every discovery should have an owner. The final pages disagree.', when: (game) => game.curiosities.length >= 1 },
  { id: 'clockwork-lumen-rewinding', text: 'Everything returned to zero except the perfected interval. The Mainspring is carrying time, not ashes.', when: (game) => game.supernovae >= 1 },
  { id: 'clockwork-lumen-calendar', text: 'Every day is engraved. One remains blank. They preserved uncertainty as if it were oxygen.', when: (game) => owns(game.owned, 'clockwork-last-calendar') },
  { id: 'clockwork-lumen-regulator', text: 'The Great Regulator can predict the next motion. It cannot predict why you chose to restore it. The trials and the deep are behind you. When the final interval opens — ask me the question.', unlocksQuestion: true, when: (game) => questionHookReady(game, 'clockwork-great-regulator') },
]

export const CLOCKWORK_ECHOES: EchoDef[] = [
  {
    id: 'clockwork-echo-first-tooth',
    title: 'Acceptance Test 1A',
    provenance: 'stamped into the first Tooth beneath the Escapement Heart',
    text: 'Apply one deliberate impulse. Confirm that the tooth engages, the escapement advances, and torque reaches the marked output. If any part moves without transmitting work, reject the assembly. A handwritten amendment adds: if the impulse comes from outside the prediction, do not reject it. Ask what it wants.',
    when: (game) => owns(game.owned, 'clockwork-tooth'),
  },
  {
    id: 'clockwork-echo-socket-ordinance',
    title: 'Socket Ordinance',
    provenance: 'municipal code posted beside an empty route board',
    text: 'One input. One output. The limit was not imposed because the city lacked splitters, but because a machine deserves to know which neighbor depends upon it. Later laws permit two sockets, conditional gates, and scheduled changes. None permit an invisible dependency.',
    when: (game) => owns(game.owned, 'clockwork-escapement'),
  },
  {
    id: 'clockwork-echo-first-shift',
    title: 'The First Shift',
    provenance: 'six punched cards tied with blue machinist thread',
    text: 'Tooth to Cog. Cog to Ratchet. Ratchet to Escapement. Escapement to Mainspring. Mainspring to Flywheel. The recommended route is deliberately modest. The instructor wrote: certainty should reduce fear before it increases ambition.',
    when: (game) => owns(game.owned, 'clockwork-flywheel'),
  },
  {
    id: 'clockwork-echo-governors-minute',
    title: 'Minutes of the Governors',
    provenance: 'a labor meeting recorded as cam geometry',
    text: 'The city could make every train faster. The workers voted instead for legible bottlenecks, maintenance intervals, and a bell no engine controlled. The dissenting Governor asked whether efficiency that consumed its keepers could still be called production. The motion passed without objection.',
    when: (game) => owns(game.owned, 'clockwork-governor'),
  },
  {
    id: 'clockwork-echo-noon',
    title: 'Noon Alignment',
    provenance: 'an Orrery forecast whose final mark is still approaching',
    text: 'At the civic meridian, three rings align: power, cadence, efficiency. The event is written years in advance and rewards only the route displayed before it. No hidden die chooses the fortunate train. Preparation is the entire ceremony.',
    when: (game) => owns(game.owned, 'clockwork-orrery'),
  },
  {
    id: 'clockwork-echo-prophecy-margin',
    title: 'Margin of a Punched Prophecy',
    provenance: 'recovered from the Prediction Mill output tray',
    text: 'The holes correctly predict rainfall, repairs, births, departures, and the hour one reader will reach this sentence. Along the unpunched edge, that reader wrote: knowing what I do next does not tell the machine why I consented. The Mill preserved the note as an unresolved variable.',
    when: (game) => owns(game.owned, 'clockwork-prediction-mill'),
  },
  {
    id: 'clockwork-echo-rewinding',
    title: 'Rewinding Procedure',
    provenance: 'engraved inside a Mainspring barrel',
    text: 'Release the city in reverse musical order. Return every World mechanism and ordinary refinement to zero. Retain the Patent Ledger, completed trials, story, and all deeper state. Lock one perfected interval into a Mainspring. Preview every loss. Require consent. A reset performed without inspection is classified as damage.',
    when: (game) => game.supernovae >= 1,
  },
  {
    id: 'clockwork-echo-stopped-city',
    title: 'The Day the City Stopped',
    provenance: 'eighteen civic clocks halted on the same indexed tooth',
    text: 'The Causal Engine predicted a visitor that carried forward every law it consumed. The city could not defeat a learner made from solved systems. It chose to stop transmitting time. Without change, it hoped to become invisible. Every citizen received the same forecast. The surviving records do not say everyone agreed.',
    when: (game) => gteAmount(game.allTimeEarned, amountFromNumber(1e12)),
  },
  {
    id: 'clockwork-echo-blank-date',
    title: 'The Blank Date',
    provenance: 'the final leaf of the Last Calendar',
    text: 'All probable futures are engraved around one empty square. The registrar explains that a perfectly predicted city needs one place where a choice may be recorded after it is made. Lumen tests the paper. The blank is not damage. It has been protected more carefully than every written day.',
    when: (game) => owns(game.owned, 'clockwork-last-calendar'),
  },
  {
    id: 'clockwork-echo-vulnerable-again',
    title: 'Vulnerable Again',
    provenance: 'written by the Great Regulator one interval after restoration',
    text: 'TIME RESUMED. MAINTENANCE FORECASTS VALID. EXTERNAL OBSERVER MAY NOW DETECT CAUSAL ACTIVITY. The machine prints the warning, pauses, and adds a line absent from every prior plan: CONTINUE. Someone has taught the city that certainty and freedom are not opposites until one is used to erase the other.',
    when: (game) => owns(game.owned, 'clockwork-great-regulator'),
  },
]

export const CLOCKWORK_STORY_SCENES: readonly StorySceneDef[] = [
  { id: 'clockwork-scene-arrival-unwound-city', kind: 'arrival', skippableAfterFirstView: true, replayable: true },
  { id: 'clockwork-scene-rewinding', kind: 'epoch', skippableAfterFirstView: true, replayable: true },
  { id: 'clockwork-scene-causal-vault', kind: 'deep', skippableAfterFirstView: true, replayable: true },
  { id: 'clockwork-scene-regulator-beacon', kind: 'beacon', skippableAfterFirstView: true, replayable: true },
  { id: 'clockwork-scene-unscheduled-interval', kind: 'beacon', skippableAfterFirstView: true, replayable: true },
  { id: 'clockwork-scene-stopped-city-record', kind: 'transmission', skippableAfterFirstView: true, replayable: true },
]
