import { Popover, Text } from '@mantine/core'
import React, {
  ComponentType,
  ReactNode,
  useCallback,
  useRef,
} from 'react'

export type WithPopoverProps<T> = {
  title: string,
  content: ReactNode,
} & T

function WithPopover<T>(WrappedComponent: ComponentType<T>): ComponentType<WithPopoverProps<T>> {
  const Wrapped = (props: WithPopoverProps<T>) => {
    const [open, setOpen] = React.useState(false)
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

    const handleMouseEnter = useCallback(() => {
      timeoutRef.current = setTimeout(() => setOpen(true), 400)
    }, [])

    const handleMouseLeave = useCallback(() => {
      clearTimeout(timeoutRef.current)
      setOpen(false)
    }, [])

    return (
      <Popover
        position='left'
        opened={open}
        onChange={setOpen}
      >
        <Popover.Target>
          <span
            style={{ width: '100%' }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <WrappedComponent {...props} />
          </span>
        </Popover.Target>
        <Popover.Dropdown>
          <Text fw={600} mb={4}>{props.title}</Text>
          <Text component="div" style={{ width: 400, display: 'block' }}>
            <hr />
            {props.content}
          </Text>
        </Popover.Dropdown>
      </Popover>
    )
  }
  Wrapped.displayName = 'WithPopoverWrapped'
  // @ts-ignore
  return Wrapped
}

WithPopover.displayName = 'WithPopover'
export default WithPopover
