import { ConditionalDataType } from 'lib/constants/constants'
import { BasicStatsArray } from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { AKey, StatKey } from 'lib/optimization/engine/config/keys'
import { buff } from 'lib/optimization/engine/container/gpuBuffBuilder'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { TFunction } from 'i18next'
import {
  OptimizerAction,
  OptimizerContext,
  SetConditional,
} from 'types/optimizer'
import {
  SelectOptionContent,
  SetConditionals,
  SetConfig,
  SetDisplay,
  SetType,
} from 'types/setConfig'

type SetConditionalTFunction = TFunction<'optimizerTab', 'SetConditionals.SelectOptions'>

function selectionOptions(t: SetConditionalTFunction): SelectOptionContent[] {
  return Array.from({ length: 4 }).map((_val, i) => ({
    display: t('Prisoner.Display', { stackCount: i }),
    value: i,
    label: t('Prisoner.Label', { stackCount: i, buffValue: 6 * i }),
  }))
}

const conditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.ATK_P.buff(0.12, Source.PrisonerInDeepConfinement)
  },
  p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    x.buff(StatKey.DEF_PEN, 0.06 * setConditionals.valuePrisonerInDeepConfinement, x.source(Source.PrisonerInDeepConfinement))
  },
  gpu: (action: OptimizerAction, context: OptimizerContext) => `
    if (relic4p(*p_sets, SET_PrisonerInDeepConfinement) >= 1) {
      ${buff.action(AKey.DEF_PEN, `0.06 * f32(setConditionals.valuePrisonerInDeepConfinement)`).wgsl(action, 2)}
    }
  `,
} as const satisfies SetConditionals

const display = {
  conditionalType: ConditionalDataType.SELECT,
  conditionalI18nKey: 'Conditionals.Prisoner',
  selectionOptions: selectionOptions,
  modifiable: true,
  defaultValue: 0,
} as const satisfies SetDisplay

export const PrisonerInDeepConfinement = {
  id: 'PrisonerInDeepConfinement',
  info: {
    index: 15,
    setType: SetType.RELIC,
    ingameId: '116',
  },
  conditionals,
  display,
} as const satisfies SetConfig
