import { TEMPEST_V2_PACK } from '../../content/universes/tempest'
import { createFuturePresentation } from '../future-presentation'

export const TEMPEST_PRESENTATION = createFuturePresentation(TEMPEST_V2_PACK, {
  palette: { primary: '#5577c8', secondary: '#6fa59a', highlight: '#f5e5ae', shadow: '#142750', void: '#050916' },
  objectPrimitives: ['arc', 'ribbon', 'ellipse'],
  heartPrimitives: ['arc', 'ribbon', 'polygon'],
  pattern: 'indigo current, open refuge, declared correction, and gold returning line',
  heartPattern: 'three broad current loops around an unoccupied harbor with one complete return',
})
