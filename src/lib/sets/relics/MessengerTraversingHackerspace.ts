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
  index: 13,
  setType: SetType.RELIC,
  ingameId: '114',
  twoPieceStatTag: Stats.SPD_P,
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  conditionalI18nKey: 'Conditionals.Messenger',
  modifiable: true,
  defaultValue: false,
} as const satisfies SetDisplay

const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.SPD_P.buff(0.06, Source.MessengerTraversingHackerspace)
  },
  p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    if (setConditionals.enabledMessengerTraversingHackerspace && !x.config.teammateSetEffects[Sets.MessengerTraversingHackerspace]) {
      x.buff(StatKey.SPD_P, 0.12, x.targets(TargetTag.FullTeam).source(Source.MessengerTraversingHackerspace))
    }
  },
  gpuBasic: () => [
    basicP2(WgslStatName.SPD_P, 0.06, MessengerTraversingHackerspace),
  ],
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
}

export const MessengerTraversingHackerspace = {
  id: Sets.MessengerTraversingHackerspace,
  setKey: 'MessengerTraversingHackerspace',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
