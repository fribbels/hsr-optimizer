import type { UseFormReturnType } from '@mantine/form'
import i18next from 'i18next'
import {
  applyScoringMetadataPresets,
  applySetConditionalPresets,
  applyTeamAwareSetConditionalPresets,
} from 'lib/conditionals/evaluation/applyPresets'
import { Message } from 'lib/interactions/message'
import { defaultSetConditionals } from 'lib/optimization/defaultForm'
import { type BenchmarkSimulationOrchestrator } from 'lib/simulations/orchestrator/benchmarkSimulationOrchestrator'
import { runCustomBenchmarkOrchestrator } from 'lib/simulations/orchestrator/runCustomBenchmarkOrchestrator'
import { getCharacterById } from 'lib/stores/character/characterStore'
import { getScoringMetadata } from 'lib/stores/scoring/scoringStore'
import {
  type BenchmarkForm,
  type SimpleCharacter,
  useBenchmarksTabStore,
} from 'lib/tabs/tabBenchmarks/useBenchmarksTabStore'
import { filterUniqueStringify } from 'lib/utils/arrayUtils'
import { clone, objectHash } from 'lib/utils/objectUtils'
import type { CharacterId } from 'types/character'
import type { LightConeId } from 'types/lightCone'

export type BenchmarkResultWrapper = {
  fullHash: string,
  promise: Promise<BenchmarkSimulationOrchestrator>,
  orchestrator?: BenchmarkSimulationOrchestrator,
}

let customBenchmarkCache: Record<string, BenchmarkSimulationOrchestrator> = {}

export function clearBenchmarkCache() {
  customBenchmarkCache = {}
}

export function handleResetBenchmarks() {
  clearBenchmarkCache()
  useBenchmarksTabStore.getState().resetCache()
}

export function handleBenchmarkFormSubmit(benchmarkForm: BenchmarkForm) {
  const { teammate0, teammate1, teammate2, setResults, storedRelics, storedOrnaments, setLoading, setConditionals } = useBenchmarksTabStore.getState()

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
          setConditionals, // Must be after spread
        }

        const fullHash = objectHash(mergedBenchmarkForm)

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
      .catch((error) => {
        console.error('Benchmark generation failed:', error)
        Message.error(i18next.t('benchmarksTab:Messages.Error.GenerationFailed', 'Benchmark generation failed'))
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
  const t = i18next.getFixedT(null, 'benchmarksTab', 'Messages.Error')
  if (
    invalidSimpleCharacter(benchmarkForm)
    || invalidSimpleCharacter(benchmarkForm.teammate0)
    || invalidSimpleCharacter(benchmarkForm.teammate1)
    || invalidSimpleCharacter(benchmarkForm.teammate2)
  ) {
    Message.error(t('MissingField'), 10)
    return true
  }

  const scoringMetadata = getScoringMetadata(benchmarkForm.characterId)
  const simulationMetadata = scoringMetadata?.simulation
  if (!simulationMetadata) {
    Message.error(t('UnsupportedCharacter'), 10)
    return true
  }

  if (benchmarkForm.basicSpd == null) {
    Message.error(t('SPDUnselected'), 10)
    return true
  }

  return false
}

export function handleCharacterSelectChange(id: CharacterId | null, formInstance: UseFormReturnType<BenchmarkForm>) {
  if (!id) return
  const t = i18next.getFixedT(null, 'benchmarksTab', 'Messages.Error')

  const scoringMetadata = getScoringMetadata(id)
  const simulationMetadata = scoringMetadata?.simulation
  if (!simulationMetadata) {
    return Message.error(t('UnsupportedCharacter'), 10)
  }

  const form = formInstance.getValues()

  const character = getCharacterById(id)
  if (character) {
    form.lightCone = character.form.lightCone ?? null
    form.characterEidolon = character.form.characterEidolon ?? 0
    form.lightConeSuperimposition = character.form.lightConeSuperimposition ?? 1
  } else {
    // Null to force a blank light cone instead of using the previously existing one
    form.lightCone = null as unknown as LightConeId
    form.characterEidolon = 0
    form.lightConeSuperimposition = 1
  }

  form.simRelicSet1 = simulationMetadata.relicSets[0]?.[0]
  form.simRelicSet2 = simulationMetadata.relicSets[0]?.[1]
  form.simOrnamentSet = simulationMetadata.ornamentSets[0]
  form.subDps = !!simulationMetadata.deprioritizeBuffs

  form.setConditionals = clone(defaultSetConditionals)
  applySetConditionalPresets(form)
  applyScoringMetadataPresets(form)

  const state = useBenchmarksTabStore.getState()
  state.updateTeammate(0, simulationMetadata.teammates[0])
  state.updateTeammate(1, simulationMetadata.teammates[1])
  state.updateTeammate(2, simulationMetadata.teammates[2])

  formInstance.setValues(form)
  state.setSetConditionals(form.setConditionals)
}

export function applyTeamAwareSetConditionalPresetsToBenchmarkFormInstance(
  formInstance: UseFormReturnType<BenchmarkForm>,
  teammate0?: SimpleCharacter,
  teammate1?: SimpleCharacter,
  teammate2?: SimpleCharacter,
) {
  // Clone from store (source of truth) - applyTeamAwareSetConditionalPresets mutates
  const currentSetConditionals = clone(useBenchmarksTabStore.getState().setConditionals)
  const form = { ...formInstance.getValues(), setConditionals: currentSetConditionals }

  const teammateIds = [
    teammate0?.characterId,
    teammate1?.characterId,
    teammate2?.characterId,
  ]

  applyTeamAwareSetConditionalPresets(form, teammateIds)

  if (form.setConditionals) {
    useBenchmarksTabStore.getState().setSetConditionals(form.setConditionals)
  }
}
