import { Robin } from 'lib/conditionals/character/1300/Robin'
import { PermansorTerrae } from 'lib/conditionals/character/1400/PermansorTerrae'
import { Tribbie } from 'lib/conditionals/character/1400/Tribbie'
import {
  AbilityEidolon,
  type Conditionals,
  type ContentDefinition,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { FlowingNightglow } from 'lib/conditionals/lightcone/5star/FlowingNightglow'
import { IfTimeWereAFlower } from 'lib/conditionals/lightcone/5star/IfTimeWereAFlower'
import { ThoughWorldsApart } from 'lib/conditionals/lightcone/5star/ThoughWorldsApart'
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

import { precisionRound } from 'lib/utils/mathUtils'
import { type Eidolon } from 'types/character'
import { type CharacterConfig } from 'types/characterConfig'
import { type CharacterConditionalsController } from 'types/conditionals'
import {
  type ScoringMetadata,
  type SimulationMetadata,
} from 'types/metadata'
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'

export const ArlanEntities = createEnum('Arlan')
export const ArlanAbilities: AbilityKind[] = [
  AbilityKind.BASIC,
  AbilityKind.SKILL,
  AbilityKind.ULT,
  AbilityKind.BREAK,
]

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Arlan')
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
  } = Source.character(Arlan.id)

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
      content: t('Content.selfCurrentHpPercent.content', { talentMissingHpDmgBoostMax: precisionRound(100 * talentMissingHpDmgBoostMax) }),
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

    actionDeclaration: () => [...ArlanAbilities],
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      return {
        [AbilityKind.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Lightning)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [AbilityKind.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Lightning)
              .atkScaling(skillScaling)
              .toughnessDmg(20)
              .skillPointsUsed(0)
              .build(),
          ],
        },
        [AbilityKind.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Lightning)
              .atkScaling(ultScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [AbilityKind.BREAK]: {
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
      characterId: Tribbie.id,
      lightCone: IfTimeWereAFlower.id,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: Robin.id,
      lightCone: FlowingNightglow.id,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: PermansorTerrae.id,
      lightCone: ThoughWorldsApart.id,
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
  presets: [],
  sortOption: SortOption.SKILL,
  hiddenColumns: [
    SortOption.FUA,
    SortOption.DOT,
  ],
  simulation: simulation(),
})

const display = {
  imageCenter: {
    x: 1240,
    y: 1000,
    z: 1,
  },
  disableSpine: true,
  showcaseColor: '#6149b8',
}

export const Arlan: CharacterConfig = {
  id: '1008',
  display,
  conditionals,
  get scoring() {
    return scoring()
  },
}
