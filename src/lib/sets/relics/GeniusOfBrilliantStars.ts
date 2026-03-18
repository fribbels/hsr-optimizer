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
  index: 7,
  setType: SetType.RELIC,
  ingameId: '108',
  twoPieceStatTag: null,
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  conditionalI18nKey: 'Conditionals.Genius',
  modifiable: true,
  defaultValue: true,
} as const satisfies SetDisplay

const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    if (context.elementalDamageType == Stats.Quantum_DMG) {
      c.QUANTUM_DMG_BOOST.buff(0.10, Source.GeniusOfBrilliantStars)
    }
  },
  p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    x.buff(StatKey.DEF_PEN, setConditionals.enabledGeniusOfBrilliantStars ? 0.20 : 0.10, x.source(Source.GeniusOfBrilliantStars))
  },
  gpuBasic: () => [
    basicP2(WgslStatName.QUANTUM_DMG_BOOST, 0.10, GeniusOfBrilliantStars),
  ],
  gpu: (action: OptimizerAction, context: OptimizerContext) => `
    if (relic4p(*p_sets, SET_GeniusOfBrilliantStars) >= 1) {
      ${buff.action(AKey.DEF_PEN, `select(0.10, 0.20, setConditionals.enabledGeniusOfBrilliantStars == true)`).wgsl(action, 2)}
    }
  `,
}

export const GeniusOfBrilliantStars = {
  id: Sets.GeniusOfBrilliantStars,
  setKey: 'GeniusOfBrilliantStars',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
