/**
 * Headless balance simulator. Runs `npm run sim`.
 *
 * Plays 40 hours of game under different activity profiles with a
 * greedy best-payback bot, and prints when each generator tier and
 * wealth milestone is first reached. Use it after any curve change:
 * long gaps between rows = dead zones; instant runs of rows = walls
 * that collapsed too easily.
 */
import { DEFAULT_UNIVERSE_ID, UNIVERSES, universeById } from '../src/content/universes'
import {
  type EcoState,
  totalRate,
  clickPower,
  unitRate,
  globalMult,
  costOf,
  availableUpgrades,
} from '../src/engine/compute'

const HORIZON_HOURS = 40
const DT = 60 // seconds per step; one-minute pacing resolution keeps all-universe audits routine
const PAYBACK_LIMIT = 4 * 3600 // don't buy anything that pays back slower than this

interface Profile {
  name: string
  cps: number // sustained clicks per second
}

function fmtT(sec: number): string {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  return `${String(h).padStart(3)}h${String(m).padStart(2, '0')}m`
}

function simulate(profile: Profile, universeId: string) {
  const pack = universeById(universeId)
  console.log(`simulating ${pack.shortName} · ${profile.name}...`)
  const s: EcoState = {
    activeUniverse: universeId,
    light: 0,
    totalEarned: 0,
    clicks: 0,
    owned: {},
    upgrades: [],
    achievements: [],
    stardustTotal: 0,
    constellation: [],
    stardustWorks: {},
    singUpgrades: [],
    deepWorks: {},
    challenge: null,
    challengesDone: [],
    ending: null,
    remembrances: 0,
    curiosities: [],
    keeperFedUntil: 0,
    // Non-home universes are reachable only after Emberlight's Beacon is lit.
    // A rational crossing spends its first Dark Between on the production law.
    beacons: universeId === DEFAULT_UNIVERSE_ID ? [] : [DEFAULT_UNIVERSE_ID],
    darkBetween: 0,
    wayfinder: universeId === DEFAULT_UNIVERSE_ID ? [] : ['between-cargo'],
    vesselParts: [],
  }
  const events: string[] = []
  const firstBought = new Set<string>()
  const milestones = [1e3, 1e6, 1e9, 1e12, 1e15, 1e18, 1e21]
  let nextMilestone = 0
  let lastPurchaseAt = 0
  let longestPurchaseWall = 0
  let prestigeAvailableAt: number | null = null

  for (let t = 0; t < HORIZON_HOURS * 3600; t += DT) {
    const now = t * 1000
    const gain = (totalRate(s, now) + clickPower(s, 1, now) * profile.cps) * DT
    s.light += gain
    s.totalEarned += gain
    s.clicks += profile.cps * DT

    // buy greedily by payback until nothing sensible is affordable
    for (let guard = 0; guard < 16; guard++) {
      let bestPayback = Infinity
      let bestBuy: (() => string) | null = null

      for (const g of pack.generators) {
        const owned = s.owned[g.id] ?? 0
        const cost = costOf(g, owned)
        if (cost > s.light) continue
        const delta = unitRate(s, g) * globalMult(s)
        const payback = cost / Math.max(delta, 1e-12)
        if (payback < bestPayback) {
          bestPayback = payback
          bestBuy = () => {
            s.light -= cost
            s.owned[g.id] = owned + 1
            return 'gen:' + g.id
          }
        }
      }

      for (const u of availableUpgrades(s)) {
        if (u.cost > s.light) continue
        const before = totalRate(s, now) + clickPower(s, 1, now) * profile.cps
        s.upgrades.push(u.id)
        const after = totalRate(s, now) + clickPower(s, 1, now) * profile.cps
        s.upgrades.pop()
        const payback = u.cost / Math.max(after - before, 1e-12)
        if (payback < bestPayback) {
          bestPayback = payback
          bestBuy = () => {
            s.light -= u.cost
            s.upgrades.push(u.id)
            return 'up:' + u.id
          }
        }
      }

      if (!bestBuy || bestPayback > PAYBACK_LIMIT) break
      const key = bestBuy()
      if (prestigeAvailableAt === null) longestPurchaseWall = Math.max(longestPurchaseWall, t - lastPurchaseAt)
      lastPurchaseAt = t
      if (key.startsWith('gen:') && !firstBought.has(key)) {
        firstBought.add(key)
        events.push(`${fmtT(t)}  first ${key.slice(4)}`)
      }
    }

    while (nextMilestone < milestones.length && s.totalEarned >= milestones[nextMilestone]) {
      events.push(`${fmtT(t)}  ── total earned ${milestones[nextMilestone].toExponential(0)}`)
      if (milestones[nextMilestone] === 1e18 && prestigeAvailableAt === null) prestigeAvailableAt = t
      nextMilestone++
    }
  }

  const wallHorizon = prestigeAvailableAt ?? HORIZON_HOURS * 3600
  longestPurchaseWall = Math.max(longestPurchaseWall, wallHorizon - Math.min(lastPurchaseAt, wallHorizon))
  console.log(`\n═══ ${pack.shortName} · ${profile.name} ═══`)
  for (const e of events) console.log(e)
  console.log(
    `end of ${HORIZON_HOURS}h: rate=${totalRate(s, HORIZON_HOURS * 3600_000).toExponential(2)}/s  totalEarned=${s.totalEarned.toExponential(2)}  upgrades=${s.upgrades.length}  first Supernova=${prestigeAvailableAt === null ? 'not reached' : fmtT(prestigeAvailableAt)}  longest pre-Supernova purchase wall=${fmtT(longestPurchaseWall)}`,
  )
}

const universeArg = process.argv.find((argument) => argument.startsWith('--universe='))?.split('=')[1]
const universeIds = !universeArg || universeArg === 'all'
  ? UNIVERSES.map((universe) => universe.id)
  : [universeArg]

if (universeIds.some((id) => !UNIVERSES.some((universe) => universe.id === id))) {
  console.error(`Unknown universe "${universeArg}". Choose ${UNIVERSES.map((universe) => universe.id).join(', ')}, or all.`)
  process.exit(1)
}

const profiles: Profile[] = [
  { name: 'idle (1 click/s)', cps: 1 },
  { name: 'active (6 clicks/s)', cps: 6 },
]

for (const universeId of universeIds) {
  for (const profile of profiles) simulate(profile, universeId)
}
