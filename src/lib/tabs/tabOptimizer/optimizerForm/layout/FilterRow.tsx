import { Flex } from '@mantine/core'
import type { RatingFilterState, StatFilterState } from 'lib/stores/optimizerForm/optimizerFormTypes'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { FormStatTextStyled } from 'lib/tabs/tabOptimizer/optimizerForm/components/FormStatTextStyled'
import { InputNumberStyled } from 'lib/tabs/tabOptimizer/optimizerForm/components/InputNumberStyled'

// Mantine NumberInput sends '' when cleared and intermediate strings like '133.' while typing decimals.
// Only update the store for final numeric values or explicit clears.
function filterValue(val: number | string): number | undefined | null {
  if (typeof val === 'number') return val
  if (val === '') return undefined
  return null // intermediate string — don't update store
}

export function FilterRow({ name, label, type }: { name: string; label: string; type?: 'stat' | 'rating' }) {
  const minKey = `min${name}` as keyof StatFilterState & keyof RatingFilterState
  const maxKey = `max${name}` as keyof StatFilterState & keyof RatingFilterState

  const isRating = type === 'rating'

  const minValue = useOptimizerRequestStore((s) =>
    isRating ? s.ratingFilters[minKey as keyof RatingFilterState] : s.statFilters[minKey as keyof StatFilterState],
  )
  const maxValue = useOptimizerRequestStore((s) =>
    isRating ? s.ratingFilters[maxKey as keyof RatingFilterState] : s.statFilters[maxKey as keyof StatFilterState],
  )

  const setFilter = (key: string, val: number | undefined) => {
    if (isRating) {
      useOptimizerRequestStore.getState().setRatingFilter(key as keyof RatingFilterState, val)
    } else {
      useOptimizerRequestStore.getState().setStatFilter(key as keyof StatFilterState, val)
    }
  }

  return (
    <Flex justify='space-between' style={{ margin: 0 }}>
      <InputNumberStyled
        hideControls
        style={{ margin: 0, width: 63 }}
        value={minValue}
        onChange={(val) => { const v = filterValue(val); if (v !== null) setFilter(minKey, v as number | undefined) }}
      />
      <FormStatTextStyled>{label}</FormStatTextStyled>
      <InputNumberStyled
        hideControls
        style={{ margin: 0, width: 63 }}
        value={maxValue}
        onChange={(val) => { const v = filterValue(val); if (v !== null) setFilter(maxKey, v as number | undefined) }}
      />
    </Flex>
  )
}
