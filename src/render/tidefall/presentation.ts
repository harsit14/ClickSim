export type TidefallPresentationDepth = 'back' | 'middle' | 'front'

export type TidefallPresentationPrimitive =
  | 'ellipse'
  | 'polygon'
  | 'ribbon'
  | 'arc'
  | 'branch'
  | 'frame'
  | 'cloud'

export type TidefallPresentationFill =
  | 'primary'
  | 'secondary'
  | 'highlight'
  | 'shadow'
  | 'void'

export interface TidefallPresentationLayer {
  readonly id: string
  readonly primitive: TidefallPresentationPrimitive
  readonly insetPercent: number
  readonly scaleX: number
  readonly scaleY: number
  readonly rotationDegrees: number
  readonly fill: TidefallPresentationFill
  readonly opacity: number
  readonly clipPath?: string
  readonly stroke?: 'none' | 'thin' | 'strong' | 'dashed'
}

export interface TidefallPresentationState {
  readonly geometryLabel: string
  readonly pattern: string
  readonly layers: readonly TidefallPresentationLayer[]
}

export type TidefallObjectPresentationStateId =
  | 'base'
  | '1'
  | '10'
  | '25'
  | '50'
  | '100'
  | 'reduced-motion'
  | 'low-quality'

export type TidefallHeartPresentationStateId = 'base' | 'reduced-motion' | 'low-quality'

export interface TidefallObjectPresentationDescriptor {
  readonly id: string
  readonly depth: TidefallPresentationDepth
  readonly occlusion: string
  readonly states: Readonly<Record<TidefallObjectPresentationStateId, TidefallPresentationState>>
}

export interface TidefallHeartPresentationDescriptor {
  readonly id: string
  readonly depth: TidefallPresentationDepth
  readonly occlusion: string
  readonly states: Readonly<Record<TidefallHeartPresentationStateId, TidefallPresentationState>>
}

export interface TidefallWorldStatePresentationDescriptor extends TidefallPresentationState {
  readonly id: string
  readonly depth: TidefallPresentationDepth
  readonly occlusion: string
}

type GeometryLabels = readonly [string, string, string, string, string, string, string, string]

function authoredLayers(
  id: string,
  primitive: TidefallPresentationPrimitive,
  fill: TidefallPresentationFill,
  scale: number,
  rotationDegrees: number,
  stroke: TidefallPresentationLayer['stroke'],
): readonly TidefallPresentationLayer[] {
  return [
    {
      id: `${id}-body`,
      primitive,
      insetPercent: 8,
      scaleX: scale,
      scaleY: Math.max(0.52, scale * 0.82),
      rotationDegrees,
      fill,
      opacity: 0.9,
      clipPath: 'polygon(4% 14%, 92% 4%, 100% 78%, 18% 100%, 0% 54%)',
      stroke,
    },
    {
      id: `${id}-pressure-mark`,
      primitive: primitive === 'cloud' ? 'arc' : 'ribbon',
      insetPercent: 18,
      scaleX: Math.max(0.58, scale * 0.86),
      scaleY: 0.62,
      rotationDegrees: -rotationDegrees / 2,
      fill: fill === 'shadow' || fill === 'void' ? 'primary' : 'highlight',
      opacity: 0.58,
      stroke: 'thin',
    },
  ]
}

function presentationState(
  id: string,
  geometryLabel: string,
  pattern: string,
  primitive: TidefallPresentationPrimitive,
  fill: TidefallPresentationFill,
  scale: number,
  rotationDegrees: number,
  stroke: TidefallPresentationLayer['stroke'],
): TidefallPresentationState {
  return {
    geometryLabel,
    pattern,
    layers: authoredLayers(id, primitive, fill, scale, rotationDegrees, stroke),
  }
}

