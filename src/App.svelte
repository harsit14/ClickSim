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
  import GameGuide from './ui/GameGuide.svelte'
  import GoalLens from './ui/GoalLens.svelte'
  import ContextualPrompts from './ui/ContextualPrompts.svelte'
  import ResetComparisonCard from './ui/ResetComparisonCard.svelte'
  import ManifestWorldLayer from './ui/ManifestWorldLayer.svelte'
  import PurchaseCeremonyLayer from './ui/PurchaseCeremonyLayer.svelte'
  import UniverseLawPanel from './ui/UniverseLawPanel.svelte'
  import EndgameHub from './ui/EndgameHub.svelte'
  import DevPlaytestPanel from './ui/DevPlaytestPanel.svelte'
  import NumberSuffixHint from './ui/NumberSuffixHint.svelte'
  import ClockworkRevelation from './ui/ClockworkRevelation.svelte'
  import {
    game,
    hasUi,
    crossToUniverse,
    performSupernova,
    supernovaGain,
    vesselHasReadyPart,
    vesselRevealed,
    atlasRouteReady,
  } from './engine/game.svelte'
  import { clearBuffs } from './systems/buffs.svelte'
  import { combo } from './systems/combo.svelte'
  import { save } from './core/save'
  import {
    isPlaying,
    setMusicMode,
    setStems,
    startMusic,
  } from './audio/music'
  import { THEME_BY_ID, themeVarsForUniverse } from './content/themes'
  import { progressionIdentity } from './content/universe-progression'
  import { universeById, universeV2ById } from './content/universes'
  import { acquireGamePause } from './core/pause.svelte'
  import { worldRef } from './render/world-ref'
  import { clearToasts } from './systems/toasts.svelte'
  import type { EconomyAmount } from './content/universes/types'
  import { addAmounts, amountFromNumber, gteAmount, isZeroAmount } from './core/numeric/amount'
  import { format } from './core/format'
  import { resolveEffectiveVisualQuality } from './core/preferences'
  import { renderHealth } from './core/render-health.svelte'
  import { buildEmberGoalCandidates, previewSupernovaRecovery } from './experience/ember-cohesion'
  import {
    beginCrossingArrival,
    cancelCrossingArrival,
    completeCrossingArrival,
  } from './experience/crossing-arrival.svelte'
  import { formatGoalDuration, resolveUniverseUiText } from './experience/ember-ui-text'
  import { compareProgressionBoundary } from './experience/reset-comparison'
  import type { ResetComparison } from './experience/reset-comparison'
  import type { ResetCardDecision } from './experience/reset-comparison-ui'
  import type { ContextualPromptCandidate, ContextualPromptState } from './experience/contextual-prompts'
  import type { UiTextResolver } from './experience/ui-text'
  import type { FocusReturnDescriptor } from './accessibility/focus'
  import {
    CLOCKWORK_REVELATION_TRIGGER,
    clockworkRevelationAvailable,
  } from './content/universes/clockwork/revelation'

  let { offlineGain }: { offlineGain: EconomyAmount } = $props()

  let statsOpen = $state(false)
  let openingAccessOpen = $state(false)
  let optionsOpen = $state(false)
  let curiositiesOpen = $state(false)
  let vesselOpen = $state(false)
  let observatoryOpen = $state(false)
  let codexOpen = $state(false)
  let deepOpen = $state(false)
  let guideOpen = $state(false)
  let endgameOpen = $state(false)
  let cutsceneActive = $state(false)
  let questionOpen = $state(false)
  let remembering = $state(false)
  let crossingPrelude = $state(false)
  let crossingTarget = $state<string | null>(null)
  let resetPreviewOpen = $state(false)
  let resetComparison = $state<ResetComparison | null>(null)
  let clockworkRevelationActive = $state(false)
  let clockworkRevelationReplay = $state(false)
  // Guidance is opt-in. The opening should remain only the Heart and the
  // systems the player has actually unlocked until Settings enables help.
  let goalLensEnabled = $state(false)
  let pinnedGoalId = $state<string | null>(null)
  let averagedRhythm = $state(false)
  let promptState = $state<ContextualPromptState>({ enabled: false, dismissedIds: [] })
  let shopCollapsed = $state(false)
  let lumenActive = $state(false)
  let resumeMusicAfterNova = false
  const comparativeBlind = import.meta.env.DEV
    && new URLSearchParams(window.location.search).get('f2-blind') === '1'
  const playtestMode = import.meta.env.DEV
    && new URLSearchParams(window.location.search).get('playtest') === '1'
  const supernovaTimeScale = import.meta.env.DEV
    ? Math.max(0.02, Math.min(1, Number(new URLSearchParams(window.location.search).get('supernova-speed')) || 1))
    : 1

  const novaReady = $derived(!isZeroAmount(supernovaGain()))
  const observatoryVisible = $derived(
    !isZeroAmount(game.stardustTotal) || game.supernovae > 0 || novaReady || gteAmount(game.allTimeEarned, amountFromNumber(1e11)),
  )
  const deepVisible = $derived(
    !isZeroAmount(game.singTotal) || game.collapses > 0 || gteAmount(game.stardustTotal, amountFromNumber(15)) || game.challenge !== null,
  )
  const deepReady = $derived(game.challenge === null && gteAmount(game.stardustTotal, amountFromNumber(20)))
  const curiositiesVisible = $derived(game.curiosities.length > 0 || gteAmount(game.totalEarned, amountFromNumber(250_000)))
  const activePack = $derived(universeById(game.activeUniverse))
  const activeV2Pack = $derived(universeV2ById(game.activeUniverse))
  const observatoryIdentity = $derived(progressionIdentity(activePack.id).observatory)
  const epochMatterGlyph = $derived(activeV2Pack?.economy.localPrestige.rewardCurrency.glyph ?? '✧')
  const effectiveQuality = $derived(resolveEffectiveVisualQuality(game.visualQuality, {
    width: window.innerWidth,
    devicePixelRatio: window.devicePixelRatio || 1,
    hardwareConcurrency: navigator.hardwareConcurrency || 8,
  }, renderHealth.profile))
  const vesselVisible = $derived(vesselRevealed())
  const vesselReady = $derived(vesselHasReadyPart())
  const endgameVisible = $derived(game.beacons.length > 0 || game.activeAtlasRoute !== null)
  const endgameReady = $derived(game.activeAtlasRoute !== null && atlasRouteReady())
  const storyArchiveVisible = $derived(
    game.seen.length > 0
    || game.echoes.length > 0
    || game.ending !== null
    || Object.values(game.universeRuns).some((run) => run.seen.length > 0 || run.echoes.length > 0 || run.ending !== null),
  )
  const utilityPanelOpen = $derived(
    openingAccessOpen || statsOpen || optionsOpen || curiositiesOpen || vesselOpen || observatoryOpen || codexOpen || deepOpen || guideOpen || endgameOpen,
  )
  const storyModalActive = $derived(
    cutsceneActive || questionOpen || remembering || crossingPrelude || clockworkRevelationActive,
  )
  const modalActive = $derived(storyModalActive || guideOpen || resetPreviewOpen)
  const goalCandidates = $derived(buildEmberGoalCandidates(game, novaReady, Date.now()))
  const goalLensInput = $derived({
    enabled: goalLensEnabled,
    candidates: goalCandidates,
    pinnedGoalId,
  })
  const goalPresentation = $derived(
    !averagedRhythm && combo.streak >= 4 ? 'active-rhythm' as const : 'standard' as const,
  )
  const resolveActiveUiText: UiTextResolver = (key, parameters = {}) => (
    resolveUniverseUiText(game.activeUniverse, key, parameters)
  )
  const contextualPrompts = $derived([
    {
      id: 'first-kindling',
      titleKey: 'prompt.kindling.title',
      bodyKey: 'prompt.kindling.body',
      actionLabelKey: 'prompt.kindling.action',
      announcementKey: 'prompt.kindling.announcement',
      priority: 20,
      available: hasUi('shop') && Object.keys(game.owned).length === 0,
    },
    {
      id: 'first-supernova-preview',
      titleKey: 'prompt.supernova.title',
      bodyKey: 'prompt.supernova.body',
      actionLabelKey: 'prompt.supernova.action',
      announcementKey: 'prompt.supernova.announcement',
      priority: 30,
      available: novaReady,
    },
  ] satisfies readonly ContextualPromptCandidate[])
  const confirmResetFocus: FocusReturnDescriptor = {
    reason: 'boundary-completed',
    preferred: { region: 'heart', purpose: 'context' },
    fallbacks: [{ region: 'application', purpose: 'application-start' }],
    preventScroll: true,
  }
  const cancelResetFocus: FocusReturnDescriptor = {
    reason: 'flow-cancelled',
    preferred: { region: 'heart', purpose: 'context' },
    fallbacks: [{ region: 'application', purpose: 'application-start' }],
    preventScroll: true,
  }

  $effect(() => {
    if (!storyModalActive && !resetPreviewOpen) return
    return acquireGamePause('story scene')
  })

  $effect(() => {
    if (
      game.activeUniverse !== 'clockwork'
      || game.seen.includes(CLOCKWORK_REVELATION_TRIGGER.seenId)
      || !clockworkRevelationAvailable(game)
      || storyModalActive
      || resetPreviewOpen
    ) return
    closeAll()
    clockworkRevelationReplay = false
    clockworkRevelationActive = true
  })

  function closeAll() {
    openingAccessOpen = statsOpen = optionsOpen = curiositiesOpen = vesselOpen = observatoryOpen = codexOpen = deepOpen = guideOpen = endgameOpen = false
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
  function toggleOpeningAccess() {
    const next = !openingAccessOpen
    closeAll()
    openingAccessOpen = next
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
  function toggleGuide() {
    const next = !guideOpen
    closeAll()
    guideOpen = next
  }
  function toggleEndgame() {
    const next = !endgameOpen
    closeAll()
    endgameOpen = next
  }

  function onGlobalKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && utilityPanelOpen) {
      event.preventDefault()
      closeAll()
      return
    }
    if (guideOpen || storyModalActive || event.metaKey || event.ctrlKey || event.altKey) return
    const target = event.target as HTMLElement | null
    if (target?.matches('input, textarea, select, [contenteditable="true"]')) return

    const key = event.key.toLowerCase()
    let handled = true
    if (event.key === 'F1') hasUi('options') ? toggleOptions() : toggleOpeningAccess()
    else if ((key === '?' || key === 'g') && hasUi('counter')) toggleGuide()
    else if ((key === '?' || key === 'g' || key === 'o') && !hasUi('options')) toggleOpeningAccess()
    else if (key === 'i' && hasUi('stats')) toggleStats()
    else if (key === 'o' && hasUi('options')) toggleOptions()
    else if (key === 'c' && curiositiesVisible) toggleCuriosities()
    else if (key === 'v' && vesselVisible) toggleVessel()
    else if (key === 's' && observatoryVisible) toggleObservatory()
    else if (key === 'd' && deepVisible) toggleDeep()
    else if (key === 'e' && storyArchiveVisible) toggleCodex()
    else if (key === 'l' && endgameVisible) toggleEndgame()
    else if (key === 'b' && hasUi('bulk')) {
      const amounts = [1, 10, 100, 'max'] as const
      game.buyAmount = amounts[(amounts.indexOf(game.buyAmount) + 1) % amounts.length]
      save()
    } else handled = false
    if (handled) event.preventDefault()
  }

  function beginSupernova() {
    closeAll()
    const gain = supernovaGain()
    const rewardCurrency = activeV2Pack?.economy.localPrestige.rewardCurrency
    resetComparison = compareProgressionBoundary({
      boundary: 'epoch-turn',
      recovery: previewSupernovaRecovery(game, gain, Date.now()),
      reward: rewardCurrency ? {
        glyph: rewardCurrency.glyph,
        localName: rewardCurrency.localName,
        canonicalName: rewardCurrency.canonicalName,
        current: format(game.stardust),
        gain: format(gain),
        after: format(addAmounts(game.stardust, gain)),
      } : null,
    })
    resetPreviewOpen = true
  }

  function handleResetDecision(decision: ResetCardDecision) {
    resetPreviewOpen = false
    resetComparison = null
    if (decision.action === 'cancel') {
      requestAnimationFrame(() => document.querySelector<HTMLCanvasElement>('[data-focus-region="heart"]')?.focus({ preventScroll: true }))
      return
    }
    resumeMusicAfterNova = isPlaying()
    cutsceneActive = true
  }

  function handlePromptAction(promptId: string) {
    if (promptId === 'first-supernova-preview') toggleObservatory()
    else if (promptId === 'first-kindling') closeAll()
  }

  function resetForSupernova(): EconomyAmount {
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
    const source = universeById(game.activeUniverse)
    const target = universeById(universeId)
    beginCrossingArrival({
      sourceId: source.id,
      sourceName: source.shortName,
      sourceVerb: universeV2ById(source.id)?.identity.primaryVerb ?? 'kindle',
      destinationId: target.id,
      destinationName: target.shortName,
      destinationVerb: universeV2ById(target.id)?.identity.primaryVerb ?? 'kindle',
      firstArrival: game.universeRuns[universeId] === undefined,
    })
    crossingTarget = universeId
    crossingPrelude = true
  }

  function finishCrossing(universeId: string) {
    if (crossToUniverse(universeId)) {
      completeCrossingArrival(game.activeUniverse)
      clearBuffs()
      clearToasts()
      combo.streak = 0
      combo.lastRewardAt = 0
      worldRef()?.resetForUniverse()
      save()
    } else cancelCrossingArrival()
    crossingPrelude = false
    crossingTarget = null
  }

  function replayClockworkRevelation() {
    if (
      game.activeUniverse !== 'clockwork'
      || !game.seen.includes(CLOCKWORK_REVELATION_TRIGGER.seenId)
    ) return
    closeAll()
    clockworkRevelationReplay = true
    clockworkRevelationActive = true
  }

  function finishClockworkRevelation() {
    if (!game.seen.includes(CLOCKWORK_REVELATION_TRIGGER.seenId)) {
      game.seen.push(CLOCKWORK_REVELATION_TRIGGER.seenId)
      save()
    }
    const wasReplay = clockworkRevelationReplay
    clockworkRevelationActive = false
    clockworkRevelationReplay = false
    requestAnimationFrame(() => {
      const selector = wasReplay
        ? '[aria-label="Story Archive"]'
        : '[data-focus-region="heart"]'
      document.querySelector<HTMLElement>(selector)?.focus({ preventScroll: true })
    })
  }

  // vestments: apply the chosen accent theme to the document root
  $effect(() => {
    setMusicMode(activePack.audio.music)
    document.documentElement.dataset.motion = game.motionPreference
    document.documentElement.dataset.textScale = game.textScale
    document.documentElement.dataset.contrast = game.highContrast ? 'high' : 'standard'
    document.documentElement.dataset.beatVisual = game.beatVisual
    document.documentElement.dataset.visualQuality = game.visualQuality
    const theme = THEME_BY_ID.get(game.theme) ?? THEME_BY_ID.get('ember')!
    for (const [key, value] of Object.entries(activePack.palette.vars)) {
      document.documentElement.style.setProperty(key, value)
    }
    for (const [key, value] of Object.entries(themeVarsForUniverse(theme, activePack.id))) {
      document.documentElement.style.setProperty(key, value)
    }
  })

  $effect(() => {
    const governed = (!shopCollapsed && hasUi('shop')) || lumenActive || utilityPanelOpen
    if (governed) document.documentElement.dataset.attention = 'governed'
    else delete document.documentElement.dataset.attention
    return () => delete document.documentElement.dataset.attention
  })

  const anyOf = (ids: string[]) => ids.some((id) => (game.owned[id] ?? 0) > 0)
  $effect(() => {
    const ids = activePack.generators.map(({ id }) => id)
    setStems({
      mallets: anyOf(ids.slice(0, 5)),
      bass: anyOf(ids.slice(5, 9)),
      strings: anyOf(ids.slice(9, 13)),
      choir: anyOf(ids.slice(13)),
    })
  })
