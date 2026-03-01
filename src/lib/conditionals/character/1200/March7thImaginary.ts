import {
  ASHBLAZING_ATK_STACK,
} from 'lib/conditionals/conditionalConstants'
import {
  boostAshblazingAtkContainer,
  gpuBoostAshblazingAtkContainer,
} from 'lib/conditionals/conditionalFinalizers'
import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { Parts, Sets, Stats } from 'lib/constants/constants'
import { SortOption } from 'lib/optimization/sortOptions'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { DamageTag, ElementTag, TargetTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  SPREAD_ORNAMENTS_2P_SUPPORT,
  SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
} from 'lib/scoring/scoringConstants'
import { PresetEffects } from 'lib/scoring/presetEffects'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'
import { CharacterConfig } from 'types/characterConfig'
import { ScoringMetadata, SimulationMetadata } from 'types/metadata'

import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'
import {
  DEFAULT_BREAK,
  DEFAULT_FUA,
  END_BASIC,
  NULL_TURN_ABILITY_NAME,
  START_ULT,
  WHOLE_BASIC,
} from 'lib/optimization/rotation/turnAbilityConfig'
import {
  FUGUE,
  LINGSHA,
  THE_DAHLIA,
  LONG_ROAD_LEADS_HOME,
  NEVER_FORGET_HER_FLAME,
  SCENT_ALONE_STAYS_TRUE,
} from 'lib/simulations/tests/testMetadataConstants'

