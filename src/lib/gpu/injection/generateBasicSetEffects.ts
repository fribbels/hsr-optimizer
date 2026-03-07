import { SetKey } from 'lib/constants/constants'
import { BasicKeyType } from 'lib/optimization/basicStatsArray'
import { setConfigRegistry } from 'lib/sets/setConfigRegistry'
import { SetType } from 'types/setConfig'

export enum GpuSetMatcher {
  RELIC_2P = 'relic2p',
  RELIC_4P = 'relic4p',
  ORNAMENT_2P = 'ornament2p',
}

const PERCENTAGE_STATS: Record<string, string> = {
  HP_P: 'baseHP',
  ATK_P: 'baseATK',
  DEF_P: 'baseDEF',
  SPD_P: 'baseSPD',
}

export function basicSetEffect(stat: BasicKeyType, value: number, matchFn: GpuSetMatcher, setId: SetKey): string {
  const match = `${matchFn}(sets, SET_${setId})`
  const base = PERCENTAGE_STATS[stat]
  if (base) {
    const targetStat = stat.replace('_P', '')
    return `    c.${targetStat} += ${base} * ${value} * ${match};`
  }
  return `    c.${stat} += ${value} * ${match};`
}

export function basicP2(stat: BasicKeyType, value: number, setId: SetKey, setType: SetType): string {
  return basicSetEffect(stat, value, setType === SetType.RELIC ? GpuSetMatcher.RELIC_2P : GpuSetMatcher.ORNAMENT_2P, setId)
}

export function basicP4(stat: BasicKeyType, value: number, setId: SetKey): string {
  return basicSetEffect(stat, value, GpuSetMatcher.RELIC_4P, setId)
}

export function generateBasicSetEffectsWgsl(): string {
  let wgsl = '\n    // Generated basic set effects\n'
  for (const config of setConfigRegistry.values()) {
    if (config.conditionals.gpuBasic) {
      wgsl += config.conditionals.gpuBasic() + '\n'
    }
  }
  return wgsl
}
