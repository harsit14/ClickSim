export type SetPieceEntrance = 'kindle' | 'build' | 'condense' | 'draw'
export type SetPiecePathRole = 'body' | 'light' | 'shadow' | 'line' | 'void'

export interface SetPiecePathLayer {
  readonly id: string
  readonly role: SetPiecePathRole
  readonly d: string
  readonly fillRule?: 'nonzero' | 'evenodd'
}

export interface SetPieceStage {
  readonly objectId: string
  readonly sourceId: string
  readonly name: string
  readonly entrance: SetPieceEntrance
  readonly paths: readonly [SetPiecePathLayer, ...SetPiecePathLayer[]]
}

export interface AuthoredSetPiece {
  readonly id: string
  readonly name: string
  readonly stages: readonly [SetPieceStage, SetPieceStage]
}

const path = (
  id: string,
  role: SetPiecePathRole,
  d: string,
  fillRule?: SetPiecePathLayer['fillRule'],
): SetPiecePathLayer => ({ id, role, d, ...(fillRule ? { fillRule } : {}) })

/**
 * Nine explicitly drawn lifecycle families. These are path assets, not instructions
 * for a renderer to stack generic primitives. Each economy tier keeps its stable ID.
 */
export const EMBERLIGHT_SET_PIECES: readonly AuthoredSetPiece[] = [
  {
    id: 'ember-exhale', name: 'The Ember Exhale', stages: [
      {
        objectId: 'ember-kindling-spark', sourceId: 'spark', name: 'Spark', entrance: 'kindle', paths: [
          path('spark-body', 'body', 'M50 3 L58 35 L87 22 L66 47 L97 54 L64 61 L78 92 L54 68 L37 98 L39 65 L7 75 L34 54 L8 35 L42 40 Z'),
          path('spark-core', 'light', 'M50 27 C61 34 65 43 60 53 C57 62 47 67 39 59 C31 51 35 38 50 27 Z'),
        ],
      },
      {
        objectId: 'ember-kindling-wisp', sourceId: 'wisp', name: 'Wisp', entrance: 'kindle', paths: [
          path('wisp-body', 'body', 'M63 8 C79 26 78 43 64 53 C53 62 46 72 49 94 C28 81 25 62 38 49 C48 39 51 25 48 12 C54 18 58 18 63 8 Z'),
          path('wisp-tail', 'line', 'M47 88 C30 76 20 64 22 48 C23 39 28 32 36 27'),
          path('wisp-core', 'light', 'M58 25 C67 35 65 45 57 49 C49 53 43 45 47 37 C50 32 53 29 58 25 Z'),
        ],
      },
    ],
  },
  {
    id: 'kept-fire', name: 'The Kept Fire', stages: [
      {
        objectId: 'ember-kindling-hearth', sourceId: 'hearth', name: 'Hearth', entrance: 'build', paths: [
          path('hearth-stones', 'body', 'M7 67 C12 52 27 45 50 45 C73 45 88 52 93 67 L82 85 C61 94 39 94 18 85 Z M22 66 C29 76 71 76 78 66 C66 58 34 58 22 66 Z', 'evenodd'),
          path('hearth-flame', 'light', 'M51 12 C65 29 68 40 59 52 C53 60 40 58 36 49 C31 37 42 29 51 12 Z'),
        ],
      },
      {
        objectId: 'ember-kindling-kiln', sourceId: 'kiln', name: 'Kiln', entrance: 'build', paths: [
          path('kiln-dome', 'body', 'M14 86 L14 54 C14 26 29 10 50 10 C71 10 86 26 86 54 L86 86 Z M37 86 L37 60 C37 50 43 44 50 44 C57 44 63 50 63 60 L63 86 Z', 'evenodd'),
          path('kiln-vent', 'shadow', 'M45 8 L55 8 L58 27 L42 27 Z'),
          path('kiln-mouth', 'light', 'M42 82 L42 61 C42 53 46 49 50 49 C54 49 58 53 58 61 L58 82 Z'),
        ],
      },
    ],
  },
  {
    id: 'industry-signal', name: 'The Making Signal', stages: [
      {
        objectId: 'ember-kindling-forge', sourceId: 'forge', name: 'Forge', entrance: 'build', paths: [
          path('forge-house', 'body', 'M10 88 L10 43 L39 18 L70 39 L70 88 Z M70 88 L70 26 L86 26 L86 88 Z'),
          path('forge-mouth', 'void', 'M27 88 L27 58 L56 58 L56 88 Z'),
          path('forge-flame', 'light', 'M42 50 C52 40 57 31 53 21 C66 32 63 46 54 53 Z'),
          path('forge-sparks', 'line', 'M78 17 L83 7 M87 21 L96 16 M74 14 L70 5'),
        ],
      },
      {
        objectId: 'ember-kindling-beacon', sourceId: 'beacon', name: 'Beacon', entrance: 'build', paths: [
          path('beacon-tower', 'body', 'M38 94 L44 30 L56 30 L63 94 Z'),
          path('beacon-lens', 'body', 'M29 28 L38 12 L62 12 L72 28 L62 42 L38 42 Z'),
          path('beacon-light', 'light', 'M39 25 L50 17 L61 25 L50 34 Z'),
        ],
      },
    ],
  },
  {
    id: 'horizon-seed', name: 'The Horizon Seed', stages: [
      {
        objectId: 'ember-kindling-titan', sourceId: 'titan', name: 'Furnace Titan', entrance: 'build', paths: [
          path('titan-mass', 'body', 'M5 94 L13 69 L27 61 L31 34 L43 19 L57 19 L69 34 L73 61 L87 69 L95 94 Z'),
          path('titan-core', 'light', 'M45 33 L56 33 L61 75 L50 87 L39 75 Z'),
          path('titan-vents', 'void', 'M22 70 L36 65 L34 78 L18 82 Z M64 65 L79 70 L82 82 L66 78 Z'),
        ],
      },
      {
        objectId: 'ember-kindling-starseed', sourceId: 'starseed', name: 'Star Seed', entrance: 'condense', paths: [
          path('seed-shell', 'body', 'M50 5 C75 16 86 39 77 65 C69 88 50 98 31 87 C10 75 8 49 22 27 C30 15 40 8 50 5 Z'),
          path('seed-seam', 'line', 'M52 12 C40 30 41 46 52 58 C61 69 61 82 52 93'),
          path('seed-core', 'light', 'M49 43 C60 45 63 55 56 63 C49 70 38 63 39 54 C40 48 43 45 49 43 Z'),
        ],
      },
    ],
  },
  {
    id: 'stellar-birth', name: 'The Stellar Birth', stages: [
      {
        objectId: 'ember-kindling-protostar', sourceId: 'protostar', name: 'Protostar', entrance: 'condense', paths: [
          path('proto-cocoon', 'body', 'M50 13 C68 13 79 29 75 47 C72 65 62 82 50 91 C38 82 28 65 25 47 C21 29 32 13 50 13 Z'),
          path('proto-disk', 'shadow', 'M4 51 C20 38 80 38 96 51 C77 61 23 61 4 51 Z'),
          path('proto-jets', 'line', 'M50 38 L50 3 M50 65 L50 98'),
          path('proto-core', 'light', 'M50 38 C61 38 66 49 60 58 C55 66 43 66 39 58 C34 49 39 38 50 38 Z'),
        ],
      },
      {
        objectId: 'ember-kindling-sun', sourceId: 'sun', name: 'Sun', entrance: 'condense', paths: [
          path('sun-crown', 'body', 'M50 2 L58 19 L73 8 L74 27 L93 24 L82 40 L99 50 L81 58 L92 75 L73 72 L72 93 L57 81 L49 99 L42 81 L26 92 L27 72 L7 75 L18 58 L1 49 L19 41 L8 25 L27 28 L28 8 L43 20 Z'),
          path('sun-disk', 'light', 'M50 22 C68 22 79 35 79 50 C79 67 67 79 50 79 C33 79 21 67 21 50 C21 34 33 22 50 22 Z'),
        ],
      },
    ],
  },
  {
    id: 'stellar-relations', name: 'The Drawn Sky', stages: [
      {
        objectId: 'ember-kindling-binary', sourceId: 'binary', name: 'Binary Pair', entrance: 'condense', paths: [
          path('binary-large', 'body', 'M32 22 C47 22 57 34 57 48 C57 63 46 74 32 74 C17 74 7 63 7 48 C7 34 17 22 32 22 Z'),
          path('binary-small', 'body', 'M73 38 C84 38 93 47 93 58 C93 69 84 78 73 78 C62 78 54 69 54 58 C54 47 62 38 73 38 Z'),
          path('binary-bridge', 'line', 'M48 42 C57 37 65 39 71 47'),
          path('binary-center', 'light', 'M50 49 L57 55 L50 62 L43 55 Z'),
        ],
      },
      {
        objectId: 'ember-kindling-constellation', sourceId: 'constellation', name: 'Constellation', entrance: 'draw', paths: [
          path('constellation-lines', 'line', 'M9 76 L25 31 L47 55 L61 14 L78 44 L93 24 M47 55 L72 82 L78 44'),
          path('constellation-nodes', 'body', 'M9 69 L16 76 L9 83 L2 76 Z M25 24 L32 31 L25 38 L18 31 Z M47 48 L54 55 L47 62 L40 55 Z M61 7 L68 14 L61 21 L54 14 Z M78 37 L85 44 L78 51 L71 44 Z M93 17 L100 24 L93 31 L86 24 Z M72 75 L79 82 L72 89 L65 82 Z'),
        ],
      },
    ],
  },
  {
    id: 'deep-sky', name: 'The Deep Sky', stages: [
      {
        objectId: 'ember-kindling-nebula', sourceId: 'nebula', name: 'Nebula Garden', entrance: 'condense', paths: [
          path('nebula-cloud', 'body', 'M4 62 C3 45 17 34 32 36 C34 18 54 9 68 22 C83 18 97 31 92 47 C103 57 94 77 79 77 C69 94 45 91 38 79 C22 87 6 78 4 62 Z'),
          path('nebula-pillar', 'void', 'M48 89 C42 72 46 61 40 48 C35 37 42 26 54 23 C51 39 60 49 56 62 C53 72 59 82 63 91 Z'),
          path('nebula-stars', 'light', 'M25 48 L29 55 L37 57 L30 62 L31 70 L25 65 L18 70 L20 62 L13 57 L21 55 Z M75 35 L79 42 L87 44 L80 49 L81 57 L75 52 L68 57 L70 49 L63 44 L71 42 Z'),
        ],
      },
      {
        objectId: 'ember-kindling-galaxy', sourceId: 'galaxy', name: 'Galaxy', entrance: 'condense', paths: [
          path('galaxy-arms', 'body', 'M5 55 C18 22 59 8 88 24 C62 21 43 31 38 45 C62 34 87 40 97 58 C76 49 55 51 48 61 C66 57 81 65 85 80 C65 70 43 72 28 84 C39 67 31 57 5 55 Z'),
          path('galaxy-lane', 'void', 'M9 58 C32 48 66 46 94 58 C71 55 43 58 22 70 Z'),
          path('galaxy-core', 'light', 'M50 43 C60 43 67 50 64 58 C61 67 47 69 40 61 C33 52 39 43 50 43 Z'),
        ],
      },
    ],
  },
  {
    id: 'cosmic-topology', name: 'The Cosmic Topology', stages: [
      {
        objectId: 'ember-kindling-supercluster', sourceId: 'supercluster', name: 'Supercluster', entrance: 'condense', paths: [
          path('cluster-thread', 'line', 'M12 69 C28 51 39 39 52 46 C66 54 72 29 89 21 M52 46 C56 66 70 75 87 79'),
          path('cluster-knots', 'body', 'M12 57 C24 57 31 65 29 75 C27 85 14 90 5 82 C-3 75 1 60 12 57 Z M52 35 C64 35 71 43 69 53 C67 63 54 68 45 60 C37 53 41 38 52 35 Z M89 10 C99 11 104 20 99 29 C95 38 82 38 77 29 C72 20 79 10 89 10 Z M87 68 C98 68 104 78 99 87 C94 96 81 95 77 86 C73 78 78 69 87 68 Z'),
        ],
      },
      {
        objectId: 'ember-kindling-web', sourceId: 'web', name: 'Cosmic Web', entrance: 'draw', paths: [
          path('web-routes', 'line', 'M5 83 L24 58 L13 29 L39 41 L51 8 L62 38 L91 20 L76 55 L96 78 L64 69 L48 94 L36 65 Z M24 58 L62 38 M39 41 L64 69 M13 29 L51 8 M76 55 L91 20'),
          path('web-nodes', 'body', 'M5 77 L11 83 L5 89 L-1 83 Z M24 52 L30 58 L24 64 L18 58 Z M13 23 L19 29 L13 35 L7 29 Z M39 35 L45 41 L39 47 L33 41 Z M51 2 L57 8 L51 14 L45 8 Z M62 32 L68 38 L62 44 L56 38 Z M91 14 L97 20 L91 26 L85 20 Z M76 49 L82 55 L76 61 L70 55 Z M96 72 L102 78 L96 84 L90 78 Z M64 63 L70 69 L64 75 L58 69 Z M48 88 L54 94 L48 100 L42 94 Z M36 59 L42 65 L36 71 L30 65 Z'),
        ],
      },
    ],
  },
  {
    id: 'answer', name: 'The Answering Horizon', stages: [
      {
        objectId: 'ember-kindling-loom', sourceId: 'loom', name: 'Deep Loom', entrance: 'draw', paths: [
          path('loom-frame', 'body', 'M12 94 L12 8 L27 8 L27 21 L73 21 L73 8 L88 8 L88 94 L73 94 L73 80 L27 80 L27 94 Z'),
          path('loom-absence', 'void', 'M32 27 L68 27 L68 75 L32 75 Z'),
          path('loom-threads', 'line', 'M27 29 L73 42 M27 44 L73 57 M27 59 L73 72 M38 21 L38 80 M51 21 L51 80 M64 21 L64 80'),
        ],
      },
      {
        objectId: 'ember-kindling-ember2', sourceId: 'ember2', name: 'The Second Ember', entrance: 'kindle', paths: [
          path('answer-crown', 'body', 'M50 4 L58 31 L82 18 L69 42 L96 50 L69 58 L82 83 L58 70 L50 97 L42 70 L18 83 L31 58 L4 50 L31 42 L18 18 L42 31 Z'),
          path('answer-void', 'void', 'M50 29 C63 29 72 38 72 50 C72 62 63 71 50 71 C37 71 28 62 28 50 C28 38 37 29 50 29 Z'),
          path('answer-core', 'light', 'M50 39 C57 39 62 44 62 50 C62 57 57 62 50 62 C43 62 38 57 38 50 C38 44 43 39 50 39 Z'),
        ],
      },
    ],
  },
] as const

