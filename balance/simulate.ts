/**
 * Deterministic five-year multi-profile simulator. Run `npm run sim` for the
 * concise current-world audit or `npm run sim -- --json` for the complete
 * machine-readable 168-case artifact.
 */
import {
  runSimulationSuite,
  universeSimulationFixture,
} from './profile-simulator'
import { runAllCurrentPackAudits } from './current-pack-audit'
import {
  buildLawInteractionMatrix,
  detectLawDominance,
  validateLawInteractionMatrix,
} from './law-interaction-matrix'

const suite = runSimulationSuite()
const currentPackAudits = runAllCurrentPackAudits()
const lawMatrix = buildLawInteractionMatrix()
const lawMatrixIssues = validateLawInteractionMatrix(lawMatrix)

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ currentPackAudits, profileSuite: suite, lawMatrix, lawMatrixIssues }, null, 2))
} else {
  console.log(`CURRENT PACK CURVE AUDIT · ${currentPackAudits.length} actual compute profiles`)
  for (const audit of currentPackAudits) {
    console.log(
      `  ${audit.universeId}/${audit.profileId}: earned=${audit.finalEarned} rate=${audit.finalRate}/s purchases=${audit.purchaseCount} firstEpoch=${audit.firstEpochAtMs ?? 'unreached'}ms`,
    )
  }
  console.log('')
  console.log(
    `SIM ${suite.contractVersion} · ${suite.cases.length} cases · ${suite.failedCaseIds.length} numeric/contract failures · ${suite.stalledCaseIds.length} design stalls`,
  )
  console.log(
    `config: numeric=${suite.config.numericContract} rng=${suite.config.rngAlgorithm} horizon=${suite.config.horizonMs}ms step=${suite.config.stepMs}ms`,
  )

  for (const universeId of ['emberlight', 'tidefall', 'verdance', 'clockwork', 'prismata', 'tempest', 'canticle'] as const) {
    const fixture = universeSimulationFixture(universeId)
    console.log(`\n${universeId} (${fixture.source}, base ${fixture.basePassiveRate}/s)`)
    const cases = suite.cases.filter((result) =>
      result.caseId.startsWith(`${universeId}/`)
      && result.caseId.endsWith('/first-visit/no-archive'))
    for (const result of cases) {
      const profileId = result.caseId.split('/')[1]
      const beyond = result.milestones.find((milestone) => milestone.id === 'beyond-number-range')
      console.log(
        `  ${profileId}: 1e309=${beyond?.reachedAtMs ?? 'unreached'}ms final=${result.numericHealth.lastValidAmount} valid=${result.numericHealth.passed}`,
      )
    }
  }

  for (const aggregate of suite.dominance) {
    console.log(
      `build ${aggregate.buildId}: leads ${aggregate.caseIdsLed.length} cases across ${aggregate.profileIdsLed.length} profiles; all-context=${aggregate.dominatesIdleActiveOfflineAndAccessibility}`,
    )
  }
  const dominantLawBuilds = detectLawDominance(lawMatrix).filter((finding) => finding.dominatesEveryContext)
  console.log(`law interaction matrix: ${lawMatrix.length} cases · ${lawMatrixIssues.length} issues · ${dominantLawBuilds.length} all-context dominant builds`)
}

if (suite.failedCaseIds.length > 0 || lawMatrixIssues.length > 0) process.exitCode = 1
