import { Popover, Typography } from 'antd'
import React, { ComponentType, ReactNode } from 'react'

const { Text } = Typography

export type WithPopoverProps<T> = {
  title: string
  content: ReactNode
} & T

function WithPopover<T>(WrappedComponent: ComponentType<T>): ComponentType<WithPopoverProps<T>> {
  const Wrapped = (props: WithPopoverProps<T>) => {
    const [open, setOpen] = React.useState(false)
    const content = (
      <Text style={{ width: 400, display: 'block' }}>
        <hr/>
        {props.content}
      </Text>
    )
    return (
      <Popover
        trigger='hover'
        placement='left'
        content={content}
        title={props.title}
        open={open}
        mouseEnterDelay={0.4}
        onOpenChange={setOpen}
      >
        <span style={{ width: '100%' }}>
          <WrappedComponent {...props}/>
        </span>
      </Popover>
    )
  }
  Wrapped.displayName = 'WithPopoverWrapped'
  // @ts-ignore
  return Wrapped
}

WithPopover.displayName = 'WithPopover'
export default WithPopover
