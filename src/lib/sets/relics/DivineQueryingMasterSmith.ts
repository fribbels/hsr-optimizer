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
  conditionalType: ConditionalDataType.SELECT,
  selectionOptions: selectionOptions,
  modifiable: true,
  defaultValue: 2,
} as const satisfies SetDisplay

const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.HP_P.buff(0.12, Source.DivineQueryingMasterSmith)
  },
  p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    const value = setConditionals.valueDivineQueryingMasterSmith
    if (value >= 1) {
      x.buff(StatKey.CD_BOOST, 0.28, x.source(Source.DivineQueryingMasterSmith))
    }
    if (value >= 2) {
      x.buff(StatKey.DMG_BOOST, 0.15, x.targets(TargetTag.FullTeam).source(Source.DivineQueryingMasterSmith))
    }
  },
  gpuBasic: () => [
    basicP2(WgslStatName.HP_P, 0.12, DivineQueryingMasterSmith),
  ],
  gpu: (action: OptimizerAction, context: OptimizerContext) => `
    if (relic4p(*p_sets, SET_DivineQueryingMasterSmith) >= 1) {
      if (setConditionals.valueDivineQueryingMasterSmith >= 1) {
        ${buff.action(AKey.CD_BOOST, 0.28).wgsl(action, 2)}
      }
      if (setConditionals.valueDivineQueryingMasterSmith >= 2) {
        ${buff.action(AKey.DMG_BOOST, 0.15).targets(TargetTag.FullTeam).wgsl(action, 3)}
      }
    }
  `,
  teammate: [{
    value: Sets.DivineQueryingMasterSmith,
    label: () => '15% DMG',
    desc: () => '4 Piece: Divine-Querying Master Smith (+15% DMG)',
    nonstackable: true,
    effect: ({ x }) => {
      x.buff(StatKey.DMG_BOOST, 0.15, x.targets(TargetTag.FullTeam).source(Source.DivineQueryingMasterSmith))
    },
  }],
}

function selectionOptions(): SelectOptionContent[] {
  return [
    { display: 'Off', value: 0, label: 'Off' },
    { display: '1x', value: 1, label: 'DEF reduced: CD +28%' },
    { display: '2x', value: 2, label: 'DEF reduced: CD +28% + Comburent DMG +15%' },
  ]
}

export const DivineQueryingMasterSmith = {
  id: Sets.DivineQueryingMasterSmith,
  setKey: 'DivineQueryingMasterSmith',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
