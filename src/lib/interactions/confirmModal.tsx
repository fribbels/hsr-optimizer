import { Modal } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import React, { createContext, useEffect, useMemo, useState } from 'react'

type ConfirmModalOptions = {
  content: React.ReactNode
  width?: string | number
  closeOnClickOutside?: boolean
}

type ConfirmModalContextType = {
  info: (options: ConfirmModalOptions) => void
}

const ConfirmModalContext = createContext<ConfirmModalContextType | null>(null)

// Module-level ref for imperative access (replaces window.modalApi)
let globalConfirmModal: ConfirmModalContextType | null = null

export function getConfirmModal() {
  return globalConfirmModal
}

export function ConfirmModalProvider(props: { children: React.ReactNode }) {
  const [opened, { open, close }] = useDisclosure(false)
  const [options, setOptions] = useState<ConfirmModalOptions>({
    content: null,
  })

  const api = useMemo<ConfirmModalContextType>(() => ({
    info: (opts: ConfirmModalOptions) => {
      setOptions(opts)
      open()
    },
  }), [open])

  useEffect(() => {
    globalConfirmModal = api
  }, [api])

  return (
    <ConfirmModalContext.Provider value={api}>
      {props.children}
      <Modal
        opened={opened}
        onClose={close}
        size={options.width ?? 'md'}
        closeOnClickOutside={options.closeOnClickOutside ?? true}
        centered
      >
        {options.content}
      </Modal>
    </ConfirmModalContext.Provider>
  )
}
