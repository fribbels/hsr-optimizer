import { Stats } from 'lib/constants'
import { baseComputedStatsObject, ComputedStatsObject } from 'lib/conditionals/conditionalConstants.ts'
import { AbilityEidolon, precisionRound } from 'lib/conditionals/utils'

import { Eidolon } from 'types/Character'
import { CharacterConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { ContentItem } from 'types/Conditionals'

// TODO: missing A4 SPD buff
export default (e: Eidolon): CharacterConditional => {
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

  const extraPenValue = talent(e, 0.36, 0.396)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.60, 2.86)
  const ultScaling = ult(e, 4.00, 4.32)
  const ultExtraScaling = ult(e, 1.20, 1.296)

  const content: ContentItem[] = [
    {
      formItem: 'switch',
      id: 'talentPenBuff',
      name: 'talentPenBuff',
      text: 'Talent RES PEN buff',
      title: 'Talent RES PEN buff',
      content: `When Dan Heng is the target of an ally's Ability, his next attack's Wind RES PEN increases by ${precisionRound(extraPenValue * 100)}%.`,
    },
    {
      formItem: 'switch',
      id: 'enemySlowed',
      name: 'enemySlowed',
      text: 'Enemy slowed',
      title: 'Enemy slowed',
      content: `Basic ATK deals 40% more damage to Slowed enemies.`,
    },
    {
      formItem: 'switch',
      id: 'e1EnemyHp50',
      name: 'e1EnemyHp50',
      text: 'E1 enemy HP ≥ 50% CR boost',
      title: 'E1: The Higher You Fly, the Harder You Fall',
      content: `When the target enemy's current HP percentage is greater than or equal to 50%, CRIT Rate increases by 12%.`,
      disabled: e < 1,
    },
  ]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      talentPenBuff: true,
      enemySlowed: true,
      e1EnemyHp50: true,
    }),
    teammateDefaults: () => ({
    }),
    precomputeEffects: (request: Form) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.CR] += (e >= 1 && r.e1EnemyHp50) ? 0.12 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling
      x.ULT_SCALING += (r.enemySlowed) ? ultExtraScaling : 0

      // Boost
      x.BASIC_BOOST += (r.enemySlowed) ? 0.40 : 0
      x.RES_PEN += (r.talentPenBuff) ? extraPenValue : 0

      return x
    },
    precomputeMutualEffects: (_x: ComputedStatsObject, _request: Form) => {
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional) => {
      const x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
    },
  }
}
