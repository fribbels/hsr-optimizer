import { Stats } from 'lib/constants'
import { baseComputedStatsObject, ComputedStatsObject } from 'lib/conditionals/conditionalConstants.ts'
import { AbilityEidolon, findContentId, precisionRound } from 'lib/conditionals/utils'

import { Eidolon } from 'types/Character'
import { CharacterConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { ContentItem } from 'types/Conditionals'

export default (e: Eidolon): CharacterConditional => {
  const { basic, skill, ult } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0.50, 0.55)
  const ultBeScaling = ult(e, 0.30, 0.33)
  const skillMaxHits = e >= 6 ? 6 : 4

  const targetsToSuperBreakMulti = {
    1: 1.60,
    3: 1.40,
    5: 1.20,
  }

  const content: ContentItem[] = [
    {
      formItem: 'switch',
      id: 'backupDancer',
      name: 'backupDancer',
      text: 'Backup Dancer BE buff',
      title: 'Backup Dancer BE buff',
      content: `Grants all allies the Backup Dancer effect, lasting for 3 turn(s). This duration reduces by 1 at the start of Trailblazer's every turn. Allies with the Backup Dancer effect have their Break Effect increased by ${precisionRound(ultBeScaling * 100)}%.`,
    },
    {
      formItem: 'switch',
      id: 'superBreakDmg',
      name: 'superBreakDmg',
      text: 'Super Break DMG calcs (force weakness break)',
      title: 'Super Break DMG calcs (force weakness break)',
      content: `When allies with the Backup Dancer effect attack enemy targets that are in the Weakness Broken state, the Toughness Reduction of the attack will be converted into 1 instance of Super Break DMG.
      ::BR::
      Super Break DMG is added to each of the BASIC / SKILL / ULT / FUA damage columns. For example when enabled, the SKILL column becomes the sum of base Skill damage + Super Break DMG based on the Skill's toughness damage. This option also overrides enemy weakness break to ON.`,
    },
    {
      formItem: 'slider',
      id: 'skillHitsOnTarget',
      name: 'skillHitsOnTarget',
      text: 'Skill extra hits on target',
      title: 'Skill extra hits on target',
      content: `Deals Imaginary DMG to a single target enemy and additionally deals DMG for 4 times, with each time dealing Imaginary DMG to a random enemy.`,
      min: 0,
      max: skillMaxHits,
    },
    {
      formItem: 'switch',
      id: 'e2EnergyRegenBuff',
      name: 'e2EnergyRegenBuff',
      text: 'E2 ERR buff',
      title: 'E2 ERR buff',
      content: `When the battle starts, the Trailblazer's Energy Regeneration Rate increases by 25%, lasting for 3 turn(s).`,
      disabled: e < 2,
    },
  ]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'backupDancer'),
    findContentId(content, 'superBreakDmg'),
    {
      formItem: 'slider',
      id: 'teammateBeValue',
      name: 'teammateBeValue',
      text: `E4 Trailblazer's Combat BE`,
      title: 'E4 Trailblazer\'s Combat BE',
      content: `While the Trailblazer is on the field, increases the Break Effect of all teammates (excluding the Trailblazer), by an amount equal to 15% of the Trailblazer's Break Effect.`,
      min: 0,
      max: 4.00,
      percent: true,
      disabled: e < 4,
    },
  ]

  const defaults = {
    skillHitsOnTarget: skillMaxHits,
    backupDancer: true,
    superBreakDmg: true,
    e2EnergyRegenBuff: false,
  }

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => (defaults),
    teammateDefaults: () => ({
      backupDancer: true,
      superBreakDmg: true,
      teammateBeValue: 2.00,
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

      x.BASIC_TOUGHNESS_DMG += 30
      x.SKILL_TOUGHNESS_DMG += 30 * r.skillHitsOnTarget

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.characterConditionals

      // Special case where we force the weakness break on if the option is enabled
      if (m.superBreakDmg) {
        x.ENEMY_WEAKNESS_BROKEN = 1
      }

      x[Stats.BE] += (m.backupDancer) ? ultBeScaling : 0

      x.SUPER_BREAK_HMC_MODIFIER += (m.backupDancer && m.superBreakDmg) ? targetsToSuperBreakMulti[request.enemyCount] : 0
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
