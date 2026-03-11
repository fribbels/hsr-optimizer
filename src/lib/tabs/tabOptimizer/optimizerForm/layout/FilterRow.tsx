import { Flex } from '@mantine/core'
import { RatingFilterState, StatFilterState } from 'lib/stores/optimizerForm/optimizerFormTypes'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import FormStatTextStyled from 'lib/tabs/tabOptimizer/optimizerForm/components/FormStatTextStyled'
import InputNumberStyled from 'lib/tabs/tabOptimizer/optimizerForm/components/InputNumberStyled'

const FilterRow = (props: { name: string; label: string; type?: 'stat' | 'rating' }) => {
  const minKey = `min${props.name}` as keyof StatFilterState & keyof RatingFilterState
  const maxKey = `max${props.name}` as keyof StatFilterState & keyof RatingFilterState

  const isRating = props.type === 'rating'

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
        size='xs'
        hideControls
        style={{ margin: 0, width: 63 }}
        value={minValue}
        onChange={(val) => setFilter(minKey as never, (val as number) ?? undefined)}
      />
      <FormStatTextStyled>{props.label}</FormStatTextStyled>
      <InputNumberStyled
        size='xs'
        hideControls
        style={{ margin: 0, width: 63 }}
        value={maxValue}
        onChange={(val) => setFilter(maxKey as never, (val as number) ?? undefined)}
      />
    </Flex>
  )
}

export default FilterRow
