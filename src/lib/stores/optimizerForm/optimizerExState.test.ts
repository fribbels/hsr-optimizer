// @vitest-environment jsdom
import { ImbibitorLunae } from 'lib/conditionals/character/1200/ImbibitorLunae'
import { JingYuan } from 'lib/conditionals/character/1200/JingYuan'
import { Acheron } from 'lib/conditionals/character/1300/Acheron'
import { ConditionalDataType } from 'lib/constants/constants'
import { generateWgsl } from 'lib/gpu/injection/generateWgsl'
import { generateTestRelics } from 'lib/gpu/tests/webgpuTestUtils'
import { generateContext } from 'lib/optimization/context/calculateContext'
import { AbilityKind } from 'lib/optimization/rotation/turnAbilityConfig'
import { SortOption } from 'lib/optimization/sortOptions'
import { loadBuildInOptimizer } from 'lib/services/buildService'
import { generateFullDefaultForm } from 'lib/simulations/utils/benchmarkForm'
import { Metadata } from 'lib/state/metadataInitializer'
import { useCharacterStore } from 'lib/stores/character/characterStore'
import { displayToInternal } from 'lib/stores/optimizerForm/optimizerFormConversions'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { validateForm } from 'lib/tabs/tabOptimizer/optimizerForm/optimizerFormActions'
import { ExEidolon } from 'types/character'
import {
  BuildSource,
  type CharacterSavedBuild,
  type OptimizerSavedBuild,
} from 'types/savedBuild'
import {
  beforeEach,
  expect,
  test,
  vi,
} from 'vitest'

vi.mock('lib/state/saveState', () => ({ SaveState: { delayedSave: vi.fn() } }))

Metadata.initialize()

beforeEach(() => {
  useOptimizerRequestStore.setState(useOptimizerRequestStore.getInitialState())
  useCharacterStore.getState().setCharacters([])
})

function expectValidShader(fuaAvailable = false) {
  const form = displayToInternal(useOptimizerRequestStore.getState())
  const teammate = generateFullDefaultForm(JingYuan.id, JingYuan.defaultLightCone, 0, 1, true)
  form.teammate0 = teammate
  form.teammate1 = teammate
  form.teammate2 = teammate
  const log = vi.spyOn(console, 'log').mockImplementation(() => {})
  try {
    expect(validateForm(form)).toBe(true)
  } finally {
    log.mockRestore()
  }
  const context = generateContext(form)
  expect(context.defaultActions.some((action) => action.actionType === AbilityKind.FUA)).toBe(fuaAvailable)
  expect(() =>
    generateWgsl(context, form, generateTestRelics(), {
      WORKGROUP_SIZE: 1,
      BLOCK_SIZE: 1,
      CYCLES_PER_INVOCATION: 1,
      RESULTS_LIMIT: 1,
      COMPACT_LIMIT: 1,
      DEBUG: false,
      TUPLE_MODE: false,
    })
  ).not.toThrow()
}

test.each([Acheron, ImbibitorLunae])('disabling EX removes the unavailable FUA target and generates a valid non-debug shader for $id', (character) => {
  const form = generateFullDefaultForm(character.id, character.defaultLightCone, 0, 1, false, ExEidolon.EX1)
  useOptimizerRequestStore.getState().loadForm(form)
  useOptimizerRequestStore.getState().setResultSort(SortOption.FUA.key)
  useOptimizerRequestStore.getState().setEx(0)
  expect(useOptimizerRequestStore.getState().resultSort).toBe(SortOption.COMBO.key)
  expectValidShader()
})

test.each([Acheron, ImbibitorLunae])('loading EX-off FUA settings normalizes the target for $id', (character) => {
  const form = generateFullDefaultForm(character.id, character.defaultLightCone, 0, 1)
  form.resultSort = SortOption.FUA.key
  useOptimizerRequestStore.getState().loadForm(form)
  expect(useOptimizerRequestStore.getState().resultSort).toBe(SortOption.COMBO.key)
  expectValidShader()
})

test('Jing Yuan keeps his ordinary FUA target and EX characters keep other valid targets', () => {
  useOptimizerRequestStore.getState().loadForm(generateFullDefaultForm(JingYuan.id, JingYuan.defaultLightCone, 0, 1, false, ExEidolon.EX1))
  useOptimizerRequestStore.getState().setResultSort(SortOption.FUA.key)
  useOptimizerRequestStore.getState().setEx(0)
  expect(useOptimizerRequestStore.getState().resultSort).toBe(SortOption.FUA.key)
  useOptimizerRequestStore.getState().loadForm(generateFullDefaultForm(Acheron.id, Acheron.defaultLightCone, 0, 1, false, ExEidolon.EX1))
  useOptimizerRequestStore.getState().setResultSort(SortOption.HP.key)
  useOptimizerRequestStore.getState().setEx(0)
  expect(useOptimizerRequestStore.getState().resultSort).toBe(SortOption.HP.key)
})

