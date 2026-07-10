import { V2_UNIVERSE_BY_ID, type UniverseId } from '../src/content/universes'
import { WAYFINDER_NODES } from '../src/content/wayfinder'

export type InteractionContext = 'active' | 'idle' | 'offline' | 'challenge'

export interface LawInteractionCase {
  readonly universeId: UniverseId
  readonly doctrineId: string
  readonly doctrineIndex: number
  readonly wayfinderLawIds: readonly string[]
  readonly archiveShelfId: string
  readonly context: InteractionContext
  readonly rawMultiplier: number
  readonly cappedMultiplier: number
  readonly buildSignature: string
}

export interface LawDominanceFinding {
  readonly universeId: UniverseId
  readonly buildSignature: string
  readonly contextsLed: readonly InteractionContext[]
  readonly dominatesEveryContext: boolean
}

const CONTEXTS: readonly InteractionContext[] = ['active', 'idle', 'offline', 'challenge']
const UNIVERSES: readonly UniverseId[] = [
  'emberlight', 'tidefall', 'verdance', 'clockwork', 'prismata', 'tempest', 'canticle',
]

const WAYFINDER_SETS: readonly (readonly string[])[] = [
  [],
  ...WAYFINDER_NODES.map((law) => [law.id]),
  WAYFINDER_NODES.map((law) => law.id),
]

export function softCapLawMultiplier(raw: number, threshold = 1.85, retainedSlope = 0.22): number {
  if (!Number.isFinite(raw) || raw <= 0 || !Number.isFinite(threshold) || threshold < 1) return 1
  if (raw <= threshold) return raw
  const excess = raw - threshold
  return threshold + Math.tanh(excess * retainedSlope) / retainedSlope * 0.18
}

function effectStrength(effects: readonly { readonly kind: string; readonly value?: number }[]): number {
  return effects.reduce((score, effect) => {
    if (typeof effect.value !== 'number' || !Number.isFinite(effect.value)) return score
    if (effect.kind === 'globalMult' || effect.kind === 'clickMult' || effect.kind === 'genMult') {
      return score + Math.log2(Math.max(1, effect.value)) * 0.05
    }
    return score + Math.min(0.08, Math.abs(effect.value) * 0.02)
  }, 0)
}

function contextDoctrineIndex(context: InteractionContext): number {
  if (context === 'active') return 0
  if (context === 'idle') return 1
  if (context === 'challenge') return 2
  return 3
}

function wayfinderContextBonus(ids: readonly string[], context: InteractionContext): number {
  let bonus = ids.length * 0.015
  if (context === 'active' && ids.includes('steady-keel')) bonus += 0.035
  if (context === 'idle' && ids.includes('between-cargo')) bonus += 0.04
  if (context === 'offline' && ids.includes('remembered-kindling')) bonus += 0.05
  if (context === 'challenge' && ids.length === 0) bonus += 0.055
  return bonus
}

export function buildLawInteractionMatrix(): readonly LawInteractionCase[] {
  const cases: LawInteractionCase[] = []
  for (const universeId of UNIVERSES) {
    const pack = V2_UNIVERSE_BY_ID.get(universeId)!
    for (const [doctrineIndex, doctrine] of pack.economy.doctrines.entries()) {
      for (const wayfinderLawIds of WAYFINDER_SETS) {
        for (const [shelfIndex, shelf] of pack.archive.shelves.entries()) {
          for (const context of CONTEXTS) {
            const roleBonus = doctrineIndex === contextDoctrineIndex(context) ? 0.34 : 0
            const adjacencyBonus = Math.abs(doctrineIndex - contextDoctrineIndex(context)) === 1 ? 0.055 : 0
            const shelfBonus = shelfIndex === (contextDoctrineIndex(context) % 3) ? 0.065 : 0.015
            const rawMultiplier = 1.08
              + roleBonus
              + adjacencyBonus
              + shelfBonus
              + wayfinderContextBonus(wayfinderLawIds, context)
              + effectStrength(doctrine.effects)
            const buildSignature = `${doctrine.id}|${wayfinderLawIds.join('+') || 'none'}|${shelf.id}`
            cases.push({
              universeId,
              doctrineId: doctrine.id,
              doctrineIndex,
              wayfinderLawIds,
              archiveShelfId: shelf.id,
              context,
              rawMultiplier,
              cappedMultiplier: softCapLawMultiplier(rawMultiplier),
              buildSignature,
            })
          }
        }
      }
    }
  }
  return cases
}

export function detectLawDominance(
  matrix: readonly LawInteractionCase[],
): readonly LawDominanceFinding[] {
  const findings: LawDominanceFinding[] = []
  for (const universeId of UNIVERSES) {
    const leaders = new Map<string, Set<InteractionContext>>()
    for (const context of CONTEXTS) {
      const cases = matrix.filter((entry) => entry.universeId === universeId && entry.context === context)
      const best = Math.max(...cases.map((entry) => entry.cappedMultiplier))
      for (const candidate of cases.filter((entry) => Math.abs(entry.cappedMultiplier - best) < 1e-12)) {
        const contexts = leaders.get(candidate.buildSignature) ?? new Set<InteractionContext>()
        contexts.add(context)
        leaders.set(candidate.buildSignature, contexts)
      }
    }
    for (const [buildSignature, contexts] of leaders) {
      const contextsLed = CONTEXTS.filter((context) => contexts.has(context))
      findings.push({
        universeId,
        buildSignature,
        contextsLed,
        dominatesEveryContext: contextsLed.length === CONTEXTS.length,
      })
    }
  }
  return findings
}

export function validateLawInteractionMatrix(matrix: readonly LawInteractionCase[]): readonly string[] {
  const issues: string[] = []
  const expected = UNIVERSES.length * 4 * WAYFINDER_SETS.length * 3 * CONTEXTS.length
  if (matrix.length !== expected) issues.push(`expected ${expected} law interaction cases, received ${matrix.length}`)
  if (matrix.some((entry) => !Number.isFinite(entry.cappedMultiplier) || entry.cappedMultiplier < 1 || entry.cappedMultiplier > 2.25)) {
    issues.push('soft-capped law multipliers must remain finite in [1, 2.25]')
  }
  const findings = detectLawDominance(matrix)
  for (const finding of findings.filter((entry) => entry.dominatesEveryContext)) {
    issues.push(`${finding.universeId} has an all-context dominant build: ${finding.buildSignature}`)
  }
  for (const universeId of UNIVERSES) {
    const winningDoctrines = new Set(
      findings
        .filter((finding) => finding.universeId === universeId)
        .flatMap((finding) => finding.contextsLed.map(() => finding.buildSignature.split('|')[0])),
    )
    if (winningDoctrines.size < 4) issues.push(`${universeId} exposes fewer than four context-leading doctrines`)
  }
  return issues
}
