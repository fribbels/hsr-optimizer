import { Constants, UnreleasedSets } from 'lib/constants'
import { Assets } from 'lib/assets'
import { Flex } from 'antd'
import React from 'react'

// Sets
export function getSetOptions() {
  const setOptions = []
  for (const entry of [...Object.entries(Constants.SetsRelics), ...Object.entries(Constants.SetsOrnaments)].filter((x) => !UnreleasedSets[x[1]])) {
    setOptions.push({
      label: generateImageLabel(entry[1], Assets.getSetImage),
      value: entry[1],
    })
  }

  return setOptions
}

// Stats
export const substatOptions = []
for (const entry of Object.entries(Constants.SubStats)) {
  substatOptions.push({
    label: generateImageLabel(entry[1], (x) => Assets.getStatIcon(x, true), 22),
    value: entry[1],
  })
}

// Enhance
export const enhanceOptions = []
for (let i = 15; i >= 0; i--) {
  enhanceOptions.push({ value: i, label: '+' + i })
}

// Utils
export function generateImageLabel(value, srcFn, size = 22) {
  return (
    <Flex align='center' gap={10}>
      <img src={srcFn(value)} style={{ width: size, height: size }}/>
      {value}
    </Flex>
  )
}
