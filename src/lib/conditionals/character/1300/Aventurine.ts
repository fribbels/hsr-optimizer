import { AbilityEidolon, Conditionals, ContentDefinition, createEnum, } from 'lib/conditionals/conditionalUtils'
import { dynamicStatConversionContainer, gpuDynamicStatConversion, } from 'lib/conditionals/evaluation/statConversion'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { ConditionalActivation, ConditionalType, Parts, Sets, Stats, } from 'lib/constants/constants'
import { containerActionVal } from 'lib/gpu/injection/injectUtils'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { SortOption } from 'lib/optimization/sortOptions'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { ElementTag, SELF_ENTITY_INDEX, TargetTag, } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  NULL_TURN_ABILITY_NAME,
  START_ULT,
  DEFAULT_FUA,
  END_BASIC,
  WHOLE_BASIC,
} from 'lib/optimization/rotation/turnAbilityConfig'
import {
  SPREAD_RELICS_2P_SPEED_WEIGHTS,
  SPREAD_ORNAMENTS_2P_SUPPORT_WEIGHTS,
  SPREAD_ORNAMENTS_2P_FUA_WEIGHTS,
  SPREAD_ORNAMENTS_2P_FUA,
  SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  SPREAD_ORNAMENTS_2P_SUPPORT,
  SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  MATCH_2P_WEIGHT,
} from 'lib/scoring/scoringConstants'
import { PresetEffects } from 'lib/scoring/presetEffects'
import {
  TOPAZ_NUMBY,
  WORRISOME_BLISSFUL,
  ROBIN,
  FLOWING_NIGHTGLOW,
  FEIXIAO,
  I_VENTURE_FORTH_TO_HUNT,
} from 'lib/simulations/tests/testMetadataConstants'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'
import { CharacterConfig } from 'types/characterConfig'
import { CharacterConditionalsController } from 'types/conditionals'
import { SimulationMetadata, ScoringMetadata } from 'types/metadata'
import { OptimizerAction, OptimizerContext, } from 'types/optimizer'

