import { ComboboxItem, Flex } from '@mantine/core'
import i18next from 'i18next'
import {
  Constants,
  RelicSetFilterOptions,
  UnreleasedSets,
} from 'lib/constants/constants'
import {
  SetsRelics,
  setToId,
} from 'lib/sets/setConfigRegistry'
import { Assets } from 'lib/rendering/assets'

export const RELIC_SET_SEPARATOR = '||'

export type RelicSetGroupedData = {
  group: string
  items: ComboboxItem[]
}

// Encode a relic set filter tuple into a single string value for MultiSelect
export function encodeRelicSetValue(tuple: string[]): string {
  return tuple.join(RELIC_SET_SEPARATOR)
}

// Decode a MultiSelect string value back into a relic set filter tuple
export function decodeRelicSetValue(encoded: string): string[] {
  return encoded.split(RELIC_SET_SEPARATOR)
}

// Generate Mantine MultiSelect grouped data for relic set filters
export function GenerateSetsGroupedOptions(): RelicSetGroupedData[] {
  const t = i18next.getFixedT(null, 'optimizerTab', 'RelicSetSelector')
  const tGameData = i18next.getFixedT(null, 'gameData', 'RelicSets')

  const relicSetEntries = Object.entries(SetsRelics).filter((x) => !UnreleasedSets[x[1]])

  const fourPieceItems: ComboboxItem[] = relicSetEntries.map((set) => ({
    value: encodeRelicSetValue([RelicSetFilterOptions.relic4Piece, set[1]]),
    label: `(4) ${tGameData(`${setToId[set[1]]}.Name`)}`,
  }))

  const twoPlusAnyItems: ComboboxItem[] = relicSetEntries.map((set) => ({
    value: encodeRelicSetValue([RelicSetFilterOptions.relic2PlusAny, set[1]]),
    label: `(2) ${tGameData(`${setToId[set[1]]}.Name`)}`,
  }))

  const twoPlusTwoItems: ComboboxItem[] = []
  for (const set1 of relicSetEntries) {
    for (const set2 of relicSetEntries) {
      twoPlusTwoItems.push({
        value: encodeRelicSetValue([RelicSetFilterOptions.relic2Plus2Piece, set1[1], set2[1]]),
        label: `(2) ${tGameData(`${setToId[set1[1]]}.Name`)} + (2) ${tGameData(`${setToId[set2[1]]}.Name`)}`,
      })
    }
  }

  return [
    { group: t('4pcLabel'), items: fourPieceItems },
    { group: t('2+2pcLabel'), items: twoPlusTwoItems },
    { group: t('2pcLabel'), items: twoPlusAnyItems },
  ]
}

// This should be memoised with either the t function or resolved language as a dependency
export function GenerateBasicSetsOptions(): { value: string; label: JSX.Element }[] {
  const tGameData = i18next.getFixedT(null, 'gameData', 'RelicSets')
  return Object.values(SetsRelics)
    .filter((x) => !UnreleasedSets[x])
    .map((x) => {
      return {
        value: x,
        label: (
          <Flex gap={5} align='center'>
            <img src={Assets.getSetImage(x, Constants.Parts.Head)} style={{ width: 21, height: 21 }} />
            <div style={{ display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', width: 250, whiteSpace: 'nowrap' }}>
              {tGameData(`${setToId[x]}.Name`)}
            </div>
          </Flex>
        ),
      }
    })
}

