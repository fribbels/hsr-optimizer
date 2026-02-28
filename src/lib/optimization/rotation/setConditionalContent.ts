import { TFunction } from 'i18next'
import {
  ConditionalDataType,
  Constants,
  Sets,
} from 'lib/constants/constants'
import { TsUtils } from 'lib/utils/TsUtils'

export type SelectOptionContent = {
  display: string,
  value: number,
  label: string,
}

type SetConditionalTFunction = TFunction<'optimizerTab', 'SetConditionals.SelectOptions'>

export type SetMetadata = {
  type: ConditionalDataType,
  modifiable?: boolean,
  selectionOptions?: (t: SetConditionalTFunction) => SelectOptionContent[],
}

export function generateSetConditionalContent(t: SetConditionalTFunction) {
  return Object.values(Constants.Sets).reduce((acc, cur) => {
    acc[cur] = ConditionalSetMetadata[cur].selectionOptions?.(t) ?? []
    return acc
  }, {} as Record<Sets, SelectOptionContent[]>)
}

export const ConditionalSetMetadata: Readonly<Record<Sets, SetMetadata>> = {
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
    selectionOptions: SetContentChampionOfStreetwiseBoxing,
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
    selectionOptions: SetContentWastelanderOfBanditryDesert,
    modifiable: true,
  },
  [Sets.LongevousDisciple]: {
    type: ConditionalDataType.SELECT,
    selectionOptions: SetContentLongevousDisciple,
    modifiable: true,
  },
  [Sets.MessengerTraversingHackerspace]: {
    type: ConditionalDataType.BOOLEAN,
    modifiable: true,
  },
  [Sets.TheAshblazingGrandDuke]: {
    type: ConditionalDataType.SELECT,
    selectionOptions: SetContentTheAshblazingGrandDuke,
    modifiable: true,
  },
  [Sets.PrisonerInDeepConfinement]: {
    type: ConditionalDataType.SELECT,
    selectionOptions: SetContentPrisonerInDeepConfinement,
    modifiable: true,
  },
  [Sets.PioneerDiverOfDeadWaters]: {
    type: ConditionalDataType.SELECT,
    selectionOptions: SetContentPioneerDiverOfDeadWaters,
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
    selectionOptions: SetContentSacerdosRelivedOrdealOptions,
  },
  [Sets.ScholarLostInErudition]: {
    type: ConditionalDataType.BOOLEAN,
    modifiable: true,
  },
  [Sets.HeroOfTriumphantSong]: {
    type: ConditionalDataType.BOOLEAN,
    modifiable: true,
  },
  [Sets.PoetOfMourningCollapse]: {
    type: ConditionalDataType.BOOLEAN,
    modifiable: false,
  },
  [Sets.WarriorGoddessOfSunAndThunder]: {
    type: ConditionalDataType.BOOLEAN,
    modifiable: true,
  },
  [Sets.WavestriderCaptain]: {
    type: ConditionalDataType.BOOLEAN,
    modifiable: true,
  },
  [Sets.WorldRemakingDeliverer]: {
    type: ConditionalDataType.BOOLEAN,
    modifiable: true,
  },
  [Sets.SelfEnshroudedRecluse]: {
    type: ConditionalDataType.BOOLEAN,
    modifiable: true,
  },
  [Sets.EverGloriousMagicalGirl]: {
    type: ConditionalDataType.SELECT,
    selectionOptions: SetContentEverGloriousMagicalGirl,
    modifiable: true,
  },
  [Sets.DivinerOfDistantReach]: {
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
    modifiable: true,
  },
  [Sets.SigoniaTheUnclaimedDesolation]: {
    type: ConditionalDataType.SELECT,
    modifiable: true,
    selectionOptions: SetContentSigoniaTheUnclaimedDesolation,
  },
  [Sets.IzumoGenseiAndTakamaDivineRealm]: {
    type: ConditionalDataType.BOOLEAN,
    modifiable: true,
  },
  [Sets.DuranDynastyOfRunningWolves]: {
    type: ConditionalDataType.SELECT,
    modifiable: true,
    selectionOptions: SetContentDuranDynastyOfRunningWolves,
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
  [Sets.BoneCollectionsSereneDemesne]: {
    type: ConditionalDataType.BOOLEAN,
  },
  [Sets.GiantTreeOfRaptBrooding]: {
    type: ConditionalDataType.BOOLEAN,
  },
  [Sets.ArcadiaOfWovenDreams]: {
    type: ConditionalDataType.SELECT,
    selectionOptions: SetContentArcadiaOfWovenDreams,
    modifiable: true,
  },
  [Sets.RevelryByTheSea]: {
    type: ConditionalDataType.BOOLEAN,
  },
  [Sets.AmphoreusTheEternalLand]: {
    type: ConditionalDataType.BOOLEAN,
    modifiable: true,
  },
  [Sets.TengokuLivestream]: {
    type: ConditionalDataType.BOOLEAN,
    modifiable: true,
  },
}

function SetContentChampionOfStreetwiseBoxing(t: SetConditionalTFunction): SelectOptionContent[] {
  return Array.from({ length: 6 }).map((_val, i) => ({
    display: t('Streetwise.Display', { stackCount: i }), // i + 'x',
    value: i,
    label: t('Streetwise.Label', { stackCount: i, buffValue: 5 * i }), // `${i} stacks (+${i * 5}% ATK)`,
  }))
}

