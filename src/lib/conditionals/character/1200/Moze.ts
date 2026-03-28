import {
  ASHBLAZING_ATK_STACK,
} from 'lib/conditionals/conditionalConstants'
import {
  boostAshblazingAtkContainer,
  gpuBoostAshblazingAtkContainer,
} from 'lib/conditionals/conditionalFinalizers'
import {
  AbilityEidolon,
  type Conditionals,
  type ContentDefinition,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
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
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { SortOption } from 'lib/optimization/sortOptions'
import { PresetEffects } from 'lib/scoring/presetEffects'
import {
  SPREAD_ORNAMENTS_2P_FUA,
  SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  SPREAD_ORNAMENTS_2P_SUPPORT,
  SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
} from 'lib/scoring/scoringConstants'
import { wrappedFixedT } from 'lib/utils/i18nUtils'

import { type Eidolon } from 'types/character'
import { type CharacterConfig } from 'types/characterConfig'
import {
  type ScoringMetadata,
  type SimulationMetadata,
} from 'types/metadata'

import { Feixiao } from 'lib/conditionals/character/1200/Feixiao'
import { PermansorTerrae } from 'lib/conditionals/character/1400/PermansorTerrae'
import { Tribbie } from 'lib/conditionals/character/1400/Tribbie'
import { IfTimeWereAFlower } from 'lib/conditionals/lightcone/5star/IfTimeWereAFlower'
import { IVentureForthToHunt } from 'lib/conditionals/lightcone/5star/IVentureForthToHunt'
import { ThoughWorldsApart } from 'lib/conditionals/lightcone/5star/ThoughWorldsApart'
import {
  AbilityKind,
  DEFAULT_FUA,
  DEFAULT_ULT,
  NULL_TURN_ABILITY_NAME,
  WHOLE_SKILL,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { type CharacterConditionalsController } from 'types/conditionals'
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'
import { precisionRound } from 'lib/utils/mathUtils'

export const MozeEntities = createEnum('Moze')
export const MozeAbilities: AbilityKind[] = [
  AbilityKind.BASIC,
  AbilityKind.SKILL,
  AbilityKind.ULT,
  AbilityKind.FUA,
  AbilityKind.BREAK,
]

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Moze')
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_TALENT_3_SKILL_BASIC_5
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
  } = Source.character('1223')

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.50, 1.65)
  const ultScaling = ult(e, 2.70, 2.916)

  const fuaScaling = talent(e, 1.60, 1.76)
  const additionalDmgScaling = talent(e, 0.30, 0.33)

  const fuaHitCountMulti = ASHBLAZING_ATK_STACK * (1 * 0.08 + 2 * 0.08 + 3 * 0.08 + 4 * 0.08 + 5 * 0.08 + 6 * 0.6)

  const defaults = {
    preyMark: true,
    e2CdBoost: true,
    e4DmgBuff: true,
    e6MultiplierIncrease: true,
  }

  const teammateDefaults = {
    preyMark: true,
    e2CdBoost: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    preyMark: {
      id: 'preyMark',
      formItem: 'switch',
      text: t('Content.preyMark.text'),
      content: t('Content.preyMark.content', {
        PreyAdditionalMultiplier: precisionRound(100 * additionalDmgScaling),
        FuaScaling: precisionRound(100 * fuaScaling),
      }),
    },
    e2CdBoost: {
      id: 'e2CdBoost',
      formItem: 'switch',
      text: t('Content.e2CdBoost.text'),
      content: t('Content.e2CdBoost.content'),
      disabled: e < 2,
    },
    e4DmgBuff: {
      id: 'e4DmgBuff',
      formItem: 'switch',
      text: t('Content.e4DmgBuff.text'),
      content: t('Content.e4DmgBuff.content'),
      disabled: e < 4,
    },
    e6MultiplierIncrease: {
      id: 'e6MultiplierIncrease',
      formItem: 'switch',
      text: t('Content.e6MultiplierIncrease.text'),
      content: t('Content.e6MultiplierIncrease.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    preyMark: content.preyMark,
    e2CdBoost: content.e2CdBoost,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(MozeEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [MozeEntities.Moze]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => [...MozeAbilities],
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      const e6FuaScaling = (e >= 6 && r.e6MultiplierIncrease) ? 0.25 : 0

      return {
        [AbilityKind.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Lightning)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
            ...(
              (r.preyMark)
                ? [
                  HitDefinitionBuilder.standardAdditional()
                    .damageElement(ElementTag.Lightning)
                    .atkScaling(additionalDmgScaling)
                    .build(),
                ]
                : []
            ),
          ],
        },
        [AbilityKind.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Lightning)
              .atkScaling(skillScaling)
              .toughnessDmg(20)
              .build(),
            ...(
              (r.preyMark)
                ? [
                  HitDefinitionBuilder.standardAdditional()
                    .damageElement(ElementTag.Lightning)
                    .atkScaling(additionalDmgScaling)
                    .build(),
                ]
                : []
            ),
          ],
        },
        [AbilityKind.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageType(DamageTag.ULT | DamageTag.FUA)
              .damageElement(ElementTag.Lightning)
              .atkScaling(ultScaling)
              .toughnessDmg(30)
              .build(),
            ...(
              (r.preyMark)
                ? [
                  HitDefinitionBuilder.standardAdditional()
                    .damageElement(ElementTag.Lightning)
                    .atkScaling(additionalDmgScaling)
                    .build(),
                ]
                : []
            ),
          ],
        },
        [AbilityKind.FUA]: {
          hits: [
            HitDefinitionBuilder.standardFua()
              .damageElement(ElementTag.Lightning)
              .atkScaling(fuaScaling + e6FuaScaling)
              .toughnessDmg(10)
              .build(),
            ...(
              (r.preyMark)
                ? [
                  HitDefinitionBuilder.standardAdditional()
                    .damageElement(ElementTag.Lightning)
                    .atkScaling(additionalDmgScaling)
                    .build(),
                ]
                : []
            ),
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

      x.buff(StatKey.DMG_BOOST, (e >= 4 && r.e4DmgBuff) ? 0.30 : 0, x.source(SOURCE_E4))
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.VULNERABILITY, (m.preyMark) ? 0.25 : 0, x.damageType(DamageTag.FUA).targets(TargetTag.FullTeam).source(SOURCE_TRACE))
      x.buff(StatKey.CD, (e >= 2 && m.preyMark && m.e2CdBoost) ? 0.40 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E2))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      boostAshblazingAtkContainer(x, action, fuaHitCountMulti)
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuBoostAshblazingAtkContainer(fuaHitCountMulti, action)
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
    Stats.ATK_P,
    Stats.CR,
    Stats.CD,
    Stats.ATK,
  ],
  comboTurnAbilities: [
    NULL_TURN_ABILITY_NAME,
    WHOLE_SKILL,
    DEFAULT_ULT,
    DEFAULT_FUA,
    DEFAULT_FUA,
    DEFAULT_FUA,
  ],
  errRopeEidolon: 0,
  deprioritizeBuffs: true,
  relicSets: [
    [Sets.PioneerDiverOfDeadWaters, Sets.PioneerDiverOfDeadWaters],
    [Sets.TheAshblazingGrandDuke, Sets.TheAshblazingGrandDuke],
    ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  ],
  ornamentSets: [
    Sets.DuranDynastyOfRunningWolves,
    Sets.IzumoGenseiAndTakamaDivineRealm,
    ...SPREAD_ORNAMENTS_2P_FUA,
    ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
    ...SPREAD_ORNAMENTS_2P_SUPPORT,
  ],
  teammates: [
    {
      characterId: Feixiao.id,
      lightCone: IVentureForthToHunt.id,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: Tribbie.id,
      lightCone: IfTimeWereAFlower.id,
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
      Stats.ERR,
    ],
  },
  presets: [
    PresetEffects.fnPioneerSet(4),
    PresetEffects.fnAshblazingSet(6),
    PresetEffects.VALOROUS_SET,
  ],
  sortOption: SortOption.FUA,
  hiddenColumns: [SortOption.DOT],
  simulation: simulation(),
})

const display = {
  imageCenter: {
    x: 985,
    y: 1018,
    z: 1.05,
  },
  spineCenter: {
    x: 926,
    y: 1071,
    z: 1.2,
  },
  showcaseColor: '#9190f8',
}

export const Moze: CharacterConfig = {
  id: '1223',
  display,
  conditionals,
  get scoring() {
    return scoring()
  },
}
