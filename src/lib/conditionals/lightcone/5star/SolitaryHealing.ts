import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { DamageTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.SolitaryHealing')
  const { SOURCE_LC } = Source.lightCone('24003')

  const sValues = [0.24, 0.30, 0.36, 0.42, 0.48]

  const defaults = {
    postUltDotDmgBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    postUltDotDmgBuff: {
      lc: true,
      formItem: 'switch',
      id: 'postUltDotDmgBuff',
      text: t('Content.postUltDotDmgBuff.text'),
      content: t('Content.postUltDotDmgBuff.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.DMG_BOOST, (r.postUltDotDmgBuff) ? sValues[s] : 0, x.damageType(DamageTag.DOT).source(SOURCE_LC))
    },
  }
}
