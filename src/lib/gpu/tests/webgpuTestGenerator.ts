import { getDefaultForm } from 'lib/defaultForm'
import { Form } from 'types/Form'
import { OptimizerTabController } from 'lib/optimizerTabController'
import { runTestRequest, StatDeltaAnalysis, testWrapper } from 'lib/gpu/tests/webgpuTestUtils'
import { getDevice } from 'lib/gpu/webgpuInternals'
import DB from 'lib/db'

export type WebgpuTest = {
  name: string
  promise: Promise<StatDeltaAnalysis>
  result: StatDeltaAnalysis
  passed: boolean
  done: boolean
}

const cache: {
  [key: string]: any
} = {}

export async function generateAllTests() {
  const device = await getDevice()
  if (!device) return []

  cache.metadata = DB.getMetadata()

  return [
    // Defaults to Sailing Towards a Second Life for LC
    generateE0S1CharacterTest('1001', '23027', device), // March 7th
    generateE0S1CharacterTest('1002', '23027', device), // Dan Heng
    generateE0S1CharacterTest('1003', '23000', device), // Himeko
    generateE0S1CharacterTest('1004', '23004', device), // Welt
    generateE0S1CharacterTest('1005', '23006', device), // Kafka
    generateE0S1CharacterTest('1006', '23007', device), // Silver Wolf
    generateE0S1CharacterTest('1008', '23027', device), // Arlan
    generateE0S1CharacterTest('1009', '23027', device), // Asta
    generateE0S1CharacterTest('1013', '23027', device), // Herta
    generateE0S1CharacterTest('1101', '23003', device), // Bronya
    generateE0S1CharacterTest('1102', '23001', device), // Seele
    generateE0S1CharacterTest('1103', '23027', device), // Serval
    generateE0S1CharacterTest('1104', '23005', device), // Gepard
    generateE0S1CharacterTest('1105', '23027', device), // Natasha
    generateE0S1CharacterTest('1106', '23027', device), // Pela
    generateE0S1CharacterTest('1107', '23002', device), // Clara
    generateE0S1CharacterTest('1108', '23027', device), // Sampo
    generateE0S1CharacterTest('1109', '23027', device), // Hook
    generateE0S1CharacterTest('1110', '23027', device), // Lynx
    generateE0S1CharacterTest('1111', '23027', device), // Luka
    generateE0S1CharacterTest('1112', '23016', device), // Topaz & Numby
    generateE0S1CharacterTest('1201', '23027', device), // Qingque
    generateE0S1CharacterTest('1202', '23027', device), // Tingyun
    generateE0S1CharacterTest('1203', '23008', device), // Luocha
    generateE0S1CharacterTest('1204', '23010', device), // Jing Yuan
    generateE0S1CharacterTest('1205', '23009', device), // Blade
    generateE0S1CharacterTest('1206', '23027', device), // Sushang
    generateE0S1CharacterTest('1207', '23027', device), // Yukong
    generateE0S1CharacterTest('1208', '23011', device), // Fu Xuan
    generateE0S1CharacterTest('1209', '23012', device), // Yanqing
    generateE0S1CharacterTest('1210', '23027', device), // Guinaifen
    generateE0S1CharacterTest('1211', '23013', device), // Bailu
    generateE0S1CharacterTest('1212', '23014', device), // Jingliu
    generateE0S1CharacterTest('1213', '23015', device), // Dan Heng • Imbibitor Lunae
    generateE0S1CharacterTest('1214', '23027', device), // Xueyi
    generateE0S1CharacterTest('1215', '23027', device), // Hanya
    generateE0S1CharacterTest('1217', '23017', device), // Huohuo
    generateE0S1CharacterTest('1218', '23029', device), // Jiaoqiu
    generateE0S1CharacterTest('1220', '23031', device), // Feixiao
    generateE0S1CharacterTest('1221', '23030', device), // Yunli
    generateE0S1CharacterTest('1222', '23032', device), // Lingsha
    generateE0S1CharacterTest('1223', '23027', device), // Moze
    generateE0S1CharacterTest('1224', '23027', device), // March 7th
    generateE0S1CharacterTest('1301', '23027', device), // Gallagher
    generateE0S1CharacterTest('1302', '23018', device), // Argenti
    generateE0S1CharacterTest('1303', '23019', device), // Ruan Mei
    generateE0S1CharacterTest('1304', '23023', device), // Aventurine
    generateE0S1CharacterTest('1305', '23020', device), // Dr. Ratio
    generateE0S1CharacterTest('1306', '23021', device), // Sparkle
    generateE0S1CharacterTest('1307', '23022', device), // Black Swan
    generateE0S1CharacterTest('1308', '23024', device), // Acheron
    generateE0S1CharacterTest('1309', '23026', device), // Robin
    generateE0S1CharacterTest('1310', '23025', device), // Firefly
    generateE0S1CharacterTest('1312', '23027', device), // Misha
    generateE0S1CharacterTest('1314', '23028', device), // Jade
    generateE0S1CharacterTest('1315', '23027', device), // Boothill
    generateE0S1CharacterTest('8001', '23027', device), // Trailblazer
    generateE0S1CharacterTest('8002', '23027', device), // Trailblazer
    generateE0S1CharacterTest('8003', '23027', device), // Trailblazer
    generateE0S1CharacterTest('8004', '23027', device), // Trailblazer
    generateE0S1CharacterTest('8005', '23027', device), // Trailblazer
    generateE0S1CharacterTest('8006', '23027', device), // Trailblazer
  ]
}

export function generateE0S1CharacterTest(characterId: string, lightconeId: string, device: GPUDevice) {
  const request = OptimizerTabController.fixForm(getDefaultForm({
    id: characterId,
  })) as Form
  request.lightCone = lightconeId

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return testWrapper(`E0S1 ${cache.metadata.characters[characterId].displayName} — ${cache.metadata.lightCones[lightconeId].displayName}`, runTestRequest(request, device))
}
