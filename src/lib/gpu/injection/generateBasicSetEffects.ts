import { SetKey } from 'lib/constants/constants'
import { BasicKeyType, WgslStatName } from 'lib/optimization/basicStatsArray'
import { setConfigRegistry } from 'lib/sets/setConfigRegistry'
import { SetConfig, SetType } from 'types/setConfig'

export enum GpuSetMatcher {
  RELIC_2P = 'relic2p',
  RELIC_4P = 'relic4p',
  ORNAMENT_2P = 'ornament2p',
}

export type BasicSetEffectEntry = {
  stat: BasicKeyType
  value: number
  matchFn: GpuSetMatcher
  setId: SetKey
}

const WGSL_BASE_VARIABLE: Record<string, string> = {
  HP_P: 'baseHP',
  ATK_P: 'baseATK',
  DEF_P: 'baseDEF',
  SPD_P: 'baseSPD',
}

export function basicP2(stat: BasicKeyType, value: number, set: SetConfig): BasicSetEffectEntry {
  return { stat, value, matchFn: set.info.setType === SetType.RELIC ? GpuSetMatcher.RELIC_2P : GpuSetMatcher.ORNAMENT_2P, setId: set.setKey }
}

export function basicP4(stat: BasicKeyType, value: number, set: SetConfig): BasicSetEffectEntry {
  return { stat, value, matchFn: GpuSetMatcher.RELIC_4P, setId: set.setKey }
}

function formatTerm(entry: BasicSetEffectEntry): string {
  return `${entry.value} * ${entry.matchFn}(sets, SET_${entry.setId})`
}

const STAT_ORDER: BasicKeyType[] = [
  WgslStatName.SPD_P,
  WgslStatName.HP_P,
  WgslStatName.ATK_P,
  WgslStatName.DEF_P,
  WgslStatName.CR,
  WgslStatName.CD,
  WgslStatName.EHR,
  WgslStatName.RES,
  WgslStatName.BE,
  WgslStatName.ERR,
  WgslStatName.OHB,
  WgslStatName.PHYSICAL_DMG_BOOST,
  WgslStatName.FIRE_DMG_BOOST,
  WgslStatName.ICE_DMG_BOOST,
  WgslStatName.LIGHTNING_DMG_BOOST,
  WgslStatName.WIND_DMG_BOOST,
  WgslStatName.QUANTUM_DMG_BOOST,
  WgslStatName.IMAGINARY_DMG_BOOST,
  WgslStatName.ELATION,
]

export function generateBasicSetEffectsWgsl(): string {
  const effects: BasicSetEffectEntry[] = []
  for (const config of setConfigRegistry.values()) {
    if (config.conditionals.gpuBasic) {
      effects.push(...config.conditionals.gpuBasic())
    }
  }

  const groups = new Map<BasicKeyType, BasicSetEffectEntry[]>()
  for (const effect of effects) {
    const list = groups.get(effect.stat) ?? []
    list.push(effect)
    groups.set(effect.stat, list)
  }

  let wgsl = '\n    // Generated basic set effects\n\n'
  for (const stat of STAT_ORDER) {
    const entries = groups.get(stat)
    if (!entries || entries.length === 0) continue

    const base = WGSL_BASE_VARIABLE[stat]
    const terms = entries.map(formatTerm)

    if (base) {
      const target = stat.replace('_P', '')
      if (terms.length === 1) {
        wgsl += `    c.${target} += (${base}) * (${terms[0]});\n`
      } else {
        wgsl += `    c.${target} += (${base}) * (\n`
        wgsl += terms.map((t, i) => `      ${t}${i < terms.length - 1 ? ' +' : ''}`).join('\n') + '\n'
        wgsl += '    );\n'
      }
    } else {
      if (terms.length === 1) {
        wgsl += `    c.${stat} += ${terms[0]};\n`
      } else {
        wgsl += `    c.${stat} += (\n`
        wgsl += terms.map((t, i) => `      ${t}${i < terms.length - 1 ? ' +' : ''}`).join('\n') + '\n'
        wgsl += '    );\n'
      }
    }

    wgsl += '\n'
  }

  return wgsl
}
