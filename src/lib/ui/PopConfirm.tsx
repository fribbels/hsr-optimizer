import { Button, Flex, Popover, PopoverProps, Text } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { CSSProperties, ReactElement, ReactNode, Ref } from 'react'

const contentsStyle: CSSProperties = { display: 'contents' }

function PopConfirmTarget({ children, onClick, ref, ...rest }: { children: ReactElement; onClick: () => void; ref?: Ref<HTMLSpanElement> }) {
  return (
    <span ref={ref} onClick={onClick} style={contentsStyle} {...rest}>{children}</span>
  )
}

export function PopConfirm(props: {
  title: ReactNode
  description?: ReactNode
  onConfirm: () => void
  okText?: string
  cancelText?: string
  placement?: PopoverProps['position']
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: ReactElement
}) {
  const [internalOpened, { open: internalOpen, close: internalClose }] = useDisclosure(false)
  const isControlled = props.open !== undefined
  const opened = isControlled ? props.open : internalOpened

  const open = () => {
    if (isControlled) {
      props.onOpenChange?.(true)
    } else {
      internalOpen()
    }
  }

  const close = () => {
    if (isControlled) {
      props.onOpenChange?.(false)
    } else {
      internalClose()
    }
  }

  return (
    <Popover opened={opened} onClose={close} position={props.placement ?? 'bottom'}>
      <Popover.Target>
        <PopConfirmTarget onClick={open}>{props.children}</PopConfirmTarget>
      </Popover.Target>
      <Popover.Dropdown>
        <Flex direction="column" gap={8}>
          <Text fw={600} size="sm">{props.title}</Text>
          {props.description && <Text size="sm">{props.description}</Text>}
          <Flex gap={8} justify="flex-end">
            <Button variant="default" onClick={close}>{props.cancelText ?? 'Cancel'}</Button>
            <Button onClick={() => { props.onConfirm(); close() }}>{props.okText ?? 'OK'}</Button>
          </Flex>
        </Flex>
      </Popover.Dropdown>
    </Popover>
  )
}