export const AventurineEntities = createEnum('Aventurine')
export const AventurineAbilities = createEnum('BASIC', 'ULT', 'FUA', 'SKILL_SHIELD', 'BREAK')

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Aventurine')
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_BASIC_3_SKILL_TALENT_5
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
  } = Source.character('1304')

  const basicScaling = basic(e, 1.00, 1.10)
  const ultScaling = ult(e, 2.70, 2.916)
  const ultCdBoost = ult(e, 0.15, 0.162)

  const talentDmgScaling = talent(e, 0.25, 0.275)
  const talentResScaling = talent(e, 0.50, 0.55)

  const fuaHits = (e >= 4) ? 10 : 7

  const skillShieldScaling = skill(e, 0.24, 0.256)
  const skillShieldFlat = skill(e, 320, 356)

  const traceShieldScaling = 0.07
  const traceShieldFlat = 96

  const defaults = {
    defToCrBoost: true,
    fuaHitsOnTarget: fuaHits,
    fortifiedWagerBuff: true,
    enemyUnnervedDebuff: true,
    e2ResShred: true,
    e4DefBuff: true,
    e6ShieldStacks: 3,
  }

  const teammateDefaults = {
    fortifiedWagerBuff: true,
    enemyUnnervedDebuff: true,
    e2ResShred: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    defToCrBoost: {
      id: 'defToCrBoost',
      formItem: 'switch',
      text: t('Content.defToCrBoost.text'),
      content: t('Content.defToCrBoost.content'),
    },
    fortifiedWagerBuff: {
      id: 'fortifiedWagerBuff',
      formItem: 'switch',
      text: t('Content.fortifiedWagerBuff.text'),
      content: t('Content.fortifiedWagerBuff.content', { talentResScaling: TsUtils.precisionRound(100 * talentResScaling) }),
    },
    enemyUnnervedDebuff: {
      id: 'enemyUnnervedDebuff',
      formItem: 'switch',
      text: t('Content.enemyUnnervedDebuff.text'),
      content: t('Content.enemyUnnervedDebuff.content', { ultCdBoost: TsUtils.precisionRound(100 * ultCdBoost) }),
    },
    fuaHitsOnTarget: {
      id: 'fuaHitsOnTarget',
      formItem: 'slider',
      text: t('Content.fuaHitsOnTarget.text'),
      content: t('Content.fuaHitsOnTarget.content', { talentDmgScaling: TsUtils.precisionRound(100 * talentDmgScaling) }),
      min: 0,
      max: fuaHits,
    },
    e2ResShred: {
      id: 'e2ResShred',
      formItem: 'switch',
      text: t('Content.e2ResShred.text'),
      content: t('Content.e2ResShred.content'),
      disabled: e < 2,
    },
    e4DefBuff: {
      id: 'e4DefBuff',
      formItem: 'switch',
      text: t('Content.e4DefBuff.text'),
      content: t('Content.e4DefBuff.content'),
      disabled: e < 4,
    },
    e6ShieldStacks: {
      id: 'e6ShieldStacks',
      formItem: 'slider',
      text: t('Content.e6ShieldStacks.text'),
      content: t('Content.e6ShieldStacks.content'),
      min: 0,
      max: 3,
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    fortifiedWagerBuff: content.fortifiedWagerBuff,
    enemyUnnervedDebuff: content.enemyUnnervedDebuff,
    e2ResShred: content.e2ResShred,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(AventurineEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [AventurineEntities.Aventurine]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(AventurineAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      return {
        [AventurineAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Imaginary)
              .defScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [AventurineAbilities.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Imaginary)
              .defScaling(ultScaling)
              .toughnessDmg(30)
              .build(),
          ],
        },
        [AventurineAbilities.FUA]: {
          hits: [
            // FUA damage hit (multiplied scaling based on fuaHitsOnTarget)
            HitDefinitionBuilder.standardFua()
              .damageElement(ElementTag.Imaginary)
              .defScaling(talentDmgScaling * r.fuaHitsOnTarget)
              .toughnessDmg(10 / 3 * r.fuaHitsOnTarget)
              .build(),
            // Trace shield hit (triggered on FUA)
            HitDefinitionBuilder.shield()
              .defScaling(traceShieldScaling)
              .flatShield(traceShieldFlat)
              .build(),
          ],
        },
        [AventurineAbilities.SKILL_SHIELD]: {
          hits: [
            HitDefinitionBuilder.skillShield()
              .defScaling(skillShieldScaling)
              .flatShield(skillShieldFlat)
              .build(),
          ],
        },
        [AventurineAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Imaginary).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.buff(StatKey.DEF_P, (e >= 4 && r.e4DefBuff) ? 0.40 : 0, x.source(SOURCE_E4))
      x.buff(StatKey.DMG_BOOST, (e >= 6) ? Math.min(1.50, 0.50 * r.e6ShieldStacks) : 0, x.source(SOURCE_E6))
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.RES, (m.fortifiedWagerBuff) ? talentResScaling : 0, x.targets(TargetTag.FullTeam).source(SOURCE_TALENT))
      x.buff(StatKey.CD, (m.enemyUnnervedDebuff) ? ultCdBoost : 0, x.targets(TargetTag.FullTeam).source(SOURCE_ULT))
      x.buff(StatKey.CD, (e >= 1 && m.fortifiedWagerBuff) ? 0.20 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E1))
      x.buff(StatKey.RES_PEN, (e >= 2 && m.e2ResShred) ? 0.12 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E2))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',

    dynamicConditionals: [{
      id: 'AventurineConversionConditional',
      type: ConditionalType.ABILITY,
      activation: ConditionalActivation.CONTINUOUS,
      dependsOn: [Stats.DEF],
      chainsTo: [Stats.CR],
      condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
        const r = action.characterConditionals as Conditionals<typeof content>
        return r.defToCrBoost && x.getActionValueByIndex(StatKey.DEF, SELF_ENTITY_INDEX) > 1600
      },
      effect: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
        dynamicStatConversionContainer(
          Stats.DEF,
          Stats.CR,
          this,
          x,
          action,
          context,
          SOURCE_TRACE,
          (convertibleValue) => Math.min(0.48, 0.02 * Math.floor((convertibleValue - 1600) / 100)),
        )
      },
      gpu: function(action: OptimizerAction, context: OptimizerContext) {
        const r = action.characterConditionals as Conditionals<typeof content>
        const config = action.config

        return gpuDynamicStatConversion(
          Stats.DEF,
          Stats.CR,
          this,
          action,
          context,
          `min(0.48, 0.02 * floor((convertibleValue - 1600) / 100))`,
          `${wgslTrue(r.defToCrBoost)} && ${containerActionVal(SELF_ENTITY_INDEX, StatKey.DEF, config)} > 1600`,
        )
      },
    }],
  }
}


