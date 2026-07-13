import assert from 'node:assert/strict'
import test from 'node:test'
import {
  CLOCKWORK_ADVANCED_ROUTING_CAPABILITIES,
  CLOCKWORK_INITIAL_ROUTING_CAPABILITIES,
  CLOCKWORK_KINDLING_IDS,
  CLOCKWORK_ROUTE_LOADOUTS,
  inspectClockworkRoutingGraph,
  resolveClockworkScheduledLoadout,
  switchClockworkRouteLoadout,
  validateClockworkRoutingGraph,
} from '../src/content/universes/clockwork/routing'

const baseOutput = Object.fromEntries(
  CLOCKWORK_KINDLING_IDS.map((id, index) => [id, index + 1]),
) as Record<typeof CLOCKWORK_KINDLING_IDS[number], number>

test('all authored Clockwork loadouts are deterministic, socket-bounded DAGs', () => {
  for (const loadout of CLOCKWORK_ROUTE_LOADOUTS) {
    assert.deepEqual(validateClockworkRoutingGraph(loadout.graph), [], loadout.id)
    const first = inspectClockworkRoutingGraph(loadout.graph, baseOutput)
    const second = inspectClockworkRoutingGraph(loadout.graph, baseOutput)
    assert.deepEqual(first, second)
    assert.equal(first.topologicalOrder.length, 18)
    assert.ok(first.totalOutput > 0)
    assert.ok(first.nodes.every(({ formula }) => formula.includes('cadence') && formula.includes('efficiency')))
  }
})

test('initial socket rules reject fan-out, fan-in, self-routes, and cycles actionably', () => {
  const graph = CLOCKWORK_ROUTE_LOADOUTS[0].graph
  const malformed = {
    ...graph,
    edges: [
      ...graph.edges,
      { id: 'duplicate-output', from: 'clockwork-tooth' as const, to: 'clockwork-flywheel' as const, kind: 'power' as const },
      { id: 'cycle', from: 'clockwork-flywheel' as const, to: 'clockwork-tooth' as const, kind: 'cadence' as const },
      { id: 'self', from: 'clockwork-governor' as const, to: 'clockwork-governor' as const, kind: 'efficiency' as const },
    ],
  }
  const codes = new Set(validateClockworkRoutingGraph(malformed).map(({ code }) => code))
  assert.equal(codes.has('output-capacity-exceeded'), true)
  assert.equal(codes.has('input-capacity-exceeded'), true)
  assert.equal(codes.has('edge-self-route'), true)
  assert.equal(codes.has('cycle-forbidden'), true)
})

test('advanced splitter sockets expand capacity without permitting forbidden feedback cycles', () => {
  const graph = CLOCKWORK_ROUTE_LOADOUTS[0].graph
  const split = {
    ...graph,
    edges: [...graph.edges, {
      id: 'clockwork-splitter-test',
      from: 'clockwork-tooth' as const,
      to: 'clockwork-governor' as const,
      kind: 'efficiency' as const,
    }],
  }
  assert.equal(validateClockworkRoutingGraph(split, CLOCKWORK_INITIAL_ROUTING_CAPABILITIES).some(({ code }) => code === 'output-capacity-exceeded'), true)
  assert.deepEqual(validateClockworkRoutingGraph(split, CLOCKWORK_ADVANCED_ROUTING_CAPABILITIES), [])
})

test('loadout switching is free outside trials and fails closed inside them', () => {
  assert.deepEqual(switchClockworkRouteLoadout('clockwork-loadout-first-shift', true), {
    accepted: false,
    loadoutId: 'clockwork-loadout-first-shift',
    rewiringCost: 0,
    graph: null,
    reason: 'trial-active',
  })
  const switched = switchClockworkRouteLoadout('clockwork-loadout-civic-chain', false)
  assert.equal(switched.accepted, true)
  assert.equal(switched.rewiringCost, 0)
  assert.strictEqual(switched.graph, CLOCKWORK_ROUTE_LOADOUTS[1].graph)
  assert.equal(switchClockworkRouteLoadout('missing', false).reason, 'unknown-loadout')
})

test('scheduled loadout changes use caller time and stable ordering only', () => {
  const schedule = [
    { atMs: 20_000, loadoutId: 'clockwork-loadout-distributed-works' },
    { atMs: 5_000, loadoutId: 'clockwork-loadout-civic-chain' },
  ]
  assert.equal(resolveClockworkScheduledLoadout(schedule, 0, 'clockwork-loadout-first-shift'), 'clockwork-loadout-first-shift')
  assert.equal(resolveClockworkScheduledLoadout(schedule, 5_000, 'clockwork-loadout-first-shift'), 'clockwork-loadout-civic-chain')
  assert.equal(resolveClockworkScheduledLoadout(schedule, 25_000, 'clockwork-loadout-first-shift'), 'clockwork-loadout-distributed-works')
  assert.throws(() => resolveClockworkScheduledLoadout(schedule, Number.NaN, 'clockwork-loadout-first-shift'), /finite/)
})
