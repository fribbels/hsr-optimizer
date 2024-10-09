import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { Stats } from 'lib/constants'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { findContentId } from 'lib/conditionals/conditionalUtils'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel, withoutContent: boolean): LightConeConditional => {
  const sValuesErr = [0.03, 0.035, 0.04, 0.045, 0.05]
  const sValuesAtkBuff = [0.48, 0.60, 0.72, 0.84, 0.96]
  const sValuesDmgBuff = [0.24, 0.28, 0.32, 0.36, 0.40]

  const content: ContentItem[] = (() => {
    if (withoutContent) return []
    const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.FlowingNightglow.Content')
    return [
      {
        lc: true,
        id: 'cadenzaActive',
        name: 'cadenzaActive',
        formItem: 'switch',
        text: t('cadenzaActive.text'),
        title: t('cadenzaActive.title'),
        content: t('cadenzaActive.content', { RegenBuff: TsUtils.precisionRound(100 * sValuesErr[s]), AtkBuff: TsUtils.precisionRound(100 * sValuesAtkBuff[s]), DmgBuff: TsUtils.precisionRound(100 * sValuesDmgBuff[s]) }),
      },
      {
        lc: true,
        id: 'cantillationStacks',
        name: 'cantillationStacks',
        formItem: 'slider',
        text: t('cantillationStacks.text'),
        title: t('cantillationStacks.title'),
        content: t('cantillationStacks.content', { RegenBuff: TsUtils.precisionRound(100 * sValuesErr[s]), AtkBuff: TsUtils.precisionRound(100 * sValuesAtkBuff[s]), DmgBuff: TsUtils.precisionRound(100 * sValuesDmgBuff[s]) }),
        min: 0,
        max: 5,
      },
    ]
  })()

  const teammateContent: ContentItem[] = (() => {
    if (withoutContent) return []
    return [
      findContentId(content, 'cadenzaActive'),
    ]
  })()

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => ({
      cantillationStacks: 5,
      cadenzaActive: true,
    }),
    teammateDefaults: () => ({
      cadenzaActive: true,
    }),
    precomputeTeammateEffects: (x: ComputedStatsObject, request: Form) => {
      const t = request.lightConeConditionals

      x.ELEMENTAL_DMG += (t.cadenzaActive) ? sValuesDmgBuff[s] : 0
    },
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.ERR] += r.cantillationStacks * sValuesErr[s]
      x[Stats.ATK_P] += (r.cadenzaActive) ? sValuesAtkBuff[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
