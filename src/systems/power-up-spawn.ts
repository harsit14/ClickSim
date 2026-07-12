export type PowerUpEntryEdge = 'top' | 'bottom' | 'left' | 'right'

export interface PowerUpSpawnInput {
  readonly viewportWidth: number
  readonly viewportHeight: number
  readonly eventHalfWidth: number
  readonly eventHalfHeight: number
  /** Left edge of the combined HUD/Heart protected center lane. */
  readonly protectedLeft: number
  /** Right edge of the combined HUD/Heart protected center lane. */
  readonly protectedRight: number
  /** Bottom of the top HUD clearance, used to keep side entries visible. */
  readonly protectedTop: number
  /** Top of the Heart interaction circle, used to keep cross-screen arcs above it. */
  readonly protectedHeartTop: number
  /** Right edge available to the event after persistent UI rails are reserved. */
  readonly reservedRight?: number
  readonly edgeRoll: number
  readonly laneRoll: number
  readonly positionRoll: number
  readonly speedRoll: number
  readonly driftRoll: number
}

export interface PowerUpSpawnPlan {
  readonly edge: PowerUpEntryEdge
  readonly x: number
  readonly y: number
  readonly endX: number
  readonly endY: number
  readonly vx: number
  readonly vy: number
  readonly durationMs: number
  readonly arcX: number
  readonly arcY: number
  readonly travelAngleRad: number
}

function unit(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.min(0.999999, value)) : 0
}

/**
 * Fair shared entry contract for every universe power-up.
 *
 * Seventy percent travel vertically from the top/bottom. Side routes are
 * restricted to the upper half. Every route begins and ends fully inside a
 * 24px gutter, moves slowly, and bows away from the protected Heart/HUD lane.
 */
export function planPowerUpSpawn(input: PowerUpSpawnInput): PowerUpSpawnPlan {
  const width = Math.max(1, input.viewportWidth)
  const height = Math.max(1, input.viewportHeight)
  const halfWidth = Math.max(1, input.eventHalfWidth)
  const halfHeight = Math.max(1, input.eventHalfHeight)
  const edgeRoll = unit(input.edgeRoll)
  const laneRoll = unit(input.laneRoll)
  const positionRoll = unit(input.positionRoll)
  const speedRoll = unit(input.speedRoll)
  const driftRoll = unit(input.driftRoll)
  const gutter = 24
  const maximumArc = 20
  const maximumSideArc = 12
  const reservedRight = Math.max(
    halfWidth + gutter,
    Math.min(width, input.reservedRight ?? width),
  )

  let edge: PowerUpEntryEdge = edgeRoll < 0.44
    ? 'top'
    : edgeRoll < 0.7
      ? 'bottom'
      : edgeRoll < 0.85 ? 'left' : 'right'

  // Horizontal crossings consume the entire screen width, so they are not a
  // safe route while a persistent right-hand interaction rail is expanded.
  if (reservedRight < width && (edge === 'left' || edge === 'right')) {
    edge = edgeRoll < 0.85 ? 'top' : 'bottom'
  }

  const sideMinY = Math.max(
    halfHeight + gutter,
    input.protectedTop + halfHeight + maximumSideArc + 2,
  )
  const sideMaxY = Math.min(
    height * 0.5 - halfHeight - 8,
    input.protectedHeartTop - halfHeight - 12,
  )
  if ((edge === 'left' || edge === 'right') && sideMaxY <= sideMinY) {
    edge = edgeRoll < 0.85 ? 'top' : 'bottom'
  }

  const leftLane: readonly [number, number] = [
    halfWidth + gutter + maximumArc,
    input.protectedLeft - halfWidth - gutter,
  ]
  const rightLane: readonly [number, number] = [
    input.protectedRight + halfWidth + gutter,
    reservedRight - halfWidth - gutter - maximumArc,
  ]
  const lanes = [leftLane, rightLane].filter(([start, end]) => end > start)
  const selectedLane = lanes[Math.min(lanes.length - 1, Math.floor(laneRoll * lanes.length))]
  const verticalX = selectedLane
    ? selectedLane[0] + positionRoll * (selectedLane[1] - selectedLane[0])
    : reservedRight * (laneRoll < 0.5 ? 0.1 : 0.9)

  const verticalSpeed = 28 + speedRoll * 10
  const verticalOnLeft = selectedLane ? selectedLane === leftLane : laneRoll < 0.5
  const sideSpeed = 32 + speedRoll * 10
  let x = verticalX
  let y = halfHeight + gutter
  let endX = x
  let endY = height - halfHeight - gutter
  let vx = 0
  let vy = verticalSpeed
  let arcX = (verticalOnLeft ? -1 : 1) * (10 + driftRoll * 10)
  let arcY = 0

  if (edge === 'bottom') {
    y = height - halfHeight - gutter
    endY = halfHeight + gutter
    vy = -verticalSpeed
  } else if (edge === 'left' || edge === 'right') {
    x = edge === 'left' ? halfWidth + gutter : width - halfWidth - gutter
    endX = edge === 'left' ? width - halfWidth - gutter : halfWidth + gutter
    y = sideMinY + positionRoll * Math.max(0, sideMaxY - sideMinY)
    endY = y
    vx = edge === 'left' ? sideSpeed : -sideSpeed
    vy = 0
    arcX = 0
    arcY = -(8 + driftRoll * 4)
  }

  const distance = Math.hypot(endX - x, endY - y)
  const speed = Math.max(1, Math.hypot(vx, vy))
  const durationMs = distance / speed * 1_000
  return {
    edge,
    x,
    y,
    endX,
    endY,
    vx,
    vy,
    durationMs,
    arcX,
    arcY,
    travelAngleRad: Math.atan2(endY - y, endX - x),
  }
}

export function powerUpHasExited(
  edge: PowerUpEntryEdge,
  x: number,
  y: number,
  viewportWidth: number,
  viewportHeight: number,
  eventHalfWidth: number,
  eventHalfHeight: number,
): boolean {
  const gutter = 48
  if (edge === 'top') return y > viewportHeight + eventHalfHeight + gutter
  if (edge === 'bottom') return y < -eventHalfHeight - gutter
  if (edge === 'left') return x > viewportWidth + eventHalfWidth + gutter
  return x < -eventHalfWidth - gutter
}
