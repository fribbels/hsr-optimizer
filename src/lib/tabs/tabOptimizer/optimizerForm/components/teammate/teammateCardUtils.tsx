import { Flex } from '@mantine/core'
import type { TFunction } from 'i18next'
import {
  Constants,
} from 'lib/constants/constants'
import { Assets } from 'lib/rendering/assets'
import {
  teammateOrnamentOptions,
  teammateRelicOptions,
} from 'lib/sets/setConfigRegistry'
import iconClasses from 'style/icons.module.css'

import type { ReactElement } from 'types/components'

const labelRender = (set: string, text: string) => (
  <Flex align='center' gap={3}>
    <img src={Assets.getSetImage(set, Constants.Parts.PlanarSphere)} className={iconClasses.icon20} />
    <div style={{ fontSize: 12 }}>
      {text}
    </div>
  </Flex>
)

export type OptionRender = {
  value: string,
  desc: string,
  text: string,
  label: ReactElement,
}

export function renderTeammateRelicSetOptions(t: TFunction<'optimizerTab', 'TeammateCard'>) {
  return () => {
    return teammateRelicOptions.map((option) => ({
      value: option.value,
      desc: option.desc(t),
      text: option.label(t),
      label: labelRender(option.value, option.label(t)),
    }))
  }
}

export function renderTeammateOrnamentSetOptions(t: TFunction<'optimizerTab', 'TeammateCard'>) {
  return () => {
    return teammateOrnamentOptions.map((option) => ({
      value: option.value,
      desc: option.desc(t),
      text: option.label(t),
      label: labelRender(option.value, option.label(t)),
    }))
  }
}
