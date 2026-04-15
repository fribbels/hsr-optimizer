import { Aventurine } from 'lib/conditionals/character/1300/Aventurine'
import { Robin } from 'lib/conditionals/character/1300/Robin'
import { Cipher } from 'lib/conditionals/character/1400/Cipher'
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
import { FlowingNightglow } from 'lib/conditionals/lightcone/5star/FlowingNightglow'
import { InherentlyUnjustDestiny } from 'lib/conditionals/lightcone/5star/InherentlyUnjustDestiny'
import { LiesAflutterInTheWind } from 'lib/conditionals/lightcone/5star/LiesAflutterInTheWind'
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
  DEFAULT_FUA,
  DEFAULT_SKILL,
  END_FUA,
  NULL_TURN_ABILITY_NAME,
  START_SKILL,
  START_ULT,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { SortOption } from 'lib/optimization/sortOptions'
import { PresetEffects } from 'lib/scoring/presetEffects'
import {
  SPREAD_ORNAMENTS_2P_FUA,
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

export const DrRatioEntities = createEnum('DrRatio')
export const DrRatioAbilities: AbilityKind[] = [
  AbilityKind.BASIC,
  AbilityKind.SKILL,
  AbilityKind.ULT,
  AbilityKind.FUA,
  AbilityKind.BREAK,
]

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.DrRatio')
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
  } = Source.character(DrRatio.id)

  const debuffStacksMax = 5
  const summationStacksMax = (e >= 1) ? 10 : 6

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.50, 1.65)
  const ultScaling = ult(e, 2.40, 2.592)
  const fuaScaling = talent(e, 2.70, 2.97)

  function e2FuaRatio(procs: number, fua = true) {
    return fua
      ? fuaScaling / (fuaScaling + 0.20 * procs) // for fua dmg
      : 0.20 / (fuaScaling + 0.20 * procs) // for each e2 proc
  }

  const baseHitMulti = ASHBLAZING_ATK_STACK * (1 * 1 / 1)
  const fuaMultiByDebuffs: Record<number, number> = {
    0: ASHBLAZING_ATK_STACK * (1 * 1 / 1), // 0
    1: ASHBLAZING_ATK_STACK * (1 * e2FuaRatio(1, true) + 2 * e2FuaRatio(1, false)), // 2
    2: ASHBLAZING_ATK_STACK * (1 * e2FuaRatio(2, true) + 5 * e2FuaRatio(2, false)), // 2 + 3
    3: ASHBLAZING_ATK_STACK * (1 * e2FuaRatio(3, true) + 9 * e2FuaRatio(3, false)), // 2 + 3 + 4
    4: ASHBLAZING_ATK_STACK * (1 * e2FuaRatio(4, true) + 14 * e2FuaRatio(4, false)), // 2 + 3 + 4 + 5
  }

  function getHitMulti(action: OptimizerAction, context: OptimizerContext) {
    const r = action.characterConditionals as Conditionals<typeof content>
    return e >= 2
      ? fuaMultiByDebuffs[Math.min(4, r.enemyDebuffStacks)]
      : baseHitMulti
  }

  const defaults = {
    enemyDebuffStacks: debuffStacksMax,
    summationStacks: summationStacksMax,
  }

  const content: ContentDefinition<typeof defaults> = {
    summationStacks: {
      id: 'summationStacks',
      formItem: 'slider',
      text: t('Content.summationStacks.text'),
      content: t('Content.summationStacks.content', { summationStacksMax }),
      min: 0,
      max: summationStacksMax,
    },
    enemyDebuffStacks: {
      id: 'enemyDebuffStacks',
      formItem: 'slider',
      text: t('Content.enemyDebuffStacks.text'),
      content: t('Content.enemyDebuffStacks.content', { FuaScaling: precisionRound(100 * fuaScaling) }),
      min: 0,
      max: debuffStacksMax,
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,

    entityDeclaration: () => Object.values(DrRatioEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [DrRatioEntities.DrRatio]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => [...DrRatioAbilities],
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      const e2AdditionalScaling = (e >= 2) ? 0.20 * Math.min(4, r.enemyDebuffStacks) : 0

      return {
        [AbilityKind.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Imaginary)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [AbilityKind.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Imaginary)
              .atkScaling(skillScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [AbilityKind.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Imaginary)
              .atkScaling(ultScaling)
              .toughnessDmg(30)
              .build(),
          ],
        },
        [AbilityKind.FUA]: {
          hits: [
            HitDefinitionBuilder.standardFua()
              .damageElement(ElementTag.Imaginary)
              .atkScaling(fuaScaling)
              .toughnessDmg(10)
              .build(),
            ...(e2AdditionalScaling > 0
              ? [
                HitDefinitionBuilder.standardAdditional()
                  .damageType(DamageTag.ADDITIONAL)
                  .damageElement(ElementTag.Imaginary)
                  .atkScaling(e2AdditionalScaling)
                  .build(),
              ]
              : []),
          ],
        },
        [AbilityKind.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Imaginary).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.buff(StatKey.CR, r.summationStacks * 0.025, x.source(SOURCE_TRACE))
      x.buff(StatKey.CD, r.summationStacks * 0.05, x.source(SOURCE_TRACE))

      // Boost
      x.buff(StatKey.DMG_BOOST, (r.enemyDebuffStacks >= 3) ? Math.min(0.50, r.enemyDebuffStacks * 0.10) : 0, x.source(SOURCE_TRACE))
      x.buff(StatKey.DMG_BOOST, (e >= 6) ? 0.50 : 0, x.damageType(DamageTag.FUA).source(SOURCE_E6))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      boostAshblazingAtkContainer(x, action, getHitMulti(action, context))
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuBoostAshblazingAtkContainer(getHitMulti(action, context), action)
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
      Stats.Imaginary_DMG,
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
    END_FUA,
    DEFAULT_FUA,
    START_SKILL,
    END_FUA,
    DEFAULT_FUA,
    START_SKILL,
    END_FUA,
  ],
  relicSets: [
    [Sets.PioneerDiverOfDeadWaters, Sets.PioneerDiverOfDeadWaters],
    ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  ],
  ornamentSets: [
    Sets.DuranDynastyOfRunningWolves,
    Sets.IzumoGenseiAndTakamaDivineRealm,
    ...SPREAD_ORNAMENTS_2P_FUA,
    ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  ],
  teammates: [
    {
      characterId: Cipher.id,
      lightCone: LiesAflutterInTheWind.id,
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
      characterId: Aventurine.id,
      lightCone: InherentlyUnjustDestiny.id,
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
      Stats.Imaginary_DMG,
    ],
    [Parts.LinkRope]: [
      Stats.ATK_P,
    ],
  },
  presets: [
    PresetEffects.fnAshblazingSet(1),
    PresetEffects.fnPioneerSet(4),
    PresetEffects.VALOROUS_SET,
    PresetEffects.WASTELANDER_SET,
  ],
  sortOption: SortOption.FUA,
  hiddenColumns: [
    SortOption.DOT,
  ],
  simulation: simulation(),
})

const display = {
  imageCenter: {
    x: 965,
    y: 838,
    z: 1.2,
  },
  spineCenter: {
    x: 909,
    y: 815,
    z: 1.25,
  },
  showcaseColor: '#8096fb',
}

export const DrRatio: CharacterConfig = {
  id: '1305',
  display,
  conditionals,
  get scoring() {
    return scoring()
  },
}
