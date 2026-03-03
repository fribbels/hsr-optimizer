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
  SetInfo,
  SetType,
} from 'types/setConfig'

const info = {
  index: 13,
  setType: SetType.RELIC,
  ingameId: '114',
  name: Sets.MessengerTraversingHackerspace,
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  conditionalI18nKey: 'Conditionals.Messenger',
  modifiable: true,
  defaultValue: false,
} as const satisfies SetDisplay

const conditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.SPD_P.buff(0.06, Source.MessengerTraversingHackerspace)
  },
  p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    if (setConditionals.enabledMessengerTraversingHackerspace && !x.config.teammateSetEffects[Sets.MessengerTraversingHackerspace]) {
      x.buff(StatKey.SPD_P, 0.12, x.targets(TargetTag.FullTeam).source(Source.MessengerTraversingHackerspace))
    }
  },
  gpu: (action: OptimizerAction, context: OptimizerContext) => `
    if (
      relic4p(*p_sets, SET_MessengerTraversingHackerspace) >= 1
      && setConditionals.enabledMessengerTraversingHackerspace == true
      && ${wgslFalse(action.config.teammateSetEffects[Sets.MessengerTraversingHackerspace])}
    ) {
      ${buff.action(AKey.SPD_P, 0.12).targets(TargetTag.FullTeam).wgsl(action, 2)}
    }
  `,
  teammate: [{
    value: Sets.MessengerTraversingHackerspace,
    label: (t) => t('TeammateSets.Messenger.Text'),
    desc: (t) => t('TeammateSets.Messenger.Desc'),
    nonstackable: true,
    effect: ({ x }) => {
      x.buff(StatKey.SPD_P, 0.12, x.targets(TargetTag.FullTeam).source(Source.MessengerTraversingHackerspace))
    },
  }],
} as const satisfies SetConditionals

export const MessengerTraversingHackerspace = {
  id: 'MessengerTraversingHackerspace',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
