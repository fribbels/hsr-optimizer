import { Flex } from '@mantine/core'
import { FormSelectWithPopover } from 'lib/tabs/tabOptimizer/conditionals/FormSelect'
import { FormSliderWithPopover } from 'lib/tabs/tabOptimizer/conditionals/FormSlider'
import { FormSwitchWithPopover } from 'lib/tabs/tabOptimizer/conditionals/FormSwitch'
import { ColorizeNumbers } from 'lib/ui/ColorizeNumbers'
import { useTranslation } from 'react-i18next'
import type {
  ContentComponentMap,
  ContentItem,
} from 'types/conditionals'

const FormItemComponentMap: ContentComponentMap = {
  switch: FormSwitchWithPopover,
  slider: FormSliderWithPopover,
  select: FormSelectWithPopover,
}

export function DisplayFormControl({ content, teammateIndex }: {
  content?: ContentItem[]
  teammateIndex?: number
}) {
  const { t } = useTranslation('optimizerTab')

  if (!content || content.length === 0) {
    const message = teammateIndex != null
      ? t('NoTeamConditionals') /* No conditional team passives */
      : t('NoConditionals') /* No conditional passives */
    return <Flex direction="column" gap={5}><div>{message}</div></Flex>
  }

  return (
    <Flex direction="column" gap={5}>
      {content.map((passive, i) => {
        const Item = FormItemComponentMap[passive.formItem]
        return (
          // @ts-expect-error - dynamic component from FormItemComponentMap has varied prop types
          <Item
            {...passive}
            title={passive.text}
            teammateIndex={teammateIndex}
            content={ColorizeNumbers(passive.content)}
            text={passive.text}
            key={i}
          />
        )
      })}
    </Flex>
  )
}
