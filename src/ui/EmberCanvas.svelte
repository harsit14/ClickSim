<script lang="ts">
  import { onMount } from 'svelte'
  import { World } from '../render/world'
  import { setWorldRef } from '../render/world-ref'
  import { shownAt } from '../content/generators'
  import { universeById } from '../content/universes'
  import { clickEmber, hasUi, game, buyGenerator } from '../engine/game.svelte'
  import { format } from '../core/format'
  import { playClick, playBuy } from '../audio/sfx'
  import { BEAT_SEC, currentBeatIndex, startMusic, isPlaying } from '../audio/music'
  import { registerClick, silenced } from '../systems/combo.svelte'
  import { gamePaused } from '../core/pause.svelte'

  let canvas: HTMLCanvasElement
  let world: World | undefined
  let hovering = $state(false)
  let quasarRaf = 0
  let lastQuasarBeat = -1

  function handleClick(x: number, y: number) {
    if (!world) return
    if (hasUi('music') && !isPlaying() && !silenced()) startMusic()
    const result = clickEmber(registerClick())
    playClick()
    world.clickPulse()
    world.burst(x, y)
    world.addFloat(`${result.crit ? 'CRIT ' : '+'}${format(result.amount)}`, x, y - 12)
  }

  function quasarBeatIndex() {
    const beat = currentBeatIndex()
    if (beat !== null) return beat
    return Math.floor(performance.now() / (BEAT_SEC * 1000))
  }

  function tickQuasar(now: number) {
    if (!world || gamePaused() || game.challenge || !game.curiosities.includes('second-cursor')) {
      lastQuasarBeat = -1
      return
    }
    const beat = quasarBeatIndex()
    if (beat === lastQuasarBeat) return
    lastQuasarBeat = beat
    const result = clickEmber(1)
    world.quasarTap(`${result.crit ? 'CRIT ' : ''}+${format(result.amount)}`, result.crit, now)
  }

  function onPointerDown(e: PointerEvent) {
    if (!world || gamePaused()) return
    if (world.isOnEmber(e.clientX, e.clientY, performance.now())) {
      handleClick(e.clientX, e.clientY)
    }
  }

  function onPointerMove(e: PointerEvent) {
    if (!world) return
    hovering = world.isOnEmber(e.clientX, e.clientY, performance.now())
  }

  function onKeyDown(e: KeyboardEvent) {
    if (gamePaused()) return
    const target = e.target as HTMLElement | null
    if (target && (target.tagName === 'BUTTON' || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return
    // 1–9 buy the nth generator in the shop
    if (e.key >= '1' && e.key <= '9' && hasUi('shop')) {
      const shown = universeById(game.activeUniverse).generators.filter((g) => game.totalEarned >= shownAt(g))
      const def = shown[Number(e.key) - 1]
      if (def && buyGenerator(def) > 0) playBuy()
      return
    }
    if (e.code !== 'Space' && e.code !== 'Enter') return
    if (!world) return
    e.preventDefault()
    const c = world.center
    handleClick(c.x, c.y)
  }

  onMount(() => {
    world = new World(canvas)
    setWorldRef(world)
    world.start()
    const quasarFrame = (now: number) => {
      tickQuasar(now)
      quasarRaf = requestAnimationFrame(quasarFrame)
    }
    quasarRaf = requestAnimationFrame(quasarFrame)
    const onResize = () => world?.resize()
    window.addEventListener('resize', onResize)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      world?.stop()
      cancelAnimationFrame(quasarRaf)
      setWorldRef(null)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('keydown', onKeyDown)
    }
  })
</script>

<canvas
  bind:this={canvas}
  class:hovering
  onpointerdown={onPointerDown}
  onpointermove={onPointerMove}
></canvas>

<style>
  canvas {
    position: fixed;
    inset: 0;
    display: block;
    touch-action: manipulation;
  }
  canvas.hovering {
    cursor: pointer;
  }
</style>
