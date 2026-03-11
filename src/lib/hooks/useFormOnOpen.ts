import { UseFormReturnType } from '@mantine/form'
import { DependencyList, useEffect } from 'react'

export function useFormOnOpen<T extends Record<string, unknown>>(
  form: UseFormReturnType<T>,
  open: boolean,
  getDefaults: () => T,
  deps: DependencyList = [],
) {
  useEffect(() => {
    if (!open) return
    form.setValues(getDefaults())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, ...deps])
}
