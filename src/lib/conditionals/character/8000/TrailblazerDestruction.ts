import { Bronya } from 'lib/conditionals/character/1100/Bronya'
import { Huohuo } from 'lib/conditionals/character/1200/Huohuo'
import { RuanMei } from 'lib/conditionals/character/1300/RuanMei'
import {
  AbilityEidolon,
  type Conditionals,
  type ContentDefinition,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { ButTheBattleIsntOver } from 'lib/conditionals/lightcone/5star/ButTheBattleIsntOver'
import { NightOfFright } from 'lib/conditionals/lightcone/5star/NightOfFright'
import { PastSelfInTheMirror } from 'lib/conditionals/lightcone/5star/PastSelfInTheMirror'
import {
  Parts,
  Sets,
  Stats,
} from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  ElementTag,
} from 'lib/optimization/engine/config/tag'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  AbilityKind,
  END_SKILL,
  NULL_TURN_ABILITY_NAME,
  START_ULT,
  WHOLE_SKILL,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { SortOption } from 'lib/optimization/sortOptions'
import {
  SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
} from 'lib/scoring/scoringConstants'
import { wrappedFixedT } from 'lib/utils/i18nUtils'
import { type Eidolon } from 'types/character'
import { type CharacterConfig } from 'types/characterConfig'
import {
  type ScoringMetadata,
  type SimulationMetadata,
} from 'types/metadata'

import { precisionRound } from 'lib/utils/mathUtils'
import { type CharacterConditionalsController } from 'types/conditionals'
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'

export const TrailblazerDestructionEntities = createEnum('TrailblazerDestruction')
export const TrailblazerDestructionAbilities: AbilityKind[] = [
  AbilityKind.BASIC,
  AbilityKind.SKILL,
  AbilityKind.ULT,
  AbilityKind.BREAK,
]

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.TrailblazerDestruction')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5
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
  } = Source.character(TrailblazerDestructionStelle.id)

  const talentAtkScalingValue = talent(e, 0.20, 0.22)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.25, 1.375)
  const ultScaling = ult(e, 4.5, 4.80)
  const ultEnhancedScaling = ult(e, 2.70, 2.88)
  const ultEnhancedScaling2 = ult(e, 1.62, 1.728)

  const defaults = {
    enhancedUlt: true,
    talentStacks: 2,
  }

  const content: ContentDefinition<typeof defaults> = {
    enhancedUlt: {
      id: 'enhancedUlt',
      formItem: 'switch',
      text: t('Content.enhancedUlt.text'),
      content: t('Content.enhancedUlt.content', {
        ultScaling: precisionRound(100 * ultScaling),
        ultEnhancedScaling: precisionRound(100 * ultEnhancedScaling),
        ultEnhancedScaling2: precisionRound(100 * ultEnhancedScaling2),
      }),
    },
    talentStacks: {
      id: 'talentStacks',
      formItem: 'slider',
      text: t('Content.talentStacks.text'),
      content: t('Content.talentStacks.content', { talentAtkScalingValue: precisionRound(100 * talentAtkScalingValue) }),
      min: 0,
      max: 2,
    },
  }

  return {
    entityDeclaration: () => Object.values(TrailblazerDestructionEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [TrailblazerDestructionEntities.TrailblazerDestruction]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),
    actionDeclaration: () => [...TrailblazerDestructionAbilities],
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      return {
        [AbilityKind.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Physical)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [AbilityKind.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Physical)
              .atkScaling(skillScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [AbilityKind.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Physical)
              .atkScaling((r.enhancedUlt) ? ultEnhancedScaling : ultScaling)
              .toughnessDmg((r.enhancedUlt) ? 20 : 30)
              .build(),
          ],
        },
        [AbilityKind.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Physical).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],
    content: () => Object.values(content),
    defaults: () => defaults,
    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',

    // New container methods
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.buff(StatKey.ATK_P, r.talentStacks * talentAtkScalingValue, x.source(SOURCE_TALENT))
      x.buff(StatKey.DEF_P, r.talentStacks * 0.10, x.source(SOURCE_TRACE))
      x.buff(StatKey.CR, (e >= 4 && action.config.enemyWeaknessBroken) ? 0.25 : 0, x.source(SOURCE_E4))

      // Boost
      x.buff(StatKey.DMG_BOOST, 0.25, x.damageType(DamageTag.SKILL).source(SOURCE_TRACE))
      x.buff(StatKey.DMG_BOOST, (r.enhancedUlt) ? 0.25 : 0, x.damageType(DamageTag.ULT).source(SOURCE_TRACE))
    },
  }
}

const simulation = (): SimulationMetadata => ({
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
      Stats.BE,
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
  relicSets: [
    [Sets.ScholarLostInErudition, Sets.ScholarLostInErudition],
    ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  ],
  ornamentSets: [
    Sets.RutilantArena,
    Sets.FirmamentFrontlineGlamoth,
    ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  ],
  teammates: [
    {
      characterId: Bronya.id,
      lightCone: ButTheBattleIsntOver.id,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: RuanMei.id,
      lightCone: PastSelfInTheMirror.id,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: Huohuo.id,
      lightCone: NightOfFright.id,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
  ],
})

const scoring = (): ScoringMetadata => ({
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
    [Stats.BE]: 0.5,
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
      Stats.BE,
    ],
  },
  presets: [],
  sortOption: SortOption.SKILL,
  hiddenColumns: [SortOption.FUA, SortOption.DOT],
  simulation: simulation(),
})

const displayCaelus = {
  imageCenter: {
    x: 1024,
    y: 1100,
    z: 1,
  },
  disableSpine: true,
  showcaseColor: '#8295fb',
}

const displayStelle = {
  imageCenter: {
    x: 1024,
    y: 1024,
    z: 1,
  },
  disableSpine: true,
  showcaseColor: '#8a93fa',
}

export const TrailblazerDestructionCaelus: CharacterConfig = {
  id: '8001',
  conditionals,
  get scoring() {
    return scoring()
  },
  display: displayCaelus,
}

export const TrailblazerDestructionStelle: CharacterConfig = {
  id: '8002',
  conditionals,
  get scoring() {
    return scoring()
  },
  display: displayStelle,
}
