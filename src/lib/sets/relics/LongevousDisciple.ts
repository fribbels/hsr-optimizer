import {
  ConditionalDataType,
  Sets,
  Stats,
} from 'lib/constants/constants'
import { basicP2 } from 'lib/gpu/injection/generateBasicSetEffects'
import {
  type BasicStatsArray,
  WgslStatName,
} from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import {
  AKey,
  StatKey,
} from 'lib/optimization/engine/config/keys'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { buff } from 'lib/optimization/engine/container/gpuBuffBuilder'
import {
  type OptimizerAction,
  type OptimizerContext,
  type SetConditional,
} from 'types/optimizer'
import {
  type SelectOptionContent,
  type SetConditionals,
  type SetConditionalTFunction,
  type SetConfig,
  type SetDisplay,
  type SetInfo,
  SetType,
} from 'types/setConfig'

const info = {
  index: 12,
  setType: SetType.RELIC,
  ingameId: '113',
  twoPieceStatTag: Stats.HP_P,
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.SELECT,
  conditionalI18nKey: 'Conditionals.Longevous',
  selectionOptions: selectionOptions,
  modifiable: true,
  defaultValue: 2,
} as const satisfies SetDisplay

const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.HP_P.buff(0.12, Source.LongevousDisciple)
  },
  p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    x.buff(StatKey.CR, 0.08 * setConditionals.valueLongevousDisciple, x.source(Source.LongevousDisciple))
  },
  gpuBasic: () => [
    basicP2(WgslStatName.HP_P, 0.12, LongevousDisciple),
  ],
  gpu: (action: OptimizerAction, context: OptimizerContext) => `
    if (relic4p(*p_sets, SET_LongevousDisciple) >= 1) {
      ${buff.action(AKey.CR, `0.08 * f32(setConditionals.valueLongevousDisciple)`).wgsl(action, 2)}
    }
  `,
}

function selectionOptions(t: SetConditionalTFunction): SelectOptionContent[] {
  return Array.from({ length: 3 }).map((_val, i) => ({
    display: t('Longevous.Display', { stackCount: i }),
    value: i,
    label: t('Longevous.Label', { stackCount: i, buffValue: 8 * i }),
  }))
}

export const LongevousDisciple = {
  id: Sets.LongevousDisciple,
  setKey: 'LongevousDisciple',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