function SetContentWastelanderOfBanditryDesert(t: SetConditionalTFunction): SelectOptionContent[] {
  return [
    {
      display: t('Wastelander.Off.Display'), // 'Off',
      value: 0,
      label: t('Wastelander.Off.Label'), // 'Off',
    },
    {
      display: t('Wastelander.Debuffed.Display'), // 'CR',
      value: 1,
      label: t('Wastelander.Debuffed.Label'), // 'Debuffed (+10% CR)',
    },
    {
      display: t('Wastelander.Imprisoned.Display'), // 'CR+CD',
      value: 2,
      label: t('Wastelander.Imprisoned.Label'), // 'Imprisoned (+10% CR | +20% CD)',
    },
  ]
}

function SetContentLongevousDisciple(t: SetConditionalTFunction): SelectOptionContent[] {
  return Array.from({ length: 3 }).map((_val, i) => ({
    display: t('Longevous.Display', { stackCount: i }), // i + 'x',
    value: i,
    label: t('Longevous.Label', { stackCount: i, buffValue: 8 * i }), // `${i} stacks (+${i * 8}% CR)`,
  }))
}

function SetContentTheAshblazingGrandDuke(t: SetConditionalTFunction): SelectOptionContent[] {
  return Array.from({ length: 9 }).map((_val, i) => ({
    display: t('Ashblazing.Display', { stackCount: i }), // i + 'x',
    value: i,
    label: t('Ashblazing.Label', { stackCount: i, buffValue: 6 * i }), // `${i} stacks (+${6 * i}% ATK)`,
  }))
}

function SetContentPrisonerInDeepConfinement(t: SetConditionalTFunction): SelectOptionContent[] {
  return Array.from({ length: 4 }).map((_val, i) => ({
    display: t('Prisoner.Display', { stackCount: i }), // i + 'x',
    value: i,
    label: t('Prisoner.Label', { stackCount: i, buffValue: 6 * i }), // `${i} stacks (+${6 * i}% DEF ignore)`,
  }))
}

function SetContentPioneerDiverOfDeadWaters(t: SetConditionalTFunction): SelectOptionContent[] {
  return [
    {
      display: t('Diver.Off.Display'), // '0x',
      value: -1,
      label: t('Diver.Off.Label'), // '0 debuffs (+4% base CR)',
    },
    {
      display: t('Diver.1Debuff.Display'), // '1x',
      value: 0,
      label: t('Diver.1Debuff.Label'), // '1 debuff (+12% DMG | +4% base CR)',
    },
    {
      display: t('Diver.2Debuff.Display'), // '2x',
      value: 1,
      label: t('Diver.2Debuff.Label'), // '2 debuffs (+12% DMG | +4% base CR | +8% CD)',
    },
    {
      display: t('Diver.3Debuff.Display'), // '3x',
      value: 2,
      label: t('Diver.3Debuff.Label'), // '3 debuffs (+12% DMG | +4% base CR | +12% CD)',
    },
    {
      display: t('Diver.2+Debuff.Display'), // '2x +',
      value: 3,
      label: t('Diver.2+Debuff.Label'), // '2 debuffs, enhanced (+12% DMG | +4% base CR | +4% combat CR | +16% CD)',
    },
    {
      display: t('Diver.3+Debuff.Display'), // '3x +',
      value: 4,
      label: t('Diver.3+Debuff.Label'), // '3 debuffs, enhanced (+12% DMG | +4% base CR | +4% combat CR | +24% CD)',
    },
  ]
}

function SetContentSacerdosRelivedOrdealOptions(t: SetConditionalTFunction): SelectOptionContent[] {
  return Array.from({ length: 3 }).map((_val, i) => ({
    display: t('Sacerdos.Display', { stackCount: i }), // i + 'x',
    value: i,
    label: t('Sacerdos.Label', { stackCount: i, buffValue: 18 * i }), // `${i} stacks (+${i * 18}% CD)`,
  }))
}

function SetContentEverGloriousMagicalGirl(t: SetConditionalTFunction): SelectOptionContent[] {
  return Array.from({ length: 11 }).map((_val, i) => ({
    display: t('MagicalGirl.Display', { stackCount: i }),
    value: i,
    label: t('MagicalGirl.Label', { stackCount: i }),
  }))
}

function SetContentSigoniaTheUnclaimedDesolation(t: SetConditionalTFunction): SelectOptionContent[] {
  return Array.from({ length: 11 }).map((_val, i) => ({
    display: t('Sigonia.Display', { stackCount: i }), // i + 'x',
    value: i,
    label: t('Sigonia.Label', { stackCount: i, buffValue: 4 * i }), // `${i} stacks (+${4 * i}% CD)`,
  }))
}

function SetContentDuranDynastyOfRunningWolves(t: SetConditionalTFunction): SelectOptionContent[] {
  return Array.from({ length: 6 }).map((_val, i) => {
    const label = i === 5 ? t('Duran.Label5') : t('Duran.Label', { stackCount: i, buffValue: TsUtils.precisionRound(5 * i) })
    // `${i} stacks (+${5 * i}% FUA DMG)`,
    // `${5} stacks (+${5 * 5}% FUA DMG + 25% CD)` :
    return {
      display: t('Duran.Display', { stackCount: i }), // i + 'x',
      value: i,
      label,
    }
  })
}

function SetContentArcadiaOfWovenDreams(t: SetConditionalTFunction): SelectOptionContent[] {
  return Array.from({ length: 8 }).map((_val, i) => {
    const allyCount = i + 1
    return {
      display: t('Arcadia.Display', { allyCount }), // `${i + 1}x`,
      value: allyCount,
      label: t('Arcadia.Label', {
        buffValue: Math.max(12 * (4 - allyCount), 9 * (allyCount - 4)), // `${allyCount} allies (+{{ buffValue }}% DMG)`,
        allyCount,
      }),
    }
  })
}
