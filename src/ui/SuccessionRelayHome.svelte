<script lang="ts">
  import {
    SUCCESSION_RELAYS,
    successionRelayCost,
    successionRelayMultiplier,
    successionRelayRank,
  } from '../content/legacy-exchange'
  import { UNIVERSES } from '../content/universes'
  import { buySuccessionRelay, game } from '../engine/game.svelte'
  import { format } from '../core/format'
  import { gteAmount } from '../core/numeric/amount'
  import { save } from '../core/save'
  import { playBuy } from '../audio/sfx'
  import { pushToast } from '../systems/toasts.svelte'

  let message = $state('')
  const revealed = $derived(game.beacons.length > 0 || Object.keys(game.successionRelays).length > 0)

  function invest(id: string) {
    const relay = SUCCESSION_RELAYS.find((entry) => entry.id === id)
    if (!relay || !buySuccessionRelay(id)) {
      message = 'Feed a relay from its completed source world with local Singularities.'
      return
    }
    playBuy()
    save()
    message = 'The immediate successor grows stronger; no route was skipped.'
    pushToast(relay.name, relay.sourceGift, 'Wayfinder relay')
  }
</script>

{#if revealed}
  <section class="relay-home" aria-labelledby="relay-home-title">
    <header><div><span>succession instruments</span><h3 id="relay-home-title">One world reaches only its immediate successor.</h3></div><p>Spend a completed source world’s local Singularities here. Relay ranks persist across pruning and crossing.</p></header>
    <div class="chain" aria-label="Universe succession chain">
      {#each UNIVERSES as universe, index (universe.id)}
        <span class:current={universe.id === game.activeUniverse} class:complete={game.beacons.includes(universe.id)}>{universe.currencyGlyph}<small>{universe.shortName}</small></span>
        {#if index < UNIVERSES.length - 1}<b aria-hidden="true">→</b>{/if}
      {/each}
    </div>
    <div class="relays">
      {#each SUCCESSION_RELAYS as relay (relay.id)}
        {@const source = UNIVERSES.find((world) => world.id === relay.sourceUniverseId)}
        {@const target = UNIVERSES.find((world) => world.id === relay.targetUniverseId)}
        {@const rank = successionRelayRank(game.successionRelays, relay.id)}
        {@const cost = successionRelayCost(rank)}
        {@const canFeed = game.activeAtlasRoute === null && relay.sourceUniverseId === game.activeUniverse && game.beacons.includes(relay.sourceUniverseId) && cost !== null && gteAmount(game.singularities, cost)}
        <article class:current-source={relay.sourceUniverseId === game.activeUniverse}>
          <span>{source?.shortName} → {target?.shortName}</span><strong>{relay.name}</strong><p>{relay.description}</p>
          <div><em>rank {rank}</em><small>×{successionRelayMultiplier(relay.targetUniverseId, game.successionRelays, game.lumenPurchases).toFixed(2)} {target?.shortName}</small></div>
          <button disabled={!canFeed} onclick={() => invest(relay.id)}>{cost === null ? 'mastered' : relay.sourceUniverseId !== game.activeUniverse ? `visit ${source?.shortName}` : !game.beacons.includes(relay.sourceUniverseId) ? 'light its Beacon first' : game.activeAtlasRoute ? 'unavailable on an Atlas route' : `feed · ◉ ${format(cost)}`}</button>
        </article>
      {/each}
    </div>
    {#if message}<p class="message" role="status" aria-live="polite">{message}</p>{/if}
  </section>
{/if}

<style>
  .relay-home { margin-top: .8rem; padding: .85rem; border: 1px solid rgba(170,220,255,.16); border-radius: .8rem; background: linear-gradient(145deg,rgba(110,195,255,.055),transparent 38%),rgba(0,0,0,.18); }
  header { display: flex; align-items: end; justify-content: space-between; gap: 1rem; } header span { color: var(--dim); font-size: .52rem; letter-spacing: .13em; text-transform: uppercase; } h3 { margin-top: .12rem; font: 700 .9rem/1.2 var(--font-story,Georgia,serif); } header p { max-width: 18rem; color: var(--dim); font-size: .62rem; line-height: 1.4; }
  .chain { display: grid; grid-template-columns: repeat(13,auto); align-items: center; justify-content: center; gap: .22rem; margin: .7rem 0; padding: .5rem; overflow-x: auto; border-block: 1px solid rgba(255,255,255,.05); background: rgba(0,0,0,.2); }
  .chain span { display: grid; place-items: center; min-width: 2.5rem; height: 2.5rem; color: var(--dim); border: 1px solid rgba(255,255,255,.08); border-radius: 50%; } .chain span.complete { color: var(--gold); border-color: rgba(170,220,255,.25); } .chain span.current { outline: 1px solid #9fdcff; outline-offset: 2px; } .chain small { font-size: .38rem; } .chain b { color: rgba(170,220,255,.4); font-weight: 400; }
  .relays { display: grid; grid-template-columns: repeat(2,1fr); gap: .45rem; }
  article { display: flex; flex-direction: column; min-height: 10.5rem; padding: .65rem; border: 1px solid rgba(255,255,255,.065); border-radius: .6rem; background: rgba(0,0,0,.18); } article.current-source { border-color: rgba(170,220,255,.32); }
  article > span { color: var(--dim); font-size: .48rem; letter-spacing: .08em; text-transform: uppercase; } article > strong { margin: .2rem 0; font: 700 .78rem/1.2 var(--font-story,Georgia,serif); } article > p { flex: 1; color: var(--dim); font-size: .6rem; line-height: 1.35; }
  article > div { display: flex; justify-content: space-between; gap: .4rem; margin: .4rem 0; padding-top: .38rem; border-top: 1px solid rgba(255,255,255,.05); } article em { color: #9fdcff; font-size: .56rem; font-style: normal; } article small { color: var(--gold); font-size: .54rem; }
  button { width: 100%; min-height: 1.9rem; font-size: .6rem; } .message { margin: .55rem auto 0; color: var(--gold); font-size: .6rem; text-align: center; }
  @media (max-width: 560px) { header { align-items: start; flex-direction: column; } .relays { grid-template-columns: 1fr; } }
</style>
