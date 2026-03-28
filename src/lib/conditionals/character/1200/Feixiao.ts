import { Robin } from 'lib/conditionals/character/1300/Robin'
import { PermansorTerrae } from 'lib/conditionals/character/1400/PermansorTerrae'
import { Tribbie } from 'lib/conditionals/character/1400/Tribbie'
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
  DEFAULT_FUA,
  DEFAULT_SKILL,
  END_FUA,
  NULL_TURN_ABILITY_NAME,
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

import { type Eidolon } from 'types/character'
import { type CharacterConfig } from 'types/characterConfig'
import {
  type ScoringMetadata,
  type SimulationMetadata,
} from 'types/metadata'

import { type CharacterConditionalsController } from 'types/conditionals'
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'
import { precisionRound } from 'lib/utils/mathUtils'

export const FeixiaoEntities = createEnum('Feixiao')
export const FeixiaoAbilities: AbilityKind[] = [
  AbilityKind.BASIC,
  AbilityKind.SKILL,
  AbilityKind.ULT,
  AbilityKind.FUA,
  AbilityKind.BREAK,
]

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Feixiao')
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
  } = Source.character('1220')

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.00, 2.20)

  const ultScaling = ult(e, 0.60, 0.648)
  const ultBrokenScaling = ult(e, 0.30, 0.33)
  const ultFinalScaling = ult(e, 1.60, 1.728)

  const fuaScaling = talent(e, 1.10, 1.21)
  const talentDmgBuff = talent(e, 0.60, 0.66)

  const ultHitCountMulti = 1 * 0.1285 + 2 * 0.1285 + 3 * 0.1285 + 4 * 0.1285 + 5 * 0.1285 + 6 * 0.1285 + 7 * 0.2285
  const ultBrokenHitCountMulti = 1 * 0.1285 * 0.1 + 2 * 0.1285 * 0.9
    + 3 * 0.1285 * 0.1 + 4 * 0.1285 * 0.9
    + 5 * 0.1285 * 0.1 + 6 * 0.1285 * 0.9
    + 7 * 0.1285 * 0.1 + 8 * 0.1285 * 0.9
    + 8 * 0.1285 * 0.1 + 8 * 0.1285 * 0.9
    + 8 * 0.1285 * 0.1 + 8 * 0.1285 * 0.9
    + 8 * 0.2285

  function getUltHitMulti(action: OptimizerAction, context: OptimizerContext) {
    const r = action.characterConditionals as Conditionals<typeof content>

    return r.weaknessBrokenUlt
      ? ASHBLAZING_ATK_STACK * ultBrokenHitCountMulti
      : ASHBLAZING_ATK_STACK * ultHitCountMulti
  }

  const defaults = {
    weaknessBrokenUlt: true,
    talentDmgBuff: true,
    skillAtkBuff: true,
    e1OriginalDmgBoost: true,
    e4Buffs: true,
    e6Buffs: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    weaknessBrokenUlt: {
      id: 'weaknessBrokenUlt',
      formItem: 'switch',
      text: t('Content.weaknessBrokenUlt.text'),
      content: t('Content.weaknessBrokenUlt.content'),
    },
    talentDmgBuff: {
      id: 'talentDmgBuff',
      formItem: 'switch',
      text: t('Content.talentDmgBuff.text'),
      content: t('Content.talentDmgBuff.content', {
        FuaMultiplier: precisionRound(100 * fuaScaling),
        DmgBuff: precisionRound(100 * talentDmgBuff),
      }),
    },
    skillAtkBuff: {
      id: 'skillAtkBuff',
      formItem: 'switch',
      text: t('Content.skillAtkBuff.text'),
      content: t('Content.skillAtkBuff.content'),
    },
    e1OriginalDmgBoost: {
      id: 'e1OriginalDmgBoost',
      formItem: 'switch',
      text: t('Content.e1OriginalDmgBoost.text'),
      content: t('Content.e1OriginalDmgBoost.content'),
      disabled: e < 1,
    },
    e4Buffs: {
      id: 'e4Buffs',
      formItem: 'switch',
      text: t('Content.e4Buffs.text'),
      content: t('Content.e4Buffs.content'),
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

    entityDeclaration: () => Object.values(FeixiaoEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [FeixiaoEntities.Feixiao]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => [...FeixiaoAbilities],
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      return {
        [AbilityKind.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Wind)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [AbilityKind.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Wind)
              .atkScaling(skillScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [AbilityKind.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageType(DamageTag.ULT | DamageTag.FUA)
              .damageElement(ElementTag.Wind)
              .atkScaling(6 * (ultScaling + ultBrokenScaling) + ultFinalScaling)
              .toughnessDmg(30)
              .build(),
          ],
        },
        [AbilityKind.FUA]: {
          hits: [
            HitDefinitionBuilder.standardFua()
              .damageType((e >= 6 && r.e6Buffs) ? DamageTag.ULT | DamageTag.FUA : DamageTag.FUA)
              .damageElement(ElementTag.Wind)
              .atkScaling(fuaScaling + ((e >= 6 && r.e6Buffs) ? 1.40 : 0))
              .toughnessDmg(5 + ((e >= 4) ? 5 : 0))
              .build(),
          ],
        },
        [AbilityKind.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Wind).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    initializeConfigurationsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      if (r.weaknessBrokenUlt) {
        action.config.enemyWeaknessBroken = true
      }
    },

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Special case where we force the weakness break on if the ult break option is disabled
      if (!r.weaknessBrokenUlt) {
        x.buff(StatKey.BREAK_EFFICIENCY_BOOST, 1.00, x.damageType(DamageTag.ULT).source(SOURCE_ULT))
      }

      // Trace: FUA CD boost
      x.buff(StatKey.CD, 0.36, x.damageType(DamageTag.FUA).source(SOURCE_TRACE))

      // Trace: ATK buff from skill
      x.buff(StatKey.ATK_P, (r.skillAtkBuff) ? 0.48 : 0, x.source(SOURCE_TRACE))

      // Talent: DMG boost
      x.buff(StatKey.DMG_BOOST, (r.talentDmgBuff) ? talentDmgBuff : 0, x.source(SOURCE_TALENT))

      // E1: ULT Final DMG boost
      x.multiplicativeBoost(StatKey.FINAL_DMG_BOOST, (e >= 1 && r.e1OriginalDmgBoost) ? 0.3071 : 0, x.damageType(DamageTag.ULT).source(SOURCE_E1))

      // E4: SPD buff (note: original uses SOURCE_E1)
      if (e >= 4) {
        x.buff(StatKey.SPD_P, 0.08, x.source(SOURCE_E1))
      }

      // E6: ULT RES PEN
      x.buff(StatKey.RES_PEN, (e >= 6 && r.e6Buffs) ? 0.20 : 0, x.damageType(DamageTag.ULT).source(SOURCE_E6))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const fuaHitMulti = ASHBLAZING_ATK_STACK * (1 * 1.00)
      boostAshblazingAtkContainer(x, action, fuaHitMulti)
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const fuaHitMulti = ASHBLAZING_ATK_STACK * (1 * 1.00)
      return gpuBoostAshblazingAtkContainer(fuaHitMulti, action)
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
      Stats.Wind_DMG,
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
    START_ULT,
    DEFAULT_SKILL,
    END_FUA,
    DEFAULT_FUA,
    START_ULT,
    DEFAULT_SKILL,
    END_FUA,
    DEFAULT_FUA,
  ],
  relicSets: [
    [Sets.TheWindSoaringValorous, Sets.TheWindSoaringValorous],
    [Sets.TheAshblazingGrandDuke, Sets.TheAshblazingGrandDuke],
    [Sets.EagleOfTwilightLine, Sets.EagleOfTwilightLine],
    ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  ],
  ornamentSets: [
    Sets.DuranDynastyOfRunningWolves,
    ...SPREAD_ORNAMENTS_2P_FUA,
    ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  ],
  teammates: [
    {
      characterId: Robin.id,
      lightCone: FlowingNightglow.id,
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
      Stats.Wind_DMG,
    ],
    [Parts.LinkRope]: [
      Stats.ATK_P,
    ],
  },
  presets: [
    PresetEffects.fnAshblazingSet(1),
    PresetEffects.VALOROUS_SET,
  ],
  sortOption: SortOption.ULT,
  hiddenColumns: [
    SortOption.DOT,
  ],
  simulation: simulation(),
})

const display = {
  imageCenter: {
    x: 1024,
    y: 1050,
    z: 1,
  },
  spineCenter: {
    x: 1134,
    y: 1033,
    z: 1.9,
  },
  showcaseColor: '#00b9be',
}

export const Feixiao: CharacterConfig = {
  id: '1220',
  display,
  conditionals,
  get scoring() {
    return scoring()
  },
}
