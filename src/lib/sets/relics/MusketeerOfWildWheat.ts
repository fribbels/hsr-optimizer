import {
  ConditionalDataType,
  Sets,
  Stats,
} from 'lib/constants/constants'
import { type BasicStatsArray, WgslStatName } from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { basicP2, basicP4 } from 'lib/gpu/injection/generateBasicSetEffects'
import { HKey, StatKey } from 'lib/optimization/engine/config/keys'
import { buff } from 'lib/optimization/engine/container/gpuBuffBuilder'
import { DamageTag } from 'lib/optimization/engine/config/tag'
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
  index: 1,
  setType: SetType.RELIC,
  ingameId: '102',
  twoPieceStatTag: Stats.ATK_P,
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  defaultValue: true,
} as const satisfies SetDisplay

const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.ATK_P.buff(0.12, Source.MusketeerOfWildWheat)
  },
  p4c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.SPD_P.buff(0.06, Source.MusketeerOfWildWheat)
  },
  p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    x.buff(StatKey.DMG_BOOST, 0.10, x.damageType(DamageTag.BASIC).source(Source.MusketeerOfWildWheat))
  },
  gpuBasic: () => [
    basicP2(WgslStatName.ATK_P, 0.12, MusketeerOfWildWheat),
    basicP4(WgslStatName.SPD_P, 0.06, MusketeerOfWildWheat),
  ],
  gpu: (action: OptimizerAction, context: OptimizerContext) => `
    if (relic4p(*p_sets, SET_MusketeerOfWildWheat) >= 1) {
      ${buff.hit(HKey.DMG_BOOST, 0.10).damageType(DamageTag.BASIC).wgsl(action, 2)}
    }
  `,
}

export const MusketeerOfWildWheat = {
  id: Sets.MusketeerOfWildWheat,
  setKey: 'MusketeerOfWildWheat',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
