import { AbilityType } from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  addSuperBreakHits,
  Conditionals,
  ContentDefinition,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { ModifierContext } from 'lib/optimization/context/calculateActions'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  ElementTag,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'
import { HitDefinition } from 'types/hitConditionalTypes'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const FugueEntities = createEnum('Fugue')
export const FugueAbilities = createEnum('BASIC', 'ULT', 'BREAK')

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Fugue')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5
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
  } = Source.character('1225')

  const skillBeValue = skill(e, 0.30, 0.33)
  const skillDefPenValue = skill(e, 0.18, 0.20)

  const basicScaling = basic(e, 1.00, 1.10)
  const ultScaling = ult(e, 2.00, 2.20)
  const superBreakScaling = talent(e, 1.00, 1.10)

  const defaults = {
    torridScorch: true,
    foxianPrayer: false,
    defReduction: true,
    superBreakDmg: true,
    e4BreakDmg: true,
    e6BreakEfficiency: true,
  }

  const teammateDefaults = {
    foxianPrayer: true,
    be220Buff: true,
    weaknessBreakBeStacks: 2,
    defReduction: true,
    superBreakDmg: true,
    e4BreakDmg: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    torridScorch: {
      id: 'torridScorch',
      formItem: 'switch',
      text: t('Content.torridScorch.text'),
      content: t('Content.torridScorch.content'),
    },
    foxianPrayer: {
      id: 'foxianPrayer',
      formItem: 'switch',
      text: t('Content.foxianPrayer.text'),
      content: t('Content.foxianPrayer.content', { BreakBuff: TsUtils.precisionRound(100 * skillBeValue) }),
    },
    defReduction: {
      id: 'defReduction',
      formItem: 'switch',
      text: t('Content.defReduction.text'),
      content: t('Content.defReduction.content', { DefShred: TsUtils.precisionRound(100 * skillDefPenValue) }),
    },
    superBreakDmg: {
      id: 'superBreakDmg',
      formItem: 'switch',
      text: t('Content.superBreakDmg.text'),
      content: t('Content.superBreakDmg.content', { SuperBreakMultiplier: TsUtils.precisionRound(100 * superBreakScaling) }),
    },
    e4BreakDmg: {
      id: 'e4BreakDmg',
      formItem: 'switch',
      text: t('Content.e4BreakDmg.text'),
      content: t('Content.e4BreakDmg.content'),
      disabled: e < 4,
    },
    e6BreakEfficiency: {
      id: 'e6BreakEfficiency',
      formItem: 'switch',
      text: t('Content.e6BreakEfficiency.text'),
      content: t('Content.e6BreakEfficiency.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    foxianPrayer: content.foxianPrayer,
    be220Buff: {
      id: 'be220Buff',
      formItem: 'switch',
      text: t('TeammateContent.be220Buff.text'),
      content: t('TeammateContent.be220Buff.content'),
    },
    weaknessBreakBeStacks: {
      id: 'weaknessBreakBeStacks',
      formItem: 'slider',
      text: t('TeammateContent.weaknessBreakBeStacks.text'),
      content: t('TeammateContent.weaknessBreakBeStacks.content'),
      min: 0,
      max: 2,
    },
    defReduction: content.defReduction,
    superBreakDmg: content.superBreakDmg,
    e4BreakDmg: content.e4BreakDmg,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.ULT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(FugueEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [FugueEntities.Fugue]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(FugueAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [FugueAbilities.BASIC]: {
        hits: [
          HitDefinitionBuilder.standardBasic()
            .damageElement(ElementTag.Fire)
            .atkScaling(basicScaling)
            .build(),
        ],
      },
      [FugueAbilities.ULT]: {
        hits: [
          HitDefinitionBuilder.standardUlt()
            .damageElement(ElementTag.Fire)
            .atkScaling(ultScaling)
            .build(),
        ],
      },
      [FugueAbilities.BREAK]: {
        hits: [
          HitDefinitionBuilder.standardBreak(ElementTag.Fire).build(),
        ],
      },
    }),
    actionModifiers() {
      return [
        {
          modify: (action: OptimizerAction, context: OptimizerContext, _self: ModifierContext) => {
            addSuperBreakHits(action.hits!)
          },
        },
      ]
    },

    initializeConfigurationsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>
      if (r.superBreakDmg) {
        x.set(StatKey.ENEMY_WEAKNESS_BROKEN, 1, x.source(SOURCE_TALENT))
      }
    },

    initializeTeammateConfigurationsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>
      if (r.superBreakDmg) {
        x.set(StatKey.ENEMY_WEAKNESS_BROKEN, 1, x.source(SOURCE_TALENT))
      }
    },

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.buff(StatKey.BE, 0.30, x.source(SOURCE_TRACE))
      x.buff(StatKey.BREAK_EFFICIENCY_BOOST, (e >= 6 && r.e6BreakEfficiency) ? 0.50 : 0, x.source(SOURCE_E6))
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.BE, (m.foxianPrayer) ? skillBeValue : 0, x.targets(TargetTag.SingleTarget).source(SOURCE_SKILL))
      x.buff(StatKey.BREAK_EFFICIENCY_BOOST, (e >= 1 && m.foxianPrayer) ? 0.50 : 0, x.targets(TargetTag.SingleTarget).source(SOURCE_E1))

      x.buff(StatKey.SUPER_BREAK_MODIFIER, (m.superBreakDmg) ? superBreakScaling : 0, x.targets(TargetTag.FullTeam).source(SOURCE_TALENT))
      x.buff(StatKey.DEF_PEN, (m.defReduction) ? skillDefPenValue : 0, x.targets(TargetTag.FullTeam).source(SOURCE_SKILL))
      x.buff(StatKey.DMG_BOOST, (e >= 4 && m.foxianPrayer && m.e4BreakDmg) ? 0.20 : 0, x.damageType(DamageTag.BREAK).targets(TargetTag.SingleTarget).source(SOURCE_E4))
    },

    precomputeTeammateEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.BE, t.weaknessBreakBeStacks * (0.06 + (t.be220Buff ? 0.12 : 0)), x.targets(TargetTag.FullTeam).source(SOURCE_TRACE))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {},
  }
}
