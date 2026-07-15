import { ACHIEVEMENTS, achievementDisplay } from '../content/achievements'
import { CHALLENGE_BY_ID } from '../content/challenges'
import { universeById } from '../content/universes'
import { challengeCopy } from '../content/universe-progression'
import { game, ratePerSec, endChallenge } from '../engine/game.svelte'
import { save } from '../core/save'
import { pushAchievementToast, pushToast } from './toasts.svelte'
import { playAchievement, playSupernova } from '../audio/sfx'
import { gamePaused } from '../core/pause.svelte'
import { worldRef } from '../render/world-ref'
import { achievementPointPercent } from '../content/economy-balance'

function checkChallenge() {
  if (!game.challenge) return
  const c = CHALLENGE_BY_ID.get(game.challenge)
  const universe = universeById(game.activeUniverse)
  if (!c || !c.goal(game, universe.generators)) return
  const copy = challengeCopy(c, universe)
  endChallenge(true)
  save()
  playSupernova()
  pushToast(`${copy.name} — complete`, `${copy.rewardDesc}. The trial releases you.`, 'trial')
}

function check() {
  if (gamePaused()) return
  checkChallenge()
  const rate = ratePerSec()
  for (const def of ACHIEVEMENTS) {
    if (game.achievements.includes(def.id)) continue
    if (!def.when(game, rate)) continue
    game.achievements.push(def.id)
    const pack = universeById(game.activeUniverse)
    const copy = achievementDisplay(def, pack.id)
    pushAchievementToast(copy.name,
      copy.flavor,
      `${pack.achievementPower.toLowerCase()} +${achievementPointPercent(game.achievements.length)}%`,
    )
    worldRef()?.emitParticleRecipe('achievement')
    playAchievement()
  }
  for (const echo of universeById(game.activeUniverse).echoes) {
    if (game.echoes.includes(echo.id)) continue
    if (!echo.when(game)) continue
    game.echoes.push(echo.id)
    pushToast(echo.title, 'A fragment of the old universe, recovered. Read it in the codex.', 'echo')
    playAchievement()
  }
}

export function startAchievementWatcher() {
  setInterval(check, 1_000)
}
