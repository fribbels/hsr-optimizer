import structs from 'lib/gpu/wgsl/structs.wgsl?raw'
import structComputedStats from 'lib/gpu/wgsl/structComputedStats.wgsl?raw'
import computeShader from 'lib/gpu/wgsl/computeShader.wgsl?raw'
import { injectSettings } from "lib/gpu/injection/injectSettings";
import { OptimizerParams } from "lib/optimizer/calculateParams";
import { Form } from "types/Form";
import { calculateConditionalRegistry, calculateConditionals } from "lib/optimizer/calculateConditionals";
import { calculateTeammates } from "lib/optimizer/calculateTeammates";
import { injectConditionals } from "lib/gpu/injection/injectConditionals";
import { injectPrecomputedStats } from "lib/gpu/injection/injectPrecomputedStats";

export function generateWgsl(params: OptimizerParams, request: Form) {
  calculateConditionals(request, params)
  calculateConditionalRegistry(request, params)
  calculateTeammates(request, params)
  let wgsl = ''

  wgsl = injectSettings(wgsl, params, request)
  wgsl = injectComputeShader(wgsl)
  wgsl = injectConditionals(wgsl, request, params)
  wgsl = injectPrecomputedStats(wgsl, params)
  wgsl = injectUtils(wgsl)

  return wgsl
}

function injectComputeShader(wgsl) {
  return wgsl += `
${computeShader}

${structs}

${structComputedStats}
  `
}

function injectUtils(wgsl: string) {
  for (const stat of ['ATK', 'DEF', 'HP', 'SPD', 'CR', 'CD', 'EHR', 'BE', 'OHB', 'ERR']) {
    if (stat == 'ATK' || stat == 'DEF' || stat == 'HP' || stat == 'SPD') {
      wgsl += `
fn buffDynamic${stat}_P(
  value: f32,
  p_x: ptr<function, ComputedStats>,
  p_state: ptr<function, ConditionalState>,
  p_sets: ptr<function, Sets>
) {
  (*p_x).${stat} += value * base${stat};
  evaluateDependencies${stat}(p_x, p_state, p_sets);
}
      `
    }

    wgsl += `
fn buffDynamic${stat}(
  value: f32,
  p_x: ptr<function, ComputedStats>,
  p_state: ptr<function, ConditionalState>,
  p_sets: ptr<function, Sets>
) {
  (*p_x).${stat} += value;
  evaluateDependencies${stat}(p_x, p_state, p_sets);
}
    `
  }

  return wgsl
}