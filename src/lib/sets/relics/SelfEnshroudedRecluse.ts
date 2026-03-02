import {
  ConditionalDataType,
  Sets,
} from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  OutputTag,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
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
  p2x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    x.buff(StatKey.DMG_BOOST, 0.10, x.outputType(OutputTag.SHIELD).source(Source.SelfEnshroudedRecluse))
  },
  p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    x.buff(StatKey.DMG_BOOST, 0.12, x.outputType(OutputTag.SHIELD).source(Source.SelfEnshroudedRecluse))
    if (setConditionals.enabledSelfEnshroudedRecluse && !x.config.teammateSetEffects[Sets.SelfEnshroudedRecluse]) {
      x.buff(StatKey.CD, 0.15, x.targets(TargetTag.FullTeam).source(Source.SelfEnshroudedRecluse))
    }
  },
}

const display: SetDisplay = {
  conditionalType: ConditionalDataType.BOOLEAN,
  conditionalI18nKey: 'Conditionals.Recluse',
  modifiable: true,
  defaultValue: true,
}

export const SelfEnshroudedRecluse: SetConfig = {
  id: 'SelfEnshroudedRecluse',
  info: {
    index: 27,
    setType: SetType.RELIC,
    ingameId: '128',
  },
  conditionals,
  display,
  teammate: [{
    value: Sets.SelfEnshroudedRecluse,
    i18nKey: 'SelfEnshrouded',
    nonstackable: false,
    effect: ({ x }) => {
      x.buff(StatKey.CD, 0.15, x.targets(TargetTag.FullTeam).source(Source.SelfEnshroudedRecluse))
    },
  }],
}
