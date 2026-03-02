import {
  ConditionalDataType,
  Stats,
} from 'lib/constants/constants'
import { BasicStatsArray } from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  OptimizerContext,
  SetConditional,
} from 'types/optimizer'
import {
  SetConditionals,
  SetConfig,
  SetDisplay,
  SetType,
} from 'types/setConfig'

const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    if (context.elementalDamageType == Stats.Quantum_DMG) {
      c.QUANTUM_DMG_BOOST.buff(0.10, Source.GeniusOfBrilliantStars)
    }
  },
  p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    x.buff(StatKey.DEF_PEN, setConditionals.enabledGeniusOfBrilliantStars ? 0.20 : 0.10, x.source(Source.GeniusOfBrilliantStars))
  },
}

const display: SetDisplay = {
  conditionalType: ConditionalDataType.BOOLEAN,
  conditionalI18nKey: 'Conditionals.Genius',
  modifiable: true,
  defaultValue: true,
}

export const GeniusOfBrilliantStars: SetConfig = {
  id: 'GeniusOfBrilliantStars',
  info: {
    index: 7,
    setType: SetType.RELIC,
    ingameId: '108',
  },
  conditionals,
  display,
}
