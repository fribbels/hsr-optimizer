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
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  ElementTag,
} from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { SortOption } from 'lib/optimization/sortOptions'
import {
  NULL_TURN_ABILITY_NAME,
  DEFAULT_FUA,
  END_SKILL,
  START_ULT,
  WHOLE_SKILL,
} from 'lib/optimization/rotation/turnAbilityConfig'
import {
  MATCH_2P_WEIGHT,
  SPREAD_ORNAMENTS_2P_FUA,
  SPREAD_ORNAMENTS_2P_FUA_WEIGHTS,
  SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  SPREAD_RELICS_2P_ATK_CRIT_WEIGHTS,
  SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  T2_WEIGHT,
} from 'lib/scoring/scoringConstants'
import { PresetEffects } from 'lib/scoring/presetEffects'
import {
  PERMANSOR_TERRAE,
  SPARKLE_B1,
  DANCE_DANCE_DANCE,
  THOUGH_WORLDS_APART,
  TRIBBIE,
  IF_TIME_WERE_A_FLOWER,
} from 'lib/simulations/tests/testMetadataConstants'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'
import { CharacterConfig } from 'types/characterConfig'
import { NumberToNumberMap } from 'types/common'
import { CharacterConditionalsController } from 'types/conditionals'
import { SimulationMetadata, ScoringMetadata } from 'types/metadata'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const ClaraEntities = createEnum('Clara')
export const ClaraAbilities = createEnum('BASIC', 'SKILL', 'FUA', 'BREAK')

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Clara')
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
  } = Source.character('1107')

  const ultDmgReductionValue = ult(e, 0.25, 0.27)
  const ultFuaExtraScaling = ult(e, 1.60, 1.728)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.20, 1.32)
  const fuaScaling = talent(e, 1.60, 1.76)

  // Ashblazing set hit multipliers (kept for reference)
  const hitMultiByTargetsBlast: NumberToNumberMap = {
    1: ASHBLAZING_ATK_STACK * (1 * 1 / 1),
    3: ASHBLAZING_ATK_STACK * (2 * 1 / 1),
    5: ASHBLAZING_ATK_STACK * (2 * 1 / 1), // Clara is 1 hit blast when enhanced
  }

  const hitMultiSingle = ASHBLAZING_ATK_STACK * (1 * 1 / 1)

  const defaults = {
    ultBuff: true,
    talentEnemyMarked: true,
    e2UltAtkBuff: true,
    e4DmgReductionBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    ultBuff: {
      id: 'ultBuff',
      formItem: 'switch',
      text: t('Content.ultBuff.text'),
      content: t('Content.ultBuff.content', {
        ultFuaExtraScaling: TsUtils.precisionRound(100 * ultFuaExtraScaling),
        ultDmgReductionValue: TsUtils.precisionRound(100 * ultDmgReductionValue),
      }),
    },
    talentEnemyMarked: {
      id: 'talentEnemyMarked',
      formItem: 'switch',
      text: t('Content.talentEnemyMarked.text'),
      content: t('Content.talentEnemyMarked.content', { skillScaling: TsUtils.precisionRound(100 * skillScaling) }),
    },
    e2UltAtkBuff: {
      id: 'e2UltAtkBuff',
      formItem: 'switch',
      text: t('Content.e2UltAtkBuff.text'),
      content: t('Content.e2UltAtkBuff.content'),
      disabled: e < 2,
    },
    e4DmgReductionBuff: {
      id: 'e4DmgReductionBuff',
      formItem: 'switch',
      text: t('Content.e4DmgReductionBuff.text'),
      content: t('Content.e4DmgReductionBuff.content'),
      disabled: e < 4,
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,

    entityDeclaration: () => Object.values(ClaraEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [ClaraEntities.Clara]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(ClaraAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      const skillAtkScaling = r.talentEnemyMarked ? skillScaling * 2 : skillScaling
      const fuaAtkScaling = r.ultBuff ? fuaScaling + ultFuaExtraScaling : fuaScaling

      return {
        [ClaraAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Physical)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [ClaraAbilities.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Physical)
              .atkScaling(skillAtkScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [ClaraAbilities.FUA]: {
          hits: [
            HitDefinitionBuilder.standardFua()
              .damageElement(ElementTag.Physical)
              .atkScaling(fuaAtkScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [ClaraAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Physical).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.buff(StatKey.ATK_P, (e >= 2 && r.e2UltAtkBuff) ? 0.30 : 0, x.source(SOURCE_E2))

      x.multiplicativeComplement(StatKey.DMG_RED, 0.10, x.source(SOURCE_TALENT))
      x.multiplicativeComplement(StatKey.DMG_RED, (r.ultBuff) ? ultDmgReductionValue : 0, x.source(SOURCE_ULT))
      x.multiplicativeComplement(StatKey.DMG_RED, (e >= 4 && r.e4DmgReductionBuff) ? 0.30 : 0, x.source(SOURCE_E4))

      x.buff(StatKey.DMG_BOOST, 0.30, x.damageType(DamageTag.FUA).source(SOURCE_TRACE))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      boostAshblazingAtkContainer(x, action, hitMultiSingle)
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuBoostAshblazingAtkContainer(hitMultiSingle, action)
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
      Stats.Physical_DMG,
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
    DEFAULT_FUA,
    DEFAULT_FUA,
    WHOLE_SKILL,
    DEFAULT_FUA,
    DEFAULT_FUA,
  ],
  comboDot: 0,
  relicSets: [
    [Sets.ChampionOfStreetwiseBoxing, Sets.ChampionOfStreetwiseBoxing],
    ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  ],
  ornamentSets: [
    Sets.DuranDynastyOfRunningWolves,
    ...SPREAD_ORNAMENTS_2P_FUA,
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
      characterId: SPARKLE_B1,
      lightCone: DANCE_DANCE_DANCE,
      characterEidolon: 0,
      lightConeSuperimposition: 5,
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
      Stats.Physical_DMG,
    ],
    [Parts.LinkRope]: [
      Stats.ATK_P,
    ],
  },
  sets: {
    ...SPREAD_RELICS_2P_ATK_CRIT_WEIGHTS,
    [Sets.TheAshblazingGrandDuke]: MATCH_2P_WEIGHT,
    [Sets.PoetOfMourningCollapse]: 1,
    [Sets.ChampionOfStreetwiseBoxing]: 1,
    [Sets.LongevousDisciple]: T2_WEIGHT,
    ...SPREAD_ORNAMENTS_2P_FUA_WEIGHTS,
  },
  presets: [
    PresetEffects.fnAshblazingSet(2),
    PresetEffects.fnSacerdosSet(1),
  ],
  sortOption: SortOption.FUA,
  hiddenColumns: [
    SortOption.ULT,
    SortOption.DOT,
  ],
  simulation,
}

const display = {
  imageCenter: {
    x: 880,
    y: 900,
    z: 1.15,
  },
  showcaseColor: '#a99dd1',
}

export const Clara: CharacterConfig = {
  id: '1107',
  info: {},
  conditionals,
  scoring,
  display,
}
