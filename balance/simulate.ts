/**
 * Headless balance simulator. Runs `npm run sim`.
 *
 * Plays 40 hours of game under different activity profiles with a
 * greedy best-payback bot, and prints when each generator tier and
 * wealth milestone is first reached. Use it after any curve change:
 * long gaps between rows = dead zones; instant runs of rows = walls
 * that collapsed too easily.
 */
import { GENERATORS } from '../src/content/generators'
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
const DT = 5 // seconds per step
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

function simulate(profile: Profile) {
  const s: EcoState = {
    light: 0,
    totalEarned: 0,
    clicks: 0,
    owned: {},
    upgrades: [],
    achievements: [],
    stardustTotal: 0,
    constellation: [],
    singUpgrades: [],
    challenge: null,
    challengesDone: [],
    ending: null,
    remembrances: 0,
    curiosities: [],
    keeperFedUntil: 0,
  }
  const events: string[] = []
  const firstBought = new Set<string>()
  const milestones = [1e3, 1e6, 1e9, 1e12, 1e15, 1e18, 1e21]
  let nextMilestone = 0

  for (let t = 0; t < HORIZON_HOURS * 3600; t += DT) {
    const gain = (totalRate(s) + clickPower(s) * profile.cps) * DT
    s.light += gain
    s.totalEarned += gain
    s.clicks += profile.cps * DT

    // buy greedily by payback until nothing sensible is affordable
    for (let guard = 0; guard < 40; guard++) {
      let bestPayback = Infinity
      let bestBuy: (() => string) | null = null

      for (const g of GENERATORS) {
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
        const before = totalRate(s) + clickPower(s) * profile.cps
        s.upgrades.push(u.id)
        const after = totalRate(s) + clickPower(s) * profile.cps
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
      if (key.startsWith('gen:') && !firstBought.has(key)) {
        firstBought.add(key)
        events.push(`${fmtT(t)}  first ${key.slice(4)}`)
      }
    }

    while (nextMilestone < milestones.length && s.totalEarned >= milestones[nextMilestone]) {
      events.push(`${fmtT(t)}  ── total earned ${milestones[nextMilestone].toExponential(0)}`)
      nextMilestone++
    }
  }

  console.log(`\n═══ ${profile.name} ═══`)
  for (const e of events) console.log(e)
  console.log(
    `end of ${HORIZON_HOURS}h: rate=${totalRate(s).toExponential(2)}/s  totalEarned=${s.totalEarned.toExponential(2)}  upgrades=${s.upgrades.length}`,
  )
}

simulate({ name: 'idle (1 click/s)', cps: 1 })
simulate({ name: 'active (6 clicks/s)', cps: 6 })
