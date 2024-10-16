import { Stats } from 'lib/constants'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, findContentId, gpuStandardHpFinalizer, standardHpFinalizer } from 'lib/conditionals/conditionalUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Huohuo')
  const { basic, ult } = AbilityEidolon.ULT_TALENT_3_SKILL_BASIC_5

  const ultBuffValue = ult(e, 0.40, 0.432)
  const basicScaling = basic(e, 0.50, 0.55)

  const content: ContentItem[] = [{
    formItem: 'switch',
    id: 'ultBuff',
    name: 'ultBuff',
    text: t('Content.ultBuff.text'),
    title: t('Content.ultBuff.title'),
    content: t('Content.ultBuff.content', { ultBuffValue: TsUtils.precisionRound(100 * ultBuffValue) }),
  }, {
    formItem: 'switch',
    id: 'skillBuff',
    name: 'skillBuff',
    text: t('Content.skillBuff.text'),
    title: t('Content.skillBuff.title'),
    content: t('Content.skillBuff.content'),
    disabled: e < 1,
  }, {
    formItem: 'switch',
    id: 'e6DmgBuff',
    name: 'e6DmgBuff',
    text: t('Content.e6DmgBuff.text'),
    title: t('Content.e6DmgBuff.title'),
    content: t('Content.e6DmgBuff.content'),
    disabled: e < 6,
  }]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'ultBuff'),
    findContentId(content, 'skillBuff'),
    findContentId(content, 'e6DmgBuff'),
  ]

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => ({
      ultBuff: true,
      skillBuff: true,
      e6DmgBuff: true,
    }),
    teammateDefaults: () => ({
      ultBuff: true,
      skillBuff: true,
      e6DmgBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      // Scaling
      x.BASIC_SCALING += basicScaling

      x.BASIC_TOUGHNESS_DMG += 30

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals

      x[Stats.ATK_P] += (m.ultBuff) ? ultBuffValue : 0
      x[Stats.SPD_P] += (e >= 1 && m.skillBuff) ? 0.12 : 0

      x.ELEMENTAL_DMG += (e >= 6 && m.e6DmgBuff) ? 0.50 : 0
    },
    finalizeCalculations: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      standardHpFinalizer(x)
    },
    gpuFinalizeCalculations: () => {
      return gpuStandardHpFinalizer()
    },
  }
}
