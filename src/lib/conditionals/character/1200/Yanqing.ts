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
import { ElementTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  MATCH_2P_WEIGHT,
  SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  SPREAD_RELICS_2P_ATK_CRIT_WEIGHTS,
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
  DEFAULT_SKILL,
  END_FUA,
  NULL_TURN_ABILITY_NAME,
  START_SKILL,
  START_ULT,
  WHOLE_SKILL,
} from 'lib/optimization/rotation/turnAbilityConfig'
import {
  BRONYA,
  PERMANSOR_TERRAE,
  ROBIN,
  BUT_THE_BATTLE_ISNT_OVER,
  FLOWING_NIGHTGLOW,
  THOUGH_WORLDS_APART,
} from 'lib/simulations/tests/testMetadataConstants'

export const YanqingEntities = createEnum('Yanqing')
export const YanqingAbilities = createEnum('BASIC', 'SKILL', 'ULT', 'FUA', 'BREAK')

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Yanqing')
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
  } = Source.character('1209')

  const ultCdBuffValue = ult(e, 0.50, 0.54)
  const talentCdBuffValue = ult(e, 0.30, 0.33)
  const talentCrBuffValue = ult(e, 0.20, 0.21)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.20, 2.42)
  const ultScaling = ult(e, 3.50, 3.78)
  const fuaScaling = talent(e, 0.50, 0.55)

  const hitMulti = ASHBLAZING_ATK_STACK * (1 * 1 / 1)

  const defaults = {
    ultBuffActive: true,
    soulsteelBuffActive: true,
    critSpdBuff: true,
    e1TargetFrozen: true,
    e4CurrentHp80: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    ultBuffActive: {
      id: 'ultBuffActive',
      formItem: 'switch',
      text: t('Content.ultBuffActive.text'),
      content: t('Content.ultBuffActive.content', { ultCdBuffValue: TsUtils.precisionRound(100 * ultCdBuffValue) }),
    },
    soulsteelBuffActive: {
      id: 'soulsteelBuffActive',
      formItem: 'switch',
      text: t('Content.soulsteelBuffActive.text'),
      content: t('Content.soulsteelBuffActive.content', {
        talentCdBuffValue: TsUtils.precisionRound(100 * talentCdBuffValue),
        talentCrBuffValue: TsUtils.precisionRound(100 * talentCrBuffValue),
        ultCdBuffValue: TsUtils.precisionRound(100 * ultCdBuffValue),
      }),
    },
    critSpdBuff: {
      id: 'critSpdBuff',
      formItem: 'switch',
      text: t('Content.critSpdBuff.text'),
      content: t('Content.critSpdBuff.content'),
    },
    e1TargetFrozen: {
      id: 'e1TargetFrozen',
      formItem: 'switch',
      text: t('Content.e1TargetFrozen.text'),
      content: t('Content.e1TargetFrozen.content'),
      disabled: (e < 1),
    },
    e4CurrentHp80: {
      id: 'e4CurrentHp80',
      formItem: 'switch',
      text: t('Content.e4CurrentHp80.text'),
      content: t('Content.e4CurrentHp80.content'),
      disabled: (e < 4),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,

    entityDeclaration: () => Object.values(YanqingEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [YanqingEntities.Yanqing]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(YanqingAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // E1: +60% ATK scaling when target frozen
      const e1Bonus = (e >= 1 && r.e1TargetFrozen) ? 0.60 : 0

      // Trace: Additional damage when enemy is elemental weak
      const additionalDmgScaling = (context.enemyElementalWeak) ? 0.30 : 0

      return {
        [YanqingAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Ice)
              .atkScaling(basicScaling + e1Bonus)
              .toughnessDmg(10)
              .build(),
            ...(additionalDmgScaling > 0
              ? [
                HitDefinitionBuilder.standardAdditional()
                  .damageElement(ElementTag.Ice)
                  .atkScaling(additionalDmgScaling)
                  .build(),
              ]
              : []),
          ],
        },
        [YanqingAbilities.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Ice)
              .atkScaling(skillScaling + e1Bonus)
              .toughnessDmg(20)
              .build(),
            ...(additionalDmgScaling > 0
              ? [
                HitDefinitionBuilder.standardAdditional()
                  .damageElement(ElementTag.Ice)
                  .atkScaling(additionalDmgScaling)
                  .build(),
              ]
              : []),
          ],
        },
        [YanqingAbilities.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Ice)
              .atkScaling(ultScaling + e1Bonus)
              .toughnessDmg(30)
              .build(),
            ...(additionalDmgScaling > 0
              ? [
                HitDefinitionBuilder.standardAdditional()
                  .damageElement(ElementTag.Ice)
                  .atkScaling(additionalDmgScaling)
                  .build(),
              ]
              : []),
          ],
        },
        [YanqingAbilities.FUA]: {
          hits: [
            HitDefinitionBuilder.standardFua()
              .damageElement(ElementTag.Ice)
              .atkScaling(fuaScaling + e1Bonus)
              .toughnessDmg(10)
              .build(),
            ...(additionalDmgScaling > 0
              ? [
                HitDefinitionBuilder.standardAdditional()
                  .damageElement(ElementTag.Ice)
                  .atkScaling(additionalDmgScaling)
                  .build(),
              ]
              : []),
          ],
        },
        [YanqingAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Ice).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // ULT: CR buff
      x.buff(StatKey.CR, (r.ultBuffActive) ? 0.60 : 0, x.source(SOURCE_ULT))

      // ULT: CD buff (requires soulsteel)
      x.buff(StatKey.CD, (r.ultBuffActive && r.soulsteelBuffActive) ? ultCdBuffValue : 0, x.source(SOURCE_ULT))

      // Talent: CR buff from soulsteel
      x.buff(StatKey.CR, (r.soulsteelBuffActive) ? talentCrBuffValue : 0, x.source(SOURCE_TALENT))

      // Talent: CD buff from soulsteel
      x.buff(StatKey.CD, (r.soulsteelBuffActive) ? talentCdBuffValue : 0, x.source(SOURCE_TALENT))

      // Trace: RES buff from soulsteel
      x.buff(StatKey.RES, (r.soulsteelBuffActive) ? 0.20 : 0, x.source(SOURCE_TRACE))

      // Trace: SPD% buff on crit
      x.buff(StatKey.SPD_P, (r.critSpdBuff) ? 0.10 : 0, x.source(SOURCE_TRACE))

      // E2: ERR buff when soulsteel active
      x.buff(StatKey.ERR, (e >= 2 && r.soulsteelBuffActive) ? 0.10 : 0, x.source(SOURCE_E2))

      // E4: Ice RES PEN when HP > 80%
      x.buff(StatKey.RES_PEN, (e >= 4 && r.e4CurrentHp80) ? 0.12 : 0, x.elements(ElementTag.Ice).source(SOURCE_E4))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      boostAshblazingAtkContainer(x, action, hitMulti)
    },

    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuBoostAshblazingAtkContainer(hitMulti, action)
    },
  }
}


