<script lang="ts">
  import EmberCanvas from './ui/EmberCanvas.svelte'
  import Hud from './ui/Hud.svelte'
  import ShopPanel from './ui/ShopPanel.svelte'
  import UpgradeBar from './ui/UpgradeBar.svelte'
  import UiChips from './ui/UiChips.svelte'
  import StatsPanel from './ui/StatsPanel.svelte'
  import OptionsPanel from './ui/OptionsPanel.svelte'
  import CuriosityCabinet from './ui/CuriosityCabinet.svelte'
  import VesselPanel from './ui/VesselPanel.svelte'
  import LumenTicker from './ui/LumenTicker.svelte'
  import WelcomeBack from './ui/WelcomeBack.svelte'
  import FallingStar from './ui/FallingStar.svelte'
  import BuffBar from './ui/BuffBar.svelte'
  import ComboMeter from './ui/ComboMeter.svelte'
  import Toasts from './ui/Toasts.svelte'
  import Observatory from './ui/Observatory.svelte'
  import Codex from './ui/Codex.svelte'
  import SupernovaCutscene from './ui/SupernovaCutscene.svelte'
  import TheDeep from './ui/TheDeep.svelte'
  import ChallengeBanner from './ui/ChallengeBanner.svelte'
  import QuestionChip from './ui/QuestionChip.svelte'
  import TheQuestion from './ui/TheQuestion.svelte'
  import RemembranceOverlay from './ui/RemembranceOverlay.svelte'
  import CrossingPrelude from './ui/CrossingPrelude.svelte'
  import {
    game,
    hasUi,
    crossToUniverse,
    performSupernova,
    supernovaGain,
    vesselHasReadyPart,
    vesselRevealed,
  } from './engine/game.svelte'
  import { clearBuffs } from './systems/buffs.svelte'
  import { combo } from './systems/combo.svelte'
  import { save } from './core/save'
  import { isPlaying, setStems, startMusic } from './audio/music'
  import { THEME_BY_ID } from './content/themes'
  import { universeById } from './content/universes'
  import { acquireGamePause } from './core/pause.svelte'

  let { offlineGain }: { offlineGain: number } = $props()

  let statsOpen = $state(false)
  let optionsOpen = $state(false)
  let curiositiesOpen = $state(false)
  let vesselOpen = $state(false)
  let observatoryOpen = $state(false)
  let codexOpen = $state(false)
  let deepOpen = $state(false)
  let cutsceneActive = $state(false)
  let questionOpen = $state(false)
  let remembering = $state(false)
  let crossingPrelude = $state(false)
  let crossingTarget = $state<string | null>(null)
  let resumeMusicAfterNova = false

  const novaReady = $derived(supernovaGain() >= 1)
  const observatoryVisible = $derived(
    game.stardustTotal > 0 || game.supernovae > 0 || novaReady || game.allTimeEarned >= 1e11,
  )
  const deepVisible = $derived(
    game.singTotal > 0 || game.collapses > 0 || game.stardustTotal >= 15 || game.challenge !== null,
  )
  const deepReady = $derived(game.challenge === null && game.stardustTotal >= 20)
  const curiositiesVisible = $derived(game.curiosities.length > 0 || game.totalEarned >= 250_000)
  const vesselVisible = $derived(vesselRevealed())
  const vesselReady = $derived(vesselHasReadyPart())
  const utilityPanelOpen = $derived(
    statsOpen || optionsOpen || curiositiesOpen || vesselOpen || observatoryOpen || codexOpen || deepOpen,
  )
  const storyModalActive = $derived(cutsceneActive || questionOpen || remembering || crossingPrelude)

  $effect(() => {
    if (!storyModalActive) return
    return acquireGamePause('story scene')
  })

  function closeAll() {
    statsOpen = optionsOpen = curiositiesOpen = vesselOpen = observatoryOpen = codexOpen = deepOpen = false
  }
  function toggleStats() {
    const next = !statsOpen
    closeAll()
    statsOpen = next
  }
  function toggleOptions() {
    const next = !optionsOpen
    closeAll()
    optionsOpen = next
  }
  function toggleCuriosities() {
    const next = !curiositiesOpen
    closeAll()
    curiositiesOpen = next
  }
  function toggleVessel() {
    const next = !vesselOpen
    closeAll()
    vesselOpen = next
  }
  function toggleObservatory() {
    const next = !observatoryOpen
    closeAll()
    observatoryOpen = next
  }
  function toggleCodex() {
    const next = !codexOpen
    closeAll()
    codexOpen = next
  }
  function toggleDeep() {
    const next = !deepOpen
    closeAll()
    deepOpen = next
  }

  function beginSupernova() {
    closeAll()
    resumeMusicAfterNova = isPlaying()
    cutsceneActive = true
  }

  function resetForSupernova(): number {
    const gain = performSupernova()
    clearBuffs()
    combo.streak = 0
    combo.lastRewardAt = 0
    save()
    return gain
  }

  function afterSupernova() {
    cutsceneActive = false
    if (resumeMusicAfterNova && hasUi('music')) startMusic()
    resumeMusicAfterNova = false
  }

  function beginCrossingPrelude(universeId: string) {
    closeAll()
    crossingTarget = universeId
    crossingPrelude = true
  }

  function finishCrossing(universeId: string) {
    if (crossToUniverse(universeId)) {
      clearBuffs()
      combo.streak = 0
      combo.lastRewardAt = 0
      save()
    }
    crossingPrelude = false
    crossingTarget = null
  }

  // vestments: apply the chosen accent theme to the document root
  $effect(() => {
    const theme = THEME_BY_ID.get(game.theme) ?? THEME_BY_ID.get('ember')!
    for (const [key, value] of Object.entries(theme.vars)) {
      document.documentElement.style.setProperty(key, value)
    }
    for (const [key, value] of Object.entries(universeById(game.activeUniverse).palette.vars)) {
      document.documentElement.style.setProperty(key, value)
    }
  })

  const anyOf = (ids: string[]) => ids.some((id) => (game.owned[id] ?? 0) > 0)
  $effect(() => {
    setStems({
      mallets: anyOf(['hearth', 'kiln', 'forge']),
      bass: anyOf(['beacon', 'titan', 'starseed']),
      strings: anyOf(['protostar', 'sun', 'binary', 'constellation']),
      choir: anyOf(['nebula', 'galaxy', 'supercluster', 'web', 'loom', 'ember2']),
    })
  })
