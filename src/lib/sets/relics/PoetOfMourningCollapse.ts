import {
  ConditionalDataType,
  Sets,
  Stats,
} from 'lib/constants/constants'
import { BasicKey, type BasicStatsArray, WgslStatName } from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { basicP2, basicP4 } from 'lib/gpu/injection/generateBasicSetEffects'
import { AKey, StatKey } from 'lib/optimization/engine/config/keys'
import { TargetTag } from 'lib/optimization/engine/config/tag'
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
  index: 23,
  setType: SetType.RELIC,
  ingameId: '124',
  twoPieceStatTag: null,
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  modifiable: false,
  defaultValue: true,
} as const satisfies SetDisplay

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
  gpuBasic: () => [
    basicP2(WgslStatName.QUANTUM_DMG_BOOST, 0.10, PoetOfMourningCollapse),
    basicP4(WgslStatName.SPD_P, -0.08, PoetOfMourningCollapse),
  ],
  gpu: (action: OptimizerAction, context: OptimizerContext) => `
    if (relic4p(*p_sets, SET_PoetOfMourningCollapse) >= 1) {
      let crValue = select(0.0, 0.20, (*p_c).SPD < 110.0) + select(0.0, 0.12, (*p_c).SPD < 95.0);
      ${buff.action(AKey.CR, 'crValue').targets(TargetTag.SelfAndMemosprite).wgsl(action, 2)}
    }
  `,
}

export const PoetOfMourningCollapse = {
  id: Sets.PoetOfMourningCollapse,
  setKey: 'PoetOfMourningCollapse',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
