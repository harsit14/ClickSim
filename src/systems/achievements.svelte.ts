import { ACHIEVEMENTS } from '../content/achievements'
import { CHALLENGE_BY_ID } from '../content/challenges'
import { universeById } from '../content/universes'
import { game, ratePerSec, endChallenge } from '../engine/game.svelte'
import { save } from '../core/save'
import { pushToast } from './toasts.svelte'
import { playAchievement, playSupernova } from '../audio/sfx'
import { gamePaused } from '../core/pause.svelte'

function checkChallenge() {
  if (!game.challenge) return
  const c = CHALLENGE_BY_ID.get(game.challenge)
  if (!c || !c.goal(game)) return
  endChallenge(true)
  save()
  playSupernova()
  pushToast(`${c.name} — complete`, `${c.rewardDesc}. The trial releases you.`, 'trial')
}

function check() {
  if (gamePaused()) return
  checkChallenge()
  const rate = ratePerSec()
  for (const def of ACHIEVEMENTS) {
    if (game.achievements.includes(def.id)) continue
    if (!def.when(game, rate)) continue
    game.achievements.push(def.id)
    pushToast(def.name, def.flavor, 'radiance +1%')
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
