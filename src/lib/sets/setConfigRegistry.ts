import {
  ConditionalDataType,
  SetKey,
  Sets,
} from 'lib/constants/constants'
import { DynamicConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import {
  OptimizerAction,
  OptimizerContext,
  SetConditional,
} from 'types/optimizer'
import {
  SetConfig,
  SetType,
  TeammateOption,
} from 'types/setConfig'

// ── Typed config imports for type derivation ──
import { AmphoreusTheEternalLand } from './ornaments/AmphoreusTheEternalLand'
import { ArcadiaOfWovenDreams } from './ornaments/ArcadiaOfWovenDreams'
import { BelobogOfTheArchitects } from './ornaments/BelobogOfTheArchitects'
import { BoneCollectionsSereneDemesne } from './ornaments/BoneCollectionsSereneDemesne'
import { BrokenKeel } from './ornaments/BrokenKeel'
import { CelestialDifferentiator } from './ornaments/CelestialDifferentiator'
import { DuranDynastyOfRunningWolves } from './ornaments/DuranDynastyOfRunningWolves'
import { FirmamentFrontlineGlamoth } from './ornaments/FirmamentFrontlineGlamoth'
import { FleetOfTheAgeless } from './ornaments/FleetOfTheAgeless'
import { ForgeOfTheKalpagniLantern } from './ornaments/ForgeOfTheKalpagniLantern'
import { GiantTreeOfRaptBrooding } from './ornaments/GiantTreeOfRaptBrooding'
import { InertSalsotto } from './ornaments/InertSalsotto'
import { IzumoGenseiAndTakamaDivineRealm } from './ornaments/IzumoGenseiAndTakamaDivineRealm'
import { LushakaTheSunkenSeas } from './ornaments/LushakaTheSunkenSeas'
import { PanCosmicCommercialEnterprise } from './ornaments/PanCosmicCommercialEnterprise'
import { PenaconyLandOfTheDreams } from './ornaments/PenaconyLandOfTheDreams'
import { RevelryByTheSea } from './ornaments/RevelryByTheSea'
import { RutilantArena } from './ornaments/RutilantArena'
import { SigoniaTheUnclaimedDesolation } from './ornaments/SigoniaTheUnclaimedDesolation'
import { SpaceSealingStation } from './ornaments/SpaceSealingStation'
import { SprightlyVonwacq } from './ornaments/SprightlyVonwacq'
import { TaliaKingdomOfBanditry } from './ornaments/TaliaKingdomOfBanditry'
import { TengokuLivestream } from './ornaments/TengokuLivestream'
import { TheWondrousBananAmusementPark } from './ornaments/TheWondrousBananAmusementPark'
import { BandOfSizzlingThunder } from './relics/BandOfSizzlingThunder'
import { ChampionOfStreetwiseBoxing } from './relics/ChampionOfStreetwiseBoxing'
import { DivinerOfDistantReach } from './relics/DivinerOfDistantReach'
import { EagleOfTwilightLine } from './relics/EagleOfTwilightLine'
import { EverGloriousMagicalGirl } from './relics/EverGloriousMagicalGirl'
import { FiresmithOfLavaForging } from './relics/FiresmithOfLavaForging'
import { GeniusOfBrilliantStars } from './relics/GeniusOfBrilliantStars'
import { GuardOfWutheringSnow } from './relics/GuardOfWutheringSnow'
import { HeroOfTriumphantSong } from './relics/HeroOfTriumphantSong'
import { HunterOfGlacialForest } from './relics/HunterOfGlacialForest'
import { IronCavalryAgainstTheScourge } from './relics/IronCavalryAgainstTheScourge'
import { KnightOfPurityPalace } from './relics/KnightOfPurityPalace'
import { LongevousDisciple } from './relics/LongevousDisciple'
import { MessengerTraversingHackerspace } from './relics/MessengerTraversingHackerspace'
import { MusketeerOfWildWheat } from './relics/MusketeerOfWildWheat'
import { PasserbyOfWanderingCloud } from './relics/PasserbyOfWanderingCloud'
import { PioneerDiverOfDeadWaters } from './relics/PioneerDiverOfDeadWaters'
import { PoetOfMourningCollapse } from './relics/PoetOfMourningCollapse'
import { PrisonerInDeepConfinement } from './relics/PrisonerInDeepConfinement'
import { SacerdosRelivedOrdeal } from './relics/SacerdosRelivedOrdeal'
import { ScholarLostInErudition } from './relics/ScholarLostInErudition'
import { SelfEnshroudedRecluse } from './relics/SelfEnshroudedRecluse'
import { TheAshblazingGrandDuke } from './relics/TheAshblazingGrandDuke'
import { TheWindSoaringValorous } from './relics/TheWindSoaringValorous'
import { ThiefOfShootingMeteor } from './relics/ThiefOfShootingMeteor'
import { WarriorGoddessOfSunAndThunder } from './relics/WarriorGoddessOfSunAndThunder'
import { WastelanderOfBanditryDesert } from './relics/WastelanderOfBanditryDesert'
import { WatchmakerMasterOfDreamMachinations } from './relics/WatchmakerMasterOfDreamMachinations'
import { WavestriderCaptain } from './relics/WavestriderCaptain'
import { WorldRemakingDeliverer } from './relics/WorldRemakingDeliverer'

const ALL_RELIC_CONFIGS = [
  PasserbyOfWanderingCloud,
  MusketeerOfWildWheat,
  KnightOfPurityPalace,
  HunterOfGlacialForest,
  ChampionOfStreetwiseBoxing,
  GuardOfWutheringSnow,
  FiresmithOfLavaForging,
  GeniusOfBrilliantStars,
  BandOfSizzlingThunder,
  EagleOfTwilightLine,
  ThiefOfShootingMeteor,
  WastelanderOfBanditryDesert,
  LongevousDisciple,
  MessengerTraversingHackerspace,
  TheAshblazingGrandDuke,
  PrisonerInDeepConfinement,
  PioneerDiverOfDeadWaters,
  WatchmakerMasterOfDreamMachinations,
  IronCavalryAgainstTheScourge,
  TheWindSoaringValorous,
  SacerdosRelivedOrdeal,
  ScholarLostInErudition,
  HeroOfTriumphantSong,
  PoetOfMourningCollapse,
  WarriorGoddessOfSunAndThunder,
  WavestriderCaptain,
  WorldRemakingDeliverer,
  SelfEnshroudedRecluse,
  EverGloriousMagicalGirl,
  DivinerOfDistantReach,
] as const

const ALL_ORNAMENT_CONFIGS = [
  SpaceSealingStation,
  FleetOfTheAgeless,
  PanCosmicCommercialEnterprise,
  BelobogOfTheArchitects,
  CelestialDifferentiator,
  InertSalsotto,
  TaliaKingdomOfBanditry,
  SprightlyVonwacq,
  RutilantArena,
  BrokenKeel,
  FirmamentFrontlineGlamoth,
  PenaconyLandOfTheDreams,
  SigoniaTheUnclaimedDesolation,
  IzumoGenseiAndTakamaDivineRealm,
  DuranDynastyOfRunningWolves,
  ForgeOfTheKalpagniLantern,
  LushakaTheSunkenSeas,
  TheWondrousBananAmusementPark,
  BoneCollectionsSereneDemesne,
  GiantTreeOfRaptBrooding,
  ArcadiaOfWovenDreams,
  RevelryByTheSea,
  AmphoreusTheEternalLand,
  TengokuLivestream,
] as const

const ALL_CONFIGS = [...ALL_RELIC_CONFIGS, ...ALL_ORNAMENT_CONFIGS] as const

type AllConfigItems = (typeof ALL_CONFIGS)[number]

export type RelicSetIngameId = AllConfigItems['info']['ingameId']

type DisplayWithI18nKey = Extract<AllConfigItems['display'], { conditionalI18nKey: string }>
export type SetConditionalI18nKey =
  | DisplayWithI18nKey['conditionalI18nKey']
  | 'Conditionals.DefaultMessage'

export type SetConditionalFieldInfo = {
  fieldName: string,
  wgslType: 'bool' | 'i32',
  setKey: Sets,
}

// ── Registry ──

export const setConfigRegistry = new Map<SetKey, SetConfig>()

for (const config of ALL_CONFIGS) {
  setConfigRegistry.set(config.id, config)
}

// ── Derived data ──

type IndexedConfig = {
  index: number,
  config: SetConfig,
}

type IndexedField = {
  index: number,
  id: string,
  field: SetConditionalFieldInfo,
}

const relicConfigs: IndexedConfig[] = []
const ornamentConfigs: IndexedConfig[] = []
const setToConditionalKeyMap = new Map<Sets, SetConditionalI18nKey>()
const teammateOptionsMap = new Map<string, TeammateOption>()
const boolFields: IndexedField[] = []
const intFields: IndexedField[] = []
export const teammateRelicOptions: TeammateOption[] = []
export const teammateOrnamentOptions: TeammateOption[] = []
export const setToId = {} as Record<Sets, RelicSetIngameId>

for (const config of setConfigRegistry.values()) {
  const setKey = config.info.name
  const isRelic = config.info.setType === SetType.RELIC

  // Config arrays
  if (isRelic) {
    relicConfigs.push({ index: config.info.index, config })
  } else {
    ornamentConfigs.push({ index: config.info.index, config })
  }

  // ID mapping
  setToId[setKey] = config.info.ingameId as RelicSetIngameId

  // Conditional i18n keys
  if (config.display.conditionalI18nKey) {
    setToConditionalKeyMap.set(setKey, config.display.conditionalI18nKey as SetConditionalI18nKey)
  }

  // Teammates
  if (config.conditionals.teammate) {
    for (const option of config.conditionals.teammate) {
      teammateOptionsMap.set(option.value, option)
      if (isRelic) {
        teammateRelicOptions.push(option)
      } else {
        teammateOrnamentOptions.push(option)
      }
    }
  }

  // Conditional fields
  if (config.display.conditionalI18nKey && config.display.modifiable) {
    const isBoolean = config.display.conditionalType === ConditionalDataType.BOOLEAN
    const field: SetConditionalFieldInfo = {
      fieldName: `${isBoolean ? 'enabled' : 'value'}${config.id}`,
      wgslType: isBoolean ? 'bool' : 'i32',
      setKey,
    }
    if (isBoolean) {
      boolFields.push({ index: config.info.index, id: config.id, field })
    } else {
      intFields.push({ index: config.info.index, id: config.id, field })
    }
  }
}

const byIndex = (a: IndexedConfig, b: IndexedConfig) => a.index - b.index
const byIndexThenId = (a: IndexedField, b: IndexedField) => a.index - b.index || a.id.localeCompare(b.id)

relicConfigs.sort(byIndex)
ornamentConfigs.sort(byIndex)
boolFields.sort(byIndexThenId)
intFields.sort(byIndexThenId)

export const relicIndexToSetConfig = relicConfigs.map((c) => c.config)
export const ornamentIndexToSetConfig = ornamentConfigs.map((c) => c.config)
export const orderedSetConditionalFields = [
  ...boolFields.map((e) => e.field),
  ...intFields.map((e) => e.field),
]

type ToNameMap<T extends readonly { id: string; info: { name: string } }[]> = {
  readonly [C in T[number] as C['id']]: C['info']['name']
}

export const SetsRelics = Object.fromEntries(
  ALL_RELIC_CONFIGS.map((c) => [c.id, c.info.name]),
) as ToNameMap<typeof ALL_RELIC_CONFIGS>
export type SetsRelics = typeof SetsRelics[keyof typeof SetsRelics]

export const SetsOrnaments = Object.fromEntries(
  ALL_ORNAMENT_CONFIGS.map((c) => [c.id, c.info.name]),
) as ToNameMap<typeof ALL_ORNAMENT_CONFIGS>
export type SetsOrnaments = typeof SetsOrnaments[keyof typeof SetsOrnaments]

export const SetsRelicsNames = Object.values(SetsRelics) as SetsRelics[]
export const SetsOrnamentsNames = Object.values(SetsOrnaments) as SetsOrnaments[]

export const RelicSetToIndex = Object.fromEntries(
  SetsRelicsNames.map((name, i) => [name, i]),
) as Record<SetsRelics, number>

export const OrnamentSetToIndex = Object.fromEntries(
  SetsOrnamentsNames.map((name, i) => [name, i]),
) as Record<SetsOrnaments, number>

export const RelicSetKeyToIndex: Record<string, number> = Object.fromEntries(
  Object.keys(SetsRelics).map((key, i) => [key, i]),
)
export const OrnamentSetKeyToIndex: Record<string, number> = Object.fromEntries(
  Object.keys(SetsOrnaments).map((key, i) => [key, i]),
)

export const RelicSetCount = ALL_RELIC_CONFIGS.length
export const OrnamentSetCount = ALL_ORNAMENT_CONFIGS.length

// ── Usage ──

export function setToConditionalKey(set: Sets): SetConditionalI18nKey {
  return setToConditionalKeyMap.get(set) ?? 'Conditionals.DefaultMessage'
}

export function getTeammateOption(key: string): TeammateOption | undefined {
  return teammateOptionsMap.get(key)
}

export function generateSetCombatWgsl(action: OptimizerAction, context: OptimizerContext): string {
  let wgsl = ''
  for (const config of setConfigRegistry.values()) {
    if (config.conditionals.gpu) {
      wgsl += config.conditionals.gpu(action, context)
    }
  }
  return wgsl
}

export function generateSetTerminalWgsl(action: OptimizerAction, context: OptimizerContext): string {
  let wgsl = ''
  for (const config of setConfigRegistry.values()) {
    if (config.conditionals.gpuTerminal) {
      wgsl += config.conditionals.gpuTerminal(action, context)
    }
  }
  return wgsl
}

export function getAllSetDynamicConditionals(): DynamicConditional[] {
  const result: DynamicConditional[] = []
  for (const config of setConfigRegistry.values()) {
    if (config.conditionals.dynamicConditionals) {
      result.push(...config.conditionals.dynamicConditionals)
    }
  }
  return result
}

export function generateSetConditionalsStruct(): string {
  const fields = orderedSetConditionalFields
    .map((f) => `  ${f.fieldName}: ${f.wgslType},`)
    .join('\n')
  return `struct SetConditionals {\n${fields}\n}`
}

export function generateSetConditionalsInitializer(setConditionals: SetConditional, debug: boolean = false): string {
  const record = setConditionals as Record<string, boolean | number>
  return orderedSetConditionalFields
    .map((f) => `${record[f.fieldName]},${debug ? ` // ${f.fieldName}` : ''}`)
    .join('\n    ')
}