function objectDescriptor(config: {
  readonly id: string
  readonly depth: TidefallPresentationDepth
  readonly occlusion: string
  readonly primitive: TidefallPresentationPrimitive
  readonly fill: TidefallPresentationFill
  readonly pattern: string
  readonly rotationDegrees?: number
  readonly labels: GeometryLabels
}): TidefallObjectPresentationDescriptor {
  const rotation = config.rotationDegrees ?? 0
  return {
    id: config.id,
    depth: config.depth,
    occlusion: config.occlusion,
    states: {
      base: presentationState(`${config.id}-base`, config.labels[0], `${config.pattern}; authored base`, config.primitive, config.fill, 0.82, rotation, 'thin'),
      '1': presentationState(`${config.id}-owned-1`, config.labels[1], `${config.pattern}; single mark`, config.primitive, config.fill, 0.72, rotation, 'thin'),
      '10': presentationState(`${config.id}-owned-10`, config.labels[2], `${config.pattern}; ten-count braid`, config.primitive, config.fill, 0.84, rotation + 2, 'thin'),
      '25': presentationState(`${config.id}-owned-25`, config.labels[3], `${config.pattern}; twenty-five-count lattice`, config.primitive, config.fill, 0.96, rotation - 2, 'strong'),
      '50': presentationState(`${config.id}-owned-50`, config.labels[4], `${config.pattern}; fifty-count infrastructure`, config.primitive, config.fill, 1.08, rotation + 3, 'strong'),
      '100': presentationState(`${config.id}-owned-100`, config.labels[5], `${config.pattern}; hundred-count named landmark`, config.primitive, config.fill, 1.2, rotation, 'strong'),
      'reduced-motion': presentationState(`${config.id}-reduced`, config.labels[6], `${config.pattern}; fixed phase marks`, config.primitive, config.fill, 1, 0, 'dashed'),
      'low-quality': presentationState(`${config.id}-low`, config.labels[7], `${config.pattern}; single simplified contour`, config.primitive, config.fill, 0.9, 0, 'strong'),
    },
  }
}

