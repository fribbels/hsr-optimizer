import i18next from 'i18next'
import { AbilityEidolon, Conditionals, ContentDefinition, findContentId, gpuStandardAtkFinalizer, standardAtkFinalizer } from 'lib/conditionals/conditionalUtils'
import { CURRENT_DATA_VERSION, Stats } from 'lib/constants'
import { ComputedStatsArray } from 'lib/optimizer/computedStatsArray'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditional => {
  // const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Fugue')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

  const skillBeValue = skill(e, 0.40, 0.44)
  const skillDefPenValue = skill(e, 0.18, 0.20)

  const basicScaling = basic(e, 1.00, 1.10)
  const ultScaling = ult(e, 2.00, 2.20)
  const superBreakScaling = talent(e, 1.00, 1.10)

  const content: ContentDefinition<typeof defaults> = [
    {
      formItem: 'switch',
      id: 'torridScorch',
      text: 'Torrid Scorch state',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    {
      formItem: 'switch',
      id: 'foxianPrayer',
      text: 'Foxian Prayer BE buff',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    {
      formItem: 'slider',
      id: 'weaknessBreakBeStacks',
      text: 'Enemy broken BE stacks',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      min: 0,
      max: 2,
    },
    {
      formItem: 'switch',
      id: 'defReduction',
      text: 'Skill DEF shred',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    {
      formItem: 'switch',
      id: 'superBreakDmg',
      text: 'Super Break DMG (force weakness break)',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    {
      formItem: 'switch',
      id: 'e4Vulnerability',
      text: 'E4 vulnerability',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 4,
    },
    {
      formItem: 'switch',
      id: 'e6BreakEfficiency',
      text: 'E6 break efficiency boost',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 6,
    },
  ]

  const teammateContent: ContentDefinition<typeof teammateDefaults> = [
    findContentId(content, 'foxianPrayer'),
    findContentId(content, 'weaknessBreakBeStacks'),
    findContentId(content, 'defReduction'),
    findContentId(content, 'superBreakDmg'),
    findContentId(content, 'e4Vulnerability'),
  ]

  const defaults = {
    torridScorch: true,
    foxianPrayer: false,
    weaknessBreakBeStacks: 2,
    defReduction: true,
    superBreakDmg: true,
    e4Vulnerability: true,
    e6BreakEfficiency: true,
  }

  const teammateDefaults = {
    foxianPrayer: true,
    weaknessBreakBeStacks: 2,
    defReduction: true,
    superBreakDmg: true,
    e4Vulnerability: true,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => (defaults),
    teammateDefaults: () => (teammateDefaults),
    initializeConfigurations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.characterConditionals

      if (r.superBreakDmg) {
        x.ENEMY_WEAKNESS_BROKEN = 1
      }
    },
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.characterConditionals

      x[Stats.BE] += 0.30

      x.BREAK_EFFICIENCY_BOOST += (e >= 6 && r.e6BreakEfficiency) ? 0.50 : 0

      x.BASIC_SCALING += basicScaling
      x.ULT_SCALING += ultScaling

      x.BASIC_TOUGHNESS_DMG = 30
      x.ULT_TOUGHNESS_DMG = 60
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m: Conditionals<typeof teammateContent> = action.characterConditionals

      x[Stats.BE] += m.weaknessBreakBeStacks * 0.15
      x[Stats.BE] += (m.foxianPrayer) ? skillBeValue : 0

      x.SUPER_BREAK_MODIFIER += (m.superBreakDmg) ? superBreakScaling : 0
      x.DEF_PEN += (m.defReduction) ? skillDefPenValue : 0

      x.BREAK_EFFICIENCY_BOOST += (e >= 1 && m.foxianPrayer) ? 0.50 : 0
      x.VULNERABILITY += (e >= 4 && m.e4Vulnerability) ? 0.15 : 0
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t: Conditionals<typeof teammateContent> = action.characterConditionals
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      standardAtkFinalizer(x)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuStandardAtkFinalizer()
    },
  }
}
