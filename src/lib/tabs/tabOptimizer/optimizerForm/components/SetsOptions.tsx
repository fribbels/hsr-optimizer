import { Flex } from '@mantine/core'
import type { ReactElement } from 'react'
import i18next from 'i18next'
import {
  Constants,
  UnreleasedSets,
} from 'lib/constants/constants'
import {
  SetsRelicsNames,
  setToId,
} from 'lib/sets/setConfigRegistry'
import { Assets } from 'lib/rendering/assets'

// This should be memoised with either the t function or resolved language as a dependency
export function GenerateBasicSetsOptions(): { value: string; label: ReactElement }[] {
  const tGameData = i18next.getFixedT(null, 'gameData', 'RelicSets')
  return SetsRelicsNames
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
