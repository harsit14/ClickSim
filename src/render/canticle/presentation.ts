import { CANTICLE_V2_PACK } from '../../content/universes/canticle'
import { createFuturePresentation } from '../future-presentation'

export const CANTICLE_PRESENTATION = createFuturePresentation(CANTICLE_V2_PACK, {
  palette: { primary: '#63a9bf', secondary: '#c47d4f', highlight: '#e8edf2', shadow: '#1b3143', void: '#070b12' },
  objectPrimitives: ['polygon', 'branch', 'arc'],
  heartPrimitives: ['polygon', 'ribbon', 'ellipse'],
  pattern: 'moonlit mountain terraces, silver river routes, open shelters, ash boundaries, and one incomplete copper ring',
  heartPattern: 'five-notched blue-stone summit, visible downward river path, and one unoccupied still point',
})
