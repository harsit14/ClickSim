import type { DurationFormatter, UiTextParameter, UiTextResolver } from './ui-text'

const COPY: Readonly<Record<string, string>> = {
  'goal-lens.title': 'Goal Lens',
  'goal-lens.turn-off': 'Turn off',
  'goal-lens.turn-off-label': 'Turn off the Goal Lens',
  'goal-lens.collapsed-active-rhythm': 'Collapsed while rhythm play is active.',
  'goal-lens.no-recommendation': 'No useful recommendation is available yet.',
  'goal-lens.goal-unavailable': 'Goal {id}',
  'goal-lens.pin': 'Pin',
  'goal-lens.unpin': 'Unpin',
  'goal-lens.pin-label': 'Pin {goal}',
  'goal-lens.unpin-label': 'Unpin {goal}',
  'goal-lens.slot-empty': 'Nothing useful here yet.',
  'goal-lens.estimate-unavailable': 'Time estimate unavailable',
  'goal-lens.slot.now': 'Next useful',
  'goal-lens.slot.soon': 'Next discovery',
  'goal-lens.slot.pinned': 'Pinned ambition',
  'goal-lens.reason.affordable-kindling': 'Affordable now; adds {rate} per second.',
  'goal-lens.reason.reachable-kindling': 'Nearest meaningful Kindling purchase.',
  'goal-lens.reason.discovery': 'The next unseen Kindling is taking shape.',
  'goal-lens.reason.supernova': 'Compress this era into lasting Stardust.',
  'goal-lens.detail.current-rate': 'at the current total rate',
  'goal-lens.detail.discovery-rate': 'at the current total rate, before purchases',
  'goal-lens.detail.ready': 'ready now',
  'goal-lens.kindling': 'Kindle {name}',
  'goal-lens.discovery': 'Discover {name}',
  'goal-lens.supernova': 'Preview the Supernova',
  'contextual-prompt.first-use': 'First use',
  'contextual-prompt.dismiss': 'Dismiss',
  'contextual-prompt.dismiss-label': 'Dismiss {prompt}',
  'contextual-prompt.turn-off': 'Turn off prompts',
  'contextual-prompt.turn-off-label': 'Turn off contextual prompts',
  'prompt.kindling.title': 'Kindling can carry the work',
  'prompt.kindling.body': 'Choose an affordable Kindling to turn Light into passive production.',
  'prompt.kindling.action': 'Open Kindling',
  'prompt.supernova.title': 'Preview the turn before committing',
  'prompt.supernova.body': 'The comparison shows exactly what returns and what remains. Cancelling changes nothing.',
  'prompt.supernova.action': 'Open Observatory',
  'reset-comparison.eyebrow': 'Before the boundary',
  'reset.action.cancel': 'Keep this era',
  'reset.action.confirm': 'Confirm {action}',
  'reset.action.epoch-turn': 'Supernova',
  'reset.result.epoch-matter-and-starting-kindlings': 'Light, Kindlings, ordinary upgrades, and buy mode return; Stardust and permanent systems remain.',
  'reset.section.lost': 'Returns',
  'reset.section.temporarily-replaced': 'Temporarily replaced',
  'reset.section.retained': 'Remains',
  'reset.section.parked': 'Parked safely',
  'reset.state.lost': 'Returns',
  'reset.state.temporarily-replaced': 'Held',
  'reset.state.retained': 'Remains',
  'reset.state.parked': 'Parked',
  'reset.recovery.title': 'Recovery estimate',
  'reset.recovery.current-rate': 'Current frontier rate',
  'reset.recovery.starting-rate': 'Starting rate after turn',
  'reset.recovery.recovered-rate': 'Projected recovered rate',
  'reset.recovery.estimated-time': 'Estimated recovery',
  'reset.recovery.basis': 'Estimate basis',
  'reset.recovery.basis.simulation': 'Current-run projection',
  'reset.recovery.basis.history': 'Prior-run history',
  'reset.recovery.basis.unavailable': 'Unavailable',
  'reset.recovery.unavailable': 'A trustworthy recovery estimate is not available yet ({reason}).',
  'reset.recovery.not-applicable': 'This boundary does not reset the active run.',
  'reset.confirmation.explicit-required': 'This action requires a separate confirmation; previewing never resets the run.',
  'reset.category.world-currency': 'Light (World currency)',
  'reset.category.run-earnings': 'Current-run earnings',
  'reset.category.kindlings': 'Kindlings',
  'reset.category.ordinary-upgrades': 'Ordinary upgrades',
  'reset.category.buy-mode': 'Buy mode',
  'reset.category.epoch-matter': 'Stardust (Epoch Matter)',
  'reset.category.epoch-doctrines': 'Epoch doctrines',
  'reset.category.epoch-works': 'Epoch works',
  'reset.category.era-earnings': 'Era earnings',
  'reset.category.local-archive': 'Astral Cabinet (Field Archive)',
  'reset.category.local-echoes': 'Local Echoes',
  'reset.category.local-trials': 'Local Trials',
  'reset.category.beacons': 'Beacons',
  'reset.category.dark-between': 'Dark Between',
  'reset.category.wayfinder-laws': 'Wayfinder laws',
  'reset.category.vessel': 'Vessel',
  'reset.category.global-achievements': 'Global achievements',
  'reset.category.presentation-preferences': 'Presentation preferences',
  'reset.category.other-parked-universe-runs': 'Other parked universe runs',
  'reset.recovery.epoch-projection': 'Projection assumes the earned Stardust and current permanent bonuses.',
}

