import i18next from 'i18next'
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
import { DanceDanceDance } from 'lib/conditionals/lightcone/4star/DanceDanceDance'
import {
  ConditionalActivation,
  ConditionalType,
  CURRENT_DATA_VERSION,
  Parts,
  Stats,
} from 'lib/constants/constants'
import { containerActionVal } from 'lib/gpu/injection/injectUtils'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  DirectnessTag,
  ElementTag,
  SELF_ENTITY_INDEX,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { AbilityKind } from 'lib/optimization/rotation/turnAbilityConfig'
import { SortOption } from 'lib/optimization/sortOptions'
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

export const AstraYaoEntities = createEnum('AstraYao')
export const AstraYaoAbilities: AbilityKind[] = [AbilityKind.BASIC, AbilityKind.UNIQUE, AbilityKind.ULT, AbilityKind.BREAK, AbilityKind.BUFF]

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const betaContent = i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION })
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5
  const { SOURCE_SKILL, SOURCE_ULT, SOURCE_TALENT, SOURCE_TRACE, SOURCE_E1, SOURCE_E2, SOURCE_E6 } = Source.character(AstraYao.id)

  const basicScaling = basic(e, 1.00, 1.10)
  const enhancedBasicScaling = basic(e, 1.60, 1.76)
  const minuetScaling = basic(e, 1.80, 1.98)
  const skillAtkScaling = skill(e, 0.24, 0.264)
  const skillAtkFlat = skill(e, 300, 330)
  const ultScaling = ult(e, 3.20, 3.52)
  const ultVulnerability = ult(e, 0.32, 0.352)
  const ultAdditionalScaling = ult(e, 0.40, 0.44)
  const talentDmgPerStack = talent(e, 0.05, 0.055)

  // Source: saved 4.7.51 kit; empty duplicate Cadenza has no independent definition.
  // Not modeled: Technique (house convention), Energy/SP recovery, CC dispel, and turn/stack timing.
  // Joint attacks need separate actors/rotation slots; ally-triggered Zone DMG needs Astra's stats.
  // Minor trace stats belong to future game metadata; benchmark/scoring are placeholders.

  const defaults = {
    skillAtkBuff: true,
    enhancedBasic: true,
    ultZone: true,
    syncopationStacks: 10,
    fantasiaScale: true,
    nevernightTour: true,
    e1Buffs: true,
    e2AtkBuff: true,
    e2AdditionalDmg: true,
    e4Scaling: true,
    e6ResPen: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    skillAtkBuff: {
      id: 'skillAtkBuff',
      formItem: 'switch',
      text: 'Skill ATK buff',
      content: betaContent,
    },
    enhancedBasic: {
      id: 'enhancedBasic',
      formItem: 'switch',
      text: 'Enhanced Basic ATK',
      content: betaContent,
    },
    ultZone: {
      id: 'ultZone',
      formItem: 'switch',
      text: 'Ultimate Zone',
      content: betaContent,
    },
    syncopationStacks: {
      id: 'syncopationStacks',
      formItem: 'slider',
      text: 'Syncopation stacks',
      content: betaContent,
      min: 0,
      max: 10,
    },
    fantasiaScale: {
      id: 'fantasiaScale',
      formItem: 'switch',
      text: 'Fantasia Scale',
      content: betaContent,
    },
    nevernightTour: {
      id: 'nevernightTour',
      formItem: 'switch',
      text: 'Nevernight Tour',
      content: betaContent,
    },
    e1Buffs: {
      id: 'e1Buffs',
      formItem: 'switch',
      text: 'E1 Syncopation buffs',
      content: betaContent,
      disabled: e < 1,
    },
    e2AtkBuff: {
      id: 'e2AtkBuff',
      formItem: 'switch',
      text: 'E2 additional ATK buff',
      content: betaContent,
      disabled: e < 2,
    },
    e2AdditionalDmg: {
      id: 'e2AdditionalDmg',
      formItem: 'switch',
      text: 'E2 Zone Additional DMG boost',
      content: betaContent,
      disabled: e < 2,
    },
    e4Scaling: {
      id: 'e4Scaling',
      formItem: 'switch',
      text: 'E4 Cadenza and Ultimate multipliers',
      content: betaContent,
      disabled: e < 4,
    },
    e6ResPen: {
      id: 'e6ResPen',
      formItem: 'switch',
      text: 'E6 Zone All-Type RES PEN',
      content: betaContent,
      disabled: e < 6,
    },
  }

  const teammateDefaults = {
    skillAtkBuff: true,
    teammateATKValue: 4500,
    ultZone: true,
    syncopationStacks: 10,
    nevernightTour: true,
    e1Buffs: true,
    e2AtkBuff: true,
    e6ResPen: true,
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    skillAtkBuff: content.skillAtkBuff,
    teammateATKValue: {
      id: 'teammateATKValue',
      formItem: 'slider',
      text: 'Astra ATK before her Skill buff',
      content: betaContent,
      min: 0,
      max: 10000,
    },
    ultZone: content.ultZone,
    syncopationStacks: content.syncopationStacks,
    nevernightTour: content.nevernightTour,
    e1Buffs: content.e1Buffs,
    e2AtkBuff: content.e2AtkBuff,
    e6ResPen: content.e6ResPen,
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    teammateContent: () => Object.values(teammateContent),
    teammateDefaults: () => teammateDefaults,
    entityDeclaration: () => Object.values(AstraYaoEntities),
    entityDefinition: () => ({
      [AstraYaoEntities.AstraYao]: { primary: true, summon: false, memosprite: false, pet: false },
    }),
    actionDeclaration: () => [...AstraYaoAbilities],
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>
      const e4Active = e >= 4 && r.e4Scaling

      return {
        [AbilityKind.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Quantum)
              .atkScaling(r.enhancedBasic ? enhancedBasicScaling * (e4Active ? 1.60 : 1) : basicScaling)
              .toughnessDmg(r.enhancedBasic ? 20 : 10)
              .build(),
            HitDefinitionBuilder.standardAdditional()
              .damageElement(ElementTag.Quantum)
              .atkScaling(r.ultZone ? ultAdditionalScaling : 0)
              .build(),
          ],
        },
        [AbilityKind.UNIQUE]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Quantum)
              .atkScaling(minuetScaling)
              .toughnessDmg(20)
              .build(),
            HitDefinitionBuilder.standardAdditional()
              .damageElement(ElementTag.Quantum)
              .atkScaling(r.ultZone ? ultAdditionalScaling : 0)
              .build(),
          ],
        },
        [AbilityKind.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Quantum)
              .atkScaling(ultScaling * (e4Active ? 2.00 : 1))
              .toughnessDmg(20)
              .build(),
          ],
        },
        [AbilityKind.BREAK]: {
          hits: [HitDefinitionBuilder.standardBreak(ElementTag.Quantum).build()],
        },
        [AbilityKind.BUFF]: {
          hits: [
            HitDefinitionBuilder.linearBuff()
              .buffStat(StatKey.ATK)
              .sourceStat(StatKey.ATK)
              .scaling(r.skillAtkBuff ? skillAtkScaling + (e >= 2 && r.e2AtkBuff ? 0.12 : 0) : 0)
              .flat(r.skillAtkBuff ? skillAtkFlat : 0)
              .build(),
          ],
        },
      }
    },
    actionModifiers: () => [],
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Skill: exclude the flat portion from its own ATK-sharing feedback.
      const flatAtk = r.skillAtkBuff ? skillAtkFlat : 0
      x.buff(StatKey.ATK, flatAtk, x.source(SOURCE_SKILL))
      x.buff(StatKey.UNCONVERTIBLE_ATK_BUFF, flatAtk, x.source(SOURCE_SKILL))
      x.buff(StatKey.CR, r.fantasiaScale ? 0.50 : 0, x.source(SOURCE_TRACE))
      if (action.actionType === AbilityKind.BASIC || action.actionType === AbilityKind.UNIQUE) {
        x.buff(
          StatKey.BOOST,
          e >= 2 && r.e2AdditionalDmg && r.ultZone ? 0.80 : 0,
          x.target(AstraYaoEntities.AstraYao).damageType(DamageTag.ADDITIONAL).source(SOURCE_E2),
        )
      }
    },
    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>
      const syncopationBoost = talentDmgPerStack * m.syncopationStacks

      x.buff(StatKey.VULNERABILITY, m.ultZone ? ultVulnerability : 0, x.targets(TargetTag.FullTeam).source(SOURCE_ULT))
      if (e >= 1 && m.e1Buffs && m.ultZone) {
        // Directness is action-level; damage tags also exclude riding Additional DMG.
        x.buff(
          StatKey.BOOST,
          syncopationBoost,
          x.targets(TargetTag.FullTeam)
            .damageType(DamageTag.BASIC | DamageTag.SKILL | DamageTag.ULT | DamageTag.FUA | DamageTag.MEMO | DamageTag.ELATION | DamageTag.ASSIST)
            .directness(DirectnessTag.Direct)
            .source(SOURCE_TALENT),
        )
      } else {
        x.buff(StatKey.BOOST, syncopationBoost, x.targets(TargetTag.FullTeam).damageType(DamageTag.BASIC).source(SOURCE_TALENT))
      }
      x.buff(StatKey.BOOST, m.nevernightTour && m.syncopationStacks > 0 ? 0.40 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_TRACE))
      // E1: DEF ignore has its own sentence, without the Zone prerequisite.
      x.buff(StatKey.DEF_PEN, e >= 1 && m.e1Buffs ? m.syncopationStacks * 0.015 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E1))
      x.buff(StatKey.RES_PEN, e >= 6 && m.e6ResPen && m.ultZone ? 0.20 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E6))
    },
    precomputeTeammateEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>
      const derivedAtk = t.skillAtkBuff ? t.teammateATKValue * (skillAtkScaling + (e >= 2 && t.e2AtkBuff ? 0.12 : 0)) : 0
      const flatAtk = t.skillAtkBuff ? skillAtkFlat : 0

      // Skill: exclude the full stat-sharing bonus from recipient conversions, matching Robin.
      x.buff(StatKey.ATK, derivedAtk + flatAtk, x.targets(TargetTag.FullTeam).source(SOURCE_SKILL))
      x.buff(StatKey.UNCONVERTIBLE_ATK_BUFF, derivedAtk + flatAtk, x.targets(TargetTag.FullTeam).source(SOURCE_SKILL))
    },
    finalizeCalculations: () => {},
    newGpuFinalizeCalculations: () => '',
    dynamicConditionals: [
      {
        id: 'AstraYaoSkillAtkShare',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.ATK],
        chainsTo: [Stats.ATK],
        condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          return r.skillAtkBuff
        },
        effect: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          const ratio = skillAtkScaling + (e >= 2 && r.e2AtkBuff ? 0.12 : 0)
          dynamicStatConversionContainer(Stats.ATK, Stats.ATK, this, x, action, context, SOURCE_SKILL, (convertibleValue) => convertibleValue * ratio)
        },
        gpu: function(action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          const ratio = skillAtkScaling + (e >= 2 && r.e2AtkBuff ? 0.12 : 0)
          return gpuDynamicStatConversion(Stats.ATK, Stats.ATK, this, action, context, `convertibleValue * ${ratio}`, wgslTrue(r.skillAtkBuff))
        },
      },
      {
        id: 'AstraYaoFantasiaScale',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.ATK],
        chainsTo: [Stats.CD],
        condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          return r.fantasiaScale
        },
        effect: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          // Fantasia: total ATK includes her Skill; only the share excludes its own feedback.
          const totalAtk = x.getActionValueByIndex(StatKey.ATK, SELF_ENTITY_INDEX)
          dynamicStatConversionContainer(
            Stats.ATK,
            Stats.CD,
            this,
            x,
            action,
            context,
            SOURCE_TRACE,
            () => Math.min(2.00, 0.20 * Math.floor(Math.max(0, totalAtk - 2000) / 200)),
          )
        },
        gpu: function(action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          const totalAtk = containerActionVal(SELF_ENTITY_INDEX, StatKey.ATK, action.config)
          return gpuDynamicStatConversion(
            Stats.ATK,
            Stats.CD,
            this,
            action,
            context,
            `min(2.00, 0.20 * floor(max(0.0, ${totalAtk} - 2000.0) / 200.0))`,
            wgslTrue(r.fantasiaScale),
          )
        },
      },
    ],
  }
}

