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
import { TargetTag } from 'lib/optimization/engine/config/tag'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { buff } from 'lib/optimization/engine/container/gpuBuffBuilder'
import {
  type OptimizerAction,
  type OptimizerContext,
  type SetConditional,
} from 'types/optimizer'
import {
  type SelectOptionContent,
  type SetConditionals,
  type SetConditionalTFunction,
  type SetConfig,
  type SetDisplay,
  type SetInfo,
  SetType,
} from 'types/setConfig'

const info = {
  index: 31,
  setType: SetType.RELIC,
  ingameId: '132',
  twoPieceStatTag: Stats.HP_P,
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  conditionalI18nKey: 'Conditionals.MasterSmith',
  modifiable: true,
  defaultValue: 1,
} as const satisfies SetDisplay

const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.HP_P.buff(0.12, Source.DivineQueryingMasterSmith)
  },
  p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    if (setConditionals.valueDivineQueryingMasterSmith) {
      x.buff(StatKey.CD_BOOST, 0.28, x.source(Source.DivineQueryingMasterSmith))
    }
  },
  p4t: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    if (setConditionals.valueDivineQueryingMasterSmith) {
      x.buff(StatKey.DMG_BOOST, 0.15, x.targets(TargetTag.FullTeam).source(Source.DivineQueryingMasterSmith))
    }
  },
  gpuBasic: () => [
    basicP2(WgslStatName.HP_P, 0.12, DivineQueryingMasterSmith),
  ],
  gpu: (action: OptimizerAction, context: OptimizerContext) => `
    if (relic4p(*p_sets, SET_DivineQueryingMasterSmith) >= 1 && setConditionals.valueDivineQueryingMasterSmith > 0) {
      ${buff.action(AKey.CD_BOOST, 0.28).wgsl(action, 2)}
    }
  `,
  teammate: [
    {
      value: 1,
      label: (t) => t('TeammateSets.MasterSmith.Text'),
      desc: (t) => t('TeammateSets.MasterSmith.Desc'),
      nonstackable: true,
      effect: ({ x }) => {
        x.buff(StatKey.DMG_BOOST, 0.15, x.targets(TargetTag.FullTeam).source(Source.DivineQueryingMasterSmith))
      },
    },
  ],
}

export const DivineQueryingMasterSmith = {
  id: Sets.DivineQueryingMasterSmith,
  setKey: 'DivineQueryingMasterSmith',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
