// @vitest-environment jsdom
import { JingYuan } from 'lib/conditionals/character/1200/JingYuan'
import { Acheron } from 'lib/conditionals/character/1300/Acheron'
import { defaultSetConditionals } from 'lib/optimization/defaultForm'
import { runCustomBenchmarkOrchestrator } from 'lib/simulations/orchestrator/runCustomBenchmarkOrchestrator'
import { Metadata } from 'lib/state/metadataInitializer'
import {
  clearBenchmarkCache,
  handleBenchmarkFormSubmit,
} from 'lib/tabs/tabBenchmarks/benchmarksTabController'
import {
  type BenchmarkForm,
  type SimpleCharacterSets,
  useBenchmarksTabStore,
} from 'lib/tabs/tabBenchmarks/useBenchmarksTabStore'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

vi.mock('lib/simulations/orchestrator/runCustomBenchmarkOrchestrator', () => ({
  runCustomBenchmarkOrchestrator: vi.fn().mockResolvedValue({}),
}))

Metadata.initialize()

beforeEach(() => {
  vi.useFakeTimers()
  vi.clearAllMocks()
  clearBenchmarkCache()
  useBenchmarksTabStore.setState(useBenchmarksTabStore.getInitialState())
})

afterEach(() => {
  vi.useRealTimers()
  clearBenchmarkCache()
})

function makeFixture() {
  const teammate: SimpleCharacterSets = {
    characterId: JingYuan.id,
    characterEidolon: 0,
    characterEx: 0,
    lightCone: JingYuan.defaultLightCone,
    lightConeSuperimposition: 1,
  }
  for (const index of [0, 1, 2]) useBenchmarksTabStore.getState().updateTeammate(index, teammate)
  const form: BenchmarkForm = {
    characterId: Acheron.id,
    characterEidolon: 0,
    characterEx: 0,
    lightCone: Acheron.defaultLightCone,
    lightConeSuperimposition: 1,
    basicSpd: 134,
    errRope: false,
    subDps: false,
    setConditionals: defaultSetConditionals,
  }
  return { form, teammate }
}

async function submit(form: BenchmarkForm) {
  handleBenchmarkFormSubmit(form)
  await vi.runAllTimersAsync()
}

describe('benchmark submission EX cache semantics', () => {
  it('reuses EX-off results after unchanged teammate modal saves', async () => {
    const { form, teammate } = makeFixture()
    await submit(form)
    await submit(form)
    expect(runCustomBenchmarkOrchestrator).toHaveBeenCalledTimes(1)
    await submit({ ...form, characterEx: 0 })
    expect(runCustomBenchmarkOrchestrator).toHaveBeenCalledTimes(1)

    for (const index of [0, 1, 2]) {
      const store = useBenchmarksTabStore.getState()
      store.setSelectedTeammateIndex(index)
      store.onCharacterModalOk({ ...teammate, characterEx: 0 })
      await submit(form)
      expect(runCustomBenchmarkOrchestrator).toHaveBeenCalledTimes(1)
    }
  })

  it('separates main and every teammate EX1 result while reusing the off result', async () => {
    const { form, teammate } = makeFixture()
    await submit(form)
    await submit({ ...form, characterEx: 1 })
    expect(runCustomBenchmarkOrchestrator).toHaveBeenCalledTimes(2)
    await submit(form)
    expect(runCustomBenchmarkOrchestrator).toHaveBeenCalledTimes(2)

    for (const index of [0, 1, 2]) {
      useBenchmarksTabStore.getState().updateTeammate(index, { ...teammate, characterEx: 1 })
      await submit(form)
      expect(runCustomBenchmarkOrchestrator).toHaveBeenCalledTimes(index + 3)
      useBenchmarksTabStore.getState().updateTeammate(index, { ...teammate, characterEx: 0 })
      await submit(form)
      expect(runCustomBenchmarkOrchestrator).toHaveBeenCalledTimes(index + 3)
    }
  })

  it('keeps caller form and stored teammate ownership unchanged', async () => {
    const { form, teammate } = makeFixture()
    Object.freeze(form)
    Object.freeze(teammate)
    await submit(form)
    expect(runCustomBenchmarkOrchestrator).toHaveBeenCalledTimes(1)
    expect(form.characterEx).toBe(0)
    expect(teammate.characterEx).toBe(0)
    const store = useBenchmarksTabStore.getState()
    expect(store.teammate0).toBe(teammate)
    expect(store.teammate1).toBe(teammate)
    expect(store.teammate2).toBe(teammate)
    expect(vi.mocked(runCustomBenchmarkOrchestrator).mock.calls[0][0].characterEx).toBe(0)
  })
})