// TODO: benchmark rotation and teammates require human review.
const simulation = (): SimulationMetadata | undefined => undefined

// TODO: scoring weights and recommended main stats require human review.
const scoring = (): ScoringMetadata => ({
  stats: {
    [Stats.ATK]: 0,
    [Stats.ATK_P]: 0,
    [Stats.DEF]: 0,
    [Stats.DEF_P]: 0,
    [Stats.HP]: 0,
    [Stats.HP_P]: 0,
    [Stats.SPD]: 0,
    [Stats.CR]: 0,
    [Stats.CD]: 0,
    [Stats.EHR]: 0,
    [Stats.RES]: 0,
    [Stats.BE]: 0,
  },
  parts: { [Parts.Body]: [], [Parts.Feet]: [], [Parts.PlanarSphere]: [], [Parts.LinkRope]: [] },
  presets: [],
  sortOption: SortOption.BASIC,
  hiddenColumns: [SortOption.SKILL, SortOption.FUA, SortOption.DOT],
  simulation: simulation(),
})

const display = {} // TODO: portrait positioning and showcase color.

export const AstraYao: CharacterConfig = {
  id: '1515',
  defaultLightCone: DanceDanceDance.id,
  display,
  conditionals,
  get scoring() {
    return scoring()
  },
}
