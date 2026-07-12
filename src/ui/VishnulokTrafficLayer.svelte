<script lang="ts">
  import { planVishnulokTraffic } from '../render/tempest/traffic'
  interface Props {
    returningSchoolOwned: number
    shelterReefOwned: number
    reducedMotion: boolean
    quality: 'low' | 'balanced' | 'high'
  }

  let { returningSchoolOwned, shelterReefOwned, reducedMotion, quality }: Props = $props()
  const plan = $derived.by(() => planVishnulokTraffic(returningSchoolOwned, shelterReefOwned, quality))
</script>

<div
  class="vishnulok-traffic"
  aria-hidden="true"
  data-traffic-count={plan.travellers.length}
  data-school-form={plan.schoolForm}
  data-shelter-form={plan.shelterForm}
  data-motion={reducedMotion ? 'static' : 'travelling'}
>
  {#each plan.travellers as traveller (traveller.id)}
    <i
      class="traveller {traveller.kind} form-{traveller.form} route-{traveller.route}"
      data-kind={traveller.kind}
      data-route={traveller.route}
      class:static={reducedMotion}
      style={`--traffic-duration:${traveller.durationSec}s;--traffic-delay:${traveller.phaseSec}s;--rest-x:${traveller.restingX / 10}%;--rest-y:${traveller.restingY / 6.2}%`}
    >
      {#if traveller.kind === 'school'}
        <b class="fish primary"></b>
        {#if traveller.form >= 2}<b class="fish companion"></b>{/if}
        {#if traveller.form >= 3}<b class="fish companion upper"></b>{/if}
        {#if traveller.form >= 4}<span class="wake"></span>{/if}
        {#if traveller.form >= 5}<span class="return-ring"></span>{/if}
      {:else}
        <b class="reef-boat"></b>
        <span class="refuge-arch"></span>
        {#if traveller.form >= 2}<span class="cargo"></span>{/if}
        {#if traveller.form >= 3}<span class="wake"></span>{/if}
        {#if traveller.form >= 4}<span class="lamp"></span>{/if}
        {#if traveller.form >= 5}<span class="escort"></span>{/if}
      {/if}
    </i>
  {/each}
</div>

<style>
  .vishnulok-traffic { position:absolute;inset:0;z-index:2;overflow:hidden;opacity:.74;filter:drop-shadow(0 0 .28rem color-mix(in srgb,var(--gold) 18%,transparent)); }
  .traveller { position:absolute;left:0;top:0;width:2.2rem;height:2.2rem;color:color-mix(in srgb,var(--gold) 72%,#a8c4e5);offset-rotate:auto;animation:traffic-circuit var(--traffic-duration) linear var(--traffic-delay) infinite; }
  .traveller.route-0 { offset-path:ellipse(43% 26% at 50% 56%); }
  .traveller.route-1 { offset-path:ellipse(34% 20% at 50% 59%); }
  .traveller.route-2 { offset-path:ellipse(25% 14% at 50% 61%); }
  .traveller.static { left:var(--rest-x);top:var(--rest-y);animation:none;offset-path:none; }
  .fish { position:absolute;left:.65rem;top:.9rem;width:.72rem;height:.38rem;background:currentColor;clip-path:polygon(0 50%,24% 0,78% 8%,100% 50%,78% 92%,24% 100%); }
  .fish::after { content:'';position:absolute;left:-.32rem;top:.05rem;border:.15rem solid transparent;border-right:.28rem solid currentColor; }
  .fish.companion { left:.95rem;top:1.38rem;transform:scale(.72);opacity:.8; }
  .fish.upper { left:1.05rem;top:.35rem;opacity:.62; }
  .school .wake { position:absolute;left:.08rem;top:.48rem;width:.62rem;height:1.18rem;border-left:1px solid currentColor;border-radius:50%;opacity:.45; }
  .return-ring { position:absolute;inset:.05rem;border:1px dashed currentColor;border-radius:50%;opacity:.3; }
  .shelter { color:color-mix(in srgb,var(--gold) 65%,var(--amber)); }
  .reef-boat { position:absolute;left:.35rem;top:1.05rem;width:1.5rem;height:.55rem;background:currentColor;clip-path:polygon(0 0,100% 0,78% 100%,22% 100%); }
  .refuge-arch { position:absolute;left:.68rem;top:.42rem;width:.84rem;height:.72rem;border:1px solid currentColor;border-bottom:0;border-radius:50% 50% 0 0; }
  .shelter .cargo { position:absolute;left:.85rem;top:.82rem;width:.22rem;height:.22rem;border:1px solid currentColor;box-shadow:.36rem -.08rem 0 -.02rem transparent,.36rem -.08rem 0 0 currentColor; }
  .shelter .wake { position:absolute;left:.15rem;top:1.72rem;width:1.9rem;height:.34rem;border-top:1px solid currentColor;border-radius:50%;opacity:.5; }
  .lamp { position:absolute;left:1.08rem;top:.12rem;width:1px;height:.42rem;background:currentColor;box-shadow:0 0 .34rem color-mix(in srgb,var(--gold) 70%,transparent); }
  .escort { position:absolute;left:0;top:.86rem;width:.34rem;height:.22rem;background:currentColor;clip-path:polygon(0 50%,100% 0,100% 100%);box-shadow:2.18rem 0 currentColor; }
  @keyframes traffic-circuit { from { offset-distance:0%; } to { offset-distance:100%; } }
  :global(.low-quality) .vishnulok-traffic { opacity:.56;filter:none; }
</style>
