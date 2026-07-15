import { mount } from 'svelte'
import './fonts.css'
import './app.css'
import Root from './Root.svelte'
import { hasStoredProgress, load, replaceStoredSave, startAutosave } from './core/save'
import { createDevScenario } from './core/dev-scenarios'
import { startLoop } from './core/loop'
import { game } from './engine/game.svelte'
import { setMasterVolume } from './audio/sfx'
import { setMusicFocusMode, setMusicVolume } from './audio/music'
import { startAchievementWatcher } from './systems/achievements.svelte'
import { startMementoWatcher } from './systems/mementos.svelte'
import { startAutomation } from './systems/automation.svelte'
import { registerOfflineWorker } from './core/offline'
import { LANDING_SESSION_KEY, shouldShowLanding } from './experience/landing'

const devSearch = import.meta.env.DEV ? new URLSearchParams(window.location.search) : null
const silhouetteHarness = devSearch?.has('silhouettes') ?? false

if (silhouetteHarness) {
  void import('./ui/SilhouetteHarness.svelte').then(({ default: SilhouetteHarness }) => {
    mount(SilhouetteHarness, { target: document.getElementById('app')! })
  })
} else {
if (import.meta.env.DEV) {
  const scenario = createDevScenario(devSearch?.get('scenario') ?? null)
  if (scenario) replaceStoredSave(scenario)
  // debug/test hook — dev builds only
  ;(window as any).__ember = { game }
  void Promise.all([import('./audio/music'), import('./systems/buffs.svelte')]).then(
    ([music, buffs]) => {
      Object.assign((window as any).__ember, {
        beatPhase: music.beatPhaseSec,
        beatDuration: music.beatDurationSec,
        musicMode: music.currentMusicMode,
        playing: music.isPlaying,
        addBuff: buffs.addBuff,
        buffs: () => buffs.buffState.list,
      })
    },
  )
}

const returningPlayer = hasStoredProgress()
const offlineReturn = load()
setMasterVolume(game.sfxVolume)
setMusicVolume(game.musicVolume)
setMusicFocusMode(game.audioFocusMode)
registerOfflineWorker()

let runtimeStarted = false
function startGameRuntime() {
  if (runtimeStarted) return
  runtimeStarted = true
  startLoop()
  startAutosave()
  startAchievementWatcher()
  startMementoWatcher()
  startAutomation()
}

function landingSessionEntered(): boolean {
  try {
    return sessionStorage.getItem(LANDING_SESSION_KEY) === '1'
  } catch {
    return false
  }
}

function markLandingEntered() {
  try {
    sessionStorage.setItem(LANDING_SESSION_KEY, '1')
  } catch {
    // A private browsing policy may disable session storage. Play still works.
  }
}

const showLanding = shouldShowLanding({
  sessionEntered: landingSessionEntered(),
  developmentScenario: import.meta.env.DEV && devSearch?.has('scenario') === true,
  playtestMode: import.meta.env.DEV && devSearch?.get('playtest') === '1',
  forceLanding: import.meta.env.DEV && devSearch?.get('landing') === '1',
})
if (!showLanding) startGameRuntime()

mount(Root, {
  target: document.getElementById('app')!,
  props: {
    offlineReturn,
    returningPlayer,
    showLanding,
    onenter: () => {
      markLandingEntered()
      startGameRuntime()
    },
  },
})
}
