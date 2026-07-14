<script lang="ts">
  import type { Effect } from '../content/upgrades'
  import { UNIVERSES, universeV2ById, type UniverseId, type UniversePackV2 } from '../content/universes'
  import { realmLawStatement } from '../experience/cross-realm-continuity'
  import { game } from '../engine/game.svelte'

  let { universeIds }: { universeIds: readonly string[] } = $props()
  const idSet = $derived(new Set(universeIds))
  const realms = $derived(UNIVERSES.flatMap((legacy) => {
    if (!idSet.has(legacy.id)) return []
    const pack = universeV2ById(legacy.id)
    return pack ? [{ legacy, pack, law: realmLawStatement(legacy.id as UniverseId) }] : []
  }))

  function effectText(effect: Effect, pack: UniversePackV2): string {
    const generator = (id: string) => pack.economy.generators.find((entry) => entry.id === id)?.name ?? 'Kindling'
    const currency = pack.economy.currency.localName.toLowerCase()
    switch (effect.kind) {
      case 'genMult': return `${generator(effect.gen)} ×${effect.value}`
      case 'globalMult': return `all ${currency} ×${effect.value}`
      case 'clickMult': return `touch ×${effect.value}`
      case 'clickShare': return `touch gains ${(effect.value * 100).toFixed(1)}% of ${currency}/s`
      case 'synergy': return `${generator(effect.gen)} +${(effect.value * 100).toFixed(1)}% per ${generator(effect.per)}`
      case 'synergyMult': return `all Kindling relations ×${effect.value}`
      case 'critChance': return `critical touch +${(effect.value * 100).toFixed(0)}%`
      case 'critMult': return `critical touch +×${effect.value}`
    }
  }
</script>

