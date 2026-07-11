<script lang="ts">
  import {
    LUMEN_SHARD_GLYPH,
    MAX_LUMEN_DISTILLATIONS_PER_UNIVERSE,
    lumenDistillationCost,
  } from '../content/legacy-exchange'
  import { distillLumenShard, game } from '../engine/game.svelte'
  import { format } from '../core/format'
  import { gteAmount } from '../core/numeric/amount'
  import { save } from '../core/save'
  import { playCollect } from '../audio/sfx'
  import { pushToast } from '../systems/toasts.svelte'
  import { universeById } from '../content/universes'

  const count = $derived(Math.max(0, Math.floor(game.lumenDistillations[game.activeUniverse] ?? 0)))
  const cost = $derived(lumenDistillationCost(count))
  const pack = $derived(universeById(game.activeUniverse))
  const revealed = $derived(game.beacons.length > 0 || game.lumenShardClaims.length > 0)
  let message = $state('')

  function distill() {
    if (!distillLumenShard()) {
      message = 'This completed world cannot distill another shard yet.'
      return
    }
    playCollect()
    save()
    message = `One Lumen Shard left ${pack.shortName} for the shared instruments.`
    pushToast('Lumen Shard distilled', `${LUMEN_SHARD_GLYPH} ${game.lumenShards} held between worlds.`, 'The Deep')
  }
</script>

{#if revealed}
  <section class="distillery" aria-labelledby="distillery-title">
    <div class="sigil" aria-hidden="true"><span>◉</span><b>→</b><i>{LUMEN_SHARD_GLYPH}</i></div>
    <div class="copy"><span>rare conversion · {pack.shortName}</span><h3 id="distillery-title">Lumen Distillery</h3><p>A completed world may compress its own Deep surplus into at most {MAX_LUMEN_DISTILLATIONS_PER_UNIVERSE} shared shards. Costs rise tenfold.</p></div>
    <div class="action"><strong>{count}/{MAX_LUMEN_DISTILLATIONS_PER_UNIVERSE} distilled here</strong><button disabled={game.activeAtlasRoute !== null || !game.beacons.includes(game.activeUniverse) || cost === null || !gteAmount(game.singularities, cost)} onclick={distill}>{cost === null ? 'world exhausted' : game.activeAtlasRoute ? 'unavailable on an Atlas route' : `distill · ◉ ${format(cost)}`}</button></div>
    {#if message}<p class="message" role="status" aria-live="polite">{message}</p>{/if}
  </section>
{/if}

<style>
  .distillery { position: relative; display: grid; grid-template-columns: auto 1fr 12rem; align-items: center; gap: 1rem; margin-top: .8rem; padding: .9rem; overflow: hidden; border: 1px solid rgba(130,210,255,.17); border-radius: .8rem; background: radial-gradient(circle at 8% 50%,rgba(115,205,255,.1),transparent 24%),rgba(0,0,0,.2); }
  .sigil { display: flex; align-items: center; gap: .4rem; } .sigil span { color: #9fdcff; font-size: 1.2rem; } .sigil b { color: var(--dim); font-size: .72rem; } .sigil i { color: var(--gold); font-size: 1.5rem; font-style: normal; text-shadow: 0 0 1rem var(--amber); }
  .copy > span { color: var(--dim); font-size: .53rem; letter-spacing: .13em; text-transform: uppercase; } h3 { margin: .12rem 0; font: 700 .95rem/1.2 var(--font-story,Georgia,serif); } .copy p { color: var(--dim); font-size: .66rem; line-height: 1.4; }
  .action strong { display: block; margin-bottom: .4rem; color: var(--dim); font-size: .57rem; letter-spacing: .07em; text-align: center; text-transform: uppercase; } button { width: 100%; min-height: 2rem; font-size: .64rem; }
  .message { position: absolute; right: .8rem; bottom: .2rem; color: var(--gold); font-size: .58rem; }
  @media (max-width: 620px) { .distillery { grid-template-columns: auto 1fr; } .action { grid-column: 1 / -1; } .message { position: static; grid-column: 1 / -1; } }
</style>
