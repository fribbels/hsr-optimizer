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
  type SetConditionals,
  type SetConfig,
  type SetDisplay,
  type SetInfo,
  SetType,
} from 'types/setConfig'

const info = {
  index: 8,
  setType: SetType.RELIC,
  ingameId: '109',
  twoPieceStatTag: null,
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  conditionalI18nKey: 'Conditionals.Thunder',
  modifiable: true,
  defaultValue: true,
} as const satisfies SetDisplay

const conditionals: SetConditionals = {
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
  gpuBasic: () => [
    basicP2(WgslStatName.LIGHTNING_DMG_BOOST, 0.10, BandOfSizzlingThunder),
  ],
  gpu: (action: OptimizerAction, context: OptimizerContext) => `
    if (
      relic4p(*p_sets, SET_BandOfSizzlingThunder) >= 1
      && setConditionals.enabledBandOfSizzlingThunder == true
    ) {
      ${buff.action(AKey.ATK_P, 0.20).wgsl(action, 2)}
    }
  `,
}

export const BandOfSizzlingThunder = {
  id: Sets.BandOfSizzlingThunder,
  setKey: 'BandOfSizzlingThunder',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