const TIDEFALL_PRESENTATION_OBJECTS = {
  'tide-kindling-droplet': objectDescriptor({ id: 'tide-kindling-droplet', depth: 'front', occlusion: 'one Heart radius clear; clips behind Tideheart rings', primitive: 'ellipse', fill: 'primary', pattern: 'ascending capillary beads', labels: ['buoyant Glow droplet', 'one suspended bead', 'a rosary of ten droplets', 'a capillary braid feeding nearby ripples', 'a curtain of rain flowing upward', 'the named First Reservoir', 'one bead above five fixed ascending contour marks', 'one teardrop with a grouped-count notch'] }),
  'tide-kindling-ripple': objectDescriptor({ id: 'tide-kindling-ripple', depth: 'front', occlusion: 'one and one-fifth Heart radii clear; arcs pass behind touch rings', primitive: 'arc', fill: 'highlight', pattern: 'concentric pressure transmission', labels: ['traveling pressure circle', 'one pressure ring', 'ten interlocking rings', 'a ripple lattice touching Tidepools', 'a basin-wide interference field', 'the Great Circular Current', 'three fixed concentric rings with a phase tick', 'two concentric arcs'] }),
  'tide-kindling-tidepool': objectDescriptor({ id: 'tide-kindling-tidepool', depth: 'front', occlusion: 'crescent basin stays below and outside Tideheart focus bounds', primitive: 'ellipse', fill: 'secondary', pattern: 'crescent waterline ticks', labels: ['moon-memory tidepool', 'one crescent basin', 'a chain of linked pools', 'pools exchanging capillary currents', 'a shoreless lagoon network', 'the Memory Littoral', 'crescent basin with four labeled waterline ticks', 'one basin and waterline'] }),
  'tide-kindling-current': objectDescriptor({ id: 'tide-kindling-current', depth: 'middle', occlusion: 'authored channel routes around the Heart with a full-radius gap', primitive: 'ribbon', fill: 'primary', pattern: 'directional current chevrons', rotationDegrees: -12, labels: ['continuous Glow current', 'one directed ribbon', 'a braided current', 'a current carrying luminous silt between pools', 'a mapped circulation gyre', 'the First World Current', 'fixed ribbon with repeated direction chevrons', 'single tapered ribbon'] }),
  'tide-kindling-reef-light': objectDescriptor({ id: 'tide-kindling-reef-light', depth: 'front', occlusion: 'branch tips stop before the Tideheart pressure halo', primitive: 'branch', fill: 'highlight', pattern: 'branching bioluminescent polyps', labels: ['bioluminescent reef settlement', 'one coral lantern', 'a branching reef cluster', 'a reef exchanging light with Tidepools', 'a city-scale reef shelf', 'the Lantern Commonwealth', 'branching reef with open and closed polyp markers', 'three-pronged reef lantern'] }),
  'tide-kindling-moonwake': objectDescriptor({ id: 'tide-kindling-moonwake', depth: 'middle', occlusion: 'silver route bends around the Heart and never crosses its focus target', primitive: 'ribbon', fill: 'highlight', pattern: 'parallel moonless wake lines', rotationDegrees: 8, labels: ['silver wake of an absent moon', 'one silver wake', 'ten parallel wake lines', 'a wake bending nearby currents', 'a horizon-length moon road', 'the Absent Moon Causeway', 'silver path with four phase stations', 'one crescent-ended path'] }),
  'tide-kindling-kelp-cathedral': objectDescriptor({ id: 'tide-kindling-kelp-cathedral', depth: 'middle', occlusion: 'vaulted fronds frame the Heart without covering its silhouette', primitive: 'branch', fill: 'secondary', pattern: 'vaulted kelp ribs and root bells', labels: ['inhabited kelp vault', 'one vaulted frond', 'a kelp chapel grove', 'root bells resonating with Reef Lights', 'a pelagic cathedral district', 'the Rootbell Basilica', 'vaulted kelp ribs with a crest bell marker', 'three kelp arches'] }),
  'tide-kindling-pearl-seed': objectDescriptor({ id: 'tide-kindling-pearl-seed', depth: 'middle', occlusion: 'pearl nurseries remain outside one and a half Heart radii', primitive: 'ellipse', fill: 'highlight', pattern: 'concentric nacre growth rings', labels: ['layered living pearl seed', 'one layered pearl', 'a nursery string of pearls', 'pearls feeding luminous tissue', 'a moon-pearl spawning bed', 'the Nacre Seedbank', 'concentric pearl layers with an exposed-core notch', 'ringed pearl'] }),
  'tide-kindling-bioluminance': objectDescriptor({ id: 'tide-kindling-bioluminance', depth: 'middle', occlusion: 'signal web fades locally behind the Tideheart focus halo', primitive: 'cloud', fill: 'primary', pattern: 'paired call-and-response lanterns', labels: ['living pelagic signal', 'one living lantern', 'a pulsing colony', 'a signal web crossing nearby shoals', 'a pelagic aurora layer', 'the Living Lantern Sea', 'alternating lantern shapes labeled call and response', 'paired luminous ovals'] }),
  'tide-kindling-drowned-beacon': objectDescriptor({ id: 'tide-kindling-drowned-beacon', depth: 'back', occlusion: 'beam sectors terminate before crossing the Tideheart', primitive: 'frame', fill: 'highlight', pattern: 'measured lighthouse beam sectors', rotationDegrees: -4, labels: ['submerged pressure lighthouse', 'one submerged tower', 'a line of beacon pylons', 'crossing beams mapping safe water', 'a drowned lighthouse city', 'the Keeper Meridian', 'tower with three fixed beam sectors', 'tower and wedge beam'] }),
  'tide-kindling-twin-tides': objectDescriptor({ id: 'tide-kindling-twin-tides', depth: 'back', occlusion: 'opposed crescents share a midpoint beyond the Heart clearance ring', primitive: 'arc', fill: 'secondary', pattern: 'counterweighted rise and fall crescents', labels: ['opposed water masses', 'one opposed crescent pair', 'ten linked tide pairs', 'paired tides driving local currents', 'a double-ocean circulation', 'the Countersea Engine', 'opposed crescents with rise and fall arrows', 'yin-yang tide crescents'] }),
  'tide-kindling-shoal-constellation': objectDescriptor({ id: 'tide-kindling-shoal-constellation', depth: 'back', occlusion: 'migration path bends behind beacon and Heart clearances', primitive: 'cloud', fill: 'primary', pattern: 'schooling diamond formations', labels: ['bioluminescent navigational shoal', 'one four-light shoal', 'a named school pattern', 'a shoal steering around beacons', 'a migration spanning the far field', 'the Pelagic Star Census', 'four formation diagrams joined by phase ticks', 'diamond shoal cluster'] }),
  'tide-kindling-abyssal-garden': objectDescriptor({ id: 'tide-kindling-abyssal-garden', depth: 'back', occlusion: 'vent flowers remain below the Heart waterline', primitive: 'branch', fill: 'secondary', pattern: 'paired hadal petals and vent lines', labels: ['pressure-fed trench flower', 'one vent flower', 'a trench flowerbed', 'gardens feeding visible spore currents', 'a horizon-scale abyssal bloom', 'the Hadal Conservatory', 'vent flowers with low and high tide petal poses', 'three-petal vent flower'] }),
  'tide-kindling-living-sea': objectDescriptor({ id: 'tide-kindling-living-sea', depth: 'back', occlusion: 'ecosystem layers frame all zones and remain behind interactive targets', primitive: 'cloud', fill: 'primary', pattern: 'layered ecosystem depth bands', labels: ['ocean-scale living organism', 'one coherent ecosystem basin', 'ten named current regions', 'the sea coordinating migrations', 'a world-organism changing the horizon', 'the Living Sea Polity', 'layered ecosystem cross-section with phase labels', 'three-layer ocean cross-section'] }),
  'tide-kindling-ocean-of-moons': objectDescriptor({ id: 'tide-kindling-ocean-of-moons', depth: 'back', occlusion: 'pressure lenses occupy the moonless horizon and avoid foreground targets', primitive: 'arc', fill: 'highlight', pattern: 'nested lunar pressure lenses', labels: ['remembered lunar pressure field', 'one moon-pressure lens', 'a lunar lens cluster', 'lenses steering world currents', 'a silver pull spanning the horizon', 'the Parliament of Absent Moons', 'nested lens arcs with a shared crest marker', 'three nested silver crescents'] }),
  'tide-kindling-world-current': objectDescriptor({ id: 'tide-kindling-world-current', depth: 'back', occlusion: 'world route passes behind every interactive object and Heart ring', primitive: 'ribbon', fill: 'primary', pattern: 'world-spanning directional hatching', rotationDegrees: 6, labels: ['complete world-current route', 'one horizon current', 'ten tributary routes', 'a chart joining all depth bands', 'planetary circulation infrastructure', 'the World Current Compact', 'complete route chart with directional hatching', 'one world-spanning S-curve'] }),
  'tide-kindling-deep-trench': objectDescriptor({ id: 'tide-kindling-deep-trench', depth: 'back', occlusion: 'trench wedge is confined below the Heart and clipped at the horizon', primitive: 'polygon', fill: 'void', pattern: 'descending hadal pressure contours', labels: ['unresolved descending pressure aperture', 'one mapped trench lip', 'a chain of sounding stations', 'pressure contours affecting nearby currents', 'a horizon-deep hadal system', 'the Trench That Answers', 'descending contour stack with a closed pressure door', 'dark wedge with three depth lines'] }),
  'tide-kindling-second-wave': objectDescriptor({ id: 'tide-kindling-second-wave', depth: 'back', occlusion: 'shoreless crest holds at the horizon behind the Tideheart', primitive: 'ribbon', fill: 'highlight', pattern: 'eighteen memory marks within a wave crest', labels: ['shoreless wave of collective memory', 'one impossible wave front', 'a procession of rising fronts', 'the wave carrying archive silhouettes', 'a horizon permanently reshaped by water', 'the Second Wave Civilization', 'one high wave containing eighteen labeled depth marks', 'single shoreless wave crest'] }),

  'tide-archive-phantom-moon': objectDescriptor({ id: 'tide-archive-phantom-moon', depth: 'back', occlusion: 'false reflection stays in the negative-space horizon', primitive: 'arc', fill: 'highlight', pattern: 'broken reflected crescent', labels: ['Phantom Moon record', 'Phantom Moon reflection', 'Phantom Moon reflection with ten sounding marks', 'Phantom Moon plate with twenty-five ripples', 'Phantom Moon horizon record', 'Phantom Moon complete plate', 'Phantom Moon fixed opposite-tide phases', 'Phantom Moon single broken crescent'] }),
  'tide-archive-pressure-bell': objectDescriptor({ id: 'tide-archive-pressure-bell', depth: 'front', occlusion: 'nested bell rings stop outside the Heart touch target', primitive: 'arc', fill: 'primary', pattern: 'seven-step contracted sounding rings', labels: ['Pressure Bell record', 'one Pressure Bell sounding', 'ten-bell pressure sequence', 'twenty-five-ring bell lattice', 'fifty-ring sounding field', 'Pressure Bell complete plate', 'seven fixed numbered bell rings', 'two pressure-bell arcs'] }),
  'tide-archive-pearl-nursery': objectDescriptor({ id: 'tide-archive-pearl-nursery', depth: 'front', occlusion: 'nursery cluster rests beside rather than over the Tideheart', primitive: 'ellipse', fill: 'highlight', pattern: 'shared luminous irritant and pearl rings', labels: ['Pearl Nursery record', 'one nursery pearl', 'ten-pearled nursery string', 'twenty-five-layer incubation bed', 'fifty-pearl living nursery', 'Pearl Nursery complete plate', 'fixed open and closed nursery membranes', 'one ringed nursery pearl'] }),
  'tide-archive-kelp-nebula': objectDescriptor({ id: 'tide-archive-kelp-nebula', depth: 'back', occlusion: 'inverted canopy remains outside the Heart column', primitive: 'branch', fill: 'secondary', pattern: 'inverted glass-kelp canopy', labels: ['Kelp Nebula record', 'one glass-kelp frond', 'ten-frond inverted canopy', 'twenty-five-spore kelp plate', 'fifty-frond floating forest', 'Kelp Nebula complete plate', 'fixed downward fronds and upward spores', 'three glass-kelp branches'] }),
  'tide-archive-quasar-sounding': objectDescriptor({ id: 'tide-archive-quasar-sounding', depth: 'middle', occlusion: 'sounding beam routes down a side channel clear of the Heart', primitive: 'ribbon', fill: 'highlight', pattern: 'descending and returning sounding pulse', labels: ['Quasar Sounding record', 'one weighted sounding line', 'ten-return pulse record', 'twenty-five-depth sounding plate', 'fifty-line depth census', 'Quasar Sounding complete plate', 'fixed descent and return stations', 'one beam and sounding hook'] }),
  'tide-archive-century-leviathan': objectDescriptor({ id: 'tide-archive-century-leviathan', depth: 'back', occlusion: 'continent shadow crosses only the horizon behind all targets', primitive: 'cloud', fill: 'shadow', pattern: 'three-notched long wake', rotationDegrees: -5, labels: ['Century Leviathan record', 'one distant Leviathan wake', 'ten salt-constellation marks', 'twenty-five-segment migration record', 'fifty-wake pelagic chart', 'Century Leviathan complete plate', 'three numbered fixed surfacing silhouettes', 'single whale shadow and three notches'] }),
  'tide-archive-blooming-trench': objectDescriptor({ id: 'tide-archive-blooming-trench', depth: 'back', occlusion: 'trench bloom is clipped below the Heart waterline', primitive: 'branch', fill: 'secondary', pattern: 'upward hadal flowering plume', labels: ['Blooming Trench record', 'one trench bloom', 'ten-petal vent record', 'twenty-five-plume trench plate', 'fifty-bloom hadal garden', 'Blooming Trench complete plate', 'fixed low and crest bloom poses', 'one three-petal trench bloom'] }),
  'tide-archive-black-mouth': objectDescriptor({ id: 'tide-archive-black-mouth', depth: 'back', occlusion: 'pressure aperture stays below and behind the Tideheart', primitive: 'polygon', fill: 'void', pattern: 'inward contour teeth', labels: ['The Black Mouth record', 'one pressure aperture', 'ten inward contour teeth', 'twenty-five-depth aperture chart', 'fifty-contour black current', 'The Black Mouth complete plate', 'fixed numbered inward contours', 'one black wedge and three teeth'] }),
  'tide-archive-moon-pearl': objectDescriptor({ id: 'tide-archive-moon-pearl', depth: 'front', occlusion: 'record pearl is offset from the Tideheart by one full diameter', primitive: 'ellipse', fill: 'highlight', pattern: 'crescent lens inside nacre rings', labels: ['Moon Pearl record', 'one stored tide pearl', 'ten-layer Moon Pearl', 'twenty-five-ring compressed tide', 'fifty-layer lunar lens plate', 'Moon Pearl complete plate', 'fixed numbered nacre layers', 'one pearl and crescent lens'] }),
  'tide-archive-tideclock': objectDescriptor({ id: 'tide-archive-tideclock', depth: 'front', occlusion: 'dial remains adjacent to and never beneath the Heart focus label', primitive: 'frame', fill: 'primary', pattern: 'four-lobed predictive waterline dial', labels: ['Tideclock record', 'one four-lobed Tideclock', 'ten-tick tide dial', 'twenty-five-mark pressure clock', 'fifty-mark water escapement', 'Tideclock complete plate', 'four fixed labeled tide positions', 'one dial with four notches'] }),
  'tide-archive-red-tide-beacon': objectDescriptor({ id: 'tide-archive-red-tide-beacon', depth: 'middle', occlusion: 'warning petals remain beyond the Heart pressure halo', primitive: 'branch', fill: 'secondary', pattern: 'keeper-message petal flashes', labels: ['Red Tide Beacon record', 'one warning bloom beacon', 'ten-petal keeper signal', 'twenty-five-mark folded record', 'fifty-flash navigation code', 'Red Tide Beacon complete plate', 'fixed message petals with text strip', 'one flower beacon outline'] }),
  'tide-archive-world-current-eye': objectDescriptor({ id: 'tide-archive-world-current-eye', depth: 'back', occlusion: 'oceanic eye occupies the far horizon behind World Current routes', primitive: 'ellipse', fill: 'secondary', pattern: 'four world-current paths through a pupil', labels: ['World Current Eye record', 'one oceanic current lens', 'ten-current eye chart', 'twenty-five-route world lens', 'fifty-route abyssal map', 'World Current Eye complete plate', 'fixed four-world route diagram', 'one eye crossed by four lines'] }),

  'tide-omen-object-spring-tide': objectDescriptor({ id: 'tide-omen-object-spring-tide', depth: 'front', occlusion: 'reachable crest bubble stops outside the Heart touch radius', primitive: 'arc', fill: 'primary', pattern: 'three ascending crest bands', labels: ['Spring Tide Omen', 'Spring Tide single opportunity', 'Spring Tide ten-mark discovery state', 'Spring Tide twenty-five-mark chain state', 'Spring Tide fifty-mark current state', 'Spring Tide mastered silhouette', 'three fixed numbered rising arcs', 'one broad crest arc'] }),
  'tide-omen-object-undertow': objectDescriptor({ id: 'tide-omen-object-undertow', depth: 'front', occlusion: 'inward target has its own hit region and does not cover the Heart', primitive: 'polygon', fill: 'shadow', pattern: 'outside-in pressure teeth', labels: ['Undertow Omen', 'Undertow single opportunity', 'Undertow ten-mark discovery state', 'Undertow twenty-five-mark chain state', 'Undertow fifty-mark current state', 'Undertow mastered silhouette', 'fixed numbered inward contours', 'one inward pressure aperture'] }),
  'tide-omen-object-moon-pearl': objectDescriptor({ id: 'tide-omen-object-moon-pearl', depth: 'front', occlusion: 'drifting pearl path bends around the Tideheart focus target', primitive: 'ellipse', fill: 'highlight', pattern: 'ordered nacre opening rings', labels: ['Moon Pearl Omen', 'Moon Pearl single opportunity', 'Moon Pearl ten-mark discovery state', 'Moon Pearl twenty-five-mark chain state', 'Moon Pearl fifty-mark current state', 'Moon Pearl mastered silhouette', 'fixed numbered nacre openings', 'one pearl with crescent core'] }),
  'tide-omen-object-abyssal-bloom': objectDescriptor({ id: 'tide-omen-object-abyssal-bloom', depth: 'front', occlusion: 'vent line ends below the Heart and presents petals beside it', primitive: 'branch', fill: 'secondary', pattern: 'six symmetric opening petals', labels: ['Abyssal Bloom Omen', 'Abyssal Bloom single opportunity', 'Abyssal Bloom ten-mark discovery state', 'Abyssal Bloom twenty-five-mark chain state', 'Abyssal Bloom fifty-mark current state', 'Abyssal Bloom mastered silhouette', 'six fixed numbered petals', 'one three-petal vent flower'] }),
  'tide-omen-object-leviathan-passage': objectDescriptor({ id: 'tide-omen-object-leviathan-passage', depth: 'back', occlusion: 'migration remains on the horizon behind the Heart and foreground Omens', primitive: 'cloud', fill: 'shadow', pattern: 'three forecast surfacing wakes', rotationDegrees: -6, labels: ['Leviathan Passage Omen', 'first Leviathan surfacing', 'second Leviathan surfacing route', 'third Leviathan surfacing route', 'complete three-wake passage', 'Century Leviathan followed silhouette', 'three fixed numbered surfacing shadows', 'single whale shadow with three wake notches'] }),
  'tide-beacon-world-current-column': objectDescriptor({ id: 'tide-beacon-world-current-column', depth: 'back', occlusion: 'lighthouse column holds at the horizon behind every focusable object', primitive: 'frame', fill: 'highlight', pattern: 'three circulating depth bands around a fixed column', labels: ['Shoreless Lighthouse Beacon', 'one stable Beacon column', 'ten-mark Beacon sounding', 'twenty-five-band Beacon route', 'fifty-current lighthouse field', 'The Shoreless Lighthouse complete silhouette', 'fixed lighthouse with three labeled bands', 'single lighthouse column and wave crest'] }),
} as const satisfies Readonly<Record<string, TidefallObjectPresentationDescriptor>>

