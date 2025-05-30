import { FormInstance } from 'antd/es/form/hooks/useForm'
import { Message } from 'lib/interactions/message'
import { defaultSetConditionals } from 'lib/optimization/defaultForm'
import { BenchmarkSimulationOrchestrator } from 'lib/simulations/orchestrator/benchmarkSimulationOrchestrator'
import { runCustomBenchmarkOrchestrator } from 'lib/simulations/orchestrator/runCustomBenchmarkOrchestrator'
import DB from 'lib/state/db'
import { BenchmarkForm, SimpleCharacter, useBenchmarksTabStore } from 'lib/tabs/tabBenchmarks/useBenchmarksTabStore'
import {
  applyScoringMetadataPresets,
  applySetConditionalPresets
} from 'lib/tabs/tabOptimizer/optimizerForm/components/RecommendedPresetsButton'
import { filterUniqueStringify } from 'lib/utils/arrayUtils'
import { TsUtils } from 'lib/utils/TsUtils'
import { CharacterId } from 'types/character'

export type BenchmarkResultWrapper = {
  fullHash: string
  promise: Promise<BenchmarkSimulationOrchestrator>
  orchestrator?: BenchmarkSimulationOrchestrator
}

const customBenchmarkCache: Record<string, BenchmarkSimulationOrchestrator> = {}

export function handleBenchmarkFormSubmit(benchmarkForm: BenchmarkForm) {
  const { teammate0, teammate1, teammate2, setResults, storedRelics, storedOrnaments, setLoading } = useBenchmarksTabStore.getState()

  const validationForm: BenchmarkForm = {
    ...benchmarkForm,
    teammate0,
    teammate1,
    teammate2,
  }
  if (invalidBenchmarkForm(validationForm)) {
    return
  }

  const mergedStoredRelics = filterUniqueStringify([
    ...storedRelics,
    {
      simRelicSet1: benchmarkForm.simRelicSet1,
      simRelicSet2: benchmarkForm.simRelicSet2,
    },
  ])

  const mergedStoredOrnaments = filterUniqueStringify([
    ...storedOrnaments,
    {
      simOrnamentSet: benchmarkForm.simOrnamentSet,
    },
  ])

  setLoading(true)

  setTimeout(() => {
    const promiseWrappers: Record<string, BenchmarkResultWrapper> = {}

    for (const relicsOption of mergedStoredRelics) {
      for (const ornamentsOption of mergedStoredOrnaments) {
        const mergedBenchmarkForm: BenchmarkForm = {
          ...benchmarkForm,
          simRelicSet1: relicsOption.simRelicSet1,
          simRelicSet2: relicsOption.simRelicSet2,
          simOrnamentSet: ornamentsOption.simOrnamentSet,
          teammate0,
          teammate1,
          teammate2,
        }

        const fullHash = TsUtils.objectHash(mergedBenchmarkForm)

        if (customBenchmarkCache[fullHash]) {
          promiseWrappers[fullHash] = {
            fullHash,
            promise: Promise.resolve(customBenchmarkCache[fullHash]),
          }
          continue
        }

        const promise = runCustomBenchmarkOrchestrator(mergedBenchmarkForm)
        promiseWrappers[fullHash] = {
          fullHash,
          promise,
        }
      }
    }

    const promises = Object.values(promiseWrappers).map((wrapper) => wrapper.promise)
    void Promise.all(promises)
      .then(async (results) => {
        for (const wrapper of Object.values(promiseWrappers)) {
          customBenchmarkCache[wrapper.fullHash] = await wrapper.promise
        }

        setResults(results, mergedStoredRelics, mergedStoredOrnaments)
        setLoading(false)
      })
  }, 350)
}

function invalidSimpleCharacter(simpleCharacter?: SimpleCharacter) {
  return simpleCharacter == null
    || simpleCharacter.characterId == null
    || simpleCharacter.characterEidolon == null
    || simpleCharacter.lightCone == null
    || simpleCharacter.lightConeSuperimposition == null
}

function invalidBenchmarkForm(benchmarkForm: BenchmarkForm) {
  if (invalidSimpleCharacter(benchmarkForm)
    || invalidSimpleCharacter(benchmarkForm.teammate0)
    || invalidSimpleCharacter(benchmarkForm.teammate1)
    || invalidSimpleCharacter(benchmarkForm.teammate2)
  ) {
    Message.error('Missing character/lightcone/teammates', 10)
    return true
  }

  const scoringMetadata = DB.getScoringMetadata(benchmarkForm.characterId)
  const simulationMetadata = scoringMetadata?.simulation
  if (!simulationMetadata) {
    Message.error('DPS benchmarks are not supported for this character', 10)
    return true
  }

  if (benchmarkForm.basicSpd == null) {
    Message.error('Select the target benchmark basic SPD', 10)
    return true
  }

  return false
}

export function handleCharacterSelectChange(id: CharacterId | null | undefined, formInstance: FormInstance<BenchmarkForm>) {
  if (!id) return

  const scoringMetadata = DB.getScoringMetadata(id)
  const simulationMetadata = scoringMetadata?.simulation
  if (!simulationMetadata) {
    return Message.error('DPS benchmarks are not supported for this character', 10)
  }

  const form = formInstance.getFieldsValue()

  const character = DB.getCharacterById(id)
  if (character) {
    form.lightCone = character.form.lightCone ?? undefined
    form.characterEidolon = character.form.characterEidolon ?? 0
    form.lightConeSuperimposition = character.form.lightConeSuperimposition ?? 1
  } else {
    form.characterEidolon = 0
    form.lightConeSuperimposition = 1
  }

  form.simRelicSet1 = simulationMetadata.relicSets[0]?.[0]
  form.simRelicSet2 = simulationMetadata.relicSets[0]?.[1]
  form.simOrnamentSet = simulationMetadata.ornamentSets[0]
  form.subDps = !!simulationMetadata.deprioritizeBuffs

  form.setConditionals = TsUtils.clone(defaultSetConditionals)
  applySetConditionalPresets(form)
  applyScoringMetadataPresets(form)

  const state = useBenchmarksTabStore.getState()
  state.updateTeammate(0, simulationMetadata.teammates[0])
  state.updateTeammate(1, simulationMetadata.teammates[1])
  state.updateTeammate(2, simulationMetadata.teammates[2])

  formInstance.setFieldsValue(form)
}
