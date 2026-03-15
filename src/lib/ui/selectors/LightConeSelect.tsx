import { CloseButton, Flex, Modal, TextInput } from '@mantine/core'
import { PathName } from 'lib/constants/constants'
import { Assets } from 'lib/rendering/assets'
import { generateLightConeOptions, LcOptions } from 'lib/rendering/optionGenerator'
import { getGameMetadata } from 'lib/state/gameMetadata'
import {
  generatePathTags,
  generateRarityTags,
  SegmentedFilterRow,
} from 'lib/tabs/tabOptimizer/optimizerForm/components/CardSelectModalComponents'
import { SelectCardGrid } from 'lib/ui/selectors/SelectCardGrid'
import { LC_CARD_IMAGE_HEIGHT, LC_CARD_IMAGE_WIDTH, LC_CARD_IMAGE_X_OFFSET, LC_CARD_IMAGE_Y_OFFSET } from 'lib/ui/selectors/selectConstants'
import { useSelectModal } from 'lib/ui/selectors/useSelectModal'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'
import { CSSProperties, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { CharacterId } from 'types/character'
import { LightConeId } from 'types/lightCone'
import classes from './SelectCardGrid.module.css'

type LightConeFilters = {
  rarity: number[]
  path: PathName[]
  name: string
}

export function LightConeSelect({
  value,
  onChange,
  characterId,
  selectStyle,
  opened,
  onOpenChange,
}: {
  value: LightConeId | null
  onChange: (id: LightConeId | null) => void
  characterId?: CharacterId | null
  selectStyle?: CSSProperties
  opened?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const metadata = getGameMetadata()
  const { t } = useTranslation('modals', { keyPrefix: 'LightconeSelect' })
  const lightConeOptions = useMemo(() => generateLightConeOptions(), [t])

  const defaultFilters = useMemo((): LightConeFilters => ({
    rarity: [],
    path: characterId ? [metadata.characters[characterId].path] : [],
    name: '',
  }), [characterId])

  const {
    isOpen,
    open,
    close,
    inputRef,
    filters,
    setNameFilter,
    updateFilter,
  } = useSelectModal<LightConeFilters>({
    defaultFilters,
    opened,
    onOpenChange,
  })

  function applyFilters(x: LcOptions[LightConeId]) {
    if (filters.rarity.length && !filters.rarity.includes(x.rarity)) return false
    if (filters.path.length && !filters.path.includes(x.path)) return false
    return x.label.toLowerCase().includes(filters.name)
  }

  const handleSelect = (id: LightConeId) => {
    onChange(id)
    close()
  }

  const selectedLabel = useMemo(() => {
    if (!value) return ''
    return lightConeOptions.find((opt) => opt.value === value)?.label ?? ''
  }, [value, lightConeOptions])

  const filteredOptions = useMemo(
    () => lightConeOptions.filter(applyFilters),
    [lightConeOptions, filters],
  )

  return (
    <>
      <TextInput
        readOnly
        style={selectStyle}
        value={selectedLabel}
        placeholder={t('Placeholder')}
        onClick={open}
        rightSectionPointerEvents="all"
        rightSection={value
          ? <CloseButton size="xs" onClick={(e) => { e.stopPropagation(); onChange(null) }} />
          : null}
        styles={{ input: { cursor: 'pointer', textOverflow: 'ellipsis', paddingRight: value ? 28 : undefined, fontSize: 14 } }}
      />

      <Modal
        opened={isOpen}
        onClose={close}
        centered
        size="90%"
        styles={{ content: { height: '70%', maxWidth: 1200 }, body: { height: 'calc(100% - 60px)', overflow: 'hidden' } }}
        title={t('Title')}
      >
        {isOpen && (
          <div className={classes.modalContent}>
            <Flex gap={12} wrap="wrap">
              <TextInput
                className={classes.searchInput}
                styles={{ wrapper: { height: 40 }, input: { height: 40, minHeight: 40 } }}
                placeholder={t('Placeholder')}
                ref={inputRef}
                autoFocus
                onChange={setNameFilter}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const first = filteredOptions[0]
                    if (first) handleSelect(first.id)
                  }
                }}
              />
              <Flex wrap="wrap" className={classes.filterWrapper} gap={12}>
                <Flex wrap="wrap" className={classes.filterWrapper}>
                  <SegmentedFilterRow
                    tags={generatePathTags()}
                    flexBasis="11.111%"
                    currentFilter={filters.path}
                    setCurrentFilters={(v) => updateFilter('path', v)}
                  />
                </Flex>
                <Flex wrap="wrap" className={classes.filterWrapper}>
                  <SegmentedFilterRow
                    tags={generateRarityTags()}
                    flexBasis="14.2%"
                    currentFilter={filters.rarity}
                    setCurrentFilters={(v) => updateFilter('rarity', v)}
                  />
                </Flex>
              </Flex>
            </Flex>

            <OverlayScrollbarsComponent className={classes.scrollArea} defer options={{ scrollbars: { autoHide: 'move', autoHideDelay: 500 } }}>
              <SelectCardGrid<LightConeId>
                options={filteredOptions}
                onSelect={handleSelect}
                getImageSrc={Assets.getLightConeIconById}
                cardImageHeight={LC_CARD_IMAGE_HEIGHT}
                imageWidth={LC_CARD_IMAGE_WIDTH}
                imageXOffset={LC_CARD_IMAGE_X_OFFSET}
                imageYOffset={LC_CARD_IMAGE_Y_OFFSET}
                textRows={2}
              />
            </OverlayScrollbarsComponent>
          </div>
        )}
      </Modal>
    </>
  )
}
