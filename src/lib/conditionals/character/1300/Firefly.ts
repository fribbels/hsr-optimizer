import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
  createEnum,
  teammateMatchesId,
} from 'lib/conditionals/conditionalUtils'
import { dynamicStatConversionContainer, gpuDynamicStatConversion, } from 'lib/conditionals/evaluation/statConversion'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { ConditionalActivation, ConditionalType, Parts, Sets, Stats, } from 'lib/constants/constants'
import { containerActionVal } from 'lib/gpu/injection/injectUtils'
import { wgsl, wgslTrue, } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { SortOption } from 'lib/optimization/sortOptions'
import { AKey, StatKey, } from 'lib/optimization/engine/config/keys'
import { DamageTag, ElementTag, SELF_ENTITY_INDEX, } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { buff } from 'lib/optimization/engine/container/gpuBuffBuilder'
import {
  NULL_TURN_ABILITY_NAME,
  START_ULT,
  DEFAULT_SKILL,
  END_BREAK,
  WHOLE_SKILL,
} from 'lib/optimization/rotation/turnAbilityConfig'
import {
  SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  T2_WEIGHT,
} from 'lib/scoring/scoringConstants'
import {
  THE_DAHLIA,
  FUGUE,
  LONG_ROAD_LEADS_HOME,
  NEVER_FORGET_HER_FLAME,
  LINGSHA,
  SCENT_ALONE_STAYS_TRUE,
} from 'lib/simulations/tests/testMetadataConstants'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'
import { CharacterConfig } from 'types/characterConfig'
import { CharacterConditionalsController } from 'types/conditionals'
import { Hit } from 'types/hitConditionalTypes'
import { SimulationMetadata, ScoringMetadata } from 'types/metadata'
import { OptimizerAction, OptimizerContext, } from 'types/optimizer'

