import { Huohuo } from 'lib/conditionals/character/1200/Huohuo'
import { floorSafe } from 'lib/utils/mathUtils'
import { SparkleB1 } from 'lib/conditionals/character/1300/SparkleB1'
import {
  getYaoguangAhaPunchlineValue,
  Yaoguang,
} from 'lib/conditionals/character/1500/Yaoguang'
import {
  AbilityEidolon,
  type Conditionals,
  type ContentDefinition,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import {
  dynamicStatConversionContainer,
  gpuDynamicStatConversion,
} from 'lib/conditionals/evaluation/statConversion'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { MushyShroomysAdventures } from 'lib/conditionals/lightcone/4star/MushyShroomysAdventures'
import { ButTheBattleIsntOver } from 'lib/conditionals/lightcone/5star/ButTheBattleIsntOver'
import { NightOfFright } from 'lib/conditionals/lightcone/5star/NightOfFright'
import {
  ConditionalActivation,
  ConditionalType,
  Parts,
  Sets,
  Stats,
} from 'lib/constants/constants'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  ElementTag,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  AbilityKind,
  DEFAULT_SKILL,
  END_BASIC,
  NULL_TURN_ABILITY_NAME,
  START_SKILL,
  START_ULT,
  WHOLE_ELATION_SKILL,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { SortOption } from 'lib/optimization/sortOptions'
import { PresetEffects } from 'lib/scoring/presetEffects'
import {
  SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
} from 'lib/scoring/scoringConstants'
import { wrappedFixedT } from 'lib/utils/i18nUtils'
import {
  type CharacterConditionalFunction,
  type CharacterConfig,
} from 'types/characterConfig'
import { type HitDefinition } from 'types/hitConditionalTypes'
import {
  type ScoringMetadata,
  type SimulationMetadata,
} from 'types/metadata'
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'
import { precisionRound } from 'lib/utils/mathUtils'

export const SparxieEntities = createEnum('Sparxie')
export const SparxieAbilities: AbilityKind[] = [
  AbilityKind.BASIC,
  AbilityKind.ULT,
  AbilityKind.ELATION_SKILL,
  AbilityKind.BREAK,
]

const conditionals: CharacterConditionalFunction = (e, withContent) => {
  const { basic, skill, ult, talent, elationSkill } = AbilityEidolon.SKILL_BASIC_ELATION_SKILL_3_ULT_TALENT_ELATION_SKILL_5
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
    SOURCE_ELATION_SKILL,
  } = Source.character(Sparxie.id)

  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Sparxie.Content')

  const basicScaling = basic(e, 1.00, 1.10)
  const engagementScaling = skill(e, 0.20, 0.22)

  const ultAtkScaling = ult(e, 0.50, 0.54)

  const talentMainElationScaling = talent(e, 0.40, 0.44)
  const talentEngagementElationScaling = talent(e, 0.20, 0.22)
  const talentUltElationScaling = talent(e, 0.48, 0.528)

  const elationSkillAoeScaling = elationSkill(e, 0.50, 0.525, 0.55)
  const elationSkillBounceScaling = elationSkill(e, 0.25, 0.2625, 0.275)

  let additionalStacks = 0
  if (e >= 1) additionalStacks += 5
  if (e >= 2) additionalStacks += 4
  if (e >= 4) additionalStacks += 5

  const defaults = {
    enhancedBasic: true,
    punchlineStacks: 30 + additionalStacks,
    certifiedBangerStacks: 60 + additionalStacks,
    engagementFarmingStacks: 20,
    certifiedBanger: true,
    atkToElation: true,
    punchlineCritDmg: true,
    e1PunchlineResPen: true,
    e2ThrillStacks: 4,
    e4UltElation: true,
    e6ResPen: true,
  }

  const teammateDefaults = {
    punchlineStacks: 30 + additionalStacks,
    e1PunchlineResPen: true,
    punchlineCritDmg: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    enhancedBasic: {
      id: 'enhancedBasic',
      formItem: 'switch',
      text: t('enhancedBasic.text'),
      content: t('enhancedBasic.content'),
    },
    punchlineStacks: {
      id: 'punchlineStacks',
      formItem: 'slider',
      text: t('punchlineStacks.text'),
      content: t('punchlineStacks.content'),
      min: 0,
      max: 100,
    },
    certifiedBangerStacks: {
      id: 'certifiedBangerStacks',
      formItem: 'slider',
      text: t('certifiedBangerStacks.text'),
      content: t('certifiedBangerStacks.content', {
        ebaAdjacentScaling: precisionRound(100 * talentEngagementElationScaling),
        ebaPrimaryScaling: precisionRound(100 * talentMainElationScaling),
        ebaBounceScaling: precisionRound(100 * talentEngagementElationScaling),
        ultElationScaling: precisionRound(100 * talentUltElationScaling),
      }),
      min: 0,
      max: 200,
    },
    engagementFarmingStacks: {
      id: 'engagementFarmingStacks',
      formItem: 'slider',
      text: t('engagementFarmingStacks.text'),
      content: t('engagementFarmingStacks.content', { ebaBounceScaling: precisionRound(100 * talentEngagementElationScaling) }),
      min: 0,
      max: 20,
    },
    certifiedBanger: {
      id: 'certifiedBanger',
      formItem: 'switch',
      text: t('certifiedBanger.text'),
      content: t('certifiedBanger.content', {
        ebaAdjacentScaling: precisionRound(100 * talentEngagementElationScaling),
        ebaPrimaryScaling: precisionRound(100 * talentMainElationScaling),
        ebaBounceScaling: precisionRound(100 * talentEngagementElationScaling),
        ultElationScaling: precisionRound(100 * talentUltElationScaling),
      }),
    },
    atkToElation: {
      id: 'atkToElation',
      formItem: 'switch',
      text: t('atkToElation.text'),
      content: t('atkToElation.content'),
    },
    punchlineCritDmg: {
      id: 'punchlineCritDmg',
      formItem: 'switch',
      text: t('punchlineCritDmg.text'),
      content: t('punchlineCritDmg.content'),
    },
    e1PunchlineResPen: {
      id: 'e1PunchlineResPen',
      formItem: 'switch',
      text: t('e1PunchlineResPen.text'),
      content: t('e1PunchlineResPen.content'),
      disabled: e < 1,
    },
    e2ThrillStacks: {
      id: 'e2ThrillStacks',
      formItem: 'slider',
      text: t('e2ThrillStacks.text'),
      content: t('e2ThrillStacks.content'),
      min: 0,
      max: 4,
      disabled: e < 2,
    },
    e4UltElation: {
      id: 'e4UltElation',
      formItem: 'switch',
      text: t('e4UltElation.text'),
      content: t('e4UltElation.content'),
      disabled: e < 4,
    },
    e6ResPen: {
      id: 'e6ResPen',
      formItem: 'switch',
      text: t('e6ResPen.text'),
      content: t('e6ResPen.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    punchlineStacks: content.punchlineStacks,
    e1PunchlineResPen: content.e1PunchlineResPen,
    punchlineCritDmg: content.punchlineCritDmg,
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    teammateContent: () => Object.values(teammateContent),
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(SparxieEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [SparxieEntities.Sparxie]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => [...SparxieAbilities],
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      const punchlineStacks = getYaoguangAhaPunchlineValue(action, context) ?? r.punchlineStacks
      const certifiedBangerStacks = r.certifiedBangerStacks
      const engagementStacks = r.enhancedBasic ? r.engagementFarmingStacks : 0

      const e6ExtraBounces = (e >= 6 && r.e6ResPen) ? Math.min(20, punchlineStacks) : 0
      const totalBounces = 20 + e6ExtraBounces

      // ============== BASIC ==============

      // Basic - ATK scaling increased by Engagement Farming stacks when enhanced
      const basicHit = HitDefinitionBuilder.standardBasic()
        .damageElement(ElementTag.Fire)
        .atkScaling(basicScaling + engagementScaling * engagementStacks)
        .toughnessDmg(10)
        .skillPointsUsed(engagementStacks)
        .build()

      // Talent Elation on enhanced basic - main target hit + per-stack bounces averaged over enemies
      const talentBasicElationHit = HitDefinitionBuilder.elation()
        .damageType(DamageTag.ELATION)
        .damageElement(ElementTag.Fire)
        .elationScaling(talentMainElationScaling + talentEngagementElationScaling * engagementStacks / context.enemyCount)
        .punchlineStacks(certifiedBangerStacks)
        .toughnessDmg(5)
        .build()

      // Talent Elation hits are gated by enhanced basic / Certified Banger
      const basicHits: HitDefinition[] = [basicHit]
      if (r.enhancedBasic && r.certifiedBanger) {
        basicHits.push(talentBasicElationHit)
      }

      // ============== ULT ==============

      // Talent Elation on ult
      const talentUltElationHit = HitDefinitionBuilder.elation()
        .damageType(DamageTag.ELATION)
        .damageElement(ElementTag.Fire)
        .elationScaling(talentUltElationScaling)
        .punchlineStacks(certifiedBangerStacks)
        .toughnessDmg(0)
        .build()

      // Ult - mixed ATK + Elation-based ATK scaling: (0.6 * Elation + 50%) of ATK
      const ultHit = HitDefinitionBuilder.standardUlt()
        .damageElement(ElementTag.Fire)
        .atkScaling(ultAtkScaling)
        .elationAtkScaling(0.60)
        .toughnessDmg(20)
        .build()

      const ultHits: HitDefinition[] = [ultHit]
      if (r.certifiedBanger) {
        ultHits.push(talentUltElationHit)
      }

      // ============== ELATION SKILL ==============

      // Elation Skill - AoE + bounces averaged per enemy, with E6 extra bounces from Punchline
      const elationSkillHit = HitDefinitionBuilder.elation()
        .damageType(DamageTag.ELATION)
        .damageElement(ElementTag.Fire)
        .elationScaling(elationSkillAoeScaling + totalBounces * elationSkillBounceScaling / context.enemyCount)
        .punchlineStacks(punchlineStacks)
        .toughnessDmg(6.67 + 1.67 * totalBounces / context.enemyCount)
        .build()

      const breakHit = HitDefinitionBuilder.standardBreak(ElementTag.Fire).build()

      return {
        [AbilityKind.BASIC]: { hits: basicHits },
        [AbilityKind.ULT]: { hits: ultHits },
        [AbilityKind.ELATION_SKILL]: { hits: [elationSkillHit] },
        [AbilityKind.BREAK]: { hits: [breakHit] },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.buff(StatKey.CD, (e >= 2) ? r.e2ThrillStacks * 0.10 : 0, x.source(SOURCE_E2))

      x.buff(StatKey.ELATION, (e >= 4 && r.e4UltElation) ? 0.36 : 0, x.source(SOURCE_E4))

      x.buff(StatKey.RES_PEN, (e >= 6 && r.e6ResPen) ? 0.20 : 0, x.source(SOURCE_E6))
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>
      const punchlineStacks = r.punchlineStacks

      // Per Punchline, +8% CRIT DMG to all allies (max 80%)
      const cdBuff = r.punchlineCritDmg ? Math.min(0.80, punchlineStacks * 0.08) : 0
      x.buff(StatKey.CD, cdBuff, x.targets(TargetTag.FullTeam).source(SOURCE_TRACE))

      // E1: Per Punchline, +1.5% All-Type RES PEN to all allies (max 15%)
      const resPenBuff = (e >= 1 && r.e1PunchlineResPen) ? Math.min(0.15, punchlineStacks * 0.015) : 0
      x.buff(StatKey.RES_PEN, resPenBuff, x.targets(TargetTag.FullTeam).source(SOURCE_E1))
    },

    precomputeTeammateEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },

    finalizeCalculations: () => {},
    newGpuFinalizeCalculations: () => '',
    dynamicConditionals: [
      {
        id: 'SparxieAtkElationConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.ATK],
        chainsTo: [Stats.Elation],
        condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          return r.atkToElation
        },
        effect: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          dynamicStatConversionContainer(
            Stats.ATK,
            Stats.Elation,
            this,
            x,
            action,
            context,
            SOURCE_TRACE,
            (convertibleValue) => {
              if (convertibleValue < 2000) return 0
              return Math.min(0.80, floorSafe((convertibleValue - 2000) / 100) * 0.05)
            },
          )
        },
        gpu: function(action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return gpuDynamicStatConversion(
            Stats.ATK,
            Stats.Elation,
            this,
            action,
            context,
            `min(0.80, floorSafe((convertibleValue - 2000.0) / 100.0) * 0.05)`,
            `${wgslTrue(r.atkToElation)}`,
            `convertibleValue >= 2000.0`,
          )
        },
      },
    ],
  }
}

