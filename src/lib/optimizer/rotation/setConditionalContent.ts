import { ConditionalDataType, Constants, Sets } from 'lib/constants'

export type SelectOptionContent = {
  display: string
  value: number
  label: string
}

export type SetMetadata = {
  type: ConditionalDataType
  modifiable?: boolean
  selectionOptions?: SelectOptionContent[]
}

export function generateSetConditionalContent() {
  const content: { [key: string]: SelectOptionContent[] } = {}

  for (const [setKey, setName] of Object.entries(Constants.Sets)) {
    content[setName] = ConditionalSetMetadata[setName].selectionOptions || []
  }

  return content
}

export const ConditionalSetMetadata: { [key: string]: SetMetadata } = {
  // Relics

  [Sets.PasserbyOfWanderingCloud]: {
    type: ConditionalDataType.BOOLEAN,
  },
  [Sets.MusketeerOfWildWheat]: {
    type: ConditionalDataType.BOOLEAN,
  },
  [Sets.KnightOfPurityPalace]: {
    type: ConditionalDataType.BOOLEAN,
  },
  [Sets.HunterOfGlacialForest]: {
    type: ConditionalDataType.BOOLEAN,
    modifiable: true,
  },
  [Sets.ChampionOfStreetwiseBoxing]: {
    type: ConditionalDataType.SELECT,
    modifiable: true,
    selectionOptions: SetContentChampionOfStreetwiseBoxing(),
  },
  [Sets.GuardOfWutheringSnow]: {
    type: ConditionalDataType.BOOLEAN,
  },
  [Sets.FiresmithOfLavaForging]: {
    type: ConditionalDataType.BOOLEAN,
    modifiable: true,
  },
  [Sets.GeniusOfBrilliantStars]: {
    type: ConditionalDataType.BOOLEAN,
    modifiable: true,
  },
  [Sets.BandOfSizzlingThunder]: {
    type: ConditionalDataType.BOOLEAN,
    modifiable: true,
  },
  [Sets.EagleOfTwilightLine]: {
    type: ConditionalDataType.BOOLEAN,
  },
  [Sets.ThiefOfShootingMeteor]: {
    type: ConditionalDataType.BOOLEAN,
  },
  [Sets.WastelanderOfBanditryDesert]: {
    type: ConditionalDataType.SELECT,
    selectionOptions: SetContentWastelanderOfBanditryDesert(),
    modifiable: true,
  },
  [Sets.LongevousDisciple]: {
    type: ConditionalDataType.SELECT,
    selectionOptions: SetContentLongevousDisciple(),
    modifiable: true,
  },
  [Sets.MessengerTraversingHackerspace]: {
    type: ConditionalDataType.BOOLEAN,
    modifiable: true,
  },
  [Sets.TheAshblazingGrandDuke]: {
    type: ConditionalDataType.SELECT,
    selectionOptions: SetContentTheAshblazingGrandDuke(),
    modifiable: true,
  },
  [Sets.PrisonerInDeepConfinement]: {
    type: ConditionalDataType.SELECT,
    selectionOptions: SetContentPrisonerInDeepConfinement(),
    modifiable: true,
  },
  [Sets.PioneerDiverOfDeadWaters]: {
    type: ConditionalDataType.SELECT,
    selectionOptions: SetContentPioneerDiverOfDeadWaters(),
    modifiable: true,
  },
  [Sets.WatchmakerMasterOfDreamMachinations]: {
    type: ConditionalDataType.BOOLEAN,
    modifiable: true,
  },
  [Sets.IronCavalryAgainstTheScourge]: {
    type: ConditionalDataType.BOOLEAN,
  },
  [Sets.TheWindSoaringValorous]: {
    type: ConditionalDataType.BOOLEAN,
    modifiable: true,
  },
  [Sets.SacerdosRelivedOrdeal]: {
    type: ConditionalDataType.SELECT,
    modifiable: true,
    selectionOptions: SetContentSacerdosRelivedOrdealOptions(),
  },
  [Sets.ScholarLostInErudition]: {
    type: ConditionalDataType.BOOLEAN,
    modifiable: true,
  },

  // Ornaments

  [Sets.SpaceSealingStation]: {
    type: ConditionalDataType.BOOLEAN,
  },
  [Sets.FleetOfTheAgeless]: {
    type: ConditionalDataType.BOOLEAN,
  },
  [Sets.PanCosmicCommercialEnterprise]: {
    type: ConditionalDataType.BOOLEAN,
  },
  [Sets.BelobogOfTheArchitects]: {
    type: ConditionalDataType.BOOLEAN,
  },
  [Sets.CelestialDifferentiator]: {
    type: ConditionalDataType.BOOLEAN,
    modifiable: true,
  },
  [Sets.InertSalsotto]: {
    type: ConditionalDataType.BOOLEAN,
  },
  [Sets.TaliaKingdomOfBanditry]: {
    type: ConditionalDataType.BOOLEAN,
  },
  [Sets.SprightlyVonwacq]: {
    type: ConditionalDataType.BOOLEAN,
  },
  [Sets.RutilantArena]: {
    type: ConditionalDataType.BOOLEAN,
  },
  [Sets.BrokenKeel]: {
    type: ConditionalDataType.BOOLEAN,
  },
  [Sets.FirmamentFrontlineGlamoth]: {
    type: ConditionalDataType.BOOLEAN,
  },
  [Sets.PenaconyLandOfTheDreams]: {
    type: ConditionalDataType.BOOLEAN,
  },
  [Sets.SigoniaTheUnclaimedDesolation]: {
    type: ConditionalDataType.SELECT,
    modifiable: true,
    selectionOptions: SetContentSigoniaTheUnclaimedDesolation(),
  },
  [Sets.IzumoGenseiAndTakamaDivineRealm]: {
    type: ConditionalDataType.BOOLEAN,
    modifiable: true,
  },
  [Sets.DuranDynastyOfRunningWolves]: {
    type: ConditionalDataType.SELECT,
    modifiable: true,
    selectionOptions: SetContentDuranDynastyOfRunningWolves(),
  },
  [Sets.ForgeOfTheKalpagniLantern]: {
    type: ConditionalDataType.BOOLEAN,
    modifiable: true,
  },
  [Sets.LushakaTheSunkenSeas]: {
    type: ConditionalDataType.BOOLEAN,
  },
  [Sets.TheWondrousBananAmusementPark]: {
    type: ConditionalDataType.BOOLEAN,
    modifiable: true,
  },
}

