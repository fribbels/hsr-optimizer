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
  index: 7,
  setType: SetType.RELIC,
  ingameId: '108',
  name: Sets.GeniusOfBrilliantStars,
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  conditionalI18nKey: 'Conditionals.Genius',
  modifiable: true,
  defaultValue: true,
} as const satisfies SetDisplay

const conditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    if (context.elementalDamageType == Stats.Quantum_DMG) {
      c.QUANTUM_DMG_BOOST.buff(0.10, Source.GeniusOfBrilliantStars)
    }
  },
  p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    x.buff(StatKey.DEF_PEN, setConditionals.enabledGeniusOfBrilliantStars ? 0.20 : 0.10, x.source(Source.GeniusOfBrilliantStars))
  },
  gpu: (action: OptimizerAction, context: OptimizerContext) => `
    if (relic4p(*p_sets, SET_GeniusOfBrilliantStars) >= 1) {
      ${buff.action(AKey.DEF_PEN, `select(0.10, 0.20, setConditionals.enabledGeniusOfBrilliantStars == true)`).wgsl(action, 2)}
    }
  `,
} as const satisfies SetConditionals

export const GeniusOfBrilliantStars = {
  id: 'GeniusOfBrilliantStars',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