const simulation = (): SimulationMetadata => ({
  parts: {
    [Parts.Body]: [
      Stats.CR,
      Stats.CD,
    ],
    [Parts.Feet]: [
      Stats.SPD,
      Stats.ATK_P,
    ],
    [Parts.PlanarSphere]: [
      Stats.Fire_DMG,
      Stats.ATK_P,
    ],
    [Parts.LinkRope]: [
      Stats.ERR,
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
    END_BASIC,
    WHOLE_ELATION_SKILL,
    START_SKILL,
    END_BASIC,
    WHOLE_ELATION_SKILL,
  ],
  errRopeEidolon: 0,
  relicSets: [
    [Sets.EverGloriousMagicalGirl, Sets.EverGloriousMagicalGirl],
    ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  ],
  ornamentSets: [
    // TODO: Add Sets.PunklordeStageZero to index 0 during 4.1
    Sets.TengokuLivestream,
    Sets.PunklordeStageZero,
    Sets.RutilantArena,
    Sets.IzumoGenseiAndTakamaDivineRealm,
    ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  ],
  teammates: [
    {
      characterId: SparkleB1.id,
      lightCone: ButTheBattleIsntOver.id,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: Yaoguang.id,
      lightCone: MushyShroomysAdventures.id,
      characterEidolon: 0,
      lightConeSuperimposition: 5,
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
    [Stats.BE]: 0,
  },
  parts: {
    [Parts.Body]: [
      Stats.CR,
      Stats.CD,
    ],
    [Parts.Feet]: [
      Stats.SPD,
      Stats.ATK_P,
    ],
    [Parts.PlanarSphere]: [
      Stats.Fire_DMG,
      Stats.ATK_P,
    ],
    [Parts.LinkRope]: [
      Stats.ATK_P,
      Stats.ERR,
    ],
  },
  presets: [
    PresetEffects.TENGOKU_SET,
  ],
  sortOption: SortOption.BASIC,
  hiddenColumns: [SortOption.SKILL, SortOption.FUA, SortOption.DOT],
  simulation: simulation(),
})

const display = {
  imageCenter: {
    x: 1015,
    y: 1050,
    z: 1.10,
  },
  showcaseColor: '#ae86ed',
  gridPortraitOffset: 20,
}

export const Sparxie: CharacterConfig = {
  id: '1501',
  display,
  conditionals,
  get scoring() {
    return scoring()
  },
}
