import { SuperImpositionLevel } from 'types/LightCone'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ContentItem } from 'types/Conditionals'
import { ComputedStatsObject, FUA_TYPE } from 'lib/conditionals/conditionalConstants'
import { Stats } from 'lib/constants'
import { buffAbilityDefPen } from 'lib/optimizer/calculateBuffs'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

const BaptismOfPureThought = (s: SuperImpositionLevel): LightConeConditional => {
  /* @ts-expect-error ts can't resolve the type 'Type instantiation is excessively deep and possibly infinite' */
  const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.BaptismOfPureThought')
  const sValuesCd = [0.08, 0.09, 0.10, 0.11, 0.12]
  const sValuesDmg = [0.36, 0.42, 0.48, 0.54, 0.60]
  const sValuesFuaPen = [0.24, 0.28, 0.32, 0.36, 0.40]

  const content: ContentItem[] = [{
    lc: true,
    formItem: 'slider',
    id: 'debuffCdStacks',
    name: 'debuffCdStacks',
    text: t('Content.0.text'),
    title: t('Content.0.title'),
    content: t('Content.0.content', { DmgStep: TsUtils.precisionRound(100 * sValuesCd[s]), StackCount: 3 }),
    min: 0,
    max: 3,
  }, {
    lc: true,
    formItem: 'switch',
    id: 'postUltBuff',
    name: 'postUltBuff',
    text: t('Content.1.text'),
    title: t('Content.1.title'),
    content: t('Content.1.content', { DmgStep: TsUtils.precisionRound(100 * sValuesDmg[s]), DefIgnore: TsUtils.precisionRound(100 * sValuesFuaPen[s]), Duration: 2 }),
  }]

  return {
    content: () => content,
    defaults: () => ({
      debuffCdStacks: 3,
      postUltBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.CD] += r.debuffCdStacks * sValuesCd[s]
      x.ELEMENTAL_DMG += r.postUltBuff ? sValuesDmg[s] : 0

      buffAbilityDefPen(x, FUA_TYPE, sValuesFuaPen[s], (r.postUltBuff))
    },
    finalizeCalculations: () => {
    },
  }
}

export default BaptismOfPureThought
