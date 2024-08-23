import { ContentItem } from 'types/Conditionals'
import { Stats } from 'lib/constants'
import { SuperImpositionLevel } from 'types/LightCone'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import getContentFromLCRanks from '../getContentFromLCRank'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const sValuesSpd = [0.08, 0.09, 0.10, 0.11, 0.12]
  const sValuesDmg = [0.12, 0.15, 0.18, 0.21, 0.24]
  const lcRanks = {
    id: '21024',
    skill: 'Stave Off the Lingering Cold',
    desc: "After entering battle, increases the wearer's SPD by #1[i]% and DMG by #2[i]%. When the wearer takes DMG, this effect will disappear. This effect will resume after the end of the wearer's next turn.",
    params: [
      [0.08, 0.12],
      [0.09, 0.15],
      [0.1, 0.18],
      [0.11, 0.21],
      [0.12, 0.24],
    ],
    properties: [
      [], [], [], [], [],
    ],
  }
  const content: ContentItem[] = [{
    lc: true,
    id: 'spdDmgBuff',
    name: 'spdDmgBuff',
    formItem: 'switch',
    text: 'SPD / DMG buff active',
    title: lcRanks.skill,
    content: getContentFromLCRanks(s, lcRanks),
  }]

  return {
    content: () => content,
    defaults: () => ({
      spdDmgBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.SPD_P] += (r.spdDmgBuff) ? sValuesSpd[s] : 0
      x.ELEMENTAL_DMG += (r.spdDmgBuff) ? sValuesDmg[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
