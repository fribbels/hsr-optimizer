import { CombatBuffs } from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { type AKeyValue, StatKey } from 'lib/optimization/engine/config/keys'
import { TargetTag } from 'lib/optimization/engine/config/tag'
import type { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import type { Form } from 'types/form'

const COMBAT_BUFF_KEY_TO_STAT_KEY: Record<string, AKeyValue> = {
  ATK: StatKey.ATK,
  ATK_P: StatKey.ATK_P,
  HP: StatKey.HP,
  HP_P: StatKey.HP_P,
  DEF: StatKey.DEF,
  DEF_P: StatKey.DEF_P,
  CR: StatKey.CR,
  CD: StatKey.CD,
  SPD: StatKey.SPD,
  SPD_P: StatKey.SPD_P,
  BE: StatKey.BE,
  DMG_BOOST: StatKey.DMG_BOOST,
  DEF_PEN: StatKey.DEF_PEN,
  RES_PEN: StatKey.RES_PEN,
  EFFECT_RES_PEN: StatKey.EFFECT_RES_PEN,
  VULNERABILITY: StatKey.VULNERABILITY,
  BREAK_EFFICIENCY: StatKey.BREAK_EFFICIENCY_BOOST,
  EHR: StatKey.EHR,
}

const EXTRA_COMBAT_BUFF_SOURCE = Source.EXTRA_COMBAT_BUFFS
const COMBAT_BUFFS_ENTRIES = Object.values(CombatBuffs)

export function precomputeExtraCombatBuffs(x: ComputedStatsContainer, request: Form): void {
  const buffs = request.combatBuffs
  if (!buffs) return

  const config = x.targets(TargetTag.FullTeam).source(EXTRA_COMBAT_BUFF_SOURCE)

  for (const entry of COMBAT_BUFFS_ENTRIES) {
    const value = buffs[entry.key]
    if (!value) continue

    const statKey = COMBAT_BUFF_KEY_TO_STAT_KEY[entry.key]
    if (statKey == null) continue

    x.buff(statKey, value, config)
  }
}
