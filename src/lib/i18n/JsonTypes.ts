//           Destruction, Hunt, Erudition, Harmony, Nihility, Preservation, Abundance, Remembrance
const Paths = ['Warrior', 'Rogue', 'Mage', 'Shaman', 'Warlock', 'Knight', 'Priest', 'Memory'] as const

export type Path = typeof Paths[number]

export type TextMapPath =
  'TextMap/TextMapCHS' |
  'TextMap/TextMapCHT' |
  'TextMap/TextMapDE' |
  'TextMap/TextMapEN' |
  'TextMap/TextMapES' |
  'TextMap/TextMapFR' |
  'TextMap/TextMapID' |
  'TextMap/TextMapJP' |
  'TextMap/TextMapKR' |
  'TextMap/TextMapPT' |
  'TextMap/TextMapRU' |
  'TextMap/TextMapTH' |
  'TextMap/TextMapVI'

type ExcelOutputFileTypeMapping = {
  'ExcelOutput/AvatarBaseType': AvatarBaseTypeType
  'ExcelOutput/AvatarConfig': AvatarConfigType
  'ExcelOutput/DamageType': DamageTypeType
  'ExcelOutput/EquipmentConfig': EquipmentConfigType
  'ExcelOutput/RelicSetConfig': RelicSetConfigType
  'ExcelOutput/RelicSetSkillConfig': RelicSetSkillConfigType
}

type DataPath = keyof ExcelOutputFileTypeMapping

type FileTypeMapping = ExcelOutputFileTypeMapping & {
  [key in TextMapPath]: TextMap
}

export type FilePath = DataPath | TextMapPath

export type JsonType<T extends FilePath> = T extends keyof FileTypeMapping ? FileTypeMapping[T] : never;

export type TextMap = Record<number, string>

type AvatarBaseTypeType = Array<{
  ID: Path
  BaseTypeIcon: string
  BaseTypeIconMiddle: string
  BaseTypeIconSmall: string
  EquipmentLightMatPath: string
  Equipment3DTgaPath: string
  BaseTypeIconPathTalk: string
  BgPath: string
  BaseTypeText: {
    Hash: number
  }
  BaseTypeDesc: {
    Hash: number
  }
  FirstWordText: string
}>

type AvatarConfigType = Array<{
  AvatarID: number
  AvatarName: {
    Hash: number
  }
  AvatarFullName: {
    Hash: number
  }
  AdventurePlayerID: number
  AvatarVOTag: string
  Rarity: string
  AvatarInitialSkinName: {
    Hash: number
  }
  AvatarInitialSkinDesc: {
    Hash: number
  }
  JsonPath: string
  DamageType: string
  SPNeed: {
    Value: number
  }
  ExpGroup: number
  MaxPromotion: number
  MaxRank: number
  RankIDList: [
    number,
    number,
    number,
    number,
    number,
    number,
  ]
  RewardList: [
    {
      ItemID: number
      ItemNum: number
    },
    {
      ItemID: number
      ItemNum: number
    },
  ]
  RewardListMax: [
    {
      ItemID: number
      ItemNum: number
    },
  ]
  SkillList: [
    number,
    number,
    number,
    number,
    number,
    number,
  ]
  AvatarBaseType: Path
  DefaultAvatarModelPath: string
  DefaultAvatarHeadIconPath: string
  AvatarSideIconPath: string
  AvatarMiniIconPath: string
  AvatarGachaResultImgPath: string
  ActionAvatarHeadIconPath: string
  UltraSkillCutInPrefabPath: string
  UIAvatarModelPath: string
  ManikinJsonPath: string
  AvatarDesc: {
    Hash: number
  }
  AIPath: string
  SkilltreePrefabPath: string
  DamageTypeResistance: []
  Release: true
  SideAvatarHeadIconPath: string
  WaitingAvatarHeadIconPath: string
  AvatarCutinImgPath: string
  AvatarCutinBgImgPath: string
  AvatarCutinFrontImgPath: string
  AvatarCutinIntroText: {
    Hash: number
  }
  AvatarDropOffset: [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
  ]
  AvatarTrialOffset: []
  PlayerCardOffset: [
    number,
    number,
    number,
  ]
  AssistOffset: [
    number,
    number,
    number,
  ]
  AssistBgOffset: [
    number,
    number,
    number,
  ]
  AvatarSelfShowOffset: [
    number,
    number,
    number,
  ]
}>

type DamageTypeType = Array<{
  ID: string
  DamageTypeName: {
    Hash: number
  }
  DamageTypeIntro: {
    Hash: number
  }
  DamageTypeIconPath: string
  IconNatureForWeakActive: string
  IconNatureForWeakUnactive: string
  IconNatureColorSimple: string
  IconNatureColor: string
  IconNatureWhite: string
  SPInfoEffFront: string
  SPInfoEffFrontDouble: string
  Color: string
  ShaderColor: string
  UnfullColor: string
  LightColor: string
  Light1Color: string
  SkillBtnEff: string
  SkillTreeLightColor: string
  SkillTreeDecoColor: string
  SkillTreeLeftPanelColor: string
  SPMazeInfoEffFront: string
  NormalDamage: string
  CriticalDamage: string
  SkillTreePanelPath: string
  MazeEnterBattleWeakIconPath: string
}>

type EquipmentConfigType = Array<{
  EquipmentID: number
  Release: boolean
  EquipmentName: {
    Hash: number
  }
  EquipmentDesc: {
    Hash: number
  }
  Rarity: string
  AvatarBaseType: Path
  MaxPromotion: number
  MaxRank: number
  ExpType: number
  SkillID: number
  ExpProvide: number
  CoinCost: number
  RankUpCostList: Array<unknown>
  ThumbnailPath: string
  ImagePath: string
  ItemRightPanelOffset: [
    number,
    number,
    number,
  ]
  AvatarDetailOffset: [
    number,
    number,
    number,
  ]
  BattleDialogOffset: [
    number,
    number,
    number,
  ]
  GachaResultOffset: [
    number,
    number,
    number,
  ]
}>

type RelicSetConfigType = Array<{
  SetID: number
  SetSkillList: [2, 4] | [2]
  SetIconPath: string
  SetIconFigurePath: string
  SetName: {
    Hash: number
  }
  DisplayItemID: number
  Release: boolean
  IsPlanarSuit?: boolean
}>

type RelicSetSkillConfigType = Array<{
  SetID: number
  RequireNum: 2 | 4
  SkillDesc: string
  PropertyList: [
    {
      EDOCPKIBBNG: string
      CPPHDJHHGGN: {
        Value: number
      }
    },
  ]
  AbilityName: string
  AbilityParamList:
    {
      Value: number
    } []
}>

export type Output = {
  Characters: Record<number, { Name: string; LongName: string }>
  RelicSets: Record<number, { Name: string; Description2pc: string; Description4pc?: string }>
  Lightcones: Record<number, { Name: string }>
  Paths: Record<string, string>
  Elements: Record<string, string>
}
