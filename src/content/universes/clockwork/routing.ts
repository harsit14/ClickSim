export const CLOCKWORK_KINDLING_IDS = [
  'clockwork-tooth',
  'clockwork-cog',
  'clockwork-ratchet',
  'clockwork-escapement',
  'clockwork-mainspring',
  'clockwork-flywheel',
  'clockwork-governor',
  'clockwork-clockmaker-automaton',
  'clockwork-orrery',
  'clockwork-difference-engine',
  'clockwork-relay-foundry',
  'clockwork-meridian-clock',
  'clockwork-prediction-mill',
  'clockwork-city-of-hours',
  'clockwork-causal-engine',
  'clockwork-world-gear',
  'clockwork-last-calendar',
  'clockwork-great-regulator',
] as const

export type ClockworkKindlingId = typeof CLOCKWORK_KINDLING_IDS[number]
export type ClockworkRouteKind = 'power' | 'cadence' | 'efficiency'

export interface ClockworkRouteEdge {
  readonly id: string
  readonly from: ClockworkKindlingId
  readonly to: ClockworkKindlingId
  readonly kind: ClockworkRouteKind
}

export interface ClockworkRoutingGraph {
  readonly nodeIds: readonly ClockworkKindlingId[]
  readonly edges: readonly ClockworkRouteEdge[]
}

export interface ClockworkRoutingCapabilities {
  readonly inputSocketsPerNode: number
  readonly outputSocketsPerNode: number
  readonly splittersEnabled: boolean
  readonly conditionalGatesEnabled: boolean
  readonly scheduledChangesEnabled: boolean
}

export const CLOCKWORK_INITIAL_ROUTING_CAPABILITIES: ClockworkRoutingCapabilities = {
  inputSocketsPerNode: 1,
  outputSocketsPerNode: 1,
  splittersEnabled: false,
  conditionalGatesEnabled: false,
  scheduledChangesEnabled: false,
}

export const CLOCKWORK_ADVANCED_ROUTING_CAPABILITIES: ClockworkRoutingCapabilities = {
  inputSocketsPerNode: 2,
  outputSocketsPerNode: 2,
  splittersEnabled: true,
  conditionalGatesEnabled: true,
  scheduledChangesEnabled: true,
}

export type ClockworkRoutingIssueCode =
  | 'node-set-invalid'
  | 'edge-id-invalid'
  | 'edge-id-duplicate'
  | 'edge-node-missing'
  | 'edge-self-route'
  | 'input-capacity-exceeded'
  | 'output-capacity-exceeded'
  | 'cycle-forbidden'

export interface ClockworkRoutingIssue {
  readonly code: ClockworkRoutingIssueCode
  readonly path: string
  readonly message: string
}

function nodeSetIsExact(nodeIds: readonly ClockworkKindlingId[]): boolean {
  return nodeIds.length === CLOCKWORK_KINDLING_IDS.length
    && CLOCKWORK_KINDLING_IDS.every((id) => nodeIds.filter((candidate) => candidate === id).length === 1)
}

function graphHasCycle(graph: ClockworkRoutingGraph): boolean {
  const incoming = new Map<ClockworkKindlingId, number>(
    CLOCKWORK_KINDLING_IDS.map((id) => [id, 0]),
  )
  const outgoing = new Map<ClockworkKindlingId, ClockworkKindlingId[]>(
    CLOCKWORK_KINDLING_IDS.map((id) => [id, []]),
  )
  for (const edge of graph.edges) {
    if (!incoming.has(edge.from) || !incoming.has(edge.to) || edge.from === edge.to) continue
    incoming.set(edge.to, (incoming.get(edge.to) ?? 0) + 1)
    outgoing.get(edge.from)?.push(edge.to)
  }
  const queue = CLOCKWORK_KINDLING_IDS.filter((id) => incoming.get(id) === 0)
  let visited = 0
  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const nodeId = queue[cursor]
    visited += 1
    for (const destination of outgoing.get(nodeId) ?? []) {
      const next = (incoming.get(destination) ?? 0) - 1
      incoming.set(destination, next)
      if (next === 0) queue.push(destination)
    }
  }
  return visited !== CLOCKWORK_KINDLING_IDS.length
}