function SetContentSacerdosRelivedOrdealOptions() {
  const options: SelectOptionContent[] = []
  for (let i = 0; i <= 2; i++) {
    options.push({
      display: i + 'x',
      value: i,
      label: `${i} stacks (+${i * 18}% CD)`,
    })
  }

  return options
}

function SetContentChampionOfStreetwiseBoxing() {
  const options: SelectOptionContent[] = []
  for (let i = 0; i <= 5; i++) {
    options.push({
      display: i + 'x',
      value: i,
      label: `${i} stacks (+${i * 5}% ATK)`,
    })
  }

  return options
}

function SetContentWastelanderOfBanditryDesert() {
  return [
    {
      display: 'Off',
      value: 0,
      label: 'Off',
    },
    {
      display: 'CR',
      value: 1,
      label: 'Debuffed (+10% CR)',
    },
    {
      display: 'CR+CD',
      value: 2,
      label: 'Imprisoned (+10% CR | +20% CD)',
    },
  ]
}

function SetContentLongevousDisciple() {
  const options: SelectOptionContent[] = []
  for (let i = 0; i <= 2; i++) {
    options.push({
      display: i + 'x',
      value: i,
      label: `${i} stacks (+${i * 8}% CR)`,
    })
  }

  return options
}

function SetContentTheAshblazingGrandDuke() {
  const options: SelectOptionContent[] = []
  for (let i = 0; i <= 8; i++) {
    options.push({
      display: i + 'x',
      value: i,
      label: `${i} stacks (+${6 * i}% ATK)`,
    })
  }

  return options
}

function SetContentPrisonerInDeepConfinement() {
  const options: SelectOptionContent[] = []
  for (let i = 0; i <= 3; i++) {
    options.push({
      display: i + 'x',
      value: i,
      label: `${i} stacks (+${6 * i}% DEF ignore)`,
    })
  }

  return options
}

function SetContentPioneerDiverOfDeadWaters() {
  return [
    {
      display: '0x',
      value: -1,
      label: '0 debuffs (+4% base CR)',
    },
    {
      display: '1x',
      value: 0,
      label: '1 debuff (+12% DMG | +4% base CR)',
    },
    {
      display: '2x',
      value: 1,
      label: '2 debuffs (+12% DMG | +4% base CR | +8% CD)',
    },
    {
      display: '3x',
      value: 2,
      label: '3 debuffs (+12% DMG | +4% base CR | +12% CD)',
    },
    {
      display: '2x +',
      value: 3,
      label: '2 debuffs, enhanced (+12% DMG | +4% base CR | +4% combat CR | +16% CD)',
    },
    {
      display: '3x +',
      value: 4,
      label: '3 debuffs, enhanced (+12% DMG | +4% base CR | +4% combat CR | +24% CD)',
    },
  ]
}

function SetContentSigoniaTheUnclaimedDesolation() {
  const options: SelectOptionContent[] = []
  for (let i = 0; i <= 10; i++) {
    options.push({
      display: i + 'x',
      value: i,
      label: `${i} stacks (+${4 * i}% CD)`,
    })
  }

  return options
}

function SetContentDuranDynastyOfRunningWolves() {
  const options: SelectOptionContent[] = []
  for (let i = 0; i <= 5; i++) {
    options.push({
      display: i + 'x',
      value: i,
      label: `${i} stacks (+${5 * i}% FUA DMG)`,
    })
  }

  options[5].label = `${5} stacks (+${5 * 5}% FUA DMG + 25% CD)`

  return options
}