import { Stats } from 'lib/constants'
import { baseComputedStatsObject, ComputedStatsObject } from 'lib/conditionals/conditionalConstants.ts'
import { AbilityEidolon, findContentId } from 'lib/conditionals/utils'

import { Eidolon } from 'types/Character'
import { CharacterConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { ContentItem } from 'types/Conditionals'

const betaUpdate = 'All calculations are subject to change. Last updated 04-08-2024.'

export default (e: Eidolon): CharacterConditional => {
  const { basic, skill, ult } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0.50, 0.55)
  const ultBeScaling = ult(e, 0.30, 0.33)
  const skillMaxHits = e >= 6 ? 6 : 4

  const content: ContentItem[] = [
    {
      formItem: 'switch',
      id: 'backupDancer',
      name: 'backupDancer',
      text: 'Backup Dancer',
      title: 'Backup Dancer',
      content: betaUpdate,
    },
    {
      formItem: 'slider',
      id: 'skillHitsOnTarget',
      name: 'skillHitsOnTarget',
      text: 'Skill hits on target',
      title: 'Skill hits on target',
      content: betaUpdate,
      min: 0,
      max: skillMaxHits,
    },
    {
      formItem: 'switch',
      id: 'e2EnergyRegenBuff',
      name: 'e2EnergyRegenBuff',
      text: 'E2 ERR buff',
      title: 'E2 ERR buff',
      content: betaUpdate,
      disabled: e < 2,
    },
  ]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'backupDancer'),
    {
      formItem: 'slider',
      id: 'teammateBeValue',
      name: 'teammateBeValue',
      text: `E4 Trailblazer's BE`,
      title: 'E4 Trailblazer\'s BE',
      content: betaUpdate,
      min: 0,
      max: 3.00,
      percent: true,
      disabled: e < 4,
    },
  ]

  const defaults = {
    skillHitsOnTarget: skillMaxHits,
    backupDancer: true,
    e2EnergyRegenBuff: false,
  }

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => (defaults),
    teammateDefaults: () => ({
      backupDancer: true,
      teammateBeValue: 1.50,
    }),
    precomputeEffects: (request: Form) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.ERR] += (e >= 2 && r.e2EnergyRegenBuff) ? 0.25 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.SKILL_SCALING += r.skillHitsOnTarget * skillScaling

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.characterConditionals

      x[Stats.BE] += (m.backupDancer) ? ultBeScaling : 0
    },
    precomputeTeammateEffects: (x: ComputedStatsObject, request: Form) => {
      const t = request.characterConditionals

      x[Stats.BE] += (e >= 4) ? 0.15 * t.teammateBeValue : 0
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional, _request: Form) => {
      const x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
    },
  }
}
