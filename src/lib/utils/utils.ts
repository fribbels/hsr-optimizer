// TEMPORARY re-export facade — call sites being updated to import directly.

import { clone, objectHash, mergeDefinedValues, mergeUndefinedValues, flipStringMapping, recursiveToCamel } from 'lib/utils/objectUtils'
import { TsUtils } from 'lib/utils/TsUtils'
import { nullUndefinedToZero, truncate10ths, truncate100ths, truncate1000ths, truncate10000ths } from 'lib/utils/mathUtils'
import { arrayOfZeroes, arrayOfValue } from 'lib/utils/arrayUtils'
import { uuid, msToReadable } from 'lib/utils/miscUtils'
import { sleep } from 'lib/utils/frontendUtils'
import { screenshotElementById } from 'lib/utils/screenshotUtils'
import { isFlat } from 'lib/utils/statUtils'

export const Utils = {
  objectHash,
  arrayOfZeroes,
  arrayOfValue,
  nullUndefinedToZero,
  mergeDefinedValues,
  mergeUndefinedValues,
  sleep,
  isFlat,
  screenshotElementById,
  truncate10ths,
  truncate100ths,
  truncate1000ths,
  truncate10000ths,
  precisionRound: TsUtils.precisionRound,
  flipMapping: flipStringMapping,
  clone,
  recursiveToCamel,
  randomId: uuid,
  sortRarityDesc: (a: { rarity: number }, b: { rarity: number }) => b.rarity - a.rarity,
  msToReadable,
}