export function validateClockworkRoutingGraph(
  graph: ClockworkRoutingGraph,
  capabilities: ClockworkRoutingCapabilities = CLOCKWORK_INITIAL_ROUTING_CAPABILITIES,
): readonly ClockworkRoutingIssue[] {
  const issues: ClockworkRoutingIssue[] = []
  if (!nodeSetIsExact(graph.nodeIds)) {
    issues.push({
      code: 'node-set-invalid',
      path: 'nodeIds',
      message: 'Clockwork routing must declare every pack-owned Kindling ID exactly once.',
    })
  }
  const known = new Set(CLOCKWORK_KINDLING_IDS)
  const edgeIds = new Set<string>()
  const inputCounts = new Map<ClockworkKindlingId, number>()
  const outputCounts = new Map<ClockworkKindlingId, number>()
  graph.edges.forEach((edge, index) => {
    const path = `edges[${index}]`
    if (edge.id.trim().length === 0) {
      issues.push({ code: 'edge-id-invalid', path: `${path}.id`, message: 'Route edge IDs must be nonempty.' })
    } else if (edgeIds.has(edge.id)) {
      issues.push({ code: 'edge-id-duplicate', path: `${path}.id`, message: `Duplicate route edge ID "${edge.id}".` })
    }
    edgeIds.add(edge.id)
    if (!known.has(edge.from) || !known.has(edge.to)) {
      issues.push({ code: 'edge-node-missing', path, message: 'Route edges must reference Clockwork Kindling IDs.' })
      return
    }
    if (edge.from === edge.to) {
      issues.push({ code: 'edge-self-route', path, message: 'A Kindling cannot route work into itself.' })
      return
    }
    inputCounts.set(edge.to, (inputCounts.get(edge.to) ?? 0) + 1)
    outputCounts.set(edge.from, (outputCounts.get(edge.from) ?? 0) + 1)
  })
  for (const id of CLOCKWORK_KINDLING_IDS) {
    if ((inputCounts.get(id) ?? 0) > capabilities.inputSocketsPerNode) {
      issues.push({
        code: 'input-capacity-exceeded',
        path: `nodes.${id}.inputs`,
        message: `${id} exceeds its ${capabilities.inputSocketsPerNode}-socket input capacity.`,
      })
    }
    if ((outputCounts.get(id) ?? 0) > capabilities.outputSocketsPerNode) {
      issues.push({
        code: 'output-capacity-exceeded',
        path: `nodes.${id}.outputs`,
        message: `${id} exceeds its ${capabilities.outputSocketsPerNode}-socket output capacity.`,
      })
    }
  }
  if (graphHasCycle(graph)) {
    issues.push({
      code: 'cycle-forbidden',
      path: 'edges',
      message: 'Clockwork route cycles are forbidden by the frozen routing contract.',
    })
  }
  return issues
}

export interface ClockworkRouteTerm {
  readonly sourceId: ClockworkKindlingId
  readonly edgeId: string
  readonly kind: ClockworkRouteKind
  readonly value: number
}

export interface ClockworkNodeInspection {
  readonly nodeId: ClockworkKindlingId
  readonly baseOutput: number
  readonly powerReceived: number
  readonly cadenceMultiplier: number
  readonly efficiencyMultiplier: number
  readonly resolvedOutput: number
  readonly formula: string
  readonly terms: readonly ClockworkRouteTerm[]
}

export interface ClockworkRoutingInspection {
  readonly topologicalOrder: readonly ClockworkKindlingId[]
  readonly nodes: readonly ClockworkNodeInspection[]
  readonly totalOutput: number
}

