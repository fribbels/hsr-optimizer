import {
  ConditionalDataType,
  Sets,
} from 'lib/constants/constants'
import { wgslFalse } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import {
  AKey,
  HKey,
  StatKey,
} from 'lib/optimization/engine/config/keys'
import {
  OutputTag,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
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
  index: 27,
  setType: SetType.RELIC,
  ingameId: '128',
  twoPieceStatTag: null,
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  conditionalI18nKey: 'Conditionals.Recluse',
  modifiable: true,
  defaultValue: true,
} as const satisfies SetDisplay

const conditionals: SetConditionals = {
  p2x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    x.buff(StatKey.DMG_BOOST, 0.10, x.outputType(OutputTag.SHIELD).source(Source.SelfEnshroudedRecluse))
  },
  p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    x.buff(StatKey.DMG_BOOST, 0.12, x.outputType(OutputTag.SHIELD).source(Source.SelfEnshroudedRecluse))
    if (setConditionals.enabledSelfEnshroudedRecluse && !x.config.teammateSetEffects[Sets.SelfEnshroudedRecluse]) {
      x.buff(StatKey.CD, 0.15, x.targets(TargetTag.FullTeam).source(Source.SelfEnshroudedRecluse))
    }
  },
  gpu: (action: OptimizerAction, context: OptimizerContext) => `
    if (relic2p(*p_sets, SET_SelfEnshroudedRecluse) >= 1) {
      ${buff.hit(HKey.DMG_BOOST, 0.10).outputType(OutputTag.SHIELD).wgsl(action, 2)}
      if (relic4p(*p_sets, SET_SelfEnshroudedRecluse) >= 1) {
        ${buff.hit(HKey.DMG_BOOST, 0.12).outputType(OutputTag.SHIELD).wgsl(action, 3)}
        if (setConditionals.enabledSelfEnshroudedRecluse == true && ${wgslFalse(action.config.teammateSetEffects[Sets.SelfEnshroudedRecluse])}) {
          ${buff.action(AKey.CD, 0.15).targets(TargetTag.FullTeam).wgsl(action, 4)}
        }
      }
    }
  `,
  teammate: [{
    value: Sets.SelfEnshroudedRecluse,
    label: (t) => t('TeammateSets.SelfEnshrouded.Text'),
    desc: (t) => t('TeammateSets.SelfEnshrouded.Desc'),
    nonstackable: false,
    effect: ({ x }) => {
      x.buff(StatKey.CD, 0.15, x.targets(TargetTag.FullTeam).source(Source.SelfEnshroudedRecluse))
    },
  }],
}

export const SelfEnshroudedRecluse = {
  id: Sets.SelfEnshroudedRecluse,
  setKey: 'SelfEnshroudedRecluse',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
