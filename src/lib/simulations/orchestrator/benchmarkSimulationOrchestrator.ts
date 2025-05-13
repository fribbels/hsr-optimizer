import { Parts, Sets, Stats } from 'lib/constants/constants'
import { SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import { Key } from 'lib/optimization/computedStatsArray'
import { generateContext } from 'lib/optimization/context/calculateContext'
import { AbilityKind, toTurnAbility } from 'lib/optimization/rotation/turnAbilityConfig'
import { calculateSetNames, calculateSimSets, SimulationSets } from 'lib/scoring/dpsScore'
import { calculateMaxSubstatRollCounts, calculateMinSubstatRollCounts } from 'lib/scoring/rollCounter'
import {
  applyScoringFunction,
  baselineScoringParams,
  benchmarkScoringParams,
  cloneSimResult,
  cloneWorkerResult,
  invertDiminishingReturnsSpdFormula,
  maximumScoringParams,
  originalScoringParams,
  simSorter,
  SimulationFlags,
  SimulationScore,
  spdRollsCap,
} from 'lib/scoring/simScoringUtils'
import { generatePartialSimulations } from 'lib/simulations/benchmarks/simulateBenchmarkBuild'
import { generateStatImprovements, SimulationStatUpgrade } from 'lib/simulations/scoringUpgrades'
import { runStatSimulations } from 'lib/simulations/statSimulation'
import { convertRelicsToSimulation } from 'lib/simulations/statSimulationController'
import { RunSimulationsParams, RunStatSimulationsResult, Simulation, SimulationRequest, StatSimTypes } from 'lib/simulations/statSimulationTypes'
import { generateFullDefaultForm } from 'lib/simulations/utils/benchmarkForm'
import { applyBasicSpeedTargetFlag } from 'lib/simulations/utils/benchmarkSpeedTargets'
import { runComputeOptimalSimulationWorker } from 'lib/simulations/workerPool'
import { SimpleCharacter } from 'lib/tabs/tabBenchmarks/UseBenchmarksTabStore'
import { TsUtils } from 'lib/utils/TsUtils'
import { computeOptimalSimulationWorker } from 'lib/worker/computeOptimalSimulationWorker'
import { ComputeOptimalSimulationWorkerInput, ComputeOptimalSimulationWorkerOutput } from 'lib/worker/computeOptimalSimulationWorkerRunner'
import { WorkerType } from 'lib/worker/workerUtils'
import { Form, OptimizerForm } from 'types/form'
import { SimulationMetadata } from 'types/metadata'
import { OptimizerContext } from 'types/optimizer'

export class BenchmarkSimulationOrchestrator {
  public metadata: SimulationMetadata
  public flags: SimulationFlags
  public simSets?: SimulationSets
  public form?: OptimizerForm
  public context?: OptimizerContext
  public spdBenchmark?: number
  public benchmarkCombatSpdTarget?: number
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
      benchmarkBasicSpdTarget: 0,
    }
  }

  public setMetadata() {
    const metadata = this.metadata
    const substats: string[] = metadata.substats
    let addBreakEffect = false

    if (metadata.comboTurnAbilities.filter((x) => toTurnAbility(x).kind == AbilityKind.BREAK).length > 0) {
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
    if (addBreakEffect && !metadata.relicSets.find((sets) => sets[0] == sets[1] && sets[1] == Sets.IronCavalryAgainstTheScourge)) {
      metadata.relicSets.push([Sets.IronCavalryAgainstTheScourge, Sets.IronCavalryAgainstTheScourge])
    }
    if (addBreakEffect && !metadata.relicSets.find((sets) => sets[0] == sets[1] && sets[1] == Sets.IronCavalryAgainstTheScourge)) {
      metadata.relicSets.push([Sets.IronCavalryAgainstTheScourge, Sets.IronCavalryAgainstTheScourge])
    }
    if (addBreakEffect && !metadata.ornamentSets.find((set) => set == Sets.TaliaKingdomOfBanditry)) {
      metadata.ornamentSets.push(Sets.TaliaKingdomOfBanditry)
    }
    if (addBreakEffect && !metadata.ornamentSets.find((set) => set == Sets.ForgeOfTheKalpagniLantern)) {
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

  public setOriginalSimRequestWithRelics(relicsByPart: SingleRelicByPart) {
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

  public setOriginalSimRequest(request: SimulationRequest) {
    this.originalSimRequest = request
  }

  public setSimSetsWithSimRequest() {
    const simRequest = this.originalSimRequest!
    this.simSets = calculateSimSets(simRequest.simRelicSet1, simRequest.simRelicSet2, simRequest.simOrnamentSet, this.metadata)
  }

  public setSimSets(simSets: SimulationSets) {
    this.simSets = simSets
  }

  public setSimForm(form: SimpleCharacter) {
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

    this.form = simulationForm
  }

  public setSimContext() {
    const form = this.form!
    // Cache context for reuse
    const context = generateContext(form)
    this.context = context
  }

  public setBaselineBuild() {
    const form = this.form!
    const simSets = this.simSets!
    const context = this.context!
    const originalSimRequest = this.originalSimRequest!

    const baselineSimRequest = {
      ...originalSimRequest,
      stats: {},
      simRelicSet1: simSets.relicSet1,
      simRelicSet2: simSets.relicSet2,
      simOrnamentSet: simSets.ornamentSet,
    } as SimulationRequest

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

  public setOriginalBuild(inputSpdBenchmark?: number, force?: boolean) {
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

    this.spdBenchmark = inputSpdBenchmark != null
      ? Math.max(baselineSimResult.ca[Key.SPD], inputSpdBenchmark)
      : undefined

    // Run the original character's sim to find the original basic SPD value
    // This value is used to determine the benchmark's corresponding basic SPD in special set cases (poet)
    const originalSimResult = cloneSimResult(runStatSimulations([originalSim], form, context, simParams)[0])
    const originalSpd = TsUtils.precisionRound(originalSimResult.ca[Key.SPD], 3)

    applyBasicSpeedTargetFlag(flags, baselineSimResult, originalSpd, this.spdBenchmark, force)

    // Run a second sim with basic SPD forced at benchmarkBasicSpdTarget
    // This will emulate the character's relics at the benchmark SPD
    const forcedSpdSimResult = cloneSimResult(runStatSimulations([originalSim], form, context, simParams)[0])

    // Set the combat SPD target to the outcome of the forced result
    this.benchmarkCombatSpdTarget = forcedSpdSimResult.xa[Key.SPD]

    if (this.flags.characterPoetActive) {
      this.originalSimResult = originalSimResult
    } else if (force || inputSpdBenchmark != null) {
      this.originalSimResult = forcedSpdSimResult
    } else {
      this.originalSimResult = originalSimResult
    }

    this.originalSim = originalSim
    this.originalSpd = originalSpd
    this.originalSim.result = this.originalSimResult
  }

  public async calculateBenchmark() {
    const form = this.form!
    const context = this.context!
    const metadata = this.metadata
    const flags = this.flags
    const targetSpd = this.benchmarkCombatSpdTarget!
    const baselineSimResult = this.baselineSimResult!

    // Clone to remove functions
    const clonedContext = TsUtils.clone(context)
    const clonedBenchmarkScoringParams = TsUtils.clone(benchmarkScoringParams)

    const partialSimulationWrappers = generatePartialSimulations(this)

    const id = TsUtils.uuid()
    console.time('===== Benchmark runner time ' + id)

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

      const input: ComputeOptimalSimulationWorkerInput = {
        workerType: WorkerType.COMPUTE_OPTIMAL_SIMULATION,
        partialSimulationWrapper: partialSimulationWrapper,
        inputMinSubstatRollCounts: minSubstatRollCounts,
        inputMaxSubstatRollCounts: maxSubstatRollCounts,
        simulationForm: form,
        context: clonedContext,
        metadata: metadata,
        scoringParams: clonedBenchmarkScoringParams,
        simulationFlags: flags,
      }
      return globalThis.SEQUENTIAL_BENCHMARKS
        ? computeOptimalSimulationWorker({ data: input } as MessageEvent<ComputeOptimalSimulationWorkerInput>)
        : runComputeOptimalSimulationWorker(input)
    })

    const runnerResults = await Promise.all(runnerPromises) as unknown as ComputeOptimalSimulationWorkerOutput[]
    const candidates = runnerResults.filter((r) => r?.simulation).map((r) => r.simulation!)
    console.timeEnd('===== Benchmark runner time ' + id)

    // console.log(candidates)

    candidates.sort(simSorter)
    const benchmarkSim = candidates[0]

    this.benchmarkSimCandidates = candidates
    this.benchmarkSimResult = cloneWorkerResult(benchmarkSim.result!)
    this.benchmarkSimRequest = benchmarkSim.request
  }

  public async calculatePerfection() {
    const form = this.form!
    const context = this.context!
    const metadata = this.metadata
    const targetSpd = this.benchmarkCombatSpdTarget!
    const baselineSimResult = this.baselineSimResult!
    const flags = this.flags

    const clonedContext = TsUtils.clone(context)
    const clonedPerfectionScoringParams = TsUtils.clone(maximumScoringParams)

    const partialSimulationWrappers = generatePartialSimulations(this)
    const id = TsUtils.uuid()
    console.time('===== Perfection runner time ' + id)
    const runnerPromises = partialSimulationWrappers.map((partialSimulationWrapper) => {
      const simulationResult = runStatSimulations([partialSimulationWrapper.simulation], form, context)[0]

      const finalSpeed = simulationResult.xa[Key.SPD]
      const rolls = TsUtils.precisionRound((targetSpd - finalSpeed) / clonedPerfectionScoringParams.speedRollValue, 3)

      partialSimulationWrapper.speedRollsDeduction = Math.min(Math.max(0, rolls), spdRollsCap(partialSimulationWrapper.simulation, clonedPerfectionScoringParams))
      if (partialSimulationWrapper.speedRollsDeduction >= 26 && partialSimulationWrapper.simulation.request.simFeet != Stats.SPD) {
        console.log('Rejected candidate sim with non SPD boots')
        return null
      }

      const minSubstatRollCounts = calculateMinSubstatRollCounts(partialSimulationWrapper, clonedPerfectionScoringParams, flags)
      const maxSubstatRollCounts = calculateMaxSubstatRollCounts(partialSimulationWrapper, metadata, clonedPerfectionScoringParams, baselineSimResult, flags)

      partialSimulationWrapper.simulation.request.stats = maxSubstatRollCounts

      const input: ComputeOptimalSimulationWorkerInput = {
        workerType: WorkerType.COMPUTE_OPTIMAL_SIMULATION,
        partialSimulationWrapper: partialSimulationWrapper,
        inputMinSubstatRollCounts: minSubstatRollCounts,
        inputMaxSubstatRollCounts: maxSubstatRollCounts,
        simulationForm: form,
        context: clonedContext,
        metadata: metadata,
        scoringParams: TsUtils.clone(maximumScoringParams),
        simulationFlags: flags,
      }

      return globalThis.SEQUENTIAL_BENCHMARKS
        ? computeOptimalSimulationWorker({ data: input } as MessageEvent<ComputeOptimalSimulationWorkerInput>)
        : runComputeOptimalSimulationWorker(input)
    })

    const runnerResults = await Promise.all(runnerPromises) as unknown as ComputeOptimalSimulationWorkerOutput[]
    const candidates = runnerResults.filter((r) => r?.simulation).map((r) => r.simulation!)
    console.timeEnd('===== Perfection runner time ' + id)

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
      this.flags,
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
