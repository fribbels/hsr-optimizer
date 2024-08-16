import { OptimizerParams } from "lib/optimizer/calculateParams";
import { Stats } from "lib/constants";
import { Form } from "types/Form";

export function generateSettings(params: OptimizerParams, request: Form) {
  let wgsl = `\n`

  wgsl += generateSetConditionals(params)
  wgsl += generateCharacterStats(params.character.base, 'character')
  wgsl += generateCharacterStats(params.character.base, 'lc')
  wgsl += generateCharacterStats(params.character.base, 'trace')
  wgsl += generateElement(params)
  wgsl += generateRequest(request)

  wgsl += '\n'

  return wgsl
}

function generateRequest(request: Form) {
  let wgsl = '\n'

  // "combat" == 0 / "base" == 1
  wgsl += `const statDisplay: i32 = ${request.statDisplay == 'combat' ? 0 : 1};`

  // Combo
  wgsl += `const BASIC_COMBO: f32 = ${request.combo.BASIC};`
  wgsl += `const SKILL_COMBO: f32 = ${request.combo.SKILL};`
  wgsl += `const ULT_COMBO: f32 = ${request.combo.ULT};`
  wgsl += `const FUA_COMBO: f32 = ${request.combo.FUA};`
  wgsl += `const DOT_COMBO: f32 = ${request.combo.DOT};`
  wgsl += `const BREAK_COMBO: f32 = ${request.combo.BREAK};`

  // Enemy
  wgsl += `const enemyCount: i32 = ${request.enemyCount};`
  wgsl += `const enemyElementalWeak: i32 = ${request.enemyElementalWeak};`
  wgsl += `const enemyLevel: i32 = ${request.enemyLevel};`
  wgsl += `const enemyMaxToughness: f32 = ${request.enemyMaxToughness};`
  wgsl += `const enemyResistance: f32 = ${request.enemyResistance};`
  wgsl += `const enemyEffectResistance: f32 = ${request.enemyEffectResistance};`
  wgsl += `const enemyWeaknessBroken: i32 = ${request.enemyWeaknessBroken};`

  // Filters
  for (const [key, value] of Object.entries(request)) {
    if (key.startsWith('min') || key.startsWith('max')) {
      wgsl += `const ${key}: f32 = ${value};\n`
    }
  }

  return wgsl
}

function generateElement(params: OptimizerParams) {
  let wgsl = '\n'

  wgsl += `const ELEMENT_INDEX: i32 = ${paramElementToIndex[params.ELEMENTAL_DMG_TYPE]};`

  return wgsl
}

function generateSetConditionals(params: OptimizerParams) {
  let wgsl = '\n'

  // Define the set conditional params
  for (const [key, value] of Object.entries(params)) {
    if (key.startsWith('enabled')) {
      wgsl += `const ${key}: i32 = ${value ? 1 : 0};\n`
    }

    if (key.startsWith('value')) {
      wgsl += `const ${key}: i32 = ${value};\n`
    }
  }

  return wgsl
}

function generateCharacterStats(characterStats: { [key: string]: number }, prefix: string) {
  let wgsl = '\n'

  for (const [name, stat] of Object.entries(paramStatNames)) {
    wgsl += `const ${prefix}${name}: f32 = ${characterStats[stat]};\n`
  }

  return wgsl
}

const paramStatNames = {
  HP_P: Stats.HP_P,
  ATK_P: Stats.ATK_P,
  DEF_P: Stats.DEF_P,
  SPD_P: Stats.SPD_P,
  HP: Stats.HP,
  ATK: Stats.ATK,
  DEF: Stats.DEF,
  SPD: Stats.SPD,
  CR: Stats.CR,
  CD: Stats.CD,
  EHR: Stats.EHR,
  RES: Stats.RES,
  BE: Stats.BE,
  ERR: Stats.ERR,
  OHB: Stats.OHB,
  Physical_DMG: Stats.Physical_DMG,
  Fire_DMG: Stats.Fire_DMG,
  Ice_DMG: Stats.Ice_DMG,
  Lightning_DMG: Stats.Lightning_DMG,
  Wind_DMG: Stats.Wind_DMG,
  Quantum_DMG: Stats.Quantum_DMG,
  Imaginary_DMG: Stats.Imaginary_DMG,
}

const paramElementToIndex = {
  [Stats.Physical_DMG]: 0,
  [Stats.Fire_DMG]: 1,
  [Stats.Ice_DMG]: 2,
  [Stats.Lightning_DMG]: 3,
  [Stats.Wind_DMG]: 4,
  [Stats.Quantum_DMG]: 5,
  [Stats.Imaginary_DMG]: 6,
}