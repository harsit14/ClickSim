import { mount } from 'svelte'
import '@fontsource-variable/inter/opsz.css'
import '@fontsource-variable/fraunces/full.css'
import '@fontsource-variable/fraunces/full-italic.css'
import './app.css'
import App from './App.svelte'
import { load, replaceStoredSave, startAutosave } from './core/save'
import { createDevScenario } from './core/dev-scenarios'
import { startLoop } from './core/loop'
import { game } from './engine/game.svelte'
import { setMasterVolume } from './audio/sfx'
import { setMusicVolume } from './audio/music'
import { startAchievementWatcher } from './systems/achievements.svelte'
import { startAutomation } from './systems/automation.svelte'
import { registerOfflineWorker } from './core/offline'

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

const offlineReturn = load()
setMasterVolume(game.sfxVolume)
setMusicVolume(game.musicVolume)
startLoop()
startAutosave()
startAchievementWatcher()
startAutomation()
registerOfflineWorker()

mount(App, {
  target: document.getElementById('app')!,
  props: { offlineReturn },
})
}
