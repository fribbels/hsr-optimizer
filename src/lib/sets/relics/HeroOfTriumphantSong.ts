import {
  ConditionalDataType,
  Sets,
  Stats,
} from 'lib/constants/constants'
import { type BasicStatsArray, WgslStatName } from 'lib/optimization/basicStatsArray'
import { Source } from 'lib/optimization/buffSource'
import { basicP2 } from 'lib/gpu/injection/generateBasicSetEffects'
import { AKey, StatKey } from 'lib/optimization/engine/config/keys'
import { TargetTag } from 'lib/optimization/engine/config/tag'
import { buff } from 'lib/optimization/engine/container/gpuBuffBuilder'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
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
  index: 22,
  setType: SetType.RELIC,
  ingameId: '123',
  twoPieceStatTag: Stats.ATK_P,
} as const satisfies SetInfo

const display = {
  conditionalType: ConditionalDataType.BOOLEAN,
  conditionalI18nKey: 'Conditionals.Hero',
  modifiable: true,
  defaultValue: false,
} as const satisfies SetDisplay

const conditionals: SetConditionals = {
  p2c: (c: BasicStatsArray, context: OptimizerContext) => {
    c.ATK_P.buff(0.12, Source.HeroOfTriumphantSong)
  },
  p4x: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => {
    if (setConditionals.enabledHeroOfTriumphantSong) {
      x.buff(StatKey.SPD_P, 0.06, x.source(Source.HeroOfTriumphantSong))
      x.buff(StatKey.CD, 0.30, x.targets(TargetTag.SelfAndMemosprite).source(Source.HeroOfTriumphantSong))
    }
  },
  gpuBasic: () => [
    basicP2(WgslStatName.ATK_P, 0.12, HeroOfTriumphantSong),
  ],
  gpu: (action: OptimizerAction, context: OptimizerContext) => `
    if (
      relic4p(*p_sets, SET_HeroOfTriumphantSong) >= 1
      && setConditionals.enabledHeroOfTriumphantSong == true
    ) {
      ${buff.action(AKey.SPD_P, 0.06).wgsl(action, 2)}
      ${buff.action(AKey.CD, 0.30).targets(TargetTag.SelfAndMemosprite).wgsl(action, 2)}
    }
  `,
}

export const HeroOfTriumphantSong = {
  id: Sets.HeroOfTriumphantSong,
  setKey: 'HeroOfTriumphantSong',
  info,
  display,
  conditionals,
} as const satisfies SetConfig
