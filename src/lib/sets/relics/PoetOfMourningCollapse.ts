import {
  ConditionalDataType,
  Stats,
} from 'lib/constants/constants'
import { BasicStatsArray } from 'lib/optimization/basicStatsArray'
import { BasicKey } from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { TargetTag } from 'lib/optimization/engine/config/tag'
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
      c.QUANTUM_DMG_BOOST.buff(0.10, Source.PoetOfMourningCollapse)
    }
  },
  p4c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.SPD_P.buff(-0.08, Source.PoetOfMourningCollapse)
  },
  p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    const spd = x.c.a[BasicKey.SPD]
    x.buff(StatKey.CR, (spd < 110 ? 0.20 : 0) + (spd < 95 ? 0.12 : 0), x.targets(TargetTag.SelfAndMemosprite).source(Source.PoetOfMourningCollapse))
  },
}

const display: SetDisplay = {
  conditionalType: ConditionalDataType.BOOLEAN,
  modifiable: false,
  defaultValue: true,
}

export const PoetOfMourningCollapse: SetConfig = {
  id: 'PoetOfMourningCollapse',
  info: {
    index: 23,
    setType: SetType.RELIC,
    ingameId: '124',
  },
  conditionals,
  display,
}
