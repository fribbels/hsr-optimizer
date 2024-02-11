import { baseComputedStatsObject } from 'lib/conditionals/constants'
import { basicRev, precisionRound, skillRev, talentRev, ultRev } from 'lib/conditionals/utils'
import { Stats } from 'lib/constants'
import { Eidolon } from 'types/Character'
import { CharacterConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'

export default (e: Eidolon): CharacterConditional => {
  const skillAtkBuffValue = skillRev(e, 0.80, 0.88)
  const ultCdBuffValue = skillRev(e, 0.65, 0.702)
  const ultCrBuffValue = skillRev(e, 0.28, 0.294)
  const talentAtkScaling = talentRev(e, 0.80, 0.88)

  const basicScaling = basicRev(e, 1.00, 1.10)
  const skillScaling = skillRev(e, 0, 0)
  const ultScaling = ultRev(e, 3.80, 4.104)

  // const skillRank = [[2, 0.4],[2, 0.44],[2, 0.48],[2, 0.52],[2, 0.56],[2, 0.6],[2, 0.65],[2, 0.7],[2, 0.75],[2, 0.8],[2, 0.84],[2, 0.88],[2, 0.92],[2, 0.96],[2, 1]];

  const content: ContentItem[] = [{
    formItem: 'switch',
    id: 'roaringBowstrings',
    name: 'roaringBowstrings',
    text: 'Roaring Bowstrings',
    title: `Roaring Bowstrings`,
    content: `When "Roaring Bowstrings" is active, the ATK of all allies increases by ${precisionRound(skillAtkBuffValue * 100)}%.
    ::BR::
    When "Roaring Bowstrings" is active, Yukong deals 30% more DMG to enemies.`,
  }, {
    formItem: 'switch',
    id: 'ultBuff',
    name: 'ultBuff',
    text: 'Ult buff',
    title: `Ult: Diving Kestrel`,
    content: `If "Roaring Bowstrings" is active on Yukong when her Ultimate is used, additionally increases all allies' CRIT Rate by ${precisionRound(ultCrBuffValue * 100)}% and CRIT DMG by ${precisionRound(ultCdBuffValue * 100)}%. At the same time, deals Imaginary DMG equal to ${precisionRound(ultScaling * 100)}% of Yukong's ATK to a single enemy.`,
  }, {
    formItem: 'switch',
    id: 'initialSpeedBuff',
    name: 'initialSpeedBuff',
    text: 'E1 Initial speed buff',
    title: 'E1 Initial speed buff',
    content: `E1: At the start of battle, increases the SPD of all allies by 10% for 2 turn(s).`,
    disabled: e < 1,
  }]

  return {

    content: () => content,
    defaults: () => ({
      roaringBowstringsActive: true,
      ultBuff: true,
      initialSpeedBuff: true,
    }),
    precomputeEffects: (request) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.ATK_P] += (r.roaringBowstringsActive) ? skillAtkBuffValue : 0
      x[Stats.CR] += (r.ultBuff && r.roaringBowstringsActive) ? ultCrBuffValue : 0
      x[Stats.CD] += (r.ultBuff && r.roaringBowstringsActive) ? ultCdBuffValue : 0
      x[Stats.SPD_P] += (e >= 1 && r.initialSpeedBuff) ? 0.10 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.BASIC_SCALING += talentAtkScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling

      // Boost
      x.ELEMENTAL_DMG += 0.12
      x.ELEMENTAL_DMG += (e >= 4 && r.roaringBowstringsActive) ? 0.30 : 0

      return x
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional) => {
      const x = c['x']

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
    },
  }
}
