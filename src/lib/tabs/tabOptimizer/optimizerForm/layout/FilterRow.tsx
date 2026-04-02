import { Flex } from '@mantine/core'
import type { RatingFilterState, StatFilterState } from 'lib/stores/optimizerForm/optimizerFormTypes'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { FormStatTextStyled } from 'lib/tabs/tabOptimizer/optimizerForm/components/FormStatTextStyled'
import { InputNumberStyled } from 'lib/tabs/tabOptimizer/optimizerForm/components/InputNumberStyled'

// Mantine NumberInput sends '' (empty string) when cleared.
// Convert to undefined so displayToInternal correctly defaults to 0/MAX_INT.
function filterValue(val: number | string): number | undefined {
  return typeof val === 'number' ? val : undefined
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
        onChange={(val) => setFilter(minKey, filterValue(val))}
      />
      <FormStatTextStyled>{label}</FormStatTextStyled>
      <InputNumberStyled
        hideControls
        style={{ margin: 0, width: 63 }}
        value={maxValue}
        onChange={(val) => setFilter(maxKey, filterValue(val))}
      />
    </Flex>
  )
}
