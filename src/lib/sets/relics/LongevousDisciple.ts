import {
  ConditionalDataType,
  Sets,
} from 'lib/constants/constants'
import { BasicStatsArray } from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { AKey, StatKey } from 'lib/optimization/engine/config/keys'
import { buff } from 'lib/optimization/engine/container/gpuBuffBuilder'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  OptimizerAction,
  OptimizerContext,
  SetConditional,
} from 'types/optimizer'
import {
  SelectOptionContent,
  SetConditionalTFunction,
  SetConditionals,
  SetConfig,
  SetDisplay,
  SetInfo,
  SetType,
} from 'types/setConfig'

const info = {
  index: 12,
  setType: SetType.RELIC,
  ingameId: '113',
  name: Sets.LongevousDisciple,
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.SELECT,
  conditionalI18nKey: 'Conditionals.Longevous',
  selectionOptions: selectionOptions,
  modifiable: true,
  defaultValue: 2,
} as const satisfies SetDisplay

const conditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.HP_P.buff(0.12, Source.LongevousDisciple)
  },
  p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    x.buff(StatKey.CR, 0.08 * setConditionals.valueLongevousDisciple, x.source(Source.LongevousDisciple))
  },
  gpu: (action: OptimizerAction, context: OptimizerContext) => `
    if (relic4p(*p_sets, SET_LongevousDisciple) >= 1) {
      ${buff.action(AKey.CR, `0.08 * f32(setConditionals.valueLongevousDisciple)`).wgsl(action, 2)}
    }
  `,
} as const satisfies SetConditionals

function selectionOptions(t: SetConditionalTFunction): SelectOptionContent[] {
  return Array.from({ length: 3 }).map((_val, i) => ({
    display: t('Longevous.Display', { stackCount: i }),
    value: i,
    label: t('Longevous.Label', { stackCount: i, buffValue: 8 * i }),
  }))
}

export const LongevousDisciple = {
  id: 'LongevousDisciple',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