</script>

<svelte:window onkeydown={onGlobalKeydown} />

<div class="game-shell" class:comparative-blind={comparativeBlind} inert={modalActive} aria-hidden={modalActive}>
  <EmberCanvas {averagedRhythm} {comparativeBlind} />
  <NumberSuffixHint
    amount={game.light}
    currencyName={activePack.currency}
    suppressed={utilityPanelOpen || storyModalActive || resetPreviewOpen}
  />
  {#if activeV2Pack}
    <ManifestWorldLayer
      pack={activeV2Pack}
      owned={game.owned}
      numericLawState={game.numericLawState}
      achievementIds={game.achievements}
      archiveItems={activePack.cabinet.items}
      unlockedArchiveIds={game.curiosities}
      litBeaconUniverseIds={game.beacons}
      onarchiveopen={toggleCuriosities}
      preferences={{
        reducedMotion: game.motionPreference === 'reduced',
        quality: effectiveQuality,
        minimal: false,
        panelOpen: utilityPanelOpen || (!shopCollapsed && hasUi('shop')) || lumenActive,
      }}
    />
  {/if}
  <PurchaseCeremonyLayer />
  <section class="top-stack" class:future-law={activePack.id === 'prismata' || activePack.id === 'tempest' || activePack.id === 'canticle'} aria-label="Run status and upgrades">
    {#if activePack.id !== 'prismata' && activePack.id !== 'tempest' && activePack.id !== 'canticle'}
      <Hud />
      <BuffBar />
    {/if}
    <ChallengeBanner />
    {#if !utilityPanelOpen}
      <UniverseLawPanel />
      <UpgradeBar dense={(!shopCollapsed && hasUi('shop')) || lumenActive} />
    {/if}
  </section>
  {#if activeV2Pack && !utilityPanelOpen && (goalLensEnabled || promptState.enabled)}
    <section class="cohesion-stack" aria-label="Optional guidance">
      {#if goalLensEnabled}
        <GoalLens
          id="universe-goal-lens"
          universeId={activePack.id}
          goals={goalLensInput}
          presentationMode={goalPresentation}
          resolveText={resolveActiveUiText}
          formatDuration={formatGoalDuration}
          onpinchange={(goalId) => (pinnedGoalId = goalId)}
          ondisable={() => (goalLensEnabled = false)}
        />
      {/if}
      {#if promptState.enabled}
        <ContextualPrompts
          id="universe-contextual-prompt"
          universeId={activePack.id}
          candidates={contextualPrompts}
          state={promptState}
          resolveText={resolveActiveUiText}
          onstatechange={(state) => (promptState = state)}
          onaction={handlePromptAction}
        />
      {/if}
    </section>
  {/if}
  <ShopPanel suppressed={utilityPanelOpen} bind:collapsed={shopCollapsed} />
  <UiChips />
  <ComboMeter />
  <LumenTicker onactivitychange={(active) => (lumenActive = active)} />
  <FallingStar reserveShop={hasUi('shop') && !utilityPanelOpen} />
  <Toasts clearOfShop={hasUi('shop') && !utilityPanelOpen} />
  <WelcomeBack amount={offlineGain} />

  {#if !hasUi('options')}
    <button
      class="access-hatch"
      class:open={openingAccessOpen}
      onclick={toggleOpeningAccess}
      aria-label="Access and recovery"
      aria-keyshortcuts="F1"
    >access · F1</button>
  {/if}

  <nav class="dock" aria-label="Game sections">
    {#if hasUi('counter')}
      <button class="dock-btn guide-button" class:open={guideOpen} onclick={toggleGuide} title="The Field Guide · G" data-hint="Field Guide · G" aria-label="The Field Guide" aria-keyshortcuts="G">?</button>
    {/if}
    {#if hasUi('stats')}
      <button class="dock-btn" class:open={statsOpen} onclick={toggleStats} title="Run records · I" data-hint="Run records · I" aria-label="Run records" aria-keyshortcuts="I">▤</button>
    {/if}
    {#if hasUi('options')}
      <button class="dock-btn" class:open={optionsOpen} onclick={toggleOptions} title="Options · O" data-hint="Options · O" aria-label="Options" aria-keyshortcuts="O">⚙</button>
    {/if}
    {#if curiositiesVisible}
      <button class="dock-btn curiosity" class:open={curiositiesOpen} onclick={toggleCuriosities} title={`${activePack.cabinet.dockTitle} · C`} data-hint={`${activePack.cabinet.dockTitle} · C`} aria-label={activePack.cabinet.dockTitle} aria-keyshortcuts="C">{activePack.cabinet.dockGlyph}</button>
    {/if}
    {#if vesselVisible}
      <button class="dock-btn vessel" class:open={vesselOpen} class:ready={vesselReady} onclick={toggleVessel} title="The Vessel · V" data-hint="The Vessel · V" aria-label="The Vessel" aria-keyshortcuts="V">⌁</button>
    {/if}
    {#if observatoryVisible}
      <button class="dock-btn stardust" class:open={observatoryOpen} class:ready={novaReady} onclick={toggleObservatory} title={`${observatoryIdentity.title} · S`} data-hint={`${observatoryIdentity.title} · S`} aria-label={observatoryIdentity.title} aria-keyshortcuts="S">{epochMatterGlyph}</button>
    {/if}
    {#if deepVisible}
      <button class="dock-btn deep" class:open={deepOpen} class:ready={deepReady} onclick={toggleDeep} title="The Deep · D" data-hint="The Deep · D" aria-label="The Deep" aria-keyshortcuts="D">◉</button>
    {/if}
    {#if storyArchiveVisible}
      <button class="dock-btn" class:open={codexOpen} onclick={toggleCodex} title="Story Archive · E" data-hint="Story Archive · E" aria-label="Story Archive" aria-keyshortcuts="E">❖</button>
    {/if}
    {#if endgameVisible}
      <button class="dock-btn legacy" class:open={endgameOpen} class:ready={endgameReady} onclick={toggleEndgame} title="The Legacy of Light · L" data-hint="Legacy · L" aria-label="The Legacy of Light" aria-keyshortcuts="L">⌘</button>
    {/if}
  </nav>

  {#if statsOpen}
    <StatsPanel onclose={() => (statsOpen = false)} />
  {/if}
  {#if optionsOpen}
    <OptionsPanel
      onclose={() => (optionsOpen = false)}
      {averagedRhythm}
      {goalLensEnabled}
      promptsEnabled={promptState.enabled}
      onaveragedrhythmchange={(enabled) => (averagedRhythm = enabled)}
      ongoallenschange={(enabled) => (goalLensEnabled = enabled)}
      onpromptschange={(enabled) => (promptState = { ...promptState, enabled })}
    />
  {/if}
  {#if openingAccessOpen}
    <OptionsPanel accessOnly onclose={() => (openingAccessOpen = false)} />
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
      onreplayclockwork={replayClockworkRevelation}
    />
  {/if}
  {#if deepOpen}
    <TheDeep onclose={() => (deepOpen = false)} />
  {/if}
  {#if endgameOpen}
    <EndgameHub onclose={() => (endgameOpen = false)} />
  {/if}
  <QuestionChip onopen={() => { closeAll(); questionOpen = true }} />
</div>
{#if resetPreviewOpen && resetComparison}
  <ResetComparisonCard
    id="supernova-reset-preview"
    universeId={activePack.id}
    comparison={resetComparison}
    confirmFocusReturn={confirmResetFocus}
    cancelFocusReturn={cancelResetFocus}
    resolveText={resolveActiveUiText}
    formatDuration={formatGoalDuration}
    ondecision={handleResetDecision}
  />
{/if}
{#if guideOpen}
  <GameGuide onclose={() => (guideOpen = false)} />
{/if}
{#if cutsceneActive}
  <SupernovaCutscene doReset={resetForSupernova} onfinished={afterSupernova} timeScale={supernovaTimeScale} />
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
{#if clockworkRevelationActive}
  <ClockworkRevelation
    replay={clockworkRevelationReplay}
    onfinished={finishClockworkRevelation}
  />
{/if}
{#if playtestMode}
  <DevPlaytestPanel />
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
  .top-stack.future-law {
    width: min(44rem, calc(100vw - 18rem));
    gap: 0.28rem;
  }
  .cohesion-stack {
    position: fixed;
    top: clamp(7.2rem, 17vh, 9.2rem);
    left: 1rem;
    width: min(22rem, calc(100vw - 20rem));
    display: grid;
    gap: 0.5rem;
    transform: none;
    pointer-events: auto;
    z-index: 5;
  }
  .dock {
    position: fixed;
    bottom: 0.9rem;
    left: 0.9rem;
    display: flex;
    gap: 0.4rem;
    z-index: 7;
  }
  .access-hatch {
    position: fixed;
    top: 0.75rem;
    left: 0.75rem;
    min-width: 4.8rem;
    min-height: 1.5rem;
    padding: 0.28rem 0.55rem;
    color: color-mix(in srgb, var(--dim) 86%, white);
    background: color-mix(in srgb, var(--panel) 82%, transparent);
    border: 1px solid color-mix(in srgb, var(--gold) 18%, transparent);
    border-radius: 999px;
    font: 650 0.6875rem/1 system-ui, sans-serif;
    letter-spacing: 0.04em;
    cursor: pointer;
    z-index: 7;
  }
  .access-hatch:hover,
  .access-hatch:focus-visible,
  .access-hatch.open {
    color: var(--gold);
    border-color: color-mix(in srgb, var(--gold) 48%, transparent);
    outline: 2px solid transparent;
  }
  .dock-btn {
    position: relative;
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
  .dock-btn::after {
    content: attr(data-hint);
    position: absolute;
    left: 0;
    bottom: calc(100% + 0.55rem);
    width: max-content;
    max-width: 14rem;
    padding: 0.34rem 0.52rem;
    color: color-mix(in srgb, var(--gold) 82%, white);
    background: color-mix(in srgb, var(--panel) 94%, #03050b);
    border: 1px solid color-mix(in srgb, var(--gold) 28%, transparent);
    border-radius: 0.35rem 0.7rem 0.7rem 0.35rem;
    box-shadow: 0 0.65rem 1.8rem rgba(0, 0, 0, 0.34), inset 2px 0 color-mix(in srgb, var(--amber) 62%, transparent);
    opacity: 0;
    transform: translateY(0.3rem);
    transition: opacity 120ms ease, transform 120ms ease;
    pointer-events: none;
    white-space: nowrap;
    font-size: 0.65rem;
    font-weight: 650;
    letter-spacing: 0.03em;
  }
  .dock-btn:hover::after,
  .dock-btn:focus-visible::after {
    opacity: 1;
    transform: translateY(0);
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
  @media (max-width: 800px) {
    .top-stack.future-law { width: calc(100vw - 1rem); }
    .cohesion-stack {
      top: 21.5rem;
      left: 4rem;
      right: 0.5rem;
      width: auto;
      max-height: 11vh;
      overflow-y: auto;
      transform: none;
    }
    .dock {
      bottom: auto;
      top: 11.5rem;
      left: 0.5rem;
      right: auto;
      max-height: calc(62vh - 10.5rem);
      flex-direction: column;
      overflow-y: auto;
      padding-right: 0.2rem;
      scrollbar-width: none;
    }
  }
  :global(html[data-lumen-history='open']) .cohesion-stack { opacity: 0; pointer-events: none; }
  @media (max-width: 650px) {
    .top-stack,
    .top-stack.future-law { width: calc(100vw - 1rem); }
    .cohesion-stack { right: 0.45rem; max-height: 11vh; }
  }
  @media (max-width: 380px) {
    .top-stack { top: 0.4rem; gap: 0.35rem; }
    .cohesion-stack { left: 3.2rem; right: 0.4rem; top: 21.25rem; }
    .dock { left: 0.35rem; top: 11.25rem; }
  }
  .game-shell.comparative-blind > :global(.keyboard-focus),
  .game-shell.comparative-blind > :global(.feedback-layer),
  .game-shell.comparative-blind > :global(.sr-live),
  .game-shell.comparative-blind > :global(.top-stack),
  .game-shell.comparative-blind > :global(.cohesion-stack),
  .game-shell.comparative-blind > :global(.shop),
  .game-shell.comparative-blind > :global(.lumen),
  .game-shell.comparative-blind > :global(.falling-star),
  .game-shell.comparative-blind > :global(.dock),
  .game-shell.comparative-blind :global(.manifest-world figcaption),
  .game-shell.comparative-blind :global(.world-state-indicator) {
    display: none !important;
  }
</style>
