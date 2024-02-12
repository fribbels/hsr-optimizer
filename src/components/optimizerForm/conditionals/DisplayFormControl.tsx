import { ComponentType, ReactElement } from 'react'
import PropTypes from 'prop-types'
import { Flex } from 'antd'
import ColorizeNumbers from 'components/common/ColorizeNumbers'
import { FormSliderWithPopover } from './FormSlider'
import { FormSwitchWithPopover } from './FormSwitch'
import { ContentComponentMap, ContentItem } from 'types/Conditionals'

const FormItemComponentMap: ContentComponentMap = {
  switch: FormSwitchWithPopover,
  slider: FormSliderWithPopover,
}

export interface DisplayFormControlProps {
  content: ContentItem[]
}

const DisplayFormControl: ComponentType<DisplayFormControlProps> = ({ content }) => {
  const ret: ReactElement[] = []
  let i = 0

  if (!content || content.length === 0) {
    ret.push(<div key={i++}>No conditional passives</div>)
  } else {
    content.forEach((passive) => {
      const Item = FormItemComponentMap[passive.formItem]
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

  return (<Flex vertical gap={10}>{ret}</Flex>)
}

DisplayFormControl.propTypes = {
  content: PropTypes.array.isRequired,
}

export default DisplayFormControl
