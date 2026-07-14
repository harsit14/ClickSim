<script lang="ts">
  import { game } from '../engine/game.svelte'
  import { save } from '../core/save'
  import { format } from '../core/format'
  import { subtractAmounts } from '../core/numeric/amount'
  import { universeById } from '../content/universes'
  import {
    AUTO_KINDLER_FAMILIES,
    autoKindlerFamilyForTier,
    type AutoKindlerFamily,
  } from '../core/automation-preferences'
  import { previewAutoKindlerPurchase } from '../systems/auto-kindler'

  let { embedded = false }: { embedded?: boolean } = $props()
  const pack = $derived(universeById(game.activeUniverse))
  const preview = $derived(previewAutoKindlerPurchase(game, {
    families: game.autoKindlerFamilies,
    priority: game.autoKindlerPriority,
  }))

  function familyLabel(family: AutoKindlerFamily): string {
    const members = pack.generators.filter(({ tier }) => autoKindlerFamilyForTier(tier) === family)
    return `${members[0]?.name ?? `Tier ${family * 3 + 1}`} — ${members.at(-1)?.name ?? `tier ${family * 3 + 3}`}`
  }

  function toggleFamily(family: AutoKindlerFamily) {
    const selected = game.autoKindlerFamilies.includes(family)
    if (selected && game.autoKindlerFamilies.length === 1) return
    game.autoKindlerFamilies = selected
      ? game.autoKindlerFamilies.filter((entry) => entry !== family)
      : [...game.autoKindlerFamilies, family].sort((left, right) => left - right)
    save()
  }
</script>

<section class="manager" class:embedded aria-labelledby={embedded ? undefined : 'auto-kindler-manager-title'}>
  <header>
    <div>
      <small>automatic stewardship</small>
      <h3 id={embedded ? undefined : 'auto-kindler-manager-title'}>Choose what the Auto-Kindler tends</h3>
    </div>
    <label class="master"><input type="checkbox" bind:checked={game.autoKindler} onchange={() => save()} /><span>{game.autoKindler ? 'tending' : 'paused'}</span></label>
  </header>

  {#if preview}
    <div class="queue" class:ready={preview.affordable}>
      <span aria-hidden="true">{preview.affordable ? '◆' : '◇'}</span>
      <div><small>{preview.affordable ? 'next purchase queued' : 'gathering toward'}</small><strong>{preview.generator.name}</strong></div>
      <b>{preview.affordable ? 'ready' : `${pack.currencyGlyph}${format(subtractAmounts(preview.cost, game.light))} short`}</b>
    </div>
  {/if}

  <label class="priority">
    <span><strong>Purchase priority</strong><small>Change the kind of growth you wake up to.</small></span>
    <select bind:value={game.autoKindlerPriority} onchange={() => save()}>
      <option value="efficiency">Best payback</option>
      <option value="cheapest">Lowest cost</option>
      <option value="least-owned">Least owned</option>
      <option value="highest-tier">Highest tier</option>
    </select>
  </label>

  <fieldset>
    <legend>Eligible Kindling families</legend>
    {#each AUTO_KINDLER_FAMILIES as family}
      <label title={familyLabel(family)}>
        <input
          type="checkbox"
          checked={game.autoKindlerFamilies.includes(family)}
          disabled={game.autoKindlerFamilies.length === 1 && game.autoKindlerFamilies.includes(family)}
          onchange={() => toggleFamily(family)}
        />
        <span><b>{family * 3 + 1}–{family * 3 + 3}</b><small>{familyLabel(family)}</small></span>
      </label>
    {/each}
  </fieldset>
  <p class="footnote">While EMBER is open, the steward buys one routed Kindling every two seconds. Changes save immediately.</p>
</section>

<style>
  .manager { display:grid;gap:.7rem;padding:.9rem;border:1px solid rgba(140,220,255,.2);border-radius:.85rem;background:linear-gradient(145deg,rgba(75,177,218,.07),rgba(68,55,125,.06)); }
  .manager.embedded { margin-top:.42rem;padding:.7rem; }
  header { display:flex;align-items:center;justify-content:space-between;gap:.8rem; }
  header small,.queue small { display:block;color:#80c9eb;font-size:.5rem;font-weight:760;letter-spacing:.13em;text-transform:uppercase; }
  h3 { margin:.16rem 0 0;color:#def4ff;font:560 .9rem/1.2 var(--font-story); }
  .master { display:flex;align-items:center;gap:.35rem;color:#a9d2e4;font-size:.63rem;white-space:nowrap; }
  .master input,fieldset input { accent-color:#7fc8ec; }
  .queue { display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:.55rem;padding:.56rem .65rem;border:1px solid rgba(140,220,255,.13);border-radius:.62rem;background:rgba(2,8,13,.3); }
  .queue.ready { border-color:color-mix(in srgb,var(--amber) 30%,transparent);background:color-mix(in srgb,var(--amber) 4%,transparent); }
  .queue > span { color:#9fdcf4; }
  .queue strong { display:block;margin-top:.1rem;color:var(--text);font-size:.72rem; }
  .queue b { color:#9fdcf4;font-size:.58rem;font-weight:700;white-space:nowrap; }
  .priority { display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:.7rem; }
  .priority strong { display:block;color:#d9f2ff;font-size:.66rem; }
  .priority small { display:block;margin-top:.12rem;color:var(--dim);font-size:.55rem; }
  select { min-width:8.5rem;padding:.38rem .45rem;color:var(--text);background:#10131d;border:1px solid rgba(140,220,255,.24);border-radius:.4rem;font:inherit;font-size:.64rem; }
  fieldset { display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.35rem .5rem;min-width:0;margin:0;padding:.5rem;border:1px solid rgba(140,220,255,.13);border-radius:.62rem; }
  legend { padding:0 .3rem;color:var(--dim);font-size:.56rem; }
  fieldset label { display:flex;min-width:0;align-items:center;gap:.35rem;padding:.28rem .32rem;border-radius:.35rem;background:rgba(255,255,255,.018); }
  fieldset label > span { min-width:0; }
  fieldset b { display:block;color:#a9d2e4;font-size:.58rem; }
  fieldset small { display:block;overflow:hidden;margin-top:.08rem;color:var(--dim);font-size:.5rem;text-overflow:ellipsis;white-space:nowrap; }
  .footnote { margin:0;color:var(--dim);font-size:.55rem;line-height:1.4; }
  select:focus-visible,input:focus-visible { outline:2px solid white;outline-offset:2px; }
  @media (max-width:520px) { fieldset { grid-template-columns:1fr; }.priority { grid-template-columns:1fr; }select { width:100%; } }
</style>
