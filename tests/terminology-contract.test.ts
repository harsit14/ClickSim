import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), 'utf8')
}

test('the public terminology contract is documented and used by player-facing summaries', () => {
  const readme = source('../README.md')
  const stats = source('../src/ui/StatsPanel.svelte')
  const codex = source('../src/ui/Codex.svelte')
  const vessel = source('../src/ui/VesselPanel.svelte')

  assert.match(readme, /\*\*Realm\*\* is the public umbrella term/)
  assert.match(readme, /\*\*Restored world\*\* refers specifically/)
  assert.match(readme, /\*\*Loka\*\* refers specifically/)
  assert.match(readme, /\*\*Universe ID\*\* is the implementation term for a realm’s canonical key/)
  assert.match(stats, /<dt>realm<\/dt>/)
  assert.doesNotMatch(stats, /<dt>universe<\/dt>/)
  assert.match(codex, /current realm.*visited realm/)
  assert.match(vessel, /Each realm must build and activate its own crossing vessel/)
})

test('endgame records resolve stable universe IDs to public realm names', () => {
  const endgame = source('../src/ui/EndgameHub.svelte')

  assert.match(endgame, /function realmName\(universeId: string\)/)
  assert.match(endgame, /realmName\(loadout\.universeId\)/)
  assert.match(endgame, /realmName\(route\.universeId\)/)
  assert.doesNotMatch(endgame, /<span>\{loadout\.universeId\}<\/span>/)
  assert.doesNotMatch(endgame, /<span>\{route\.universeId\}/)
})
