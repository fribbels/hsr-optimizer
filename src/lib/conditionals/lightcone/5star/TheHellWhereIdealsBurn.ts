import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'
import i18next from "i18next";
import { CURRENT_DATA_VERSION } from "lib/constants/constants";

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  // const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.TheHellWhereIdealsBurn')
  const { SOURCE_LC } = Source.lightCone('23046')

  const sValuesAtk = [0.40, 0.50, 0.60, 0.70, 0.80]
  const sValuesAtkStacks = [0.10, 0.125, 0.15, 0.175, 0.20]

  const defaults = {
    spAtkBuff: true,
    atkBuffStacks: 4,
  }

  const content: ContentDefinition<typeof defaults> = {
    spAtkBuff: {
      lc: true,
      id: 'spAtkBuff',
      formItem: 'switch',
      text: 'SP ATK buff',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    atkBuffStacks: {
      lc: true,
      id: 'atkBuffStacks',
      formItem: 'slider',
      text: 'ATK buff stacks',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      min: 0,
      max: 4,
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.ATK_P.buff((r.spAtkBuff) ? sValuesAtk[s] : 0, SOURCE_LC)
      x.ATK_P.buff(r.atkBuffStacks * sValuesAtkStacks[s], SOURCE_LC)
    },
    finalizeCalculations: () => {
    },
  }
}
