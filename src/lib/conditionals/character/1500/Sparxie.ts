import i18next from 'i18next'
import { AbilityType } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition, createEnum, } from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { dynamicStatConversionContainer, gpuDynamicStatConversion, } from 'lib/conditionals/evaluation/statConversion'
import { ConditionalActivation, ConditionalType, CURRENT_DATA_VERSION, Stats, } from 'lib/constants/constants'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { DamageTag, ElementTag, TargetTag, } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { SPARXIE } from 'lib/simulations/tests/testMetadataConstants'
import { Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'
import { HitDefinition } from 'types/hitConditionalTypes'
import { OptimizerAction, OptimizerContext, } from 'types/optimizer'

export const SparxieEntities = createEnum('Sparxie')
export const SparxieAbilities = createEnum('BASIC', 'ULT', 'ELATION_SKILL', 'BREAK')

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
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
  } = Source.character(SPARXIE)

  const betaContent = i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION })

  const basicScaling = basic(e, 1.00, 1.10)
  const engagementScaling = skill(e, 0.20, 0.22)

  const ultAtkScaling = ult(e, 0.50, 0.54)

  const talentMainElationScaling = talent(e, 0.40, 0.44)
  const talentEngagementElationScaling = talent(e, 0.20, 0.22)
  const talentUltElationScaling = talent(e, 0.48, 0.528)

  const elationSkillAoeScaling = elationSkill(e, 0.50, 0.525, 0.55)
  const elationSkillBounceScaling = elationSkill(e, 0.25, 0.2625, 0.275)

  let defaultPunchlines = 35
  if (e >= 1) defaultPunchlines += 5
  if (e >= 2) defaultPunchlines += 4
  if (e >= 4) defaultPunchlines += 5

  const defaults = {
    enhancedBasic: true,
    punchlineStacks: defaultPunchlines,
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
    punchlineStacks: defaultPunchlines,
    e1PunchlineResPen: true,
    punchlineCritDmg: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    enhancedBasic: {
      id: 'enhancedBasic',
      formItem: 'switch',
      text: 'Enhanced Basic',
      content: betaContent,
    },
    punchlineStacks: {
      id: 'punchlineStacks',
      formItem: 'slider',
      text: 'Punchline stacks',
      content: betaContent,
      min: 0,
      max: 200,
    },
    engagementFarmingStacks: {
      id: 'engagementFarmingStacks',
      formItem: 'slider',
      text: 'Engagement Farming stacks',
      content: betaContent,
      min: 0,
      max: 20,
    },
    certifiedBanger: {
      id: 'certifiedBanger',
      formItem: 'switch',
      text: 'Certified Banger',
      content: betaContent,
    },
    atkToElation: {
      id: 'atkToElation',
      formItem: 'switch',
      text: 'ATK to Elation conversion',
      content: betaContent,
    },
    punchlineCritDmg: {
      id: 'punchlineCritDmg',
      formItem: 'switch',
      text: 'Punchline CD',
      content: betaContent,
    },
    e1PunchlineResPen: {
      id: 'e1PunchlineResPen',
      formItem: 'switch',
      text: 'E1 RES PEN',
      content: betaContent,
      disabled: e < 1,
    },
    e2ThrillStacks: {
      id: 'e2ThrillStacks',
      formItem: 'slider',
      text: 'E2 CD stacks',
      content: betaContent,
      min: 0,
      max: 4,
      disabled: e < 2,
    },
    e4UltElation: {
      id: 'e4UltElation',
      formItem: 'switch',
      text: 'E4 Ult Elation buff',
      content: betaContent,
      disabled: e < 4,
    },
    e6ResPen: {
      id: 'e6ResPen',
      formItem: 'switch',
      text: 'E6 RES PEN',
      content: betaContent,
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    punchlineStacks: {
      id: 'punchlineStacks',
      formItem: 'slider',
      text: 'Punchline stacks',
      content: betaContent,
      min: 0,
      max: 200,
    },
    e1PunchlineResPen: content.e1PunchlineResPen,
    punchlineCritDmg: content.punchlineCritDmg,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.ULT, AbilityType.ELATION_SKILL],
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

    actionDeclaration: () => Object.values(SparxieAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>
      const punchline = r.punchlineStacks
      const engagementStacks = r.enhancedBasic ? r.engagementFarmingStacks : 0

      const e6ExtraBounces = (e >= 6 && r.e6ResPen) ? Math.min(40, punchline) : 0
      const totalBounces = 20 + e6ExtraBounces

      // ============== BASIC ==============

      // Basic - ATK scaling increased by Engagement Farming stacks when enhanced
      const basicHit = HitDefinitionBuilder.standardBasic()
        .damageElement(ElementTag.Fire)
        .atkScaling(basicScaling + engagementScaling * engagementStacks)
        .toughnessDmg(10)
        .build()

      // Talent Elation on enhanced basic - main target hit + per-stack bounces averaged over enemies
      const talentBasicElationHit = HitDefinitionBuilder.elation()
        .damageType(DamageTag.ELATION)
        .damageElement(ElementTag.Fire)
        .elationScaling(talentMainElationScaling + talentEngagementElationScaling * engagementStacks / context.enemyCount)
        .punchlineStacks(punchline)
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
        .punchlineStacks(punchline)
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
        .punchlineStacks(punchline)
        .toughnessDmg(6.67 + 1.67 * totalBounces / context.enemyCount)
        .build()

      const breakHit = HitDefinitionBuilder.standardBreak(ElementTag.Fire).build()

      return {
        [SparxieAbilities.BASIC]: { hits: basicHits },
        [SparxieAbilities.ULT]: { hits: ultHits },
        [SparxieAbilities.ELATION_SKILL]: { hits: [elationSkillHit] },
        [SparxieAbilities.BREAK]: { hits: [breakHit] },
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
      const punchline = r.punchlineStacks

      // Per Punchline, +8% CRIT DMG to all allies (max 80%)
      const cdBuff = r.punchlineCritDmg ? Math.min(0.80, punchline * 0.08) : 0
      x.buff(StatKey.CD, cdBuff, x.targets(TargetTag.FullTeam).source(SOURCE_TRACE))

      // E1: Per Punchline, +1.5% All-Type RES PEN to all allies (max 15%)
      const resPenBuff = (e >= 1 && r.e1PunchlineResPen) ? Math.min(0.15, punchline * 0.015) : 0
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
              return Math.min(0.80, Math.floor((convertibleValue - 2000) / 100) * 0.05)
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
            `min(0.80, floor((convertibleValue - 2000.0) / 100.0) * 0.05)`,
            `${wgslTrue(r.atkToElation)}`,
            `convertibleValue >= 2000.0`,
          )
        },
      },
    ],
  }
}
