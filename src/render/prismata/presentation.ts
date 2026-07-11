import { PRISMATA_V2_PACK } from '../../content/universes/prismata'
import { createFuturePresentation } from '../future-presentation'

export const PRISMATA_PRESENTATION = createFuturePresentation(PRISMATA_V2_PACK, {
  palette: { primary: '#d7a34c', secondary: '#7ebed2', highlight: '#fff0c7', shadow: '#38243a', void: '#080810' },
  objectPrimitives: ['arc', 'ribbon', 'polygon'],
  heartPrimitives: ['arc', 'ellipse', 'polygon'],
  pattern: 'lotus-fiber manuscript, four-direction construction marks, and an intentionally open margin',
  heartPattern: 'nested lotus whorls around an empty manuscript square with seed, measure, name, and form marks',
})