const TIDEFALL_COPY: Readonly<Record<string, string>> = {
  'goal-lens.reason.supernova': 'Draw this tide into lasting Moon Salt.',
  'goal-lens.supernova': 'Preview the Undertow',
  'prompt.supernova.title': 'Preview the Undertow before committing',
  'reset.action.cancel': 'Keep this tide',
  'reset.action.epoch-turn': 'Undertow',
  'reset.result.epoch-matter-and-starting-kindlings': 'Glow, Kindlings, ordinary upgrades, and buy mode return; Moon Salt and permanent systems remain.',
  'reset.category.world-currency': 'Glow (World currency)',
  'reset.category.epoch-matter': 'Moon Salt (Epoch Matter)',
  'reset.category.local-archive': 'Pelagic Archive (Field Archive)',
  'reset.recovery.epoch-projection': 'Projection assumes the earned Moon Salt and current permanent bonuses.',
}

function humanizeKey(key: string): string {
  const leaf = key.split('.').at(-1) ?? key
  const words = leaf.replaceAll('-', ' ')
  return words.length === 0 ? key : words[0].toUpperCase() + words.slice(1)
}

function parameterText(value: UiTextParameter | undefined): string {
  if (value === null || value === undefined) return ''
  return String(value)
}

export const resolveEmberUiText: UiTextResolver = (key, parameters = {}) => {
  const template = COPY[key] ?? humanizeKey(key)
  return template.replace(/\{([a-zA-Z0-9_-]+)\}/g, (_match, name: string) => (
    parameterText(parameters[name])
  ))
}

export function resolveUniverseUiText(
  universeId: string,
  key: string,
  parameters: Readonly<Record<string, UiTextParameter>> = {},
): string {
  const template = universeId === 'tidefall' && TIDEFALL_COPY[key]
    ? TIDEFALL_COPY[key]
    : COPY[key] ?? humanizeKey(key)
  return template.replace(/\{([a-zA-Z0-9_-]+)\}/g, (_match, name: string) => (
    parameterText(parameters[name])
  ))
}

export const formatGoalDuration: DurationFormatter = (milliseconds) => {
  if (!Number.isFinite(milliseconds) || milliseconds < 0) return 'time unavailable'
  const totalSeconds = Math.max(0, Math.round(milliseconds / 1_000))
  if (totalSeconds < 60) return totalSeconds === 0 ? 'ready now' : `about ${totalSeconds}s`
  const totalMinutes = Math.round(totalSeconds / 60)
  if (totalMinutes < 60) return `about ${totalMinutes}m`
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return minutes === 0 ? `about ${hours}h` : `about ${hours}h ${minutes}m`
}
