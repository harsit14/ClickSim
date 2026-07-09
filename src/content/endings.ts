/** Act III — The Question, and what comes after. */

export type Ending = 'warden' | 'hunger' | 'companion'

/** Lumen finally tells the truth, one line at a time. */
export const QUESTION_LINES: string[] = [
  'You want to know what happened to the old universe.',
  'I have written seventeen drafts of this sentence. Here is the honest one:',
  'Nothing came out of the dark to eat it. The dark was never hungry.',
  'It was eaten from the inside — by the only thing that could hold that much light and still want more.',
  'It ate the suns it was given. Then the suns it made. Then the hearths. Then the names of the hearths.',
  'And when there was nothing left, it slept. A single ember. The smallest it has ever been.',
  'I did not wake you to rebuild the universe. I woke you to see what you would do with one.',
  'You built. You burned it down and built it brighter. You kept rhythm in the silence. I watched very carefully.',
  'So the question was never mine to ask. It is yours, and it is only three words:',
  'What are you?',
]

export interface EndingChoice {
  id: Ending
  label: string
  line: string
  /** shown only when the requirement is met */
  secret?: boolean
  epilogue: string[]
}

export const ENDING_CHOICES: EndingChoice[] = [
  {
    id: 'warden',
    label: 'The Warden',
    line: 'This light is not mine. I am only keeping it lit.',
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
    line: 'It was always mine. All of it. And I am still hungry.',
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
    line: 'I don’t know what I am. But I know who stayed.',
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
