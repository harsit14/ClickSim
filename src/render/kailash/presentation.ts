import { KAILASH_V2_PACK } from '../../content/universes/kailash'
import { createAuthoredLokaPresentation } from '../loka-authored-presentation'

export const KAILASH_PRESENTATION = createAuthoredLokaPresentation(KAILASH_V2_PACK, {
  palette: { primary: '#63a9bf', secondary: '#c47d4f', highlight: '#e8edf2', shadow: '#1b3143', void: '#070b12' },
  primitives: ['polygon', 'branch', 'ribbon'],
  heartPrimitives: ['polygon', 'arc', 'ribbon'],
  generatorMotifs: [
    'snow shelf releasing one downward thread', 'patient blue-stone aperture', 'low moonlit ridge',
    'river braid through valley terraces', 'cedar refuge beside descending trail', 'slow glacier pressure bands',
    'ash meadow with visible returning shoots', 'far copper boundary behind stone shoulders', 'cloud stair and marked pass',
    'empty numbered pass interval', 'lit valley shelters around open commons', 'still high lake shore',
    'weathered cairn beside switchback', 'open shelter grove gate', 'five distinct horizon arcs',
    'seasonal slope bands with return path', 'incomplete ring opening toward descent', 'untouched summit above inhabited descent',
  ],
  heartPattern: 'sixteen numbered notches, current act marker, and incomplete copper ring around an empty still center',
  centralClearing: 'the Still Point and summit aperture remain entirely unoccupied',
})
