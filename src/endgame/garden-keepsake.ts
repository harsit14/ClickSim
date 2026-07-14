import { GARDEN_CLOSURES, GARDEN_NODES } from './garden'
import type { GardenEnding } from './types'

export interface GardenKeepsake {
  readonly ending: GardenEnding
  readonly title: string
  readonly consequence: string
  readonly finalLine: string
  readonly beaconNames: readonly string[]
}

const PALETTES: Readonly<Record<GardenEnding, readonly [string, string, string]>> = {
  warden: ['#080b10', '#d6a66d', '#f0dfbd'],
  hunger: ['#100908', '#cf7955', '#f2cf9d'],
  companion: ['#070c10', '#7eb9b3', '#e2e0b8'],
  continue: ['#070d0a', '#9eb37b', '#ece0b9'],
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function wrapWords(value: string, maximumCharacters: number): readonly string[] {
  const lines: string[] = []
  let line = ''
  for (const word of value.trim().split(/\s+/)) {
    const candidate = line ? `${line} ${word}` : word
    if (line && candidate.length > maximumCharacters) {
      lines.push(line)
      line = word
    } else line = candidate
  }
  if (line) lines.push(line)
  return lines
}

export function gardenKeepsake(
  ending: GardenEnding,
  beaconNames: Readonly<Record<string, string>> = {},
): GardenKeepsake {
  const closure = GARDEN_CLOSURES.find((entry) => entry.id === ending)
  if (!closure) throw new RangeError(`Unknown Garden ending: ${ending}`)
  return {
    ending,
    title: closure.name,
    consequence: closure.consequence,
    finalLine: closure.finalLine,
    beaconNames: GARDEN_NODES.map((node) => beaconNames[node.universeId]?.trim().slice(0, 32) || node.name),
  }
}

export function gardenKeepsakeFilename(ending: GardenEnding): string {
  return `ember-garden-${ending}.svg`
}

/** A self-contained, deterministic image: no fonts, network requests, or save data are embedded. */
export function gardenKeepsakeSvg(model: GardenKeepsake): string {
  const [background, accent, paper] = PALETTES[model.ending]
  const positions = [
    [148, 220], [132, 430], [380, 510], [1_050, 220], [860, 170], [1_070, 430], [780, 510],
  ] as const
  const links = [[0, 4], [1, 2], [3, 5], [5, 6], [2, 6], [3, 4], [0, 1]] as const
  const relationLines = links.map(([from, to]) => {
    const [x1, y1] = positions[from]
    const [x2, y2] = positions[to]
    return `<path d="M ${x1} ${y1} Q ${(x1 + x2) / 2} ${(y1 + y2) / 2 - 38} ${x2} ${y2}"/>`
  }).join('')
  const presences = positions.map(([x, y], index) => `
    <g transform="translate(${x} ${y})">
      <circle r="31" fill="${background}" stroke="${accent}" stroke-width="2"/>
      <circle r="19" fill="none" stroke="${paper}" stroke-opacity=".34"/>
      <path d="M -8 0 Q 0 -13 8 0 Q 0 13 -8 0" fill="none" stroke="${paper}" stroke-width="1.5"/>
      <text y="52" text-anchor="middle" class="presence">${escapeXml(model.beaconNames[index])}</text>
    </g>`).join('')
  const consequence = wrapWords(model.consequence, 72).slice(0, 3)
    .map((line, index) => `<text x="600" y="${358 + index * 25}" text-anchor="middle" class="copy">${escapeXml(line)}</text>`)
    .join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" role="img" aria-labelledby="title description">
  <title id="title">EMBER Garden keepsake — ${escapeXml(model.title)}</title>
  <desc id="description">${escapeXml(model.finalLine)}</desc>
  <defs>
    <radialGradient id="field"><stop stop-color="${accent}" stop-opacity=".13"/><stop offset="1" stop-color="${background}" stop-opacity="0"/></radialGradient>
    <style>
      text { font-family: Georgia, serif; fill: ${paper}; }
      .label { font: 600 15px Arial, sans-serif; letter-spacing: 4px; }
      .title { font-size: 42px; font-style: italic; }
      .line { font-size: 27px; font-style: italic; }
      .copy { font: 17px Arial, sans-serif; fill-opacity: .78; }
      .presence { font: 12px Arial, sans-serif; fill-opacity: .72; }
    </style>
  </defs>
  <rect width="1200" height="675" fill="${background}"/>
  <rect width="1200" height="675" fill="url(#field)"/>
  <g fill="none" stroke="${accent}" stroke-opacity=".24" stroke-width="1.5">${relationLines}</g>
  ${presences}
  <text x="600" y="72" text-anchor="middle" class="label">EMBER · THE GARDEN</text>
  <text x="600" y="126" text-anchor="middle" class="title">${escapeXml(model.title)}</text>
  <text x="600" y="304" text-anchor="middle" class="line">${escapeXml(model.finalLine)}</text>
  ${consequence}
  <text x="600" y="628" text-anchor="middle" class="label">THE STORY ENDS · THE MAP REMAINS OPEN</text>
</svg>`
}
