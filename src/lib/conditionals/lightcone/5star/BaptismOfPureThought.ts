import { SuperImpositionLevel } from 'types/LightCone'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import getContentFromLCRanks from '../getContentFromLCRank'
import { ContentItem } from 'types/Conditionals'
import { ComputedStatsObject, FUA_TYPE } from 'lib/conditionals/conditionalConstants'
import { Stats } from 'lib/constants'
import { buffAbilityDefPen } from 'lib/optimizer/calculateBuffs'

const lcRank = {
  id: '23020',
  skill: 'Mental Training',
  desc: "For every debuff on the enemy target, the wearer's CRIT DMG dealt against this target increases by #2[i]%, stacking up to #3[i] times.",
  params: [
    [0.2, 0.08, 3, 0.36, 0.24, 2],
    [0.23, 0.09, 3, 0.42, 0.28, 2],
    [0.26, 0.1, 3, 0.48, 0.32, 2],
    [0.29, 0.11, 3, 0.54, 0.36, 2],
    [0.32, 0.12, 3, 0.6, 0.4, 2],
  ],
  properties: [
    [{ type: 'CriticalDamageBase', value: 0.2 }],
    [{ type: 'CriticalDamageBase', value: 0.23 }],
    [{ type: 'CriticalDamageBase', value: 0.26 }],
    [{ type: 'CriticalDamageBase', value: 0.29 }],
    [{ type: 'CriticalDamageBase', value: 0.32 }],
  ],
}
const lcRank2 = {
  ...lcRank,
  desc: "When using Ultimate to attack the enemy target, the wearer receives the Disputation effect, which increases DMG dealt by #4[i]% and enables their follow-up attacks to ignore #5[i]% of the target's DEF. This effect lasts for #6[i] turns.",
}

const BaptismOfPureThought = (s: SuperImpositionLevel): LightConeConditional => {
  const sValuesCd = [0.08, 0.09, 0.10, 0.11, 0.12]
  const sValuesDmg = [0.36, 0.42, 0.48, 0.54, 0.60]
  const sValuesFuaPen = [0.24, 0.28, 0.32, 0.36, 0.40]

  const content: ContentItem[] = [{
    lc: true,
    formItem: 'slider',
    id: 'debuffCdStacks',
    name: 'debuffCdStacks',
    text: 'Debuff crit dmg stacks',
    title: lcRank.skill,
    content: getContentFromLCRanks(s, lcRank),
    min: 0,
    max: 3,
  }, {
    lc: true,
    formItem: 'switch',
    id: 'postUltBuff',
    name: 'postUltBuff',
    text: 'Disputation ult CD / FUA DEF PEN buff',
    title: lcRank2.skill,
    content: getContentFromLCRanks(s, lcRank2),
  }]

  return {
    content: () => content,
    defaults: () => ({
      debuffCdStacks: 3,
      postUltBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.CD] += r.debuffCdStacks * sValuesCd[s]
      x.ELEMENTAL_DMG += r.postUltBuff ? sValuesDmg[s] : 0

      buffAbilityDefPen(x, FUA_TYPE, sValuesFuaPen[s], (r.postUltBuff))
    },
    finalizeCalculations: () => {
    },
  }
}

export default BaptismOfPureThought
