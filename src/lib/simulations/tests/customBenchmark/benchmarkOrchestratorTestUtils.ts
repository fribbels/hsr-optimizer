import { Stats } from 'lib/constants/constants'
import { runCustomBenchmarkOrchestrator } from 'lib/simulations/orchestrator/runCustomBenchmarkOrchestrator'
import { TestInput } from 'lib/simulations/tests/simTestUtils'
import DB from 'lib/state/db'
import { expect } from 'vitest'

export async function expectBenchmarkResultsToMatch(
  basicSpd: number,
  input: TestInput,
  benchmarkDmg: number,
  perfectionDmg: number,
) {
  globalThis.SEQUENTIAL_BENCHMARKS = true
  const {
    character,
    teammate0,
    teammate1,
    teammate2,
    sets,
    stats,
    mains,
  } = input

  const benchmarkForm = {
    characterId: character.characterId,
    lightCone: character.lightCone,
    characterEidolon: character.characterEidolon,
    lightConeSuperimposition: character.lightConeSuperimposition,
    basicSpd: basicSpd,
    errRope: mains.simLinkRope == Stats.ERR,
    subDps: false,
    simRelicSet1: sets.simRelicSet1,
    simRelicSet2: sets.simRelicSet2,
    simOrnamentSet: sets.simOrnamentSet,
    teammate0: teammate0,
    teammate1: teammate1,
    teammate2: teammate2,
  }
  const orchestrator = await runCustomBenchmarkOrchestrator(benchmarkForm)
  const benchmarkSimScore = orchestrator.benchmarkSimResult?.simScore!
  const perfectionSimScore = orchestrator.perfectionSimResult?.simScore!

  console.log(benchmarkSimScore)
  console.log(perfectionSimScore)

  try {
    expect(benchmarkSimScore).toBeCloseTo(benchmarkDmg, 5)
    expect(perfectionSimScore).toBeCloseTo(perfectionDmg, 5)
  } catch (error: unknown) {
    // @ts-ignore
    const message = error.message
    throw new Error(`
${DB.getMetadata().characters[input.character.characterId].displayName} BENCHMARK
${message}
${JSON.stringify(input, null, 2)}
      `)
  }
}
