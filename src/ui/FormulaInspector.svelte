<script lang="ts">
  import {
    validateFormulaBreakdown,
    type FormulaBreakdown,
  } from '../core/numeric/formula-breakdown'
  import {
    formulaDisplayRows,
    formulaOperatorSymbol,
    formulaValueText,
  } from './formula-inspector-model'

  let { breakdowns }: { breakdowns: readonly FormulaBreakdown[] } = $props()
  let activeId = $state('')
  const active = $derived(breakdowns.find((breakdown) => breakdown.formulaId === activeId) ?? breakdowns[0])
  const issues = $derived(active ? validateFormulaBreakdown(active) : [])
  const rows = $derived(active && issues.length === 0 ? formulaDisplayRows(active.root) : [])
  const subjectLabel = (breakdown: FormulaBreakdown) => breakdown.subject.kind === 'click' ? 'Click power' : 'Passive rate'
</script>

{#if active}
  <section class="formula-inspector" aria-labelledby="formula-title">
    <div class="formula-head">
      <div>
        <span>exact numeric sources</span>
        <h3 id="formula-title">Formula Inspector</h3>
      </div>
      <strong>{formulaValueText(active.result)}</strong>
    </div>
    <div class="formula-tabs" role="tablist" aria-label="Formula to inspect">
      {#each breakdowns as breakdown (breakdown.formulaId)}
        <button
          type="button"
          role="tab"
          aria-selected={active.formulaId === breakdown.formulaId}
          class:active={active.formulaId === breakdown.formulaId}
          onclick={() => (activeId = breakdown.formulaId)}
        >{subjectLabel(breakdown)}</button>
      {/each}
    </div>
    {#if issues.length > 0}
      <p class="formula-error">Formula unavailable: {issues[0].message}</p>
    {:else}
      <div class="formula-tree">
        {#each rows as row (row.node.id)}
          <div class="formula-row" class:operation={row.node.kind === 'operation'} style:--depth={row.depth}>
            <span class="formula-mark">
              {row.node.kind === 'operation' ? formulaOperatorSymbol(row.node.operator) : '·'}
            </span>
            <span class="formula-label">
              <strong>{row.node.kind === 'operation' ? row.node.label : row.node.source.label}</strong>
              {#if row.node.kind === 'term' && row.node.detail}<small>{row.node.detail}</small>{/if}
            </span>
            <span class="formula-value">{formulaValueText(row.node.kind === 'operation' ? row.node.result : row.node.value)}</span>
          </div>
        {/each}
      </div>
    {/if}
  </section>
{/if}

<style>
  .formula-inspector {
    margin: 1rem 0 0;
    padding-top: 0.9rem;
    border-top: 1px solid rgba(255, 255, 255, 0.07);
  }
  .formula-head {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 0.7rem;
  }
  .formula-head span {
    display: block;
    font-size: 0.52rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--dim);
  }
  .formula-head h3 { margin: 0.12rem 0 0; }
  .formula-head > strong {
    color: var(--gold);
    font-variant-numeric: tabular-nums;
  }
  .formula-tabs {
    display: flex;
    gap: 0.35rem;
    margin: 0.65rem 0;
  }
  .formula-tabs button {
    padding: 0.28rem 0.55rem;
    color: var(--dim);
    background: rgba(255, 255, 255, 0.035);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 999px;
    font: inherit;
    font-size: 0.66rem;
    cursor: pointer;
  }
  .formula-tabs button.active {
    color: var(--gold);
    border-color: rgba(255, 179, 92, 0.35);
  }
  .formula-tree {
    max-height: 18rem;
    overflow: auto;
    padding: 0.2rem 0;
    scrollbar-width: thin;
  }
  .formula-row {
    display: grid;
    grid-template-columns: 1.2rem minmax(0, 1fr) auto;
    align-items: center;
    gap: 0.35rem;
    min-height: 1.65rem;
    padding-left: calc(var(--depth) * 0.7rem);
    border-bottom: 1px solid rgba(255, 255, 255, 0.025);
    font-size: 0.66rem;
  }
  .formula-row.operation { color: rgba(225, 222, 242, 0.94); }
  .formula-mark { color: rgba(255, 190, 110, 0.62); text-align: center; }
  .formula-label { min-width: 0; }
  .formula-label strong,
  .formula-label small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .formula-label strong { font-weight: 550; }
  .formula-label small { color: var(--dim); font-size: 0.57rem; }
  .formula-value { color: #d8d2ff; font-variant-numeric: tabular-nums; }
  .formula-error { color: #ffb39b; font-size: 0.7rem; }
</style>
