import { CUSTOM_TEAM, Parts, Sets, Stats } from 'lib/constants/constants'
import { SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import { Key } from 'lib/optimization/computedStatsArray'
import { generateContext } from 'lib/optimization/context/calculateContext'
import { calculateSetNames, calculateSimSets, SimulationSets } from 'lib/scoring/dpsScore'
import { baselineScoringParams, benchmarkScoringParams, originalScoringParams, SimulationFlags, SimulationResult } from 'lib/scoring/simScoringUtils'
import { simulateBenchmarkBuild } from 'lib/simulations/new/benchmarks/simulateBenchmarkBuild'
import { simulatePerfectBuild } from 'lib/simulations/new/benchmarks/simulatePerfectBuild'
import { RunSimulationsParams, runStatSimulations, RunStatSimulationsResult, Simulation } from 'lib/simulations/new/statSimulation'
import { generateFullDefaultForm } from 'lib/simulations/new/utils/benchmarkForm'
import { applySpeedFlags, calculateTargetSpeedNew } from 'lib/simulations/new/utils/benchmarkSpeedTargets'
import { transformWorkerContext } from 'lib/simulations/new/workerContextTransform'
import { convertRelicsToSimulation, SimulationRequest } from 'lib/simulations/statSimulationController'
import DB from 'lib/state/db'
import { StatSimTypes } from 'lib/tabs/tabOptimizer/optimizerForm/components/StatSimulationDisplay'
import { TsUtils } from 'lib/utils/TsUtils'
import { calculatePenaltyMultiplier } from 'lib/worker/computeOptimalSimulationWorker'
import { Character } from 'types/character'
import { Form, OptimizerForm } from 'types/form'
import { ShowcaseTemporaryOptions, SimulationMetadata } from 'types/metadata'
import { OptimizerContext } from 'types/optimizer'

export interface CustomBenchmarkResult {
  benchmarkSim: Simulation
  benchmarkSimResult: SimulationResult
  perfectSim?: Simulation
  perfectSimResult?: SimulationResult
  metrics: {
    totalTime: number
  }
}

function call(
  character: Character,
  teamSelection: string,
  singleRelicByPart: SingleRelicByPart,
  showcaseTemporaryOptions: ShowcaseTemporaryOptions,
) {
  const simulationMetadata = resolveDpsScoreSimulationMetadata(character, teamSelection)
  if (!simulationMetadata) {
    return null
  }

  const orchestrator = new DpsScoreBenchmarkOrchestrator(simulationMetadata)

  orchestrator.setMetadata()
  orchestrator.setActualSimRequest(singleRelicByPart)
  orchestrator.setFlags()
  orchestrator.setSimSets()
  orchestrator.setSimForm(character.form)
  orchestrator.setBaselineBuild()
  orchestrator.setOriginalBuild(showcaseTemporaryOptions.spdBenchmark)

  orchestrator.calculateBenchmark()
  orchestrator.calculatePerfection()
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

  const customScoringMetadata = TsUtils.clone(DB.getMetadata().characters[characterId].scoringMetadata)
  const defaultScoringMetadata = TsUtils.clone(DB.getScoringMetadata(characterId))

  if (!defaultScoringMetadata?.simulation || !customScoringMetadata?.simulation) {
    console.log('No scoring sim defined for this character')
    return null
  }

  // Merge any necessary configs from the custom metadata

  const metadata = defaultScoringMetadata.simulation
  metadata.teammates = teamSelection == CUSTOM_TEAM ? customScoringMetadata.simulation.teammates : defaultScoringMetadata.simulation.teammates
  metadata.deprioritizeBuffs = customScoringMetadata.simulation.deprioritizeBuffs ?? false

  return metadata
}

export class DpsScoreBenchmarkOrchestrator {
  private metadata: SimulationMetadata
  private flags: SimulationFlags
  private simSets?: SimulationSets
  private actualSimRequest?: SimulationRequest
  private form?: OptimizerForm
  private context?: OptimizerContext
  private spdBenchmark?: number
  private targetSpd?: number

  private baselineSimRequest?: SimulationRequest
  private baselineSimResult?: RunStatSimulationsResult
  private originalSimRequest?: SimulationRequest
  private originalSimResult?: RunStatSimulationsResult
  private benchmarkSimRequest?: SimulationRequest
  private benchmarkSimResult?: RunStatSimulationsResult
  private perfectionSimRequest?: SimulationRequest
  private perfectionSimResult?: RunStatSimulationsResult

  constructor(metadata: SimulationMetadata) {
    this.metadata = metadata
    this.flags = {
      overcapCritRate: false,
      simPoetActive: false,
      characterPoetActive: false,
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
    const metadata = this.metadata
    const simRequest = this.actualSimRequest!
    const simSets = this.simSets!
    if (metadata.teammates.find((teammate) => teammate.characterId == '1313' && teammate.characterEidolon == 6)) {
      this.flags.overcapCritRate = true
    }
    if (simRequest.simRelicSet1 == Sets.PoetOfMourningCollapse && simRequest.simRelicSet2 == Sets.PoetOfMourningCollapse) {
      this.flags.characterPoetActive = true
    }
    if (simSets.relicSet1 == Sets.PoetOfMourningCollapse && simSets.relicSet2 == Sets.PoetOfMourningCollapse) {
      this.flags.simPoetActive = true
    }
  }

  public setActualSimRequest(relicsByPart: SingleRelicByPart) {
    const relics = TsUtils.clone(relicsByPart)
    const { relicSetNames, ornamentSetName } = calculateSetNames(relics)
    const scoringParams = benchmarkScoringParams

    this.actualSimRequest = convertRelicsToSimulation(
      relicsByPart,
      relicSetNames[0],
      relicSetNames[1],
      ornamentSetName,
      scoringParams.quality,
      scoringParams.speedRollValue,
    ) as SimulationRequest
  }

  public setSimSets() {
    const simRequest = this.actualSimRequest!
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
    const actualSimRequest = this.actualSimRequest!

    const baselineSimRequest = {
      ...actualSimRequest,
      stats: { [Stats.SPD]: actualSimRequest.stats[Stats.SPD] },
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

    this.baselineSimRequest = baselineSimRequest
    this.baselineSimResult = runStatSimulations([baselineSim], form, context, simParams)[0]
  }

  public setOriginalBuild(inputSpdBenchmark?: number) {
    const form = this.form!
    const context = this.context!
    const baselineSimResult = this.baselineSimResult!
    const flags = this.flags!

    const originalSim: Simulation = {
      simType: StatSimTypes.SubstatRolls,
      request: this.actualSimRequest,
    } as Simulation

    const simParams: RunSimulationsParams = {
      ...originalScoringParams,
      mainStatMultiplier: 1,
      simulationFlags: this.flags,
    }

    const originalSimResult = runStatSimulations([originalSim], form, context, simParams)[0]
    const originalSpd = TsUtils.precisionRound(originalSimResult.ca[Key.SPD], 3)

    this.spdBenchmark = inputSpdBenchmark != null
      ? Math.max(baselineSimResult.ca[Key.SPD], inputSpdBenchmark)
      : undefined

    applySpeedFlags(flags, baselineSimResult, originalSpd, this.spdBenchmark)

    // Force SPD
    const forcedSpdSimResult = runStatSimulations([originalSim], form, context, simParams)[0]

    this.targetSpd = calculateTargetSpeedNew(originalSimResult, forcedSpdSimResult, flags)
    this.originalSimResult = forcedSpdSimResult
  }

  public async calculateBenchmark() {
    const benchmarkSim = await simulateBenchmarkBuild(
      character,
      simulationSets,
      originalSim,
      targetSpd,
      metadata,
      simulationForm,
      context,
      baselineSimResult,
      originalSimResult,
      simulationFlags,
    )
  }

  public async calculatePerfection() {
    const maximumSim = await simulatePerfectBuild(
      benchmarkSim,
      targetSpd,
      metadata,
      simulationForm,
      context,
      applyScoringFunction,
      baselineSimResult,
      originalSimResult,
      simulationFlags,
    )
  }

  // public async run(includePerfectBuild: boolean = false): Promise<CustomBenchmarkResult> {
  //   try {
  //     // Step 1: Simulate benchmark build directly
  //     await this.runBenchmarkBuild()
  //
  //     // Step 2: Optionally simulate perfect build
  //     if (includePerfectBuild) {
  //       await this.runPerfectBuild()
  //     }
  //
  //     // Return results
  //     return this.getResults()
  //   } finally {
  //     // Record total time
  //     this.state.metrics.totalTime = performance.now() - this.state.metrics.startTime
  //   }
  // }
  //
  // public getState(): SimulationState {
  //   return this.state
  // }
  //
  // private async runBenchmarkBuild(): Promise<void> {
  //   if (this.state.status.benchmarkBuildCompleted) {
  //     return // Already completed
  //   }
  //
  //   const startTime = performance.now()
  //
  //   // Run the simulation
  //   const { benchmarkSim, benchmarkSimResult } = await simulateBenchmarkBuild(this.state)
  //
  //   // Update state
  //   this.state.results.benchmarkSim = benchmarkSim
  //   this.state.results.benchmarkSimResult = benchmarkSimResult
  //   this.state.status.benchmarkBuildCompleted = true
  //   this.state.metrics.benchmarkBuildTime = performance.now() - startTime
  // }
  //
  // private async runPerfectBuild(): Promise<void> {
  //   if (this.state.status.perfectBuildCompleted) {
  //     return // Already completed
  //   }
  //
  //   const startTime = performance.now()
  //
  //   // Ensure benchmark build is completed
  //   if (!this.state.status.benchmarkBuildCompleted) {
  //     await this.runBenchmarkBuild()
  //   }
  //
  //   // Run the simulation
  //   const { perfectSim, perfectSimResult } = await simulatePerfectBuild(this.state)
  //
  //   // Update state
  //   this.state.results.perfectSim = perfectSim
  //   this.state.results.perfectSimResult = perfectSimResult
  //   this.state.status.perfectBuildCompleted = true
  //   this.state.metrics.perfectBuildTime = performance.now() - startTime
  // }
  //
  // private getResults(): CustomBenchmarkResult {
  //   if (!this.state.status.benchmarkBuildCompleted) {
  //     throw new Error('Benchmark simulation not completed')
  //   }
  //
  //   const result: CustomBenchmarkResult = {
  //     benchmarkSim: this.state.results.benchmarkSim!,
  //     benchmarkSimResult: this.state.results.benchmarkSimResult!,
  //     metrics: {
  //       totalTime: this.state.metrics.totalTime!,
  //     },
  //   }
  //
  //   // Include perfect build results if available
  //   if (this.state.status.perfectBuildCompleted) {
  //     result.perfectSim = this.state.results.perfectSim
  //     result.perfectSimResult = this.state.results.perfectSimResult
  //   }
  //
  //   return result
  // }

  public scoringFunction(result: SimulationResult, penalty = true) {
    if (!result) return

    const unpenalizedSimScore = result.xa[Key.COMBO_DMG]
    const penaltyMultiplier = calculatePenaltyMultiplier(result, this.metadata, benchmarkScoringParams)
    result.simScore = unpenalizedSimScore * (penalty ? penaltyMultiplier : 1)
  }
}
