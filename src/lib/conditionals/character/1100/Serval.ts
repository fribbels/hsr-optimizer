import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { Parts, Sets, Stats } from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { ElementTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { SortOption } from 'lib/optimization/sortOptions'
import {
  NULL_TURN_ABILITY_NAME,
  END_SKILL,
  START_ULT,
  WHOLE_SKILL,
} from 'lib/optimization/rotation/turnAbilityConfig'
import {
  SPREAD_ORNAMENTS_2P_ENERGY_REGEN,
  SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  SPREAD_ORNAMENTS_2P_SUPPORT,
  SPREAD_RELICS_2P_ATK_CRIT_WEIGHTS,
  SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  T2_WEIGHT,
} from 'lib/scoring/scoringConstants'
import { PresetEffects } from 'lib/scoring/presetEffects'
import {
  IF_TIME_WERE_A_FLOWER,
  INTO_THE_UNREACHABLE_VEIL,
  PERMANSOR_TERRAE,
  THE_HERTA,
  THOUGH_WORLDS_APART,
  TRIBBIE,
} from 'lib/simulations/tests/testMetadataConstants'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'
import { CharacterConfig } from 'types/characterConfig'

import { CharacterConditionalsController } from 'types/conditionals'
import { SimulationMetadata, ScoringMetadata } from 'types/metadata'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const ServalEntities = createEnum('Serval')
export const ServalAbilities = createEnum('BASIC', 'SKILL', 'ULT', 'DOT', 'BREAK')

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Serval')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5
  const {
    SOURCE_BASIC,
    SOURCE_SKILL,
    SOURCE_ULT,
    SOURCE_TALENT,
    SOURCE_TRACE,
    SOURCE_E6,
  } = Source.character('1103')

  const talentExtraDmgScaling = talent(e, 0.72, 0.792)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.40, 1.54)
  const ultScaling = ult(e, 1.80, 1.944)
  const dotScaling = skill(e, 1.04, 1.144)

  const defaults = {
    targetShocked: true,
    enemyDefeatedBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    targetShocked: {
      id: 'targetShocked',
      formItem: 'switch',
      text: t('Content.targetShocked.text'),
      content: t('Content.targetShocked.content', { talentExtraDmgScaling: TsUtils.precisionRound(100 * talentExtraDmgScaling) }),
    },
    enemyDefeatedBuff: {
      id: 'enemyDefeatedBuff',
      formItem: 'switch',
      text: t('Content.enemyDefeatedBuff.text'),
      content: t('Content.enemyDefeatedBuff.content'),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,

    entityDeclaration: () => Object.values(ServalEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [ServalEntities.Serval]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(ServalAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      return {
        [ServalAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Lightning)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
            ...(r.targetShocked
              ? [
                HitDefinitionBuilder.standardAdditional()
                  .damageElement(ElementTag.Lightning)
                  .atkScaling(talentExtraDmgScaling)
                  .build(),
              ]
              : []),
          ],
        },
        [ServalAbilities.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Lightning)
              .atkScaling(skillScaling)
              .toughnessDmg(20)
              .build(),
            ...(r.targetShocked
              ? [
                HitDefinitionBuilder.standardAdditional()
                  .damageElement(ElementTag.Lightning)
                  .atkScaling(talentExtraDmgScaling)
                  .build(),
              ]
              : []),
          ],
        },
        [ServalAbilities.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Lightning)
              .atkScaling(ultScaling)
              .toughnessDmg(20)
              .build(),
            ...(r.targetShocked
              ? [
                HitDefinitionBuilder.standardAdditional()
                  .damageElement(ElementTag.Lightning)
                  .atkScaling(talentExtraDmgScaling)
                  .build(),
              ]
              : []),
          ],
        },
        [ServalAbilities.DOT]: {
          hits: [
            HitDefinitionBuilder.standardDot()
              .damageElement(ElementTag.Lightning)
              .atkScaling(dotScaling)
              .dotBaseChance(1.0)
              .build(),
          ],
        },
        [ServalAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Lightning).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.buff(StatKey.ATK_P, (r.enemyDefeatedBuff) ? 0.20 : 0, x.source(SOURCE_TRACE))
      x.buff(StatKey.DMG_BOOST, (e >= 6 && r.targetShocked) ? 0.30 : 0, x.source(SOURCE_E6))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {},
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',
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
  ],
  comboDot: 0,
  errRopeEidolon: 0,
  deprioritizeBuffs: true,
  relicSets: [
    [Sets.PioneerDiverOfDeadWaters, Sets.PioneerDiverOfDeadWaters],
    [Sets.ScholarLostInErudition, Sets.ScholarLostInErudition],
    [Sets.BandOfSizzlingThunder, Sets.BandOfSizzlingThunder],
    [Sets.EagleOfTwilightLine, Sets.EagleOfTwilightLine],
    ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  ],
  ornamentSets: [
    Sets.FirmamentFrontlineGlamoth,
    Sets.RutilantArena,
    Sets.SprightlyVonwacq,
    ...SPREAD_ORNAMENTS_2P_ENERGY_REGEN,
    ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
    ...SPREAD_ORNAMENTS_2P_SUPPORT,
  ],
  teammates: [
    {
      characterId: THE_HERTA,
      lightCone: INTO_THE_UNREACHABLE_VEIL,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: TRIBBIE,
      lightCone: IF_TIME_WERE_A_FLOWER,
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
      Stats.CD,
      Stats.CR,
      Stats.EHR,
    ],
    [Parts.Feet]: [
      Stats.SPD,
      Stats.ATK_P,
    ],
    [Parts.PlanarSphere]: [
      Stats.ATK_P,
      Stats.Lightning_DMG,
    ],
    [Parts.LinkRope]: [
      Stats.ATK_P,
      Stats.ERR,
    ],
  },
  sets: {
    ...SPREAD_RELICS_2P_ATK_CRIT_WEIGHTS,
    [Sets.PioneerDiverOfDeadWaters]: 1,
    [Sets.ScholarLostInErudition]: 1,
    [Sets.BandOfSizzlingThunder]: T2_WEIGHT,
    [Sets.FirmamentFrontlineGlamoth]: 1,
    [Sets.SpaceSealingStation]: 1,
    [Sets.RutilantArena]: 1,
    [Sets.InertSalsotto]: 1,
  },
  presets: [
    PresetEffects.fnPioneerSet(4),
  ],
  sortOption: SortOption.ULT,
  hiddenColumns: [
    SortOption.FUA,
  ],
  simulation,
}

const display = {
  imageCenter: {
    x: 1060,
    y: 1030,
    z: 1.3,
  },
  showcaseColor: '#8772f4',
}

export const Serval: CharacterConfig = {
  id: '1103',
  info: {},
  conditionals,
  scoring,
  display,
}
