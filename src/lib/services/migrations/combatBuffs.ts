import { AKey } from 'lib/optimization/engine/config/keys'
import { TargetTag } from 'lib/optimization/engine/config/tag'
import { uuid } from 'lib/utils/miscUtils'
import { entries } from 'lib/utils/objectUtils'
import {
  type CombatBuff,
  CombatBuffType,
  type CombatStatBuff,
} from 'types/form'
import type { HsrOptimizerSaveFormat } from 'types/store'

const MIGRATION_KEY = 'COMBAT_BUFFS'
const MIGRATION_VALUE = 1

export function migrateCombatBuffs(saveData: HsrOptimizerSaveFormat) {
  saveData.characters.forEach((character) => {
    if (saveData.completedMigrations?.[MIGRATION_KEY] === MIGRATION_VALUE) return

    const newBuffs: Array<CombatBuff> = []
    entries(character.form.combatBuffs as unknown as OldCombatBuffs).forEach((entry) => {
      const migratedEntry = migrateBuffEntry(...entry)
      if (migratedEntry) newBuffs.push(migratedEntry)
    })
    character.form = { ...character.form, combatBuffs: newBuffs }
  })
  if (saveData.completedMigrations) {
    saveData.completedMigrations[MIGRATION_KEY] = MIGRATION_VALUE
  } else saveData.completedMigrations = { [MIGRATION_KEY]: MIGRATION_VALUE }
}

function migrateBuffEntry<K extends keyof OldCombatBuffs>(key: K, value: OldCombatBuffs[K]): CombatStatBuff | undefined {
  const valueMultiplier = (() => {
    switch (key) {
      case 'HP':
      case 'SPD':
      case 'ATK':
      case 'DEF':
        return 1
      case 'ATK_P':
      case 'BE':
      case 'BOOST':
      case 'BREAK_EFFICIENCY':
      case 'CD':
      case 'CR':
      case 'DEF_P':
      case 'DEF_PEN':
      case 'EFFECT_RES_PEN':
      case 'EHR':
      case 'HP_P':
      case 'RES_PEN':
      case 'SPD_P':
      case 'VULNERABILITY':
        return 100
    }
  })()
  if (value) {
    return {
      statKey: AKey[key],
      value: value * valueMultiplier,
      type: CombatBuffType.StatBuff,
      id: uuid(),
      targetTag: TargetTag.FullTeam,
      damageTags: [],
      elementTags: [],
      disabled: false,
    }
  }
}

type OldCombatBuffs = Record<typeof oldCombatBuffs[keyof typeof oldCombatBuffs]['key'], number>
const oldCombatBuffs = {
  ATK: {
    title: 'ATK',
    key: 'ATK',
    percent: false,
  },
  ATK_P: {
    title: 'ATK %',
    key: 'ATK_P',
    percent: true,
  },
  HP: {
    title: 'HP',
    key: 'HP',
    percent: false,
  },
  HP_P: {
    title: 'HP %',
    key: 'HP_P',
    percent: true,
  },
  DEF: {
    title: 'DEF',
    key: 'DEF',
    percent: false,
  },
  DEF_P: {
    title: 'DEF %',
    key: 'DEF_P',
    percent: true,
  },
  CR: {
    title: 'Crit Rate %',
    key: 'CR',
    percent: true,
  },
  CD: {
    title: 'Crit Dmg %',
    key: 'CD',
    percent: true,
  },
  SPD: {
    title: 'SPD',
    key: 'SPD',
    percent: false,
  },
  SPD_P: {
    title: 'SPD %',
    key: 'SPD_P',
    percent: true,
  },
  BE: {
    title: 'BE %',
    key: 'BE',
    percent: true,
  },
  EHR: {
    title: 'Effect Hit Rate %',
    key: 'EHR',
    percent: true,
  },
  BOOST: {
    title: 'Dmg Boost %',
    key: 'BOOST',
    percent: true,
  },
  DEF_PEN: {
    title: 'Def Pen %',
    key: 'DEF_PEN',
    percent: true,
  },
  RES_PEN: {
    title: 'Dmg RES PEN %',
    key: 'RES_PEN',
    percent: true,
  },
  EFFECT_RES_PEN: {
    title: 'Effect RES PEN %',
    key: 'EFFECT_RES_PEN',
    percent: true,
  },
  VULNERABILITY: {
    title: 'Vulnerability %',
    key: 'VULNERABILITY',
    percent: true,
  },
  BREAK_EFFICIENCY: {
    title: 'Break Efficiency %',
    key: 'BREAK_EFFICIENCY',
    percent: true,
  },
} as const
