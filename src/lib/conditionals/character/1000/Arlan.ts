import { AbilityEidolon, Conditionals, ContentDefinition, createEnum, } from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { Parts, Sets, Stats } from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { DamageTag, ElementTag, } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { SortOption } from 'lib/optimization/sortOptions'
import {
  NULL_TURN_ABILITY_NAME,
  START_ULT,
  END_SKILL,
  WHOLE_SKILL,
} from 'lib/optimization/rotation/turnAbilityConfig'
import {
  SPREAD_RELICS_2P_ATK_CRIT_WEIGHTS,
  SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  MATCH_2P_WEIGHT,
  T2_WEIGHT,
} from 'lib/scoring/scoringConstants'
import {
  TRIBBIE,
  IF_TIME_WERE_A_FLOWER,
  ROBIN,
  FLOWING_NIGHTGLOW,
  PERMANSOR_TERRAE,
  THOUGH_WORLDS_APART,
} from 'lib/simulations/tests/testMetadataConstants'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'
import { CharacterConfig } from 'types/characterConfig'
import { CharacterConditionalsController } from 'types/conditionals'
import { SimulationMetadata, ScoringMetadata } from 'types/metadata'
import { OptimizerAction, OptimizerContext, } from 'types/optimizer'

export const ArlanEntities = createEnum('Arlan')
export const ArlanAbilities = createEnum('BASIC', 'SKILL', 'ULT', 'BREAK')

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Arlan')
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
  } = Source.character('1008')

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.40, 2.64)
  const ultScaling = ult(e, 3.20, 3.456)

  const talentMissingHpDmgBoostMax = talent(e, 0.72, 0.792)

  const defaults = {
    selfCurrentHpPercent: 1.00,
  }

  const content: ContentDefinition<typeof defaults> = {
    selfCurrentHpPercent: {
      id: 'selfCurrentHpPercent',
      formItem: 'slider',
      text: t('Content.selfCurrentHpPercent.text'),
      content: t('Content.selfCurrentHpPercent.content', { talentMissingHpDmgBoostMax: TsUtils.precisionRound(100 * talentMissingHpDmgBoostMax) }),
      min: 0.01,
      max: 1.0,
      percent: true,
    },
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => [],
    defaults: () => defaults,
    teammateDefaults: () => ({}),

    entityDeclaration: () => Object.values(ArlanEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [ArlanEntities.Arlan]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(ArlanAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      return {
        [ArlanAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Lightning)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [ArlanAbilities.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Lightning)
              .atkScaling(skillScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [ArlanAbilities.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Lightning)
              .atkScaling(ultScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [ArlanAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Lightning).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.buff(StatKey.DMG_BOOST, Math.min(talentMissingHpDmgBoostMax, 1 - r.selfCurrentHpPercent), x.source(SOURCE_TALENT))
      x.buff(StatKey.DMG_BOOST, (e >= 1 && r.selfCurrentHpPercent <= 0.50) ? 0.10 : 0, x.damageType(DamageTag.SKILL).source(SOURCE_E1))
      x.buff(StatKey.DMG_BOOST, (e >= 6 && r.selfCurrentHpPercent <= 0.50) ? 0.20 : 0, x.damageType(DamageTag.ULT).source(SOURCE_E6))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },
  }
}


const simulation: SimulationMetadata = {
  parts: {
    [Parts.Body]: [
      Stats.CR,
      Stats.CD,
    ],
    [Parts.Feet]: [
      Stats.ATK_P,
      Stats.SPD,
    ],
    [Parts.PlanarSphere]: [
      Stats.ATK_P,
      Stats.Lightning_DMG,
    ],
    [Parts.LinkRope]: [
      Stats.ATK_P,
    ],
  },
  substats: [
    Stats.CD,
    Stats.CR,
    Stats.ATK_P,
    Stats.ATK,
  ],
  comboTurnAbilities: [
    NULL_TURN_ABILITY_NAME,
    START_ULT,
    END_SKILL,
    WHOLE_SKILL,
    WHOLE_SKILL,
  ],
  comboDot: 0,
  relicSets: [
    [Sets.ScholarLostInErudition, Sets.ScholarLostInErudition],
    ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  ],
  ornamentSets: [
    Sets.RutilantArena,
    ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  ],
  teammates: [
    {
      characterId: TRIBBIE,
      lightCone: IF_TIME_WERE_A_FLOWER,
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
      Stats.Lightning_DMG,
    ],
    [Parts.LinkRope]: [
      Stats.ATK_P,
    ],
  },
  sets: {
    ...SPREAD_RELICS_2P_ATK_CRIT_WEIGHTS,
    [Sets.PioneerDiverOfDeadWaters]: MATCH_2P_WEIGHT,
    [Sets.ScholarLostInErudition]: 1,
    [Sets.BandOfSizzlingThunder]: T2_WEIGHT,
    [Sets.LongevousDisciple]: T2_WEIGHT,

    [Sets.RutilantArena]: 1,
    [Sets.FirmamentFrontlineGlamoth]: 1,
    [Sets.SpaceSealingStation]: 1,
    [Sets.InertSalsotto]: 1,
  },
  presets: [],
  sortOption: SortOption.SKILL,
  hiddenColumns: [
    SortOption.FUA,
    SortOption.DOT,
  ],
  simulation,
}

const display = {
  imageCenter: {
    x: 1240,
    y: 1000,
    z: 1,
  },
  showcaseColor: '#817fd1',
}

export const Arlan: CharacterConfig = {
  id: '1008',
  info: {},
  conditionals,
  scoring,
  display,
}