{#if realms.length >= 2}
  <details class="doctrine-atlas">
    <summary>
      <span><small>available after the first Crossing</small><strong>Compare realm doctrines</strong></span>
      <b>{realms.length} remembered realms · {realms.length * 4} paths</b>
    </summary>

    <div class="atlas-intro">
      <span aria-hidden="true">⌘</span>
      <p>This is a planning view, not an endgame route. Compare the laws you have lived before deciding which realm and playstyle to deepen next.</p>
    </div>

    <div class="realms">
      {#each realms as realm (realm.pack.id)}
        <article class="realm" class:current={realm.pack.id === game.activeUniverse} style:--realm-hue={realm.legacy.palette.accentHue}>
          <header>
            <span class="realm-glyph" aria-hidden="true">{realm.legacy.route.glyph}</span>
            <div><small>{realm.pack.identity.epithet}</small><h4>{realm.pack.identity.shortName}</h4></div>
            <b>{realm.pack.identity.primaryVerb}</b>
          </header>
          <p class="law">{realm.law.sentence}</p>
          <span class="practice">{realm.law.practice}</span>

          <div class="doctrines">
            {#each realm.pack.economy.doctrines as doctrine (doctrine.id)}
              <section>
                <div><strong>{doctrine.name}</strong><small>{doctrine.favoredMotivations.join(' · ')}</small></div>
                <p>{doctrine.description}</p>
                <ul aria-label={`${doctrine.name} effects`}>
                  {#each doctrine.effects as effect}
                    <li>{effectText(effect, realm.pack)}</li>
                  {:else}
                    <li>identity path · no direct multiplier</li>
                  {/each}
                </ul>
              </section>
            {/each}
          </div>
        </article>
      {/each}
    </div>
  </details>
{/if}

<style>
  .doctrine-atlas { margin-top:.75rem;border:1px solid rgba(152,214,239,.16);border-radius:.8rem;background:linear-gradient(145deg,rgba(87,167,205,.045),transparent 42%),rgba(0,0,0,.16); }
  summary { display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:.72rem .8rem;cursor:pointer;list-style:none; }
  summary::-webkit-details-marker { display:none; }
  summary::after { content:'＋';color:#8fcfe9;font-size:.9rem; }
  details[open] summary::after { content:'−'; }
  summary > span { flex:1;min-width:0; }
  summary small { display:block;color:#7194a4;font-size:.49rem;letter-spacing:.12em;text-transform:uppercase; }
  summary strong { display:block;margin-top:.12rem;color:#cceefa;font:650 .82rem/1.2 var(--font-story,Georgia,serif); }
  summary > b { color:#8fb6c8;font-size:.54rem;font-weight:620;white-space:nowrap; }
  summary:focus-visible { outline:2px solid white;outline-offset:2px;border-radius:.8rem; }
  .atlas-intro { display:grid;grid-template-columns:auto minmax(0,1fr);gap:.55rem;margin:0 .75rem .65rem;padding:.55rem .62rem;border:1px solid rgba(152,214,239,.1);border-radius:.55rem;background:rgba(1,8,13,.35); }
  .atlas-intro > span { color:#8fd7ef; }
  .atlas-intro p { margin:0;color:var(--dim);font:italic .62rem/1.45 var(--font-story,Georgia,serif); }
  .realms { display:grid;gap:.55rem;padding:0 .75rem .8rem; }
  .realm { padding:.65rem;border:1px solid hsla(var(--realm-hue),60%,70%,.13);border-radius:.65rem;background:hsla(var(--realm-hue),50%,40%,.025); }
  .realm.current { border-color:hsla(var(--realm-hue),74%,72%,.32);box-shadow:inset 2px 0 hsla(var(--realm-hue),78%,72%,.55); }
  .realm > header { display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:.5rem;margin:0; }
  .realm-glyph { width:1.65rem;aspect-ratio:1;display:grid;place-items:center;color:hsla(var(--realm-hue),78%,78%,.94);border:1px solid hsla(var(--realm-hue),72%,70%,.28);border-radius:50%; }
  .realm header small { color:hsla(var(--realm-hue),55%,78%,.72);font-size:.46rem;letter-spacing:.1em;text-transform:uppercase; }
  h4 { margin:.08rem 0 0;color:#e2f3f8;font:650 .76rem/1.15 var(--font-story,Georgia,serif); }
  .realm header b { padding:.2rem .4rem;color:hsla(var(--realm-hue),82%,82%,.9);border:1px solid hsla(var(--realm-hue),70%,70%,.18);border-radius:999px;font-size:.48rem;letter-spacing:.08em;text-transform:uppercase; }
  .law { margin:.45rem 0 .12rem;color:#c4dce4;font:italic .66rem/1.4 var(--font-story,Georgia,serif); }
  .practice { color:var(--dim);font-size:.48rem;letter-spacing:.06em;text-transform:uppercase; }
  .doctrines { display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.35rem;margin-top:.5rem; }
  .doctrines section { padding:.46rem .5rem;border:1px solid rgba(255,255,255,.055);border-radius:.48rem;background:rgba(255,255,255,.014); }
  .doctrines section > div { display:flex;align-items:baseline;justify-content:space-between;gap:.4rem; }
  .doctrines strong { color:#d9edf3;font-size:.62rem; }
  .doctrines small { overflow:hidden;color:#718c97;font-size:.42rem;text-overflow:ellipsis;white-space:nowrap; }
  .doctrines p { margin:.18rem 0;color:var(--dim);font-size:.52rem;line-height:1.35; }
  ul { display:flex;flex-wrap:wrap;gap:.18rem;margin:.28rem 0 0;padding:0;list-style:none; }
  li { padding:.15rem .25rem;color:hsla(var(--realm-hue),62%,80%,.84);border-radius:.22rem;background:hsla(var(--realm-hue),45%,45%,.08);font-size:.45rem; }
  @media (max-width:560px) { summary { align-items:flex-start; }summary > b { display:none; }.doctrines { grid-template-columns:1fr; } }
</style>
