import type {
  MotionGrammar,
  UniversePackV2,
  VisualState,
  WorldObjectManifest,
  WorldObjectSourceKind,
} from '../content/universes/types'

export interface ManifestValidationIssue {
  readonly path: string
  readonly code: string
  readonly message: string
}

export interface ManifestValidationResult {
  readonly valid: boolean
  readonly issues: readonly ManifestValidationIssue[]
}

export interface WorldObjectValidationOptions {
  readonly path?: string
  readonly requireOwnershipStates?: boolean
}

const STABLE_ID = /^[a-z0-9][a-z0-9-]{0,63}$/
const CANONICAL_AMOUNT = /^([1-9])(?:\.([0-9]{1,14}))?e(0|-?[1-9][0-9]*)$/
const MIN_AMOUNT_EXPONENT = -2_147_483_648
const MAX_AMOUNT_EXPONENT = 2_147_483_647
const UNIVERSE_IDS = new Set([
  'emberlight',
  'tidefall',
  'verdance',
  'clockwork',
  'brahmalok',
  'vishnulok',
  'kailash',
])
const SOURCE_KINDS = new Set(['generator', 'archive', 'omen', 'story', 'beacon'])
const SCREEN_ZONES = new Set(['heart', 'near', 'far', 'horizon'])
const SALIENCE = new Set(['ambient', 'supporting', 'interactive', 'milestone'])
const MOTION_KINDS = new Set([
  'still',
  'orbital',
  'tidal',
  'growth',
  'mechanical',
  'optical',
  'atmospheric',
  'waveform',
  'authored',
])
const COUNT_PRESENTATIONS = new Set(['single', 'group', 'infrastructure', 'hidden'])
const PANEL_PRIORITIES = new Set(['hide', 'dim', 'hold', 'normal', 'emphasize'])
const OWNERSHIP_THRESHOLDS = ['1', '10', '25', '50', '100'] as const
const VISUAL_ZONE_IDS = ['heart', 'near', 'far', 'horizon'] as const
const MOTION_FREQUENCIES = new Set(['low', 'medium', 'high'])
const ATTENTION_BUDGET = {
  primaryTargets: 1,
  secondaryInteractiveObjects: 3,
  temporaryRewardEffects: 2,
  storySubtitles: 1,
  majorPanels: 1,
} as const

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function nonEmpty(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function add(
  issues: ManifestValidationIssue[],
  path: string,
  code: string,
  message: string,
): void {
  issues.push({ path, code, message })
}

function validateStableId(
  value: unknown,
  path: string,
  issues: ManifestValidationIssue[],
): value is string {
  if (typeof value !== 'string' || !STABLE_ID.test(value)) {
    add(issues, path, 'id.invalid', 'Expected a stable lowercase hyphenated ID with at most 64 characters.')
    return false
  }
  return true
}

function requireMeaning(
  record: Record<string, unknown>,
  field: string,
  path: string,
  issues: ManifestValidationIssue[],
): void {
  if (!nonEmpty(record[field])) {
    add(issues, `${path}.${field}`, 'meaning.missing', `${field} must contain authored semantic meaning.`)
  }
}

function validateStringList(
  value: unknown,
  path: string,
  issues: ManifestValidationIssue[],
  allowEmpty = false,
): readonly string[] {
  if (!Array.isArray(value)) {
    add(issues, path, 'list.missing', 'Expected a string list.')
    return []
  }
  if (!allowEmpty && value.length === 0) {
    add(issues, path, 'list.empty', 'Expected at least one authored value.')
  }
  const seen = new Set<string>()
  const result: string[] = []
  value.forEach((entry, index) => {
    if (!nonEmpty(entry)) {
      add(issues, `${path}[${index}]`, 'meaning.missing', 'Expected a non-empty string.')
      return
    }
    if (seen.has(entry)) {
      add(issues, `${path}[${index}]`, 'list.duplicate', `Duplicate value "${entry}".`)
      return
    }
    seen.add(entry)
    result.push(entry)
  })
  return result
}

function validateMotion(
  value: unknown,
  path: string,
  issues: ManifestValidationIssue[],
): value is MotionGrammar {
  if (!isRecord(value)) {
    add(issues, path, 'motion.missing', 'Expected an authored motion grammar.')
    return false
  }
  if (typeof value.kind !== 'string' || !MOTION_KINDS.has(value.kind)) {
    add(issues, `${path}.kind`, 'motion.kind-invalid', 'Motion kind is not part of the frozen grammar.')
  }
  requireMeaning(value, 'description', path, issues)
  if (value.periodMs !== undefined && (!Number.isFinite(value.periodMs) || (value.periodMs as number) <= 0)) {
    add(issues, `${path}.periodMs`, 'motion.period-invalid', 'Motion period must be finite and greater than zero.')
  }
  if (typeof value.preservesTimingInformation !== 'boolean') {
    add(
      issues,
      `${path}.preservesTimingInformation`,
      'motion.timing-unspecified',
      'Motion must explicitly state whether it preserves timing information.',
    )
  }
  return true
}

function validateVisualState(
  value: unknown,
  path: string,
  issues: ManifestValidationIssue[],
): value is VisualState {
  if (!isRecord(value)) {
    add(issues, path, 'fallback.missing', 'Expected a complete visual state.')
    return false
  }
  requireMeaning(value, 'label', path, issues)
  requireMeaning(value, 'silhouette', path, issues)
  validateStringList(value.material, `${path}.material`, issues)
  validateMotion(value.motion, `${path}.motion`, issues)
  if (typeof value.countPresentation !== 'string' || !COUNT_PRESENTATIONS.has(value.countPresentation)) {
    add(
      issues,
      `${path}.countPresentation`,
      'fallback.count-presentation-invalid',
      'Count presentation is not part of the frozen grammar.',
    )
  }
  return true
}

function validateWorldObjectInto(
  manifest: unknown,
  path: string,
  issues: ManifestValidationIssue[],
  requireOwnershipStates: boolean,
): void {
  if (!isRecord(manifest)) {
    add(issues, path, 'object.not-object', 'Expected a WorldObjectManifest object.')
    return
  }

  validateStableId(manifest.id, `${path}.id`, issues)
  if (typeof manifest.sourceKind !== 'string' || !SOURCE_KINDS.has(manifest.sourceKind)) {
    add(issues, `${path}.sourceKind`, 'source.kind-invalid', 'Object source kind is not part of the frozen grammar.')
  }
  validateStableId(manifest.sourceId, `${path}.sourceId`, issues)
  requireMeaning(manifest, 'phenomenon', path, issues)
  requireMeaning(manifest, 'purpose', path, issues)
  if (typeof manifest.screenZone !== 'string' || !SCREEN_ZONES.has(manifest.screenZone)) {
    add(issues, `${path}.screenZone`, 'zone.invalid', 'Object screen zone is not part of the frozen grammar.')
  }
  if (typeof manifest.salience !== 'string' || !SALIENCE.has(manifest.salience)) {
    add(issues, `${path}.salience`, 'salience.invalid', 'Object salience is not part of the frozen grammar.')
  }
  validateStringList(manifest.material, `${path}.material`, issues)
  requireMeaning(manifest, 'silhouette', path, issues)
  validateMotion(manifest.motion, `${path}.motion`, issues)

  const needsOwnershipStates = requireOwnershipStates || manifest.sourceKind === 'generator'
  if (needsOwnershipStates && !isRecord(manifest.ownershipStates)) {
    add(
      issues,
      `${path}.ownershipStates`,
      'ownership.missing',
      'Generator objects require ownership states for 1, 10, 25, 50, and 100 Kindlings.',
    )
  }
  if (isRecord(manifest.ownershipStates)) {
    const keys = Object.keys(manifest.ownershipStates)
    for (const threshold of OWNERSHIP_THRESHOLDS) {
      if (!(threshold in manifest.ownershipStates)) {
        add(
          issues,
          `${path}.ownershipStates.${threshold}`,
          'ownership.threshold-missing',
          `Missing ownership state ${threshold}.`,
        )
      } else {
        validateVisualState(
          manifest.ownershipStates[threshold],
          `${path}.ownershipStates.${threshold}`,
          issues,
        )
      }
    }
    for (const key of keys) {
      if (!OWNERSHIP_THRESHOLDS.includes(key as typeof OWNERSHIP_THRESHOLDS[number])) {
        add(
          issues,
          `${path}.ownershipStates.${key}`,
          'ownership.threshold-unknown',
          'Ownership states may only use the frozen thresholds 1, 10, 25, 50, and 100.',
        )
      }
    }
  }

  const reducedPath = `${path}.reducedMotionState`
  if (validateVisualState(manifest.reducedMotionState, reducedPath, issues)) {
    const reduced = manifest.reducedMotionState
    if (isRecord(reduced) && isRecord(reduced.motion) && reduced.motion.preservesTimingInformation !== true) {
      add(
        issues,
        `${reducedPath}.motion.preservesTimingInformation`,
        'fallback.timing-lost',
        'Reduced-motion fallback must preserve timing information.',
      )
    }
  }
  validateVisualState(manifest.lowQualityState, `${path}.lowQualityState`, issues)
  requireMeaning(manifest, 'overlapGroup', path, issues)
  validateStringList(manifest.canOverlapWith, `${path}.canOverlapWith`, issues, true)
  if (!Number.isFinite(manifest.minimumHeartDistance) || (manifest.minimumHeartDistance as number) < 1) {
    add(
      issues,
      `${path}.minimumHeartDistance`,
      'heart.clearance-invalid',
      'World objects must remain at least one Heart radius from the Heart hit target.',
    )
  }
  if (
    typeof manifest.priorityWhilePanelOpen !== 'string'
    || !PANEL_PRIORITIES.has(manifest.priorityWhilePanelOpen)
  ) {
    add(
      issues,
      `${path}.priorityWhilePanelOpen`,
      'panel-priority.invalid',
      'Panel-open priority is not part of the frozen grammar.',
    )
  }
  if (manifest.audioCue !== undefined) validateStableId(manifest.audioCue, `${path}.audioCue`, issues)
  if (manifest.loreRecord !== undefined) validateStableId(manifest.loreRecord, `${path}.loreRecord`, issues)
}

export function validateWorldObjectManifest(
  manifest: unknown,
  options: WorldObjectValidationOptions = {},
): ManifestValidationResult {
  const issues: ManifestValidationIssue[] = []
  validateWorldObjectInto(
    manifest,
    options.path ?? 'object',
    issues,
    options.requireOwnershipStates ?? false,
  )
  return { valid: issues.length === 0, issues }
}

function collectIds(
  values: readonly unknown[],
  path: string,
  issues: ManifestValidationIssue[],
): Set<string> {
  const ids = new Set<string>()
  values.forEach((value, index) => {
    const entryPath = `${path}[${index}]`
    if (!isRecord(value)) {
      add(issues, entryPath, 'definition.not-object', 'Expected a definition object.')
      return
    }
    if (!validateStableId(value.id, `${entryPath}.id`, issues)) return
    if (ids.has(value.id)) {
      add(issues, `${entryPath}.id`, 'id.duplicate', `Duplicate ID "${value.id}" in ${path}.`)
    }
    ids.add(value.id)
  })
  return ids
}

function validateCardinality(
  value: unknown,
  expected: number,
  path: string,
  issues: ManifestValidationIssue[],
): readonly unknown[] {
  if (!Array.isArray(value)) {
    add(issues, path, 'cardinality.not-array', `Expected exactly ${expected} entries.`)
    return []
  }
  if (value.length !== expected) {
    add(
      issues,
      path,
      'cardinality.exact',
      `Expected exactly ${expected} entries, received ${value.length}.`,
    )
  }
  return value
}

function validateAtLeast(
  value: unknown,
  minimum: number,
  path: string,
  issues: ManifestValidationIssue[],
): readonly unknown[] {
  if (!Array.isArray(value)) {
    add(issues, path, 'cardinality.not-array', `Expected at least ${minimum} entries.`)
    return []
  }
  if (value.length < minimum) {
    add(issues, path, 'cardinality.minimum', `Expected at least ${minimum} entries, received ${value.length}.`)
  }
  return value
}

function validateContentAmount(
  value: unknown,
  path: string,
  issues: ManifestValidationIssue[],
): void {
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || value < 0 || Object.is(value, -0)) {
      add(issues, path, 'amount.invalid-number', 'Content amount numbers must be finite and nonnegative.')
    }
    return
  }
  if (value === '0') return
  if (typeof value !== 'string') {
    add(issues, path, 'amount.invalid-string', 'Expected a finite number or minimal canonical scientific amount string.')
    return
  }
  const match = CANONICAL_AMOUNT.exec(value)
  if (!match || match[2]?.endsWith('0')) {
    add(
      issues,
      path,
      'amount.noncanonical-string',
      'Expected minimal canonical scientific form with no plus sign, leading exponent zeroes, or trailing fractional zeroes.',
    )
    return
  }
  const exponent = Number(match[3])
  if (exponent < MIN_AMOUNT_EXPONENT || exponent > MAX_AMOUNT_EXPONENT) {
    add(
      issues,
      path,
      'amount.exponent-out-of-range',
      'Scientific amount exponent must fit the signed 32-bit range -2147483648 through 2147483647.',
    )
  }
}

