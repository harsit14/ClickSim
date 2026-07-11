<script lang="ts">
  import {
    LUMEN_SHARD_GLYPH,
    lumenVaultItemsForHome,
    type LumenVaultHome,
  } from '../content/legacy-exchange'
  import { buyLumenVaultItem, game } from '../engine/game.svelte'
  import { save } from '../core/save'
  import { playBuy } from '../audio/sfx'
  import { pushToast } from '../systems/toasts.svelte'

  let { home }: { home: LumenVaultHome } = $props()

  const items = $derived(lumenVaultItemsForHome(home))
  const revealed = $derived(
    game.lumenShardClaims.length > 0
      || game.lumenShards > 0
      || items.some((item) => game.lumenPurchases.includes(item.id)),
  )
  const titles: Record<LumenVaultHome, { overline: string; title: string; note: string }> = {
    archive: {
      overline: 'shared testimony',
      title: 'Lumen’s Marginalia',
      note: 'Recovered passages and the Archive Resonator remain with the records they interpret.',
    },
    observatory: {
      overline: 'light worn deliberately',
      title: 'Vault Vestments',
      note: 'Permanent Heart vestments belong beside the sky map that gives them light.',
    },
    'vessel-wayfinder': {
      overline: 'the route learns to focus',
      title: 'Wayfinder Instruments',
      note: 'Shared route utilities remain with the relays and laws they strengthen.',
    },
  }
  const copy = $derived(titles[home])
  let message = $state('')

  function purchase(id: string) {
    const item = items.find((entry) => entry.id === id)
    if (!item || !buyLumenVaultItem(id)) {
      message = 'Already held, or more Lumen Shards are needed.'
      return
    }
    playBuy()
    save()
    message = item.kind === 'skin'
      ? `${item.name} unlocked and equipped. It remains selectable in Options.`
      : `${item.name} joined the permanent Archive.`
    pushToast(item.name, item.description, copy.title)
  }
</script>

{#if revealed}
  <section class="vault-shelf" class:archive={home === 'archive'} class:observatory={home === 'observatory'} class:wayfinder={home === 'vessel-wayfinder'} aria-labelledby={`vault-${home}`}>
    <header>
      <div><span>{copy.overline}</span><h3 id={`vault-${home}`}>{copy.title}</h3><p>{copy.note}</p></div>
      <div class="balance" aria-label={`${game.lumenShards} Lumen Shards`}><i>{LUMEN_SHARD_GLYPH}</i><strong>{game.lumenShards}</strong><small>Lumen Shards</small></div>
    </header>
    <div class="items">
      {#each items as item (item.id)}
        {@const owned = game.lumenPurchases.includes(item.id)}
        <article class:owned class={`kind-${item.kind}`}>
          <div class="item-head"><i>{item.glyph}</i><span>{item.kind}</span></div>
          <strong>{item.name}</strong>
          <p>{item.description}</p>
          {#if owned && item.lore}<blockquote>{item.lore}</blockquote>{/if}
          <button disabled={owned || game.lumenShards < item.cost} onclick={() => purchase(item.id)}>
            {owned ? 'held permanently' : `${LUMEN_SHARD_GLYPH} ${item.cost} · unlock`}
          </button>
        </article>
      {/each}
    </div>
    {#if message}<p class="message" role="status" aria-live="polite">{message}</p>{/if}
  </section>
{/if}

<style>
  .vault-shelf { --shelf-hue: var(--hue, 42); margin-top: 1rem; padding: .9rem; border: 1px solid hsla(var(--shelf-hue),65%,72%,.18); border-radius: .85rem; background: radial-gradient(ellipse at 50% 0%,hsla(var(--shelf-hue),70%,58%,.08),transparent 45%),rgba(0,0,0,.2); }
  .vault-shelf > header { display: flex; justify-content: space-between; align-items: start; gap: 1rem; margin-bottom: .75rem; }
  header span,.item-head span { color: var(--dim); font-size: .55rem; letter-spacing: .13em; text-transform: uppercase; }
  h3 { margin: .14rem 0; font: 700 1rem/1.15 var(--font-story,Georgia,serif); }
  header p { max-width: 35rem; color: var(--dim); font-size: .68rem; line-height: 1.4; }
  .balance { display: grid; grid-template-columns: auto auto; column-gap: .42rem; align-items: center; min-width: 7.2rem; padding: .45rem .65rem; border: 1px solid hsla(var(--shelf-hue),65%,72%,.2); border-radius: 4rem; background: rgba(0,0,0,.22); }
  .balance i { grid-row: 1 / 3; color: var(--gold); font-size: 1.25rem; font-style: normal; } .balance strong { line-height: 1; } .balance small { color: var(--dim); font-size: .48rem; text-transform: uppercase; }
  .items { display: grid; grid-template-columns: repeat(auto-fit,minmax(10.5rem,1fr)); gap: .5rem; }
  article { display: flex; flex-direction: column; min-height: 9.4rem; padding: .7rem; border: 1px solid rgba(255,255,255,.07); border-radius: .65rem; background: rgba(255,255,255,.018); }
  article.owned { border-color: hsla(var(--shelf-hue),70%,72%,.28); }
  .item-head { display: flex; justify-content: space-between; align-items: center; } .item-head i { color: var(--gold); font-size: 1.15rem; font-style: normal; }
  article > strong { margin: .25rem 0; font: 700 .82rem/1.2 var(--font-story,Georgia,serif); }
  article p { flex: 1; color: var(--dim); font-size: .65rem; line-height: 1.4; }
  blockquote { margin: .42rem 0; padding: .45rem; color: var(--gold); background: hsla(var(--shelf-hue),55%,52%,.05); font: italic .62rem/1.4 var(--font-story,Georgia,serif); }
  button { width: 100%; min-height: 2rem; font-size: .64rem; }
  .message { position: sticky; bottom: 0; width: fit-content; margin: .65rem auto 0; padding: .42rem .7rem; color: var(--gold); background: var(--panel); border: 1px solid hsla(var(--shelf-hue),70%,72%,.32); border-radius: 2rem; font-size: .64rem; }
  @media (max-width: 560px) { .vault-shelf > header { flex-direction: column; } .balance { align-self: stretch; } }
</style>
