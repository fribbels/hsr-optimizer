import { setConfigRegistry } from 'lib/sets/setConfigRegistry'

type MatchFn = 'relic2p' | 'relic4p' | 'ornament2p'

const PERCENTAGE_STATS: Record<string, string> = {
  HP_P: 'baseHP',
  ATK_P: 'baseATK',
  DEF_P: 'baseDEF',
  SPD_P: 'baseSPD',
}

export function basicSetEffect(stat: string, value: number, matchFn: MatchFn, setId: string): string {
  const match = `${matchFn}(sets, SET_${setId})`
  const base = PERCENTAGE_STATS[stat]
  if (base) {
    const targetStat = stat.replace('_P', '')
    return `    c.${targetStat} += ${base} * ${value} * ${match};`
  }
  return `    c.${stat} += ${value} * ${match};`
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
