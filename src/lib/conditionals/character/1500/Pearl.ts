import i18next from 'i18next'
import { SparkleB1 } from 'lib/conditionals/character/1300/SparkleB1'
import { SilverWolfLv999 } from 'lib/conditionals/character/1500/SilverWolfLv999'
import { Sparxie } from 'lib/conditionals/character/1500/Sparxie'
import {
  getYaoguangAhaPunchlineValue,
  Yaoguang,
} from 'lib/conditionals/character/1500/Yaoguang'
import {
  AbilityEidolon,
  type Conditionals,
  type ContentDefinition,
  countTeamPath,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import {
  dynamicStatConversionContainer,
  gpuDynamicStatConversion,
} from 'lib/conditionals/evaluation/statConversion'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { ButTheBattleIsntOver } from 'lib/conditionals/lightcone/5star/ButTheBattleIsntOver'
import { ColorsForTomorrow } from 'lib/conditionals/lightcone/5star/ColorsForTomorrow'
import { DazzledByAFloweryWorld } from 'lib/conditionals/lightcone/5star/DazzledByAFloweryWorld'
import { WhenSheDecidedToSee } from 'lib/conditionals/lightcone/5star/WhenSheDecidedToSee'
import {
  ConditionalActivation,
  ConditionalType,
  CURRENT_DATA_VERSION,
  Parts,
  PathNames,
  Sets,
  Stats,
} from 'lib/constants/constants'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { type ModifierContext } from 'lib/optimization/context/calculateActions'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  ElementTag,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  AbilityKind,
  DEFAULT_BASIC_HEAL,
  DEFAULT_SKILL_HEAL,
  DEFAULT_ULT,
  END_SKILL_HEAL,
  NULL_TURN_ABILITY_NAME,
  START_ULT,
  WHOLE_BASIC_HEAL,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { SortOption } from 'lib/optimization/sortOptions'
import {
  SPREAD_ORNAMENTS_2P_HEAL,
  SPREAD_RELICS_4P_HEAL,
} from 'lib/scoring/scoringConstants'
import { ScoringType } from 'lib/scoring/scoringTypes'
import { relics2pByStats } from 'lib/sets/setConfigRegistry'
import { floorSafe } from 'lib/utils/mathUtils'
import { type Eidolon } from 'types/character'
import { type CharacterConfig } from 'types/characterConfig'
import { type CharacterConditionalsController } from 'types/conditionals'
import {
  type ElationHit,
  type HitDefinition,
} from 'types/hitConditionalTypes'
import {
  type ScoringMetadata,
  type SimulationMetadata,
} from 'types/metadata'
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'

export const PearlEntities = createEnum('Pearl')
export const PearlAbilities: AbilityKind[] = [
  AbilityKind.BASIC,
  AbilityKind.ELATION_SKILL,
  AbilityKind.BREAK,
  AbilityKind.BASIC_HEAL,
  AbilityKind.SKILL_HEAL,
]

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const betaContent = i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION })

  const { basic, skill, ult, talent, elationSkill } = AbilityEidolon.ULT_BASIC_ELATION_SKILL_3_SKILL_TALENT_ELATION_SKILL_5
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
  } = Source.character(Pearl.id)

  const basicScaling = basic(e, 0.90, 0.99)
  const enhancedBasicScaling = basic(e, 1.00, 1.10)
  const enhancedBasicHealScaling = basic(e, 0.08, 0.088)
  const enhancedBasicHealFlat = basic(e, 160, 176)
  const enhancedBasicElationScaling = basic(e, 0.15, 0.1625)

  const skillHealScaling = skill(e, 0.12, 0.132)
  const skillHealFlat = skill(e, 240, 264)

  const ultDeepLearningElationScaling = ult(e, 0.60, 0.66)

  const talentDmgReduction = talent(e, 0.30, 0.33)

  // Not simulated: Technique setup; Energy, action advance, extra turns, and Charge lifecycles.
  // Repellency depletion, cleanse, and E1 fatal-hit recovery require incoming-damage combat state.
  // E6 extra damage requires the Archetype's combat stats, unavailable in Pearl's own calculation.

  // Elation Skill: allies' next attack deals extra Elation DMG, tier = Elation characters in team (Pearl included)
  const elationSkillProcByElationCount: Record<number, number> = {
    1: elationSkill(e, 0.10, 0.105, 0.11),
    2: elationSkill(e, 0.15, 0.1575, 0.165),
    3: elationSkill(e, 0.20, 0.21, 0.22),
    4: elationSkill(e, 0.40, 0.42, 0.44),
  }

  const e1ElationBuffByElationCount: Record<number, number> = {
    2: 0.10,
    3: 0.20,
    4: 0.60,
  }

  const defaults = {
    deepLearning: true,
    certifiedBanger: true,
    certifiedBangerStacks: 35,
    punchlineStacks: 30,
    lowestHpTargetHeal: false,
    traceDefToElation: true,
    traceElationToHealing: true,
    traceEffectRes: true,
    talentLowHpDmgReduction: false,
    e1ElationShare: true,
    e2Merrymake: true,
    e4ElationSkillBoost: true,
    e6Buffs: true,
  }

  const teammateDefaults = {
    deepLearning: true,
    aestheticArchetype: true,
    elationSkillProc: true,
    certifiedBangerStacks: 35,
    punchlineStacks: 30,
    traceEffectRes: true,
    talentLowHpDmgReduction: false,
    e1ElationShare: true,
    e2Merrymake: true,
    e4ElationSkillBoost: true,
    e6Buffs: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    deepLearning: {
      id: 'deepLearning',
      formItem: 'switch',
      text: 'Enhanced Basic',
      content: betaContent,
    },
    certifiedBanger: {
      id: 'certifiedBanger',
      formItem: 'switch',
      text: 'Basic ATK Elation DMG',
      content: betaContent,
    },
    certifiedBangerStacks: {
      id: 'certifiedBangerStacks',
      formItem: 'slider',
      text: 'Certified Banger points',
      content: betaContent,
      min: 0,
      max: 50,
    },
    punchlineStacks: {
      id: 'punchlineStacks',
      formItem: 'slider',
      text: 'Punchline stacks',
      content: betaContent,
      min: 0,
      max: 120,
    },
    lowestHpTargetHeal: {
      id: 'lowestHpTargetHeal',
      formItem: 'switch',
      text: 'Lowest HP extra heal',
      content: betaContent,
    },
    traceDefToElation: {
      id: 'traceDefToElation',
      formItem: 'switch',
      text: 'DEF to Elation conversion',
      content: betaContent,
    },
    traceElationToHealing: {
      id: 'traceElationToHealing',
      formItem: 'switch',
      text: 'Elation to OHB conversion',
      content: betaContent,
    },
    traceEffectRes: {
      id: 'traceEffectRes',
      formItem: 'switch',
      text: 'Certified Banger Effect RES',
      content: betaContent,
    },
    talentLowHpDmgReduction: {
      id: 'talentLowHpDmgReduction',
      formItem: 'switch',
      text: 'HP ≤ 50% DMG reduction',
      content: betaContent,
    },
    e1ElationShare: {
      id: 'e1ElationShare',
      formItem: 'switch',
      text: 'E1 Elation buff',
      content: betaContent,
      disabled: e < 1,
    },
    e2Merrymake: {
      id: 'e2Merrymake',
      formItem: 'switch',
      text: 'E2 Merrymake',
      content: betaContent,
      disabled: e < 2,
    },
    e4ElationSkillBoost: {
      id: 'e4ElationSkillBoost',
      formItem: 'switch',
      text: 'E4 Elation Skill Additional DMG',
      content: betaContent,
      disabled: e < 4,
    },
    e6Buffs: {
      id: 'e6Buffs',
      formItem: 'switch',
      text: 'E6 RES PEN',
      content: betaContent,
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    deepLearning: content.deepLearning,
    aestheticArchetype: {
      id: 'aestheticArchetype',
      formItem: 'switch',
      text: 'Aesthetic Archetype Elation DMG',
      content: betaContent,
    },
    elationSkillProc: {
      id: 'elationSkillProc',
      formItem: 'switch',
      text: 'Elation Skill Elation DMG',
      content: betaContent,
    },
    certifiedBangerStacks: content.certifiedBangerStacks,
    punchlineStacks: content.punchlineStacks,
    traceEffectRes: content.traceEffectRes,
    talentLowHpDmgReduction: content.talentLowHpDmgReduction,
    e1ElationShare: content.e1ElationShare,
    e2Merrymake: content.e2Merrymake,
    e4ElationSkillBoost: content.e4ElationSkillBoost,
    e6Buffs: content.e6Buffs,
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    teammateContent: () => Object.values(teammateContent),
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(PearlEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [PearlEntities.Pearl]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => [...PearlAbilities],
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      const punchlineStacks = getYaoguangAhaPunchlineValue(action, context) ?? r.punchlineStacks
      const elationCount = countTeamPath(context, PathNames.Elation)
      // Aesthetic Archetype is on the Path of Elation when another Elation ally exists
      const elationArchetype = elationCount >= 2

      // ============== BASIC ==============

      const basicHits: HitDefinition[] = [
        HitDefinitionBuilder.standardBasic()
          .damageElement(ElementTag.Ice)
          .defScaling(r.deepLearning ? enhancedBasicScaling : basicScaling)
          .toughnessDmg(r.deepLearning ? 30 : 10)
          .build(),
      ]

      if (r.deepLearning && r.certifiedBanger && elationArchetype) {
        basicHits.push(
          HitDefinitionBuilder.elation()
            .damageType(DamageTag.ELATION)
            .damageElement(ElementTag.Ice)
            .elationScaling(enhancedBasicElationScaling)
            .punchlineStacks(r.certifiedBangerStacks)
            .toughnessDmg(0)
            .build(),
        )
      }

      // ============== HEALS ==============

      // Lowest HP ally receives the heal twice
      const healMultiplier = r.lowestHpTargetHeal ? 2 : 1

      const basicHealHits: HitDefinition[] = [
        HitDefinitionBuilder.heal()
          .damageType(DamageTag.BASIC)
          .defScaling(r.deepLearning ? enhancedBasicHealScaling * healMultiplier : 0)
          .flatHeal(r.deepLearning ? enhancedBasicHealFlat * healMultiplier : 0)
          .build(),
      ]

      const skillHealHits: HitDefinition[] = [
        HitDefinitionBuilder.skillHeal()
          .defScaling(skillHealScaling * healMultiplier)
          .flatHeal(skillHealFlat * healMultiplier)
          .build(),
      ]

      // ============== ELATION SKILL ==============

      // Pearl's own next-attack proc; ally procs are injected via actionModifiers
      const e4ElationSkillBoost = (e >= 4 && r.e4ElationSkillBoost) ? 1.00 : 0
      const elationSkillHit = HitDefinitionBuilder.elation()
        .damageType(DamageTag.ELATION)
        .damageElement(ElementTag.Ice)
        .elationScaling((elationSkillProcByElationCount[Math.min(4, elationCount)] ?? 0) + e4ElationSkillBoost)
        .punchlineStacks(punchlineStacks)
        .toughnessDmg(0)
        .build()

      return {
        [AbilityKind.BASIC]: { hits: basicHits },
        [AbilityKind.ELATION_SKILL]: { hits: [elationSkillHit] },
        [AbilityKind.BREAK]: { hits: [HitDefinitionBuilder.standardBreak(ElementTag.Ice).build()] },
        [AbilityKind.BASIC_HEAL]: { hits: basicHealHits },
        [AbilityKind.SKILL_HEAL]: { hits: skillHealHits },
      }
    },
    actionModifiers: () => [
      {
        // Elation Skill: ally's attack additionally deals Elation DMG of the attacker's element
        modify: (action: OptimizerAction, context: OptimizerContext, self: ModifierContext) => {
          if (!self.isTeammate || !self.ownConditionals.elationSkillProc) return

          const attackElement = action.hits?.find((hit) => hit.directHit && hit.damageElement !== ElementTag.None)?.damageElement
          if (attackElement == null) return

          const elationCount = Math.min(4, countTeamPath(context, PathNames.Elation))
          const punchlineStacks = getYaoguangAhaPunchlineValue(action, context) ?? self.ownConditionals.punchlineStacks as number
          const e4ElationSkillBoost = (e >= 4 && self.ownConditionals.e4ElationSkillBoost) ? 1.00 : 0

          action.hits!.push(
            HitDefinitionBuilder.elation()
              .damageType(DamageTag.ELATION)
              .damageElement(attackElement)
              .elationScaling((elationSkillProcByElationCount[elationCount] ?? 0) + e4ElationSkillBoost)
              .punchlineStacks(punchlineStacks)
              .toughnessDmg(0)
              .build() as ElationHit,
          )
        },
      },
      {
        // Ult Deep Learning: the Aesthetic Archetype additionally deals Ice Elation DMG with its own stats
        modify: (action: OptimizerAction, context: OptimizerContext, self: ModifierContext) => {
          if (!self.isTeammate || !self.ownConditionals.deepLearning || !self.ownConditionals.aestheticArchetype) return

          const hasDirectHit = action.hits?.some((hit) => hit.directHit)
          if (!hasDirectHit) return

          action.hits!.push(
            HitDefinitionBuilder.elation()
              .damageType(DamageTag.ELATION)
              .damageElement(ElementTag.Ice)
              .elationScaling(ultDeepLearningElationScaling)
              .punchlineStacks(self.ownConditionals.punchlineStacks as number)
              .toughnessDmg(0)
              .build() as ElationHit,
          )
        },
      },
    ],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.RES, (m.traceEffectRes && m.certifiedBangerStacks > 0) ? 0.50 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_TRACE))

      x.multiplicativeComplement(
        StatKey.DMG_RED,
        (m.talentLowHpDmgReduction) ? talentDmgReduction : 0,
        x.targets(TargetTag.FullTeam).source(SOURCE_TALENT),
      )

      const e1ElationBuff = e1ElationBuffByElationCount[Math.min(4, countTeamPath(context, PathNames.Elation))] ?? 0
      x.buff(StatKey.ELATION, (e >= 1 && m.e1ElationShare) ? e1ElationBuff : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E1))

      x.buff(StatKey.MERRYMAKING, (e >= 2 && m.e2Merrymake) ? 0.15 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E2))

      x.buff(StatKey.RES_PEN, (e >= 6 && m.deepLearning && m.e6Buffs) ? 0.20 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E6))
    },

    precomputeTeammateEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {},
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',

    dynamicConditionals: [
      {
        // Trace: DEF >= 2400 -> +32% Elation, +3% per 100 excess DEF, up to 3600 excess DEF
        id: 'PearlDefElationConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.DEF],
        chainsTo: [Stats.Elation],
        condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          return r.traceDefToElation
        },
        effect: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          dynamicStatConversionContainer(
            Stats.DEF,
            Stats.Elation,
            this,
            x,
            action,
            context,
            SOURCE_TRACE,
            (convertibleValue) => {
              if (convertibleValue < 2400) return 0
              return 0.32 + floorSafe(Math.min(3600, convertibleValue - 2400) / 100) * 0.03
            },
            TargetTag.SelfAndPet,
            true,
          )
        },
        gpu: function(action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return gpuDynamicStatConversion(
            Stats.DEF,
            Stats.Elation,
            this,
            action,
            context,
            `0.32 + floorSafe(min(3600.0, convertibleValue - 2400.0) / 100.0) * 0.03`,
            `${wgslTrue(r.traceDefToElation)}`,
            `convertibleValue >= 2400.0`,
            TargetTag.SelfAndPet,
            true,
          )
        },
      },
      {
        // Trace: Elation grants 20% Outgoing Healing
        id: 'PearlElationHealingConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.Elation],
        chainsTo: [Stats.OHB],
        condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          return r.traceElationToHealing
        },
        effect: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          dynamicStatConversionContainer(
            Stats.Elation,
            Stats.OHB,
            this,
            x,
            action,
            context,
            SOURCE_TRACE,
            (convertibleValue) => 0.20 * convertibleValue,
          )
        },
        gpu: function(action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return gpuDynamicStatConversion(
            Stats.Elation,
            Stats.OHB,
            this,
            action,
            context,
            `0.20 * convertibleValue`,
            `${wgslTrue(r.traceElationToHealing)}`,
          )
        },
      },
    ],
  }
}

