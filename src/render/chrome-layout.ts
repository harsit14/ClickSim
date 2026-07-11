export interface ChromeViewport {
  readonly width: number
  readonly height: number
}

export type ChromeLaneId =
  | 'run-status'
  | 'achievement'
  | 'dock'
  | 'notifications'
  | 'guidance'
  | 'lumen'
  | 'lumen-history'
  | 'shop'

export interface ChromeLane {
  readonly id: ChromeLaneId
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

const lane = (id: ChromeLaneId, x: number, y: number, width: number, height: number): ChromeLane => ({ id, x, y, width, height })

/**
 * Phase 4's narrow chrome contract. At 800px and below the shop becomes a
 * bottom sheet and every transient surface receives one vertical lane.
 */
export function planNarrowChrome(viewport: ChromeViewport, lumenHistoryOpen = false): readonly ChromeLane[] {
  const { width, height } = viewport
  if (![width, height].every(Number.isFinite) || width < 320 || height < 560 || width > 800) return []

  const narrowest = width <= 380
  const sideRail = narrowest ? 51 : 64
  const lanes: ChromeLane[] = [
    lane('run-status', 8, 6, width - 16, 124),
    lane('achievement', Math.max(8, (width - Math.min(272, width - 16)) / 2), 131, Math.min(272, width - 16), 50),
    lane('dock', narrowest ? 6 : 8, 184, 40, Math.min(250, height * 0.3)),
    lane('lumen', 8, height - height * (narrowest ? 0.405 : 0.41) - 62, width - 16, 62),
    lane('shop', 0, height * 0.62, width, height * 0.38),
  ]

  if (lumenHistoryOpen) {
    lanes.push(lane('lumen-history', sideRail, 184, width - sideRail - 7, height * 0.5 - 184))
  } else {
    const toastWidth = Math.min(208, width - 64)
    lanes.push(
      lane('notifications', width - toastWidth - 10, 184, toastWidth, 148),
      lane('guidance', sideRail, narrowest ? 340 : 344, width - sideRail - 8, Math.min(96, height * 0.11)),
    )
  }
  return lanes
}

export function chromeLanesOverlap(a: ChromeLane, b: ChromeLane): boolean {
  return a.x < b.x + b.width
    && a.x + a.width > b.x
    && a.y < b.y + b.height
    && a.y + a.height > b.y
}

export function narrowChromeCollisions(viewport: ChromeViewport, lumenHistoryOpen = false): readonly string[] {
  const lanes = planNarrowChrome(viewport, lumenHistoryOpen)
  const collisions: string[] = []
  for (let first = 0; first < lanes.length; first += 1) {
    for (let second = first + 1; second < lanes.length; second += 1) {
      if (chromeLanesOverlap(lanes[first], lanes[second])) collisions.push(`${lanes[first].id}:${lanes[second].id}`)
    }
  }
  return collisions
}
