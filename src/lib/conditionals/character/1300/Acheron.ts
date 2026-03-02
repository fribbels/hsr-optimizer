import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
  countTeamPath,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { Parts, PathNames, Sets, Stats } from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { SortOption } from 'lib/optimization/sortOptions'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  ElementTag,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  NULL_TURN_ABILITY_NAME,
  START_ULT,
  END_SKILL,
  WHOLE_SKILL,
} from 'lib/optimization/rotation/turnAbilityConfig'
import {
  SPREAD_RELICS_2P_ATK_CRIT_WEIGHTS,
  SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  T2_WEIGHT,
} from 'lib/scoring/scoringConstants'
import { PresetEffects } from 'lib/scoring/presetEffects'
import {
  SILVER_WOLF_B1,
  BEFORE_THE_TUTORIAL_MISSION_STARTS,
  CIPHER,
  LIES_DANCE_ON_THE_BREEZE,
  PERMANSOR_TERRAE,
  THOUGH_WORLDS_APART,
} from 'lib/simulations/tests/testMetadataConstants'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'
import { CharacterConfig } from 'types/characterConfig'
import { CharacterConditionalsController } from 'types/conditionals'
import { SimulationMetadata, ScoringMetadata } from 'types/metadata'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const AcheronEntities = createEnum('Acheron')
export const AcheronAbilities = createEnum('BASIC', 'SKILL', 'ULT', 'BREAK')

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Acheron')
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
  } = Source.character('1308')

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.60, 1.76)

  const ultRainbladeScaling = ult(e, 0.24, 0.2592)
  const ultCrimsonKnotScaling = ult(e, 0.15, 0.162)
  const ultStygianResurgeScaling = ult(e, 1.20, 1.296)
  const ultThunderCoreScaling = 0.25
  const talentResPen = talent(e, 0.2, 0.22)

  const maxCrimsonKnotStacks = 9

  const nihilityTeammateScaling: Record<number, number> = {
    0: 0,
    1: (e >= 2) ? 0.60 : 0.15,
    2: 0.60,
    3: 0.60,
    4: 0.60,
  }

  const defaults = {
    crimsonKnotStacks: maxCrimsonKnotStacks,
    nihilityTeammatesBuff: true,
    e1EnemyDebuffed: true,
    thunderCoreStacks: 3,
    stygianResurgeHitsOnTarget: 6,
    e4UltVulnerability: true,
    e6UltBuffs: true,
  }

  const teammateDefaults = {
    e4UltVulnerability: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    crimsonKnotStacks: {
      id: 'crimsonKnotStacks',
      formItem: 'slider',
      text: t('Content.crimsonKnotStacks.text'),
      content: t('Content.crimsonKnotStacks.content', {
        RainbladeScaling: TsUtils.precisionRound(100 * ultRainbladeScaling),
        CrimsonKnotScaling: TsUtils.precisionRound(100 * ultCrimsonKnotScaling),
      }),
      min: 0,
      max: maxCrimsonKnotStacks,
    },
    nihilityTeammatesBuff: {
      id: 'nihilityTeammatesBuff',
      formItem: 'switch',
      text: t('Content.nihilityTeammatesBuff.text'),
      content: t('Content.nihilityTeammatesBuff.content'),
    },
    thunderCoreStacks: {
      id: 'thunderCoreStacks',
      formItem: 'slider',
      text: t('Content.thunderCoreStacks.text'),
      content: t('Content.thunderCoreStacks.content'),
      min: 0,
      max: 3,
    },
    stygianResurgeHitsOnTarget: {
      id: 'stygianResurgeHitsOnTarget',
      formItem: 'slider',
      text: t('Content.stygianResurgeHitsOnTarget.text'),
      content: t('Content.stygianResurgeHitsOnTarget.content'),
      min: 0,
      max: 6,
    },
    e1EnemyDebuffed: {
      id: 'e1EnemyDebuffed',
      formItem: 'switch',
      text: t('Content.e1EnemyDebuffed.text'),
      content: t('Content.e1EnemyDebuffed.content'),
      disabled: e < 1,
    },
    e4UltVulnerability: {
      id: 'e4UltVulnerability',
      formItem: 'switch',
      text: t('Content.e4UltVulnerability.text'),
      content: t('Content.e4UltVulnerability.content'),
      disabled: e < 4,
    },
    e6UltBuffs: {
      id: 'e6UltBuffs',
      formItem: 'switch',
      text: t('Content.e6UltBuffs.text'),
      content: t('Content.e6UltBuffs.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    e4UltVulnerability: content.e4UltVulnerability,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(AcheronEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [AcheronEntities.Acheron]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(AcheronAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Each ult is 3 rainblades, 3 base crimson knots, and then 1 crimson knot per stack, then 1 stygian resurge, and thunder cores from trace
      const ultAtkScaling = 3 * ultRainbladeScaling
        + 3 * ultCrimsonKnotScaling
        + ultCrimsonKnotScaling * r.crimsonKnotStacks
        + ultStygianResurgeScaling
        + r.stygianResurgeHitsOnTarget * ultThunderCoreScaling

      // E6: Basic and Skill also count as ULT damage type
      const e6Active = e >= 6 && r.e6UltBuffs

      return {
        [AcheronAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageType(e6Active ? DamageTag.BASIC | DamageTag.ULT : DamageTag.BASIC)
              .damageElement(ElementTag.Lightning)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [AcheronAbilities.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageType(e6Active ? DamageTag.SKILL | DamageTag.ULT : DamageTag.SKILL)
              .damageElement(ElementTag.Lightning)
              .atkScaling(skillScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [AcheronAbilities.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Lightning)
              .atkScaling(ultAtkScaling)
              .toughnessDmg(35)
              .build(),
          ],
        },
        [AcheronAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Lightning).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.buff(StatKey.CR_BOOST, (e >= 1 && r.e1EnemyDebuffed) ? 0.18 : 0, x.source(SOURCE_E1))

      x.buff(StatKey.DMG_BOOST, r.thunderCoreStacks * 0.30, x.source(SOURCE_TRACE))
      x.buff(StatKey.RES_PEN, talentResPen, x.damageType(DamageTag.ULT).source(SOURCE_TALENT))
      x.buff(StatKey.RES_PEN, (e >= 6 && r.e6UltBuffs) ? 0.20 : 0, x.damageType(DamageTag.ULT).source(SOURCE_E6))

      const originalDmgBoost = r.nihilityTeammatesBuff
        ? nihilityTeammateScaling[countTeamPath(context, PathNames.Nihility) - 1]
        : 0
      x.multiplicativeBoost(StatKey.FINAL_DMG_BOOST, originalDmgBoost, x.damageType(DamageTag.BASIC | DamageTag.SKILL | DamageTag.ULT).source(SOURCE_TRACE))
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.VULNERABILITY, (e >= 4 && m.e4UltVulnerability) ? 0.08 : 0, x.damageType(DamageTag.ULT).targets(TargetTag.FullTeam).source(SOURCE_E4))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },

    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',
  }
}


const simulation: SimulationMetadata = {
  parts: {
    [Parts.Body]: [
      Stats.ATK_P,
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
  ],
  comboDot: 0,
  relicSets: [
    [Sets.PioneerDiverOfDeadWaters, Sets.PioneerDiverOfDeadWaters],
    ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  ],
  ornamentSets: [
    Sets.IzumoGenseiAndTakamaDivineRealm,
    ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  ],
  teammates: [
    {
      characterId: SILVER_WOLF_B1,
      lightCone: BEFORE_THE_TUTORIAL_MISSION_STARTS,
      characterEidolon: 0,
      lightConeSuperimposition: 5,
    },
    {
      characterId: CIPHER,
      lightCone: LIES_DANCE_ON_THE_BREEZE,
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
      Stats.ATK_P,
      Stats.EHR,
    ],
    [Parts.Feet]: [
      Stats.ATK_P,
      Stats.SPD,
    ],
    [Parts.PlanarSphere]: [
      Stats.Lightning_DMG,
      Stats.ATK_P,
    ],
    [Parts.LinkRope]: [
      Stats.ATK_P,
    ],
  },
  sets: {
    ...SPREAD_RELICS_2P_ATK_CRIT_WEIGHTS,
    [Sets.PioneerDiverOfDeadWaters]: 1,
    [Sets.ScholarLostInErudition]: 1,
    [Sets.BandOfSizzlingThunder]: T2_WEIGHT,

    [Sets.IzumoGenseiAndTakamaDivineRealm]: 1,
    [Sets.InertSalsotto]: 1,
    [Sets.SpaceSealingStation]: 1,
    [Sets.FirmamentFrontlineGlamoth]: 1,
  },
  presets: [
    PresetEffects.fnPioneerSet(4),
  ],
  sortOption: SortOption.ULT,
  hiddenColumns: [
    SortOption.FUA,
    SortOption.DOT,
  ],
  simulation,
}

const display = {
  imageCenter: {
    x: 1000,
    y: 900,
    z: 1,
  },
  showcaseColor: '#837bd4',
}

export const Acheron: CharacterConfig = {
  id: '1308',
  info: {},
  conditionals,
  scoring,
  display,
}