const healSimulation = (): SimulationMetadata => ({
  leaderboardEnabled: false,
  parts: {
    [Parts.Body]: [Stats.DEF_P, Stats.OHB],
    [Parts.Feet]: [Stats.SPD, Stats.DEF_P],
    [Parts.PlanarSphere]: [Stats.DEF_P],
    [Parts.LinkRope]: [Stats.DEF_P],
  },
  substats: [
    Stats.DEF_P,
    Stats.DEF,
    Stats.SPD,
    Stats.HP_P,
    Stats.RES,
  ],
  errRopeEidolon: 0,
  comboTurnAbilities: [
    NULL_TURN_ABILITY_NAME,
    START_ULT,
    END_SKILL_HEAL,
    WHOLE_BASIC_HEAL,
    WHOLE_BASIC_HEAL,
    WHOLE_BASIC_HEAL,
  ],
  relicSets: [
    [Sets.PasserbyOfWanderingCloud, Sets.PasserbyOfWanderingCloud],
    [Sets.DreamlitActor, Sets.DreamlitActor],
    [Sets.DivinerOfDistantReach, Sets.DivinerOfDistantReach],
    relics2pByStats(Stats.OHB, Stats.DEF_P),
    ...SPREAD_RELICS_4P_HEAL,
  ],
  ornamentSets: [
    Sets.LushakaTheSunkenSeas,
    ...SPREAD_ORNAMENTS_2P_HEAL,
  ],
  teammates: [
    {
      characterId: SilverWolfLv999.id,
      lightCone: SilverWolfLv999.defaultLightCone,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: Sparxie.id,
      lightCone: DazzledByAFloweryWorld.id,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: Yaoguang.id,
      lightCone: WhenSheDecidedToSee.id,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
  ],
  deprioritizeBuffs: true,
})

const scoring = (): ScoringMetadata => ({
  stats: {
    [Stats.ATK]: 0,
    [Stats.ATK_P]: 0,
    [Stats.DEF]: 1,
    [Stats.DEF_P]: 1,
    [Stats.HP]: 0,
    [Stats.HP_P]: 0,
    [Stats.SPD]: 1,
    [Stats.CR]: 0,
    [Stats.CD]: 0,
    [Stats.EHR]: 0,
    [Stats.RES]: 0.5,
    [Stats.BE]: 0,
  },
  parts: {
    [Parts.Body]: [
      Stats.DEF_P,
      Stats.OHB,
    ],
    [Parts.Feet]: [
      Stats.SPD,
      Stats.DEF_P,
    ],
    [Parts.PlanarSphere]: [
      Stats.DEF_P,
    ],
    [Parts.LinkRope]: [
      Stats.ERR,
      Stats.DEF_P,
    ],
  },
  presets: [],
  defaultDamageType: DamageTag.BASIC,
  sortOption: SortOption.BASIC_HEAL,
  addedColumns: [SortOption.OHB, SortOption.BASIC_HEAL, SortOption.SKILL_HEAL],
  hiddenColumns: [SortOption.SKILL, SortOption.ULT, SortOption.FUA, SortOption.DOT],
  healSimulation: healSimulation(),
})

const display = {
  imageCenter: {
    x: 1016,
    y: 1001,
    z: 1.02,
  },
  showcaseColor: '#d1d1ff',
  showcaseScoringOrder: [
    ScoringType.SUBSTAT_SCORE,
    ScoringType.HEAL_SCORE,
    ScoringType.NONE,
  ],
}

export const Pearl: CharacterConfig = {
  id: '1503',
  defaultLightCone: ColorsForTomorrow.id,
  display,
  conditionals,
  get scoring() {
    return scoring()
  },
}
