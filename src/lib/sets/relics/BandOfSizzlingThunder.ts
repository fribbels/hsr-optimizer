import {
  ConditionalDataType,
  Sets,
  Stats,
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
  index: 8,
  setType: SetType.RELIC,
  ingameId: '109',
  name: Sets.BandOfSizzlingThunder,
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  conditionalI18nKey: 'Conditionals.Thunder',
  modifiable: true,
  defaultValue: true,
} as const satisfies SetDisplay

const conditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    if (context.elementalDamageType == Stats.Lightning_DMG) {
      c.LIGHTNING_DMG_BOOST.buff(0.10, Source.BandOfSizzlingThunder)
    }
  },
  p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    if (setConditionals.enabledBandOfSizzlingThunder) {
      x.buff(StatKey.ATK_P, 0.20, x.source(Source.BandOfSizzlingThunder))
    }
  },
  gpu: (action: OptimizerAction, context: OptimizerContext) => `
    if (
      relic4p(*p_sets, SET_BandOfSizzlingThunder) >= 1
      && setConditionals.enabledBandOfSizzlingThunder == true
    ) {
      ${buff.action(AKey.ATK_P, 0.20).wgsl(action, 2)}
    }
  `,
} as const satisfies SetConditionals

export const BandOfSizzlingThunder = {
  id: 'BandOfSizzlingThunder',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
