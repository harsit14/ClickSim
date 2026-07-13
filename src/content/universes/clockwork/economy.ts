import type { GeneratorDef } from '../../generators'
import type { Effect, UpgradeDef } from '../../upgrades'

const kindling = (
  tier: number,
  id: string,
  name: string,
  baseCost: number,
  baseRate: number,
  hue: number,
  flavor: string,
): GeneratorDef => ({ id, name, flavor, baseCost, baseRate, costMult: 1.15, tier, hue })

export const CLOCKWORK_GENERATORS: GeneratorDef[] = [
  kindling(1, 'clockwork-tooth', 'Tooth', 15, 0.25, 42, 'One brass tooth waiting for a force worth transmitting.'),
  kindling(2, 'clockwork-cog', 'Cog', 180, 2.6, 38, 'A small agreement between torque and direction.'),
  kindling(3, 'clockwork-ratchet', 'Ratchet', 2_200, 23, 34, 'It remembers every forward step and refuses the reverse.'),
  kindling(4, 'clockwork-escapement', 'Escapement', 26_000, 210, 44, 'Released time, divided into useful intervals.'),
  kindling(5, 'clockwork-mainspring', 'Mainspring', 320_000, 1_800, 46, 'Patient tension stored for the exact moment of need.'),
  kindling(6, 'clockwork-flywheel', 'Flywheel', 4e6, 15_000, 30, 'Momentum made civic: steady enough for a whole district.'),
  kindling(7, 'clockwork-governor', 'Governor', 51e6, 125_000, 205, 'Two measured arms correcting excess before it becomes disaster.'),
  kindling(8, 'clockwork-clockmaker-automaton', 'Clockmaker Automaton', 650e6, 1.05e6, 48, 'A careful hand built to repair the hand that built it.'),
  kindling(9, 'clockwork-orrery', 'Orrery', 8.2e9, 9e6, 212, 'A sky reduced to gears without losing its questions.'),
  kindling(10, 'clockwork-difference-engine', 'Difference Engine', 105e9, 75e6, 195, 'Columns of brass predicting the next correct carry.'),
  kindling(11, 'clockwork-relay-foundry', 'Relay Foundry', 1.6e12, 640e6, 24, 'Instructions cast, cooled, and sent along the civic train.'),
  kindling(12, 'clockwork-meridian-clock', 'Meridian Clock', 27e12, 5.4e9, 52, 'Every district agrees, briefly, what now means.'),
  kindling(13, 'clockwork-prediction-mill', 'Prediction Mill', 450e12, 46e9, 178, 'Possible tomorrows enter as questions and leave as punched paper.'),
  kindling(14, 'clockwork-city-of-hours', 'City of Hours', 8e15, 390e9, 40, 'A civilization whose streets are schedules and whose bells are law.'),
  kindling(15, 'clockwork-causal-engine', 'Causal Engine', 150e15, 3.2e12, 224, 'It transmits not motion but the reason motion must follow.'),
  kindling(16, 'clockwork-world-gear', 'World Gear', 3e18, 28e12, 32, 'A continent of teeth turning one deliberate degree.'),
  kindling(17, 'clockwork-last-calendar', 'The Last Calendar', 60e18, 240e12, 12, 'Every remaining day engraved before anyone chooses to live it.'),
  kindling(18, 'clockwork-great-regulator', 'The Great Regulator', 1.3e21, 2.1e15, 214, 'The city, the sky, and causality resolved into one visible machine.'),
]

export const CLOCKWORK_GENERATOR_BY_ID = new Map(
  CLOCKWORK_GENERATORS.map((generator) => [generator.id, generator]),
)

const upgrades: UpgradeDef[] = []

const REFINEMENTS = [
  { at: 10, costMult: 15, adjective: 'Meshed', glyph: 'I', flavor: 'The first train closes without backlash.' },
  { at: 25, costMult: 75, adjective: 'Indexed', glyph: 'II', flavor: 'Every tooth arrives beneath its mark.' },
  { at: 50, costMult: 750, adjective: 'Regulated', glyph: 'III', flavor: 'The district can keep time without supervision.' },
] as const

for (const generator of CLOCKWORK_GENERATORS) {
  for (const refinement of REFINEMENTS) {
    upgrades.push({
      id: `${generator.id}-${refinement.at}`,
      name: `${refinement.adjective} ${generator.name}`,
      flavor: refinement.flavor,
      cost: Math.round(generator.baseCost * refinement.costMult),
      glyph: refinement.glyph,
      hue: generator.hue,
      unlock: { gen: generator.id, count: refinement.at },
      effects: [{ kind: 'genMult', gen: generator.id, value: 2 }],
    })
  }
}

const law = (
  id: string,
  name: string,
  flavor: string,
  cost: number,
  unlock: UpgradeDef['unlock'],
  effects: Effect[],
  glyph: string,
) => upgrades.push({ id, name, flavor, cost, unlock, effects, glyph, hue: 42 })

law('clockwork-engaged-touch', 'Engaged Touch', 'Your hand advances one visible tooth and no hidden die is cast.', 60, { clicks: 10 }, [{ kind: 'clickMult', value: 2 }], '⚙')
law('clockwork-positive-stop', 'Positive Stop', 'The Heart answers at the same measured depth every time.', 8_000, { clicks: 180 }, [{ kind: 'clickMult', value: 2 }, { kind: 'clickShare', value: 0.01 }], '⌑')
law('clockwork-bearing-standard', 'Bearing Standard', 'A civic specification removes friction from every train.', 10_000, { totalEarned: 5_000 }, [{ kind: 'globalMult', value: 6 }], '◎')
law('clockwork-ratchet-memory', 'Ratchet Memory', 'Every Tooth teaches the Ratchet what must not be lost.', 25_000, { gen: 'clockwork-ratchet', count: 10 }, [{ kind: 'synergy', gen: 'clockwork-ratchet', per: 'clockwork-tooth', value: 0.02 }], '∞')
law('clockwork-escapement-train', 'Escapement Train', 'Cogs deliver cadence while the Escapement decides when it becomes time.', 300_000, { gen: 'clockwork-escapement', count: 10 }, [{ kind: 'synergy', gen: 'clockwork-escapement', per: 'clockwork-cog', value: 0.01 }], '∞')
law('clockwork-governed-flywheel', 'Governed Flywheel', 'Correction and momentum become one stable public service.', 2e9, { gen: 'clockwork-governor', count: 10 }, [
  { kind: 'synergy', gen: 'clockwork-governor', per: 'clockwork-flywheel', value: 0.01 },
  { kind: 'globalMult', value: 2 },
], '∞')
law('clockwork-civic-relay', 'Civic Relay', 'The Foundry gives every Difference Engine a destination.', 8e12, { gen: 'clockwork-relay-foundry', count: 10 }, [
  { kind: 'synergy', gen: 'clockwork-relay-foundry', per: 'clockwork-difference-engine', value: 0.008 },
  { kind: 'globalMult', value: 2 },
], '∞')
law('clockwork-causal-calendar', 'Causal Calendar', 'The last date matters because the Causal Engine can still choose its route.', 1e20, { gen: 'clockwork-last-calendar', count: 1 }, [{ kind: 'globalMult', value: 2 }], '◫')

export const CLOCKWORK_UPGRADES = upgrades
export const CLOCKWORK_UPGRADE_BY_ID = new Map(upgrades.map((upgrade) => [upgrade.id, upgrade]))
