import {
  ConditionalDataType,
  Sets,
  Stats,
} from 'lib/constants/constants'
import { BasicStatsArray } from 'lib/optimization/basicStatsArray'
import { BasicKey } from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { AKey, StatKey } from 'lib/optimization/engine/config/keys'
import { TargetTag } from 'lib/optimization/engine/config/tag'
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
  setType: SetType.RELIC,
  ingameId: '124',
  name: Sets.PoetOfMourningCollapse,
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  modifiable: false,
  defaultValue: true,
} as const satisfies SetDisplay

const conditionals = {
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
  gpu: (action: OptimizerAction, context: OptimizerContext) => `
    if (relic4p(*p_sets, SET_PoetOfMourningCollapse) >= 1) {
      let crValue = select(0.0, 0.20, (*p_c).SPD < 110.0) + select(0.0, 0.12, (*p_c).SPD < 95.0);
      ${buff.action(AKey.CR, 'crValue').targets(TargetTag.SelfAndMemosprite).wgsl(action, 2)}
    }
  `,
} as const satisfies SetConditionals

export const PoetOfMourningCollapse = {
  id: 'PoetOfMourningCollapse',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
