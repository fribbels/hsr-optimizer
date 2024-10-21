import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, findContentId, gpuStandardAtkFinalizer, standardAtkFinalizer } from 'lib/conditionals/conditionalUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'
import i18next from 'i18next'
import { CURRENT_DATA_VERSION, Stats } from 'lib/constants'

export default (e: Eidolon, withContent: boolean): CharacterConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Fugue')
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_TALENT_3_SKILL_BASIC_5 // TODO

  const skillBeValue = skill(e, 0.50, 0.50)
  const skillDefPenValue = skill(e, 0.23, 0.23)

  const basicScaling = basic(e, 1.0, 1.1)
  const ultScaling = ult(e, 2.50, 2.50)
  const superBreakScaling = talent(e, 1.25, 1.25)

  const content: ContentItem[] = [
    {
      formItem: 'switch',
      id: 'foxianPrayer',
      name: 'foxianPrayer',
      text: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      title: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    {
      formItem: 'switch',
      id: 'enemyBrokenBeBuff',
      name: 'enemyBrokenBeBuff',
      text: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      title: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    {
      formItem: 'switch',
      id: 'defReduction',
      name: 'Skill DEF shred',
      text: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      title: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    {
      formItem: 'switch',
      id: 'superBreakDmg',
      name: 'superBreakDmg',
      text: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      title: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    {
      formItem: 'switch',
      id: 'e4Vulnerability',
      name: 'e4Vulnerability',
      text: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      title: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 4
    },
    {
      formItem: 'switch',
      id: 'e6BreakEfficiency',
      name: 'e6BreakEfficiency',
      text: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      title: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 6
    },
  ]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'foxianPrayer'),
    findContentId(content, 'enemyBrokenBeBuff'),
    findContentId(content, 'e4Vulnerability'),
    // TODO
  ]

  const defaults = {
    // TODO
  }

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => (defaults),
    teammateDefaults: () => ({}),
    initializeConfigurations: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals

      if (r.superBreakDmg) {
        x.ENEMY_WEAKNESS_BROKEN = 1
      }
    },
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals

      x[Stats.BE] += 0.30

      x.BREAK_EFFICIENCY_BOOST += (e >= 6) ? 0.50 : 0

      x.BASIC_SCALING += basicScaling
      x.ULT_SCALING += ultScaling

      // TODO: toughness
    },
    precomputeMutualEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals

      x[Stats.BE] += (m.enemyBrokenBeBuff) ? 0.15 : 0
      x[Stats.BE] += (m.foxianPrayer) ? skillBeValue : 0

      x.SUPER_BREAK_MODIFIER += (m.superBreakDmg) ? superBreakScaling : 0
      x.DEF_PEN += (m.defReduction) ? skillDefPenValue : 0

      x.BREAK_EFFICIENCY_BOOST += (e >= 1 && m.foxianPrayer) ? 0.50 : 0
      x.VULNERABILITY += (e >= 4 && m.e4Vulnerability) ? 0.15 : 0
    },
    precomputeTeammateEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals
    },
    finalizeCalculations: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      standardAtkFinalizer(x)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuStandardAtkFinalizer()
    },
  }
}