const simulation: SimulationMetadata = {
  parts: {
    [Parts.Body]: [
      Stats.CR,
      Stats.CD,
      Stats.DEF_P,
    ],
    [Parts.Feet]: [
      Stats.DEF_P,
      Stats.SPD,
    ],
    [Parts.PlanarSphere]: [
      Stats.DEF_P,
      Stats.Imaginary_DMG,
    ],
    [Parts.LinkRope]: [
      Stats.DEF_P,
    ],
  },
  substats: [
    Stats.CD,
    Stats.CR,
    Stats.DEF_P,
    Stats.DEF,
  ],
  breakpoints: {
    [Stats.DEF]: 4000,
  },
  comboTurnAbilities: [
    NULL_TURN_ABILITY_NAME,
    START_ULT,
    DEFAULT_FUA,
    END_BASIC,
    DEFAULT_FUA,
    WHOLE_BASIC,
    DEFAULT_FUA,
    WHOLE_BASIC,
    DEFAULT_FUA,
  ],
  comboDot: 0,
  deprioritizeBuffs: true,
  relicSets: [
    [Sets.PioneerDiverOfDeadWaters, Sets.PioneerDiverOfDeadWaters],
    [Sets.SelfEnshroudedRecluse, Sets.SelfEnshroudedRecluse],
    [Sets.KnightOfPurityPalace, Sets.KnightOfPurityPalace],
    [Sets.TheAshblazingGrandDuke, Sets.KnightOfPurityPalace, Sets.PioneerDiverOfDeadWaters],
    ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  ],
  ornamentSets: [
    Sets.DuranDynastyOfRunningWolves,
    Sets.InertSalsotto,
    ...SPREAD_ORNAMENTS_2P_FUA,
    ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
    ...SPREAD_ORNAMENTS_2P_SUPPORT,
  ],
  teammates: [
    {
      characterId: TOPAZ_NUMBY,
      lightCone: WORRISOME_BLISSFUL,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: ROBIN,
      lightCone: FLOWING_NIGHTGLOW,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: FEIXIAO,
      lightCone: I_VENTURE_FORTH_TO_HUNT,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
  ],
}

const scoring: ScoringMetadata = {
  stats: {
    [Stats.ATK]: 0,
    [Stats.ATK_P]: 0,
    [Stats.DEF]: 1,
    [Stats.DEF_P]: 1,
    [Stats.HP]: 0,
    [Stats.HP_P]: 0,
    [Stats.SPD]: 1,
    [Stats.CR]: 1,
    [Stats.CD]: 1,
    [Stats.EHR]: 0,
    [Stats.RES]: 0,
    [Stats.BE]: 0,
  },
  parts: {
    [Parts.Body]: [
      Stats.DEF_P,
      Stats.CR,
      Stats.CD,
    ],
    [Parts.Feet]: [
      Stats.DEF_P,
      Stats.SPD,
    ],
    [Parts.PlanarSphere]: [
      Stats.Imaginary_DMG,
      Stats.DEF_P,
    ],
    [Parts.LinkRope]: [
      Stats.DEF_P,
      Stats.ERR,
    ],
  },
  sets: {
    ...SPREAD_RELICS_2P_SPEED_WEIGHTS,
    [Sets.ScholarLostInErudition]: MATCH_2P_WEIGHT,
    [Sets.WastelanderOfBanditryDesert]: MATCH_2P_WEIGHT,
    [Sets.KnightOfPurityPalace]: 1,
    [Sets.PioneerDiverOfDeadWaters]: 1,

    ...SPREAD_ORNAMENTS_2P_SUPPORT_WEIGHTS,
    ...SPREAD_ORNAMENTS_2P_FUA_WEIGHTS,
    [Sets.DuranDynastyOfRunningWolves]: 1,
    [Sets.InertSalsotto]: 1,
  },
  presets: [
    PresetEffects.VALOROUS_SET,
    PresetEffects.fnPioneerSet(4),
  ],
  sortOption: SortOption.FUA,
  addedColumns: [],
  hiddenColumns: [
    SortOption.SKILL,
    SortOption.DOT,
  ],
  simulation,
}

const display = {
  imageCenter: {
    x: 1150,
    y: 1000,
    z: 1.05,
  },
  showcaseColor: '#7cbcea',
}

export const Aventurine: CharacterConfig = {
  id: '1304',
  info: {},
  conditionals,
  scoring,
  display,
}
