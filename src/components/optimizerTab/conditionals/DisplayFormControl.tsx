import { ComponentType, ReactElement } from 'react'
import { Flex } from 'antd'
import ColorizeNumbers from 'components/common/ColorizeNumbers'
import { FormSliderWithPopover } from 'components/optimizerTab/conditionals/FormSlider'
import { FormSwitchWithPopover } from 'components/optimizerTab/conditionals/FormSwitch'
import { ContentComponentMap, ContentItem } from 'types/Conditionals'
import { useTranslation } from 'react-i18next'
import { FormSelectWithPopover } from 'components/optimizerTab/conditionals/FormSelect'

export const FormItemComponentMap: ContentComponentMap = {
  switch: FormSwitchWithPopover,
  slider: FormSliderWithPopover,
  select: FormSelectWithPopover,
}

export interface DisplayFormControlProps {
  content?: ContentItem[]
  teammateIndex?: number
}

const DisplayFormControl: ComponentType<DisplayFormControlProps> = ({ content: content, teammateIndex: teammateIndex }) => {
  const { t } = useTranslation('optimizerTab')
  const ret: ReactElement[] = []
  let i = 0

  if (!content) {
    if (teammateIndex != null) {
      ret.push(<div key={i++}>{t('NoTeamConditionals')/* No conditional team passives */}</div>)
    } else {
      ret.push(<div key={i++}>{t('NoConditionals')/* No conditional passives */}</div>)
    }
  } else if (content.length === 0) {
    if (teammateIndex != null) {
      ret.push(<div key={i++}>{t('NoTeamConditionals')/* No conditional team passives */}</div>)
    } else {
      ret.push(<div key={i++}>{t('NoConditionals')/* No conditional passives */}</div>)
    }
  } else {
    content.forEach((passive) => {
      const Item = FormItemComponentMap[passive.formItem]
      passive.teammateIndex = teammateIndex

      ret.push(
        // @ts-ignore
        <Item
          {...passive}
          name={passive.id}
          title={passive.title}
          content={ColorizeNumbers(passive.content)}
          text={passive.text}
          key={i++}
        />,
      )
      i++
    })
  }

  return (<Flex vertical gap={5}>{ret}</Flex>)
}

export default DisplayFormControl
