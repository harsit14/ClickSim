import type { ScreenZone } from '../../content/universes/types'

export interface EmberlightDoctrineVisual {
  readonly id: string
  readonly visualSignature: string
  readonly screenZone: ScreenZone
  readonly geometryLabel: string
  readonly pattern: string
  readonly materials: readonly string[]
  readonly worldEffect: string
  readonly highContrastTreatment: string
  readonly reducedMotionTreatment: string
}

export const EMBERLIGHT_DOCTRINE_VISUALS = {
  forge: {
    id: 'ember-doctrine-forge',
    visualSignature: 'a vented anvil-shaped stellar foundry rooted beneath the Last Ember',
    screenZone: 'heart',
    geometryLabel: 'bipolar foundry arch with a dark anvil base',
    pattern: 'stacked chevrons over a cross-hatched foundation',
    materials: ['iron-dark stellar metal', 'contained gold plasma'],
    worldEffect: 'High-tier Kindlings align into one stable vertical production spine.',
    highContrastTreatment: 'double white foundry outline over a black anvil base',
    reducedMotionTreatment: 'four fixed heat notches fill as the production cycle completes',
  },
  hand: {
    id: 'ember-doctrine-hand',
    visualSignature: 'a five-point magnetic touch trace cupping the Last Ember without obscuring it',
    screenZone: 'heart',
    geometryLabel: 'open five-lobed magnetic handprint around Heart',
    pattern: 'five interrupted radial strokes with one bright contact notch',
    materials: ['ionized gold filament', 'white plasma contact'],
    worldEffect: 'Touch responses propagate outward through five fixed resonance paths.',
    highContrastTreatment: 'five numbered white paths with a solid center contact',
    reducedMotionTreatment: 'the active path changes locally from outline to solid',
  },
  sky: {
    id: 'ember-doctrine-sky',
    visualSignature: 'three forecast spectral paths descending across the far field toward open targets',
    screenZone: 'far',
    geometryLabel: 'three unequal Omen routes around a clear central aperture',
    pattern: 'dashed, double, and notched routes identify each opportunity',
    materials: ['meteor plasma', 'radio blue', 'lensing white'],
    worldEffect: 'Forecast routes reserve negative space for the next reachable Omen.',
    highContrastTreatment: 'numbered path shapes use solid, dashed, and double outlines',
    reducedMotionTreatment: 'route segments illuminate in place rather than traveling',
  },
  root: {
    id: 'ember-doctrine-root',
    visualSignature: 'banked cosmic filaments joining the stellar nursery to the Last Ember',
    screenZone: 'near',
    geometryLabel: 'branching low-tier filament foundation beneath Heart',
    pattern: 'root-like forks ending in ownership threshold knots',
    materials: ['banked ember ash', 'ionized nursery filament'],
    worldEffect: 'Foundational Kindlings become one persistent, readable nursery network.',
    highContrastTreatment: 'white branching routes terminate in numbered black knots',
    reducedMotionTreatment: 'connection thickness changes without route travel or shake',
  },
} as const satisfies Readonly<Record<string, EmberlightDoctrineVisual>>
