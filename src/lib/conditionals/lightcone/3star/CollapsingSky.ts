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
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.CollapsingSky')
  const { SOURCE_LC } = Source.lightCone('20002')

  const sValues = [0.20, 0.25, 0.30, 0.35, 0.40]

  const defaults = {
    basicSkillDmgBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    basicSkillDmgBuff: {
      lc: true,
      formItem: 'switch',
      id: 'basicSkillDmgBuff',
      text: t('Content.basicSkillDmgBuff.text'),
      content: t('Content.basicSkillDmgBuff.content', { DmgBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.DMG_BOOST, (r.basicSkillDmgBuff) ? sValues[s] : 0, x.damageType(DamageTag.BASIC | DamageTag.SKILL).source(SOURCE_LC))
    },
  }
}