function stableTopologicalOrder(graph: ClockworkRoutingGraph): readonly ClockworkKindlingId[] {
  const canonicalIndex = new Map(CLOCKWORK_KINDLING_IDS.map((id, index) => [id, index]))
  const incoming = new Map(CLOCKWORK_KINDLING_IDS.map((id) => [id, 0]))
  const outgoing = new Map(CLOCKWORK_KINDLING_IDS.map((id) => [id, [] as ClockworkKindlingId[]]))
  for (const edge of graph.edges) {
    incoming.set(edge.to, (incoming.get(edge.to) ?? 0) + 1)
    outgoing.get(edge.from)?.push(edge.to)
  }
  const ready = CLOCKWORK_KINDLING_IDS.filter((id) => incoming.get(id) === 0)
  const order: ClockworkKindlingId[] = []
  while (ready.length > 0) {
    ready.sort((left, right) => (canonicalIndex.get(left) ?? 0) - (canonicalIndex.get(right) ?? 0))
    const nodeId = ready.shift()
    if (!nodeId) break
    order.push(nodeId)
    for (const destination of outgoing.get(nodeId) ?? []) {
      const next = (incoming.get(destination) ?? 0) - 1
      incoming.set(destination, next)
      if (next === 0) ready.push(destination)
    }
  }
  return order
}

/**
 * Exact route formula: power transmits 25% of resolved source output; each cadence
 * input multiplies the destination by 1.05; each efficiency input multiplies it by
 * 1.08. Callers provide all base values, and the DAG order makes the result replayable.
 */
export function inspectClockworkRoutingGraph(
  graph: ClockworkRoutingGraph,
  baseOutputByNode: Readonly<Record<ClockworkKindlingId, number>>,
  capabilities: ClockworkRoutingCapabilities = CLOCKWORK_INITIAL_ROUTING_CAPABILITIES,
): ClockworkRoutingInspection {
  const issues = validateClockworkRoutingGraph(graph, capabilities)
  if (issues.length > 0) {
    throw new TypeError(`Invalid Clockwork routing graph:\n${issues.map((issue) => `${issue.path}: ${issue.message}`).join('\n')}`)
  }
  for (const id of CLOCKWORK_KINDLING_IDS) {
    const value = baseOutputByNode[id]
    if (!Number.isFinite(value) || value < 0) {
      throw new RangeError(`Clockwork base output for ${id} must be finite and nonnegative.`)
    }
  }
  const order = stableTopologicalOrder(graph)
  const resolved = new Map<ClockworkKindlingId, number>()
  const nodes: ClockworkNodeInspection[] = []
  for (const nodeId of order) {
    const incomingEdges = graph.edges
      .filter((edge) => edge.to === nodeId)
      .sort((left, right) => left.id.localeCompare(right.id))
    const terms: ClockworkRouteTerm[] = incomingEdges.map((edge) => ({
      sourceId: edge.from,
      edgeId: edge.id,
      kind: edge.kind,
      value: edge.kind === 'power' ? (resolved.get(edge.from) ?? 0) * 0.25 : edge.kind === 'cadence' ? 0.05 : 0.08,
    }))
    const powerReceived = terms.filter(({ kind }) => kind === 'power').reduce((sum, term) => sum + term.value, 0)
    const cadenceMultiplier = 1 + terms.filter(({ kind }) => kind === 'cadence').reduce((sum, term) => sum + term.value, 0)
    const efficiencyMultiplier = 1 + terms.filter(({ kind }) => kind === 'efficiency').reduce((sum, term) => sum + term.value, 0)
    const baseOutput = baseOutputByNode[nodeId]
    const resolvedOutput = (baseOutput + powerReceived) * cadenceMultiplier * efficiencyMultiplier
    resolved.set(nodeId, resolvedOutput)
    nodes.push({
      nodeId,
      baseOutput,
      powerReceived,
      cadenceMultiplier,
      efficiencyMultiplier,
      resolvedOutput,
      formula: `(${baseOutput} + ${powerReceived}) × ${cadenceMultiplier} cadence × ${efficiencyMultiplier} efficiency`,
      terms,
    })
  }
  return {
    topologicalOrder: order,
    nodes,
    totalOutput: nodes.reduce((sum, node) => sum + node.resolvedOutput, 0),
  }
}

