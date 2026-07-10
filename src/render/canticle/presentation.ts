import { CANTICLE_V2_PACK } from '../../content/universes/canticle'
import { createFuturePresentation } from '../future-presentation'

export const CANTICLE_PRESENTATION = createFuturePresentation(CANTICLE_V2_PACK, {
  palette: { primary: '#d89bc7', secondary: '#8ab8d6', highlight: '#fff0f7', shadow: '#3a2037', void: '#0c0710' },
  objectPrimitives: ['ellipse', 'ribbon', 'arc'],
  heartPrimitives: ['polygon', 'arc', 'ribbon'],
  pattern: 'source-labeled waveform, standing-wave nodes, and one bounded strategic rest',
  heartPattern: 'tensioned membrane, four node shapes, a visible propagation path, and one open rest interval',
})
