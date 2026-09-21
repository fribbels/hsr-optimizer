import { Sparkle } from 'lib/conditionals/character/1300/Sparkle'
import { Sunday } from 'lib/conditionals/character/1300/Sunday'
import {
  SACERDOS_RELIVED_ORDEAL_1_STACK,
  SACERDOS_RELIVED_ORDEAL_2_STACK,
  Sets,
} from 'lib/constants/constants'
import type {
  Character,
  CharacterId,
} from 'types/character'
import type { Relic } from 'types/relic'

const TEAMMATE_RELIC_SETS = [
  Sets.MessengerTraversingHackerspace,
  Sets.WatchmakerMasterOfDreamMachinations,
  Sets.SacerdosRelivedOrdeal,
  Sets.WarriorGoddessOfSunAndThunder,
  Sets.WorldRemakingDeliverer,
  Sets.SelfEnshroudedRecluse,
  Sets.DivinerOfDistantReach,
  Sets.DivineQueryingMasterSmith,
  Sets.DreamlitActor,
]

const TEAMMATE_ORNAMENT_SETS = [
  Sets.BrokenKeel,
  Sets.FleetOfTheAgeless,
  Sets.PenaconyLandOfTheDreams,
  Sets.LushakaTheSunkenSeas,
  Sets.AmphoreusTheEternalLand,
  Sets.CityOfConvergingStars,
]

const SACERDOS_TWO_STACK_CHARACTERS: ReadonlySet<CharacterId> = new Set([
  Sunday.id,
  Sparkle.id,
])

export interface ActiveTeammateSets {
  teamRelicSet?: string
  teamOrnamentSet?: string
}

/** Finds the supported team buffs supplied by a character's currently equipped sets. */
export function calculateTeammateSets(
  teammateCharacter: Character,
  relicsById: Partial<Record<string, Relic>>,
): ActiveTeammateSets {
  const relics = Object.values(teammateCharacter.equipped)
    .map((id) => id ? relicsById[id] : undefined)
    .filter((relic): relic is Relic => relic != null)
  const setCounts = new Map<string, number>()
  for (const relic of relics) {
    setCounts.set(relic.set, (setCounts.get(relic.set) ?? 0) + 1)
  }
  const activeTeammateSets: ActiveTeammateSets = {}

  for (const set of TEAMMATE_RELIC_SETS) {
    if (setCounts.get(set) !== 4) continue
    // Messenger's team buff requires an ultimate activation, which equipment alone cannot prove.
    if (set === Sets.MessengerTraversingHackerspace) continue
    if (set === Sets.SacerdosRelivedOrdeal) {
      activeTeammateSets.teamRelicSet = SACERDOS_TWO_STACK_CHARACTERS.has(teammateCharacter.id)
        ? SACERDOS_RELIVED_ORDEAL_2_STACK
        : SACERDOS_RELIVED_ORDEAL_1_STACK
    } else {
      activeTeammateSets.teamRelicSet = set
    }
  }

  for (const set of TEAMMATE_ORNAMENT_SETS) {
    if (setCounts.get(set) === 2) {
      activeTeammateSets.teamOrnamentSet = set
    }
  }

  return activeTeammateSets
}
