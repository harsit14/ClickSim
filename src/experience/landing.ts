export const LANDING_SESSION_KEY = 'ember.landing.entered'

export interface LandingVisibilityInput {
  sessionEntered: boolean
  developmentScenario: boolean
  playtestMode: boolean
  forceLanding: boolean
}

/**
 * The public entry appears once per tab session. Authored development saves and
 * playtest tools still open directly unless a reviewer explicitly asks for it.
 */
export function shouldShowLanding(input: LandingVisibilityInput): boolean {
  if (input.forceLanding) return true
  if (input.sessionEntered) return false
  return !input.developmentScenario && !input.playtestMode
}

export function landingPrimaryCta(returningPlayer: boolean): string {
  return returningPlayer ? 'Continue your universe' : 'Ignite the first light'
}
