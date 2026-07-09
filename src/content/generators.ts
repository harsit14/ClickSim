export interface GeneratorDef {
  id: string
  name: string
  flavor: string
  baseCost: number
  baseRate: number
  costMult: number
  tier: number
  hue: number
}

const G = (
  tier: number,
  id: string,
  name: string,
  baseCost: number,
  baseRate: number,
  hue: number,
  flavor: string,
): GeneratorDef => ({ id, name, flavor, baseCost, baseRate, costMult: 1.15, tier, hue })

export const GENERATORS: GeneratorDef[] = [
  G(1, 'spark', 'Spark', 15, 0.3, 38, 'A fleck of you, set loose.'),
  G(2, 'wisp', 'Wisp', 180, 2.8, 190, "It dances. It shouldn't. It does."),
  G(3, 'hearth', 'Hearth', 2_200, 24, 18, 'The first place warmth calls home.'),
  G(4, 'kiln', 'Kiln', 26_000, 200, 28, 'Light, concentrated into making.'),
  G(5, 'forge', 'Forge', 320_000, 1_700, 12, 'Where light learns to work.'),
  G(6, 'beacon', 'Beacon', 4e6, 14_000, 48, 'Light that calls to nothing... yet.'),
  G(7, 'titan', 'Furnace Titan', 51e6, 120_000, 8, 'A heart the size of a hill.'),
  G(8, 'starseed', 'Star Seed', 650e6, 1e6, 80, 'Plant it. Wait. Believe.'),
  G(9, 'protostar', 'Protostar', 8.2e9, 8.6e6, 200, 'The waiting pays off.'),
  G(10, 'sun', 'Sun', 105e9, 72e6, 45, 'You remember how to make these.'),
  G(11, 'binary', 'Binary Pair', 1.6e12, 610e6, 55, 'Suns are less lonely in twos.'),
  G(12, 'constellation', 'Constellation', 27e12, 5.2e9, 210, "You're drawing with stars now."),
  G(13, 'nebula', 'Nebula Garden', 450e12, 44e9, 280, 'Stellar nurseries, tended by wisps.'),
  G(14, 'galaxy', 'Galaxy', 8e15, 370e9, 230, 'A hundred billion of your children.'),
  G(15, 'supercluster', 'Supercluster', 150e15, 3.1e12, 260, 'Structure at the scale of everything.'),
  G(16, 'web', 'Cosmic Web', 3e18, 27e12, 175, 'The filaments between all things.'),
  G(17, 'loom', 'Deep Loom', 60e18, 230e12, 320, 'Where reality is woven.'),
  G(18, 'ember2', 'The Second Ember', 1.3e21, 2e15, 0, '...it looks back at you.'),
]

export const GENERATOR_BY_ID = new Map(GENERATORS.map((g) => [g.id, g]))

/** Total light ever earned before this generator appears in the shop. */
export function shownAt(g: GeneratorDef): number {
  return g.baseCost * 0.45
}

/** Total light ever earned before this generator is teased as "???". */
export function teasedAt(g: GeneratorDef): number {
  return g.baseCost * 0.18
}