function pathGraph(
  routePrefix: string,
  orderedNodes: readonly ClockworkKindlingId[],
): ClockworkRoutingGraph {
  const kinds: readonly ClockworkRouteKind[] = ['power', 'cadence', 'efficiency']
  return {
    nodeIds: CLOCKWORK_KINDLING_IDS,
    edges: orderedNodes.slice(0, -1).map((from, index) => ({
      id: `${routePrefix}-${index + 1}`,
      from,
      to: orderedNodes[index + 1],
      kind: kinds[index % kinds.length],
    })),
  }
}

export interface ClockworkRouteLoadout {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly graph: ClockworkRoutingGraph
}

const DISTRIBUTED_ORDER: readonly ClockworkKindlingId[] = [
  'clockwork-tooth', 'clockwork-difference-engine', 'clockwork-cog', 'clockwork-relay-foundry', 'clockwork-ratchet', 'clockwork-meridian-clock',
  'clockwork-escapement', 'clockwork-prediction-mill', 'clockwork-mainspring', 'clockwork-city-of-hours', 'clockwork-flywheel',
  'clockwork-causal-engine', 'clockwork-governor', 'clockwork-world-gear', 'clockwork-clockmaker-automaton', 'clockwork-last-calendar',
  'clockwork-orrery', 'clockwork-great-regulator',
]

export const CLOCKWORK_ROUTE_LOADOUTS: readonly [
  ClockworkRouteLoadout,
  ClockworkRouteLoadout,
  ClockworkRouteLoadout,
] = [
  {
    id: 'clockwork-loadout-first-shift',
    name: 'First Shift',
    description: 'A six-Kindling teaching route with one visible socket per machine.',
    graph: pathGraph('clockwork-first-shift-edge', CLOCKWORK_KINDLING_IDS.slice(0, 6)),
  },
  {
    id: 'clockwork-loadout-civic-chain',
    name: 'Civic Chain',
    description: 'Every Kindling transmits work forward through one legible city-scale train.',
    graph: pathGraph('clockwork-civic-edge', CLOCKWORK_KINDLING_IDS),
  },
  {
    id: 'clockwork-loadout-distributed-works',
    name: 'Distributed Works',
    description: 'Early and late machines alternate so route inspection exposes every dependency.',
    graph: pathGraph('clockwork-distributed-edge', DISTRIBUTED_ORDER),
  },
]

export interface ClockworkLoadoutSwitchResult {
  readonly accepted: boolean
  readonly loadoutId: string
  readonly rewiringCost: 0
  readonly graph: ClockworkRoutingGraph | null
  readonly reason: 'switched' | 'trial-active' | 'unknown-loadout'
}

export function switchClockworkRouteLoadout(
  loadoutId: string,
  trialActive: boolean,
  loadouts: readonly ClockworkRouteLoadout[] = CLOCKWORK_ROUTE_LOADOUTS,
): ClockworkLoadoutSwitchResult {
  const loadout = loadouts.find((candidate) => candidate.id === loadoutId)
  if (!loadout) return { accepted: false, loadoutId, rewiringCost: 0, graph: null, reason: 'unknown-loadout' }
  if (trialActive) return { accepted: false, loadoutId, rewiringCost: 0, graph: null, reason: 'trial-active' }
  return { accepted: true, loadoutId, rewiringCost: 0, graph: loadout.graph, reason: 'switched' }
}

export interface ClockworkScheduledRouteChange {
  readonly atMs: number
  readonly loadoutId: string
}

export function resolveClockworkScheduledLoadout(
  schedule: readonly ClockworkScheduledRouteChange[],
  nowMs: number,
  defaultLoadoutId: string,
): string {
  if (!Number.isFinite(nowMs) || nowMs < 0) throw new RangeError('Clockwork schedule time must be finite and nonnegative.')
  const ordered = [...schedule].sort((left, right) => left.atMs - right.atMs || left.loadoutId.localeCompare(right.loadoutId))
  for (const entry of ordered) {
    if (!Number.isFinite(entry.atMs) || entry.atMs < 0) throw new RangeError('Clockwork scheduled changes require finite nonnegative times.')
  }
  return ordered.reduce(
    (selected, entry) => entry.atMs <= nowMs ? entry.loadoutId : selected,
    defaultLoadoutId,
  )
}
