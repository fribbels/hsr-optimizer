import {
  ConditionalDataType,
  Sets,
  Stats,
} from 'lib/constants/constants'
import { basicP2 } from 'lib/gpu/injection/generateBasicSetEffects'
import { wgslFalse } from 'lib/gpu/injection/wgslUtils'
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
  type SetConditionals,
  type SetConfig,
  type SetDisplay,
  type SetInfo,
  SetType,
} from 'types/setConfig'

const info = {
  index: 17,
  setType: SetType.RELIC,
  ingameId: '118',
  twoPieceStatTag: Stats.BE,
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  conditionalI18nKey: 'Conditionals.Watchmaker',
  modifiable: true,
  defaultValue: false,
} as const satisfies SetDisplay

const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.BE.buff(0.16, Source.WatchmakerMasterOfDreamMachinations)
  },
  p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    if (setConditionals.enabledWatchmakerMasterOfDreamMachinations && !x.config.teammateSetEffects[Sets.WatchmakerMasterOfDreamMachinations]) {
      x.buff(StatKey.BE, 0.30, x.targets(TargetTag.FullTeam).source(Source.WatchmakerMasterOfDreamMachinations))
    }
  },
  gpuBasic: () => [
    basicP2(WgslStatName.BE, 0.16, WatchmakerMasterOfDreamMachinations),
  ],
  gpu: (action: OptimizerAction, context: OptimizerContext) => `
    if (
      relic4p(*p_sets, SET_WatchmakerMasterOfDreamMachinations) >= 1
      && setConditionals.enabledWatchmakerMasterOfDreamMachinations == true
      && ${wgslFalse(action.config.teammateSetEffects[Sets.WatchmakerMasterOfDreamMachinations])}
    ) {
      ${buff.action(AKey.BE, 0.30).targets(TargetTag.FullTeam).wgsl(action, 2)}
    }
  `,
  teammate: [{
    value: Sets.WatchmakerMasterOfDreamMachinations,
    label: (t) => t('TeammateSets.Watchmaker.Text'),
    desc: (t) => t('TeammateSets.Watchmaker.Desc'),
    nonstackable: true,
    effect: ({ x }) => {
      x.buff(StatKey.BE, 0.30, x.targets(TargetTag.FullTeam).source(Source.WatchmakerMasterOfDreamMachinations))
    },
  }],
}

export const WatchmakerMasterOfDreamMachinations = {
  id: Sets.WatchmakerMasterOfDreamMachinations,
  setKey: 'WatchmakerMasterOfDreamMachinations',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
