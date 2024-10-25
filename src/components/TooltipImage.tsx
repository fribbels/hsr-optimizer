import React from 'react'
import { Popover } from 'antd'
import PropTypes from 'prop-types'
import { Assets } from 'lib/assets'
import { HintContent } from 'lib/hint'

export const TooltipImage = (props: { type: HintContent }) => (
  <Popover
    content={props.type.content}
    title={props.type.title}
    overlayStyle={{
      width: 500,
    }}
  >
    <img src={Assets.getQuestion()} style={{ width: 16, opacity: 0.6 }}/>
  </Popover>
)
TooltipImage.propTypes = {
  type: PropTypes.object,
}
