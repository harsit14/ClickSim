export interface HeartTargetPoint {
  readonly x: number
  readonly y: number
}

export interface HeartTargetViewport {
  readonly width: number
  readonly height: number
}

export interface HeartTargetRect {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

export const HEART_GROWTH_RADIUS_CAP = 58
export const HEART_INTERACTION_GUTTER = 16

/** A substantial opening Heart that still leaves room for its authored frame. */
export function heartBaseRadius(viewportWidth: number, viewportHeight: number): number {
  const shortestSide = Math.max(0, Math.min(viewportWidth, viewportHeight))
  return Math.max(42, Math.min(54, shortestSide * 0.065))
}

/** The forgiving interaction halo around the visible core. */
export function heartHitRadius(coreRadius: number): number {
  return Math.max(64, coreRadius * 1.75)
}

export function heartTargetCenter(viewport: HeartTargetViewport): HeartTargetPoint {
  return { x: viewport.width / 2, y: viewport.height * 0.48 }
}

/** Maximum live hit radius, including progression growth and a misclick gutter. */
export function heartMaximumHitRadius(viewport: HeartTargetViewport): number {
  return heartHitRadius(
    heartBaseRadius(viewport.width, viewport.height) + HEART_GROWTH_RADIUS_CAP,
  ) + HEART_INTERACTION_GUTTER
}

export function pointInsideHeartTarget(
  point: HeartTargetPoint,
  center: HeartTargetPoint,
  coreRadius: number,
): boolean {
  const radius = heartHitRadius(coreRadius)
  return (point.x - center.x) ** 2 + (point.y - center.y) ** 2 <= radius ** 2
}

export function rectIntersectsHeartTarget(
  rect: HeartTargetRect,
  viewport: HeartTargetViewport,
): boolean {
  const center = heartTargetCenter(viewport)
  const nearestX = Math.max(rect.x, Math.min(center.x, rect.x + rect.width))
  const nearestY = Math.max(rect.y, Math.min(center.y, rect.y + rect.height))
  const radius = heartMaximumHitRadius(viewport)
  return (nearestX - center.x) ** 2 + (nearestY - center.y) ** 2 <= radius ** 2
}