const simulation: SimulationMetadata = {
  parts: {
    [Parts.Body]: [
      Stats.CD,
    ],
    [Parts.Feet]: [
      Stats.ATK_P,
      Stats.SPD,
    ],
    [Parts.PlanarSphere]: [
      Stats.ATK_P,
      Stats.Ice_DMG,
    ],
    [Parts.LinkRope]: [
      Stats.ATK_P,
    ],
  },
  substats: [
    Stats.CR,
    Stats.CD,
    Stats.ATK_P,
    Stats.ATK,
  ],
  comboTurnAbilities: [
    NULL_TURN_ABILITY_NAME,
    START_ULT,
    DEFAULT_SKILL,
    END_FUA,
    START_SKILL,
    END_FUA,
    WHOLE_SKILL,
    WHOLE_SKILL,
  ],
  comboDot: 0,
  relicSets: [
    [Sets.ScholarLostInErudition, Sets.ScholarLostInErudition],
    [Sets.HunterOfGlacialForest, Sets.HunterOfGlacialForest],
    ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  ],
  ornamentSets: [
    Sets.RutilantArena,
    Sets.FirmamentFrontlineGlamoth,
    ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  ],
  teammates: [
    {
      characterId: BRONYA,
      lightCone: BUT_THE_BATTLE_ISNT_OVER,
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
      characterId: PERMANSOR_TERRAE,
      lightCone: THOUGH_WORLDS_APART,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
  ],
}

const scoring: ScoringMetadata = {
  stats: {
    [Stats.ATK]: 0.75,
    [Stats.ATK_P]: 0.75,
    [Stats.DEF]: 0,
    [Stats.DEF_P]: 0,
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
      Stats.CR,
      Stats.CD,
      Stats.EHR,
    ],
    [Parts.Feet]: [
      Stats.ATK_P,
      Stats.SPD,
    ],
    [Parts.PlanarSphere]: [
      Stats.ATK_P,
      Stats.Ice_DMG,
    ],
    [Parts.LinkRope]: [
      Stats.ATK_P,
    ],
  },
  sets: {
    ...SPREAD_RELICS_2P_ATK_CRIT_WEIGHTS,
    [Sets.PioneerDiverOfDeadWaters]: MATCH_2P_WEIGHT,
    [Sets.ScholarLostInErudition]: 1,
    [Sets.HunterOfGlacialForest]: 1,

    [Sets.FirmamentFrontlineGlamoth]: 1,
    [Sets.RutilantArena]: 1,
    [Sets.SpaceSealingStation]: 1,
  },
  presets: [
    PresetEffects.VALOROUS_SET,
    PresetEffects.fnAshblazingSet(2),
  ],
  sortOption: SortOption.ULT,
  hiddenColumns: [SortOption.DOT],
  simulation,
}

const display = {
  imageCenter: {
    x: 1000,
    y: 1000,
    z: 1,
  },
  showcaseColor: '#6db1f4',
}

export const Yanqing: CharacterConfig = {
  id: '1209',
  info: {},
  conditionals,
  scoring,
  display,
}