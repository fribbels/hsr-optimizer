import { Modal } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import React, {
  useEffect,
  useMemo,
  useState,
} from 'react'

type ConfirmModalOptions = {
  content: React.ReactNode,
  width?: string | number,
  closeOnClickOutside?: boolean,
}

type ConfirmModalApi = {
  info: (options: ConfirmModalOptions) => void,
}

// Module-level ref for imperative access (replaces window.modalApi)
let globalConfirmModal: ConfirmModalApi | null = null

export function getConfirmModal() {
  return globalConfirmModal
}

export function ConfirmModalProvider(props: { children: React.ReactNode }) {
  const [opened, { open, close }] = useDisclosure(false)
  const [options, setOptions] = useState<ConfirmModalOptions>({
    content: null,
  })

  const api = useMemo<ConfirmModalApi>(() => ({
    info: (opts: ConfirmModalOptions) => {
      setOptions(opts)
      open()
    },
  }), [open])

  useEffect(() => {
    globalConfirmModal = api
    return () => {
      globalConfirmModal = null
    }
  }, [api])

  return (
    <>
      {props.children}
      <Modal
        opened={opened}
        onClose={close}
        size={options.width ?? 'md'}
        closeOnClickOutside={options.closeOnClickOutside ?? true}
        centered
      >
        {opened && options.content}
      </Modal>
    </>
  )
}