</script>

<div class="game-shell" inert={storyModalActive} aria-hidden={storyModalActive}>
  <EmberCanvas />
  <section class="top-stack" aria-label="Run status and upgrades">
    <Hud />
    <BuffBar />
    <ChallengeBanner />
    {#if !utilityPanelOpen}
      <UpgradeBar />
    {/if}
  </section>
  <ShopPanel suppressed={utilityPanelOpen} />
  <UiChips />
  <ComboMeter />
  <LumenTicker />
  <FallingStar />
  <Toasts />
  <WelcomeBack amount={offlineGain} />

  <nav class="dock" aria-label="Game sections">
    {#if hasUi('stats')}
      <button class="dock-btn" class:open={statsOpen} onclick={toggleStats} title="A way to remember" aria-label="A way to remember">▤</button>
    {/if}
    {#if hasUi('options')}
      <button class="dock-btn" class:open={optionsOpen} onclick={toggleOptions} title="A way to choose" aria-label="A way to choose">⚙</button>
    {/if}
    {#if curiositiesVisible}
      <button class="dock-btn curiosity" class:open={curiositiesOpen} onclick={toggleCuriosities} title="The Celestial Cabinet" aria-label="The Celestial Cabinet">◍</button>
    {/if}
    {#if vesselVisible}
      <button class="dock-btn vessel" class:open={vesselOpen} class:ready={vesselReady} onclick={toggleVessel} title="The Vessel" aria-label="The Vessel">⌁</button>
    {/if}
    {#if observatoryVisible}
      <button class="dock-btn stardust" class:open={observatoryOpen} class:ready={novaReady} onclick={toggleObservatory} title="The Observatory" aria-label="The Observatory">✧</button>
    {/if}
    {#if deepVisible}
      <button class="dock-btn deep" class:open={deepOpen} class:ready={deepReady} onclick={toggleDeep} title="The Deep" aria-label="The Deep">◉</button>
    {/if}
    {#if game.echoes.length > 0}
      <button class="dock-btn" class:open={codexOpen} onclick={toggleCodex} title="Codex of Echoes" aria-label="Codex of Echoes">❖</button>
    {/if}
  </nav>

  {#if statsOpen}
    <StatsPanel onclose={() => (statsOpen = false)} />
  {/if}
  {#if optionsOpen}
    <OptionsPanel onclose={() => (optionsOpen = false)} />
  {/if}
  {#if curiositiesOpen}
    <CuriosityCabinet onclose={() => (curiositiesOpen = false)} />
  {/if}
  {#if vesselOpen}
    <VesselPanel onclose={() => (vesselOpen = false)} oncross={beginCrossingPrelude} />
  {/if}
  {#if observatoryOpen}
    <Observatory onclose={() => (observatoryOpen = false)} onsupernova={beginSupernova} />
  {/if}
  {#if codexOpen}
    <Codex
      onclose={() => (codexOpen = false)}
      onremember={() => { closeAll(); remembering = true }}
    />
  {/if}
  {#if deepOpen}
    <TheDeep onclose={() => (deepOpen = false)} />
  {/if}
  <QuestionChip onopen={() => { closeAll(); questionOpen = true }} />
</div>
{#if cutsceneActive}
  <SupernovaCutscene doReset={resetForSupernova} onfinished={afterSupernova} />
{/if}
{#if questionOpen}
  <TheQuestion onclose={() => (questionOpen = false)} />
{/if}
{#if remembering}
  <RemembranceOverlay onfinished={() => (remembering = false)} />
{/if}
{#if crossingPrelude && crossingTarget}
  <CrossingPrelude destination={crossingTarget} onfinished={finishCrossing} />
{/if}

<style>
  .game-shell {
    position: fixed;
    inset: 0;
  }
  .top-stack {
    position: fixed;
    top: clamp(0.55rem, 1.7vh, 0.9rem);
    left: 50%;
    width: min(34rem, calc(100vw - 1rem));
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    transform: translateX(-50%);
    pointer-events: none;
    z-index: 8;
  }
  .dock {
    position: fixed;
    bottom: 0.9rem;
    left: 0.9rem;
    display: flex;
    gap: 0.4rem;
    z-index: 7;
  }
  .dock-btn {
    width: 2.1rem;
    height: 2.1rem;
    display: grid;
    place-items: center;
    font-size: 1rem;
    color: var(--dim);
    background: var(--panel);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    cursor: pointer;
    animation: dock-in 1s ease both;
    transition: color 0.15s, border-color 0.15s;
  }
  .dock-btn:hover,
  .dock-btn.open {
    color: var(--gold);
    border-color: rgba(255, 179, 92, 0.35);
  }
  .dock-btn.stardust:hover,
  .dock-btn.stardust.open {
    color: #d8d2ff;
    border-color: rgba(180, 170, 255, 0.4);
  }
  .dock-btn.ready {
    color: #d8d2ff;
    border-color: rgba(180, 170, 255, 0.55);
    box-shadow: 0 0 16px rgba(170, 150, 255, 0.35);
    animation: ready-pulse 1.8s ease-in-out infinite;
  }
  .dock-btn.deep:hover,
  .dock-btn.deep.open,
  .dock-btn.deep.ready {
    color: #bfeaff;
    border-color: rgba(140, 220, 255, 0.5);
  }
  .dock-btn.curiosity:hover,
  .dock-btn.curiosity.open {
    color: #e8d8ff;
    border-color: rgba(210, 170, 255, 0.45);
  }
  .dock-btn.vessel:hover,
  .dock-btn.vessel.open,
  .dock-btn.vessel.ready {
    color: #bfeaff;
    border-color: rgba(140, 220, 255, 0.5);
  }
  @keyframes ready-pulse {
    0%, 100% { box-shadow: 0 0 10px rgba(170, 150, 255, 0.25); }
    50% { box-shadow: 0 0 24px rgba(170, 150, 255, 0.55); }
  }
  @keyframes dock-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @media (max-width: 720px) {
    .dock {
      bottom: auto;
      top: 10rem;
      left: 0.5rem;
      right: auto;
      max-height: calc(62vh - 10.5rem);
      flex-direction: column;
      overflow-y: auto;
      padding-right: 0.2rem;
      scrollbar-width: none;
    }
  }
</style>
