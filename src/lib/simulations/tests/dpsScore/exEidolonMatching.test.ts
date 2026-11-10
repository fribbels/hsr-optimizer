// @vitest-environment jsdom
import { ImbibitorLunae } from 'lib/conditionals/character/1200/ImbibitorLunae'
import { JingYuan } from 'lib/conditionals/character/1200/JingYuan'
import { Acheron } from 'lib/conditionals/character/1300/Acheron'
import {
  DEFAULT_TEAM,
  Parts,
  Sets,
  Stats,
} from 'lib/constants/constants'
import { GlobalRegister } from 'lib/optimization/engine/config/keys'
import { normalizeSimulationMetadata } from 'lib/scoring/normalizeScoringMetadata'
import { initializeContextConditionals } from 'lib/simulations/contextConditionals'
import {
  getTeammates,
  prepareOrchestrator,
} from 'lib/simulations/orchestrator/runDpsScoreBenchmarkOrchestrator'
import { runStatSimulations } from 'lib/simulations/statSimulation'
import {
  generateTestSingleRelicsByPart,
  testMains,
  testSets,
  testStatSpread,
} from 'lib/simulations/tests/simTestUtils'
import { generateFullDefaultForm } from 'lib/simulations/utils/benchmarkForm'
import { Metadata } from 'lib/state/metadataInitializer'
import { clone } from 'lib/utils/objectUtils'
import type {
  ComputeOptimalSimulationPhase,
  ComputeOptimalSimulationSearchRunner,
} from 'lib/worker/computeOptimalSimulationWorkerRunner'
import { ExEidolon } from 'types/character'
import { ScoringConfigType } from 'types/metadata'
import {
  BuildSource,
  type CharacterSavedBuild,
} from 'types/savedBuild'
import {
  expect,
  test,
} from 'vitest'

Metadata.initialize()

function metadataForTest() {
  const metadata = Acheron.scoring.simulation
  if (!metadata) throw new Error('Missing Acheron simulation')
  const simulation = normalizeSimulationMetadata(clone(metadata))
  simulation.parts = {
    [Parts.Body]: [Stats.CD],
    [Parts.Feet]: [Stats.ATK_P],
    [Parts.PlanarSphere]: [Stats.Lightning_DMG],
    [Parts.LinkRope]: [Stats.ATK_P],
  }
  simulation.relicSets = [[Sets.MusketeerOfWildWheat, Sets.MusketeerOfWildWheat]]
  simulation.ornamentSets = [Sets.RutilantArena]
  simulation.teammates = [
    {
      characterId: JingYuan.id,
      characterEidolon: 0,
      characterEx: ExEidolon.EX1,
      lightCone: JingYuan.defaultLightCone,
      lightConeSuperimposition: 1,
    },
    {
      characterId: ImbibitorLunae.id,
      characterEidolon: 0,
      characterEx: 0,
      lightCone: ImbibitorLunae.defaultLightCone,
      lightConeSuperimposition: 1,
    },
  ]
  return simulation
}

test.each([0, ExEidolon.EX1])('original, baseline, benchmark, and maximum use matching main/teammate EX (%s)', async (mask) => {
  const form = generateFullDefaultForm(Acheron.id, Acheron.defaultLightCone, 0, 1, false, mask)
  const metadata = metadataForTest()
  const relics = generateTestSingleRelicsByPart(
    testSets(Sets.MusketeerOfWildWheat, Sets.MusketeerOfWildWheat, Sets.RutilantArena),
    testMains(Stats.CD, Stats.ATK_P, Stats.Lightning_DMG, Stats.ATK_P),
    testStatSpread(0),
  )
  const orchestrator = prepareOrchestrator({ form }, { configType: ScoringConfigType.DPS, simulation: metadata }, relics, {})
  if (!orchestrator.form || !orchestrator.context) throw new Error('Orchestrator not prepared')
  expect(orchestrator.form.characterEx).toBe(mask)
  expect(orchestrator.form.teammate0.characterEx).toBe(ExEidolon.EX1)
  expect(orchestrator.form.teammate1.characterEx).toBe(0)
  expect(orchestrator.originalSimResult?.actionDamage?.FUA ?? 0).toBeGreaterThanOrEqual(0)
  expect((orchestrator.originalSimResult?.actionDamage?.FUA ?? 0) > 0).toBe(mask !== 0)
  expect((orchestrator.baselineSimResult?.actionDamage?.FUA ?? 0) > 0).toBe(mask !== 0)

  // Exercise both handoffs with real CPU evaluation of each candidate. The search
  // itself is deliberately replaced so this regression stays small and fast.
  const phases: ComputeOptimalSimulationPhase[] = []
  const runner: ComputeOptimalSimulationSearchRunner = async (input, runnerContext) => {
    phases.push(runnerContext.phase)
    expect(input.simulationForm.characterEx).toBe(mask)
    expect(input.context.characterEx).toBe(mask)
    expect(input.context.teammate0Metadata.characterEx).toBe(ExEidolon.EX1)
    expect(input.context.teammate1Metadata.characterEx).toBe(0)
    expect(input.metadata.teammates.map((member) => member.characterEx)).toEqual([ExEidolon.EX1, 0])
    const context = clone(input.context)
    initializeContextConditionals(context)
    const simulation = clone(input.partialSimulationWrapper.simulation)
    simulation.result = runStatSimulations([simulation], input.simulationForm, context, {
      ...input.scoringParams,
      simulationFlags: input.simulationFlags,
    })[0]
    expect(Number.isFinite(simulation.result.x.getGlobalRegisterValue(GlobalRegister.COMBO_DMG))).toBe(true)
    return { simulation }
  }
  await orchestrator.calculateBenchmark(clone(orchestrator.context), runner)
  await orchestrator.calculatePerfection(clone(orchestrator.context), runner)
  expect(phases).toContain('benchmark')
  expect(phases).toContain('perfection')
  expect(Number.isFinite(orchestrator.benchmarkSimScore)).toBe(true)
  expect(Number.isFinite(orchestrator.perfectionSimScore)).toBe(true)
})

test('saved-team scoring retains EX, while old snapshots use zero', () => {
  const simulation = metadataForTest()
  const build: CharacterSavedBuild = {
    name: 'EX saved team',
    source: BuildSource.Character,
    characterId: Acheron.id,
    characterEidolon: 0,
    characterEx: ExEidolon.EX1,
    lightCone: Acheron.defaultLightCone,
    lightConeSuperimposition: 1,
    equipped: {},
    team: [
      {
        ...simulation.teammates[0],
        teamRelicSet: undefined,
        teamOrnamentSet: undefined,
      },
      {
        characterId: ImbibitorLunae.id,
        characterEidolon: 0,
        characterEx: 0,
        lightCone: ImbibitorLunae.defaultLightCone,
        lightConeSuperimposition: 1,
        teamRelicSet: undefined,
        teamOrnamentSet: undefined,
      },
      null,
    ],
  }
  expect(
    getTeammates(DEFAULT_TEAM, simulation.teammates, simulation.teammates, build)
      .map((member) => member.characterEx),
  ).toEqual([ExEidolon.EX1, 0])
})
