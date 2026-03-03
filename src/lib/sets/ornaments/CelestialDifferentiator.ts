import {
  ConditionalDataType,
  Sets,
} from 'lib/constants/constants'
import {
  BasicKey,
  BasicStatsArray,
} from 'lib/optimization/basicStatsArray'
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
  index: 4,
  setType: SetType.ORNAMENT,
  ingameId: '305',
  name: Sets.CelestialDifferentiator,
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  conditionalI18nKey: 'Conditionals.Differentiator',
  modifiable: true,
  defaultValue: false,
} as const satisfies SetDisplay

const conditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.CD.buff(0.16, Source.CelestialDifferentiator)
  },
  p2x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    if (setConditionals.enabledCelestialDifferentiator && x.c.a[BasicKey.CD] >= 1.20) {
      x.buff(StatKey.CR, 0.60, x.source(Source.CelestialDifferentiator))
    }
  },
  gpu: (action: OptimizerAction, context: OptimizerContext) => `
    if (
      ornament2p(*p_sets, SET_CelestialDifferentiator) >= 1
      && setConditionals.enabledCelestialDifferentiator == true
      && (*p_c).CD >= 1.20
    ) {
      ${buff.action(AKey.CR, 0.60).wgsl(action, 2)}
    }
  `,
} as const satisfies SetConditionals

export const CelestialDifferentiator = {
  id: 'CelestialDifferentiator',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
