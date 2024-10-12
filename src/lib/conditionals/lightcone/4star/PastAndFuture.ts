import { LightConeConditional } from 'types/LightConeConditionals'
import { ContentItem } from 'types/Conditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.PastAndFuture')
  const sValues = [0.16, 0.20, 0.24, 0.28, 0.32]

  const content: ContentItem[] = [{
    lc: true,
    id: 'postSkillDmgBuff',
    name: 'postSkillDmgBuff',
    formItem: 'switch',
    text: t('Content.postSkillDmgBuff.text'),
    title: t('Content.postSkillDmgBuff.title'),
    content: t('Content.postSkillDmgBuff.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
  }]

  return {
    content: () => [],
    teammateContent: () => content,
    defaults: () => ({}),
    teammateDefaults: () => ({
      postSkillDmgBuff: true,
    }),
    precomputeEffects: () => {
    },
    precomputeTeammateEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const t = request.lightConeConditionals

      x.ELEMENTAL_DMG += (t.postSkillDmgBuff) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