export const March7thImaginaryEntities = createEnum('March7thImaginary')
export const March7thImaginaryAbilities = createEnum('BASIC', 'ULT', 'FUA', 'BREAK')

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.March7thImaginary')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5
  const {
    SOURCE_BASIC,
    SOURCE_SKILL,
    SOURCE_ULT,
    SOURCE_TALENT,
    SOURCE_TECHNIQUE,
    SOURCE_TRACE,
    SOURCE_MEMO,
    SOURCE_E1,
    SOURCE_E2,
    SOURCE_E4,
    SOURCE_E6,
  } = Source.character('1224')

  const basicScaling = basic(e, 1.00, 1.10)
  const basicEnhancedScaling = basic(e, 0.80, 0.88)
  const basicExtraScalingMasterBuff = basic(e, 0.20, 0.22)
  const ultScaling = ult(e, 2.40, 2.592)
  const talentDmgBuff = talent(e, 0.80, 0.88)
  const skillSpdScaling = skill(e, 0.10, 0.108)

  // 0.06
  const fuaHitCountMulti = ASHBLAZING_ATK_STACK * (1 * 0.40 + 2 * 0.60)

  const defaults = {
    enhancedBasic: true,
    basicAttackHits: 6,
    talentDmgBuff: true,
    selfSpdBuff: true,
    masterAdditionalDmgBuff: true,
    masterToughnessRedBuff: true,
    e6CdBuff: true,
  }

  const teammateDefaults = {
    masterBuff: true,
    masterCdBeBuffs: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    enhancedBasic: {
      id: 'enhancedBasic',
      formItem: 'switch',
      text: t('Content.enhancedBasic.text'),
      content: t('Content.enhancedBasic.content', { BasicEnhancedScaling: TsUtils.precisionRound(100 * basicEnhancedScaling) }),
    },
    basicAttackHits: {
      id: 'basicAttackHits',
      formItem: 'slider',
      text: t('Content.basicAttackHits.text'),
      content: t('Content.basicAttackHits.content', { BasicEnhancedScaling: TsUtils.precisionRound(100 * basicEnhancedScaling) }),
      min: 3,
      max: 6,
    },
    masterAdditionalDmgBuff: {
      id: 'masterAdditionalDmgBuff',
      formItem: 'switch',
      text: t('Content.masterAdditionalDmgBuff.text'),
      content: t('Content.masterAdditionalDmgBuff.content', { ShifuDmgBuff: TsUtils.precisionRound(100 * basicExtraScalingMasterBuff) }),
    },
    masterToughnessRedBuff: {
      id: 'masterToughnessRedBuff',
      formItem: 'switch',
      text: t('Content.masterToughnessRedBuff.text'),
      content: t('Content.masterToughnessRedBuff.content'),
    },
    talentDmgBuff: {
      id: 'talentDmgBuff',
      formItem: 'switch',
      text: t('Content.talentDmgBuff.text'),
      content: t('Content.talentDmgBuff.content', { TalentDmgBuff: TsUtils.precisionRound(100 * talentDmgBuff) }),
    },
    selfSpdBuff: {
      id: 'selfSpdBuff',
      formItem: 'switch',
      text: t('Content.selfSpdBuff.text'),
      content: t('Content.selfSpdBuff.content'),
      disabled: e < 1,
    },
    e6CdBuff: {
      id: 'e6CdBuff',
      formItem: 'switch',
      text: t('Content.e6CdBuff.text'),
      content: t('Content.e6CdBuff.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    masterBuff: {
      id: 'masterBuff',
      formItem: 'switch',
      text: t('TeammateContent.masterBuff.text'),
      content: t('TeammateContent.masterBuff.content', { ShifuSpeedBuff: TsUtils.precisionRound(100 * skillSpdScaling) }),
    },
    masterCdBeBuffs: {
      id: 'masterCdBeBuffs',
      formItem: 'switch',
      text: t('TeammateContent.masterCdBeBuffs.text'),
      content: t('TeammateContent.masterCdBeBuffs.content'),
    },
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(March7thImaginaryEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [March7thImaginaryEntities.March7thImaginary]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(March7thImaginaryAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      const toughnessDmgBoost = (r.masterToughnessRedBuff) ? 2.0 : 1.0

      const basicAtkScaling = (r.enhancedBasic)
        ? basicEnhancedScaling * r.basicAttackHits
        : basicScaling
      const basicToughness = toughnessDmgBoost * ((r.enhancedBasic) ? 5 * r.basicAttackHits : 10)

      // Additional damage scaling from master buff
      const additionalMasterBuffScaling = (r.masterAdditionalDmgBuff)
        ? basicExtraScalingMasterBuff * r.basicAttackHits
        : 0
      const basicAdditionalScaling = (r.enhancedBasic)
        ? additionalMasterBuffScaling
        : basicExtraScalingMasterBuff

      return {
        [March7thImaginaryAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Imaginary)
              .atkScaling(basicAtkScaling)
              .toughnessDmg(basicToughness)
              .build(),
            ...(
              (basicAdditionalScaling > 0)
                ? [
                    HitDefinitionBuilder.standardAdditional()
                      .damageElement(ElementTag.Imaginary)
                      .atkScaling(basicAdditionalScaling)
                      .build(),
                  ]
                : []
            ),
          ],
        },
        [March7thImaginaryAbilities.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Imaginary)
              .atkScaling(ultScaling)
              .toughnessDmg(30)
              .build(),
          ],
        },
        [March7thImaginaryAbilities.FUA]: {
          hits: [
            ...(
              (e >= 2)
                ? [
                    HitDefinitionBuilder.standardFua()
                      .damageElement(ElementTag.Imaginary)
                      .atkScaling(0.60)
                      .toughnessDmg(10)
                      .build(),
                  ]
                : []
            ),
          ],
        },
        [March7thImaginaryAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Imaginary).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.buff(StatKey.SPD_P, (e >= 1 && r.selfSpdBuff) ? 0.10 : 0, x.source(SOURCE_E1))

      // Talent DMG buff applies to Basic and Additional damage
      x.buff(StatKey.DMG_BOOST, (r.talentDmgBuff) ? talentDmgBuff : 0, x.damageType(DamageTag.BASIC | DamageTag.ADDITIONAL).source(SOURCE_TALENT))

      // E6 CD buff applies to Basic when enhanced
      x.buff(StatKey.CD, (e >= 6 && r.e6CdBuff && r.enhancedBasic) ? 0.50 : 0, x.damageType(DamageTag.BASIC).source(SOURCE_E6))
    },

    precomputeTeammateEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.SPD_P, (t.masterBuff) ? skillSpdScaling : 0, x.targets(TargetTag.FullTeam).source(SOURCE_SKILL))
      x.buff(StatKey.CD, (t.masterBuff && t.masterCdBeBuffs) ? 0.60 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_TRACE))
      x.buff(StatKey.BE, (t.masterBuff && t.masterCdBeBuffs) ? 0.36 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_TRACE))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      boostAshblazingAtkContainer(x, action, fuaHitCountMulti)
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuBoostAshblazingAtkContainer(fuaHitCountMulti, action)
    },
  }
}


