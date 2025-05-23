import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'
import i18next from "i18next";
import { CURRENT_DATA_VERSION } from "lib/constants/constants";

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  // const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.JourneyForeverPeaceful')
  const { SOURCE_LC } = Source.lightCone('21057')

  const sValuesMemoCd = [0.24, 0.30, 0.36, 0.42, 0.48]

  const defaults = {
    memoCdBoost: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    memoCdBoost: {
      lc: true,
      id: 'memoCdBoost',
      formItem: 'switch',
      text: 'Memo CD boost',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.CD_BOOST.buffMemo(r.memoCdBoost ? sValuesMemoCd[s] : 0, SOURCE_LC)
    },
    finalizeCalculations: () => {
    },
  }
}
