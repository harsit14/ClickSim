export interface HudClearanceViewport {
  readonly width: number
  readonly height: number
}

export interface HudClearanceRect {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

/**
 * The centered run-status stack is deliberately kept free of world objects.
 * Width follows the readable HUD measure while retaining usable side lanes;
 * height covers the counter, rate, universe law, buffs, and upgrade chips.
 */
export function hudClearanceRect(viewport: HudClearanceViewport): HudClearanceRect {
  const width = Math.min(34 * 16, viewport.width * 0.68)
  const height = Math.min(14 * 16, Math.max(12.5 * 16, viewport.height * 0.29))
  return {
    x: (viewport.width - width) / 2,
    y: 0,
    width,
    height: Math.min(viewport.height, height),
  }
}

export function rectsIntersect(
  left: HudClearanceRect,
  right: HudClearanceRect,
): boolean {
  return left.x < right.x + right.width
    && left.x + left.width > right.x
    && left.y < right.y + right.height
    && left.y + left.height > right.y
}

export function rectIntersectsHudClearance(
  rect: HudClearanceRect,
  viewport: HudClearanceViewport,
): boolean {
  return rectsIntersect(rect, hudClearanceRect(viewport))
}

export function circleIntersectsHudClearance(
  x: number,
  y: number,
  radius: number,
  viewport: HudClearanceViewport,
): boolean {
  return rectIntersectsHudClearance({
    x: x - radius,
    y: y - radius,
    width: radius * 2,
    height: radius * 2,
  }, viewport)
}
