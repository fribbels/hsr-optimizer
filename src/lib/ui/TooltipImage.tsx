import { Popover } from 'antd'
import { HintContent } from 'lib/interactions/hint'
import { Assets } from 'lib/rendering/assets'
import React from 'react'

export const TooltipImage = (props: { type: HintContent }) => (
  <Popover
    content={props.type.content}
    title={props.type.title}
    overlayStyle={{
      width: 500,
    }}
  >
    <img src={Assets.getQuestion()} style={{ width: 16, opacity: 0.6 }} />
  </Popover>
)
