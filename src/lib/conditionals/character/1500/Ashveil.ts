import i18next from 'i18next'
import { SparkleB1 } from 'lib/conditionals/character/1300/SparkleB1'
import { Sunday } from 'lib/conditionals/character/1300/Sunday'
import { PermansorTerrae } from 'lib/conditionals/character/1400/PermansorTerrae'
import { ASHBLAZING_ATK_STACK } from 'lib/conditionals/conditionalConstants'
import {
  boostAshblazingAtkContainer,
  gpuBoostAshblazingAtkContainer,
} from 'lib/conditionals/conditionalFinalizers'
import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
  createEnum,
  Mutual,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { AGroundedAscent } from 'lib/conditionals/lightcone/5star/AGroundedAscent'
import { ButTheBattleIsntOver } from 'lib/conditionals/lightcone/5star/ButTheBattleIsntOver'
import { ThoughWorldsApart } from 'lib/conditionals/lightcone/5star/ThoughWorldsApart'
import {
  CURRENT_DATA_VERSION,
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
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  AbilityKind,
  DEFAULT_FUA,
  END_SKILL,
  NULL_TURN_ABILITY_NAME,
  START_ULT,
  WHOLE_SKILL,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { SortOption } from 'lib/optimization/sortOptions'
import { PresetEffects } from 'lib/scoring/presetEffects'
import {
  SPREAD_ORNAMENTS_2P_FUA,
  SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
} from 'lib/scoring/scoringConstants'
import { Eidolon } from 'types/character'
import { CharacterConfig } from 'types/characterConfig'
import { CharacterConditionalsController } from 'types/conditionals'
import {
  ScoringMetadata,
  SimulationMetadata,
} from 'types/metadata'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const AshveilEntities = createEnum('Ashveil')
export const AshveilAbilities = [
  AbilityKind.BASIC,
  AbilityKind.SKILL,
  AbilityKind.ULT,
  AbilityKind.FUA,
  AbilityKind.BREAK,
]

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
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
  } = Source.character(Ashveil.id)

  const betaContent = i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION })

  const basicScaling = basic(e, 1.00, 1.10)

  const skillScaling = skill(e, 2.00, 2.20)
  const skillAdditionalScaling = skill(e, 1.00, 1.10)
  const skillDefPenValue = skill(e, 0.40, 0.44)

  const ultScaling = ult(e, 4.00, 4.40)
  const ultBonusFuaScaling = ult(e, 2.00, 2.20)

  const talentFuaScaling = talent(e, 2.00, 2.20)

  const fuaHitCountMulti = ASHBLAZING_ATK_STACK
    * (1 * 1 / 10 + 2 * 1 / 10 + 3 * 1 / 10 + 4 * 1 / 10 + 5 * 1 / 10 + 6 * 1 / 10 + 7 * 1 / 10 + 8 * 1 / 10 + 8 * 1 / 10 + 8 * 1 / 10)

  const maxGluttonyStacks = (e >= 2) ? 18 : 12

  const defaults = {
    baitActive: true,
    targetBait: true,
    enhancedFua: false,
    gluttonyStacks: maxGluttonyStacks,
    e1DmgVulnerability: true,
    e1TargetHpBelow50: true,
    e4AtkBuff: true,
    e6GluttonyGainedStacks: 30,
  }

  const teammateDefaults = {
    baitActive: true,
    e1DmgVulnerability: true,
    e1TargetHpBelow50: true,
  }

  type Content = ContentDefinition<typeof defaults>

  const content: Content = {
    baitActive: {
      id: 'baitActive',
      formItem: 'switch',
      text: 'Bait active',
      content: betaContent,
    },
    targetBait: {
      id: 'targetBait',
      formItem: 'switch',
      text: 'Target Bait',
      content: betaContent,
    },
    enhancedFua: {
      id: 'enhancedFua',
      formItem: 'switch',
      text: 'Enhanced Fua',
      content: betaContent,
    },
    gluttonyStacks: {
      id: 'gluttonyStacks',
      formItem: 'slider',
      text: 'Gluttony stacks',
      content: betaContent,
      min: 0,
      max: maxGluttonyStacks,
    },
    e1DmgVulnerability: {
      id: 'e1DmgVulnerability',
      formItem: 'switch',
      text: 'E1 DMG vulnerability',
      content: betaContent,
      disabled: e < 1,
    },
    e1TargetHpBelow50: {
      id: 'e1TargetHpBelow50',
      formItem: 'switch',
      text: 'E1 target HP ≤ 50%',
      content: betaContent,
      disabled: e < 1,
    },
    e4AtkBuff: {
      id: 'e4AtkBuff',
      formItem: 'switch',
      text: 'E4 ATK buff',
      content: betaContent,
      disabled: e < 4,
    },
    e6GluttonyGainedStacks: {
      id: 'e6GluttonyGainedStacks',
      formItem: 'slider',
      text: 'E6 Gluttony stacks',
      content: betaContent,
      min: 0,
      max: 30,
      disabled: e < 6,
    },
  }

  type TeammateContent = ContentDefinition<typeof teammateDefaults>

  const teammateContent: TeammateContent = {
    baitActive: content.baitActive,
    e1DmgVulnerability: content.e1DmgVulnerability,
    e1TargetHpBelow50: content.e1TargetHpBelow50,
  }

  type MutualContent = Mutual<Content, TeammateContent>

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    teammateContent: () => Object.values(teammateContent),
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(AshveilEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [AshveilEntities.Ashveil]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => [...AshveilAbilities],
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<Content>

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
              .atkScaling(skillScaling + (r.targetBait ? skillAdditionalScaling : 0))
              .toughnessDmg(20)
              .build(),
          ],
        },
        [AbilityKind.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Lightning)
              .atkScaling(ultScaling)
              .toughnessDmg(30)
              .build(),
          ],
        },
        [AbilityKind.FUA]: {
          hits: [
            HitDefinitionBuilder.standardFua()
              .damageElement(ElementTag.Lightning)
              .atkScaling(talentFuaScaling + (r.enhancedFua ? Math.floor(r.gluttonyStacks / 4) * ultBonusFuaScaling : 0))
              .toughnessDmg(5)
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
      const r = action.characterConditionals as Conditionals<Content>

      // FUA DMG +80%
      x.buff(StatKey.DMG_BOOST, 0.80, x.damageType(DamageTag.FUA).source(SOURCE_TRACE))

      // FUA DMG +10% per Gluttony stack
      x.buff(StatKey.DMG_BOOST, 0.10 * r.gluttonyStacks, x.damageType(DamageTag.FUA).source(SOURCE_TRACE))

      // E4: ATK +40% after using Ultimate
      x.buff(StatKey.ATK_P, (e >= 4 && r.e4AtkBuff) ? 0.40 : 0, x.source(SOURCE_E4))

      // E6: DMG +4% per Gluttony gained stack, max 30 stacks
      x.buff(StatKey.DMG_BOOST, (e >= 6) ? 0.04 * r.e6GluttonyGainedStacks : 0, x.source(SOURCE_E6))
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<MutualContent>

      // Team CRIT DMG +40%
      x.buff(StatKey.CD, 0.40, x.targets(TargetTag.FullTeam).source(SOURCE_TRACE))

      // Team FUA CRIT DMG +80% additional
      x.buff(StatKey.CD, 0.80, x.damageType(DamageTag.FUA).targets(TargetTag.FullTeam).source(SOURCE_TRACE))

      // Bait DEF reduction
      x.buff(StatKey.DEF_PEN, (m.baitActive) ? skillDefPenValue : 0, x.targets(TargetTag.FullTeam).source(SOURCE_SKILL))

      // E1: Enemy vulnerability (+24%, or +36% if HP <= 50%)
      x.buff(
        StatKey.VULNERABILITY,
        (e >= 1) ? (m.e1TargetHpBelow50 ? 0.36 : (m.e1DmgVulnerability ? 0.24 : 0)) : 0,
        x.targets(TargetTag.FullTeam).source(SOURCE_E1),
      )

      // E6: All-Type RES -20% while Bait exists
      x.buff(StatKey.RES_PEN, (e >= 6 && m.baitActive) ? 0.20 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E6))
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
    Stats.CD,
    Stats.CR,
    Stats.ATK_P,
    Stats.ATK,
  ],
  errRopeEidolon: 0,
  comboTurnAbilities: [
    NULL_TURN_ABILITY_NAME,
    START_ULT,
    DEFAULT_FUA,
    END_SKILL,
    DEFAULT_FUA,
    WHOLE_SKILL,
    DEFAULT_FUA,
    WHOLE_SKILL,
    DEFAULT_FUA,
  ],
  comboDot: 0,
  relicSets: [
    [Sets.TheAshblazingGrandDuke, Sets.TheAshblazingGrandDuke],
    [Sets.PioneerDiverOfDeadWaters, Sets.PioneerDiverOfDeadWaters],
    ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  ],
  ornamentSets: [
    Sets.CityOfConvergingStars,
    Sets.DuranDynastyOfRunningWolves,
    Sets.IzumoGenseiAndTakamaDivineRealm,
    ...SPREAD_ORNAMENTS_2P_FUA,
    ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  ],
  teammates: [
    {
      characterId: Sunday.id,
      lightCone: AGroundedAscent.id,
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
    [Parts.Body]: [Stats.CR, Stats.CD],
    [Parts.Feet]: [Stats.ATK_P, Stats.SPD],
    [Parts.PlanarSphere]: [Stats.ATK_P, Stats.Lightning_DMG],
    [Parts.LinkRope]: [Stats.ATK_P, Stats.ERR],
  },
  presets: [
    PresetEffects.fnAshblazingSet(8),
    PresetEffects.fnPioneerSet(4),
    PresetEffects.VALOROUS_SET,
  ],
  sortOption: SortOption.FUA,
  hiddenColumns: [SortOption.DOT],
  simulation: simulation(),
})

const display = {
  showcaseColor: '#d7a6aa',
}

export const Ashveil: CharacterConfig = {
  id: '1504',
  display,
  conditionals,
  get scoring() {
    return scoring()
  },
}
