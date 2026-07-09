export interface UiUnlock {
  id: string
  label: string
  cost: number
  /** total light ever earned before the chip appears */
  appearAt: number
}

export const UI_UNLOCKS: UiUnlock[] = [
  { id: 'counter', label: 'a way to count', cost: 10, appearAt: 5 },
  { id: 'shop', label: 'a place to spend', cost: 25, appearAt: 20 },
  { id: 'upgrades', label: 'a way to grow', cost: 75, appearAt: 60 },
  { id: 'stats', label: 'a way to remember', cost: 150, appearAt: 120 },
  { id: 'options', label: 'a way to choose', cost: 300, appearAt: 250 },
  { id: 'music', label: 'a voice in the dark', cost: 500, appearAt: 400 },
  { id: 'bulk', label: 'a way to hunger', cost: 1_000, appearAt: 800 },
]

export const UI_UNLOCK_BY_ID = new Map(UI_UNLOCKS.map((u) => [u.id, u]))