const TIDEFALL_HEART_PRESENTATION: TidefallHeartPresentationDescriptor = {
  id: 'tidefall-tideheart',
  depth: 'front',
  occlusion: 'primary focus target; every world object preserves its authored clearance',
  states: {
    base: {
      geometryLabel: 'asymmetric nacre pearl enclosing a pressure void and three touch rings',
      pattern: 'compressed center; broken crescent; three outward pressure bands',
      layers: [
        { id: 'tideheart-nacre-shell', primitive: 'ellipse', insetPercent: 2, scaleX: 1, scaleY: 0.92, rotationDegrees: -7, fill: 'highlight', opacity: 0.96, stroke: 'strong' },
        { id: 'tideheart-pressure-void', primitive: 'ellipse', insetPercent: 24, scaleX: 0.62, scaleY: 0.7, rotationDegrees: 14, fill: 'void', opacity: 1, clipPath: 'ellipse(42% 50% at 58% 50%)', stroke: 'thin' },
        { id: 'tideheart-pressure-rings', primitive: 'arc', insetPercent: 0, scaleX: 1.22, scaleY: 1.08, rotationDegrees: 0, fill: 'primary', opacity: 0.66, stroke: 'strong' },
      ],
    },
    'reduced-motion': {
      geometryLabel: 'Tideheart with three fixed numbered pressure-ring positions',
      pattern: 'static phase stations one, two, three; local contrast only',
      layers: [
        { id: 'tideheart-reduced-shell', primitive: 'ellipse', insetPercent: 4, scaleX: 1, scaleY: 0.92, rotationDegrees: 0, fill: 'highlight', opacity: 1, stroke: 'strong' },
        { id: 'tideheart-reduced-void', primitive: 'ellipse', insetPercent: 26, scaleX: 0.6, scaleY: 0.68, rotationDegrees: 0, fill: 'void', opacity: 1, stroke: 'strong' },
        { id: 'tideheart-reduced-rings', primitive: 'arc', insetPercent: 0, scaleX: 1.18, scaleY: 1.04, rotationDegrees: 0, fill: 'primary', opacity: 0.82, stroke: 'dashed' },
      ],
    },
    'low-quality': {
      geometryLabel: 'high-contrast pearl with one dark crescent and full focus bounds',
      pattern: 'single shell contour; single crescent void',
      layers: [
        { id: 'tideheart-low-shell', primitive: 'ellipse', insetPercent: 4, scaleX: 1, scaleY: 0.92, rotationDegrees: 0, fill: 'highlight', opacity: 1, stroke: 'strong' },
        { id: 'tideheart-low-void', primitive: 'ellipse', insetPercent: 28, scaleX: 0.58, scaleY: 0.66, rotationDegrees: 0, fill: 'void', opacity: 1, stroke: 'strong' },
      ],
    },
  },
}

