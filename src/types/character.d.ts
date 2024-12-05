import { Parts } from 'lib/constants/constants'
import { CustomImageConfig } from 'types/customImage'
import { Form } from 'types/form'

export type CharacterId = string

export type Eidolon = number

export type Build = {
  [key in Parts]?: string;
}

// store.getState().characters[0]
export type Character = {
  id: CharacterId
  equipped: Build
  form: Form
  rank: number // order in character tab
  builds: SavedBuild[]
  portrait?: CustomImageConfig
}

export type SavedBuild = {
  build: string[]
  name: string
  score: {
    score: string
    rating: string
  }
}

export type ExactCharacterId = '1001'
  | '1002'
  | '1003'
  | '1004'
  | '1005'
  | '1006'
  | '1008'
  | '1009'
  | '1013'
  | '1101'
  | '1102'
  | '1103'
  | '1104'
  | '1105'
  | '1106'
  | '1107'
  | '1108'
  | '1109'
  | '1110'
  | '1111'
  | '1112'
  | '1201'
  | '1202'
  | '1203'
  | '1204'
  | '1205'
  | '1206'
  | '1207'
  | '1208'
  | '1209'
  | '1210'
  | '1211'
  | '1212'
  | '1213'
  | '1214'
  | '1215'
  | '1217'
  | '1218'
  | '1220'
  | '1221'
  | '1222'
  | '1223'
  | '1224'
  | '1225'
  | '1301'
  | '1302'
  | '1303'
  | '1304'
  | '1305'
  | '1306'
  | '1307'
  | '1308'
  | '1309'
  | '1310'
  | '1312'
  | '1313'
  | '1314'
  | '1315'
  | '1317'
  | '1401'
  | '1402'
  | '8001'
  | '8002'
  | '8003'
  | '8004'
  | '8005'
  | '8006'
  | '8007'
  | '8008'
