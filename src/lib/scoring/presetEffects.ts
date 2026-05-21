import { Sets } from 'lib/constants/constants'
import type {
  SetsOrnaments,
  SetsRelics,
} from 'lib/sets/setConfigRegistry'
import { MortenaxBlade } from 'lib/conditionals/character/1500/MortenaxBlade'
import type { CharacterId } from 'types/character'

export type PresetDefinition = {
  name: string,
  set: SetsRelics | SetsOrnaments,
  value: number | boolean,
  index?: number,
  teammateCondition?: {
    characterId: CharacterId,
    minEidolon: number,
  },
}

export const PresetEffects = {
  // Dynamic values

  fnAshblazingSet: (stacks: number): PresetDefinition => {
    return {
      name: 'fnAshblazingSet',
      value: stacks,
      set: Sets.TheAshblazingGrandDuke,
    }
  },
  fnPioneerSet: (value: number): PresetDefinition => {
    return {
      name: 'fnPioneerSet',
      value: value,
      set: Sets.PioneerDiverOfDeadWaters,
    }
  },
  fnSacerdosSet: (value: number): PresetDefinition => {
    return {
      name: 'fnSacerdosSet',
      value: value,
      set: Sets.SacerdosRelivedOrdeal,
    }
  },
  fnMortenaxAshblazingSet: (stacks: number): PresetDefinition => ({
    name: 'fnMortenaxAshblazingSet',
    value: stacks,
    set: Sets.TheAshblazingGrandDuke,
    teammateCondition: { characterId: MortenaxBlade.id, minEidolon: 2 },
  }),

  // Preset values

  PRISONER_SET: {
    name: 'PRISONER_SET',
    value: 3,
    set: Sets.PrisonerInDeepConfinement,
  } as PresetDefinition,
  WASTELANDER_SET: {
    name: 'WASTELANDER_SET',
    value: 2,
    set: Sets.WastelanderOfBanditryDesert,
  } as PresetDefinition,
  VALOROUS_SET: {
    name: 'VALOROUS_SET',
    value: true,
    set: Sets.TheWindSoaringValorous,
  } as PresetDefinition,
  BANANA_SET: {
    name: 'BANANA_SET',
    value: true,
    set: Sets.TheWondrousBananAmusementPark,
  } as PresetDefinition,
  GENIUS_SET: {
    name: 'GENIUS_SET',
    value: true,
    set: Sets.GeniusOfBrilliantStars,
  } as PresetDefinition,
  WARRIOR_SET: {
    name: 'WARRIOR_SET',
    value: true,
    set: Sets.WarriorGoddessOfSunAndThunder,
  } as PresetDefinition,
  TENGOKU_SET: {
    name: 'TENGOKU_SET',
    value: true,
    set: Sets.TengokuLivestream,
  } as PresetDefinition,
  WATCHMAKER_SET: {
    name: 'WATCHMAKER_SET',
    value: true,
    set: Sets.WatchmakerMasterOfDreamMachinations,
  } as PresetDefinition,
}
