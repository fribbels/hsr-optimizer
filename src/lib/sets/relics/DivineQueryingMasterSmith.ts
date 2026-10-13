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
  type SetConditionalTFunction,
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
  defaultValue: 0,
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
      x.buff(StatKey.BOOST, 0.15, x.targets(TargetTag.FullTeam).source(Source.DivineQueryingMasterSmith))
    }
  },
  gpuBasic: () => [
    basicP2(WgslStatName.HP_P, 0.12, DivineQueryingMasterSmith),
  ],
  gpu: (action: OptimizerAction, context: OptimizerContext) => `
    if (relic4p(*p_sets, SET_DivineQueryingMasterSmith)) {
      if (setConditionals.valueDivineQueryingMasterSmith >= 1) {
        ${buff.action(AKey.CD_BOOST, 0.28).wgsl(action, 2)}
      }
      if (setConditionals.valueDivineQueryingMasterSmith >= 2) {
        ${buff.action(AKey.BOOST, 0.15).targets(TargetTag.FullTeam).wgsl(action, 3)}
      }
    }
  `,
  teammate: [{
    value: Sets.DivineQueryingMasterSmith,
    label: (t) => t('TeammateSets.DivineQueryingMasterSmith.Text'),
    desc: (t) => t('TeammateSets.DivineQueryingMasterSmith.Desc'),
    nonstackable: true,
    effect: ({ x }) => {
      x.buff(StatKey.BOOST, 0.15, x.targets(TargetTag.FullTeam).source(Source.DivineQueryingMasterSmith))
    },
  }],
}

function selectionOptions(t: SetConditionalTFunction): SelectOptionContent[] {
  return [
    { display: t('DivineQueryingMasterSmith.Off.Display'), value: 0, label: t('DivineQueryingMasterSmith.Off.Label') },
    { display: t('DivineQueryingMasterSmith.CD.Display'), value: 1, label: t('DivineQueryingMasterSmith.CD.Label') },
    { display: t('DivineQueryingMasterSmith.CDAndDmg.Display'), value: 2, label: t('DivineQueryingMasterSmith.CDAndDmg.Label') },
  ]
}

export const DivineQueryingMasterSmith = {
  id: Sets.DivineQueryingMasterSmith,
  setKey: 'DivineQueryingMasterSmith',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
