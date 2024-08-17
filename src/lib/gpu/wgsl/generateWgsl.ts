import structs from 'lib/gpu/wgsl/structs/structs.wgsl?raw'
import structComputedStats from 'lib/gpu/wgsl/structs/structComputedStats.wgsl?raw'
import shader from 'lib/gpu/wgsl/shader.wgsl?raw'
import { generateSettings } from "lib/gpu/wgsl/generateSettings";
import { OptimizerParams } from "lib/optimizer/calculateParams";
import { Form } from "types/Form";
import { CharacterConditionals } from "lib/characterConditionals";
import { LightConeConditionals } from "lib/lightConeConditionals";

export function generateWgsl(params: OptimizerParams, request: Form) {
  const settings = generateSettings(params, request)

  let wgsl = `
${settings}

${shader}

${structs}

${structComputedStats}
  `

  wgsl = injectConditionals(wgsl, request)

  return wgsl
}

function injectConditionals(wgsl: string, request: Form) {
  const characterConditionals = CharacterConditionals.get(request)
  const lightConeConditionals = LightConeConditionals.get(request)

  if (lightConeConditionals.gpu) wgsl = wgsl.replace('/* INJECT LIGHT CONE CONDITIONALS */', lightConeConditionals.gpu())
  if (characterConditionals.gpu) wgsl = wgsl.replace('/* INJECT CHARACTER CONDITIONALS */', characterConditionals.gpu())

  return wgsl
}