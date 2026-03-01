import { Sets } from 'lib/constants/constants'

export const MATCH_2P_WEIGHT = 0.75
export const T2_WEIGHT = 0.9

export function weights<K extends string>(sets: K[], weight: number = 1) {
  return sets.reduce((acc, set) => {
    acc[set] = weight
    return acc
  }, {} as Record<K, number>)
}

export const RELICS_2P_BREAK_EFFECT_SPEED = [
  Sets.MessengerTraversingHackerspace,
  Sets.SacerdosRelivedOrdeal,
  Sets.ThiefOfShootingMeteor,
  Sets.WatchmakerMasterOfDreamMachinations,
  Sets.IronCavalryAgainstTheScourge,
  Sets.WarriorGoddessOfSunAndThunder,
]

export const RELICS_2P_SPEED = [
  Sets.MessengerTraversingHackerspace,
  Sets.SacerdosRelivedOrdeal,
  Sets.WarriorGoddessOfSunAndThunder,
]

export const RELICS_2P_ATK = [
  Sets.MusketeerOfWildWheat,
  Sets.PrisonerInDeepConfinement,
  Sets.TheWindSoaringValorous,
  Sets.HeroOfTriumphantSong,
]

export const SPREAD_RELICS_2P_SPEED_WEIGHTS = {
  [Sets.WarriorGoddessOfSunAndThunder]: MATCH_2P_WEIGHT,
  [Sets.MessengerTraversingHackerspace]: MATCH_2P_WEIGHT,
  [Sets.SacerdosRelivedOrdeal]: MATCH_2P_WEIGHT,
}

export const SPREAD_RELICS_2P_BREAK_WEIGHTS = {
  [Sets.ThiefOfShootingMeteor]: MATCH_2P_WEIGHT,
  [Sets.WatchmakerMasterOfDreamMachinations]: MATCH_2P_WEIGHT,
  [Sets.IronCavalryAgainstTheScourge]: MATCH_2P_WEIGHT,
}

export const SPREAD_RELICS_2P_ATK_WEIGHTS = {
  [Sets.MusketeerOfWildWheat]: MATCH_2P_WEIGHT,
  [Sets.PrisonerInDeepConfinement]: MATCH_2P_WEIGHT,
  [Sets.TheWindSoaringValorous]: MATCH_2P_WEIGHT,
  [Sets.HeroOfTriumphantSong]: MATCH_2P_WEIGHT,
}

export const SPREAD_RELICS_2P_ATK_CRIT_WEIGHTS = {
  ...SPREAD_RELICS_2P_ATK_WEIGHTS,
  [Sets.ScholarLostInErudition]: MATCH_2P_WEIGHT,
  [Sets.WorldRemakingDeliverer]: MATCH_2P_WEIGHT,
}

export const SPREAD_RELICS_4P_GENERAL_CONDITIONALS = [
  [Sets.WavestriderCaptain, Sets.WavestriderCaptain],
  [Sets.PoetOfMourningCollapse, Sets.PoetOfMourningCollapse],
  [Sets.PioneerDiverOfDeadWaters, Sets.PioneerDiverOfDeadWaters],
  [Sets.EagleOfTwilightLine, Sets.EagleOfTwilightLine],
]

export const SPREAD_ORNAMENTS_2P_FUA = [
  Sets.DuranDynastyOfRunningWolves,
  Sets.SigoniaTheUnclaimedDesolation,
  Sets.InertSalsotto,
]

export const SPREAD_ORNAMENTS_2P_FUA_WEIGHTS = weights(SPREAD_ORNAMENTS_2P_FUA)

export const SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS = [
  Sets.SigoniaTheUnclaimedDesolation,
  Sets.ArcadiaOfWovenDreams,
]

export const SPREAD_ORNAMENTS_2P_ENERGY_REGEN = [
  Sets.SprightlyVonwacq,
  Sets.PenaconyLandOfTheDreams,
  Sets.LushakaTheSunkenSeas,
]

export const SPREAD_ORNAMENTS_2P_ENERGY_REGEN_WEIGHTS = weights(SPREAD_ORNAMENTS_2P_ENERGY_REGEN)

export const SPREAD_ORNAMENTS_2P_SUPPORT = [
  Sets.SprightlyVonwacq,
  Sets.BrokenKeel,
  Sets.PenaconyLandOfTheDreams,
  Sets.FleetOfTheAgeless,
  Sets.LushakaTheSunkenSeas,
  Sets.ForgeOfTheKalpagniLantern,
  Sets.GiantTreeOfRaptBrooding,
]

export const SPREAD_ORNAMENTS_2P_SUPPORT_WEIGHTS = weights(SPREAD_ORNAMENTS_2P_SUPPORT)
