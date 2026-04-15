import {
  type Conditionals,
  type ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { wrappedFixedT } from 'lib/utils/i18nUtils'
import { precisionRound } from 'lib/utils/mathUtils'
import { type LightConeConditionalsController } from 'types/conditionals'
import { type SuperImpositionLevel } from 'types/lightCone'
import { type LightConeConfig } from 'types/lightConeConfig'
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'

const conditionals = (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.NinjaRecordSoundHunt')
  const { SOURCE_LC } = Source.lightCone(NinjaRecordSoundHunt.id)

  const sValuesCd = [0.18, 0.225, 0.27, 0.315, 0.36]

  const defaults = {
    cdBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    cdBuff: {
      lc: true,
      id: 'cdBuff',
      formItem: 'switch',
      text: t('Content.cdBuff.text'),
      content: t('Content.cdBuff.content', { sValuesCd: precisionRound(100 * sValuesCd[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.CD, (r.cdBuff) ? sValuesCd[s] : 0, x.source(SOURCE_LC))
    },
  }
}

export const NinjaRecordSoundHunt: LightConeConfig = {
  id: '22003',
  conditionals,
}
