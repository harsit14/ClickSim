import { BRAHMALOK_V2_PACK } from '../../content/universes/brahmalok'
import { createAuthoredLokaPresentation } from '../loka-authored-presentation'

export const BRAHMALOK_PRESENTATION = createAuthoredLokaPresentation(BRAHMALOK_V2_PACK, {
  palette: { primary: '#d7a34c', secondary: '#7ebed2', highlight: '#fff0c7', shadow: '#38243a', void: '#080810' },
  primitives: ['branch', 'polygon', 'ribbon'],
  heartPrimitives: ['arc', 'polygon', 'branch'],
  generatorMotifs: [
    'single seed bed with one open furrow', 'measured water channel beside seed beds', 'reed-name terrace with blank title stone',
    'unclosed clay frame in the Form workshop', 'four low reciprocal garden paths', 'ruled hall with one revisable span',
    'loom joining four material obligations', 'open manuscript court with side margin', 'terrace of distinct naming stones',
    'workshop frames moved between courts', 'four-horizon colonnade', 'folio garden retaining earlier drafts',
    'petal contour family around open sky', 'court-to-court water measure', 'many-form workshop with visible gaps',
    'thousand-petal contour convergence', 'four court roads stopping before center', 'open lotus horizon with unclaimed square',
  ],
  heartPattern: 'four variable petal arcs and mode pattern around an empty manuscript square',
  centralClearing: 'the Lotus of Becoming and its unclaimed center square remain unobstructed',
})
