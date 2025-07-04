import {
  Parts,
  Stats,
} from 'lib/constants/constants'
import { StatCalculator } from 'lib/relics/statCalculator'
import { PartialSimulationWrapper } from 'lib/scoring/simScoringUtils'
import { BenchmarkSimulationOrchestrator } from 'lib/simulations/orchestrator/benchmarkSimulationOrchestrator'
import {
  Simulation,
  SimulationRequest,
  StatSimTypes,
} from 'lib/simulations/statSimulationTypes'
import { KAFKA_B1 } from 'lib/simulations/tests/testMetadataConstants'
import { filterUnique } from 'lib/utils/arrayUtils'
import { CharacterId } from 'types/character'
import { SimulationMetadata } from 'types/metadata'

export function hasBuffedKafka(characterId: CharacterId, simulationMetadata: SimulationMetadata) {
  return characterId == KAFKA_B1 || simulationMetadata.teammates.find((x) => x.characterId == KAFKA_B1)
}

// Generate all main stat possibilities
export function generatePartialSimulations(
  orchestrator: BenchmarkSimulationOrchestrator,
) {
  const metadata = orchestrator.metadata
  const form = orchestrator.form!
  const simulationSets = orchestrator.simSets!

  const buffedKafka = hasBuffedKafka(form.characterId, metadata)

  const forceErrRope = orchestrator.flags.forceErrRope
  const ropeParts: string[] = forceErrRope ? [Stats.ERR] : metadata.parts[Parts.LinkRope]

  const { relicSet1, relicSet2, ornamentSet } = simulationSets

  const results: PartialSimulationWrapper[] = []

  // We need to run extra simulations for Kafka teams due to her EHR conversion
  if (buffedKafka) {
    {
      // Force EHR
      const bodyParts = filterUnique([...metadata.parts[Parts.Body], Stats.EHR])
      const substats = filterUnique([...metadata.substats, Stats.EHR])

      for (const body of bodyParts) {
        for (const feet of metadata.parts[Parts.Feet]) {
          for (const planarSphere of metadata.parts[Parts.PlanarSphere]) {
            for (const linkRope of ropeParts) {
              const request: SimulationRequest = {
                simRelicSet1: relicSet1,
                simRelicSet2: relicSet2,
                simOrnamentSet: ornamentSet,
                simBody: body,
                simFeet: feet,
                simPlanarSphere: planarSphere,
                simLinkRope: linkRope,
                stats: StatCalculator.getZeroesSubstats(),
              }
              const simulation: Simulation = {
                simType: StatSimTypes.SubstatRolls,
                request: request,
              }
              const partialSimulationWrapper: PartialSimulationWrapper = {
                simulation: simulation,
                speedRollsDeduction: 0,
                effectiveSubstats: substats,
              }
              results.push(partialSimulationWrapper)
            }
          }
        }
      }
    }

    {
      // Force Non-EHR
      const bodyParts = metadata.parts[Parts.Body].filter((x) => x != Stats.EHR)
      const substats = metadata.substats.filter((x) => x != Stats.EHR)

      for (const body of bodyParts) {
        for (const feet of metadata.parts[Parts.Feet]) {
          for (const planarSphere of metadata.parts[Parts.PlanarSphere]) {
            for (const linkRope of ropeParts) {
              const request: SimulationRequest = {
                simRelicSet1: relicSet1,
                simRelicSet2: relicSet2,
                simOrnamentSet: ornamentSet,
                simBody: body,
                simFeet: feet,
                simPlanarSphere: planarSphere,
                simLinkRope: linkRope,
                stats: StatCalculator.getZeroesSubstats(),
              }
              const simulation: Simulation = {
                simType: StatSimTypes.SubstatRolls,
                request: request,
              }
              const partialSimulationWrapper: PartialSimulationWrapper = {
                simulation: simulation,
                speedRollsDeduction: 0,
                effectiveSubstats: substats,
              }
              results.push(partialSimulationWrapper)
            }
          }
        }
      }
    }
  }

  for (const body of metadata.parts[Parts.Body]) {
    for (const feet of metadata.parts[Parts.Feet]) {
      for (const planarSphere of metadata.parts[Parts.PlanarSphere]) {
        for (const linkRope of ropeParts) {
          const request: SimulationRequest = {
            simRelicSet1: relicSet1,
            simRelicSet2: relicSet2,
            simOrnamentSet: ornamentSet,
            simBody: body,
            simFeet: feet,
            simPlanarSphere: planarSphere,
            simLinkRope: linkRope,
            stats: StatCalculator.getZeroesSubstats(),
          }
          const simulation: Simulation = {
            simType: StatSimTypes.SubstatRolls,
            request: request,
          }
          const partialSimulationWrapper: PartialSimulationWrapper = {
            simulation: simulation,
            speedRollsDeduction: 0,
            effectiveSubstats: metadata.substats,
          }
          results.push(partialSimulationWrapper)
        }
      }
    }
  }

  return results
}
