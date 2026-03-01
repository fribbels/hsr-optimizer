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
import {
  DamageTag,
  ElementTag,
} from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  MATCH_2P_WEIGHT,
  SPREAD_ORNAMENTS_2P_FUA,
  SPREAD_ORNAMENTS_2P_FUA_WEIGHTS,
  SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  SPREAD_RELICS_2P_ATK_CRIT_WEIGHTS,
  SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
} from 'lib/scoring/scoringConstants'
import { PresetEffects } from 'lib/scoring/presetEffects'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'
import { CharacterConfig } from 'types/characterConfig'
import { ScoringMetadata, SimulationMetadata } from 'types/metadata'
import { NumberToNumberMap } from 'types/common'
import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'
import {
  DEFAULT_FUA,
  END_SKILL,
  NULL_TURN_ABILITY_NAME,
  START_ULT,
} from 'lib/optimization/rotation/turnAbilityConfig'
import {
  DANCE_DANCE_DANCE,
  HUOHUO,
  MEMORIES_OF_THE_PAST,
  NIGHT_OF_FRIGHT,
  SPARKLE_B1,
  TINGYUN,
} from 'lib/simulations/tests/testMetadataConstants'

export const YunliEntities = createEnum('Yunli')
export const YunliAbilities = createEnum('BASIC', 'SKILL', 'FUA', 'BREAK')

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Yunli')
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
  } = Source.character('1221')

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.20, 1.32)
  const ultSlashScaling = ult(e, 2.20, 2.376)
  const ultCullScaling = ult(e, 2.20, 2.376)
  const ultCullHitsScaling = ult(e, 0.72, 0.7776)

  const blockCdBuff = ult(e, 1.00, 1.08)

  const talentCounterScaling = talent(e, 1.20, 1.32)

  const maxCullHits = (e >= 1) ? 9 : 6

  // Slash is the same, 1 hit
  const fuaHitCountMultiByTargets: NumberToNumberMap = {
    1: ASHBLAZING_ATK_STACK * (1 * 1 / 1), // 0.06
    3: ASHBLAZING_ATK_STACK * (2 * 1 / 1), // 0.12
    5: ASHBLAZING_ATK_STACK * (3 * 1 / 1), // 0.18
  }

  const cullHitCountMultiByTargets: NumberToNumberMap = {
    1: ASHBLAZING_ATK_STACK * (1 * 0.12 + 2 * 0.12 + 3 * 0.12 + 4 * 0.12 + 5 * 0.12 + 6 * 0.12 + 7 * 0.12 + 8 * 0.16), // 0.2784
    3: ASHBLAZING_ATK_STACK * (2 * 0.12 + 5 * 0.12 + 8 * 0.12 + 8 * 0.12 + 8 * 0.12 + 8 * 0.12 + 8 * 0.12 + 8 * 0.16), // 0.4152
    5: ASHBLAZING_ATK_STACK * (3 * 0.12 + 8 * 0.12 + 8 * 0.12 + 8 * 0.12 + 8 * 0.12 + 8 * 0.12 + 8 * 0.12 + 8 * 0.16), // 0.444
  }

  function getHitMulti(action: OptimizerAction, context: OptimizerContext) {
    const r = action.characterConditionals as Conditionals<typeof content>
    return (r.blockActive && r.ultCull)
      ? cullHitCountMultiByTargets[context.enemyCount]
      : fuaHitCountMultiByTargets[context.enemyCount]
  }

  const defaults = {
    blockActive: true,
    ultCull: true,
    ultCullHits: maxCullHits,
    counterAtkBuff: true,
    e1UltBuff: true,
    e2DefShred: true,
    e4ResBuff: true,
    e6Buffs: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    blockActive: {
      id: 'blockActive',
      formItem: 'switch',
      text: t('Content.blockActive.text'),
      content: t('Content.blockActive.content'),
    },
    ultCull: {
      id: 'ultCull',
      formItem: 'switch',
      text: t('Content.ultCull.text'),
      content: t('Content.ultCull.content', {
        CullScaling: TsUtils.precisionRound(100 * ultCullScaling),
        CullAdjacentScaling: TsUtils.precisionRound(100 * 0.5 * ultCullScaling),
        CullAdditionalScaling: TsUtils.precisionRound(100 * ultCullHitsScaling),
      }),
    },
    ultCullHits: {
      id: 'ultCullHits',
      formItem: 'slider',
      text: t('Content.ultCullHits.text'),
      content: t('Content.ultCullHits.content', {
        CullScaling: TsUtils.precisionRound(100 * ultCullScaling),
        CullAdjacentScaling: TsUtils.precisionRound(100 * 0.5 * ultCullScaling),
        CullAdditionalScaling: TsUtils.precisionRound(100 * ultCullHitsScaling),
      }),
      min: 0,
      max: maxCullHits,
    },
    counterAtkBuff: {
      id: 'counterAtkBuff',
      formItem: 'switch',
      text: t('Content.counterAtkBuff.text'),
      content: t('Content.counterAtkBuff.content'),
    },
    e1UltBuff: {
      id: 'e1UltBuff',
      formItem: 'switch',
      text: t('Content.e1UltBuff.text'),
      content: t('Content.e1UltBuff.content'),
      disabled: e < 1,
    },
    e2DefShred: {
      id: 'e2DefShred',
      formItem: 'switch',
      text: t('Content.e2DefShred.text'),
      content: t('Content.e2DefShred.content'),
      disabled: e < 2,
    },
    e4ResBuff: {
      id: 'e4ResBuff',
      formItem: 'switch',
      text: t('Content.e4ResBuff.text'),
      content: t('Content.e4ResBuff.content'),
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

    entityDeclaration: () => Object.values(YunliEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [YunliEntities.Yunli]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(YunliAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Calculate FUA scaling based on conditionals
      let fuaScaling: number
      let fuaToughness: number
      let fuaDamageType: number

      if (r.blockActive) {
        if (r.ultCull) {
          // Cull: multi-hit, counts as ULT + FUA
          fuaScaling = ultCullScaling + r.ultCullHits * ultCullHitsScaling
          fuaToughness = 20 + r.ultCullHits * 5
          fuaDamageType = DamageTag.ULT | DamageTag.FUA
        } else {
          // Slash: single hit
          fuaScaling = ultSlashScaling
          fuaToughness = 20
          fuaDamageType = DamageTag.FUA
        }
      } else {
        // Talent counter (no parry)
        fuaScaling = talentCounterScaling
        fuaToughness = 10
        fuaDamageType = DamageTag.FUA
      }

      return {
        [YunliAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Physical)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [YunliAbilities.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Physical)
              .atkScaling(skillScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [YunliAbilities.FUA]: {
          hits: [
            HitDefinitionBuilder.standardFua()
              .damageType(fuaDamageType)
              .damageElement(ElementTag.Physical)
              .atkScaling(fuaScaling)
              .toughnessDmg(fuaToughness)
              .build(),
          ],
        },
        [YunliAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Physical).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Parry CD buff
      x.buff(StatKey.CD, (r.blockActive) ? blockCdBuff : 0, x.damageType(DamageTag.FUA).source(SOURCE_ULT))

      // Trace: Counter ATK buff
      x.buff(StatKey.ATK_P, (r.counterAtkBuff) ? 0.30 : 0, x.source(SOURCE_TRACE))

      // Trace: Damage reduction during parry
      x.multiplicativeComplement(StatKey.DMG_RED, (r.blockActive) ? 0.20 : 0, x.source(SOURCE_TRACE))

      // E1: FUA DMG boost when parry active
      x.buff(StatKey.DMG_BOOST, (e >= 1 && r.e1UltBuff && r.blockActive) ? 0.20 : 0, x.damageType(DamageTag.FUA).source(SOURCE_E1))

      // E2: FUA DEF PEN
      x.buff(StatKey.DEF_PEN, (e >= 2 && r.e2DefShred) ? 0.20 : 0, x.damageType(DamageTag.FUA).source(SOURCE_E2))

      // E4: RES buff
      x.buff(StatKey.RES, (e >= 4 && r.e4ResBuff) ? 0.50 : 0, x.source(SOURCE_E4))

      // E6: FUA CR and RES PEN when parry active
      x.buff(StatKey.CR, (e >= 6 && r.e6Buffs && r.blockActive) ? 0.15 : 0, x.damageType(DamageTag.FUA).source(SOURCE_E6))
      x.buff(StatKey.RES_PEN, (e >= 6 && r.e6Buffs && r.blockActive) ? 0.20 : 0, x.damageType(DamageTag.FUA).source(SOURCE_E6))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      boostAshblazingAtkContainer(x, action, getHitMulti(action, context))
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuBoostAshblazingAtkContainer(getHitMulti(action, context), action)
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
  errRopeEidolon: 0,
  comboTurnAbilities: [
    NULL_TURN_ABILITY_NAME,
    START_ULT,
    END_SKILL,
    DEFAULT_FUA,
    DEFAULT_FUA,
  ],
  comboDot: 0,
  relicSets: [
    [Sets.TheWindSoaringValorous, Sets.TheWindSoaringValorous],
    ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  ],
  ornamentSets: [
    Sets.DuranDynastyOfRunningWolves,
    ...SPREAD_ORNAMENTS_2P_FUA,
    ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  ],
  teammates: [
    {
      characterId: SPARKLE_B1,
      lightCone: DANCE_DANCE_DANCE,
      characterEidolon: 0,
      lightConeSuperimposition: 5,
    },
    {
      characterId: TINGYUN,
      lightCone: MEMORIES_OF_THE_PAST,
      characterEidolon: 6,
      lightConeSuperimposition: 5,
    },
    {
      characterId: HUOHUO,
      lightCone: NIGHT_OF_FRIGHT,
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
      Stats.ERR,
    ],
  },
  sets: {
    ...SPREAD_RELICS_2P_ATK_CRIT_WEIGHTS,
    [Sets.ChampionOfStreetwiseBoxing]: MATCH_2P_WEIGHT,
    [Sets.TheWindSoaringValorous]: 1,
    [Sets.PoetOfMourningCollapse]: 1,
    [Sets.TheAshblazingGrandDuke]: 1,

    ...SPREAD_ORNAMENTS_2P_FUA_WEIGHTS,
  },
  presets: [
    PresetEffects.VALOROUS_SET,
    PresetEffects.fnPioneerSet(4),
    PresetEffects.fnAshblazingSet(8),
  ],
  sortOption: SortOption.FUA,
  hiddenColumns: [SortOption.ULT, SortOption.DOT],
  simulation,
}

const display = {
  imageCenter: {
    x: 1024,
    y: 1075,
    z: 1.1,
  },
  showcaseColor: '#a2e9f5',
}

export const Yunli: CharacterConfig = {
  id: '1221',
  info: {},
  conditionals,
  scoring,
  display,
}
