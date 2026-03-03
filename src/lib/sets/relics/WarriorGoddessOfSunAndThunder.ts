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
  index: 24,
  setType: SetType.RELIC,
  ingameId: '125',
  name: Sets.WarriorGoddessOfSunAndThunder,
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  conditionalI18nKey: 'Conditionals.WarriorGoddess',
  modifiable: true,
  defaultValue: false,
} as const satisfies SetDisplay

const conditionals = {
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
  gpu: (action: OptimizerAction, context: OptimizerContext) => `
    if (
      relic4p(*p_sets, SET_WarriorGoddessOfSunAndThunder) >= 1
      && setConditionals.enabledWarriorGoddessOfSunAndThunder == true
    ) {
      ${buff.action(AKey.SPD_P, 0.06).wgsl(action, 4)}
      if (${wgslFalse(action.config.teammateSetEffects[Sets.WarriorGoddessOfSunAndThunder])}) {
        ${buff.action(AKey.CD, 0.15).targets(TargetTag.FullTeam).wgsl(action, 2)}
      }
    }
  `,
  teammate: [{
    value: Sets.WarriorGoddessOfSunAndThunder,
    label: (t) => t('TeammateSets.Warrior.Text'),
    desc: (t) => t('TeammateSets.Warrior.Desc'),
    nonstackable: true,
    effect: ({ x }) => {
      x.buff(StatKey.CD, 0.15, x.targets(TargetTag.FullTeam).source(Source.WarriorGoddessOfSunAndThunder))
    },
  }],
} as const satisfies SetConditionals

export const WarriorGoddessOfSunAndThunder = {
  id: 'WarriorGoddessOfSunAndThunder',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
