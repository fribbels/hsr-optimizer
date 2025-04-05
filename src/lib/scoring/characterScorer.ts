import { CharacterConditionalsResolver } from 'lib/conditionals/resolver/characterConditionalsResolver'
import { LightConeConditionalsResolver } from 'lib/conditionals/resolver/lightConeConditionalsResolver'
import { Parts } from 'lib/constants/constants'
import { getDefaultForm } from 'lib/optimization/defaultForm'
import { calculateSetNames, scoreCharacterSimulation } from 'lib/scoring/dpsScore'
import { RelicBuild, ScoringParams, SimulationFlags, SimulationResult, SimulationScore } from 'lib/scoring/simScoringUtils'
import { convertRelicsToSimulation, runSimulations, Simulation } from 'lib/simulations/statSimulationController'
import DB from 'lib/state/db'
import { generateConditionalResolverMetadata } from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import { StatSimTypes } from 'lib/tabs/tabOptimizer/optimizerForm/components/StatSimulationDisplay'
import { TsUtils } from 'lib/utils/TsUtils'
import { Utils } from 'lib/utils/utils'
import { Character } from 'types/character'
import { CharacterConditionalsController, LightConeConditionalsController } from 'types/conditionals'
import { Form } from 'types/form'
import { ShowcaseTemporaryOptions } from 'types/metadata'
import { OptimizerContext } from 'types/optimizer'

export type AsyncSimScoringExecution = {
  done: boolean
  result: SimulationScore | null
  promise: Promise<SimulationScore | null>
}

export function getShowcaseSimScoringExecution(
  character: Character,
  displayRelics: RelicBuild,
  teamSelection: string,
  showcaseTemporaryOptions: ShowcaseTemporaryOptions = {},
): AsyncSimScoringExecution {
  console.log('Start async')

  const asyncResult: AsyncSimScoringExecution = {
    done: false,
    result: null,
    promise: null as any,
  }

  async function runSimulation() {
    console.log('Executing async operation')

    try {
      const characterMetadata = DB.getMetadata().characters[character.id]

      const simulationScore = await scoreCharacterSimulation(
        character,
        displayRelics,
        teamSelection,
        showcaseTemporaryOptions,
        characterMetadata.scoringMetadata,
        DB.getScoringMetadata(character.id),
      )

      console.log('DONE', simulationScore)

      simulationScore.characterMetadata = characterMetadata

      asyncResult.result = simulationScore
      asyncResult.done = true

      return simulationScore
    } catch (error) {
      console.error('Error in simulation:', error)
      asyncResult.done = true
      throw error
    }
  }

  asyncResult.promise = runSimulation()

  console.log('Return async')
  return asyncResult
}

export type SimulationStatUpgrade = {
  simulation: Simulation
  simulationResult: SimulationResult
  part?: string
  stat?: string
  percent?: number
}

export function generateFullDefaultForm(
  characterId: string,
  lightCone: string,
  characterEidolon: number,
  lightConeSuperimposition: number,
  teammate = false,
): Form {
  // @ts-ignore
  if (!characterId) return null

  const dbMetadata = DB.getMetadata()

  const simulationForm: Form = getDefaultForm({ id: characterId })

  simulationForm.characterId = characterId
  simulationForm.characterEidolon = characterEidolon
  simulationForm.lightCone = lightCone
  simulationForm.lightConeSuperimposition = lightConeSuperimposition

  simulationForm.characterConditionals = {}
  simulationForm.lightConeConditionals = {}

  const characterConditionalsRequest = { characterId: characterId, characterEidolon: characterEidolon }
  const lightConeConditionalsRequest = generateConditionalResolverMetadata(simulationForm, dbMetadata)

  const characterConditionals: CharacterConditionalsController = CharacterConditionalsResolver.get(characterConditionalsRequest)
  const lightConeConditionals: LightConeConditionalsController = LightConeConditionalsResolver.get(lightConeConditionalsRequest)

  if (teammate) {
    if (characterConditionals.teammateDefaults) Utils.mergeUndefinedValues(simulationForm.characterConditionals, characterConditionals.teammateDefaults())
    if (lightConeConditionals.teammateDefaults) Utils.mergeUndefinedValues(simulationForm.lightConeConditionals, lightConeConditionals.teammateDefaults())
  } else {
    if (characterConditionals.defaults) Utils.mergeUndefinedValues(simulationForm.characterConditionals, characterConditionals.defaults())
    if (lightConeConditionals.defaults) Utils.mergeUndefinedValues(simulationForm.lightConeConditionals, lightConeConditionals.defaults())
  }

  const simulationMetadata = DB.getMetadata().characters[characterId].scoringMetadata?.simulation
  if (simulationMetadata) {
    simulationForm.comboAbilities = [...simulationMetadata.comboAbilities]
    simulationForm.comboDot = simulationMetadata.comboDot
    simulationForm.comboBreak = simulationMetadata.comboBreak
  } else {
    // @ts-ignore
    simulationForm.comboAbilities = [null, 'BASIC']
    simulationForm.comboDot = 0
    simulationForm.comboBreak = 0
  }

  return simulationForm
}

// TODO: why is this function used twice
export function simulateOriginalCharacter(
  displayRelics: RelicBuild,
  simulationSets: SimulationSets,
  simulationForm: Form,
  context: OptimizerContext,
  scoringParams: ScoringParams,
  simulationFlags: SimulationFlags,
  mainStatMultiplier = 1,
  overwriteSets = false,
): { originalSimResult: SimulationResult; originalSim: Simulation } {
  const relicsByPart: RelicBuild = TsUtils.clone(displayRelics)
  Object.values(Parts).forEach((part) => relicsByPart[part].part = part)

  const { relicSetNames, ornamentSetName } = calculateSetNames(relicsByPart)

  const originalSimRequest = convertRelicsToSimulation(relicsByPart, relicSetNames[0], relicSetNames[1], ornamentSetName, scoringParams.quality, scoringParams.speedRollValue)

  if (overwriteSets) {
    const { relicSet1, relicSet2, ornamentSet } = simulationSets

    originalSimRequest.simRelicSet1 = relicSet1
    originalSimRequest.simRelicSet2 = relicSet2
    originalSimRequest.simOrnamentSet = ornamentSet
  }

  // @ts-ignore
  const originalSim: Simulation = {
    name: '',
    key: '',
    simType: StatSimTypes.SubstatRolls,
    request: originalSimRequest,
  } as Simulation

  const originalSimResult = runSimulations(simulationForm, context, [originalSim], {
    ...scoringParams,
    substatRollsModifier: (rolls: number) => rolls,
    mainStatMultiplier: mainStatMultiplier,
    simulationFlags: simulationFlags,
  })[0]

  originalSim.result = originalSimResult
  return {
    originalSimResult,
    originalSim,
  }
}

