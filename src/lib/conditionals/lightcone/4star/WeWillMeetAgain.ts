import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { containerActionVal } from 'lib/gpu/injection/injectUtils'
import { wgsl, wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { AKey, StatKey } from 'lib/optimization/engine/config/keys'
import { SELF_ENTITY_INDEX } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { buff } from 'lib/optimization/engine/container/gpuBuffBuilder'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'

import { SuperImpositionLevel } from 'types/lightCone'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.WeWillMeetAgain')
  const { SOURCE_LC } = Source.lightCone('21029')

  const sValues = [0.48, 0.60, 0.72, 0.84, 0.96]

  const defaults = {
    extraDmgProc: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    extraDmgProc: {
      lc: true,
      id: 'extraDmgProc',
      formItem: 'switch',
      text: t('Content.extraDmgProc.text'),
      content: t('Content.extraDmgProc.content', { Multiplier: TsUtils.precisionRound(100 * sValues[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>
      const atk = x.getActionValueByIndex(StatKey.ATK, SELF_ENTITY_INDEX)

      x.buff(StatKey.BASIC_ADDITIONAL_DMG, ((r.extraDmgProc) ? sValues[s] : 0) * atk, x.source(SOURCE_LC))
      x.buff(StatKey.SKILL_ADDITIONAL_DMG, ((r.extraDmgProc) ? sValues[s] : 0) * atk, x.source(SOURCE_LC))
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      return wgsl`
if (${wgslTrue(r.extraDmgProc)}) {
  let atk = ${containerActionVal(SELF_ENTITY_INDEX, StatKey.ATK, action.config)};
  ${buff.action(AKey.BASIC_ADDITIONAL_DMG, `${sValues[s]} * atk`).wgsl(action)}
  ${buff.action(AKey.SKILL_ADDITIONAL_DMG, `${sValues[s]} * atk`).wgsl(action)}
}
      `
    },
  }
}
