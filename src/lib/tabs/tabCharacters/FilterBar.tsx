import {
  Flex,
  Input,
} from 'antd'
import { useCharacterTabStore } from 'lib/tabs/tabCharacters/useCharacterTabStore'
import {
  generateElementTags,
  generatePathTags,
  SegmentedFilterRow,
} from 'lib/tabs/tabOptimizer/optimizerForm/components/CardSelectModalComponents'
import React from 'react'
import { useTranslation } from 'react-i18next'

export function FilterBar() {
  const { t } = useTranslation('charactersTab')
  const pathFilter = useCharacterTabStore((s) => s.filters.path)
  const setPathFilter = useCharacterTabStore((s) => s.setPathFilter)
  const elementFilter = useCharacterTabStore((s) => s.filters.element)
  const setElementFilter = useCharacterTabStore((s) => s.setElementFilter)
  const setNameFilter = useCharacterTabStore((s) => s.setNameFilter)

  return (
    <Flex
      gap={8}
      style={{ width: '100%', marginBottom: 0, alignItems: 'center' }}
      justify='space-between'
    >
      <Input
        allowClear
        size='large'
        // Revisit width of search + filters with Remembrance path
        style={{ height: 40, fontSize: 14, width: 200, borderRadius: 8 }}
        placeholder={t('SearchPlaceholder') /* Search */}
        onChange={(e) => {
          setNameFilter(e.target.value.toLowerCase())
        }}
      />
      <Flex style={{ flex: 1 }}>
        <SegmentedFilterRow
          tags={generatePathTags()}
          flexBasis='11.111%'
          currentFilter={pathFilter}
          setCurrentFilters={setPathFilter}
        />
      </Flex>
      <Flex
        // Selected to align with relics panel
        style={{ width: 408 }}
      >
        <SegmentedFilterRow
          tags={generateElementTags()}
          flexBasis='14.2%'
          currentFilter={elementFilter}
          setCurrentFilters={setElementFilter}
        />
      </Flex>
    </Flex>
  )
}
