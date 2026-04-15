import { type UseFormReturnType } from '@mantine/form'
import {
  type DependencyList,
  useEffect,
} from 'react'

/**
 * Initializes form values on mount and whenever `deps` items change.
 * `deps` must be a static-length array — React requires hook dep arrays
 * to never change length between renders.
 */
export function useFormOnOpen<T extends Record<string, unknown>>(
  form: UseFormReturnType<T>,
  getDefaults: () => T,
  deps: DependencyList = [],
) {
  useEffect(() => {
    form.setValues(getDefaults())
    // form and getDefaults are intentionally excluded: form.setValues writes
    // to stable internal refs regardless of object identity; getDefaults should
    // capture state at open time, not re-run on every parent re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps])
}
