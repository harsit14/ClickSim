import { game } from '../engine/game.svelte'
import { newlyEligibleMementos } from '../content/mementos'
import { gamePaused } from '../core/pause.svelte'
import { save } from '../core/save'
import { pushToast } from './toasts.svelte'

let hydrated = false

function check() {
  if (gamePaused()) return
  const found = newlyEligibleMementos(game)
  if (found.length > 0) {
    game.mementos.push(...found.map((memento) => memento.id))
    save()
    if (hydrated) {
      if (found.length === 1) {
        pushToast(found[0].name, found[0].provenance, 'memento found')
      } else {
        pushToast(
          `${found.length} Mementos remembered`,
          'Later evidence completed several earlier spaces in the Cabinet Between Worlds.',
          'collection updated',
        )
      }
    }
  }
  hydrated = true
}

export function startMementoWatcher() {
  check()
  setInterval(check, 1_000)
}
