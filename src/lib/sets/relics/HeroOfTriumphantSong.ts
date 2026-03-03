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
  index: 22,
  setType: SetType.RELIC,
  ingameId: '123',
  name: Sets.HeroOfTriumphantSong,
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  conditionalI18nKey: 'Conditionals.Hero',
  modifiable: true,
  defaultValue: false,
} as const satisfies SetDisplay

const conditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.ATK_P.buff(0.12, Source.HeroOfTriumphantSong)
  },
  p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    if (setConditionals.enabledHeroOfTriumphantSong) {
      x.buff(StatKey.SPD_P, 0.06, x.source(Source.HeroOfTriumphantSong))
      x.buff(StatKey.CD, 0.30, x.targets(TargetTag.SelfAndMemosprite).source(Source.HeroOfTriumphantSong))
    }
  },
  gpu: (action: OptimizerAction, context: OptimizerContext) => `
    if (
      relic4p(*p_sets, SET_HeroOfTriumphantSong) >= 1
      && setConditionals.enabledHeroOfTriumphantSong == true
    ) {
      ${buff.action(AKey.SPD_P, 0.06).wgsl(action, 2)}
      ${buff.action(AKey.CD, 0.30).targets(TargetTag.SelfAndMemosprite).wgsl(action, 2)}
    }
  `,
} as const satisfies SetConditionals

export const HeroOfTriumphantSong = {
  id: 'HeroOfTriumphantSong',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
