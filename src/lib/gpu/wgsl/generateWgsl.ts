import structs from 'lib/gpu/wgsl/structs/structs.wgsl?raw'
import structComputedStats from 'lib/gpu/wgsl/structs/structComputedStats.wgsl?raw'
import shader from 'lib/gpu/wgsl/shader.wgsl?raw'
import { generateSettings } from "lib/gpu/wgsl/generateSettings";
import { OptimizerParams } from "lib/optimizer/calculateParams";
import { Form } from "types/Form";
import { CharacterConditionals } from "lib/characterConditionals";
import { LightConeConditionals } from "lib/lightConeConditionals";
import { calculateConditionals } from "lib/optimizer/calculateConditionals";
import { calculateTeammates } from "lib/optimizer/calculateTeammates";

export function generateWgsl(params: OptimizerParams, request: Form) {
  calculateConditionals(request, params)
  calculateTeammates(request, params)

  const settings = generateSettings(params, request)

  let wgsl = `
// Settings
${settings}

// Main
${shader}

// Structs
${structs}

${structComputedStats}
  `

  wgsl = injectConditionals(wgsl, request)
  wgsl = injectComputedStats(wgsl, params)

  return wgsl
}

const ReverseStats = {
  'ATK%': 'ATK_P',
  'ATK': 'ATK',
  'Break Effect': 'BE',
  'CRIT DMG': 'CD',
  'CRIT Rate': 'CR',
  'DEF%': 'DEF_P',
  'DEF': 'DEF',
  'Effect Hit Rate': 'EHR',
  'Energy Regeneration Rate': 'ERR',
  'Fire DMG Boost': 'Fire_DMG',
  'HP%': 'HP_P',
  'HP': 'HP',
  'Ice DMG Boost': 'Ice_DMG',
  'Imaginary DMG Boost': 'Imaginary_DMG',
  'Lightning DMG Boost': 'Lightning_DMG',
  'Outgoing Healing Boost': 'OHB',
  'Physical DMG Boost': 'Physical_DMG',
  'Quantum DMG Boost': 'Quantum_DMG',
  'Effect RES': 'RES',
  'SPD%': 'SPD_P',
  'SPD': 'SPD',
  'Wind DMG Boost': 'Wind_DMG',
}

function injectComputedStats(wgsl: string, params: OptimizerParams) {
  /*
  MyStruct(
    1.0,
    vec3<f32>(1.0, 2.0, 3.0),
    42
  );
  */
  let variableInitialization = ''
  for (const [key, value] of Object.entries(params.precomputedX)) {
    if (ReverseStats[key]) {
      variableInitialization += `${ReverseStats[key]}`
    }
  }

  const computedStats = `
  var x: ComputedStats = ComputedStats(
    
  );
  `
  wgsl.replace('/* INJECT COMPUTED STATS */', lightConeConditionals.gpu())
  //

  return wgsl
}

function injectConditionals(wgsl: string, request: Form) {
  const characterConditionals = CharacterConditionals.get(request)
  const lightConeConditionals = LightConeConditionals.get(request)

  if (lightConeConditionals.gpu) wgsl = wgsl.replace('/* INJECT LIGHT CONE CONDITIONALS */', lightConeConditionals.gpu())
  if (characterConditionals.gpu) wgsl = wgsl.replace('/* INJECT CHARACTER CONDITIONALS */', characterConditionals.gpu())

  return wgsl
}