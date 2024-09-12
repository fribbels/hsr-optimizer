import { Constants, setToId } from 'lib/constants'
import { Assets } from 'lib/assets'
import { Flex } from 'antd'
import { UnreleasedSets } from 'lib/dataParser'
import i18next from 'i18next'

// Sets
export function getSetOptions() {
  const setOptions = []
  for (const entry of [...Object.entries(Constants.SetsRelics), ...Object.entries(Constants.SetsOrnaments)].filter((x) => !UnreleasedSets[x[1]])) {
    setOptions.push({
      label: (() => {
        return (
          <Flex align='center' gap={10}>
            <img style={{ height: 22, width: 22 }} src={Assets.getSetImage(entry[1])}/>
            {i18next.t(`gameData:relicsets.${setToId[entry[1]]}`)}
          </Flex>
        )
      })(),
      value: entry[1],
    })
  }

  return setOptions
}

// Stats

// Enhance
export const enhanceOptions = []
for (let i = 15; i >= 0; i--) {
  enhanceOptions.push({ value: i, label: '+' + i })
}
