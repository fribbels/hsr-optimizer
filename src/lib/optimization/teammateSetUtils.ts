import { Sunday } from 'lib/conditionals/character/1300/Sunday'
import {
  SACERDOS_RELIVED_ORDEAL_1_STACK,
  SACERDOS_RELIVED_ORDEAL_2_STACK,
  Sets,
} from 'lib/constants/constants'
import type { Sets as SetName } from 'lib/constants/constants'
import type {
  Character,
  CharacterId,
} from 'types/character'
import type {
  Relic,
  RelicId,
} from 'types/relic'

// Messenger is excluded because equipment alone cannot prove its ultimate activation.
const TEAMMATE_RELIC_SETS: readonly SetName[] = [
  Sets.WatchmakerMasterOfDreamMachinations,
  Sets.SacerdosRelivedOrdeal,
  Sets.WarriorGoddessOfSunAndThunder,
  Sets.WorldRemakingDeliverer,
  Sets.SelfEnshroudedRecluse,
  Sets.DivinerOfDistantReach,
  Sets.DivineQueryingMasterSmith,
  Sets.DreamlitActor,
]

const TEAMMATE_ORNAMENT_SETS: readonly SetName[] = [
  Sets.BrokenKeel,
  Sets.FleetOfTheAgeless,
  Sets.PenaconyLandOfTheDreams,
  Sets.LushakaTheSunkenSeas,
  Sets.AmphoreusTheEternalLand,
  Sets.CityOfConvergingStars,
]

export interface ActiveTeammateSets {
  teamRelicSet?: string
  teamOrnamentSet?: string
}

/** Finds the supported team buffs supplied by a character's currently equipped sets. */
export function calculateTeammateSets(
  teammateCharacter: Character,
  relicsById: Partial<Record<RelicId, Relic>>,
): ActiveTeammateSets {
  const equippedSetCounts = countEquippedSets(teammateCharacter, relicsById)
  const relicSet = findEquippedSet(TEAMMATE_RELIC_SETS, equippedSetCounts, 4)
  const ornamentSet = findEquippedSet(TEAMMATE_ORNAMENT_SETS, equippedSetCounts, 2)

  return {
    teamRelicSet: resolveTeammateRelicSet(teammateCharacter.id, relicSet),
    teamOrnamentSet: ornamentSet,
  }
}

function countEquippedSets(
  character: Character,
  relicsById: Partial<Record<RelicId, Relic>>,
): Map<SetName, number> {
  const counts = new Map<SetName, number>()

  for (const relicId of Object.values(character.equipped)) {
    if (!relicId) continue
    const set = relicsById[relicId]?.set
    if (!set) continue
    counts.set(set, (counts.get(set) ?? 0) + 1)
  }

  return counts
}

function findEquippedSet(
  supportedSets: readonly SetName[],
  equippedSetCounts: Map<SetName, number>,
  requiredPieces: number,
): SetName | undefined {
  return supportedSets.find((set) => equippedSetCounts.get(set) === requiredPieces)
}

function resolveTeammateRelicSet(characterId: CharacterId, relicSet: SetName | undefined): string | undefined {
  if (relicSet !== Sets.SacerdosRelivedOrdeal) return relicSet
  return characterId === Sunday.id
    ? SACERDOS_RELIVED_ORDEAL_2_STACK
    : SACERDOS_RELIVED_ORDEAL_1_STACK
}
