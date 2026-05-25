import { Sets } from 'lib/constants/constants'

// Set matching allows the scoring benchmark to recognize a user's equipped sets as valid alternatives,
// even when their value (action advance, team buffs, SP generation) isn't fully reflected in sim output.

export const SPREAD_RELICS_4P_GENERAL_CONDITIONALS = [
  [Sets.EagleOfTwilightLine, Sets.EagleOfTwilightLine],
]

export const SPREAD_RELICS_4P_SUPPORT = [
  [Sets.SacerdosRelivedOrdeal, Sets.SacerdosRelivedOrdeal],
  [Sets.EagleOfTwilightLine, Sets.EagleOfTwilightLine],
  [Sets.MessengerTraversingHackerspace, Sets.MessengerTraversingHackerspace],
]

export const SPREAD_RELICS_4P_HEAL = [
  ...SPREAD_RELICS_4P_SUPPORT,
  [Sets.WarriorGoddessOfSunAndThunder, Sets.WarriorGoddessOfSunAndThunder],
  [Sets.PasserbyOfWanderingCloud, Sets.PasserbyOfWanderingCloud],
]

export const SPREAD_RELICS_4P_SHIELD = [
  ...SPREAD_RELICS_4P_SUPPORT,
  [Sets.SelfEnshroudedRecluse, Sets.SelfEnshroudedRecluse],
  [Sets.KnightOfPurityPalace, Sets.KnightOfPurityPalace],
]

export const SPREAD_ORNAMENTS_2P_FUA = [
  Sets.DuranDynastyOfRunningWolves,
  Sets.SigoniaTheUnclaimedDesolation,
  Sets.InertSalsotto,
]

export const SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS = [
  Sets.SigoniaTheUnclaimedDesolation,
  Sets.ArcadiaOfWovenDreams,
]

export const SPREAD_ORNAMENTS_2P_ENERGY_REGEN = [
  Sets.SprightlyVonwacq,
  Sets.PenaconyLandOfTheDreams,
  Sets.LushakaTheSunkenSeas,
]

export const SPREAD_ORNAMENTS_2P_SUPPORT = [
  Sets.SprightlyVonwacq,
  Sets.BrokenKeel,
  Sets.PenaconyLandOfTheDreams,
  Sets.FleetOfTheAgeless,
  Sets.LushakaTheSunkenSeas,
  Sets.CityOfConvergingStars,
]

export const SPREAD_ORNAMENTS_2P_HEAL = [
  ...SPREAD_ORNAMENTS_2P_SUPPORT,
  Sets.GiantTreeOfRaptBrooding,
]