const TIDEFALL_WORLD_STATES: Readonly<Record<'rising' | 'high' | 'falling' | 'low', TidefallWorldStatePresentationDescriptor>> = {
  rising: {
    id: 'tide-rising', depth: 'back', occlusion: 'waterline behind all interactive objects',
    geometryLabel: 'three upward pressure arcs lifting suspended silt', pattern: 'ascending ripple spacing and up-chevron hatching',
    layers: [
      { id: 'tide-rising-waterline', primitive: 'ribbon', insetPercent: 4, scaleX: 1.1, scaleY: 0.72, rotationDegrees: -4, fill: 'primary', opacity: 0.34, stroke: 'thin' },
      { id: 'tide-rising-arcs', primitive: 'arc', insetPercent: 10, scaleX: 1, scaleY: 0.9, rotationDegrees: 0, fill: 'highlight', opacity: 0.62, stroke: 'dashed' },
    ],
  },
  high: {
    id: 'tide-high', depth: 'back', occlusion: 'broad crest behind all interactive objects',
    geometryLabel: 'broad crown crest across dense horizontal pressure bands', pattern: 'dense crest bars and double-line crown',
    layers: [
      { id: 'tide-high-waterline', primitive: 'ribbon', insetPercent: 0, scaleX: 1.2, scaleY: 0.94, rotationDegrees: 0, fill: 'primary', opacity: 0.5, stroke: 'strong' },
      { id: 'tide-high-crown', primitive: 'arc', insetPercent: 6, scaleX: 1.08, scaleY: 1, rotationDegrees: 0, fill: 'highlight', opacity: 0.76, stroke: 'strong' },
    ],
  },
  falling: {
    id: 'tide-falling', depth: 'back', occlusion: 'waterline behind all interactive objects',
    geometryLabel: 'three downward pressure arcs settling suspended silt', pattern: 'descending ripple spacing and down-chevron hatching',
    layers: [
      { id: 'tide-falling-waterline', primitive: 'ribbon', insetPercent: 8, scaleX: 1.04, scaleY: 0.66, rotationDegrees: 4, fill: 'secondary', opacity: 0.36, stroke: 'thin' },
      { id: 'tide-falling-arcs', primitive: 'arc', insetPercent: 12, scaleX: 0.96, scaleY: 0.84, rotationDegrees: 180, fill: 'highlight', opacity: 0.58, stroke: 'dashed' },
    ],
  },
  low: {
    id: 'tide-low', depth: 'back', occlusion: 'deep basin below and behind all interactive objects',
    geometryLabel: 'deep basin crescent beneath widely spaced pressure contours', pattern: 'wide contour spacing and double-line basin',
    layers: [
      { id: 'tide-low-basin', primitive: 'arc', insetPercent: 16, scaleX: 0.9, scaleY: 0.56, rotationDegrees: 180, fill: 'secondary', opacity: 0.44, stroke: 'strong' },
      { id: 'tide-low-contours', primitive: 'ribbon', insetPercent: 22, scaleX: 0.84, scaleY: 0.48, rotationDegrees: 0, fill: 'shadow', opacity: 0.72, stroke: 'dashed' },
    ],
  },
}

export const TIDEFALL_PRESENTATION = {
  universeId: 'tidefall',
  palette: {
    primary: '#58ded8',
    secondary: '#777fe8',
    highlight: '#b9fff2',
    shadow: 'rgba(7, 24, 34, 0.82)',
    void: '#030b12',
  },
  heart: TIDEFALL_HEART_PRESENTATION,
  objects: TIDEFALL_PRESENTATION_OBJECTS,
  worldStates: TIDEFALL_WORLD_STATES,
} as const
