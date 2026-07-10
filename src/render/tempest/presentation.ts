import { TEMPEST_V2_PACK } from '../../content/universes/tempest'
import { createFuturePresentation } from '../future-presentation'

export const TEMPEST_PRESENTATION = createFuturePresentation(TEMPEST_V2_PACK, {
  palette: { primary: '#70c9ee', secondary: '#8e7dff', highlight: '#e3f7ff', shadow: '#17334b', void: '#050b12' },
  objectPrimitives: ['cloud', 'branch', 'arc'],
  heartPrimitives: ['arc', 'branch', 'ellipse'],
  pattern: 'bounded pressure cell, declared branching leader, and notched potential state',
  heartPattern: 'open eye wall, calm center, three numbered leaders, and a bounded charge ring',
})
