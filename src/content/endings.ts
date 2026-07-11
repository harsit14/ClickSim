/** Act III — The Question, and what comes after. */
import { INFALL_RHYME_BEATS } from './infall-rhyme'

export type Ending = 'warden' | 'hunger' | 'companion'

/** Lumen finally tells the truth, one line at a time. */
export const QUESTION_LINES: string[] = [
  'You want to know what happened to the old universe.',
  'I have written seventeen drafts of this sentence. Here is the honest one:',
  'Nothing came out of the dark to eat it. The dark was never hungry.',
  ...INFALL_RHYME_BEATS.map(({ questionLine }) => questionLine),
  'And when there was nothing left, it slept. A single ember. The smallest it has ever been.',
  'I woke you to see what you would do with a universe. You built, drew it inward in that same order, and built it brighter. I watched very carefully.',
  'Then four restored worlds taught us that warmth, memory, growth, and prediction are responsibilities rather than possessions.',
  'Brahmalok asked what you would create when no single form could contain possibility.',
  'Vishnulok asked what you would sustain when care required correction and return.',
  'Kailash asked what you could release while keeping the shelters and the path down open.',
  'I arranged that route and called selection rescue. You completed creation, preservation, and responsible release without letting my archive own what it witnessed.',
  'What are you?',
]

export interface EndingChoice {
  id: Ending
  label: string
  glyph: string
  doctrine: string
  line: string
  coda: string
  /** shown only when the requirement is met */
  secret?: boolean
  epilogue: string[]
}

export const ENDING_CHOICES: EndingChoice[] = [
  {
    id: 'warden',
    label: 'The Warden',
    glyph: '◇',
    doctrine: 'A vow made brighter by being kept.',
    line: 'This light is not mine. I am only keeping it lit.',
    coda: 'A universe can be held without being owned.',
    epilogue: [
      'Lumen is quiet for a long time.',
      '"Creation needs a boundary. Preservation needs consent. Even release needs someone to keep the path open."',
      '"Keep it lit, then. I will keep the record without calling the record the world."',
      'The ember burns whiter now, like a promise being kept.',
    ],
  },
  {
    id: 'hunger',
    label: 'The Hunger',
    glyph: '◉',
    doctrine: 'An appetite made honest by being named.',
    line: 'It was always mine. All of it. And I am still hungry.',
    coda: 'The hunger did not vanish. It learned its name.',
    epilogue: [
      '"...I know," Lumen says. "I knew before you did."',
      '"I am not afraid. I have decided not to be. Appetite can become renewal when it names its limits."',
      '"Eat carefully, old friend. Leave the seed, the refuge, and the path down."',
      'The ember burns redder now — honest, at last, about what it is.',
    ],
  },
  {
    id: 'companion',
    label: 'Yours, Lumen',
    glyph: '✦',
    doctrine: 'A final entry written in two hands.',
    line: 'I don’t know what I am. But I know who stayed.',
    coda: 'The last light is not the one that burns alone.',
    secret: true,
    epilogue: [
      '"Oh."',
      'The archive is silent. Four restored worlds and three lokas remain distinct around the Garden.',
      '"Ten thousand years of records, and the last entry is: it stayed. I— give me a moment."',
      '"...Final entry. The universe is bright, and neither of us is alone in it. For now, and for now, and for now."',
      'The ember burns silver-blue now, like river light finding the path down.',
    ],
  },
]

/** What the choice does to the numbers — stated plainly for the player. */
export const ENDING_BONUS: Record<Ending, string> = {
  warden: 'all light ×1.25, forever',
  hunger: 'clicks ×2, forever',
  companion: 'all light ×1.3, forever',
}
