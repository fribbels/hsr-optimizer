import {
  useRef,
  useState,
} from 'react'

/**
 * Drives a Mantine NumberInput with local state, committing to the external
 * value only on blur. Avoids `useUncontrolled` mode flips (which leak stale
 * `numAsString` values through spurious onChange events) by keeping the
 * component always controlled with a defined value (`number | ''`).
 *
 * See `.claude/react-guidelines.md` → "Mantine Controlled Inputs".
 */
export function useBlurCommittedNumberInput(
  externalValue: number | undefined,
  onCommit: (value: number | undefined) => void,
) {
  const [localValue, setLocalValue] = useState<number | string>(externalValue ?? '')
  const focusedRef = useRef(false)

  if (!focusedRef.current) {
    if (externalValue != null && externalValue !== localValue) setLocalValue(externalValue)
    else if (externalValue == null && localValue !== '') setLocalValue('')
  }

  const commit = () => {
    focusedRef.current = false
    const v = localValue === '' ? undefined : typeof localValue === 'number' ? localValue : Number(localValue)
    if (v !== externalValue) onCommit(v)
  }

  return {
    value: localValue,
    onChange: setLocalValue,
    onFocus: () => {
      focusedRef.current = true
    },
    onBlur: commit,
    setValue: setLocalValue,
  }
}