const simulation: SimulationMetadata = {
  parts: {
    [Parts.Body]: [
      Stats.CR,
      Stats.CD,
      Stats.ATK_P,
    ],
    [Parts.Feet]: [
      Stats.ATK_P,
      Stats.SPD,
    ],
    [Parts.PlanarSphere]: [
      Stats.ATK_P,
      Stats.Imaginary_DMG,
    ],
    [Parts.LinkRope]: [
      Stats.ATK_P,
      Stats.BE,
    ],
  },
  substats: [
    Stats.BE,
    Stats.ATK_P,
    Stats.CR,
    Stats.CD,
    Stats.ATK,
  ],
  comboTurnAbilities: [
    NULL_TURN_ABILITY_NAME,
    START_ULT,
    DEFAULT_BREAK,
    END_BASIC,
    DEFAULT_FUA,
    WHOLE_BASIC,
    DEFAULT_FUA,
    WHOLE_BASIC,
    DEFAULT_FUA,
  ],
  comboDot: 0,
  errRopeEidolon: 0,
  deprioritizeBuffs: false,
  relicSets: [
    [Sets.IronCavalryAgainstTheScourge, Sets.IronCavalryAgainstTheScourge],
    [Sets.MusketeerOfWildWheat, Sets.MusketeerOfWildWheat],
    [Sets.WastelanderOfBanditryDesert, Sets.WastelanderOfBanditryDesert],
    ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  ],
  ornamentSets: [
    Sets.TaliaKingdomOfBanditry,
    Sets.ForgeOfTheKalpagniLantern,
    Sets.RutilantArena,
    Sets.IzumoGenseiAndTakamaDivineRealm,
    ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
    ...SPREAD_ORNAMENTS_2P_SUPPORT,
  ],
  teammates: [
    {
      characterId: THE_DAHLIA,
      lightCone: NEVER_FORGET_HER_FLAME,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: FUGUE,
      lightCone: LONG_ROAD_LEADS_HOME,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: LINGSHA,
      lightCone: SCENT_ALONE_STAYS_TRUE,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
  ],
}

const scoring: ScoringMetadata = {
  stats: {
    [Stats.ATK]: 0,
    [Stats.ATK_P]: 0,
    [Stats.DEF]: 0,
    [Stats.DEF_P]: 0,
    [Stats.HP]: 0,
    [Stats.HP_P]: 0,
    [Stats.SPD]: 1,
    [Stats.CR]: 0,
    [Stats.CD]: 0,
    [Stats.EHR]: 0,
    [Stats.RES]: 0,
    [Stats.BE]: 1,
  },
  parts: {
    [Parts.Body]: [],
    [Parts.Feet]: [
      Stats.SPD,
    ],
    [Parts.PlanarSphere]: [],
    [Parts.LinkRope]: [
      Stats.BE,
    ],
  },
  sets: {
    [Sets.IronCavalryAgainstTheScourge]: 1,
    [Sets.ThiefOfShootingMeteor]: 1,
    [Sets.EagleOfTwilightLine]: 1,

    [Sets.TaliaKingdomOfBanditry]: 1,
    [Sets.ForgeOfTheKalpagniLantern]: 1,
  },
  presets: [
    PresetEffects.fnAshblazingSet(2),
    PresetEffects.VALOROUS_SET,
  ],
  sortOption: SortOption.BASIC,
  hiddenColumns: [SortOption.SKILL, SortOption.DOT],
  simulation,
}

const display = {
  imageCenter: {
    x: 825,
    y: 950,
    z: 1.1,
  },
  showcaseColor: '#f7b6f7',
}

export const March7thImaginary: CharacterConfig = {
  id: '1224',
  info: { displayName: 'March 7th (Hunt)' },
  conditionals,
  scoring,
  display,
}