function stableSerialize(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableSerialize).join(',')}]`
  if (isRecord(value)) {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableSerialize(value[key])}`).join(',')}}`
  }
  return JSON.stringify(value)
}

function requireNestedManifestInVisualList(
  nested: unknown,
  nestedPath: string,
  expectedKind: WorldObjectSourceKind,
  expectedSourceId: string | undefined,
  visualById: ReadonlyMap<string, Record<string, unknown>>,
  issues: ManifestValidationIssue[],
): void {
  validateWorldObjectInto(nested, nestedPath, issues, expectedKind === 'generator')
  if (!isRecord(nested)) return
  if (nested.sourceKind !== expectedKind) {
    add(
      issues,
      `${nestedPath}.sourceKind`,
      'source.kind-mismatch',
      `Expected source kind "${expectedKind}" for this object.`,
    )
  }
  if (expectedSourceId !== undefined && nested.sourceId !== expectedSourceId) {
    add(
      issues,
      `${nestedPath}.sourceId`,
      'source.id-mismatch',
      `Expected source ID "${expectedSourceId}" for this object.`,
    )
  }
  if (typeof nested.id !== 'string') return
  const visual = visualById.get(nested.id)
  if (!visual) {
    add(
      issues,
      nestedPath,
      'visual.object-missing',
      `Object "${nested.id}" is not present in visual.objects.`,
    )
  } else if (stableSerialize(visual) !== stableSerialize(nested)) {
    add(
      issues,
      nestedPath,
      'visual.object-definition-mismatch',
      `Object "${nested.id}" differs from its canonical visual.objects definition.`,
    )
  }
}

function validateSourceReference(
  object: Record<string, unknown>,
  path: string,
  sourceIds: Readonly<Record<WorldObjectSourceKind, ReadonlySet<string>>>,
  issues: ManifestValidationIssue[],
): void {
  if (typeof object.sourceKind !== 'string' || !SOURCE_KINDS.has(object.sourceKind)) return
  if (typeof object.sourceId !== 'string') return
  const kind = object.sourceKind as WorldObjectSourceKind
  if (!sourceIds[kind].has(object.sourceId)) {
    add(
      issues,
      `${path}.sourceId`,
      'source.reference-missing',
      `No ${kind} definition with ID "${object.sourceId}" exists in this pack.`,
    )
  }
}

/**
 * Validates a complete pack without trusting TypeScript tuple or readonly guarantees.
 * This is intentionally a boundary validator, not a renderer or economy consumer.
 */
export function validateUniversePackV2(pack: unknown): ManifestValidationResult {
  const issues: ManifestValidationIssue[] = []
  if (!isRecord(pack)) {
    return {
      valid: false,
      issues: [{ path: 'pack', code: 'pack.not-object', message: 'Expected a UniversePackV2 object.' }],
    }
  }

  if (typeof pack.id !== 'string' || !UNIVERSE_IDS.has(pack.id)) {
    add(issues, 'id', 'universe.id-invalid', 'Pack ID is not one of the seven frozen universe IDs.')
  }
  if (!isRecord(pack.identity)) {
    add(issues, 'identity', 'identity.missing', 'Expected a complete universe identity.')
  } else {
    for (const field of ['name', 'shortName', 'epithet', 'premise', 'primaryVerb', 'civilizationQuestion']) {
      requireMeaning(pack.identity, field, 'identity', issues)
    }
  }

  if (!isRecord(pack.physics)) {
    add(issues, 'physics', 'physics.missing', 'Expected a pure universe physics contract.')
  } else if (typeof pack.physics.randomAllowed !== 'boolean') {
    add(
      issues,
      'physics.randomAllowed',
      'physics.random-policy-invalid',
      'Physics must explicitly declare randomAllowed as a boolean.',
    )
  }

  const economy = isRecord(pack.economy) ? pack.economy : {}
  if (!isRecord(pack.economy)) add(issues, 'economy', 'economy.missing', 'Expected a complete economy definition.')
  const generators = validateCardinality(economy.generators, 18, 'economy.generators', issues)
  const generatorIds = collectIds(generators, 'economy.generators', issues)
  const tiers = new Set<number>()
  generators.forEach((generator, index) => {
    if (!isRecord(generator)) return
    const path = `economy.generators[${index}]`
    requireMeaning(generator, 'name', path, issues)
    requireMeaning(generator, 'flavor', path, issues)
    validateContentAmount(generator.baseCost, `${path}.baseCost`, issues)
    validateContentAmount(generator.baseRate, `${path}.baseRate`, issues)
    if (!Number.isInteger(generator.tier) || (generator.tier as number) < 1 || (generator.tier as number) > 18) {
      add(issues, `${path}.tier`, 'generator.tier-invalid', 'Generator tier must be an integer from 1 through 18.')
    } else if (tiers.has(generator.tier as number)) {
      add(issues, `${path}.tier`, 'generator.tier-duplicate', `Duplicate generator tier ${generator.tier}.`)
    } else {
      tiers.add(generator.tier as number)
    }
  })

  const upgrades = Array.isArray(economy.upgrades) ? economy.upgrades : []
  if (!Array.isArray(economy.upgrades)) add(issues, 'economy.upgrades', 'upgrades.missing', 'Expected an upgrade list.')
  const upgradeIds = collectIds(upgrades, 'economy.upgrades', issues)
  upgrades.forEach((upgrade, index) => {
    if (!isRecord(upgrade)) return
    const path = `economy.upgrades[${index}]`
    requireMeaning(upgrade, 'name', path, issues)
    requireMeaning(upgrade, 'flavor', path, issues)
    validateContentAmount(upgrade.cost, `${path}.cost`, issues)
  })

  const doctrines = validateCardinality(economy.doctrines, 4, 'economy.doctrines', issues)
  const doctrineIds = collectIds(doctrines, 'economy.doctrines', issues)
  doctrines.forEach((doctrine, index) => {
    if (!isRecord(doctrine)) return
    const path = `economy.doctrines[${index}]`
    requireMeaning(doctrine, 'name', path, issues)
    requireMeaning(doctrine, 'description', path, issues)
    requireMeaning(doctrine, 'visualSignature', path, issues)
  })

  const prestige = isRecord(economy.localPrestige) ? economy.localPrestige : null
  if (!prestige) {
    add(issues, 'economy.localPrestige', 'prestige.missing', 'Expected a local Epoch Turn definition.')
  } else {
    validateStableId(prestige.id, 'economy.localPrestige.id', issues)
    requireMeaning(prestige, 'localName', 'economy.localPrestige', issues)
    validateStableId(prestige.gainFormulaId, 'economy.localPrestige.gainFormulaId', issues)
    validateStableId(prestige.ceremonyFeedbackId, 'economy.localPrestige.ceremonyFeedbackId', issues)
  }

  const omens = validateAtLeast(pack.omens, 4, 'omens', issues)
  const omenIds = collectIds(omens, 'omens', issues)
  const archive = isRecord(pack.archive) ? pack.archive : {}
  if (!isRecord(pack.archive)) add(issues, 'archive', 'archive.missing', 'Expected a Field Archive definition.')
  const archiveRecords = validateCardinality(archive.records, 12, 'archive.records', issues)
  const archiveIds = collectIds(archiveRecords, 'archive.records', issues)
  const shelves = validateCardinality(archive.shelves, 3, 'archive.shelves', issues)
  collectIds(shelves, 'archive.shelves', issues)

  const trials = Array.isArray(pack.trials) ? pack.trials : []
  if (!Array.isArray(pack.trials)) add(issues, 'trials', 'trials.missing', 'Expected a local trial list.')
  const trialIds = collectIds(trials, 'trials', issues)
  const story = isRecord(pack.story) ? pack.story : {}
  if (!isRecord(pack.story)) add(issues, 'story', 'story.missing', 'Expected a universe story definition.')
  requireMeaning(story, 'civilizationQuestion', 'story', issues)
  const scenes = Array.isArray(story.scenes) ? story.scenes : []
  if (!Array.isArray(story.scenes)) add(issues, 'story.scenes', 'story.scenes-missing', 'Expected a story scene list.')
  const sceneIds = collectIds(scenes, 'story.scenes', issues)
  const echoes = Array.isArray(story.echoes) ? story.echoes : []
  if (!Array.isArray(story.echoes)) add(issues, 'story.echoes', 'story.echoes-missing', 'Expected an Echo list.')
  const echoIds = collectIds(echoes, 'story.echoes', issues)
  const storyIds = new Set([...sceneIds, ...echoIds])

  const beacon = isRecord(pack.beacon) ? pack.beacon : null
  const beaconIds = new Set<string>()
  if (!beacon) {
    add(issues, 'beacon', 'beacon.missing', 'Expected an explicit Beacon definition.')
  } else if (validateStableId(beacon.id, 'beacon.id', issues)) {
    beaconIds.add(beacon.id)
  }

  const visual = isRecord(pack.visual) ? pack.visual : {}
  if (!isRecord(pack.visual)) add(issues, 'visual', 'visual.missing', 'Expected a universe visual manifest.')
  validateStringList(visual.materials, 'visual.materials', issues)
  validateStringList(visual.primarySilhouettes, 'visual.primarySilhouettes', issues)
  if (!Array.isArray(visual.motionGrammar) || visual.motionGrammar.length === 0) {
    add(issues, 'visual.motionGrammar', 'visual.motion-grammar-missing', 'Expected at least one frozen motion grammar value.')
  } else {
    const seenMotion = new Set<string>()
    visual.motionGrammar.forEach((kind, index) => {
      if (typeof kind !== 'string' || !MOTION_KINDS.has(kind)) {
        add(
          issues,
          `visual.motionGrammar[${index}]`,
          'visual.motion-grammar-invalid',
          'Motion grammar value is not part of the frozen MotionKind union.',
        )
      } else if (seenMotion.has(kind)) {
        add(
          issues,
          `visual.motionGrammar[${index}]`,
          'visual.motion-grammar-duplicate',
          `Duplicate motion grammar value "${kind}".`,
        )
      } else {
        seenMotion.add(kind)
      }
    })
  }

  if (!isRecord(visual.zones)) {
    add(issues, 'visual.zones', 'visual.zones-missing', 'Expected definitions for all four frozen screen zones.')
  } else {
    for (const zoneId of VISUAL_ZONE_IDS) {
      const zone = visual.zones[zoneId]
      const path = `visual.zones.${zoneId}`
      if (!isRecord(zone)) {
        add(issues, path, 'visual.zone-missing', `Missing ${zoneId} screen-zone definition.`)
        continue
      }
      requireMeaning(zone, 'purpose', path, issues)
      if (
        !Number.isFinite(zone.maximumInteractiveObjects)
        || (zone.maximumInteractiveObjects as number) < 0
      ) {
        add(
          issues,
          `${path}.maximumInteractiveObjects`,
          'visual.zone-interactive-count-invalid',
          'Maximum interactive objects must be finite and nonnegative.',
        )
      }
      if (
        typeof zone.motionFrequency !== 'string'
        || !MOTION_FREQUENCIES.has(zone.motionFrequency)
      ) {
        add(
          issues,
          `${path}.motionFrequency`,
          'visual.zone-motion-frequency-invalid',
          'Motion frequency must be low, medium, or high.',
        )
      }
    }
    for (const zoneId of Object.keys(visual.zones)) {
      if (!VISUAL_ZONE_IDS.includes(zoneId as typeof VISUAL_ZONE_IDS[number])) {
        add(
          issues,
          `visual.zones.${zoneId}`,
          'visual.zone-unknown',
          'Only heart, near, far, and horizon screen zones are allowed.',
        )
      }
    }
  }

  if (!isRecord(visual.attentionBudget)) {
    add(
      issues,
      'visual.attentionBudget',
      'visual.attention-budget-missing',
      'Expected the exact frozen attention budget.',
    )
  } else {
    for (const [field, expected] of Object.entries(ATTENTION_BUDGET)) {
      if (visual.attentionBudget[field] !== expected) {
        add(
          issues,
          `visual.attentionBudget.${field}`,
          'visual.attention-budget-invalid',
          `Expected frozen attention budget value ${expected}, received ${String(visual.attentionBudget[field])}.`,
        )
      }
    }
    for (const field of Object.keys(visual.attentionBudget)) {
      if (!(field in ATTENTION_BUDGET)) {
        add(
          issues,
          `visual.attentionBudget.${field}`,
          'visual.attention-budget-unknown',
          'Attention budget may only contain the five frozen budget fields.',
        )
      }
    }
  }
  const visualObjects = Array.isArray(visual.objects) ? visual.objects : []
  if (!Array.isArray(visual.objects)) add(issues, 'visual.objects', 'visual.objects-missing', 'Expected a canonical world object list.')
  const visualObjectIds = collectIds(visualObjects, 'visual.objects', issues)
  const visualById = new Map<string, Record<string, unknown>>()
  visualObjects.forEach((object, index) => {
    const path = `visual.objects[${index}]`
    validateWorldObjectInto(object, path, issues, false)
    if (!isRecord(object)) return
    if (typeof object.id === 'string' && !visualById.has(object.id)) visualById.set(object.id, object)
  })

  const sourceIds: Readonly<Record<WorldObjectSourceKind, ReadonlySet<string>>> = {
    generator: generatorIds,
    archive: archiveIds,
    omen: omenIds,
    story: storyIds,
    beacon: beaconIds,
  }
  visualObjects.forEach((object, index) => {
    if (isRecord(object)) validateSourceReference(object, `visual.objects[${index}]`, sourceIds, issues)
  })

  for (const generatorId of generatorIds) {
    const matches = visualObjects.filter(
      (object) => isRecord(object) && object.sourceKind === 'generator' && object.sourceId === generatorId,
    )
    if (matches.length !== 1) {
      add(
        issues,
        'visual.objects',
        'generator.object-cardinality',
        `Generator "${generatorId}" requires exactly one visual object, received ${matches.length}.`,
      )
    }
  }

  omens.forEach((omen, index) => {
    if (!isRecord(omen)) return
    const path = `omens[${index}]`
    requireMeaning(omen, 'name', path, issues)
    requireMeaning(omen, 'description', path, issues)
    requireMeaning(omen, 'accessibilityLabel', path, issues)
    requireNestedManifestInVisualList(
      omen.object,
      `${path}.object`,
      'omen',
      typeof omen.id === 'string' ? omen.id : undefined,
      visualById,
      issues,
    )
  })

  archiveRecords.forEach((record, index) => {
    if (!isRecord(record)) return
    const path = `archive.records[${index}]`
    for (const field of ['name', 'observation', 'implication', 'effectDescription']) {
      requireMeaning(record, field, path, issues)
    }
    requireNestedManifestInVisualList(
      record.object,
      `${path}.object`,
      'archive',
      typeof record.id === 'string' ? record.id : undefined,
      visualById,
      issues,
    )
  })

  const shelfMembership = new Map<string, number>()
  shelves.forEach((shelf, index) => {
    if (!isRecord(shelf)) return
    const path = `archive.shelves[${index}]`
    requireMeaning(shelf, 'name', path, issues)
    requireMeaning(shelf, 'rewardDescription', path, issues)
    const recordIds = validateCardinality(shelf.recordIds, 4, `${path}.recordIds`, issues)
    recordIds.forEach((recordId, recordIndex) => {
      if (typeof recordId !== 'string' || !archiveIds.has(recordId)) {
        add(
          issues,
          `${path}.recordIds[${recordIndex}]`,
          'archive.record-reference-missing',
          `Shelf references unknown Archive record "${String(recordId)}".`,
        )
        return
      }
      shelfMembership.set(recordId, (shelfMembership.get(recordId) ?? 0) + 1)
    })
  })
  for (const recordId of archiveIds) {
    const count = shelfMembership.get(recordId) ?? 0
    if (count !== 1) {
      add(
        issues,
        'archive.shelves',
        'archive.record-membership',
        `Archive record "${recordId}" must belong to exactly one shelf, received ${count}.`,
      )
    }
  }

  if (beacon) {
    requireMeaning(beacon, 'localName', 'beacon', issues)
    requireMeaning(beacon, 'mapSilhouette', 'beacon', issues)
    requireNestedManifestInVisualList(
      beacon.object,
      'beacon.object',
      'beacon',
      typeof beacon.id === 'string' ? beacon.id : undefined,
      visualById,
      issues,
    )
    if (isRecord(beacon.requirement)) {
      const requirement = beacon.requirement
      const kind = requirement.sourceKind
      if (!['generator', 'archive', 'trial', 'story', 'composite'].includes(String(kind))) {
        add(
          issues,
          'beacon.requirement.sourceKind',
          'beacon.requirement-source-kind-invalid',
          'Beacon requirement source kind is not part of the frozen grammar.',
        )
      }
      validateStableId(requirement.sourceId, 'beacon.requirement.sourceId', issues)
      if (!Number.isFinite(requirement.target) || (requirement.target as number) <= 0) {
        add(
          issues,
          'beacon.requirement.target',
          'beacon.requirement-target-invalid',
          'Beacon requirement target must be finite and greater than zero.',
        )
      }
      const requirementIds = kind === 'generator'
        ? generatorIds
        : kind === 'archive'
          ? archiveIds
          : kind === 'trial'
            ? trialIds
            : kind === 'story'
              ? storyIds
              : null
      if (requirementIds && (typeof requirement.sourceId !== 'string' || !requirementIds.has(requirement.sourceId))) {
        add(
          issues,
          'beacon.requirement.sourceId',
          'beacon.requirement-reference-missing',
          `Beacon requirement references unknown ${String(kind)} ID "${String(requirement.sourceId)}".`,
        )
      }
    } else {
      add(issues, 'beacon.requirement', 'beacon.requirement-missing', 'Expected an explicit Beacon requirement.')
    }
    if (!Number.isSafeInteger(beacon.darkBetweenReward) || (beacon.darkBetweenReward as number) < 0) {
      add(
        issues,
        'beacon.darkBetweenReward',
        'beacon.reward-invalid',
        'Dark Between reward must be a nonnegative safe integer.',
      )
    }
  }

  const audio = isRecord(pack.audio) ? pack.audio : {}
  const cues = Array.isArray(audio.cues) ? audio.cues : []
  const cueIds = new Set(cues.flatMap((cue) => isRecord(cue) && typeof cue.id === 'string' ? [cue.id] : []))
  if (isRecord(pack.heart)) {
    const heart = pack.heart
    validateStableId(heart.id, 'heart.id', issues)
    for (const field of ['localName', 'phenomenon', 'purpose', 'silhouette', 'focusLabel']) {
      requireMeaning(heart, field, 'heart', issues)
    }
    validateStringList(heart.material, 'heart.material', issues)
    validateMotion(heart.idleMotion, 'heart.idleMotion', issues)
    validateMotion(heart.touchMotion, 'heart.touchMotion', issues)
    if (validateVisualState(heart.reducedMotionState, 'heart.reducedMotionState', issues)) {
      const reduced = heart.reducedMotionState
      if (isRecord(reduced) && isRecord(reduced.motion) && reduced.motion.preservesTimingInformation !== true) {
        add(
          issues,
          'heart.reducedMotionState.motion.preservesTimingInformation',
          'fallback.timing-lost',
          'Heart reduced-motion fallback must preserve timing information.',
        )
      }
    }
    validateVisualState(heart.lowQualityState, 'heart.lowQualityState', issues)
    if (typeof heart.touchCue !== 'string' || !cueIds.has(heart.touchCue)) {
      add(issues, 'heart.touchCue', 'audio.reference-missing', `Heart touch cue "${String(heart.touchCue)}" is not declared.`)
    }
  } else {
    add(issues, 'heart', 'heart.missing', 'Expected a complete Heart manifest.')
  }

  visualObjects.forEach((object, index) => {
    if (!isRecord(object)) return
    if (typeof object.audioCue === 'string' && !cueIds.has(object.audioCue)) {
      add(
        issues,
        `visual.objects[${index}].audioCue`,
        'audio.reference-missing',
        `Object cue "${object.audioCue}" is not declared.`,
      )
    }
    if (
      typeof object.loreRecord === 'string'
      && !archiveIds.has(object.loreRecord)
      && !storyIds.has(object.loreRecord)
    ) {
      add(
        issues,
        `visual.objects[${index}].loreRecord`,
        'lore.reference-missing',
        `Lore record "${object.loreRecord}" is not declared in the Archive or story.`,
      )
    }
  })

  const densityMerges = Array.isArray(visual.densityMerges) ? visual.densityMerges : []
  if (!Array.isArray(visual.densityMerges)) {
    add(issues, 'visual.densityMerges', 'density.list-missing', 'Expected a density-merge rule list.')
  }
  densityMerges.forEach((merge, index) => {
    if (!isRecord(merge)) {
      add(issues, `visual.densityMerges[${index}]`, 'density.not-object', 'Expected a density-merge rule.')
      return
    }
    const path = `visual.densityMerges[${index}]`
    const sources = validateStringList(merge.sourceIds, `${path}.sourceIds`, issues)
    sources.forEach((sourceId, sourceIndex) => {
      if (!visualObjectIds.has(sourceId)) {
        add(issues, `${path}.sourceIds[${sourceIndex}]`, 'density.source-missing', `Unknown visual object "${sourceId}".`)
      }
    })
    if (typeof merge.resultObjectId !== 'string' || !visualObjectIds.has(merge.resultObjectId)) {
      add(issues, `${path}.resultObjectId`, 'density.result-missing', `Unknown result object "${String(merge.resultObjectId)}".`)
    }
    if (!Number.isFinite(merge.threshold) || (merge.threshold as number) <= 0) {
      add(issues, `${path}.threshold`, 'density.threshold-invalid', 'Density threshold must be finite and greater than zero.')
    }
    requireMeaning(merge, 'description', path, issues)
  })

  // IDs are pack-local, but definitions within a family must not collide with one another.
  void upgradeIds
  void doctrineIds

  return { valid: issues.length === 0, issues }
}

export function assertValidUniversePackV2(pack: unknown): asserts pack is UniversePackV2 {
  const result = validateUniversePackV2(pack)
  if (!result.valid) {
    const detail = result.issues.map((entry) => `${entry.path}: ${entry.message}`).join('\n')
    throw new TypeError(`Invalid UniversePackV2:\n${detail}`)
  }
}

export function assertValidWorldObjectManifest(
  manifest: unknown,
  options: WorldObjectValidationOptions = {},
): asserts manifest is WorldObjectManifest {
  const result = validateWorldObjectManifest(manifest, options)
  if (!result.valid) {
    const detail = result.issues.map((entry) => `${entry.path}: ${entry.message}`).join('\n')
    throw new TypeError(`Invalid WorldObjectManifest:\n${detail}`)
  }
}
