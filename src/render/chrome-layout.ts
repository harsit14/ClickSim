export interface ChromeViewport {
  readonly width: number
  readonly height: number
}

export type ChromeLaneId =
  | 'run-status'
  | 'achievement'
  | 'dock'
  | 'notifications'
  | 'active-effects'
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
 * Narrow-screen chrome contract. The primary sections form a safe-area-aware
 * bottom rail, the shop sits directly above it, and transient surfaces stop
 * before the shop handle. Lumen replaces optional guidance while speaking.
 */
export function planNarrowChrome(
  viewport: ChromeViewport,
  lumenHistoryOpen = false,
  lumenActive = false,
): readonly ChromeLane[] {
  const { width, height } = viewport
  if (![width, height].every(Number.isFinite) || width < 320 || height < 560 || width > 800) return []

  const dockHeight = 70
  const shopHeight = Math.min(height * 0.38, 384)
  const shopY = height - dockHeight - shopHeight
  const lanes: ChromeLane[] = [
    lane('run-status', 8, 6, width - 16, 124),
    lane('achievement', Math.max(8, (width - Math.min(272, width - 16)) / 2), 131, Math.min(272, width - 16), 50),
    lane('shop', 6, shopY, width - 12, shopHeight),
    lane('dock', 0, height - dockHeight, width, dockHeight),
  ]

  if (lumenHistoryOpen) {
    lanes.push(lane('lumen-history', 8, 184, width - 16, Math.max(0, shopY - 192)))
  } else {
    const toastWidth = Math.min(224, width - 16)
    lanes.push(
      lane('active-effects', width - toastWidth - 10, 184, toastWidth, 32),
      lane('notifications', width - toastWidth - 8, 220, toastWidth, 100),
    )
    if (lumenActive) lanes.push(lane('lumen', 8, shopY - 114, width - 16, 62))
    else lanes.push(lane('guidance', 8, 344, width - 16, Math.min(96, height * 0.13)))
  }
  return lanes
}

export function chromeLanesOverlap(a: ChromeLane, b: ChromeLane): boolean {
  return a.x < b.x + b.width
    && a.x + a.width > b.x
    && a.y < b.y + b.height
    && a.y + a.height > b.y
}

export function narrowChromeCollisions(
  viewport: ChromeViewport,
  lumenHistoryOpen = false,
  lumenActive = false,
): readonly string[] {
  const lanes = planNarrowChrome(viewport, lumenHistoryOpen, lumenActive)
  const collisions: string[] = []
  for (let first = 0; first < lanes.length; first += 1) {
    for (let second = first + 1; second < lanes.length; second += 1) {
      if (chromeLanesOverlap(lanes[first], lanes[second])) collisions.push(`${lanes[first].id}:${lanes[second].id}`)
    }
  }
  return collisions
}
