import { ComponentType, ReactElement } from 'react'
import { Flex } from 'antd'
import ColorizeNumbers from 'components/common/ColorizeNumbers.tsx'
import { FormSliderWithPopover } from 'components/optimizerTab/conditionals/FormSlider.tsx'
import { FormSwitchWithPopover } from 'components/optimizerTab/conditionals/FormSwitch.tsx'
import { ContentComponentMap, ContentItem } from 'types/Conditionals'

const FormItemComponentMap: ContentComponentMap = {
  switch: FormSwitchWithPopover,
  slider: FormSliderWithPopover,
}

export interface DisplayFormControlProps {
  content?: ContentItem[]
  teammateIndex?: number
}

const DisplayFormControl: ComponentType<DisplayFormControlProps> = ({ content: content, teammateIndex: teammateIndex }) => {
  const ret: ReactElement[] = []
  let i = 0

  if (!content) {
    if (teammateIndex != null) {
      ret.push(<div key={i++}>Team passives still under construction</div>)
    } else {
      ret.push(<div key={i++}>No conditional passives</div>)
    }
  } else if (content.length === 0) {
    if (teammateIndex != null) {
      ret.push(<div key={i++}>No conditional team passives</div>)
    } else {
      ret.push(<div key={i++}>No conditional passives</div>)
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

  return (<Flex vertical gap={8}>{ret}</Flex>)
}

export default DisplayFormControl
