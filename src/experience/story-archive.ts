export interface StoryLineSource {
  readonly id: string
  readonly text: string
}

export interface StoryUniverseSource {
  readonly id: string
  readonly shortName: string
  readonly lumen: readonly StoryLineSource[]
}

export interface StoryRunSource {
  readonly seen: readonly string[]
}

export interface StoryTranscriptEntry {
  readonly id: string
  readonly text: string
  readonly sequence: number
}

export interface StoryTranscriptGroup {
  readonly universeId: string
  readonly universeName: string
  readonly current: boolean
  readonly entries: readonly StoryTranscriptEntry[]
}

export interface StoryTranscript {
  readonly groups: readonly StoryTranscriptGroup[]
  readonly count: number
  readonly latest: (StoryTranscriptEntry & { readonly universeId: string; readonly universeName: string }) | null
}

export function buildStoryTranscript(
  universes: readonly StoryUniverseSource[],
  activeUniverse: string,
  activeSeen: readonly string[],
  parkedRuns: Readonly<Record<string, StoryRunSource | undefined>>,
): StoryTranscript {
  const groups = universes.flatMap((universe): StoryTranscriptGroup[] => {
    const seen = universe.id === activeUniverse
      ? activeSeen
      : parkedRuns[universe.id]?.seen ?? []
    const lines = new Map(universe.lumen.map((line) => [line.id, line]))
    const recorded = new Set<string>()
    const entries = seen.flatMap((id, sequence): StoryTranscriptEntry[] => {
      const line = lines.get(id)
      if (!line || recorded.has(id)) return []
      recorded.add(id)
      return [{ id, text: line.text, sequence }]
    })
    if (entries.length === 0) return []
    return [{
      universeId: universe.id,
      universeName: universe.shortName,
      current: universe.id === activeUniverse,
      entries,
    }]
  })

  groups.sort((left, right) => Number(right.current) - Number(left.current))
  const currentGroup = groups.find(({ current }) => current)
  const latestGroup = currentGroup ?? groups[0]
  const latestEntry = latestGroup?.entries.at(-1)

  return {
    groups,
    count: groups.reduce((total, group) => total + group.entries.length, 0),
    latest: latestGroup && latestEntry
      ? { ...latestEntry, universeId: latestGroup.universeId, universeName: latestGroup.universeName }
      : null,
  }
}