export const EMBERLIGHT_SET_PIECE_STAGE_BY_OBJECT_ID: ReadonlyMap<string, SetPieceStage> = new Map(
  EMBERLIGHT_SET_PIECES.flatMap((setPiece) => setPiece.stages.map((stage) => [stage.objectId, stage] as const)),
)

export function emberlightSetPieceStage(objectId: string): SetPieceStage | null {
  return EMBERLIGHT_SET_PIECE_STAGE_BY_OBJECT_ID.get(objectId) ?? null
}

export interface SetPieceRegistryIssue {
  readonly path: string
  readonly message: string
}

export function validateEmberlightSetPieceRegistry(): readonly SetPieceRegistryIssue[] {
  const issues: SetPieceRegistryIssue[] = []
  const setPieceIds = new Set<string>()
  const objectIds = new Set<string>()
  const silhouettes = new Set<string>()
  if (EMBERLIGHT_SET_PIECES.length !== 9) {
    issues.push({ path: 'setPieces', message: 'Emberlight must register exactly nine lifecycle set pieces.' })
  }
  for (const [setPieceIndex, setPiece] of EMBERLIGHT_SET_PIECES.entries()) {
    const setPiecePath = `setPieces[${setPieceIndex}]`
    if (setPieceIds.has(setPiece.id)) issues.push({ path: `${setPiecePath}.id`, message: 'Set-piece ID must be unique.' })
    setPieceIds.add(setPiece.id)
    if (setPiece.stages.length !== 2) issues.push({ path: `${setPiecePath}.stages`, message: 'Each lifecycle set piece must own two economy stages.' })
    for (const [stageIndex, stage] of setPiece.stages.entries()) {
      const stagePath = `${setPiecePath}.stages[${stageIndex}]`
      if (objectIds.has(stage.objectId)) issues.push({ path: `${stagePath}.objectId`, message: 'Object ID must be registered once.' })
      objectIds.add(stage.objectId)
      if (stage.entrance === ('fade' as SetPieceEntrance)) issues.push({ path: `${stagePath}.entrance`, message: 'Matter may not enter by fading.' })
      const fingerprint = stage.paths.map(({ d }) => d).join('|')
      if (silhouettes.has(fingerprint)) issues.push({ path: `${stagePath}.paths`, message: 'Every economy stage needs a distinct authored silhouette.' })
      silhouettes.add(fingerprint)
      for (const [pathIndex, layer] of stage.paths.entries()) {
        if (!/^M[-\d\s]/.test(layer.d) || layer.d.length < 18) {
          issues.push({ path: `${stagePath}.paths[${pathIndex}].d`, message: 'Path must be a nontrivial authored SVG path.' })
        }
      }
    }
  }
  if (objectIds.size !== 18) issues.push({ path: 'setPieces', message: 'The registry must cover all eighteen Kindling object IDs.' })
  return issues
}
