import { Character } from 'types/Character'
import { calculateSetNames, calculateSimSets, CharacterMetadata, generateFullDefaultForm, RelicBuild, ScoringMetadata, ScoringParams, simulateBaselineCharacter, SimulationMetadata, SimulationScore, SimulationSets } from 'lib/characterScorer'
import { TsUtils } from 'lib/TsUtils'
import { Form } from 'types/Form'
import { generateParams, OptimizerParams } from 'lib/optimizer/calculateParams'
import { calculateConditionalRegistry, calculateConditionals } from 'lib/optimizer/calculateConditionals'
import { Constants, Parts, Stats } from 'lib/constants'
import { convertRelicsToSimulation, runSimulations, Simulation, SimulationRequest, SimulationStats } from 'lib/statSimulationController'
import { StatSimTypes } from 'components/optimizerTab/optimizerForm/StatSimulationDisplay'
import { Relic } from 'types/Relic'
import { StatCalculator } from 'lib/statCalculator'
import { StringToNumberMap } from 'types/Common'

const cachedSims: { [key: string]: SimulationScore } = {}

export function scoreSupportSimulation(
  character: Character,
  relicsByPart: RelicBuild,
  characterMetadata: CharacterMetadata,
  defaultScoringMetadata: ScoringMetadata,
): SimulationScore | null {
  const originalForm = character.form
  const characterId = originalForm.characterId
  const characterEidolon = originalForm.characterEidolon
  const lightCone = originalForm.lightCone
  const lightConeSuperimposition = originalForm.lightConeSuperimposition

  const simulationMetadata = defaultScoringMetadata.simulation

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
  // {
  //   "HP": 2.9,
  //   "DEF": 5.6,
  //   "HP%": 4.3,
  //   "DEF%": 0,
  //   "SPD": 8.3077,
  //   "Effect RES": 0,
  //   "Break Effect": 14.2
  // }
  const perfectBuilds = generatePerfectBuilds(
    character,
    relicsByPart,
    characterMetadata,
    defaultScoringMetadata,
    simulationMetadata,
    originalSim,
    simulationForm,
    cachedOptimizerParams,
    simulationSets,
  )

  // Perfection: 54
  // 4.3 + 8.3 + 14.2 = 26.8
  //

  console.log('originalSim', originalSim)
  console.log('stats', originalSim.request.stats)
  console.log(perfectBuilds)

  return {
    type: 'Support',
    percentage: 0,
  }
}

function

function generatePerfectBuilds(
  character: Character,
  relicsByPart: RelicBuild,
  characterMetadata: CharacterMetadata,
  defaultScoringMetadata: ScoringMetadata,
  simulationMetadata: SimulationMetadata,
  originalSim: Simulation,
  simulationForm: Form,
  cachedOptimizerParams: OptimizerParams,
  simulationSets: SimulationSets,
) {
  const build: Partial<SimulationRequest> = {
    simBody: '',
    simFeet: '',
    simPlanarSphere: '',
    simLinkRope: '',
  }
  const stats: SimulationStats = {}

  const metaParts = simulationMetadata.parts
  build.simBody = originalSim.request.simBody in metaParts[Parts.Body] ? originalSim.request.simBody : metaParts[Parts.Body][0]
  build.simFeet = originalSim.request.simFeet in metaParts[Parts.Feet] ? originalSim.request.simFeet : metaParts[Parts.Feet][0]
  build.simPlanarSphere = originalSim.request.simPlanarSphere in metaParts[Parts.PlanarSphere] ? originalSim.request.simPlanarSphere : metaParts[Parts.PlanarSphere][0]
  build.simLinkRope = originalSim.request.simLinkRope in metaParts[Parts.LinkRope] ? originalSim.request.simLinkRope : metaParts[Parts.LinkRope][0]

  const perfectBuilds: SimulationRequest[] = []

  for (const perfectBuildMeta of simulationMetadata.perfection) {
    const perfectBuild = TsUtils.clone(build)

    const { baselineSimResult, baselineSim } = simulateBaselineCharacter(
      relicsByPart,
      simulationForm,
      cachedOptimizerParams,
      simulationSets,
      benchmarkScoringParams,
    )

    const statTracker = {
      [Parts.Head]: simulationMetadata.substats.filter((stat) => stat != Stats.HP).slice(0, 4),
      [Parts.Hands]: simulationMetadata.substats.filter((stat) => stat != Stats.ATK).slice(0, 4),
      [Parts.Body]: simulationMetadata.substats.filter((stat) => stat != build.simBody).slice(0, 4),
      [Parts.Feet]: simulationMetadata.substats.filter((stat) => stat != build.simFeet).slice(0, 4),
      [Parts.PlanarSphere]: simulationMetadata.substats.filter((stat) => stat != build.simPlanarSphere).slice(0, 4),
      [Parts.LinkRope]: simulationMetadata.substats.filter((stat) => stat != build.simLinkRope).slice(0, 4),
    }

    const minimumStatCounts: StringToNumberMap = Object.values(statTracker).flatMap((x) => x).reduce((acc, item) => (acc[item] = (acc[item] || 0) + 1, acc), {})
    Constants.SubStats.map((x) => minimumStatCounts[x] = minimumStatCounts[x] ?? 0)

    const resDiff = Math.max(0, 100 - baselineSimResult.x[Stats.RES] * 100)
    const resRollDiff = resDiff / StatCalculator.getMaxedSubstatValue(Stats.RES) - minimumStatCounts[Stats.RES]

    let remaining = 30
    let resRemaining = resRollDiff
    while (remaining > 0) {
      // TODO: Has to reach the benchmark first
      for (const stat of perfectBuildMeta.stats) {
        if (stat == Stats.RES && resRemaining <= 0) {
          continue
        }

        minimumStatCounts[stat] += 1
        if (stat == Stats.RES) {
          resRemaining -= 1
        }

        remaining -= 1
        break
      }
    }

    console.log(minimumStatCounts)

    perfectBuild.stats = minimumStatCounts
    perfectBuilds.push(perfectBuild as SimulationRequest)
  }

  return perfectBuilds
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
  quality: 1,
  speedRollValue: 2.6,
  substatGoal: 48,
  freeRolls: 2,
  maxPerSub: 30,
  deductionPerMain: 5,
  baselineFreeRolls: 2,
  limitFlatStats: true,
  enforcePossibleDistribution: false,
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