test('actual legacy character-build loading clamps the final EX-off main/team values in one write with unchanged UI bounds', () => {
  const form = generateFullDefaultForm(JingYuan.id, JingYuan.defaultLightCone, 0, 1, false, ExEidolon.EX1)
  form.characterConditionals = { ...form.characterConditionals, talentHitsPerAction: 30, talentAttacks: 30, skillCritBuff: false }
  form.teammate0 = {
    ...generateFullDefaultForm(JingYuan.id, JingYuan.defaultLightCone, 0, 1, true),
    characterConditionals: { talentHitsPerAction: 25, talentAttacks: 23, skillCritBuff: false },
  }
  const combo = {
    comboCharacter: { characterConditionals: { talentAttacks: { type: ConditionalDataType.NUMBER, partitions: [{ value: 30 }, { value: 27 }] } } },
    comboTeammate0: { characterConditionals: { talentAttacks: { type: ConditionalDataType.NUMBER, partitions: [{ value: 23 }, { value: 21 }] } } },
  }
  form.comboStateJson = JSON.stringify(combo)
  useCharacterStore.getState().setCharacters([{ id: JingYuan.id, form, equipped: {} }])
  // Already mounted EX-off controls have a 10-hit maximum before the service loads the build.
  useOptimizerRequestStore.getState().loadForm({ ...form, characterEx: 0 })
  const writes: number[] = []
  const unsubscribe = useOptimizerRequestStore.subscribe((state) => writes.push(Number(state.characterConditionals.talentAttacks)))
  const build: CharacterSavedBuild = {
    source: BuildSource.Character,
    name: 'legacy EX-off build',
    characterId: JingYuan.id,
    characterEidolon: 0,
    characterEx: 0,
    lightCone: JingYuan.defaultLightCone,
    lightConeSuperimposition: 1,
    equipped: {},
    team: [null, null, null],
  }
  try {
    loadBuildInOptimizer(build)
  } finally {
    unsubscribe()
  }
  const loaded = useOptimizerRequestStore.getState()
  expect(writes).toEqual([10])
  expect(loaded.characterEx).toBe(0)
  expect(loaded.characterConditionals).toMatchObject({ talentHitsPerAction: 10, talentAttacks: 10, skillCritBuff: false })
  expect(loaded.teammates[0].characterConditionals).toEqual({ talentHitsPerAction: 10, talentAttacks: 10, skillCritBuff: false })
  combo.comboCharacter.characterConditionals.talentAttacks.partitions[0].value = 10
  combo.comboTeammate0.characterConditionals.talentAttacks.partitions[0].value = 10
  expect(loaded.comboStateJson).toBe(JSON.stringify(combo))
  expect(form.characterConditionals.talentAttacks).toBe(30)
  expect(form.teammate0.characterConditionals?.talentAttacks).toBe(23)
})

test('actual saved-build loading normalizes the final EX override before shader generation', () => {
  const form = generateFullDefaultForm(Acheron.id, Acheron.defaultLightCone, 0, 1, false, ExEidolon.EX1)
  form.resultSort = SortOption.FUA.key
  useCharacterStore.getState().setCharacters([{ id: Acheron.id, form, equipped: {} }])
  const build: OptimizerSavedBuild = {
    source: BuildSource.Optimizer,
    name: 'EX-off optimizer build',
    characterId: Acheron.id,
    characterEidolon: 0,
    characterEx: 0,
    lightCone: Acheron.defaultLightCone,
    lightConeSuperimposition: 1,
    equipped: {},
    team: [null, null, null],
    characterConditionals: form.characterConditionals,
    lightConeConditionals: form.lightConeConditionals,
    setConditionals: form.setConditionals,
    comboType: form.comboType,
    comboStateJson: form.comboStateJson,
    comboPreprocessor: form.comboPreprocessor,
    comboTurnAbilities: form.comboTurnAbilities,
    deprioritizeBuffs: form.deprioritizeBuffs ?? false,
  }
  loadBuildInOptimizer(build)
  expect(useOptimizerRequestStore.getState().resultSort).toBe(SortOption.COMBO.key)
  expectValidShader()
  // The final build's EX-on override must retain a FUA target even when its roster form is EX off.
  useCharacterStore.getState().setCharacters([{ id: Acheron.id, form: { ...form, characterEx: 0 }, equipped: {} }])
  loadBuildInOptimizer({ ...build, characterEx: ExEidolon.EX1 })
  expect(useOptimizerRequestStore.getState().resultSort).toBe(SortOption.FUA.key)
  expectValidShader(true)
})
