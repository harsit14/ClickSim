import { PRISMATA_V2_PACK } from '../../content/universes/prismata'
import { createFuturePresentation } from '../future-presentation'

export const PRISMATA_PRESENTATION = createFuturePresentation(PRISMATA_V2_PACK, {
  palette: { primary: '#a68cff', secondary: '#62d8ff', highlight: '#fff8ff', shadow: '#28203f', void: '#070812' },
  objectPrimitives: ['polygon', 'ribbon', 'arc'],
  heartPrimitives: ['ellipse', 'polygon', 'ribbon'],
  pattern: 'labeled optical path, functional aperture, and separated component bands',
  heartPattern: 'asymmetric lens triplet, hexagonal white aperture, and six patterned wavelength notches',
})
