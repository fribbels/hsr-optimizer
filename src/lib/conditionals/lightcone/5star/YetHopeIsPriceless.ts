import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject, FUA_TYPE, ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Stats } from 'lib/constants'
import { precisionRound } from 'lib/conditionals/utils'
import { buffAbilityDefShred, buffAbilityDmg } from 'lib/optimizer/calculateBuffs'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValuesFuaDmg = [0.12, 0.14, 0.16, 0.18, 0.20]
  const sValuesUltFuaDefShred = [0.20, 0.24, 0.28, 0.32, 0.36]

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'fuaDmgBoost',
      name: 'fuaDmgBoost',
      formItem: 'switch',
      text: 'CD to FUA DMG boost',
      title: 'CD to FUA DMG boost',
      content: `While the wearer is in battle, for every 20% CRIT DMG that exceeds 120%, the DMG dealt by follow-up 
      attack increases by ${precisionRound(sValuesFuaDmg[s] * 100)}%. This effect can stack up to 4 time(s).`,
    },
    {
      lc: true,
      id: 'ultFuaDefShred',
      name: 'ultFuaDefShred',
      formItem: 'switch',
      text: 'Ult / FUA DEF shred',
      title: 'Ult / FUA DEF shred',
      content: `When the battle starts or after the wearer uses their Basic ATK, enables Ultimate or the DMG dealt by 
      follow-up attack to ignore ${sValuesUltFuaDefShred[s] * 100}% of the target's DEF, lasting for 2 turn(s).`,
    },
  ]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      fuaDmgBoost: true,
      ultFuaDefShred: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      buffAbilityDefShred(x, ULT_TYPE | FUA_TYPE, sValuesUltFuaDefShred[s], (r.ultFuaDefShred))
    },
    calculatePassives: (/* c, request */) => {
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional, request: Form) => {
      const r = request.lightConeConditionals
      const x: ComputedStatsObject = c.x

      buffAbilityDmg(x, FUA_TYPE, sValuesFuaDmg[s] * Math.min(4, Math.floor(x[Stats.CD] - 1.20) / 0.20), (r.fuaDmgBoost))
    },
  }
}
