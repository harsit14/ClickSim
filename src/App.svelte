<script lang="ts">
  import { tick, untrack } from 'svelte'
  import EmberCanvas from './ui/EmberCanvas.svelte'
  import Hud from './ui/Hud.svelte'
  import ShopPanel from './ui/ShopPanel.svelte'
  import UpgradeBar from './ui/UpgradeBar.svelte'
  import UiChips from './ui/UiChips.svelte'
  import StatsPanel from './ui/StatsPanel.svelte'
  import OptionsPanel from './ui/OptionsPanel.svelte'
  import CuriosityCabinet from './ui/CuriosityCabinet.svelte'
  import MementoGallery from './ui/MementoGallery.svelte'
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
  import IdleSteward from './ui/IdleSteward.svelte'
  import ChallengeBanner from './ui/ChallengeBanner.svelte'
  import QuestionChip from './ui/QuestionChip.svelte'
  import TheQuestion from './ui/TheQuestion.svelte'
  import RemembranceOverlay from './ui/RemembranceOverlay.svelte'
  import CrossingPrelude from './ui/CrossingPrelude.svelte'
  import GameGuide from './ui/GameGuide.svelte'
  import GoalLens from './ui/GoalLens.svelte'
  import FirstEpochLens from './ui/FirstEpochLens.svelte'
  import FirstEpochHandoff from './ui/FirstEpochHandoff.svelte'
  import ContextualPrompts from './ui/ContextualPrompts.svelte'
  import ResetComparisonCard from './ui/ResetComparisonCard.svelte'
  import ManifestWorldLayer from './ui/ManifestWorldLayer.svelte'
  import PurchaseCeremonyLayer from './ui/PurchaseCeremonyLayer.svelte'
  import UniverseLawPanel from './ui/UniverseLawPanel.svelte'
  import EndgameHub from './ui/EndgameHub.svelte'
  import DevPlaytestPanel from './ui/DevPlaytestPanel.svelte'
  import NumberSuffixHint from './ui/NumberSuffixHint.svelte'
  import ClockworkRevelation from './ui/ClockworkRevelation.svelte'
  import DeepCollapseCeremony from './ui/DeepCollapseCeremony.svelte'
  import {
    game,
    hasUi,
    crossToUniverse,
    performSupernova,
    supernovaGain,
    stardustTargetFor,
    vesselHasReadyPart,
    vesselRevealed,
    universeVisited,
    atlasRouteReady,
    deepCollapseGain,
    performDeepCollapse,
    skipLokaShelfSetPiece,
  } from './engine/game.svelte'
  import { clearBuffs } from './systems/buffs.svelte'
  import { combo } from './systems/combo.svelte'
  import { save } from './core/save'
  import {
    isPlaying,
    setMusicMode,
    setMusicOwnershipDensity,
    setMusicStillness,
    setStems,
    startMusic,
  } from './audio/music'
  import { setAudioSpace } from './audio/sfx'
  import { THEME_BY_ID, themeVarsForUniverse } from './content/themes'
  import { constellationNodeCopy, progressionIdentity } from './content/universe-progression'
  import { CONSTELLATION } from './content/constellation'
  import { FIRST_EPOCH_HANDOFF_SEEN_ID } from './content/experience-markers'
  import { universeById, universeV2ById } from './content/universes'
  import { kailashLongRestStatus } from './content/universes/f4-runtime'
  import { acquireGamePause } from './core/pause.svelte'
  import { worldRef } from './render/world-ref'
  import { clearToasts, setToastPreferences } from './systems/toasts.svelte'
  import { resetSessionFeedback } from './feedback/reset-session'
  import type { EconomyAmount } from './content/universes/types'
  import type { OfflineReturnSummary } from './core/offline-pacing'
  import { ONE_AMOUNT, ZERO_AMOUNT, addAmounts, amountFromNumber, gteAmount, isZeroAmount } from './core/numeric/amount'
  import { format } from './core/format'
  import { resolveEffectiveVisualQuality } from './core/preferences'
  import { renderHealth } from './core/render-health.svelte'
  import { totalRate } from './engine/compute'
  import { buildEmberGoalCandidates, previewSupernovaRecovery } from './experience/ember-cohesion'
  import {
    fiveMinuteRateDirection,
    recordRateSample,
    type FiveMinuteRateDirection,
    type RateSample,
  } from './experience/rate-trend'
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
  import { buildFirstEpochCeremony } from './experience/first-epoch'
  import { idleManagerRealmStatus } from './experience/idle-manager'
  import { welcomeBackEligible } from './ui/welcome-back-model'
  import {
    CLOCKWORK_REVELATION_TRIGGER,
    clockworkRevelationAvailable,
  } from './content/universes/clockwork/revelation'
  import { createShellState } from './app/shell-state.svelte'

  let { offlineReturn }: { offlineReturn: OfflineReturnSummary } = $props()

  const MOBILE_BREAKPOINT = 800
  const shell = createShellState(window.innerWidth, MOBILE_BREAKPOINT)
  const resumesFirstEpochHandoff = game.activeUniverse === 'emberlight'
    && game.remembrances === 0
    && game.supernovae === 1
    && game.constellation.length === 0
    && !game.seen.includes(FIRST_EPOCH_HANDOFF_SEEN_ID)

  let cutsceneActive = $state(false)
  let questionOpen = $state(false)
  let remembering = $state(false)
  let crossingPrelude = $state(false)
  let crossingTarget = $state<string | null>(null)
  let resetPreviewOpen = $state(false)
  let resetComparison = $state<ResetComparison | null>(null)
  let clockworkRevelationActive = $state(false)
  let clockworkRevelationReplay = $state(false)
  let deepCollapseActive = $state(false)
  let firstEpochComparisonSeen = $state(false)
  let firstEpochHandoffOpen = $state(resumesFirstEpochHandoff)
  let firstEpochReward = $state<EconomyAmount>(resumesFirstEpochHandoff ? game.stardust : ZERO_AMOUNT)
  let observatoryInitialNodeId = $state<string | null>(null)
  let universeInstrumentActive = $state(false)
  let transientResetToken = $state(0)
  let offlineGainDismissed = $state(false)
  // Guidance is opt-in. The opening should remain only the Heart and the
  // systems the player has actually unlocked until Settings enables help.
  let goalLensEnabled = $state(false)
  let pinnedGoalId = $state<string | null>(null)
  let goalRateSamples = $state<readonly RateSample[]>([])
  let goalCurrentRate = $state<EconomyAmount>(ZERO_AMOUNT)
  let goalRateDirection = $state<FiveMinuteRateDirection>('measuring')
  let averagedRhythm = $state(false)
  let promptState = $state<ContextualPromptState>({ enabled: false, dismissedIds: [] })
  let lumenActive = $state(false)
  let photoMode = $state(false)
  let photoMessage = $state('')
  let resumeMusicAfterNova = false
  const comparativeBlind = import.meta.env.DEV
    && new URLSearchParams(window.location.search).get('f2-blind') === '1'
  const playtestMode = import.meta.env.DEV
    && new URLSearchParams(window.location.search).get('playtest') === '1'
  const supernovaTimeScale = import.meta.env.DEV
    ? Math.max(0.02, Math.min(1, Number(new URLSearchParams(window.location.search).get('supernova-speed')) || 1))
    : 1
  const deepCollapseTimeScale = import.meta.env.DEV
    ? Math.max(0.02, Math.min(1, Number(new URLSearchParams(window.location.search).get('deep-speed')) || 1))
    : 1

  const novaReady = $derived(!isZeroAmount(supernovaGain()))
  const firstEpochTarget = $derived(stardustTargetFor(ONE_AMOUNT))
  const firstEpochCeremony = $derived(buildFirstEpochCeremony({
    universeId: game.activeUniverse,
    remembrances: game.remembrances,
    epochTurns: game.supernovae,
    currentEraEarnings: game.eraEarned,
    firstEpochTarget,
    epochReady: novaReady,
    comparisonSeen: firstEpochComparisonSeen,
  }))
  const observatoryVisible = $derived(
    !isZeroAmount(game.stardustTotal) || game.supernovae > 0 || novaReady || gteAmount(game.allTimeEarned, amountFromNumber(1e11)),
  )
  const deepReady = $derived(!isZeroAmount(deepCollapseGain()))
  const deepVisible = $derived(
    !isZeroAmount(game.singTotal) || game.collapses > 0 || deepReady || game.challenge !== null,
  )
  const stewardVisible = $derived(game.singUpgrades.includes('auto-kindler'))
  const idleManagerStatus = $derived(idleManagerRealmStatus(
    game.activeUniverse,
    game.numericLawState,
    game.owned,
    game.curiosities.length,
  ))
  const curiositiesVisible = $derived(game.curiosities.length > 0 || gteAmount(game.totalEarned, amountFromNumber(250_000)))
  const mementosVisible = $derived(game.mementos.length > 0)
  const activePack = $derived(universeById(game.activeUniverse))
  const activeV2Pack = $derived(universeV2ById(game.activeUniverse))
  const observatoryIdentity = $derived(progressionIdentity(activePack.id).observatory)
  const firstEpochRecommendation = $derived(constellationNodeCopy(CONSTELLATION[0], activePack.id))
  const epochMatterGlyph = $derived(activeV2Pack?.economy.localPrestige.rewardCurrency.glyph ?? '✧')
  const observatoryDockGlyph = $derived(activePack.id === 'brahmalok' ? '✤' : epochMatterGlyph)
  const effectiveQuality = $derived(resolveEffectiveVisualQuality(game.visualQuality, {
    width: window.innerWidth,
    devicePixelRatio: window.devicePixelRatio || 1,
    hardwareConcurrency: navigator.hardwareConcurrency || 8,
  }, renderHealth.profile))
  const vesselVisible = $derived(vesselRevealed())
  const vesselReady = $derived(vesselHasReadyPart())
  const endgameVisible = $derived(game.beacons.length > 0 || game.activeAtlasRoute !== null)
  const endgameReady = $derived(game.activeAtlasRoute !== null && atlasRouteReady())
  // Any dock section awaiting attention, surfaced on the mobile "More" button.
  const anySectionReady = $derived(
    (observatoryVisible && novaReady)
    || (deepVisible && deepReady)
    || (stewardVisible && idleManagerStatus.attentionCount > 0)
    || (vesselVisible && vesselReady)
    || (endgameVisible && endgameReady),
  )
  const storyArchiveVisible = $derived(
    game.seen.length > 0
    || game.echoes.length > 0
    || game.ending !== null
    || Object.values(game.universeRuns).some((run) => run.seen.length > 0 || run.echoes.length > 0 || run.ending !== null),
  )
  const utilityPanelOpen = $derived(shell.utilityPanelOpen)
  const storyModalActive = $derived(
    cutsceneActive || deepCollapseActive || questionOpen || remembering || crossingPrelude || clockworkRevelationActive,
  )
  const visibleOfflineReturn = $derived(offlineGainDismissed
    ? { ...offlineReturn, gain: ZERO_AMOUNT }
    : offlineReturn)
  const offlineReturnOpen = $derived(welcomeBackEligible(visibleOfflineReturn.gain))
  const modalActive = $derived(storyModalActive || firstEpochHandoffOpen || offlineReturnOpen || shell.panels.guide || resetPreviewOpen || shell.panels.curiosities || shell.panels.mementos || shell.panels.endgame)
  const transientGoverned = $derived(universeInstrumentActive || utilityPanelOpen || storyModalActive || resetPreviewOpen || lumenActive)
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
      available: novaReady && !firstEpochCeremony.visible,
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
    if (!storyModalActive && !resetPreviewOpen && !firstEpochHandoffOpen && !offlineReturnOpen) return
    return acquireGamePause('story scene')
  })

  $effect(() => {
    if (!photoMode) return
    document.documentElement.dataset.photoMode = 'true'
    worldRef()?.setPhotoPaused(true)
    const releasePause = acquireGamePause('photo mode')
    return () => {
      releasePause()
      worldRef()?.setPhotoPaused(false)
      delete document.documentElement.dataset.photoMode
    }
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
    shell.closeUtilityPanels()
  }

  async function enterPhotoMode() {
    closeAll()
    photoMessage = ''
    photoMode = true
    await tick()
    document.querySelector<HTMLElement>('.photo-controls button')?.focus({ preventScroll: true })
  }

  function exitPhotoMode() {
    photoMode = false
    photoMessage = ''
    requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-label="Options"]')?.focus({ preventScroll: true }))
  }

  async function exportSkyPhoto() {
    const blob = await worldRef()?.exportPng()
    if (!blob) {
      photoMessage = 'The sky could not be prepared on this device.'
      return
    }
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `ember-${game.activeUniverse}-sky.png`
    anchor.click()
    URL.revokeObjectURL(url)
    photoMessage = 'Sky image prepared.'
  }
  async function toggleSections() {
    const next = !shell.sectionsOpen
    closeAll()
    shell.sectionsOpen = next
    if (next) {
      // Wait for the DOM to flush so the sheet is no longer inert before focus.
      await tick()
      document.querySelector<HTMLElement>('#dock-sections .dock-btn')?.focus({ preventScroll: true })
    }
  }
  function closeSections() {
    shell.sectionsOpen = false
    requestAnimationFrame(() => {
      document.getElementById('mobile-more-button')?.focus({ preventScroll: true })
    })
  }
  function focusMobileKindlingButton() {
    if (!shell.mobileLayout) return
    requestAnimationFrame(() => {
      document.getElementById('mobile-kindling-button')?.focus({ preventScroll: true })
    })
  }
  function toggleShop() {
    const nextCollapsed = !shell.shopCollapsed
    closeAll()
    shell.shopCollapsed = nextCollapsed
    if (!nextCollapsed) {
      requestAnimationFrame(() => {
        document.querySelector<HTMLElement>('#kindling-shop .retract')?.focus({ preventScroll: true })
      })
    }
  }
  function handleViewportResize() {
    shell.resize(window.innerWidth, MOBILE_BREAKPOINT)
  }
  function toggleStats() {
    const next = !shell.panels.stats
    closeAll()
    shell.panels.stats = next
  }
  function toggleOptions() {
    const next = !shell.panels.options
    closeAll()
    shell.panels.options = next
  }
  function toggleOpeningAccess() {
    const next = !shell.panels.openingAccess
    closeAll()
    shell.panels.openingAccess = next
  }
  function toggleCuriosities() {
    const next = !shell.panels.curiosities
    if (next) shell.modalReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    closeAll()
    shell.panels.curiosities = next
  }
  function toggleMementos() {
    const next = !shell.panels.mementos
    if (next) shell.modalReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    closeAll()
    shell.panels.mementos = next
  }
  function toggleVessel() {
    const next = !shell.panels.vessel
    closeAll()
    shell.panels.vessel = next
  }
  function toggleObservatory() {
    const next = !shell.panels.observatory
    closeAll()
    if (next) observatoryInitialNodeId = null
    shell.panels.observatory = next
  }
  function toggleCodex() {
    const next = !shell.panels.codex
    closeAll()
    shell.panels.codex = next
  }
  function toggleDeep() {
    const next = !shell.panels.deep
    closeAll()
    shell.panels.deep = next
  }
  function toggleSteward() {
    const next = !shell.panels.steward
    closeAll()
    shell.panels.steward = next
  }
  function reviewRealmManager() {
    shell.panels.steward = false
    requestAnimationFrame(() => {
      document.querySelector<HTMLElement>('[aria-label="Configure universe instrument"], [aria-label="Collapse universe instrument"], [aria-label="Open universe instrument"]')?.focus({ preventScroll: true })
    })
  }
  function toggleGuide() {
    const next = !shell.panels.guide
    closeAll()
    shell.panels.guide = next
  }
  function toggleEndgame() {
    const next = !shell.panels.endgame
    if (next) shell.modalReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    closeAll()
    shell.panels.endgame = next
  }

  function closeModalPanel(panel: 'curiosities' | 'mementos' | 'endgame') {
    if (panel === 'curiosities') shell.panels.curiosities = false
    else if (panel === 'mementos') shell.panels.mementos = false
    else shell.panels.endgame = false
    const target = shell.modalReturnFocus
    shell.modalReturnFocus = null
    requestAnimationFrame(() => target?.focus({ preventScroll: true }))
  }

  function quietSessionFeedback() {
    resetSessionFeedback()
    lumenActive = false
    universeInstrumentActive = false
    transientResetToken += 1
  }

  function clearAllTransientUi() {
    quietSessionFeedback()
    offlineGainDismissed = true
    firstEpochComparisonSeen = false
    firstEpochHandoffOpen = false
    firstEpochReward = ZERO_AMOUNT
    observatoryInitialNodeId = null
    worldRef()?.resetForUniverse()
  }

  function trapSectionsFocus(event: KeyboardEvent) {
    if (event.key !== 'Tab' || !shell.sectionsOpen) return
    const container = document.getElementById('dock-sections')
    if (!container) return
    const focusable = Array.from(container.querySelectorAll<HTMLElement>('button:not([disabled])'))
      .filter((element) => element.offsetParent !== null)
    const first = focusable[0]
    const last = focusable.at(-1)
    if (!first || !last) return
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  function onGlobalKeydown(event: KeyboardEvent) {
    if (photoMode && event.key === 'Escape') {
      event.preventDefault()
      exitPhotoMode()
      return
    }
    if (event.key === 'Escape' && shell.sectionsOpen) {
      event.preventDefault()
      closeSections()
      return
    }
    if (shell.sectionsOpen && event.key === 'Tab') {
      trapSectionsFocus(event)
      return
    }
    if (event.key === 'Escape' && shell.mobileLayout && !shell.shopCollapsed && hasUi('shop')) {
      event.preventDefault()
      shell.shopCollapsed = true
      focusMobileKindlingButton()
      return
    }
    if (event.key === 'Escape' && utilityPanelOpen) {
      event.preventDefault()
      closeAll()
      return
    }
    if (shell.panels.guide || storyModalActive || event.metaKey || event.ctrlKey || event.altKey) return
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
    else if (key === 'm' && mementosVisible) toggleMementos()
    else if (key === 'v' && vesselVisible) toggleVessel()
    else if (key === 's' && observatoryVisible) toggleObservatory()
    else if (key === 'd' && deepVisible) toggleDeep()
    else if (key === 'a' && stewardVisible) toggleSteward()
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
    if (firstEpochCeremony.visible) firstEpochComparisonSeen = true
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

  function beginDeepCollapse() {
    closeAll()
    const gain = deepCollapseGain()
    resetComparison = compareProgressionBoundary({
      boundary: 'deep-collapse',
      reward: {
        glyph: '◉',
        localName: 'Singularities',
        canonicalName: 'Deep currency',
        current: format(game.singularities),
        gain: format(gain),
        after: format(addAmounts(game.singularities, gain)),
      },
    })
    resetPreviewOpen = true
  }

  function remembranceStrength(count: number): string {
    return count < 31 ? (2 ** count).toLocaleString() : `2^${count}`
  }

  function beginRemembranceReview() {
    closeAll()
    resetComparison = compareProgressionBoundary({
      boundary: 'remembrance',
      reward: {
        glyph: '×',
        localName: 'Remembrance strength',
        canonicalName: 'All production',
        current: remembranceStrength(game.remembrances),
        gain: '2',
        after: remembranceStrength(game.remembrances + 1),
      },
    })
    resetPreviewOpen = true
  }

  function handleResetDecision(decision: ResetCardDecision) {
    resetPreviewOpen = false
    resetComparison = null
    if (decision.action === 'cancel') {
      const selector = decision.boundary === 'deep-collapse'
        ? '[aria-label="The Deep"]'
        : decision.boundary === 'remembrance'
          ? '[aria-label="Story Archive"]'
          : '[data-focus-region="heart"]'
      requestAnimationFrame(() => document.querySelector<HTMLElement>(selector)?.focus({ preventScroll: true }))
      return
    }
    if (decision.boundary === 'deep-collapse') {
      quietSessionFeedback()
      deepCollapseActive = true
    } else if (decision.boundary === 'remembrance') {
      quietSessionFeedback()
      remembering = true
    } else {
      resumeMusicAfterNova = isPlaying()
      cutsceneActive = true
    }
  }

  function handlePromptAction(promptId: string) {
    if (promptId === 'first-supernova-preview') toggleObservatory()
    else if (promptId === 'first-kindling') closeAll()
  }

  function advanceFirstEpochCeremony() {
    if (firstEpochCeremony.stage === 'collapse') {
      beginSupernova()
      return
    }
    closeAll()
    observatoryInitialNodeId = null
    shell.panels.observatory = true
  }

  function resetForSupernova(): EconomyAmount {
    const completingFirstEpoch = game.activeUniverse === 'emberlight'
      && game.remembrances === 0
      && game.supernovae === 0
    const gain = performSupernova()
    if (completingFirstEpoch && !isZeroAmount(gain)) firstEpochReward = gain
    clearBuffs()
    combo.streak = 0
    combo.lastRewardAt = 0
    save()
    return gain
  }

  function afterSupernova() {
    cutsceneActive = false
    firstEpochHandoffOpen = game.activeUniverse === 'emberlight'
      && game.remembrances === 0
      && game.supernovae === 1
      && !isZeroAmount(firstEpochReward)
    if (resumeMusicAfterNova && hasUi('music')) startMusic()
    resumeMusicAfterNova = false
  }

  function finishFirstEpochHandoff(openConstellation: boolean) {
    firstEpochHandoffOpen = false
    firstEpochReward = ZERO_AMOUNT
    if (!game.seen.includes(FIRST_EPOCH_HANDOFF_SEEN_ID)) {
      game.seen.push(FIRST_EPOCH_HANDOFF_SEEN_ID)
      save()
    }
    if (openConstellation) {
      closeAll()
      observatoryInitialNodeId = 'forge-1'
      shell.panels.observatory = true
      return
    }
    requestAnimationFrame(() => document.querySelector<HTMLElement>('[data-focus-region="heart"]')?.focus({ preventScroll: true }))
  }

  function resetForDeepCollapse(): EconomyAmount {
    const gain = performDeepCollapse()
    save()
    return gain
  }

  function afterDeepCollapse() {
    deepCollapseActive = false
    requestAnimationFrame(() => document.querySelector<HTMLElement>('[data-focus-region="heart"]')?.focus({ preventScroll: true }))
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
      firstArrival: !universeVisited(universeId),
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
    setMusicStillness(
      activePack.id === 'kailash'
      && kailashLongRestStatus(game.numericLawState).resting,
    )
    document.documentElement.dataset.motion = game.motionPreference
    document.documentElement.dataset.textScale = game.textScale
    document.documentElement.dataset.contrast = game.highContrast ? 'high' : 'standard'
    document.documentElement.dataset.beatVisual = game.beatVisual
    document.documentElement.dataset.visualQuality = game.visualQuality
    document.documentElement.dataset.worldScenery = game.showWorldScenery ? 'shown' : 'hidden'
    document.documentElement.dataset.interactionEffects = game.showInteractionEffects ? 'shown' : 'hidden'
    const theme = THEME_BY_ID.get(game.theme) ?? THEME_BY_ID.get('ember')!
    for (const [key, value] of Object.entries(activePack.palette.vars)) {
      document.documentElement.style.setProperty(key, value)
    }
    for (const [key, value] of Object.entries(themeVarsForUniverse(theme, activePack.id))) {
      document.documentElement.style.setProperty(key, value)
    }
  })

  $effect(() => {
    setToastPreferences({
      achievementPopups: game.showAchievementPopups,
      routineToasts: game.showRoutineToasts,
    })
  })

  $effect(() => {
    setAudioSpace(
      shell.panels.deep
        ? 'deep'
        : shell.panels.codex || shell.panels.curiosities || shell.panels.mementos
          ? 'archive'
          : 'world',
    )
  })

  $effect(() => {
    const governed = (!shell.shopCollapsed && hasUi('shop')) || transientGoverned
    if (governed) document.documentElement.dataset.attention = 'governed'
    else delete document.documentElement.dataset.attention
    return () => delete document.documentElement.dataset.attention
  })

  $effect(() => {
    const sample = () => untrack(() => {
      const now = Date.now()
      const current = totalRate(game, now)
      goalRateSamples = recordRateSample(goalRateSamples, {
        universeId: game.activeUniverse,
        capturedAtMs: now,
        rate: current,
      })
      goalCurrentRate = current
      goalRateDirection = fiveMinuteRateDirection(
        goalRateSamples,
        game.activeUniverse,
        now,
        current,
      )
    })
    sample()
    const timer = window.setInterval(sample, 15_000)
    return () => window.clearInterval(timer)
  })

  const anyOf = (ids: string[]) => ids.some((id) => (game.owned[id] ?? 0) > 0)
  $effect(() => {
    const ids = activePack.generators.map(({ id }) => id)
    setMusicOwnershipDensity(ids.filter((id) => (game.owned[id] ?? 0) > 0).length, ids.length)
    setStems({
      mallets: anyOf(ids.slice(0, 5)),
      bass: anyOf(ids.slice(5, 9)),
      strings: anyOf(ids.slice(9, 13)),
      choir: anyOf(ids.slice(13)),
    })
  })
</script>

<svelte:window onkeydown={onGlobalKeydown} onresize={handleViewportResize} />

<div
  class="game-shell"
  class:comparative-blind={comparativeBlind}
  class:shop-collapsed={shell.shopCollapsed}
  class:shop-absent={!hasUi('shop')}
  class:sections-open={shell.sectionsOpen}
  class:lumen-active={lumenActive}
  class:photo-mode={photoMode}
  inert={modalActive || photoMode}
  aria-hidden={modalActive || photoMode}
>
  <EmberCanvas {averagedRhythm} {comparativeBlind} />
  {#if activeV2Pack && game.showWorldScenery}
    <ManifestWorldLayer
      pack={activeV2Pack}
      owned={game.owned}
      numericLawState={game.numericLawState}
      lokaProgress={game.lokaProgress}
      releaseCount={game.supernovae}
      achievementIds={game.achievements}
      archiveItems={activePack.cabinet.items}
      unlockedArchiveIds={game.curiosities}
      litBeaconUniverseIds={game.beacons}
      onarchiveopen={toggleCuriosities}
      onshelfskip={(key) => { if (skipLokaShelfSetPiece(key)) save() }}
      preferences={{
        reducedMotion: game.motionPreference === 'reduced',
        quality: effectiveQuality,
        minimal: false,
        panelOpen: utilityPanelOpen || (!shell.shopCollapsed && hasUi('shop')) || lumenActive,
      }}
    />
  {/if}
  {#if game.showInteractionEffects}<PurchaseCeremonyLayer />{/if}
  <section class="top-stack" class:future-law={activePack.id === 'brahmalok' || activePack.id === 'vishnulok' || activePack.id === 'kailash'} aria-label="Run status and upgrades">
    {#if activePack.id !== 'brahmalok' && activePack.id !== 'vishnulok' && activePack.id !== 'kailash'}
      <Hud />
      <BuffBar integrated maxVisible={2} />
    {/if}
    <ChallengeBanner />
    {#if !utilityPanelOpen}
      <UniverseLawPanel onactivitychange={(active) => (universeInstrumentActive = active)} />
      <UpgradeBar dense={(!shell.shopCollapsed && hasUi('shop')) || lumenActive} />
    {/if}
  </section>
  {#if activeV2Pack && !utilityPanelOpen && (goalLensEnabled || promptState.enabled || firstEpochCeremony.visible)}
    <section class="cohesion-stack" class:first-epoch={firstEpochCeremony.visible} aria-label={firstEpochCeremony.visible ? 'First Epoch guidance' : 'Optional guidance'}>
      {#if firstEpochCeremony.visible}
        <FirstEpochLens
          model={firstEpochCeremony}
          current={format(game.eraEarned)}
          target={format(firstEpochTarget)}
          onaction={advanceFirstEpochCeremony}
        />
      {/if}
      {#if goalLensEnabled}
        <GoalLens
          id="universe-goal-lens"
          universeId={activePack.id}
          goals={goalLensInput}
          presentationMode={goalPresentation}
          resolveText={resolveActiveUiText}
          formatDuration={formatGoalDuration}
          currentRate={format(goalCurrentRate)}
          rateDirection={goalRateDirection}
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
  <ShopPanel
    suppressed={utilityPanelOpen}
    bind:collapsed={shell.shopCollapsed}
    mobile={shell.mobileLayout}
    onmobileclose={focusMobileKindlingButton}
  />
  <UiChips />
  <ComboMeter {averagedRhythm} />
  <LumenTicker resetToken={transientResetToken} onactivitychange={(active) => (lumenActive = active)} />
  <FallingStar resetToken={transientResetToken} reserveShop={hasUi('shop') && !utilityPanelOpen && !shell.shopCollapsed} />
  <aside class="notification-lane" aria-label="Notifications">
    <NumberSuffixHint
      amount={game.light}
      currencyName={activePack.currency}
      suppressed={utilityPanelOpen || storyModalActive || resetPreviewOpen || universeInstrumentActive}
    />
    <Toasts governed={transientGoverned} clearOfShop={hasUi('shop') && !utilityPanelOpen && !shell.shopCollapsed} />
  </aside>
  {#if !hasUi('options')}
    <button
      class="access-hatch"
      class:open={shell.panels.openingAccess}
      onclick={toggleOpeningAccess}
      aria-label="Access and recovery"
      aria-keyshortcuts="F1"
      title="Access and recovery settings · F1"
    ><span aria-hidden="true">⚙</span><span class="access-label">access &amp; recovery</span><kbd>F1</kbd></button>
  {/if}

  {#if shell.sectionsOpen}
    <button class="sections-scrim" type="button" onclick={closeSections} aria-hidden="true" tabindex="-1"></button>
  {/if}
  <nav class="dock" class:sections-open={shell.sectionsOpen} aria-label="Game sections">
    {#if hasUi('shop')}
      <button
        id="mobile-kindling-button"
        class="dock-btn mobile-kindling"
        class:open={!shell.shopCollapsed}
        onclick={toggleShop}
        title="Kindling shop"
        aria-label="Kindling shop"
        aria-controls="kindling-shop"
        aria-expanded={!shell.shopCollapsed}
      ><span aria-hidden="true">✦</span><small>Kindling</small></button>
    {/if}
    <div
      id="dock-sections"
      class="dock-sections"
      role={shell.sectionsOpen ? 'dialog' : undefined}
      aria-modal={shell.sectionsOpen ? 'true' : undefined}
      aria-label="Game sections"
      inert={shell.mobileLayout && !shell.sectionsOpen}
    >
      <div class="sections-head">
        <span>Sections</span>
        <button class="sections-close" type="button" onclick={closeSections} aria-label="Close sections">Done</button>
      </div>
      {#if hasUi('counter')}
        <button class="dock-btn guide-button" class:open={shell.panels.guide} onclick={toggleGuide} title="The Field Guide · G" data-hint="Field Guide · G" aria-label="The Field Guide" aria-keyshortcuts="G"><span aria-hidden="true">?</span><small>Guide</small></button>
      {/if}
      {#if hasUi('stats')}
        <button class="dock-btn" class:open={shell.panels.stats} onclick={toggleStats} title="Run records · I" data-hint="Run records · I" aria-label="Run records" aria-keyshortcuts="I"><span aria-hidden="true">▤</span><small>Records</small></button>
      {/if}
      {#if hasUi('options')}
        <button class="dock-btn" class:open={shell.panels.options} onclick={toggleOptions} title="Options · O" data-hint="Options · O" aria-label="Options" aria-keyshortcuts="O"><span aria-hidden="true">⚙</span><small>Options</small></button>
      {/if}
      {#if curiositiesVisible}
        <button class="dock-btn curiosity" class:open={shell.panels.curiosities} onclick={toggleCuriosities} title={`${activePack.cabinet.dockTitle} · C`} data-hint={`${activePack.cabinet.dockTitle} · C`} aria-label={activePack.cabinet.dockTitle} aria-keyshortcuts="C"><span aria-hidden="true">{activePack.cabinet.dockGlyph}</span><small>Cabinet</small></button>
      {/if}
      {#if mementosVisible}
        <button class="dock-btn mementos" class:open={shell.panels.mementos} onclick={toggleMementos} title="Memento gallery · M" data-hint="Memento gallery · M" aria-label="Memento gallery" aria-keyshortcuts="M"><span aria-hidden="true">◇</span><small>Mementos</small></button>
      {/if}
      {#if vesselVisible}
        <button class="dock-btn vessel" class:open={shell.panels.vessel} class:ready={vesselReady} onclick={toggleVessel} title="The Vessel · V" data-hint="The Vessel · V" aria-label="The Vessel" aria-keyshortcuts="V"><span aria-hidden="true">⌁</span><small>Vessel</small></button>
      {/if}
      {#if observatoryVisible}
        <button class="dock-btn stardust" class:open={shell.panels.observatory} class:ready={novaReady} onclick={toggleObservatory} title={`${observatoryIdentity.title} · S`} data-hint={`${observatoryIdentity.title} · S`} aria-label={observatoryIdentity.title} aria-keyshortcuts="S"><span aria-hidden="true">{observatoryDockGlyph}</span><small>Epoch reset</small></button>
      {/if}
      {#if deepVisible}
        <button class="dock-btn deep" class:open={shell.panels.deep} class:ready={deepReady} onclick={toggleDeep} title="The Deep · D" data-hint="The Deep · D" aria-label="The Deep" aria-keyshortcuts="D"><span aria-hidden="true">◉</span><small>Deep reset</small></button>
      {/if}
      {#if stewardVisible}
        <button class="dock-btn steward" class:open={shell.panels.steward} class:ready={idleManagerStatus.attentionCount > 0} onclick={toggleSteward} title="The Steward · A" data-hint="The Steward · A" aria-label="The Steward" aria-keyshortcuts="A"><span aria-hidden="true">◒</span><small>Steward</small></button>
      {/if}
      {#if storyArchiveVisible}
        <button class="dock-btn" class:open={shell.panels.codex} onclick={toggleCodex} title="Story Archive · E" data-hint="Story Archive · E" aria-label="Story Archive" aria-keyshortcuts="E"><span aria-hidden="true">❖</span><small>Story</small></button>
      {/if}
      {#if endgameVisible}
        <button class="dock-btn legacy" class:open={shell.panels.endgame} class:ready={endgameReady} onclick={toggleEndgame} title="The Legacy of Light · L" data-hint="Legacy · L" aria-label="The Legacy of Light" aria-keyshortcuts="L"><span aria-hidden="true">⌘</span><small>Legacy</small></button>
      {/if}
    </div>
    <button
      id="mobile-more-button"
      class="dock-btn mobile-more"
      class:open={shell.sectionsOpen}
      class:ready={anySectionReady}
      onclick={toggleSections}
      title="More sections"
      aria-label="More game sections"
      aria-controls="dock-sections"
      aria-expanded={shell.sectionsOpen}
    ><span aria-hidden="true">☰</span><small>More</small></button>
  </nav>

  {#if shell.panels.stats}
    <StatsPanel onclose={() => (shell.panels.stats = false)} />
  {/if}
  {#if shell.panels.options}
    <OptionsPanel
      onclose={() => (shell.panels.options = false)}
      {averagedRhythm}
      {goalLensEnabled}
      {photoMode}
      promptsEnabled={promptState.enabled}
      onaveragedrhythmchange={(enabled) => (averagedRhythm = enabled)}
      ongoallenschange={(enabled) => (goalLensEnabled = enabled)}
      onphotomodechange={enterPhotoMode}
      onpromptschange={(enabled) => (promptState = { ...promptState, enabled })}
      onhardreset={clearAllTransientUi}
    />
  {/if}
  {#if shell.panels.openingAccess}
    <OptionsPanel accessOnly onhardreset={clearAllTransientUi} onclose={() => (shell.panels.openingAccess = false)} />
  {/if}
  {#if shell.panels.vessel}
    <VesselPanel onclose={() => (shell.panels.vessel = false)} oncross={beginCrossingPrelude} />
  {/if}
  {#if shell.panels.observatory}
    <Observatory
      initialNodeId={observatoryInitialNodeId}
      onclose={() => {
        shell.panels.observatory = false
        observatoryInitialNodeId = null
      }}
      onsupernova={beginSupernova}
    />
  {/if}
  {#if shell.panels.codex}
    <Codex
      onclose={() => (shell.panels.codex = false)}
      onremember={beginRemembranceReview}
      onreplayclockwork={replayClockworkRevelation}
    />
  {/if}
  {#if shell.panels.deep}
    <TheDeep onrequestcollapse={beginDeepCollapse} onclose={() => (shell.panels.deep = false)} />
  {/if}
  {#if shell.panels.steward}
    <IdleSteward onclose={() => (shell.panels.steward = false)} onreviewrealm={reviewRealmManager} />
  {/if}
  <QuestionChip onopen={() => { closeAll(); questionOpen = true }} />
</div>
{#if photoMode}
  <aside class="photo-controls instrument-panel" aria-label="Photo mode controls">
    <span>sky held still · interface hidden</span>
    <div><button onclick={exportSkyPhoto}>Save sky PNG</button><button onclick={exitPhotoMode}>Resume · Esc</button></div>
    {#if photoMessage}<p role="status">{photoMessage}</p>{/if}
  </aside>
{/if}
{#if offlineReturnOpen}
  <WelcomeBack summary={visibleOfflineReturn} oncollect={() => (offlineGainDismissed = true)} />
{/if}
{#if shell.panels.curiosities}
  <CuriosityCabinet onclose={() => closeModalPanel('curiosities')} />
{/if}
{#if shell.panels.mementos}
  <MementoGallery onclose={() => closeModalPanel('mementos')} />
{/if}
{#if shell.panels.endgame}
  <EndgameHub onclose={() => closeModalPanel('endgame')} />
{/if}
{#if resetPreviewOpen && resetComparison}
  <ResetComparisonCard
    id={`${resetComparison.boundary}-reset-preview`}
    universeId={activePack.id}
    comparison={resetComparison}
    confirmFocusReturn={confirmResetFocus}
    cancelFocusReturn={cancelResetFocus}
    resolveText={resolveActiveUiText}
    formatDuration={formatGoalDuration}
    ondecision={handleResetDecision}
  />
{/if}
{#if firstEpochHandoffOpen}
  <FirstEpochHandoff
    rewardGlyph={epochMatterGlyph}
    rewardName={activeV2Pack?.economy.localPrestige.rewardCurrency.localName ?? 'Stardust'}
    rewardGain={format(firstEpochReward)}
    recommendationName={firstEpochRecommendation.name}
    recommendationEffect="×1.5 all production"
    onopen={() => finishFirstEpochHandoff(true)}
    ondismiss={() => finishFirstEpochHandoff(false)}
  />
{/if}
{#if shell.panels.guide}
  <GameGuide onclose={() => (shell.panels.guide = false)} />
{/if}
{#if cutsceneActive}
  <SupernovaCutscene doReset={resetForSupernova} onfinished={afterSupernova} timeScale={supernovaTimeScale} />
{/if}
{#if deepCollapseActive}
  <DeepCollapseCeremony doReset={resetForDeepCollapse} onfinished={afterDeepCollapse} timeScale={deepCollapseTimeScale} />
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
  .notification-lane {
    position: fixed;
    top: 4.25rem;
    left: 0.75rem;
    z-index: 10;
    width: min(16.5rem, calc(50vw - 22.75rem));
    min-width: 13rem;
    display: grid;
    gap: 0.5rem;
    pointer-events: none;
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
    min-width: 9.5rem;
    min-height: 2.25rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.38rem;
    padding: 0.46rem 0.72rem;
    color: color-mix(in srgb, var(--gold) 72%, white);
    background:
      linear-gradient(110deg, color-mix(in srgb, var(--gold) 8%, transparent), transparent 58%),
      color-mix(in srgb, var(--panel) 92%, transparent);
    border: 1px solid color-mix(in srgb, var(--gold) 42%, transparent);
    border-radius: 999px;
    box-shadow: 0 0 1.1rem color-mix(in srgb, var(--gold) 12%, transparent), inset 0 1px rgba(255, 255, 255, 0.05);
    font: 680 0.8125rem/1.1 system-ui, sans-serif;
    letter-spacing: 0.025em;
    cursor: pointer;
    z-index: 7;
  }
  .access-hatch > span { color: var(--gold); font-size: 0.9rem; }
  .access-hatch kbd {
    padding: 0.12rem 0.28rem;
    color: inherit;
    background: color-mix(in srgb, var(--bg) 68%, transparent);
    border: 1px solid color-mix(in srgb, var(--gold) 30%, transparent);
    border-radius: 0.28rem;
    font: 700 0.66rem/1 system-ui, sans-serif;
  }
  .access-hatch:hover,
  .access-hatch:focus-visible,
  .access-hatch.open {
    color: white;
    border-color: color-mix(in srgb, var(--gold) 74%, white);
    box-shadow: 0 0 1.45rem color-mix(in srgb, var(--gold) 24%, transparent), inset 0 1px rgba(255, 255, 255, 0.09);
    outline: 2px solid color-mix(in srgb, var(--gold) 44%, transparent);
    outline-offset: 2px;
  }
  .dock-btn {
    position: relative;
    min-width: 3.7rem;
    min-height: 2.75rem;
    display: grid;
    grid-template-rows: 1.1rem auto;
    place-items: center;
    gap: 0.12rem;
    padding: 0.3rem 0.4rem;
    font-size: 1rem;
    color: var(--dim);
    background: var(--panel);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    cursor: pointer;
    animation: dock-in 1s ease both;
    transition: color 0.15s, border-color 0.15s;
  }
  .mobile-kindling { display: none; }
  /* On laptop the sections wrapper is transparent: its buttons flow inline in
     the dock exactly as before. The mobile-only sheet chrome stays hidden. */
  .dock-sections { display: contents; }
  .mobile-more,
  .sections-head,
  .sections-scrim { display: none; }
  .dock-btn > span { font-size: 1rem; line-height: 1; }
  .dock-btn > small { color: color-mix(in srgb, currentColor 84%, white); font: 650 0.625rem/1.1 system-ui, sans-serif; white-space: nowrap; }
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
  .dock-btn.steward:hover,
  .dock-btn.steward.open,
  .dock-btn.steward.ready {
    color: #b9e8dc;
    border-color: rgba(132, 218, 194, 0.48);
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
    .game-shell {
      --mobile-dock-height: calc(4.35rem + env(safe-area-inset-bottom, 0px));
      --mobile-transient-bottom: calc(var(--mobile-dock-height) + 1rem);
      --mobile-history-bottom: calc(var(--mobile-dock-height) + 0.5rem);
    }
    .top-stack {
      top: max(0.45rem, env(safe-area-inset-top, 0px));
    }
    .notification-lane {
      top: 13.75rem;
      right: max(0.5rem, env(safe-area-inset-right, 0px));
      left: auto;
      width: min(14rem, calc(100vw - 1rem));
      min-width: 0;
    }
    .top-stack.future-law { width: calc(100vw - 1rem); }
    .cohesion-stack {
      top: 21.5rem;
      left: max(0.5rem, env(safe-area-inset-left, 0px));
      right: 0.5rem;
      width: auto;
      max-height: min(7rem, 13dvh);
      overflow-y: auto;
      transform: none;
    }
    .cohesion-stack.first-epoch { max-height: min(18rem, 35dvh); }
    .game-shell.lumen-active .cohesion-stack,
    .game-shell:not(.shop-collapsed):not(.shop-absent) .cohesion-stack {
      opacity: 0;
      pointer-events: none;
    }
    /* The Kindling drawer and Sections sheet are modal on mobile: keep the
       floating notification lane from leaking above them. */
    .game-shell:not(.shop-collapsed):not(.shop-absent) .notification-lane,
    .game-shell.sections-open .notification-lane,
    .game-shell.sections-open .cohesion-stack {
      opacity: 0;
      pointer-events: none;
    }
    .dock {
      bottom: 0;
      left: 0;
      right: 0;
      height: var(--mobile-dock-height);
      align-items: center;
      justify-content: center;
      gap: 0.55rem;
      /* The bar holds two anchors only, so no scroll rail. overflow must stay
         visible: the dock is the containing block for the fixed Sections
         sheet, and clipping here would hide the sheet above the bar. */
      overflow: visible;
      padding:
        0.42rem
        max(0.5rem, env(safe-area-inset-right, 0px))
        calc(0.35rem + env(safe-area-inset-bottom, 0px))
        max(0.5rem, env(safe-area-inset-left, 0px));
      background: linear-gradient(180deg, color-mix(in srgb, var(--bg) 58%, transparent), color-mix(in srgb, var(--bg) 96%, #02030a));
      border-top: 1px solid color-mix(in srgb, var(--gold) 13%, transparent);
      box-shadow: 0 -0.75rem 2rem rgba(0, 0, 0, 0.22);
      backdrop-filter: blur(16px);
      z-index: 8;
    }
    /* Lift the bar's stacking context above the scrim so the nested sheet
       (fixed inside the dock) paints over it. */
    .dock.sections-open { z-index: 9; }
    .dock-btn {
      flex: 0 0 4.25rem;
      min-width: 4.25rem;
      min-height: 3.35rem;
      scroll-snap-align: start;
      border-radius: 12px;
      background: color-mix(in srgb, var(--panel) 84%, transparent);
    }
    /* Mobile bottom bar is just two wide, thumb-friendly anchors:
       Kindling (the economy) and More (every other section). */
    .mobile-kindling,
    .mobile-more { display: grid; flex: 1 1 0; max-width: 13rem; min-width: 0; }
    .mobile-kindling.open,
    .mobile-more.open {
      color: color-mix(in srgb, var(--gold) 88%, white);
      border-color: color-mix(in srgb, var(--amber) 58%, transparent);
      background: color-mix(in srgb, var(--amber) 14%, var(--panel));
    }
    .mobile-more.ready {
      color: #d8d2ff;
      border-color: rgba(180, 170, 255, 0.55);
      box-shadow: 0 0 16px rgba(170, 150, 255, 0.3);
    }
    .mobile-more.ready::after {
      content: '';
      position: absolute;
      top: 0.4rem;
      right: 0.7rem;
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 50%;
      background: #cbb8ff;
      box-shadow: 0 0 8px rgba(170, 150, 255, 0.9);
      animation: ready-pulse 1.8s ease-in-out infinite;
    }
    /* Sections sheet: a bottom sheet of large section tiles above the bar. */
    .sections-scrim {
      position: fixed;
      inset: 0 0 var(--mobile-dock-height) 0;
      display: block;
      z-index: 8;
      padding: 0;
      background: rgba(2, 3, 9, 0.5);
      border: 0;
      backdrop-filter: blur(2px);
      animation: scrim-fade 180ms ease both;
    }
    @keyframes scrim-fade { from { opacity: 0; } to { opacity: 1; } }
    .dock-sections {
      position: fixed;
      left: 0;
      right: 0;
      bottom: var(--mobile-dock-height);
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.5rem;
      max-height: min(60dvh, 26rem);
      padding:
        0.85rem
        max(0.7rem, env(safe-area-inset-right, 0px))
        1rem
        max(0.7rem, env(safe-area-inset-left, 0px));
      background: linear-gradient(180deg, color-mix(in srgb, var(--bg) 82%, transparent), color-mix(in srgb, var(--bg) 97%, #02030a));
      border-top: 1px solid color-mix(in srgb, var(--gold) 16%, transparent);
      border-radius: 20px 20px 0 0;
      box-shadow: 0 -1rem 3rem rgba(0, 0, 0, 0.42);
      backdrop-filter: blur(18px);
      overflow-y: auto;
      overscroll-behavior: contain;
      transform: translateY(112%);
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      transition: transform 0.28s ease, opacity 0.2s ease, visibility 0s 0.28s;
      z-index: 9;
    }
    .dock.sections-open .dock-sections {
      transform: translateY(0);
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
      transition: transform 0.28s ease, opacity 0.2s ease, visibility 0s;
    }
    :global(html[data-motion='reduced']) .dock-sections {
      transform: none;
      transition: opacity 0.12s ease, visibility 0s 0.12s;
    }
    :global(html[data-motion='reduced']) .dock.sections-open .dock-sections {
      transition: opacity 0.12s ease, visibility 0s;
    }
    .sections-head {
      grid-column: 1 / -1;
      order: -2;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 0.15rem 0.15rem;
    }
    .sections-head > span {
      color: var(--dim);
      font: 600 0.72rem/1 system-ui, sans-serif;
      letter-spacing: 0.18em;
      text-transform: uppercase;
    }
    .sections-close {
      min-height: 2.4rem;
      padding: 0.35rem 0.9rem;
      color: color-mix(in srgb, var(--gold) 86%, white);
      background: color-mix(in srgb, var(--panel) 88%, transparent);
      border: 1px solid color-mix(in srgb, var(--amber) 30%, transparent);
      border-radius: 999px;
      font: 650 0.8rem/1 system-ui, sans-serif;
      cursor: pointer;
    }
    /* Section tiles fill their grid cell instead of the rail's fixed width. */
    .dock-sections .dock-btn {
      flex: initial;
      width: auto;
      min-width: 0;
      min-height: 4.6rem;
      grid-template-rows: 1.4rem auto;
      gap: 0.2rem;
      background: color-mix(in srgb, var(--panel) 90%, transparent);
    }
    .dock-sections .dock-btn.ready { order: -1; }
    .dock-sections .dock-btn > span { font-size: 1.3rem; }
    .dock-sections .dock-btn > small { font-size: 0.7rem; }
    .dock-btn > span { font-size: 1.08rem; }
    .dock-btn > small { font-size: 0.65rem; }
    .dock-btn::after { display: none; }
    .access-hatch {
      top: max(0.5rem, env(safe-area-inset-top, 0px));
      left: max(0.5rem, env(safe-area-inset-left, 0px));
      min-width: 2.75rem;
      min-height: 2.75rem;
      width: 2.75rem;
      padding: 0;
    }
    .access-hatch > span:first-child { font-size: 1rem; }
    .access-hatch .access-label,
    .access-hatch kbd { display: none; }
    :global(.game-shell .lumen-shell),
    :global(.game-shell .chip),
    :global(.game-shell .ask) {
      bottom: var(--mobile-transient-bottom);
    }
  }
  :global(html[data-lumen-history='open']) .cohesion-stack { opacity: 0; pointer-events: none; }
  @media (max-width: 650px) {
    .top-stack,
    .top-stack.future-law { width: calc(100vw - 1rem); }
    .cohesion-stack { right: 0.45rem; max-height: 11vh; }
  }
  @media (max-width: 800px) and (max-height: 700px) {
    .game-shell:not(.shop-collapsed) .notification-lane {
      opacity: 0;
    }
  }
  @media (max-width: 380px) {
    .top-stack { top: 0.4rem; gap: 0.35rem; }
    .cohesion-stack { left: 0.4rem; right: 0.4rem; top: 21.25rem; }
    .dock-btn { flex-basis: 4rem; min-width: 4rem; }
  }
  .game-shell.photo-mode > :global(*:not(canvas):not(.manifest-world)) { display: none !important; }
  :global(html[data-photo-mode] .manifest-world *) { animation-play-state: paused !important; transition: none !important; }
  .photo-controls { position: fixed; z-index: 30; right: 1rem; bottom: 1rem; display: grid; gap: .45rem; min-width: 14rem; padding: .7rem; color: var(--gold); }
  .photo-controls > span { color: var(--dim); font-size: .58rem; letter-spacing: .12em; text-transform: uppercase; }
  .photo-controls > div { display: flex; gap: .4rem; }
  .photo-controls button { flex: 1; padding: .45rem .6rem; color: var(--gold); background: color-mix(in srgb, var(--panel) 90%, transparent); border: 1px solid color-mix(in srgb, var(--amber) 28%, transparent); border-radius: .5rem; cursor: pointer; }
  .photo-controls button:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }
  .photo-controls p { margin: 0; color: var(--dim); font-size: .65rem; }
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
