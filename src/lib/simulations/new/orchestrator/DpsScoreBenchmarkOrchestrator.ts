import { CUSTOM_TEAM, Parts, Sets, Stats } from 'lib/constants/constants'
import { SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import { SimulationFlags, SimulationResult } from 'lib/scoring/simScoringUtils'
import { Simulation } from 'lib/simulations/statSimulationController'
import DB from 'lib/state/db'
import { TsUtils } from 'lib/utils/TsUtils'
import { Character } from 'types/character'
import { SimulationMetadata } from 'types/metadata'

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
) {
  const simulationMetadata = resolveDpsScoreSimulationMetadata(character, teamSelection)
  if (!simulationMetadata) {
    return null
  }

  const orchestrator = new DpsScoreBenchmarkOrchestrator(simulationMetadata)

  orchestrator.setMetadata()
  orchestrator.setFlags()
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

  const customScoringMetadata = TsUtils.clone(DB.getMetadata().characters[character.id].scoringMetadata)
  const defaultScoringMetadata = TsUtils.clone(DB.getScoringMetadata(character.id))

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
    if (metadata.teammates.find((teammate) => teammate.characterId == '1313' && teammate.characterEidolon == 6)) {
      this.flags.overcapCritRate = true
    }
  }

  public setRelics(relicsByPart: SingleRelicByPart) {

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
}
