import {
  ConditionalDataType,
  Sets,
} from 'lib/constants/constants'
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
} from 'types/optimizer'
import {
  type SetConditionals,
  type SetConfig,
  type SetDisplay,
  type SetInfo,
  SetType,
} from 'types/setConfig'

const info = {
  index: 27,
  setType: SetType.ORNAMENT,
  ingameId: '328',
  twoPieceStatTag: null,
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  modifiable: false,
  defaultValue: true,
} as const satisfies SetDisplay

const conditionals: SetConditionals = {
  p2x: (x: ComputedStatsContainer, context: OptimizerContext) => {
    x.buff(StatKey.BOOST, calculateDmgBoost(context), x.source(Source.CosmicLifeSciencesInstitute))
  },
  gpu: (action: OptimizerAction, context: OptimizerContext) => `
    if (ornament2p(*p_sets, SET_CosmicLifeSciencesInstitute) >= 1) {
      ${buff.action(AKey.BOOST, calculateDmgBoost(context)).wgsl(action, 2)}
    }
  `,
}

function calculateDmgBoost(context: OptimizerContext) {
  return Math.min(0.32, Math.max(0, context.baseEnergy - 200) * 0.002)
}

export const CosmicLifeSciencesInstitute = {
  id: Sets.CosmicLifeSciencesInstitute,
  setKey: 'CosmicLifeSciencesInstitute',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
