// @vitest-environment jsdom
import { ImbibitorLunae } from 'lib/conditionals/character/1200/ImbibitorLunae'
import { Jiaoqiu } from 'lib/conditionals/character/1200/Jiaoqiu'
import { JingYuan } from 'lib/conditionals/character/1200/JingYuan'
import { Acheron } from 'lib/conditionals/character/1300/Acheron'
import { Yaoguang } from 'lib/conditionals/character/1500/Yaoguang'
import { TrailblazerHarmonyStelle } from 'lib/conditionals/character/8000/TrailblazerHarmony'
import { CharacterConditionalsResolver } from 'lib/conditionals/resolver/characterConditionalsResolver'
import {
  Sets,
  Stats,
} from 'lib/constants/constants'
import { generateWgsl } from 'lib/gpu/injection/generateWgsl'
import { generateTestRelics } from 'lib/gpu/tests/webgpuTestUtils'
import type { GpuConstants } from 'lib/gpu/webgpuTypes'
import { Source } from 'lib/optimization/buffSource'
import { initializeComboState } from 'lib/optimization/combo/comboInitializers'
import { generateContext } from 'lib/optimization/context/calculateContext'
import {
  GlobalRegister,
  StatKey,
} from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  ElementTag,
} from 'lib/optimization/engine/config/tag'
import { DamageFunctionType } from 'lib/optimization/engine/damage/damageCalculator'
import { ComboType } from 'lib/optimization/rotation/comboType'
import {
  AbilityKind,
  DEFAULT_FUA,
  DEFAULT_ULT,
  END_BASIC,
  END_FUA,
  END_ULT,
  NULL_TURN_ABILITY_NAME,
  START_FUA,
  START_SKILL,
  START_ULT,
  toTurnAbility,
  TurnMarker,
  WHOLE_BASIC,
  WHOLE_FUA,
  WHOLE_ULT,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { preprocessTurnAbilities } from 'lib/optimization/rotation/turnPreprocessor'
import { initializeContextConditionals } from 'lib/simulations/contextConditionals'
import { runStatSimulations } from 'lib/simulations/statSimulation'
import {
  type Simulation,
  StatSimTypes,
} from 'lib/simulations/statSimulationTypes'
import {
  testMains,
  testSets,
  testStatSpread,
} from 'lib/simulations/tests/simTestUtils'
import { generateFullDefaultForm } from 'lib/simulations/utils/benchmarkForm'
import { Metadata } from 'lib/state/metadataInitializer'
import { normalizeForm } from 'lib/stores/optimizerForm/optimizerFormConversions'
import { clone } from 'lib/utils/objectUtils'
import { ExEidolon } from 'types/character'
import type { CharacterConfig } from 'types/characterConfig'
import type { Form } from 'types/form'
import type { OptimizerContext } from 'types/optimizer'
import {
  describe,
  expect,
  test,
} from 'vitest'

Metadata.initialize()

const EX_FUA_CHARACTERS = [Acheron, ImbibitorLunae]
const GPU_PARAMS: GpuConstants = {
  WORKGROUP_SIZE: 1,
  BLOCK_SIZE: 1,
  CYCLES_PER_INVOCATION: 1,
  RESULTS_LIMIT: 1,
  COMPACT_LIMIT: 1,
  DEBUG: true,
  TUPLE_MODE: false,
}

function formFor(character: CharacterConfig, mask: number = ExEidolon.EX1, eidolon = 6) {
  return generateFullDefaultForm(character.id, character.defaultLightCone, eidolon, 1, false, mask)
}

function actionFor(context: OptimizerContext, kind: AbilityKind) {
  const action = context.defaultActions.find((candidate) => candidate.actionType === kind)
  if (!action) throw new Error(`Missing ${kind} action`)
  return action
}

function simulate(form: Form, context = generateContext(form), ashblazing = false) {
  const simulation: Simulation = {
    simType: StatSimTypes.SubstatRolls,
    request: {
      ...testSets(
        ashblazing ? Sets.TheAshblazingGrandDuke : Sets.MusketeerOfWildWheat,
        ashblazing ? Sets.TheAshblazingGrandDuke : Sets.MusketeerOfWildWheat,
        Sets.RutilantArena,
      ),
      ...testMains(Stats.CD, Stats.ATK_P, Stats.ATK_P, Stats.ATK_P),
      stats: testStatSpread(0),
    },
  }
  return runStatSimulations([simulation], form, context)[0]
}

describe('EX-only follow-up actions', () => {
  test.each(EX_FUA_CHARACTERS)('$id appends exactly one non-turn default FUA and preserves custom rotations', (character) => {
    const expectedOriginal = character.id === Acheron.id
      ? [NULL_TURN_ABILITY_NAME, WHOLE_ULT, WHOLE_ULT, START_SKILL, END_ULT]
      : [NULL_TURN_ABILITY_NAME, START_ULT, END_BASIC, WHOLE_BASIC, WHOLE_BASIC]
    const form = formFor(character)
    expect(form.comboTurnAbilities).toEqual([...expectedOriginal, DEFAULT_FUA])

    const countTurns = (names: Form['comboTurnAbilities']) =>
      preprocessTurnAbilities(names.map(toTurnAbility))
        .filter((ability) => ability.marker === TurnMarker.START || ability.marker === TurnMarker.WHOLE).length
    expect(countTurns(form.comboTurnAbilities)).toBe(countTurns(expectedOriginal))

    form.comboType = ComboType.ADVANCED
    form.comboTurnAbilities = [NULL_TURN_ABILITY_NAME, WHOLE_BASIC]
    expect(generateContext(form).rotationActions.map((action) => action.actionName)).toEqual([WHOLE_BASIC])
  })

  test.each(EX_FUA_CHARACTERS)('$id EX-off skips FUA before riders and super-break, preserving later set activation and indices', (character) => {
    const form = formFor(character, 0)
    form.comboType = ComboType.ADVANCED
    form.comboTurnAbilities = [NULL_TURN_ABILITY_NAME, DEFAULT_ULT, DEFAULT_FUA, WHOLE_BASIC]
    form.teammate0 = generateFullDefaultForm(Yaoguang.id, Yaoguang.defaultLightCone, 0, 1, true)
    form.teammate1 = generateFullDefaultForm(TrailblazerHarmonyStelle.id, TrailblazerHarmonyStelle.defaultLightCone, 0, 1, true)
    form.setConditionals[Sets.FiresmithOfLavaForging][1] = true
    const context = generateContext(form)
    expect(context.allActions.some((action) => action.actionType === AbilityKind.FUA)).toBe(false)
    expect(context.rotationActions.map((action) => action.conditionalIndex)).toEqual([1, 3])
    expect(context.rotationActions[1].setConditionals.enabledFiresmithOfLavaForging).toBe(true)
    expect(context.rotationActions[1].hits?.some((hit) => hit.damageFunctionType === DamageFunctionType.Elation)).toBe(true)
    expect(context.rotationActions[1].hits?.some((hit) => hit.damageFunctionType === DamageFunctionType.SuperBreak)).toBe(true)

    const withInactiveSlot = simulate(form, context)
    const withoutInactiveSlot = clone(form)
    withoutInactiveSlot.comboTurnAbilities = [NULL_TURN_ABILITY_NAME, DEFAULT_ULT, WHOLE_BASIC]
    const without = simulate(withoutInactiveSlot)
    expect(withInactiveSlot.x.getGlobalRegisterValue(GlobalRegister.COMBO_DMG))
      .toBeCloseTo(without.x.getGlobalRegisterValue(GlobalRegister.COMBO_DMG), 8)

    form.characterEx = ExEidolon.EX1
    const enabledContext = generateContext(form)
    expect(enabledContext.rotationActions[1].actionType).toBe(AbilityKind.FUA)
    expect(enabledContext.rotationActions[1].setConditionals.enabledFiresmithOfLavaForging).toBe(true)
    expect(enabledContext.rotationActions[2].setConditionals.enabledFiresmithOfLavaForging).toBe(false)
  })

  test.each([DEFAULT_FUA, START_FUA, END_FUA, WHOLE_FUA])('disabled %s cannot change automatic turn expiry around a saved slot', (fua) => {
    const form = formFor(Acheron, 0)
    form.comboType = ComboType.ADVANCED
    form.comboTurnAbilities = [NULL_TURN_ABILITY_NAME, START_ULT, fua, END_BASIC, WHOLE_BASIC, WHOLE_BASIC]
    form.setConditionals[Sets.HunterOfGlacialForest][1] = true
    const withSlot = generateContext(form)
    form.comboTurnAbilities = [NULL_TURN_ABILITY_NAME, START_ULT, END_BASIC, WHOLE_BASIC, WHOLE_BASIC]
    const withoutSlot = generateContext(form)
    expect(withSlot.rotationActions.map((action) => action.setConditionals.enabledHunterOfGlacialForest))
      .toEqual(withoutSlot.rotationActions.map((action) => action.setConditionals.enabledHunterOfGlacialForest))
    expect(withSlot.rotationActions.map((action) => action.conditionalIndex)).toEqual([1, 3, 4, 5])
  })
})

test('Acheron EX1 uses FUA and Ult damage with the Nihility trace but no talent penetration', () => {
  const form = formFor(Acheron)
  form.teammate0 = generateFullDefaultForm(Jiaoqiu.id, Jiaoqiu.defaultLightCone, 0, 1, true)
  form.enemyCount = 5
  const context = generateContext(form)
  const fua = actionFor(context, AbilityKind.FUA)
  expect(fua.hits).toHaveLength(1)
  expect(fua.hits?.map((hit) => [hit.damageType, hit.damageFunctionType, hit.damageElement]))
    .toEqual([
      [DamageTag.FUA | DamageTag.ULT, DamageFunctionType.Crit, ElementTag.Lightning],
    ])
  expect(fua.hits?.[0].atkScaling).toBeCloseTo(3.96)
  expect(fua.hits?.[0].directHit).toBe(true)
  expect(fua.hits?.map((hit) => hit.toughnessDmg ?? 0)).toEqual([10])
  expect(fua.precomputedStats.getValue(StatKey.RES_PEN, 0)).toBeCloseTo(0.2)
  expect(actionFor(context, AbilityKind.BASIC).precomputedStats.getValue(StatKey.RES_PEN, 0)).toBeCloseTo(0.2)
  expect(actionFor(context, AbilityKind.ULT).precomputedStats.getValue(StatKey.RES_PEN, 0)).toBeCloseTo(0.42)
  expect(fua.precomputedStats.getValue(StatKey.FINAL_DMG_BOOST, 0)).toBeCloseTo(0.6)
  expect(actionFor(context, AbilityKind.BASIC).precomputedStats.getValue(StatKey.FINAL_DMG_BOOST, 0)).toBeCloseTo(0.6)

  const before = fua.precomputedStats.getValue(StatKey.BOOST, 0)
  fua.precomputedStats.buff(StatKey.BOOST, 1, fua.precomputedStats.damageType(DamageTag.FUA).source(Source.NONE))
  expect(fua.precomputedStats.getValue(StatKey.BOOST, 0)).toBe(before + 1)
})

test('DHIL EX1 uses Basic and FUA damage, free SP, and no Fulgurant Leap E6 penetration', () => {
  const form = formFor(ImbibitorLunae)
  const context = generateContext(form)
  const fua = actionFor(context, AbilityKind.FUA)
  const hit = fua.hits?.[0]
  if (!hit || hit.damageFunctionType !== DamageFunctionType.Crit) throw new Error('Expected crit FUA hit')
  expect(hit.damageType).toBe(DamageTag.BASIC | DamageTag.FUA)
  expect(hit.atkScaling).toBe(5)
  expect(hit.toughnessDmg).toBe(10)
  expect(hit.skillPointsUsed).toBe(0)
  expect(fua.precomputedStats.getValue(StatKey.RES_PEN, 0)).toBe(0)
  expect(actionFor(context, AbilityKind.BASIC).precomputedStats.getValue(StatKey.RES_PEN, 0)).toBeCloseTo(0.6)

  const before = fua.precomputedStats.getValue(StatKey.BOOST, 0)
  fua.precomputedStats.buff(StatKey.BOOST, 1, fua.precomputedStats.damageType(DamageTag.FUA).source(Source.NONE))
  expect(fua.precomputedStats.getValue(StatKey.BOOST, 0)).toBe(before + 1)
  fua.precomputedStats.buff(StatKey.BOOST, 1, fua.precomputedStats.damageType(DamageTag.BASIC).source(Source.NONE))
  expect(fua.precomputedStats.getValue(StatKey.BOOST, 0)).toBe(before + 2)

  form.characterConditionals.ex1DmgBuff = false
  const disabledBuff = generateContext(form)
  expect(before - actionFor(disabledBuff, AbilityKind.FUA).precomputedStats.getValue(StatKey.BOOST, 0)).toBeCloseTo(2.4)
})

describe('Jing Yuan EX1 manual controls', () => {
  test('both hit controls use the active cap, preserve explicit ten, and clamp restored EX values when off', () => {
    const form = formFor(JingYuan)
    expect(form.characterConditionals.talentHitsPerAction).toBe(30)
    expect(form.characterConditionals.talentAttacks).toBe(30)
    const controller = CharacterConditionalsResolver.get(form)
    expect(
      controller.content().filter((item) => item.id === 'talentHitsPerAction' || item.id === 'talentAttacks')
        .map((item) => item.formItem === 'slider' ? item.max : null),
    ).toEqual([30, 30])

    form.characterConditionals.talentHitsPerAction = 10
    form.characterConditionals.talentAttacks = 10
    expect(actionFor(generateContext(form), AbilityKind.FUA).hits?.[0].atkScaling).toBeCloseTo(7.26)

    form.characterConditionals.talentHitsPerAction = 30
    form.characterConditionals.talentAttacks = 30
    form.comboStateJson = JSON.stringify(initializeComboState(form, false))
    form.comboType = ComboType.ADVANCED
    form.characterEx = 0
    const restored = generateContext(form)
    const fua = actionFor(restored, AbilityKind.FUA)
    expect(fua.characterConditionals.talentHitsPerAction).toBe(10)
    expect(fua.characterConditionals.talentAttacks).toBe(10)
    expect(fua.hits?.[0].atkScaling).toBeCloseTo(7.26)
  })

  test('enhancement boosts self and Lightning-Lord; total/target normalization matches Ashblazing and zero hits stay finite', () => {
    const form = formFor(JingYuan)
    const enhanced = generateContext(form)
    form.characterConditionals.ex1EnhancedState = false
    const unenhanced = generateContext(form)
    for (const kind of [AbilityKind.BASIC, AbilityKind.FUA]) {
      expect(
        actionFor(enhanced, kind).precomputedStats.getValue(StatKey.BOOST, 0)
          - actionFor(unenhanced, kind).precomputedStats.getValue(StatKey.BOOST, 0),
      ).toBeCloseTo(2.4)
    }

    form.characterConditionals.talentHitsPerAction = 10
    form.characterConditionals.talentAttacks = 30
    const mismatched = simulate(form, generateContext(form), true)
    form.characterConditionals.talentHitsPerAction = 30
    const normalized = simulate(form, generateContext(form), true)
    expect(mismatched.actionDamage?.FUA).toBeCloseTo(normalized.actionDamage?.FUA ?? 0, 8)

    form.characterConditionals.talentAttacks = 0
    const zeroHits = simulate(form, generateContext(form), true)
    expect(zeroHits.actionDamage?.FUA).toBe(0)
    expect(Number.isFinite(zeroHits.x.getGlobalRegisterValue(GlobalRegister.COMBO_DMG))).toBe(true)
  })
})

describe('EX context reconstruction and GPU generation', () => {
  test.each([Acheron, ImbibitorLunae, JingYuan])('$id preserves CPU output across worker serialization and generates EX WGSL', (character) => {
    const form = normalizeForm(formFor(character))
    form.characterEx = ExEidolon.EX1
    form.teammate0 = generateFullDefaultForm(JingYuan.id, JingYuan.defaultLightCone, 0, 1, true, ExEidolon.EX1)
    const context = generateContext(form)
    const serialized = clone(context)
    initializeContextConditionals(serialized)
    expect(serialized.characterEx).toBe(ExEidolon.EX1)
    expect(serialized.teammate0Metadata.characterEx).toBe(ExEidolon.EX1)
    expect(serialized.rotationActions.every((action) =>
      action.actorEx === ExEidolon.EX1
      && action.teammate0.actorEx === ExEidolon.EX1
    )).toBe(true)
    const original = simulate(form, context)
    const reconstructed = simulate(form, serialized)
    expect(reconstructed.x.getGlobalRegisterValue(GlobalRegister.COMBO_DMG))
      .toBeCloseTo(original.x.getGlobalRegisterValue(GlobalRegister.COMBO_DMG), 8)

    const source = generateWgsl(serialized, form, generateTestRelics(), GPU_PARAMS)
    expect(source).toContain('DEFAULT_FUA (rotation)')
    expect(source).not.toMatch(/NaN|undefined/)
    form.characterEx = 0
    const offContext = generateContext(form)
    const off = generateWgsl(offContext, form, generateTestRelics(), GPU_PARAMS)
    expect(off).not.toMatch(/NaN|undefined/)
    if (character.id !== JingYuan.id) {
      expect(off).not.toContain('DEFAULT_FUA (rotation)')
    } else {
      expect(actionFor(offContext, AbilityKind.FUA).hits?.[0].atkScaling).toBeCloseTo(7.26)
      expect(actionFor(serialized, AbilityKind.FUA).hits?.[0].atkScaling).toBeCloseTo(21.78)
    }
  })
})
