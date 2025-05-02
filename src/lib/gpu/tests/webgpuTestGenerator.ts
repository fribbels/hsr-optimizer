import { SetsOrnamentsNames, SetsRelicsNames } from 'lib/constants/constants'
import { generateTestRelics, StatDeltaAnalysis, testWrapper } from 'lib/gpu/tests/webgpuTestUtils'
import { getWebgpuDevice } from 'lib/gpu/webgpuDevice'
import { RelicsByPart } from 'lib/gpu/webgpuTypes'
import { SortOption } from 'lib/optimization/sortOptions'

import { generateFullDefaultForm } from 'lib/simulations/utils/benchmarkForm'
import DB from 'lib/state/db'
import { OptimizerTabController } from 'lib/tabs/tabOptimizer/optimizerTabController'
import { CharacterId } from 'types/character'
import { Form } from 'types/form'
import { LightCone } from 'types/lightCone'
import { DBMetadata, DBMetadataLightCone } from 'types/metadata'

export type WebgpuTest = {
  name: string
  relics: RelicsByPart
  request: Form
  execute: () => Promise<StatDeltaAnalysis>
  result: StatDeltaAnalysis
  passed: boolean
  done: boolean
}

const cache: {
  metadata: DBMetadata
} = {
  metadata: {} as DBMetadata,
}

const basicLc = '23001' // In the Night
const baseCharacterLightConeMappings: Array<{ characterId: CharacterId; lightConeId: LightCone['id'] }> = [
  { characterId: '1001', lightConeId: basicLc }, // March 7th
  { characterId: '1002', lightConeId: basicLc }, // Dan Heng
  { characterId: '1003', lightConeId: '23000' }, // Himeko
  { characterId: '1004', lightConeId: '23004' }, // Welt
  { characterId: '1005', lightConeId: '23006' }, // Kafka
  { characterId: '1006', lightConeId: '23007' }, // Silver Wolf
  { characterId: '1008', lightConeId: basicLc }, // Arlan
  { characterId: '1009', lightConeId: basicLc }, // Asta
  { characterId: '1013', lightConeId: basicLc }, // Herta
  { characterId: '1101', lightConeId: '23003' }, // Bronya
  { characterId: '1102', lightConeId: '23001' }, // Seele
  { characterId: '1103', lightConeId: basicLc }, // Serval
  { characterId: '1104', lightConeId: '23005' }, // Gepard
  { characterId: '1105', lightConeId: basicLc }, // Natasha
  { characterId: '1106', lightConeId: basicLc }, // Pela
  { characterId: '1107', lightConeId: '23002' }, // Clara
  { characterId: '1108', lightConeId: basicLc }, // Sampo
  { characterId: '1109', lightConeId: basicLc }, // Hook
  { characterId: '1110', lightConeId: basicLc }, // Lynx
  { characterId: '1111', lightConeId: basicLc }, // Luka
  { characterId: '1112', lightConeId: '23016' }, // Topaz & Numby
  { characterId: '1201', lightConeId: basicLc }, // Qingque
  { characterId: '1202', lightConeId: basicLc }, // Tingyun
  { characterId: '1203', lightConeId: '23008' }, // Luocha
  { characterId: '1204', lightConeId: '23010' }, // Jing Yuan
  { characterId: '1205', lightConeId: '23009' }, // Blade
  { characterId: '1206', lightConeId: basicLc }, // Sushang
  { characterId: '1207', lightConeId: basicLc }, // Yukong
  { characterId: '1208', lightConeId: '23011' }, // Fu Xuan
  { characterId: '1209', lightConeId: '23012' }, // Yanqing
  { characterId: '1210', lightConeId: basicLc }, // Guinaifen
  { characterId: '1211', lightConeId: '23013' }, // Bailu
  { characterId: '1212', lightConeId: '23014' }, // Jingliu
  { characterId: '1213', lightConeId: '23015' }, // Dan Heng • Imbibitor Lunae
  { characterId: '1214', lightConeId: basicLc }, // Xueyi
  { characterId: '1215', lightConeId: basicLc }, // Hanya
  { characterId: '1217', lightConeId: '23017' }, // Huohuo
  { characterId: '1218', lightConeId: '23029' }, // Jiaoqiu
  { characterId: '1220', lightConeId: '23031' }, // Feixiao
  { characterId: '1221', lightConeId: '23030' }, // Yunli
  { characterId: '1222', lightConeId: '23032' }, // Lingsha
  { characterId: '1223', lightConeId: basicLc }, // Moze
  { characterId: '1224', lightConeId: basicLc }, // March 7th
  { characterId: '1301', lightConeId: basicLc }, // Gallagher
  { characterId: '1302', lightConeId: '23018' }, // Argenti
  { characterId: '1303', lightConeId: '23019' }, // Ruan Mei
  { characterId: '1304', lightConeId: '23023' }, // Aventurine
  { characterId: '1305', lightConeId: '23020' }, // Dr. Ratio
  { characterId: '1306', lightConeId: '23021' }, // Sparkle
  { characterId: '1307', lightConeId: '23022' }, // Black Swan
  { characterId: '1308', lightConeId: '23024' }, // Acheron
  { characterId: '1309', lightConeId: '23026' }, // Robin
  { characterId: '1310', lightConeId: '23025' }, // Firefly
  { characterId: '1312', lightConeId: basicLc }, // Misha
  { characterId: '1314', lightConeId: '23028' }, // Jade
  { characterId: '1315', lightConeId: '23027' }, // Boothill
  { characterId: '1317', lightConeId: '23033' }, // Rappa
  { characterId: '1225', lightConeId: '23035' }, // Fugue
  { characterId: '1313', lightConeId: '23034' }, // Sunday
  { characterId: '1401', lightConeId: '23037' }, // The Herta
  { characterId: '1402', lightConeId: '23036' }, // Aglaea
  { characterId: '1403', lightConeId: '23038' }, // Tribbie
  { characterId: '1404', lightConeId: '23039' }, // Mydei
  { characterId: '1405', lightConeId: '23041' }, // Anaxa
  { characterId: '1407', lightConeId: '23040' }, // Castorice
  { characterId: '8001', lightConeId: basicLc }, // Trailblazer
  { characterId: '8002', lightConeId: basicLc }, // Trailblazer
  { characterId: '8003', lightConeId: basicLc }, // Trailblazer
  { characterId: '8004', lightConeId: basicLc }, // Trailblazer
  { characterId: '8005', lightConeId: basicLc }, // Trailblazer
  { characterId: '8006', lightConeId: basicLc }, // Trailblazer
  { characterId: '8007', lightConeId: basicLc }, // Trailblazer
  { characterId: '8008', lightConeId: basicLc }, // Trailblazer
]

