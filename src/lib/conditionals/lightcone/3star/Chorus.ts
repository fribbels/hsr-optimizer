import { Stats } from 'lib/constants'
import { SuperImpositionLevel } from 'types/LightCone'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ContentItem } from 'types/Conditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.Chorus')
  const sValues = [0.08, 0.09, 0.10, 0.11, 0.12]
  const content: ContentItem[] = [{
    lc: true,
    id: 'inBattleAtkBuff',
    name: 'inBattleAtkBuff',
    formItem: 'switch',
    text: t('Content.inBattleAtkBuff.text'),
    title: t('Content.inBattleAtkBuff.title'),
    content: t('Content.inBattleAtkBuff.content', { AtkBuff: TsUtils.precisionRound(100 * sValues[s]) }),
  }]

  return {
    content: () => content,
    teammateContent: () => content,
    defaults: () => ({
      inBattleAtkBuff: true,
    }),
    teammateDefaults: () => ({
      inBattleAtkBuff: true,
    }),
    precomputeEffects: () => {
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.lightConeConditionals

      x[Stats.ATK_P] += (m.inBattleAtkBuff) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
