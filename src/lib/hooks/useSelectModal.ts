import { TsUtils } from 'lib/utils/TsUtils'
import { ChangeEvent, useEffect, useRef, useState } from 'react'

export interface UseSelectModalOptions<TFilters extends Record<string, unknown>> {
  defaultFilters: TFilters
  externalOpen?: boolean
  onOpen?: () => void
}

export function useSelectModal<TFilters extends Record<string, unknown>>(
  options: UseSelectModalOptions<TFilters>,
) {
  const { defaultFilters, externalOpen, onOpen } = options
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [currentFilters, setCurrentFilters] = useState<TFilters>(TsUtils.clone(defaultFilters))

  const isOpen = open || !!externalOpen

  useEffect(() => {
    if (isOpen) {
      setCurrentFilters(TsUtils.clone(defaultFilters))
      setTimeout(() => inputRef.current?.focus(), 100)
      onOpen?.()
    }
  }, [open, externalOpen])

  const setNameFilter = (e: ChangeEvent<HTMLInputElement>) => {
    setCurrentFilters((prev) => ({ ...prev, name: e.target.value.toLowerCase() }))
  }

  const updateFilter = <K extends keyof TFilters>(key: K, value: TFilters[K]) => {
    setCurrentFilters((prev) => ({ ...prev, [key]: value }))
  }

  const resetAndOpen = () => {
    setOpen(true)
    setCurrentFilters(TsUtils.clone(defaultFilters))
  }

  return {
    open,
    setOpen,
    isOpen,
    inputRef,
    currentFilters,
    setCurrentFilters,
    setNameFilter,
    updateFilter,
    resetAndOpen,
  }
}