export const FireflyEntities = createEnum('Firefly')
export const FireflyAbilities = createEnum('BASIC', 'SKILL', 'BREAK')

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Firefly')
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
  } = Source.character('1310')

  const basicScaling = basic(e, 1.00, 1.10)
  const basicEnhancedScaling = basic(e, 2.00, 2.20)

  const skillScaling = skill(e, 2.00, 2.20)
  const skillEnhancedAtkScaling = skill(e, 2.00, 2.20)

  const ultSpdBuff = ult(e, 60, 66)
  const ultWeaknessBrokenBreakVulnerability = ult(e, 0.20, 0.22)
  const talentResBuff = talent(e, 0.30, 0.34)
  const talentDmgReductionBuff = talent(e, 0.40, 0.44)

  const defaults = {
    enhancedStateActive: true,
    enhancedStateSpdBuff: true,
    superBreakDmg: true,
    atkToBeConversion: true,
    talentDmgReductionBuff: true,
    e1DefShred: true,
    e4ResBuff: true,
    e6Buffs: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    enhancedStateActive: {
      id: 'enhancedStateActive',
      formItem: 'switch',
      text: t('Content.enhancedStateActive.text'),
      content: t('Content.enhancedStateActive.content'),
    },
    enhancedStateSpdBuff: {
      id: 'enhancedStateSpdBuff',
      formItem: 'switch',
      text: t('Content.enhancedStateSpdBuff.text'),
      content: t('Content.enhancedStateSpdBuff.content', { ultSpdBuff }),
    },
    superBreakDmg: {
      id: 'superBreakDmg',
      formItem: 'switch',
      text: t('Content.superBreakDmg.text'),
      content: t('Content.superBreakDmg.content'),
    },
    atkToBeConversion: {
      id: 'atkToBeConversion',
      formItem: 'switch',
      text: t('Content.atkToBeConversion.text'),
      content: t('Content.atkToBeConversion.content'),
    },
    talentDmgReductionBuff: {
      id: 'talentDmgReductionBuff',
      formItem: 'switch',
      text: t('Content.talentDmgReductionBuff.text'),
      content: t('Content.talentDmgReductionBuff.content', {
        talentResBuff: TsUtils.precisionRound(100 * talentResBuff),
        talentDmgReductionBuff: TsUtils.precisionRound(100 * talentDmgReductionBuff),
      }),
    },
    e1DefShred: {
      id: 'e1DefShred',
      formItem: 'switch',
      text: t('Content.e1DefShred.text'),
      content: t('Content.e1DefShred.content'),
      disabled: e < 1,
    },
    e4ResBuff: {
      id: 'e4ResBuff',
      formItem: 'switch',
      text: t('Content.e4ResBuff.text'),
      content: t('Content.e4ResBuff.content'),
      disabled: e < 4,
    },
    e6Buffs: {
      id: 'e6Buffs',
      formItem: 'switch',
      text: t('Content.e6Buffs.text'),
      content: t('Content.e6Buffs.content'),
      disabled: e < 6,
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,

    entityDeclaration: () => Object.values(FireflyEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [FireflyEntities.Firefly]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(FireflyAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // The Dahlia E1 adds fixed toughness damage
      const dahliaFixedToughnessDmg = teammateMatchesId(context, THE_DAHLIA) ? 20 : 0

      const basicHit = HitDefinitionBuilder.standardBasic()
        .damageElement(ElementTag.Fire)
        .atkScaling(r.enhancedStateActive ? basicEnhancedScaling : basicScaling)
        .toughnessDmg(r.enhancedStateActive ? 15 : 10)
        .build()

      const skillHit = HitDefinitionBuilder.standardSkill()
        .damageElement(ElementTag.Fire)
        .atkScaling(r.enhancedStateActive ? skillEnhancedAtkScaling : skillScaling)
        .beScaling(r.enhancedStateActive ? 0.2 : 0)
        .beCap(3.60)
        .toughnessDmg(r.enhancedStateActive ? 30 : 20)
        .fixedToughnessDmg(dahliaFixedToughnessDmg)
        .build()

      const addSuperBreak = r.superBreakDmg && r.enhancedStateActive

      return {
        [FireflyAbilities.BASIC]: {
          hits: [
            basicHit,
            ...(addSuperBreak
              ? [
                HitDefinitionBuilder.standardSuperBreak(ElementTag.Fire)
                  .referenceHit(basicHit as Hit)
                  .build(),
              ]
              : []),
          ],
        },
        [FireflyAbilities.SKILL]: {
          hits: [
            skillHit,
            ...(addSuperBreak
              ? [
                HitDefinitionBuilder.standardSuperBreak(ElementTag.Fire)
                  .referenceHit(skillHit as Hit)
                  .build(),
              ]
              : []),
          ],
        },
        [FireflyAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Fire).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    initializeConfigurationsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      if (r.superBreakDmg) {
        action.config.enemyWeaknessBroken = true
      }
    },

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.buff(StatKey.RES, (r.enhancedStateActive) ? talentResBuff : 0, x.source(SOURCE_TALENT))
      x.buff(StatKey.SPD, (r.enhancedStateActive && r.enhancedStateSpdBuff) ? ultSpdBuff : 0, x.source(SOURCE_ULT))
      x.buff(StatKey.BREAK_EFFICIENCY_BOOST, (r.enhancedStateActive) ? 0.50 : 0, x.source(SOURCE_ULT))
      x.multiplicativeComplement(StatKey.DMG_RED, (r.enhancedStateActive && r.talentDmgReductionBuff) ? talentDmgReductionBuff : 0, x.source(SOURCE_TALENT))

      // Break vulnerability (only to weakness-broken enemies)
      const isWeaknessBroken = action.config.enemyWeaknessBroken
      x.buff(
        StatKey.VULNERABILITY,
        (r.enhancedStateActive && isWeaknessBroken) ? ultWeaknessBrokenBreakVulnerability : 0,
        x.damageType(DamageTag.BREAK | DamageTag.SUPER_BREAK).source(SOURCE_ULT),
      )

      // E1: DEF shred
      x.buff(StatKey.DEF_PEN, (e >= 1 && r.e1DefShred && r.enhancedStateActive) ? 0.15 : 0, x.source(SOURCE_E1))

      // E4: RES buff
      x.buff(StatKey.RES, (e >= 4 && r.e4ResBuff && r.enhancedStateActive) ? 0.50 : 0, x.source(SOURCE_E4))

      // E6: Fire RES PEN and Break Efficiency
      x.buff(StatKey.RES_PEN, (e >= 6 && r.e6Buffs && r.enhancedStateActive) ? 0.20 : 0, x.elements(ElementTag.Fire).source(SOURCE_E6))
      x.buff(StatKey.BREAK_EFFICIENCY_BOOST, (e >= 6 && r.e6Buffs && r.enhancedStateActive) ? 0.50 : 0, x.source(SOURCE_E6))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Super break modifier based on BE thresholds
      const be = x.getActionValue(StatKey.BE, FireflyEntities.Firefly)
      x.buff(StatKey.SUPER_BREAK_MODIFIER, (r.superBreakDmg && r.enhancedStateActive && be >= 2.00) ? 0.35 : 0, x.source(SOURCE_TRACE))
      x.buff(StatKey.SUPER_BREAK_MODIFIER, (r.superBreakDmg && r.enhancedStateActive && be >= 3.60) ? 0.15 : 0, x.source(SOURCE_TRACE))
    },

    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      return wgsl`
let be = ${containerActionVal(SELF_ENTITY_INDEX, StatKey.BE, action.config)};

if (${wgslTrue(r.superBreakDmg && r.enhancedStateActive)} && be >= 2.00) {
  ${buff.action(AKey.SUPER_BREAK_MODIFIER, 0.35).wgsl(action)}
}
if (${wgslTrue(r.superBreakDmg && r.enhancedStateActive)} && be >= 3.60) {
  ${buff.action(AKey.SUPER_BREAK_MODIFIER, 0.15).wgsl(action)}
}
      `
    },

    dynamicConditionals: [
      {
        id: 'FireflyConversionConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.ATK],
        chainsTo: [Stats.BE],
        condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return r.atkToBeConversion && x.getActionValueByIndex(StatKey.ATK, SELF_ENTITY_INDEX) > 1800
        },
        effect: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          dynamicStatConversionContainer(
            Stats.ATK,
            Stats.BE,
            this,
            x,
            action,
            context,
            SOURCE_TRACE,
            (convertibleValue) => 0.008 * Math.floor((convertibleValue - 1800) / 10),
          )
        },
        gpu: function(action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return gpuDynamicStatConversion(
            Stats.ATK,
            Stats.BE,
            this,
            action,
            context,
            `0.008 * floor((convertibleValue - 1800.0) / 10.0)`,
            `${wgslTrue(r.atkToBeConversion)} && ${containerActionVal(SELF_ENTITY_INDEX, StatKey.ATK, action.config)} > 1800.0`,
          )
        },
      },
    ],
  }
}


