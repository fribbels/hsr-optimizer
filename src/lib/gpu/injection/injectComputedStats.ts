import { AKeyNames } from 'lib/optimization/engine/config/keys'

export function injectComputedStats(wgsl: string) {
  let out = 'struct ComputedStats {\n'
  for (const stat of AKeyNames) {
    out += `${stat}: f32,\n`
  }
  out += '}\n'

  return wgsl + out
}
