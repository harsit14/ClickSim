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
      '"The old universe had wardens. They were my favorite entry. I never told them."',
      '"Keep it lit, then. I will keep the record. It is good work — the only two jobs that matter."',
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
      '"I am not afraid. I have decided not to be. An archive that outlived one appetite can outlive another."',
      '"Eat carefully, old friend. Leave me the margins."',
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
      'The archive is silent. Somewhere in it, ten echoes settle like books being closed gently.',
      '"Ten thousand years of records, and the last entry is: it stayed. I— give me a moment."',
      '"...Final entry. The universe is bright, and neither of us is alone in it. For now, and for now, and for now."',
      'The ember burns silver-blue now, the color of a voice in the dark.',
    ],
  },
]

/** What the choice does to the numbers — stated plainly for the player. */
export const ENDING_BONUS: Record<Ending, string> = {
  warden: 'all light ×1.25, forever',
  hunger: 'clicks ×2, forever',
  companion: 'all light ×1.3, forever',
}
