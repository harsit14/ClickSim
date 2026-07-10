import { mount } from 'svelte'
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

if (import.meta.env.DEV) {
  const scenario = createDevScenario(new URLSearchParams(window.location.search).get('scenario'))
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

const offlineGain = load()
setMasterVolume(game.sfxVolume)
setMusicVolume(game.musicVolume)
startLoop()
startAutosave()
startAchievementWatcher()
startAutomation()
registerOfflineWorker()

mount(App, {
  target: document.getElementById('app')!,
  props: { offlineGain },
})
