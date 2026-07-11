import { type PreviewRelics } from 'lib/characterPreview/characterPreviewController'
import { KafkaB1 } from 'lib/conditionals/character/1000/KafkaB1'
import { Fugue } from 'lib/conditionals/character/1200/Fugue'
import { TheDahlia } from 'lib/conditionals/character/1300/TheDahlia'
import { PermansorTerrae } from 'lib/conditionals/character/1400/PermansorTerrae'
import {
  TrailblazerHarmonyCaelus,
  TrailblazerHarmonyStelle,
} from 'lib/conditionals/character/8000/TrailblazerHarmony'
import {
  applyScoringMetadataPresets,
  applyTeamAwareSetConditionalPresets,
  resolveTeammateInfo,
} from 'lib/conditionals/evaluation/applyPresets'
import {
  Parts,
  Sets,
  Stats,
} from 'lib/constants/constants'
import { generateContext } from 'lib/optimization/context/calculateContext'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { SELF_ENTITY_INDEX } from 'lib/optimization/engine/config/tag'
import { ComboType } from 'lib/optimization/rotation/comboType'
import {
  AbilityKind,
  NULL_TURN_ABILITY_NAME,
  toTurnAbility,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { StatCalculator } from 'lib/relics/statCalculator'
import {
  resolveComboSpdTarget,
  runPoolZeroMainsStatSim,
  runScoringBaselineSim,
} from 'lib/scoring/benchmarkPoolState'
import {
  calculateSetNames,
  calculateSimSets,
} from 'lib/scoring/dpsScore'
import type { SimulationSets } from 'lib/scoring/dpsScore'
import {
  applyHardBreakpoints,
  calculateMaxSubstatRollCounts,
  calculateMinSubstatRollCounts,
} from 'lib/scoring/rollCounter'
import {
  calculateScorePercent,
  SCORING_CONFIG_REGISTRY,
} from 'lib/scoring/scoringConfig'
import type {
  PoolComboState,
  SimulationFlags,
  SimulationScore,
} from 'lib/scoring/simScoringUtils'
import {
  applyScoringFunction,
  baselineScoringParams,
  benchmarkScoringParams,
  buildCandidateSetPool,
  cloneSimResult,
  cloneWorkerResult,
  getDiminishingReturns,
  invertDiminishingReturnsSpdFormula,
  isPoetSet,
  maximumScoringParams,
  originalScoringParams,
  requestToSets,
  setsEqual,
  simSorter,
  spdRollsCap,
} from 'lib/scoring/simScoringUtils'
import { generatePartialSimulations } from 'lib/simulations/benchmarks/simulateBenchmarkBuild'
import { generateStatImprovements } from 'lib/simulations/scoringUpgrades'
import type { SimulationStatUpgrade } from 'lib/simulations/scoringUpgrades'
import { runStatSimulations } from 'lib/simulations/statSimulation'
import type {
  RunSimulationsParams,
  RunStatSimulationsResult,
  Simulation,
  SimulationRequest,
} from 'lib/simulations/statSimulationTypes'
import { StatSimTypes } from 'lib/simulations/statSimulationTypes'
import { convertRelicsToSimulation } from 'lib/simulations/statSimulationUtils'
import {
  computeTeammateOrnamentUpgrades,
  type TeammateSetUpgrade,
} from 'lib/simulations/teammateUpgradeGrouping'
import { generateFullDefaultForm } from 'lib/simulations/utils/benchmarkForm'
import { applyBasicSpeedTargetFlag } from 'lib/simulations/utils/benchmarkSpeedTargets'
import type { SimpleCharacter } from 'lib/tabs/tabBenchmarks/useBenchmarksTabStore'
import { precisionRound } from 'lib/utils/mathUtils'
import { clone } from 'lib/utils/objectUtils'
import {
  defaultComputeOptimalSimulationSearchRunner,
} from 'lib/worker/computeOptimalSimulationWorkerRunner'
import type {
  ComputeOptimalSimulationSearchRunner,
  ComputeOptimalSimulationWorkerInput,
  ComputeOptimalSimulationWorkerOutput,
} from 'lib/worker/computeOptimalSimulationWorkerRunner'
import { WorkerType } from 'lib/worker/workerUtils'
import type {
  Form,
  OptimizerForm,
} from 'types/form'
import {
  type ScoringConfig,
  type ScoringConfigType,
  type SimulationMetadata,
} from 'types/metadata'
import type { OptimizerContext } from 'types/optimizer'

type SimulationSearchOptions = {
  scoreOnly?: boolean,
}

export function enrichSimulationMetadata(metadata: SimulationMetadata) {
  const substats: string[] = metadata.substats
  let addBreakEffect = false
  let addEffectHitRate = false

  if (metadata.comboTurnAbilities.filter((x) => toTurnAbility(x).kind == AbilityKind.BREAK).length > 0) {
    addBreakEffect = true
  }

  if (
    metadata.teammates.find((x) =>
      x.characterId == TrailblazerHarmonyCaelus.id
      || x.characterId == TrailblazerHarmonyStelle.id
      || x.characterId == Fugue.id
      || x.characterId == TheDahlia.id
    )
  ) {
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
  if (addBreakEffect && !metadata.ornamentSets.find((set) => set == Sets.TaliaKingdomOfBanditry)) {
    metadata.ornamentSets.push(Sets.TaliaKingdomOfBanditry)
  }
  if (addBreakEffect && !metadata.ornamentSets.find((set) => set == Sets.ForgeOfTheKalpagniLantern)) {
    metadata.ornamentSets.push(Sets.ForgeOfTheKalpagniLantern)
  }

  if (
    !metadata.ornamentSets.find((set) => set == Sets.TheWondrousBananAmusementPark) && metadata.teammates.find((x) => x.characterId == PermansorTerrae.id)
  ) {
    metadata.ornamentSets.push(Sets.TheWondrousBananAmusementPark)
  }

  if (metadata.teammates.find((x) => x.characterId == KafkaB1.id)) {
    addEffectHitRate = true
  }
  if (addEffectHitRate && !substats.includes(Stats.EHR)) {
    substats.push(Stats.EHR)
  }
  if (addEffectHitRate && !metadata.parts[Parts.Body].includes(Stats.EHR)) {
    metadata.parts[Parts.Body].push(Stats.EHR)
  }
}

function selectBestSimulation(candidates: Simulation[]): Simulation | undefined {
  let best: Simulation | undefined
  for (const candidate of candidates) {
    if (!candidate.result) continue
    if (!best?.result || candidate.result.simScore > best.result.simScore) {
      best = candidate
    }
  }
  return best
}

function calculateResRollsDeduction(
  simulationResult: RunStatSimulationsResult,
  flags: SimulationFlags,
  quality: number,
): number {
  if (flags.benchmarkBasicResTarget <= 0) return 0
  const baseRes = simulationResult.x.getActionValueByIndex(StatKey.RES, SELF_ENTITY_INDEX)
  const resGap = (flags.benchmarkBasicResTarget - baseRes) * 100
  if (resGap <= 0) return 0
  const resMaxedSubValue = StatCalculator.getMaxedSubstatValue(Stats.RES, quality)
  return Math.min(Math.max(0, resGap / resMaxedSubValue), 10)
}

export class BenchmarkSimulationOrchestrator {
  public metadata: SimulationMetadata
  public flags: SimulationFlags
  public simSets?: SimulationSets
  public form?: OptimizerForm
  public context?: OptimizerContext
  public spdBenchmark?: number
  public benchmarkCombatSpdTarget?: number
  public originalSpd?: number

  public candidateSetPool?: SimulationSets[]
  public poolComboStates?: PoolComboState[]
  public benchmarkWinnerPoolIndex?: number
  public benchmarkBaselineScore?: number

  // Score/UI baseline: the 0% floor shown to users and used in percent normalization.
  // It intentionally forces SPD boots, optimizes body/sphere/rope mains, uses 0 subs, and equalizes SPD.
  public baselineSim?: Simulation
  public baselineSimResult?: RunStatSimulationsResult
  // Internal stat probe only. Keep this separate from baselineSimResult:
  // it has zero main stats and is used for speed breakpoints and search-space caps.
  public zeroMainsStatResult?: RunStatSimulationsResult

  public originalSim?: Simulation
  public originalSimRequest?: SimulationRequest
  public originalSimResult?: RunStatSimulationsResult

  public benchmarkSimRequest?: SimulationRequest
  public benchmarkSimResult?: RunStatSimulationsResult
  public benchmarkSimCandidates?: Simulation[]
  public benchmarkSimScore?: number

  public perfectionSimRequest?: SimulationRequest
  public perfectionSimResult?: RunStatSimulationsResult
  public perfectionSimCandidates?: Simulation[]
  public perfectionSimScore?: number

  public substatUpgradeResults?: SimulationStatUpgrade[]
  public setUpgradeResults?: SimulationStatUpgrade[]
  public mainUpgradeResults?: SimulationStatUpgrade[]
  public teammateOrnamentUpgradeResults?: TeammateSetUpgrade[]

  public percent?: number
  public simulationScore?: SimulationScore
  public configType!: ScoringConfigType
  public brokenKeelResTarget: number = 0

  constructor(metadata: SimulationMetadata) {
    this.metadata = metadata
    this.flags = {
      overcapCritRate: false,
      simPoetActive: false,
      characterPoetActive: false,
      forceErrRope: false,
      benchmarkBasicSpdTarget: 0,
      benchmarkBasicResTarget: 0,
    }
  }

  public setMetadata() {
    enrichSimulationMetadata(this.metadata)
  }

  public applyConfigOverrides(config: ScoringConfig) {
    const entry = SCORING_CONFIG_REGISTRY[config.configType]
    if (entry.resultSortKey) {
      this.form!.resultSort = entry.resultSortKey
    }

    if (config.simulation.comboTurnAbilities) {
      this.form!.comboTurnAbilities = [...config.simulation.comboTurnAbilities]
      this.form!.comboType = ComboType.ADVANCED
    }

    applyScoringMetadataPresets(this.form!, resolveTeammateInfo(...this.metadata.teammates))
  }

  public applyResEqualization() {
    const entry = SCORING_CONFIG_REGISTRY[this.configType]
    if (!entry.applyResEqualization) return

    const combatRes = this.originalSimResult!.x.getActionValueByIndex(StatKey.RES, SELF_ENTITY_INDEX)
    const baselineRes = this.baselineSimResult!.x.getActionValueByIndex(StatKey.RES, SELF_ENTITY_INDEX)
    if (combatRes - baselineRes >= 0.50 || combatRes >= 1.00) {
      this.flags.benchmarkBasicResTarget = Math.min(combatRes, 1.00)
    }

    if (this.originalSimRequest!.simOrnamentSet === Sets.BrokenKeel && combatRes >= 0.30) {
      this.brokenKeelResTarget = 0.30
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
    if (isPoetSet(simSets)) {
      this.flags.simPoetActive = true
    }
    if (originalSimRequest.simLinkRope == Stats.ERR && metadata.errRopeEidolon != null && form.characterEidolon >= metadata.errRopeEidolon) {
      this.flags.forceErrRope = true
    }
  }

  public setOriginalSimRequestWithRelics(relicsByPart: PreviewRelics) {
    const relics = clone(relicsByPart)
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

  public setCandidateSetPool() {
    this.candidateSetPool = buildCandidateSetPool(this.simSets!, this.originalSimRequest!)
  }

  public setSimForm(form: SimpleCharacter) {
    const metadata = this.metadata
    const { characterId, characterEidolon, lightCone, lightConeSuperimposition } = form

    const simulationForm: Form = generateFullDefaultForm(characterId, lightCone, characterEidolon, lightConeSuperimposition, false)

    metadata.teammates.forEach((teammate, idx) => {
      if (!teammate?.characterId) return
      switch (idx) {
        case 0:
        case 1:
        case 2:
          simulationForm[`teammate${idx}`] = generateFullDefaultForm(
            teammate.characterId,
            teammate.lightCone,
            teammate.characterEidolon,
            teammate.lightConeSuperimposition,
            true,
          )
          simulationForm[`teammate${idx}`].teamRelicSet = teammate.teamRelicSet
          simulationForm[`teammate${idx}`].teamOrnamentSet = teammate.teamOrnamentSet
          break
        default:
          break
      }
    })

    simulationForm.deprioritizeBuffs = this.metadata.deprioritizeBuffs

    applyTeamAwareSetConditionalPresets(simulationForm, resolveTeammateInfo(...metadata.teammates))

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

    const baselineFlags: SimulationFlags = {
      ...this.flags,
      benchmarkBasicSpdTarget: 0,
    }
    const baselineMetadata: SimulationMetadata = {
      ...this.metadata,
      parts: {
        ...this.metadata.parts,
        [Parts.Feet]: [Stats.SPD],
      },
    }

    const { sim, result } = runScoringBaselineSim(
      simSets,
      form,
      context,
      baselineFlags,
      baselineMetadata,
      this.configType,
    )

    this.baselineSim = sim
    this.baselineSim.result = result
    this.baselineSimResult = result
  }

  public setOriginalBuild(inputSpdBenchmark?: number, force?: boolean) {
    const form = this.form!
    const context = this.context!
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
    const originalSpd = precisionRound(originalSimResult.x.c.SPD.get(), 3)

    const zeroMainsSim: Simulation = {
      simType: StatSimTypes.SubstatRolls,
      request: {
        ...this.originalSimRequest!,
        stats: {},
        simRelicSet1: this.simSets!.relicSet1,
        simRelicSet2: this.simSets!.relicSet2,
        simOrnamentSet: this.simSets!.ornamentSet,
      },
    } as Simulation
    const zeroMainsStatResult = cloneSimResult(
      runStatSimulations([zeroMainsSim], form, context, {
        ...baselineScoringParams,
        mainStatMultiplier: 0,
        simulationFlags: { ...flags, benchmarkBasicSpdTarget: 0 },
      })[0],
    )
    this.zeroMainsStatResult = zeroMainsStatResult

    this.spdBenchmark = inputSpdBenchmark != null
      ? Math.max(zeroMainsStatResult.x.c.SPD.get(), inputSpdBenchmark)
      : undefined

    applyBasicSpeedTargetFlag(flags, zeroMainsStatResult, originalSpd, this.spdBenchmark, force)

    // Run a second sim with basic SPD forced at benchmarkBasicSpdTarget
    // This will emulate the character's relics at the benchmark SPD
    const forcedSpdSimResult = cloneSimResult(runStatSimulations([originalSim], form, context, simParams)[0])

    // Set the combat SPD target to the outcome of the forced result
    this.benchmarkCombatSpdTarget = forcedSpdSimResult.x.getActionValueByIndex(StatKey.SPD, SELF_ENTITY_INDEX)

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

  public precomputePoolState() {
    const pool = this.candidateSetPool ?? [this.simSets!]

    this.poolComboStates = pool.map((setCombination) => {
      const { sim, result } = runPoolZeroMainsStatSim(
        setCombination,
        this.form!,
        this.context!,
        this.flags,
        this.metadata,
        this.configType,
        this.benchmarkCombatSpdTarget,
      )
      const spdTarget = resolveComboSpdTarget(
        setCombination,
        sim,
        this.form!,
        this.context!,
        this.flags,
        this.originalSpd!,
        this.spdBenchmark,
      )

      const comboFlags = spdTarget.flags
      if (this.brokenKeelResTarget > 0 && setCombination.ornamentSet === Sets.BrokenKeel) {
        comboFlags.benchmarkBasicResTarget = Math.max(comboFlags.benchmarkBasicResTarget, this.brokenKeelResTarget)
      }

      return {
        sets: setCombination,
        zeroMainsScore: result.simScore,
        zeroMainsResult: result,
        combatSpdTarget: spdTarget.combatSpdTarget,
        basicSpdTarget: spdTarget.basicSpdTarget,
        flags: comboFlags,
      }
    })
  }

  public async calculateBenchmark(
    clonedContext: OptimizerContext,
    searchRunner?: ComputeOptimalSimulationSearchRunner,
    options: SimulationSearchOptions = {},
  ) {
    const form = this.form!
    const context = this.context!
    const metadata = this.metadata

    const clonedBenchmarkScoringParams = clone(benchmarkScoringParams)

    const partialSimulationWrappers = generatePartialSimulations(this)

    const benchmarkStartMs = performance.now()

    const poolComboStates = this.poolComboStates
    const defaultTargetSpd = this.benchmarkCombatSpdTarget!
    const defaultFlags = this.flags

    const runnerPromises = partialSimulationWrappers.map((partialSimulationWrapper) => {
      const comboState = poolComboStates?.[partialSimulationWrapper.poolIndex]
      const targetSpd = comboState?.combatSpdTarget ?? defaultTargetSpd
      const flags = comboState?.flags ?? defaultFlags
      const zeroMainsStatResult = poolComboStates ? comboState!.zeroMainsResult : this.zeroMainsStatResult!

      const simulationResult = runStatSimulations([partialSimulationWrapper.simulation], form, context)[0]

      // Find the speed deduction
      const finalSpeed = simulationResult.x.getActionValueByIndex(StatKey.SPD, SELF_ENTITY_INDEX)
      const mainsCount = partialSimulationWrapper.simulation.request.simFeet == Stats.SPD ? 1 : 0
      const rolls = precisionRound(
        invertDiminishingReturnsSpdFormula(
          mainsCount,
          targetSpd - finalSpeed,
          clonedBenchmarkScoringParams.speedRollValue,
          getDiminishingReturns(this.configType),
        ),
        3,
      )

      partialSimulationWrapper.speedRollsDeduction = Math.min(
        Math.max(0, rolls),
        spdRollsCap(partialSimulationWrapper.simulation, clonedBenchmarkScoringParams),
      )
      if (partialSimulationWrapper.speedRollsDeduction >= 26 && partialSimulationWrapper.simulation.request.simFeet != Stats.SPD) {
        console.log('Rejected candidate sim with non SPD boots')
        return null
      }

      partialSimulationWrapper.resRollsDeduction = calculateResRollsDeduction(simulationResult, flags, clonedBenchmarkScoringParams.quality)

      if (!applyHardBreakpoints(partialSimulationWrapper, simulationResult, metadata, clonedBenchmarkScoringParams)) {
        return null
      }

      const minSubstatRollCounts = calculateMinSubstatRollCounts(partialSimulationWrapper, clonedBenchmarkScoringParams)
      const maxSubstatRollCounts = calculateMaxSubstatRollCounts(
        partialSimulationWrapper,
        clonedBenchmarkScoringParams,
        zeroMainsStatResult,
        flags,
        this.configType,
      )

      // Start the sim search at the max then iterate downwards
      partialSimulationWrapper.simulation.request.stats = maxSubstatRollCounts

      const input: ComputeOptimalSimulationWorkerInput = {
        workerType: WorkerType.COMPUTE_OPTIMAL_SIMULATION,
        partialSimulationWrapper: partialSimulationWrapper,
        inputMinSubstatRollCounts: minSubstatRollCounts,
        inputMaxSubstatRollCounts: maxSubstatRollCounts,
        simulationForm: form,
        context: searchRunner ? clonedContext : clone(clonedContext),
        metadata: metadata,
        scoringParams: clonedBenchmarkScoringParams,
        simulationFlags: flags,
        configType: this.configType,
      }

      return searchRunner
        ? searchRunner(input, {
          phase: 'benchmark',
          configType: this.configType,
          resultMode: options.scoreOnly ? 'scoreOnly' : 'full',
        })
        : defaultComputeOptimalSimulationSearchRunner(input)
    })

    const runnerResults = await Promise.all(runnerPromises) as unknown as ComputeOptimalSimulationWorkerOutput[]
    const candidates = runnerResults.filter((r) => r?.simulation).map((r) => r.simulation!)
    const benchmarkElapsedMs = performance.now() - benchmarkStartMs
    console.log(`===== Benchmark: ${form.characterId} | ${partialSimulationWrappers.length} sims | ${(benchmarkElapsedMs / 1000).toFixed(1)}s`)

    let benchmarkSim = selectBestSimulation(candidates)
    if (!options.scoreOnly) {
      candidates.sort(simSorter)
      benchmarkSim = candidates[0]
    }

    if (!benchmarkSim) {
      throw new Error(`Benchmark produced no valid candidates (${runnerResults.length} runners, ${candidates.length} candidates)`)
    }

    this.benchmarkSimCandidates = options.scoreOnly ? [benchmarkSim] : candidates
    this.benchmarkSimScore = benchmarkSim.result!.simScore
    this.benchmarkSimResult = options.scoreOnly
      ? undefined
      : cloneWorkerResult(benchmarkSim.result!)
    this.benchmarkSimRequest = benchmarkSim.request

    if (poolComboStates) {
      const pool = this.candidateSetPool ?? [this.simSets!]
      this.benchmarkWinnerPoolIndex = Math.max(0, pool.findIndex((s) => setsEqual(s, requestToSets(benchmarkSim.request))))
    }
  }

  public async calculatePerfection(
    clonedContext: OptimizerContext,
    searchRunner?: ComputeOptimalSimulationSearchRunner,
    options: SimulationSearchOptions = {},
  ) {
    const form = this.form!
    const context = this.context!
    const metadata = this.metadata

    const clonedPerfectionScoringParams = clone(maximumScoringParams)

    const partialSimulationWrappers = generatePartialSimulations(this)
    const poolComboStates = this.poolComboStates
    const defaultTargetSpd = this.benchmarkCombatSpdTarget!
    const defaultFlags = this.flags

    const perfectionStartMs = performance.now()
    const runnerPromises = partialSimulationWrappers.map((partialSimulationWrapper) => {
      const comboState = poolComboStates?.[partialSimulationWrapper.poolIndex]
      const targetSpd = comboState?.combatSpdTarget ?? defaultTargetSpd
      const flags = comboState?.flags ?? defaultFlags
      const zeroMainsStatResult = poolComboStates ? comboState!.zeroMainsResult : this.zeroMainsStatResult!

      const simulationResult = runStatSimulations([partialSimulationWrapper.simulation], form, context)[0]

      // Find the speed deduction
      const finalSpeed = simulationResult.x.getActionValueByIndex(StatKey.SPD, SELF_ENTITY_INDEX)
      const rolls = precisionRound((targetSpd - finalSpeed) / clonedPerfectionScoringParams.speedRollValue, 3)

      partialSimulationWrapper.speedRollsDeduction = Math.min(
        Math.max(0, rolls),
        spdRollsCap(partialSimulationWrapper.simulation, clonedPerfectionScoringParams),
      )
      if (partialSimulationWrapper.speedRollsDeduction >= 26 && partialSimulationWrapper.simulation.request.simFeet != Stats.SPD) {
        console.log('Rejected candidate sim with non SPD boots')
        return null
      }

      partialSimulationWrapper.resRollsDeduction = calculateResRollsDeduction(simulationResult, flags, clonedPerfectionScoringParams.quality)

      // Define min/max limits
      const minSubstatRollCounts = calculateMinSubstatRollCounts(partialSimulationWrapper, clonedPerfectionScoringParams)
      const maxSubstatRollCounts = calculateMaxSubstatRollCounts(
        partialSimulationWrapper,
        clonedPerfectionScoringParams,
        zeroMainsStatResult,
        flags,
        this.configType,
      )

      // Start the sim search at the max then iterate downwards
      partialSimulationWrapper.simulation.request.stats = maxSubstatRollCounts

      const input: ComputeOptimalSimulationWorkerInput = {
        workerType: WorkerType.COMPUTE_OPTIMAL_SIMULATION,
        partialSimulationWrapper: partialSimulationWrapper,
        inputMinSubstatRollCounts: minSubstatRollCounts,
        inputMaxSubstatRollCounts: maxSubstatRollCounts,
        simulationForm: form,
        context: searchRunner ? clonedContext : clone(clonedContext),
        metadata: metadata,
        scoringParams: clonedPerfectionScoringParams,
        simulationFlags: flags,
        configType: this.configType,
      }

      return searchRunner
        ? searchRunner(input, {
          phase: 'perfection',
          configType: this.configType,
          resultMode: options.scoreOnly ? 'scoreOnly' : 'full',
        })
        : defaultComputeOptimalSimulationSearchRunner(input)
    })

    const runnerResults = await Promise.all(runnerPromises) as unknown as ComputeOptimalSimulationWorkerOutput[]
    const candidates = runnerResults.filter((r) => r?.simulation).map((r) => r.simulation!)
    const perfectionElapsedMs = performance.now() - perfectionStartMs
    console.log(`===== Perfection: ${form.characterId} | ${partialSimulationWrappers.length} sims | ${(perfectionElapsedMs / 1000).toFixed(1)}s`)

    let perfectionSim = selectBestSimulation(candidates)
    if (!options.scoreOnly) {
      candidates.sort(simSorter)
      perfectionSim = candidates[0]
    }

    if (!perfectionSim) {
      throw new Error(`Perfection produced no valid candidates (${runnerResults.length} runners, ${candidates.length} candidates)`)
    }

    this.perfectionSimCandidates = options.scoreOnly ? [perfectionSim] : candidates
    this.perfectionSimScore = perfectionSim.result!.simScore
    this.perfectionSimResult = options.scoreOnly
      ? undefined
      : cloneWorkerResult(perfectionSim.result!)
    this.perfectionSimRequest = perfectionSim.request
  }

  public calculateScores() {
    const metadata = this.metadata
    const originalSimResult = this.originalSimResult!
    const baselineSimResult = this.baselineSimResult!

    applyScoringFunction(baselineSimResult, metadata, true, false, this.context!, this.configType)
    applyScoringFunction(originalSimResult, metadata, true, true, this.context!, this.configType)

    const benchmarkSimScore = this.benchmarkSimScore!
    const originalSimScore = originalSimResult.simScore
    const perfectionSimScore = this.perfectionSimScore!

    const baselineSimScore = baselineSimResult.simScore

    // Store for calculateUpgrades() and calculateResults()
    this.benchmarkBaselineScore = baselineSimScore

    this.percent = calculateScorePercent(originalSimScore, baselineSimScore, benchmarkSimScore, perfectionSimScore)
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
      this.benchmarkBaselineScore!,
      this.benchmarkSimScore!,
      this.perfectionSimScore!,
      this.configType,
    )

    this.substatUpgradeResults = substatUpgradeResults
    this.setUpgradeResults = setUpgradeResults
    this.mainUpgradeResults = mainUpgradeResults
  }

  public calculateTeammateUpgrades() {
    const originalSim = this.originalSim!
    const metadata = this.metadata
    this.teammateOrnamentUpgradeResults = computeTeammateOrnamentUpgrades(this.form!, (modifiedForm) => {
      const simClone = clone(originalSim)
      const context = generateContext(modifiedForm)
      const result = runStatSimulations([simClone], modifiedForm, context, {
        ...benchmarkScoringParams,
        substatRollsModifier: (num: number) => num,
      })[0]
      applyScoringFunction(result, metadata, true, true, context, this.configType)
      return result.simScore
    })
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
      baselineSimScore: this.benchmarkBaselineScore!,
      benchmarkSimScore: this.benchmarkSimScore!,
      maximumSimScore: Math.max(this.perfectionSimScore!, this.benchmarkSimScore!),

      substatUpgrades: this.substatUpgradeResults!,
      setUpgrades: this.setUpgradeResults!,
      mainUpgrades: this.mainUpgradeResults!,
      teammateOrnamentUpgradeResults: this.teammateOrnamentUpgradeResults!,

      simulationForm: this.form!,
      simulationMetadata: this.metadata,

      originalSpd: this.originalSpd!,
      spdBenchmark: this.spdBenchmark!,
      simulationFlags: this.flags,
    }
  }
}
