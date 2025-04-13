import { CUSTOM_TEAM, Parts, Sets, Stats, SubStats } from 'lib/constants/constants'
import { SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import { ComputedStatsArray, ComputedStatsArrayCore, Key } from 'lib/optimization/computedStatsArray'
import { generateContext } from 'lib/optimization/context/calculateContext'
import { calculateSetNames, calculateSimSets, SimulationSets } from 'lib/scoring/dpsScore'
import { calculateMaxSubstatRollCounts, calculateMinSubstatRollCounts } from 'lib/scoring/rollCounter'
import {
  applyScoringFunction,
  baselineScoringParams,
  benchmarkScoringParams,
  invertDiminishingReturnsSpdFormula,
  maximumScoringParams,
  originalScoringParams,
  PartialSimulationWrapper,
  simSorter,
  SimulationFlags,
  SimulationScore,
  spdRollsCap,
} from 'lib/scoring/simScoringUtils'
import { generatePartialSimulations } from 'lib/simulations/new/benchmarks/simulateBenchmarkBuild'
import { generateStatImprovements, SimulationStatUpgrade } from 'lib/simulations/new/scoringUpgrades'
import { runStatSimulations } from 'lib/simulations/new/statSimulation'
import { RunSimulationsParams, RunStatSimulationsResult, Simulation, SimulationRequest, StatSimTypes } from 'lib/simulations/new/statSimulationTypes'
import { generateFullDefaultForm } from 'lib/simulations/new/utils/benchmarkForm'
import { applySpeedFlags, calculateTargetSpeedNew } from 'lib/simulations/new/utils/benchmarkSpeedTargets'
import { transformWorkerContext } from 'lib/simulations/new/workerContextTransform'
import { runComputeOptimalSimulationWorker } from 'lib/simulations/new/workerPool'
import { convertRelicsToSimulation } from 'lib/simulations/statSimulationController'
import DB from 'lib/state/db'
import { TsUtils } from 'lib/utils/TsUtils'
import { ComputeOptimalSimulationRunnerInput, ComputeOptimalSimulationRunnerOutput } from 'lib/worker/computeOptimalSimulationWorkerRunner'
import { Character } from 'types/character'
import { Form, OptimizerForm } from 'types/form'
import { ShowcaseTemporaryOptions, SimulationMetadata } from 'types/metadata'
import { OptimizerContext } from 'types/optimizer'

/*
 TODO: Caching

 const cachedComputedStatsArray = new ComputedStatsArrayCore(false) as ComputedStatsArray
 const cachedBasicStatsArray = new BasicStatsArrayCore(false) as BasicStatsArray

 const cachedSims: {
 [key: string]: SimulationScore
 } = {}

 const cacheKey = TsUtils.objectHash({
 traces,
 characterId,
 characterEidolon,
 lightCone,
 lightConeSuperimposition,
 relicsByPart,
 metadata,
 customMetadata,
 showcaseTemporaryOptions,
 })

 if (cachedSims[cacheKey]) {
 return cachedSims[cacheKey]
 }

 */

export async function runOrchestrator(
  character: Character,
  simulationMetadata: SimulationMetadata,
  singleRelicByPart: SingleRelicByPart,
  showcaseTemporaryOptions: ShowcaseTemporaryOptions,
) {
  const orchestrator = new DpsScoreBenchmarkOrchestrator(simulationMetadata)

  orchestrator.setMetadata()
  orchestrator.setOriginalSimRequest(singleRelicByPart)
  orchestrator.setSimSets()
  orchestrator.setFlags()
  orchestrator.setSimForm(character.form)
  orchestrator.setBaselineBuild()
  orchestrator.setOriginalBuild(showcaseTemporaryOptions.spdBenchmark)

  await orchestrator.calculateBenchmark()
  await orchestrator.calculatePerfection()

  orchestrator.calculateScores()
  orchestrator.calculateUpgrades()
  orchestrator.calculateResults()

  return orchestrator
}

export function resolveDpsScoreSimulationMetadata(
  character: Character,
  teamSelection: string,
) {
  const characterId = character.id
  const form = character.form

  if (!character?.id || !form) {
    console.log('Invalid character sim setup')
    return null
  }

  const customScoringMetadata = TsUtils.clone(DB.getScoringMetadata(characterId))
  const defaultScoringMetadata = TsUtils.clone(DB.getMetadata().characters[characterId].scoringMetadata)

  if (!defaultScoringMetadata?.simulation || !customScoringMetadata?.simulation) {
    console.log('No scoring sim defined for this character')
    return null
  }

  // Merge any necessary configs from the custom metadata

  const metadata = defaultScoringMetadata.simulation
  metadata.teammates = teamSelection == CUSTOM_TEAM ? customScoringMetadata.simulation.teammates : defaultScoringMetadata.simulation.teammates
  metadata.deprioritizeBuffs = customScoringMetadata.simulation.deprioritizeBuffs ?? false

  console.debug(customScoringMetadata)
  console.debug(defaultScoringMetadata)

  return metadata
}

export class DpsScoreBenchmarkOrchestrator {
  public metadata: SimulationMetadata
  public flags: SimulationFlags
  public simSets?: SimulationSets
  public form?: OptimizerForm
  public context?: OptimizerContext
  public spdBenchmark?: number
  public targetSpd?: number
  public originalSpd?: number

  public baselineSim?: Simulation
  public baselineSimRequest?: SimulationRequest
  public baselineSimResult?: RunStatSimulationsResult

  public originalSim?: Simulation
  public originalSimRequest?: SimulationRequest
  public originalSimResult?: RunStatSimulationsResult

  public benchmarkSimRequest?: SimulationRequest
  public benchmarkSimResult?: RunStatSimulationsResult
  public benchmarkSimCandidates?: Simulation[]

  public perfectionSimRequest?: SimulationRequest
  public perfectionSimResult?: RunStatSimulationsResult
  public perfectionSimCandidates?: Simulation[]

  public substatUpgradeResults?: SimulationStatUpgrade[]
  public setUpgradeResults?: SimulationStatUpgrade[]
  public mainUpgradeResults?: SimulationStatUpgrade[]

  public percent?: number
  public simulationScore?: SimulationScore

  constructor(metadata: SimulationMetadata) {
    this.metadata = metadata
    this.flags = {
      overcapCritRate: false,
      simPoetActive: false,
      characterPoetActive: false,
      forceErrRope: false,
      forceBasicSpd: true,
      forceBasicSpdValue: 0,
    }
  }

  public setMetadata() {
    const metadata = this.metadata
    const substats: string[] = metadata.substats
    let addBreakEffect = false

    if (metadata.comboBreak > 0) {
      // Add break if the combo uses it
      addBreakEffect = true
    }
    if (metadata.teammates.find((x) => x.characterId == '8005' || x.characterId == '8006' || x.characterId == '1225')) {
      // Add break if the harmony trailblazer | fugue is on the team
      addBreakEffect = true
    }
    if (addBreakEffect && !substats.includes(Stats.BE)) {
      substats.push(Stats.BE)
    }
    if (addBreakEffect && !metadata.parts[Parts.LinkRope].includes(Stats.BE)) {
      metadata.parts[Parts.LinkRope].push(Stats.BE)
    }
    if (addBreakEffect
      && !metadata.relicSets.find((sets) =>
        sets[0] == sets[1] && sets[1] == Sets.IronCavalryAgainstTheScourge)) {
      metadata.relicSets.push([Sets.IronCavalryAgainstTheScourge, Sets.IronCavalryAgainstTheScourge])
    }
    if (addBreakEffect
      && !metadata.relicSets.find((sets) =>
        sets[0] == sets[1] && sets[1] == Sets.IronCavalryAgainstTheScourge)) {
      metadata.relicSets.push([Sets.IronCavalryAgainstTheScourge, Sets.IronCavalryAgainstTheScourge])
    }
    if (addBreakEffect
      && !metadata.ornamentSets.find((set) => set == Sets.TaliaKingdomOfBanditry)) {
      metadata.ornamentSets.push(Sets.TaliaKingdomOfBanditry)
    }
    if (addBreakEffect
      && !metadata.ornamentSets.find((set) => set == Sets.ForgeOfTheKalpagniLantern)) {
      metadata.ornamentSets.push(Sets.ForgeOfTheKalpagniLantern)
    }
  }

  public setFlags() {
    const form = this.form!
    const metadata = this.metadata
    const originalSimRequest = this.originalSimRequest!
    const simSets = this.simSets!

    if (metadata.teammates.find((teammate) => teammate.characterId == '1313' && teammate.characterEidolon == 6)) {
      this.flags.overcapCritRate = true
    }
    if (originalSimRequest.simRelicSet1 == Sets.PoetOfMourningCollapse && originalSimRequest.simRelicSet2 == Sets.PoetOfMourningCollapse) {
      this.flags.characterPoetActive = true
    }
    if (simSets.relicSet1 == Sets.PoetOfMourningCollapse && simSets.relicSet2 == Sets.PoetOfMourningCollapse) {
      this.flags.simPoetActive = true
    }
    if (originalSimRequest.simLinkRope == Stats.ERR && metadata.errRopeEidolon != null && form.characterEidolon >= metadata.errRopeEidolon) {
      this.flags.forceErrRope = true
    }
  }

  public setOriginalSimRequest(relicsByPart: SingleRelicByPart) {
    const relics = TsUtils.clone(relicsByPart)
    const { relicSetNames, ornamentSetName } = calculateSetNames(relics)
    const scoringParams = benchmarkScoringParams

    this.originalSimRequest = convertRelicsToSimulation(
      relicsByPart,
      relicSetNames[0],
      relicSetNames[1],
      ornamentSetName,
      scoringParams.quality,
      scoringParams.speedRollValue,
    ) as SimulationRequest
  }

  public setSimSets() {
    const simRequest = this.originalSimRequest!
    this.simSets = calculateSimSets(simRequest.simRelicSet1, simRequest.simRelicSet2, simRequest.simOrnamentSet, this.metadata)
  }

  public setSimForm(form: OptimizerForm) {
    const metadata = this.metadata
    const { characterId, characterEidolon, lightCone, lightConeSuperimposition } = form

    const simulationForm: Form = generateFullDefaultForm(characterId, lightCone, characterEidolon, lightConeSuperimposition, false)
    const simulationFormT0 = generateFullDefaultForm(metadata.teammates[0].characterId,
      metadata.teammates[0].lightCone,
      metadata.teammates[0].characterEidolon,
      metadata.teammates[0].lightConeSuperimposition,
      true)
    const simulationFormT1 = generateFullDefaultForm(metadata.teammates[1].characterId,
      metadata.teammates[1].lightCone,
      metadata.teammates[1].characterEidolon,
      metadata.teammates[1].lightConeSuperimposition,
      true)
    const simulationFormT2 = generateFullDefaultForm(metadata.teammates[2].characterId,
      metadata.teammates[2].lightCone,
      metadata.teammates[2].characterEidolon,
      metadata.teammates[2].lightConeSuperimposition,
      true)
    simulationForm.teammate0 = simulationFormT0
    simulationForm.teammate1 = simulationFormT1
    simulationForm.teammate2 = simulationFormT2

    simulationForm.deprioritizeBuffs = this.metadata.deprioritizeBuffs

    // Cache context for reuse
    const context = generateContext(simulationForm)
    transformWorkerContext(context)

    this.form = simulationForm
    this.context = context
  }

  public setBaselineBuild() {
    const form = this.form!
    const context = this.context!
    const originalSimRequest = this.originalSimRequest!

    const baselineSimRequest = {
      ...originalSimRequest,
      stats: {},
    }

    const baselineSim: Simulation = {
      simType: StatSimTypes.SubstatRolls,
      request: baselineSimRequest,
    } as Simulation

    const simParams: RunSimulationsParams = {
      ...baselineScoringParams,
      mainStatMultiplier: 0,
      simulationFlags: this.flags,
    }

    const baselineSimResult = cloneSimResult(runStatSimulations([baselineSim], form, context, simParams)[0])

    this.baselineSim = baselineSim
    this.baselineSimRequest = baselineSimRequest
    this.baselineSimResult = baselineSimResult
  }

  public setOriginalBuild(inputSpdBenchmark?: number) {
    const form = this.form!
    const context = this.context!
    const baselineSimResult = this.baselineSimResult!
    const flags = this.flags

    const originalSim: Simulation = {
      simType: StatSimTypes.SubstatRolls,
      request: this.originalSimRequest,
    } as Simulation

    const simParams: RunSimulationsParams = {
      ...originalScoringParams,
      mainStatMultiplier: 1,
      simulationFlags: this.flags,
    }

    const originalSimResult = cloneSimResult(runStatSimulations([originalSim], form, context, simParams)[0])
    const originalSpd = TsUtils.precisionRound(originalSimResult.ca[Key.SPD], 3)

    this.spdBenchmark = inputSpdBenchmark != null
      ? Math.max(baselineSimResult.ca[Key.SPD], inputSpdBenchmark)
      : undefined

    applySpeedFlags(flags, baselineSimResult, originalSpd, this.spdBenchmark)

    // Force SPD
    const forcedSpdSimResult = cloneSimResult(runStatSimulations([originalSim], form, context, simParams)[0])

    originalSim.result = forcedSpdSimResult

    this.originalSimResult = forcedSpdSimResult
    this.originalSim = originalSim
    this.originalSpd = originalSpd
    this.targetSpd = calculateTargetSpeedNew(originalSimResult, forcedSpdSimResult, flags)
  }

  public async calculateBenchmark() {
    const form = this.form!
    const context = this.context!
    const metadata = this.metadata
    const flags = this.flags
    const targetSpd = this.targetSpd!
    const baselineSimResult = this.baselineSimResult!

    // Clone to remove functions
    const clonedContext = TsUtils.clone(context)
    const clonedBenchmarkScoringParams = TsUtils.clone(benchmarkScoringParams)

    const partialSimulationWrappers = generatePartialSimulations(this)

    const runnerPromises = partialSimulationWrappers.map((partialSimulationWrapper) => {
      const simulationResult = runStatSimulations([partialSimulationWrapper.simulation], form, context)[0]

      // Find the speed deduction
      const finalSpeed = simulationResult.xa[Key.SPD]
      const mainsCount = partialSimulationWrapper.simulation.request.simFeet == Stats.SPD ? 1 : 0
      const rolls = TsUtils.precisionRound(invertDiminishingReturnsSpdFormula(mainsCount, targetSpd - finalSpeed, clonedBenchmarkScoringParams.speedRollValue), 3)

      partialSimulationWrapper.speedRollsDeduction = Math.min(Math.max(0, rolls), spdRollsCap(partialSimulationWrapper.simulation, clonedBenchmarkScoringParams))
      if (partialSimulationWrapper.speedRollsDeduction >= 26 && partialSimulationWrapper.simulation.request.simFeet != Stats.SPD) {
        console.log('Rejected candidate sim with non SPD boots')
        return null
      }

      // Define min/max limits
      const minSubstatRollCounts = calculateMinSubstatRollCounts(partialSimulationWrapper, clonedBenchmarkScoringParams, flags)
      const maxSubstatRollCounts = calculateMaxSubstatRollCounts(partialSimulationWrapper, metadata, clonedBenchmarkScoringParams, baselineSimResult, flags)

      // Start the sim search at the max then iterate downwards
      partialSimulationWrapper.simulation.request.stats = maxSubstatRollCounts

      const input: ComputeOptimalSimulationRunnerInput = {
        partialSimulationWrapper: partialSimulationWrapper,
        inputMinSubstatRollCounts: minSubstatRollCounts,
        inputMaxSubstatRollCounts: maxSubstatRollCounts,
        simulationForm: form,
        context: clonedContext,
        metadata: metadata,
        scoringParams: clonedBenchmarkScoringParams,
        simulationFlags: flags,
      }

      return runComputeOptimalSimulationWorker(input)
    })

    console.time('===== Benchmark runner time')
    const runnerResults = await Promise.all(runnerPromises) as unknown as ComputeOptimalSimulationRunnerOutput[]
    const candidates = runnerResults.filter((r) => r?.simulation).map((r) => r.simulation!)
    console.timeEnd('===== Benchmark runner time')

    console.log(candidates)

    candidates.sort(simSorter)
    const benchmarkSim = candidates[0]

    this.benchmarkSimCandidates = candidates
    this.benchmarkSimResult = benchmarkSim.result!
    this.benchmarkSimRequest = benchmarkSim.request
  }

  public async calculatePerfection() {
    const form = this.form!
    const context = this.context!
    const metadata = this.metadata
    const targetSpd = this.targetSpd!
    const baselineSimResult = this.baselineSimResult!
    const benchmarkSimRequest = this.benchmarkSimRequest!
    const flags = this.flags

    const clonedContext = TsUtils.clone(context)

    // Convert the benchmark spd rolls to max spd rolls
    const spdDiff = targetSpd - baselineSimResult.xa[Key.SPD]

    // Spheres with DMG % are unique because they can alter a build due to DMG % not being a substat.
    // Permute the sphere options to find the best
    // @ts-ignore
    const runnerPromises: Promise<ComputeOptimalSimulationRunnerOutput>[] = []
    for (const feetMainStat of metadata.parts[Parts.Feet]) {
      for (const sphereMainStat of metadata.parts[Parts.PlanarSphere]) {
        const bestSimClone: Simulation = TsUtils.clone({ request: benchmarkSimRequest, simType: StatSimTypes.SubstatRolls })
        bestSimClone.request.simPlanarSphere = sphereMainStat
        bestSimClone.request.simFeet = feetMainStat

        const spdRolls = feetMainStat == Stats.SPD
          ? Math.max(0, TsUtils.precisionRound((spdDiff - 25.032) / maximumScoringParams.speedRollValue))
          : Math.max(0, TsUtils.precisionRound((spdDiff) / maximumScoringParams.speedRollValue))

        if (spdRolls > 36 && feetMainStat != Stats.SPD) {
          continue
        }

        const partialSimulationWrapper: PartialSimulationWrapper = {
          simulation: bestSimClone,
          speedRollsDeduction: Math.min(spdRolls, spdRollsCap(bestSimClone, maximumScoringParams)),
        }

        const minSubstatRollCounts = calculateMinSubstatRollCounts(partialSimulationWrapper, maximumScoringParams, flags)
        const maxSubstatRollCounts = calculateMaxSubstatRollCounts(partialSimulationWrapper, metadata, maximumScoringParams, baselineSimResult, flags)
        Object.values(SubStats).map((x) => partialSimulationWrapper.simulation.request.stats[x] = maxSubstatRollCounts[x])

        const input: ComputeOptimalSimulationRunnerInput = {
          partialSimulationWrapper: partialSimulationWrapper,
          inputMinSubstatRollCounts: minSubstatRollCounts,
          inputMaxSubstatRollCounts: maxSubstatRollCounts,
          simulationForm: form,
          context: clonedContext,
          metadata: metadata,
          scoringParams: TsUtils.clone(maximumScoringParams),
          simulationFlags: flags,
        }

        runnerPromises.push(runComputeOptimalSimulationWorker(input) as Promise<ComputeOptimalSimulationRunnerOutput>)
      }
    }

    console.time('===== Perfection runner time')
    const runnerResults = await Promise.all(runnerPromises) as unknown as ComputeOptimalSimulationRunnerOutput[]
    const candidates = runnerResults.filter((r) => r?.simulation).map((r) => r.simulation!)
    console.timeEnd('===== Perfection runner time')

    // Find the highest scoring
    candidates.sort(simSorter)
    const perfectionSim = candidates[0]

    this.perfectionSimCandidates = candidates
    this.perfectionSimResult = perfectionSim.result!
    this.perfectionSimRequest = perfectionSim.request
  }

  public calculateScores() {
    const metadata = this.metadata
    const originalSimResult = this.originalSimResult!
    const baselineSimResult = this.baselineSimResult!
    const benchmarkSimResult = this.benchmarkSimResult!
    const perfectionSimResult = this.perfectionSimResult!

    applyScoringFunction(baselineSimResult, metadata)
    applyScoringFunction(originalSimResult, metadata)

    const benchmarkSimScore = benchmarkSimResult.simScore
    const originalSimScore = originalSimResult.simScore
    const baselineSimScore = baselineSimResult.simScore
    const perfectionSimScore = perfectionSimResult.simScore

    const percent = originalSimScore >= benchmarkSimScore
      ? 1 + (originalSimScore - benchmarkSimScore) / (perfectionSimScore - benchmarkSimScore)
      : (originalSimScore - baselineSimScore) / (benchmarkSimScore - baselineSimScore)

    this.percent = percent
  }

  public calculateUpgrades() {
    const { substatUpgradeResults, setUpgradeResults, mainUpgradeResults } = generateStatImprovements(
      this.originalSim!,
      this.benchmarkSimRequest!,
      this.form!,
      this.context!,
      this.metadata,
      benchmarkScoringParams,
      this.baselineSimResult?.simScore!,
      this.benchmarkSimResult?.simScore!,
      this.perfectionSimResult?.simScore!,
    )

    this.substatUpgradeResults = substatUpgradeResults
    this.setUpgradeResults = setUpgradeResults
    this.mainUpgradeResults = mainUpgradeResults
  }

  public calculateResults() {
    this.simulationScore = {
      percent: this.percent!,

      originalSim: this.originalSim!,
      baselineSim: this.baselineSim!,
      benchmarkSim: this.benchmarkSimCandidates![0],
      maximumSim: this.perfectionSimCandidates![0],

      originalSimResult: this.originalSimResult!,
      baselineSimResult: this.baselineSimResult!,
      benchmarkSimResult: this.benchmarkSimResult!,
      maximumSimResult: this.perfectionSimResult!,

      originalSimScore: this.originalSimResult!.simScore,
      baselineSimScore: this.baselineSimResult!.simScore,
      benchmarkSimScore: this.benchmarkSimResult!.simScore,
      maximumSimScore: this.perfectionSimResult!.simScore,

      substatUpgrades: this.substatUpgradeResults!,
      setUpgrades: this.setUpgradeResults!,
      mainUpgrades: this.mainUpgradeResults!,

      simulationForm: this.form!,
      simulationMetadata: this.metadata,

      originalSpd: this.originalSpd!,
      spdBenchmark: this.spdBenchmark!,
      simulationFlags: this.flags,
    }
  }
}

function cloneComputedStatsArray(x: ComputedStatsArray) {
  const clone = new ComputedStatsArrayCore(false)
  clone.a.set(new Float32Array(x.a))
  clone.c.a.set(new Float32Array(x.c.a))

  return clone as ComputedStatsArray
}

function cloneSimResult(result: RunStatSimulationsResult) {
  const x = cloneComputedStatsArray(result.x)
  result.x = x
  result.xa = x.a
  result.ca = x.c.a

  return result
}

