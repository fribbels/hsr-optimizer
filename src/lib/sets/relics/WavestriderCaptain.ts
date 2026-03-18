import {
  ConditionalDataType,
  Sets,
  Stats,
} from 'lib/constants/constants'
import { type BasicStatsArray, WgslStatName } from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { basicP2 } from 'lib/gpu/injection/generateBasicSetEffects'
import { AKey, StatKey } from 'lib/optimization/engine/config/keys'
import { buff } from 'lib/optimization/engine/container/gpuBuffBuilder'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  type OptimizerAction,
  type OptimizerContext,
  type SetConditional,
} from 'types/optimizer'
import {
  type SetConditionals,
  type SetConfig,
  type SetDisplay,
  type SetInfo,
  SetType,
} from 'types/setConfig'

const info = {
  index: 25,
  setType: SetType.RELIC,
  ingameId: '126',
  twoPieceStatTag: Stats.CD,
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  conditionalI18nKey: 'Conditionals.Wavestrider',
  modifiable: true,
  defaultValue: true,
} as const satisfies SetDisplay

const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.CD.buff(0.16, Source.WavestriderCaptain)
  },
  p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    if (setConditionals.enabledWavestriderCaptain) {
      x.buff(StatKey.ATK_P, 0.48, x.source(Source.WavestriderCaptain))
    }
  },
  gpuBasic: () => [
    basicP2(WgslStatName.CD, 0.16, WavestriderCaptain),
  ],
  gpu: (action: OptimizerAction, context: OptimizerContext) => `
    if (
      relic4p(*p_sets, SET_WavestriderCaptain) >= 1
      && setConditionals.enabledWavestriderCaptain == true
    ) {
      ${buff.action(AKey.ATK_P, 0.48).wgsl(action, 2)}
    }
  `,
}

export const WavestriderCaptain = {
  id: Sets.WavestriderCaptain,
  setKey: 'WavestriderCaptain',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
