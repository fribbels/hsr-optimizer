import { FormInstance } from 'antd/es/form/hooks/useForm'
import { Message } from 'lib/interactions/message'
import { cloneWorkerResult } from 'lib/scoring/simScoringUtils'
import { runCustomBenchmarkOrchestrator } from 'lib/simulations/orchestrator/runCustomBenchmarkOrchestrator'
import DB from 'lib/state/db'
import { BenchmarkForm, SimpleCharacter, useBenchmarksTabStore } from 'lib/tabs/tabBenchmarks/UseBenchmarksTabStore'
import { TsUtils } from 'lib/utils/TsUtils'

export function handleBenchmarkFormSubmit(benchmarkForm: BenchmarkForm) {
  const { teammate0, teammate1, teammate2, setResults, currentPartialHash, resetCache } = useBenchmarksTabStore.getState()

  // Merge form and the teammate state management
  const mergedBenchmarkForm: BenchmarkForm = {
    ...benchmarkForm,
    teammate0,
    teammate1,
    teammate2,
  }

  if (invalidBenchmarkForm(mergedBenchmarkForm)) return

  const partialHash = generatePartialHash(mergedBenchmarkForm)
  const fullHash = TsUtils.objectHash(mergedBenchmarkForm)
  if (currentPartialHash && currentPartialHash != partialHash) {
    resetCache()
  }

  console.log('Complete benchmark data:', mergedBenchmarkForm)

  void runCustomBenchmarkOrchestrator(mergedBenchmarkForm)
    .then((orchestrator) => {
      console.log(orchestrator)
      console.log(cloneWorkerResult(orchestrator.perfectionSimResult!))

      setResults(orchestrator, partialHash, fullHash)
    })
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

  if (benchmarkForm.basicSpd == null) {
    Message.error('Select the target benchmark basic SPD', 10)
    return true
  }

  return false
}

// If these fields are different, then benchmarks can't be compared
function generatePartialHash(benchmarkForm: BenchmarkForm) {
  const hashObject = {
    characterId: benchmarkForm.characterId,
    lightCone: benchmarkForm.lightCone,
    characterEidolon: benchmarkForm.characterEidolon,
    lightConeSuperimposition: benchmarkForm.lightConeSuperimposition,
    basicSpd: benchmarkForm.basicSpd,
    errRope: benchmarkForm.errRope,
    teammate0: benchmarkForm.teammate0,
    teammate1: benchmarkForm.teammate1,
    teammate2: benchmarkForm.teammate2,
  }

  return TsUtils.objectHash(hashObject)
}

export function handleCharacterSelectChange(id: string, form: FormInstance<BenchmarkForm>) {
  if (!id) return

  const scoringMetadata = DB.getScoringMetadata(id)
  const simulationMetadata = scoringMetadata?.simulation
  if (!simulationMetadata) {
    return Message.error('DPS benchmarks are not supported for this character', 10)
  }

  const character = DB.getCharacterById(id)
  if (character) {
    form.setFieldsValue({
      lightCone: character.form.lightCone ?? undefined,
      characterEidolon: character.form.characterEidolon ?? 0,
      lightConeSuperimposition: character.form.lightConeSuperimposition ?? 1,
    })
  } else {
    form.setFieldsValue({
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    })
  }

  form.setFieldsValue({
    simRelicSet1: simulationMetadata.relicSets[0]?.[0],
    simRelicSet2: simulationMetadata.relicSets[0]?.[1],
    simOrnamentSet: simulationMetadata.ornamentSets[0],
  })

  const state = useBenchmarksTabStore.getState()
  state.updateTeammate(0, simulationMetadata.teammates[0])
  state.updateTeammate(1, simulationMetadata.teammates[1])
  state.updateTeammate(2, simulationMetadata.teammates[2])
}
