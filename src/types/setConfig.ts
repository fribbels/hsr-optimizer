import { Sets } from 'lib/constants/constants'

export type SetInfo = {
  key: keyof typeof Sets
  type: 'relic' | 'ornament'
}

export type SetConfig = {
  id: keyof typeof Sets
  info: SetInfo
}
