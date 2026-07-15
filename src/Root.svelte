<script lang="ts">
  import App from './App.svelte'
  import LandingPage from './ui/LandingPage.svelte'
  import type { OfflineReturnSummary } from './core/offline-pacing'

  let {
    offlineReturn,
    returningPlayer,
    showLanding,
    onenter,
  }: {
    offlineReturn: OfflineReturnSummary
    returningPlayer: boolean
    showLanding: boolean
    onenter: () => void
  } = $props()

  let landingDismissed = $state(false)
  const landingOpen = $derived(showLanding && !landingDismissed)

  function enterGame() {
    onenter()
    landingDismissed = true
  }
</script>

{#if landingOpen}
  <LandingPage {returningPlayer} onenter={enterGame} />
{:else}
  <App {offlineReturn} />
{/if}