const simulation: SimulationMetadata = {
  parts: {
    [Parts.Body]: [
      Stats.ATK_P,
    ],
    [Parts.Feet]: [
      Stats.ATK_P,
      Stats.SPD,
    ],
    [Parts.PlanarSphere]: [
      Stats.ATK_P,
    ],
    [Parts.LinkRope]: [
      Stats.BE,
    ],
  },
  substats: [
    Stats.BE,
    Stats.ATK_P,
    Stats.ATK,
    Stats.CR,
    Stats.CD,
  ],
  comboTurnAbilities: [
    NULL_TURN_ABILITY_NAME,
    START_ULT,
    DEFAULT_SKILL,
    END_BREAK,
    WHOLE_SKILL,
    WHOLE_SKILL,
    WHOLE_SKILL,
  ],
  comboDot: 0,
  relicSets: [
    [Sets.IronCavalryAgainstTheScourge, Sets.IronCavalryAgainstTheScourge],
    ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  ],
  ornamentSets: [
    Sets.ForgeOfTheKalpagniLantern,
  ],
  teammates: [
    {
      characterId: FUGUE,
      lightCone: LONG_ROAD_LEADS_HOME,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: THE_DAHLIA,
      lightCone: NEVER_FORGET_HER_FLAME,
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
    [Stats.ATK]: 0.5,
    [Stats.ATK_P]: 0.5,
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
    [Parts.Body]: [
      Stats.ATK_P,
      Stats.EHR,
    ],
    [Parts.Feet]: [
      Stats.ATK_P,
      Stats.SPD,
    ],
    [Parts.PlanarSphere]: [
      Stats.ATK_P,
    ],
    [Parts.LinkRope]: [
      Stats.BE,
    ],
  },
  sets: {
    [Sets.IronCavalryAgainstTheScourge]: 1,
    [Sets.ThiefOfShootingMeteor]: T2_WEIGHT,

    [Sets.ForgeOfTheKalpagniLantern]: 1,
    [Sets.TaliaKingdomOfBanditry]: 1,
  },
  presets: [],
  sortOption: SortOption.SKILL,
  hiddenColumns: [
    SortOption.ULT,
    SortOption.FUA,
    SortOption.DOT,
  ],
  simulation,
}

const display = {
  imageCenter: {
    x: 930,
    y: 1075,
    z: 1.25,
  },
  showcaseColor: '#a0efec',
}

export const Firefly: CharacterConfig = {
  id: '1310',
  info: {},
  conditionals,
  scoring,
  display,
}
