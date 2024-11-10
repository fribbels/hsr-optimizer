import { GUID } from 'types/common'

export type RelicSet = {
  id: GUID
  name: string
  desc: string[]
  properties: [{
    type: string
    value: number
  }][]
  icon: string
  guide_overview: string[]
}
