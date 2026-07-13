import { VISHNULOK_V2_PACK } from '../../content/universes/vishnulok'
import { createAuthoredLokaPresentation } from '../loka-authored-presentation'

export const VISHNULOK_PRESENTATION = createAuthoredLokaPresentation(VISHNULOK_V2_PACK, {
  palette: { primary: '#5577c8', secondary: '#6fa59a', highlight: '#f5e5ae', shadow: '#142750', void: '#050916' },
  primitives: ['arc', 'branch', 'ribbon'],
  heartPrimitives: ['arc', 'ribbon', 'polygon'],
  generatorMotifs: [
    'still drop held beside an open harbor', 'tidal thread joining two shelter marks', 'bearing current with visible burden bars',
    'porous refuge reef arch', 'returning school around open water', 'floating garden platform and pale wake',
    'paired confluence gate', 'restoring shoal with mended seam', 'living estuary boundary',
    'horizon keeper arch', 'four-season route wheel without weapon form', 'deepwater library terraces',
    'world current entering the living chart', 'distributed refuge archipelago', 'wide calm cosmic ocean band',
    'responsive order meridian', 'three shelter loops and a gold return', 'still horizon with moving depth line',
  ],
  heartPattern: 'segmented continuity rings, numbered shelter notches, and a return line around an unoccupied refuge',
  centralClearing: 'the open refuge remains unoccupied and every route returns outside its clearing',
})