export async function generateAllTests() {
  const device = await getWebgpuDevice()
  if (!device) return []

  cache.metadata = DB.getMetadata()

  return [
    // ...generateSingleCharacterTest(device, { characterId: '1105', lightConeId: basicLc }),
    // ...generateE0E1Tests(device),
    ...generateOrnamentSetTests(device),
    ...generateRelicSetTests(device),
    ...generateE6E5Tests(device),
    ...generateStarLcTests(device, 4),
    ...generateStarLcTests(device, 3),
  ]
}

export function generateSingleCharacterTest(
  device: GPUDevice,
  pair: { characterId: CharacterId; lightConeId: LightCone['id'] },
) {
  return [
    generateE0S1CharacterTest(pair.characterId, pair.lightConeId, device),
    generateE6S5CharacterTest(pair.characterId, pair.lightConeId, device),
  ]
}

export function generateE0E1Tests(device: GPUDevice) {
  return baseCharacterLightConeMappings.reverse().map((pair) => {
    return generateE0S1CharacterTest(pair.characterId, pair.lightConeId, device)
  })
}

export function generateE6E5Tests(device: GPUDevice) {
  return baseCharacterLightConeMappings.reverse().map((pair) => {
    return generateE6S5CharacterTest(pair.characterId, pair.lightConeId, device)
  })
}

export function generateStarLcTests(device: GPUDevice, star: number) {
  // Use Kafka since she has DOT and FUA
  const characterId = '1005'
  const metadataLightCones = Object.values(cache.metadata.lightCones)
  const lightCones = metadataLightCones.filter((lc: DBMetadataLightCone) => lc.rarity == star)
  const tests: WebgpuTest[] = []

  for (const lc of lightCones) {
    const test = generateE6S5CharacterTest(characterId, lc.id, device)
    tests.push(test)
  }

  return tests
}

export function generateOrnamentSetTests(device: GPUDevice) {
  // Use Kafka since she has DOT and FUA
  const characterId = '1005'
  const lightConeId = basicLc
  const tests: WebgpuTest[] = []

  for (const set of SetsOrnamentsNames) {
    const test = generateE6S5CharacterTest(characterId, lightConeId, device)
    test.name += ` — Ornament Sets  — ${set}`
    test.relics.LinkRope[0].set = set
    test.relics.PlanarSphere[0].set = set
    tests.push(test)
  }

  return tests
}

export function generateRelicSetTests(device: GPUDevice) {
  // Use Kafka since she has DOT and FUA
  const characterId = '1005'
  const lightConeId = basicLc
  const tests: WebgpuTest[] = []

  for (const set of SetsRelicsNames) {
    const test = generateE6S5CharacterTest(characterId, lightConeId, device)
    test.name += ` — Relic Sets  — ${set}`
    test.relics.Head[0].set = set
    test.relics.Hands[0].set = set
    test.relics.Body[0].set = set
    test.relics.Feet[0].set = set
    tests.push(test)
  }

  return tests
}

export function generateE0S1CharacterTest(characterId: CharacterId, lightConeId: LightCone['id'], device: GPUDevice) {
  const request = OptimizerTabController.displayToForm(generateFullDefaultForm(characterId, lightConeId, 0, 1))
  const relics = generateTestRelics()
  request.sortOption = SortOption.COMBO.key

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return testWrapper(`E0S1 ${cache.metadata.characters[characterId].displayName} — ${cache.metadata.lightCones[lightConeId].displayName}`, request, relics, device)
}

export function generateE6S5CharacterTest(characterId: CharacterId, lightConeId: LightCone['id'], device: GPUDevice) {
  const request = OptimizerTabController.displayToForm(generateFullDefaultForm(characterId, lightConeId, 6, 5))
  const relics = generateTestRelics()
  request.sortOption = SortOption.COMBO.key

  addE6S5Teammate(request, 0, '8008', '21051')
  addE6S5Teammate(request, 1, '1225', '23035')
  addE6S5Teammate(request, 2, '1309', '23026')

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return testWrapper(`E6S5 ${cache.metadata.characters[characterId].displayName} — ${cache.metadata.lightCones[lightConeId].displayName}`, request, relics, device)
}

export function addE6S5Teammate(request: Form, index: number, characterId: CharacterId, lightConeId: LightCone['id']) {
  const teammate = generateFullDefaultForm(
    characterId,
    lightConeId,
    6,
    5,
    true,
  )

  if (index == 0) request.teammate0 = teammate
  if (index == 1) request.teammate1 = teammate
  if (index == 2) request.teammate2 = teammate
}
