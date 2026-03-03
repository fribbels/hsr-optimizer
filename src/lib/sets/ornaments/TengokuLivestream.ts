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
  SetConditionals,
  SetConfig,
  SetDisplay,
  SetInfo,
  SetType,
} from 'types/setConfig'

const info = {
  index: 23,
  setType: SetType.ORNAMENT,
  ingameId: '324',
  name: Sets.TengokuLivestream,
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  conditionalI18nKey: 'Conditionals.Tengoku',
  modifiable: true,
  defaultValue: false,
} as const satisfies SetDisplay

const conditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.CD.buff(0.16, Source.TengokuLivestream)
  },
  p2x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    if (setConditionals.enabledTengokuLivestream) {
      x.buff(StatKey.CD, 0.32, x.source(Source.TengokuLivestream))
    }
  },
  gpu: (action: OptimizerAction, context: OptimizerContext) => `
    if (
      ornament2p(*p_sets, SET_TengokuLivestream) >= 1
      && setConditionals.enabledTengokuLivestream == true
    ) {
      ${buff.action(AKey.CD, 0.32).wgsl(action, 2)}
    }
  `,
} as const satisfies SetConditionals

export const TengokuLivestream = {
  id: 'TengokuLivestream',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
