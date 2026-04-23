import { Flex } from '@mantine/core'
import {
  useRef,
  useState,
} from 'react'
import type {
  RatingFilterState,
  StatFilterState,
} from 'lib/stores/optimizerForm/optimizerFormTypes'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { FormStatTextStyled } from 'lib/tabs/tabOptimizer/optimizerForm/components/FormStatTextStyled'
import { InputNumberStyled } from 'lib/tabs/tabOptimizer/optimizerForm/components/InputNumberStyled'

export function FilterRow({ name, label, type }: { name: string, label: string, type?: 'stat' | 'rating' }) {
  const minKey = `min${name}` as keyof StatFilterState & keyof RatingFilterState
  const maxKey = `max${name}` as keyof StatFilterState & keyof RatingFilterState

  const isRating = type === 'rating'

  const minValue = useOptimizerRequestStore((s) =>
    isRating ? s.ratingFilters[minKey as keyof RatingFilterState] : s.statFilters[minKey as keyof StatFilterState]
  )
  const maxValue = useOptimizerRequestStore((s) =>
    isRating ? s.ratingFilters[maxKey as keyof RatingFilterState] : s.statFilters[maxKey as keyof StatFilterState]
  )

  // Local-state pattern: NumberInput is driven by `localMin/Max`, not the store value directly.
  // This is required because Mantine's `useUncontrolled` flips the component into uncontrolled mode
  // whenever `value === undefined` (e.g., when presets reset the filter). On the transition back,
  // react-number-format's stale internal `numAsString` leaks out as a spurious `onChange` with a
  // truncated value (e.g., "16" after clearing "160"), which then corrupts the store.
  // Fix: keep the component always controlled with a defined value (`number | ''`), and only commit
  // to the store on blur. Spurious onChange events now only mutate local state, never the store.
  // See `.claude/react-guidelines.md` → "Mantine Controlled Inputs — Never Pass `undefined` as `value`".
  const [localMin, setLocalMin] = useState<number | string>(minValue ?? '')
  const [localMax, setLocalMax] = useState<number | string>(maxValue ?? '')
  const minFocusedRef = useRef(false)
  const maxFocusedRef = useRef(false)

  // Sync external store changes into local state, but not while the user is typing.
  if (!minFocusedRef.current) {
    if (minValue != null && minValue !== localMin) setLocalMin(minValue)
    else if (minValue == null && localMin !== '') setLocalMin('')
  }
  if (!maxFocusedRef.current) {
    if (maxValue != null && maxValue !== localMax) setLocalMax(maxValue)
    else if (maxValue == null && localMax !== '') setLocalMax('')
  }

  const setFilter = (key: string, val: number | undefined) => {
    if (isRating) {
      useOptimizerRequestStore.getState().setRatingFilter(key as keyof RatingFilterState, val)
    } else {
      useOptimizerRequestStore.getState().setStatFilter(key as keyof StatFilterState, val)
    }
  }

  const commitMin = () => {
    minFocusedRef.current = false
    const v = localMin === '' ? undefined : typeof localMin === 'number' ? localMin : Number(localMin)
    if (v !== minValue) setFilter(minKey, v)
  }

  const commitMax = () => {
    maxFocusedRef.current = false
    const v = localMax === '' ? undefined : typeof localMax === 'number' ? localMax : Number(localMax)
    if (v !== maxValue) setFilter(maxKey, v)
  }

  return (
    <Flex justify='space-between' style={{ margin: 0 }}>
      <InputNumberStyled
        hideControls
        style={{ margin: 0, width: 63 }}
        value={localMin}
        onChange={setLocalMin}
        onFocus={() => {
          minFocusedRef.current = true
        }}
        onBlur={commitMin}
      />
      <FormStatTextStyled>{label}</FormStatTextStyled>
      <InputNumberStyled
        hideControls
        style={{ margin: 0, width: 63 }}
        value={localMax}
        onChange={setLocalMax}
        onFocus={() => {
          maxFocusedRef.current = true
        }}
        onBlur={commitMax}
      />
    </Flex>
  )
}
