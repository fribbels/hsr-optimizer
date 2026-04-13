import { Flex, TextInput } from '@mantine/core'
import { useCharacterTabStore } from 'lib/tabs/tabCharacters/useCharacterTabStore'
import {
  generateElementTags,
  generatePathTags,
  SegmentedFilterRow,
} from 'lib/ui/selectors/CardSelectModalComponents'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

export const FilterBar = memo(function FilterBar() {
  const { t } = useTranslation('charactersTab')
  const { pathFilter, setPathFilter, elementFilter, setElementFilter, setNameFilter } = useCharacterTabStore(
    useShallow((s) => ({
      pathFilter: s.filters.path,
      setPathFilter: s.setPathFilter,
      elementFilter: s.filters.element,
      setElementFilter: s.setElementFilter,
      setNameFilter: s.setNameFilter,
    })),
  )

  return (
    <Flex
      gap={8}
      w='100%'
      mb={0}
      align='center'
      justify='space-between'
    >
      <TextInput
        // Revisit width of search + filters with Remembrance path
        styles={{ input: { height: 40, lineHeight: '40px', fontSize: 14, borderRadius: 4 } }}
        w={200}
        placeholder={t('SearchPlaceholder') /* Search */}
        onChange={(e) => {
          setNameFilter(e.target.value.toLowerCase())
        }}
      />
      <div style={{ flex: 1 }}>
        <SegmentedFilterRow
          tags={generatePathTags()}
          flexBasis='11.111%'
          currentFilter={pathFilter}
          setCurrentFilters={setPathFilter}
        />
      </div>
      <div
        // Selected to align with relics panel
        style={{ width: 421 }}
      >
        <SegmentedFilterRow
          tags={generateElementTags()}
          flexBasis='14.2%'
          currentFilter={elementFilter}
          setCurrentFilters={setElementFilter}
        />
      </div>
    </Flex>
  )
})
