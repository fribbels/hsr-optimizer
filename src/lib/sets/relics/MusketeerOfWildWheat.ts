import {
  ConditionalDataType,
  Sets,
} from 'lib/constants/constants'
import { BasicStatsArray } from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { HKey, StatKey } from 'lib/optimization/engine/config/keys'
import { buff } from 'lib/optimization/engine/container/gpuBuffBuilder'
import { DamageTag } from 'lib/optimization/engine/config/tag'
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
  index: 1,
  setType: SetType.RELIC,
  ingameId: '102',
  name: Sets.MusketeerOfWildWheat,
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  defaultValue: true,
} as const satisfies SetDisplay

const conditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.ATK_P.buff(0.12, Source.MusketeerOfWildWheat)
  },
  p4c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.SPD_P.buff(0.06, Source.MusketeerOfWildWheat)
  },
  p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    x.buff(StatKey.DMG_BOOST, 0.10, x.damageType(DamageTag.BASIC).source(Source.MusketeerOfWildWheat))
  },
  gpu: (action: OptimizerAction, context: OptimizerContext) => `
    if (relic4p(*p_sets, SET_MusketeerOfWildWheat) >= 1) {
      ${buff.hit(HKey.DMG_BOOST, 0.10).damageType(DamageTag.BASIC).wgsl(action, 2)}
    }
  `,
} as const satisfies SetConditionals

export const MusketeerOfWildWheat = {
  id: 'MusketeerOfWildWheat',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
