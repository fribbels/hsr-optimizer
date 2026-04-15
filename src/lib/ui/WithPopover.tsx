import {
  Popover,
  Text,
} from '@mantine/core'
import {
  type ComponentType,
  type ReactNode,
  useCallback,
  useRef,
  useState,
} from 'react'

export type WithPopoverProps<T> = {
  title: string,
  content: ReactNode,
} & T

function WithPopover<T>(WrappedComponent: ComponentType<T>): ComponentType<WithPopoverProps<T>> {
  const Wrapped = (props: WithPopoverProps<T>) => {
    const [open, setOpen] = useState(false)
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

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
        <Popover.Dropdown data-testid='conditional-popover'>
          {open && (
            <>
              <Text fw={600} mb={4} size='sm'>{props.title}</Text>
              <Text component='div' size='sm' style={{ width: 400, display: 'block' }}>
                <hr />
                {props.content}
              </Text>
            </>
          )}
        </Popover.Dropdown>
      </Popover>
    )
  }
  Wrapped.displayName = 'WithPopoverWrapped'
  return Wrapped as ComponentType<WithPopoverProps<T>>
}

export { WithPopover }
