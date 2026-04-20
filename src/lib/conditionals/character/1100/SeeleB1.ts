import { SilverWolfB1 } from 'lib/conditionals/character/1000/SilverWolfB1'
import { SparkleB1 } from 'lib/conditionals/character/1300/SparkleB1'
import { PermansorTerrae } from 'lib/conditionals/character/1400/PermansorTerrae'
import type {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import {
  AbilityEidolon,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { ButTheBattleIsntOver } from 'lib/conditionals/lightcone/5star/ButTheBattleIsntOver'
import { LiesAflutterInTheWind } from 'lib/conditionals/lightcone/5star/LiesAflutterInTheWind'
import { ThoughWorldsApart } from 'lib/conditionals/lightcone/5star/ThoughWorldsApart'
import {
  Parts,
  Sets,
  Stats,
} from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { ElementTag } from 'lib/optimization/engine/config/tag'
import type { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  AbilityKind,
  DEFAULT_SKILL,
  END_SKILL,
  NULL_TURN_ABILITY_NAME,
  START_ULT,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { SortOption } from 'lib/optimization/sortOptions'
import { PresetEffects } from 'lib/scoring/presetEffects'
import {
  SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
} from 'lib/scoring/scoringConstants'
import { wrappedFixedT } from 'lib/utils/i18nUtils'
import { precisionRound } from 'lib/utils/mathUtils'

import type { Eidolon } from 'types/character'
import type { CharacterConfig } from 'types/characterConfig'

import type { CharacterConditionalsController } from 'types/conditionals'
import type {
  ScoringMetadata,
  SimulationMetadata,
} from 'types/metadata'
import type {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const SeeleB1Entities = createEnum('SeeleB1')
export const SeeleB1Abilities: AbilityKind[] = [
  AbilityKind.BASIC,
  AbilityKind.SKILL,
  AbilityKind.ULT,
  AbilityKind.BREAK,
]

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.SeeleB1')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5
  const {
    SOURCE_SKILL,
    SOURCE_TALENT,
    SOURCE_TRACE,
    SOURCE_E1,
  } = Source.character(SeeleB1.id)

  const buffedStateDmgBuff = talent(e, 0.80, 0.88)
  const speedBoostStacksMax = e >= 2 ? 2 : 1

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 3.60, 3.96)
  const ultScaling = ult(e, 7.20, 7.92)

  const defaults = {
    buffedState: true,
    speedBoostStacks: speedBoostStacksMax,
    dmgBoostStacks: 3,
    e1EnemyHp80CrBoost: false,
    e6UltTargetDebuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    buffedState: {
      id: 'buffedState',
      formItem: 'switch',
      text: t('Content.buffedState.text'),
      content: t('Content.buffedState.content', { buffedStateDmgBuff: precisionRound(100 * buffedStateDmgBuff) }),
    },
    speedBoostStacks: {
      id: 'speedBoostStacks',
      formItem: 'slider',
      text: t('Content.speedBoostStacks.text'),
      content: t('Content.speedBoostStacks.content'),
      min: 0,
      max: speedBoostStacksMax,
    },
    dmgBoostStacks: {
      id: 'dmgBoostStacks',
      formItem: 'slider',
      text: t('Content.dmgBoostStacks.text'),
      content: t('Content.dmgBoostStacks.content'),
      min: 0,
      max: 3,
    },
    e1EnemyHp80CrBoost: {
      id: 'e1EnemyHp80CrBoost',
      formItem: 'switch',
      text: t('Content.e1EnemyHp80CrBoost.text'),
      content: t('Content.e1EnemyHp80CrBoost.content'),
      disabled: e < 1,
    },
    e6UltTargetDebuff: {
      id: 'e6UltTargetDebuff',
      formItem: 'switch',
      text: t('Content.e6UltTargetDebuff.text'),
      content: t('Content.e6UltTargetDebuff.content'),
      disabled: e < 6,
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,

    entityDeclaration: () => Object.values(SeeleB1Entities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [SeeleB1Entities.SeeleB1]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => [...SeeleB1Abilities],
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      const e6Active = e >= 6 && r.e6UltTargetDebuff

      return {
        [AbilityKind.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Quantum)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .trueDmgModifier(e6Active ? 0.30 * (ultScaling / basicScaling) : 0)
              .build(),
          ],
        },
        [AbilityKind.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Quantum)
              .atkScaling(skillScaling)
              .toughnessDmg(20)
              .trueDmgModifier(e6Active ? 0.30 * (ultScaling / skillScaling) : 0)
              .build(),
          ],
        },
        [AbilityKind.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Quantum)
              .atkScaling(ultScaling)
              .toughnessDmg(30)
              .trueDmgModifier(e6Active ? 0.30 : 0)
              .build(),
          ],
        },
        [AbilityKind.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Quantum).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.buff(StatKey.CR, (e >= 1 && r.e1EnemyHp80CrBoost) ? 0.15 : 0, x.source(SOURCE_E1))
      x.buff(StatKey.DEF_PEN, (e >= 1 && r.e1EnemyHp80CrBoost) ? 0.20 : 0, x.source(SOURCE_E1))
      x.buff(StatKey.SPD_P, 0.25 * r.speedBoostStacks, x.source(SOURCE_SKILL))

      x.buff(StatKey.DMG_BOOST, r.dmgBoostStacks * 0.50, x.source(SOURCE_TRACE))
      x.buff(StatKey.DMG_BOOST, (r.buffedState) ? buffedStateDmgBuff : 0, x.source(SOURCE_TALENT))
      x.buff(StatKey.RES_PEN, (r.buffedState) ? 0.25 : 0, x.source(SOURCE_TRACE))
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      // TODO: Seele's E6 should have a teammate effect but its kinda hard to calc
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {},
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',
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
      Stats.Quantum_DMG,
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
    DEFAULT_SKILL,
    DEFAULT_SKILL,
    END_SKILL,
    DEFAULT_SKILL,
  ],
  comboDot: 0,
  relicSets: [
    [Sets.ScholarLostInErudition, Sets.ScholarLostInErudition],
    [Sets.GeniusOfBrilliantStars, Sets.GeniusOfBrilliantStars],
    ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  ],
  ornamentSets: [
    Sets.RutilantArena,
    Sets.TengokuLivestream,
    Sets.FirmamentFrontlineGlamoth,
    ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  ],
  teammates: [
    {
      characterId: SilverWolfB1.id,
      lightCone: LiesAflutterInTheWind.id,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: SparkleB1.id,
      lightCone: ButTheBattleIsntOver.id,
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
      Stats.Quantum_DMG,
    ],
    [Parts.LinkRope]: [
      Stats.ATK_P,
    ],
  },
  presets: [
    PresetEffects.TENGOKU_SET,
  ],
  sortOption: SortOption.SKILL,
  hiddenColumns: [
    SortOption.FUA,
    SortOption.DOT,
  ],
  simulation: simulation(),
})

const display = {
  imageCenter: {
    x: 820,
    y: 1075,
    z: 1.1,
  },
  showcaseColor: '#624c9c',
}

export const SeeleB1: CharacterConfig = {
  id: '1102b1',
  display,
  conditionals,
  get scoring() {
    return scoring()
  },
}
