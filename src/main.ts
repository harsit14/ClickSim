import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'
import { load, startAutosave } from './core/save'
import { startLoop } from './core/loop'
import { game } from './engine/game.svelte'
import { setMasterVolume } from './audio/sfx'
import { setMusicVolume } from './audio/music'
import { startAchievementWatcher } from './systems/achievements.svelte'
import { startAutomation } from './systems/automation.svelte'

if (import.meta.env.DEV) {
  // debug/test hook — dev builds only
  void Promise.all([import('./audio/music'), import('./systems/buffs.svelte')]).then(
    ([music, buffs]) => {
      ;(window as any).__ember = {
        beatPhase: music.beatPhaseSec,
        playing: music.isPlaying,
        addBuff: buffs.addBuff,
        buffs: () => buffs.buffState.list,
        game,
      }
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

mount(App, {
  target: document.getElementById('app')!,
  props: { offlineGain },
})
