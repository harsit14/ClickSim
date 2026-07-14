export type UtilityPanelId =
  | 'openingAccess'
  | 'stats'
  | 'options'
  | 'curiosities'
  | 'mementos'
  | 'vessel'
  | 'observatory'
  | 'codex'
  | 'deep'
  | 'steward'
  | 'guide'
  | 'endgame'

export type UtilityPanelState = Record<UtilityPanelId, boolean>

const UTILITY_PANEL_IDS: readonly UtilityPanelId[] = [
  'openingAccess',
  'stats',
  'options',
  'curiosities',
  'mementos',
  'vessel',
  'observatory',
  'codex',
  'deep',
  'steward',
  'guide',
  'endgame',
]

function closedPanels(): UtilityPanelState {
  return {
    openingAccess: false,
    stats: false,
    options: false,
    curiosities: false,
    mementos: false,
    vessel: false,
    observatory: false,
    codex: false,
    deep: false,
    steward: false,
    guide: false,
    endgame: false,
  }
}

/** Shell-only state. World progression and mutations must not enter this boundary. */
export class ShellState {
  panels = $state<UtilityPanelState>(closedPanels())
  sectionsOpen = $state(false)
  mobileLayout = $state(false)
  shopCollapsed = $state(false)
  modalReturnFocus: HTMLElement | null = null

  constructor(viewportWidth: number, mobileBreakpoint: number) {
    this.mobileLayout = viewportWidth <= mobileBreakpoint
    this.shopCollapsed = this.mobileLayout
  }

  get utilityPanelOpen(): boolean {
    return UTILITY_PANEL_IDS.some((id) => this.panels[id])
  }

  closeUtilityPanels(): void {
    for (const id of UTILITY_PANEL_IDS) this.panels[id] = false
    this.sectionsOpen = false
    if (this.mobileLayout) this.shopCollapsed = true
  }

  resize(viewportWidth: number, mobileBreakpoint: number): boolean {
    const nextMobileLayout = viewportWidth <= mobileBreakpoint
    if (nextMobileLayout === this.mobileLayout) return false
    this.mobileLayout = nextMobileLayout
    this.shopCollapsed = nextMobileLayout
    this.sectionsOpen = false
    return true
  }
}

export function createShellState(viewportWidth: number, mobileBreakpoint: number): ShellState {
  return new ShellState(viewportWidth, mobileBreakpoint)
}
