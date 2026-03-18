import { Flex } from '@mantine/core'
import type { RatingFilterState, StatFilterState } from 'lib/stores/optimizerForm/optimizerFormTypes'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { FormStatTextStyled } from 'lib/tabs/tabOptimizer/optimizerForm/components/FormStatTextStyled'
import { InputNumberStyled } from 'lib/tabs/tabOptimizer/optimizerForm/components/InputNumberStyled'

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

  const setFilter = isRating
    ? (key: keyof RatingFilterState, val: number | undefined) => useOptimizerRequestStore.getState().setRatingFilter(key, val)
    : (key: keyof StatFilterState, val: number | undefined) => useOptimizerRequestStore.getState().setStatFilter(key, val)

  return (
    <Flex justify='space-between' style={{ margin: 0 }}>
      <InputNumberStyled
        hideControls
        style={{ margin: 0, width: 63 }}
        value={minValue}
        onChange={(val: number | string) => setFilter(minKey as never, (val as number) ?? undefined)}
      />
      <FormStatTextStyled>{label}</FormStatTextStyled>
      <InputNumberStyled
        hideControls
        style={{ margin: 0, width: 63 }}
        value={maxValue}
        onChange={(val: number | string) => setFilter(maxKey as never, (val as number) ?? undefined)}
      />
    </Flex>
  )
}
