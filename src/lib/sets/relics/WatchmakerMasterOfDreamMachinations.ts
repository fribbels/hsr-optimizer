import {
  ConditionalDataType,
  Sets,
} from 'lib/constants/constants'
import { BasicStatsArray } from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { AKey, StatKey } from 'lib/optimization/engine/config/keys'
import { TargetTag } from 'lib/optimization/engine/config/tag'
import { buff } from 'lib/optimization/engine/container/gpuBuffBuilder'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { wgslFalse } from 'lib/gpu/injection/wgslUtils'
import {
  OptimizerAction,
  OptimizerContext,
  SetConditional,
} from 'types/optimizer'
import {
  SetConditionals,
  SetConfig,
  SetDisplay,
  SetType,
  TeammateOption,
} from 'types/setConfig'

const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.BE.buff(0.16, Source.WatchmakerMasterOfDreamMachinations)
  },
  p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    if (setConditionals.enabledWatchmakerMasterOfDreamMachinations && !x.config.teammateSetEffects[Sets.WatchmakerMasterOfDreamMachinations]) {
      x.buff(StatKey.BE, 0.30, x.targets(TargetTag.FullTeam).source(Source.WatchmakerMasterOfDreamMachinations))
    }
  },
  gpu: (action: OptimizerAction, context: OptimizerContext) => `
    if (
      relic4p(*p_sets, SET_WatchmakerMasterOfDreamMachinations) >= 1
      && setConditionals.enabledWatchmakerMasterOfDreamMachinations == true
      && ${wgslFalse(action.config.teammateSetEffects[Sets.WatchmakerMasterOfDreamMachinations])}
    ) {
      ${buff.action(AKey.BE, 0.30).targets(TargetTag.FullTeam).wgsl(action, 2)}
    }
  `,
}

const display: SetDisplay = {
  conditionalType: ConditionalDataType.BOOLEAN,
  conditionalI18nKey: 'Conditionals.Watchmaker',
  modifiable: true,
  defaultValue: false,
}

export const WatchmakerMasterOfDreamMachinations: SetConfig = {
  id: 'WatchmakerMasterOfDreamMachinations',
  info: {
    index: 17,
    setType: SetType.RELIC,
    ingameId: '118',
  },
  conditionals,
  display,
  teammate: [{
    value: Sets.WatchmakerMasterOfDreamMachinations,
    i18nKey: 'Watchmaker',
    nonstackable: true,
    effect: ({ x }) => {
      x.buff(StatKey.BE, 0.30, x.targets(TargetTag.FullTeam).source(Source.WatchmakerMasterOfDreamMachinations))
    },
  }],
}
