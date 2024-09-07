import { Character } from 'types/Character'
import { calculateSetNames, calculateSimSets, CharacterMetadata, generateFullDefaultForm, RelicBuild, ScoringMetadata, ScoringParams, SimulationScore, SimulationSets } from 'lib/characterScorer'
import { TsUtils } from 'lib/TsUtils'
import { Form } from 'types/Form'
import { generateParams, OptimizerParams } from 'lib/optimizer/calculateParams'
import { calculateConditionalRegistry, calculateConditionals } from 'lib/optimizer/calculateConditionals'
import { Parts, Stats } from 'lib/constants'
import { convertRelicsToSimulation, runSimulations, Simulation } from 'lib/statSimulationController'
import { StatSimTypes } from 'components/optimizerTab/optimizerForm/StatSimulationDisplay'
import { Relic } from 'types/Relic'

const cachedSims: { [key: string]: SimulationScore } = {}

export function scoreSupportSimulation(
  character: Character,
  relicsByPart: RelicBuild,
  characterMetadata: CharacterMetadata,
  defaultScoringMetadatametada: ScoringMetadata,
): SimulationScore | null {
  const originalForm = character.form
  const characterId = originalForm.characterId
  const characterEidolon = originalForm.characterEidolon
  const lightCone = originalForm.lightCone
  const lightConeSuperimposition = originalForm.lightConeSuperimposition

  const simulationMetadata = defaultScoringMetadatametada.simulation

  const cacheKey = TsUtils.objectHash({
    characterId,
    characterEidolon,
    lightCone,
    lightConeSuperimposition,
    relicsByPart,
    simulationMetadata,
  })

  if (cachedSims[cacheKey]) {
    // console.log('Using cached bestSims')
    return cachedSims[cacheKey]
  }

  const simulationForm: Form = generateFullDefaultForm(characterId, lightCone, characterEidolon, lightConeSuperimposition, false)

  // Cache form/params for reuse
  const cachedOptimizerParams = generateParams(simulationForm)
  calculateConditionalRegistry(simulationForm, cachedOptimizerParams)
  calculateConditionals(simulationForm, cachedOptimizerParams)

  const simulationSets = calculateSimSets(simulationMetadata, relicsByPart)

  const { originalSimResult, originalSim } = simulateOriginalCharacter(
    relicsByPart,
    simulationSets,
    simulationForm,
    cachedOptimizerParams,
    originalScoringParams,
  )

  console.debug({ originalSimResult, originalSim })

  return null
}

function simulateOriginalCharacter(
  displayRelics: RelicBuild,
  simulationSets: SimulationSets,
  simulationForm: Form,
  cachedOptimizerParams: OptimizerParams,
  scoringParams: ScoringParams,
  mainStatMultiplier = 1,
  overwriteSets = false,
) {
  const relicsByPart: RelicBuild = TsUtils.clone(displayRelics)
  Object.values(Parts).forEach((part) => relicsByPart[part].part = part)

  const { relicSetNames, ornamentSetName } = calculateSetNames(relicsByPart)

  const originalSimRequest = convertRelicsToSimulation(
    relicsByPart,
    relicSetNames[0],
    relicSetNames[1],
    ornamentSetName,
    scoringParams.quality,
    scoringParams.speedRollValue,
  )

  if (overwriteSets) {
    const { relicSet1, relicSet2, ornamentSet } = simulationSets

    originalSimRequest.simRelicSet1 = relicSet1
    originalSimRequest.simRelicSet2 = relicSet2
    originalSimRequest.simOrnamentSet = ornamentSet
  }

  const originalSim: Simulation = {
    name: '',
    key: '',
    simType: StatSimTypes.SubstatRolls,
    request: originalSimRequest,
  } as Simulation

  const originalSimResult = runSimulations(
    simulationForm,
    cachedOptimizerParams,
    [originalSim],
    { ...scoringParams, substatRollsModifier: (rolls: number) => rolls, mainStatMultiplier: mainStatMultiplier },
  )[0]

  originalSim.result = originalSimResult
  return {
    originalSimResult,
    originalSim,
  }
}

const benchmarkScoringParams: ScoringParams = {
  quality: 0.8,
  speedRollValue: 2.3,
  substatGoal: 48,
  freeRolls: 2,
  maxPerSub: 30,
  deductionPerMain: 5,
  baselineFreeRolls: 2,
  limitFlatStats: true,
  enforcePossibleDistribution: false,
  substatRollsModifier: substatRollsModifier,
}

const originalScoringParams: ScoringParams = {
  ...benchmarkScoringParams,
  substatRollsModifier: (rolls: number) => rolls,
}

function substatRollsModifier(rolls: number, stat: string, relics: { [key: string]: Relic }) {
  if (stat == Stats.SPD) return rolls
  // Diminishing returns

  const mainsCount = Object.values(relics)
    .filter((x) => x.augmentedStats!.mainStat == stat)
    .length

  const lowerLimit = 12 - 2 * mainsCount
  if (rolls <= lowerLimit) {
    return rolls
  }

  const excess = Math.max(0, rolls - (lowerLimit))
  const diminishedExcess = excess / (Math.pow(excess, 0.25))

  return lowerLimit + diminishedExcess
}
