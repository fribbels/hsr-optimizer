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
  SPREAD_ORNAMENTS_2P_FUA,
  SPREAD_ORNAMENTS_2P_FUA_WEIGHTS,
  SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  SPREAD_RELICS_2P_ATK_CRIT_WEIGHTS,
  SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  T2_WEIGHT,
} from 'lib/scoring/scoringConstants'
import { PresetEffects } from 'lib/scoring/presetEffects'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'
import { CharacterConfig } from 'types/characterConfig'
import { ScoringMetadata, SimulationMetadata } from 'types/metadata'

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
  WHOLE_SKILL,
} from 'lib/optimization/rotation/turnAbilityConfig'
import {
  PERMANSOR_TERRAE,
  ROBIN,
  SUNDAY,
  A_GROUNDED_ASCENT,
  FLOWING_NIGHTGLOW,
  THOUGH_WORLDS_APART,
} from 'lib/simulations/tests/testMetadataConstants'

export const JingYuanEntities = createEnum('JingYuan', 'LightningLord')
export const JingYuanAbilities = createEnum('BASIC', 'SKILL', 'ULT', 'FUA', 'BREAK')

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.JingYuan')
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
  } = Source.character('1204')

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.00, 1.10)
  const ultScaling = ult(e, 2.00, 2.16)
  const fuaScaling = talent(e, 0.66, 0.726)

  function getHitMulti(action: OptimizerAction, context: OptimizerContext) {
    const r = action.characterConditionals as Conditionals<typeof content>

    let hitMulti = 0
    const stacks = r.talentHitsPerAction
    const hits = r.talentAttacks
    const stacksPerMiss = (context.enemyCount >= 3) ? 2 : 0
    const stacksPerHit = (context.enemyCount >= 3) ? 3 : 1
    const stacksPreHit = (context.enemyCount >= 3) ? 2 : 1

    // Calc stacks on miss
    let ashblazingStacks = stacksPerMiss * (stacks - hits)

    // Calc stacks on hit
    ashblazingStacks += stacksPreHit
    let atkBoostSum = 0
    for (let i = 0; i < hits; i++) {
      atkBoostSum += Math.min(8, ashblazingStacks) * (1 / hits)
      ashblazingStacks += stacksPerHit
    }

    hitMulti = atkBoostSum * ASHBLAZING_ATK_STACK

    return hitMulti
  }

  const defaults = {
    skillCritBuff: true,
    talentHitsPerAction: 10,
    talentAttacks: 10,
    e2DmgBuff: true,
    e6FuaVulnerabilityStacks: 3,
  }

  const content: ContentDefinition<typeof defaults> = {
    skillCritBuff: {
      id: 'skillCritBuff',
      formItem: 'switch',
      text: t('Content.skillCritBuff.text'),
      content: t('Content.skillCritBuff.content'),
    },
    talentHitsPerAction: {
      id: 'talentHitsPerAction',
      formItem: 'slider',
      text: t('Content.talentHitsPerAction.text'),
      content: t('Content.talentHitsPerAction.content'),
      min: 3,
      max: 10,
    },
    talentAttacks: {
      id: 'talentAttacks',
      formItem: 'slider',
      text: t('Content.talentAttacks.text'),
      content: t('Content.talentAttacks.content'),
      min: 0,
      max: 10,
    },
    e2DmgBuff: {
      id: 'e2DmgBuff',
      formItem: 'switch',
      text: t('Content.e2DmgBuff.text'),
      content: t('Content.e2DmgBuff.content'),
      disabled: e < 2,
    },
    e6FuaVulnerabilityStacks: {
      id: 'e6FuaVulnerabilityStacks',
      formItem: 'slider',
      text: t('Content.e6FuaVulnerabilityStacks.text'),
      content: t('Content.e6FuaVulnerabilityStacks.content'),
      min: 0,
      max: 3,
      disabled: e < 6,
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,

    entityDeclaration: () => Object.values(JingYuanEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [JingYuanEntities.JingYuan]: {
        primary: true,
        summon: false,
        memosprite: false,
        pet: false,
      },
      [JingYuanEntities.LightningLord]: {
        primary: false,
        summon: true,
        memosprite: false,
        pet: true,
      },
    }),

    actionDeclaration: () => Object.values(JingYuanAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      const talentHitsPerAction = Math.max(r.talentHitsPerAction, r.talentAttacks)
      const talentAttacks = r.talentAttacks

      return {
        [JingYuanAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Lightning)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [JingYuanAbilities.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Lightning)
              .atkScaling(skillScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [JingYuanAbilities.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Lightning)
              .atkScaling(ultScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [JingYuanAbilities.FUA]: {
          hits: [
            HitDefinitionBuilder.standardFua()
              .sourceEntity(JingYuanEntities.LightningLord)
              .damageElement(ElementTag.Lightning)
              .atkScaling(fuaScaling * talentAttacks)
              .toughnessDmg(5 * talentAttacks)
              .build(),
          ],
        },
        [JingYuanAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Lightning).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    initializeConfigurationsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      const talentHitsPerAction = Math.max(r.talentHitsPerAction, r.talentAttacks)

      // Skill crit buff
      x.buff(StatKey.CR, (r.skillCritBuff) ? 0.10 : 0, x.source(SOURCE_TRACE))

      // FUA CD boost when >= 6 hits (applies to Lightning Lord)
      x.buff(StatKey.CD, (talentHitsPerAction >= 6) ? 0.25 : 0, x.damageType(DamageTag.FUA).source(SOURCE_TRACE))

      // E2 DMG boost for Basic/Skill/Ult
      x.buff(StatKey.DMG_BOOST, (e >= 2 && r.e2DmgBuff) ? 0.20 : 0, x.damageType(DamageTag.BASIC | DamageTag.SKILL | DamageTag.ULT).source(SOURCE_E2))

      // E6 FUA vulnerability
      x.buff(StatKey.VULNERABILITY, (e >= 6) ? r.e6FuaVulnerabilityStacks * 0.12 : 0, x.damageType(DamageTag.FUA).source(SOURCE_E6))
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
    DEFAULT_FUA,
    WHOLE_SKILL,
    START_ULT,
    END_SKILL,
    DEFAULT_FUA,
    WHOLE_SKILL,
    WHOLE_SKILL,
    DEFAULT_FUA,
  ],
  comboDot: 0,
  relicSets: [
    [Sets.TheAshblazingGrandDuke, Sets.TheAshblazingGrandDuke],
    ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  ],
  ornamentSets: [
    Sets.TheWondrousBananAmusementPark,
    Sets.InertSalsotto,
    ...SPREAD_ORNAMENTS_2P_FUA,
    ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  ],
  teammates: [
    {
      characterId: SUNDAY,
      lightCone: A_GROUNDED_ASCENT,
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
    [Sets.TheAshblazingGrandDuke]: 1,
    [Sets.PioneerDiverOfDeadWaters]: 1,
    [Sets.BandOfSizzlingThunder]: T2_WEIGHT,

    [Sets.TheWondrousBananAmusementPark]: 1,
    [Sets.InertSalsotto]: 1,
  },
  presets: [
    PresetEffects.fnAshblazingSet(8),
    PresetEffects.VALOROUS_SET,
    PresetEffects.BANANA_SET,
  ],
  sortOption: SortOption.FUA,
  hiddenColumns: [SortOption.DOT],
  simulation,
}

const display = {
  imageCenter: {
    x: 1024,
    y: 1024,
    z: 1.1,
  },
  showcaseColor: '#94e6f1',
}

export const JingYuan: CharacterConfig = {
  id: '1204',
  info: {},
  conditionals,
  scoring,
  display,
}
