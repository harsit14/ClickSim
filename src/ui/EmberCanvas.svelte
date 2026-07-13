<script lang="ts">
  import { onMount } from 'svelte'
  import { World } from '../render/world'
  import { setWorldRef } from '../render/world-ref'
  import { shownAt } from '../content/generators'
  import { universeById, universeV2ById } from '../content/universes'
  import { clickEmber, hasUi, game, buyGenerator } from '../engine/game.svelte'
  import { format } from '../core/format'
  import { playClick, playBuy, playRhythmAccent } from '../audio/sfx'
  import { beatDurationSec, currentBeatIndex, startMusic, isPlaying } from '../audio/music'
  import { chargeRhythmOmenAttraction, combo, registerClick, silenced } from '../systems/combo.svelte'
  import { gamePaused } from '../core/pause.svelte'
  import { averagedRhythmReward } from '../accessibility/averaged-rhythm'
  import { resolveVisualQuality } from '../core/preferences'
  import { amountFromNumber, gteAmount, subtractAmounts, ZERO_AMOUNT } from '../core/numeric/amount'
  import { totalRate } from '../engine/compute'
  import { completedGeneratorPurchaseFeedback } from '../feedback'
  import { publishLivePurchase } from '../feedback/live-runtime.svelte'
  import { kailashLongRestStatus } from '../content/universes/f4-runtime'
  import { consumeCrossingWrongClick } from '../experience/crossing-arrival.svelte'
  import {
    RHYTHM_COMPETENT_MULTIPLIER,
    RHYTHM_EXCEPTIONAL_MULTIPLIER,
  } from '../systems/rhythm-balance'

  let {
    averagedRhythm = false,
    comparativeBlind = false,
  }: { averagedRhythm?: boolean; comparativeBlind?: boolean } = $props()

  let canvas: HTMLCanvasElement
  let world: World | undefined
  let hovering = $state(false)
  let firstKindleResponse = $state('')
  let quasarRaf = 0
  let lastQuasarBeat = -1

  function clickReward(): { readonly multiplier: number; readonly onBeat: boolean } {
    if (!averagedRhythm) {
      const multiplier = registerClick()
      return { multiplier, onBeat: combo.streak > 0 }
    }
    combo.streak = 0
    combo.lastRewardAt = 0
    const v2Pack = universeV2ById(game.activeUniverse)
    const range = v2Pack?.accessibility.timing.averagedRewardRatio ?? [0.85, 0.9]
    const result = averagedRhythmReward({
      competentMultiplier: RHYTHM_COMPETENT_MULTIPLIER,
      exceptionalMultiplier: RHYTHM_EXCEPTIONAL_MULTIPLIER,
      targetCompetentRatio: (range[0] + range[1]) / 2,
      presentation: {
        audio: game.sfxVolume > 0 ? 'audible' : 'muted',
        motion: game.motionPreference === 'reduced' ? 'reduced' : 'full',
        quality: resolveVisualQuality(game.visualQuality, {
          width: window.innerWidth,
          devicePixelRatio: window.devicePixelRatio || 1,
          hardwareConcurrency: navigator.hardwareConcurrency || 8,
        }),
      },
    })
    if (result.omenAttractionCharge !== null) {
      chargeRhythmOmenAttraction(result.omenAttractionCharge)
    }
    return { multiplier: result.rewardMultiplier ?? 1, onBeat: false }
  }

  function handleClick(x: number, y: number) {
    if (!world) return
    if (game.activeUniverse === 'canticle' && kailashLongRestStatus(game.numericLawState).resting) return
    if (hasUi('music') && !isPlaying() && !silenced()) startMusic()
    const rhythm = clickReward()
    const result = clickEmber(rhythm.multiplier)
    if (game.clicks === 1) {
      const activeUniverse = universeById(game.activeUniverse)
      firstKindleResponse = `${activeUniverse.centralObject} answered. Plus ${format(result.amount)} ${activeUniverse.currency}.`
    }
    const wrongFootMode = consumeCrossingWrongClick(game.activeUniverse)
    const clickMode = wrongFootMode ?? universeById(game.activeUniverse).audio.click
    playClick(clickMode)
    if (rhythm.onBeat) playRhythmAccent(clickMode, combo.streak)
    world.clickPulse(x, y)
    world.burst(x, y, { onBeat: rhythm.onBeat, crit: result.crit, comboStreak: combo.streak })
    if (!comparativeBlind) world.addFloat(`${result.crit ? 'CRIT ' : '+'}${format(result.amount)}`, x, y - 12)
  }

  function quasarBeatIndex() {
    const beat = currentBeatIndex()
    if (beat !== null) return beat
    return Math.floor(performance.now() / (beatDurationSec() * 1000))
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
    if (!comparativeBlind) world.quasarTap(`${result.crit ? 'CRIT ' : ''}+${format(result.amount)}`, result.crit, now)
  }

  function onPointerDown(e: PointerEvent) {
    if (!world || gamePaused()) return
    if (world.isOnEmber(e.clientX, e.clientY, performance.now())) {
      handleClick(e.clientX, e.clientY)
    }
  }

  function onPointerMove(e: PointerEvent) {
    if (!world) return
    world.setPointerPosition(e.clientX, e.clientY)
    hovering = world.isOnEmber(e.clientX, e.clientY, performance.now())
  }

  function onKeyDown(e: KeyboardEvent) {
    if (gamePaused()) return
    const target = e.target as HTMLElement | null
    if (target && (target.tagName === 'BUTTON' || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return
    // 1–9 buy the nth generator in the shop
    if (e.key >= '1' && e.key <= '9' && hasUi('shop')) {
      const shown = universeById(game.activeUniverse).generators.filter((g) => gteAmount(game.totalEarned, amountFromNumber(shownAt(g))))
      const def = shown[Number(e.key) - 1]
      if (!def) return
      const ownedBefore = game.owned[def.id] ?? 0
      const lightBefore = game.light
      const beforeRate = totalRate(game)
      const occurredAtMs = performance.now()
      const bought = buyGenerator(def)
      if (bought <= 0) return
      const v2Pack = universeV2ById(game.activeUniverse)
      if (!v2Pack) {
        playBuy(1, game.activeUniverse, bought)
        return
      }
      const afterRate = totalRate(game)
      const feedback = completedGeneratorPurchaseFeedback({
        pack: v2Pack,
        generator: def,
        ownedBefore,
        quantity: bought,
        totalCost: subtractAmounts(lightBefore, game.light),
        rateDelta: gteAmount(afterRate, beforeRate)
          ? subtractAmounts(afterRate, beforeRate)
          : ZERO_AMOUNT,
        occurredAtMs,
      })
      publishLivePurchase(feedback.event, v2Pack, {
        audio: { silence: game.sfxVolume <= 0 },
        visual: {
          reducedMotion: game.motionPreference === 'reduced',
          quality: resolveVisualQuality(game.visualQuality, {
            width: window.innerWidth,
            devicePixelRatio: window.devicePixelRatio || 1,
            hardwareConcurrency: navigator.hardwareConcurrency || 8,
          }),
          milestoneThreshold: feedback.milestoneThreshold,
        },
      })
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
  data-focus-region="heart"
  data-focus-purpose="context"
  role="button"
  tabindex="0"
  aria-label={universeV2ById(game.activeUniverse)?.accessibility.heartLabel
    ?? `Kindle the ${universeById(game.activeUniverse).centralObject.toLowerCase()}`}
  aria-keyshortcuts="Space Enter"
  onpointerdown={onPointerDown}
  onpointermove={onPointerMove}
></canvas>
<div class="keyboard-focus" aria-hidden="true"></div>
<p class="first-kindle-response" aria-live="polite">{firstKindleResponse}</p>

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
  canvas:focus-visible { outline: none; }
  .keyboard-focus { position: fixed; top: 48%; left: 50%; width: clamp(9rem, 20vw, 13rem); aspect-ratio: 1; transform: translate(-50%, -50%); pointer-events: none; border: 2px solid transparent; border-radius: 50%; opacity: 0; z-index: 1; }
  canvas:focus-visible + .keyboard-focus { opacity: 1; border-color: #fff; box-shadow: 0 0 0 4px rgba(5,7,14,0.88), 0 0 0 6px var(--gold), 0 0 24px color-mix(in srgb, var(--gold) 55%, transparent); }
  .first-kindle-response { position: fixed; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
</style>
