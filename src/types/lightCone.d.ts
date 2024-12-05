import { DBMetadataSuperimpositions } from 'lib/state/metadata'

// TODO: We do a SuperImpositionLevel - 1 which requires this to be a number instead of 1 | 2 | 3...
export type SuperImpositionLevel = number

export type LightCone = {
  id: string
  name: string
  displayName: string
  path: string
  rarity: number
  superimpositions: DBMetadataSuperimpositions
  imageCenter: number
}

export type LightConeId = '20000'
  | '20001'
  | '20002'
  | '20003'
  | '20004'
  | '20005'
  | '20006'
  | '20007'
  | '20008'
  | '20009'
  | '20010'
  | '20011'
  | '20012'
  | '20013'
  | '20014'
  | '20015'
  | '20016'
  | '20017'
  | '20018'
  | '20019'
  | '20020'
  | '20021'
  | '20022'
  | '21000'
  | '21001'
  | '21002'
  | '21003'
  | '21004'
  | '21005'
  | '21006'
  | '21007'
  | '21008'
  | '21009'
  | '21010'
  | '21011'
  | '21012'
  | '21013'
  | '21014'
  | '21015'
  | '21016'
  | '21017'
  | '21018'
  | '21019'
  | '21020'
  | '21021'
  | '21022'
  | '21023'
  | '21024'
  | '21025'
  | '21026'
  | '21027'
  | '21028'
  | '21029'
  | '21030'
  | '21031'
  | '21032'
  | '21033'
  | '21034'
  | '21035'
  | '21036'
  | '21037'
  | '21038'
  | '21039'
  | '21040'
  | '21041'
  | '21042'
  | '21043'
  | '21044'
  | '21045'
  | '21046'
  | '21047'
  | '21048'
  | '21050'
  | '21051'
  | '21052'
  | '22000'
  | '22001'
  | '22002'
  | '22003'
  | '23000'
  | '23001'
  | '23002'
  | '23003'
  | '23004'
  | '23005'
  | '23006'
  | '23007'
  | '23008'
  | '23009'
  | '23010'
  | '23011'
  | '23012'
  | '23013'
  | '23014'
  | '23015'
  | '23016'
  | '23017'
  | '23018'
  | '23019'
  | '23020'
  | '23021'
  | '23022'
  | '23023'
  | '23024'
  | '23025'
  | '23026'
  | '23027'
  | '23028'
  | '23029'
  | '23030'
  | '23031'
  | '23032'
  | '23033'
  | '23034'
  | '23035'
  | '23036'
  | '23037'
  | '24000'
  | '24001'
  | '24002'
  | '24003'
  | '24004'
