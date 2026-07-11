import { ACHIEVEMENTS } from '../../content/achievements'

export type KindledSkyCategory =
  | 'wealth' | 'touch' | 'flow' | 'kindling' | 'craft' | 'omens'
  | 'rhythm' | 'rebirth' | 'deep' | 'trials' | 'archive' | 'memory'

export interface KindledSkyStar {
  readonly id: string
  readonly name: string
  readonly category: KindledSkyCategory
  readonly x: number
  readonly y: number
  readonly categoryIndex: number
}

export interface KindledSkyRoute {
  readonly category: KindledSkyCategory
  readonly from: readonly [number, number]
  readonly to: readonly [number, number]
}

const CATEGORY_ORDER: readonly KindledSkyCategory[] = [
  'wealth', 'touch', 'flow', 'kindling', 'craft', 'omens',
  'rhythm', 'rebirth', 'deep', 'trials', 'archive', 'memory',
]

// These are loose regions, not cells in a grid. Their uneven spacing keeps the
// achievement sky from reading as a diagram before individual stars accumulate.
const CATEGORY_ANCHORS: Readonly<Record<KindledSkyCategory, readonly [number, number]>> = {
  wealth: [8, 13],
  touch: [29, 9],
  flow: [53, 19],
  kindling: [79, 8],
  craft: [17, 39],
  omens: [44, 32],
  rhythm: [70, 43],
  rebirth: [91, 29],
  deep: [9, 71],
  trials: [35, 62],
  archive: [62, 79],
  memory: [88, 66],
}

export function kindledSkyCategory(id: string): KindledSkyCategory {
  if (/^(first-hundred|warm-corner|milli|giga|tera|peta|exa|zetta|yotta)/.test(id)) return 'wealth'
  if (/^(knock|persistent|devoted|obsessed|true-name|first-crit|crit-|with-these-hands|purist|impatience)/.test(id)) return 'touch'
  if (/^(steady-glow|river|torrent|cascade|deluge|the-pour)/.test(id)) return 'flow'
  if (/^(first-(spark|wisp|hearth|kiln|forge|beacon|titan|starseed|protostar|sun|binary|constellation|nebula|galaxy|supercluster|web|loom|ember2)|spark-|wisp-|hearth-|sun-|galaxy-)/.test(id)) return 'kindling'
  if (/^(a-better-way|refined|perfectionist|no-stone|fully-furnished)/.test(id)) return 'craft'
  if (/^(caught|star-catcher|meteor-greed|lucky)/.test(id)) return 'omens'
  if (/^(on-the-beat|in-the-groove|metronome|beyond-the-song|louder-than-silence)/.test(id)) return 'rhythm'
  if (/^(nova-|dust-|first-node|cartographer|endless-sky)/.test(id)) return 'rebirth'
  if (/^(deep-|sing-|automated|deeper-still|dragons-nest)/.test(id)) return 'deep'
  if (/^(trial-|tested|tempered|lawbreaker|unbreakable)/.test(id)) return 'trials'
  if (/^(curiosity-)/.test(id)) return 'archive'
  return 'memory'
}

function seededUnit(seed: number): number {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43_758.5453
  return value - Math.floor(value)
}

function starOffset(category: KindledSkyCategory, index: number): readonly [number, number] {
  const categoryIndex = CATEGORY_ORDER.indexOf(category)
  const spread = Math.min(12, 6.5 + Math.floor(index / 7) * 1.8)
  const x = (seededUnit(categoryIndex * 101 + index * 17 + 3) - 0.5) * spread * 2
  const y = (seededUnit(categoryIndex * 149 + index * 29 + 11) - 0.5) * spread * 1.45
  return [x, y]
}

export function planKindledSky(achievementIds: readonly string[]): {
  readonly stars: readonly KindledSkyStar[]
  readonly routes: readonly KindledSkyRoute[]
} {
  const unlocked = new Set(achievementIds)
  const counts = new Map<KindledSkyCategory, number>()
  const stars: KindledSkyStar[] = []
  for (const achievement of ACHIEVEMENTS) {
    if (!unlocked.has(achievement.id)) continue
    const category = kindledSkyCategory(achievement.id)
    const categoryIndex = counts.get(category) ?? 0
    counts.set(category, categoryIndex + 1)
    const anchor = CATEGORY_ANCHORS[category]
    const offset = starOffset(category, categoryIndex)
    stars.push({
      id: achievement.id,
      name: achievement.name,
      category,
      x: Math.max(3, Math.min(97, anchor[0] + offset[0])),
      y: Math.max(4, Math.min(96, anchor[1] + offset[1])),
      categoryIndex,
    })
  }
  const routes: KindledSkyRoute[] = []
  for (const category of CATEGORY_ORDER) {
    const categoryStars = stars.filter((star) => star.category === category)
    for (let index = 1; index < categoryStars.length; index += 1) {
      const star = categoryStars[index]
      const nearest = categoryStars.slice(0, index).reduce((best, candidate) => {
        const distance = Math.hypot(candidate.x - star.x, candidate.y - star.y)
        return distance < best.distance ? { star: candidate, distance } : best
      }, { star: categoryStars[0], distance: Number.POSITIVE_INFINITY })
      // A constellation may remain a broken suggestion. Long explanatory lines
      // recreate the schematic look this layer is meant to avoid.
      if (nearest.distance > 14) continue
      routes.push({
        category,
        from: [nearest.star.x, nearest.star.y],
        to: [star.x, star.y],
      })
    }
  }
  return { stars, routes }
}

export const KINDLED_SKY_CATEGORIES = CATEGORY_ORDER
