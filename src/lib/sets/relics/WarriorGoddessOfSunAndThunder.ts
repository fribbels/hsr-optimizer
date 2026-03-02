import {
  ConditionalDataType,
  Sets,
} from 'lib/constants/constants'
import { BasicStatsArray } from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { TargetTag } from 'lib/optimization/engine/config/tag'
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
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.SPD_P.buff(0.06, Source.WarriorGoddessOfSunAndThunder)
  },
  p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    if (setConditionals.enabledWarriorGoddessOfSunAndThunder) {
      x.buff(StatKey.SPD_P, 0.06, x.source(Source.WarriorGoddessOfSunAndThunder))
      if (!x.config.teammateSetEffects[Sets.WarriorGoddessOfSunAndThunder]) {
        x.buff(StatKey.CD, 0.15, x.targets(TargetTag.FullTeam).source(Source.WarriorGoddessOfSunAndThunder))
      }
    }
  },
}

const display: SetDisplay = {
  conditionalType: ConditionalDataType.BOOLEAN,
  conditionalI18nKey: 'Conditionals.WarriorGoddess',
  modifiable: true,
  defaultValue: false,
}

export const WarriorGoddessOfSunAndThunder: SetConfig = {
  id: 'WarriorGoddessOfSunAndThunder',
  info: {
    index: 24,
    setType: SetType.RELIC,
    ingameId: '125',
  },
  conditionals,
  display,
  teammate: [{
    value: Sets.WarriorGoddessOfSunAndThunder,
    i18nKey: 'Warrior',
    nonstackable: true,
    effect: ({ x }) => {
      x.buff(StatKey.CD, 0.15, x.targets(TargetTag.FullTeam).source(Source.WarriorGoddessOfSunAndThunder))
    },
  }],
}
