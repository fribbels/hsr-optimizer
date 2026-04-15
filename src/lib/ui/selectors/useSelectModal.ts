import { clone } from 'lib/utils/objectUtils'
import {
  type ChangeEvent,
  useCallback,
  useRef,
  useState,
} from 'react'

export interface UseSelectModalOptions<TFilters extends Record<string, unknown>> {
  defaultFilters: TFilters
  opened?: boolean
  onOpenChange?: (open: boolean) => void
}

export interface UseSelectModalReturn<TFilters> {
  isOpen: boolean
  open: () => void
  close: () => void
  inputRef: React.RefObject<HTMLInputElement | null>
  filters: TFilters
  setNameFilter: (e: ChangeEvent<HTMLInputElement>) => void
  updateFilter: <K extends keyof TFilters>(key: K, value: TFilters[K]) => void
}

export function useSelectModal<TFilters extends Record<string, unknown>>(
  options: UseSelectModalOptions<TFilters>,
): UseSelectModalReturn<TFilters> {
  const { defaultFilters, opened, onOpenChange } = options
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [internalOpen, setInternalOpen] = useState(false)
  const [filters, setFilters] = useState<TFilters>(() => clone(defaultFilters))

  // Always keep ref in sync so open() reads the latest defaultFilters
  const defaultFiltersRef = useRef(defaultFilters)
  defaultFiltersRef.current = defaultFilters

  const onOpenChangeRef = useRef(onOpenChange)
  onOpenChangeRef.current = onOpenChange

  const isOpen = opened ?? internalOpen

  const open = useCallback(() => {
    setFilters(clone(defaultFiltersRef.current))
    setInternalOpen(true)
    onOpenChangeRef.current?.(true)
  }, [])

  const close = useCallback(() => {
    setInternalOpen(false)
    onOpenChangeRef.current?.(false)
  }, [])

  const setNameFilter = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, name: e.target.value.toLowerCase() }))
  }, [])

  const updateFilter = useCallback(<K extends keyof TFilters>(key: K, value: TFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }, [])

  return {
    isOpen,
    open,
    close,
    inputRef,
    filters,
    setNameFilter,
    updateFilter,
  }
}
