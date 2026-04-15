import {
  CloseButton,
  Flex,
  Modal,
  TextInput,
} from '@mantine/core'
import type { PathName } from 'lib/constants/constants'
import { Assets } from 'lib/rendering/assets'
import { getGameMetadata } from 'lib/state/gameMetadata'
import {
  generatePathTags,
  generateRarityTags,
  SegmentedFilterRow,
} from 'lib/ui/selectors/CardSelectModalComponents'
import {
  generateLightConeOptions,
  type LcOptions,
} from 'lib/ui/selectors/optionGenerator'
import { SelectCardGrid } from 'lib/ui/selectors/SelectCardGrid'
import {
  LC_CARD_IMAGE_HEIGHT,
  LC_CARD_IMAGE_WIDTH,
  LC_CARD_IMAGE_X_OFFSET,
  LC_CARD_IMAGE_Y_OFFSET,
  LC_MODAL_STYLES,
  OVERLAY_SCROLLBAR_OPTIONS,
  SEARCH_INPUT_STYLES,
} from 'lib/ui/selectors/selectConstants'
import { useSelectModal } from 'lib/ui/selectors/useSelectModal'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'
import {
  type CSSProperties,
  useMemo,
} from 'react'
import { useTranslation } from 'react-i18next'
import type { CharacterId } from 'types/character'
import type { LightConeId } from 'types/lightCone'
import classes from './SelectCardGrid.module.css'

type LightConeFilters = {
  rarity: number[],
  path: PathName[],
  name: string,
}

const lcPathTags = generatePathTags()
const lcRarityTags = generateRarityTags()

export function LightConeSelect({
  value,
  onChange,
  characterId,
  selectStyle,
  opened,
  onOpenChange,
  clearable = true,
}: {
  value: LightConeId | null,
  onChange: (id: LightConeId | null) => void,
  characterId?: CharacterId | null,
  selectStyle?: CSSProperties,
  opened?: boolean,
  onOpenChange?: (open: boolean) => void,
  clearable?: boolean,
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

  const handleSelect = (id: LightConeId) => {
    onChange(id)
    close()
  }

  const selectedLabel = useMemo(() => {
    if (!value) return ''
    return lightConeOptions.find((opt) => opt.value === value)?.label ?? ''
  }, [value, lightConeOptions])

  const filteredOptions = useMemo(
    () =>
      lightConeOptions.filter((x: LcOptions[LightConeId]) => {
        if (filters.rarity.length && !filters.rarity.includes(x.rarity)) return false
        if (filters.path.length && !filters.path.includes(x.path)) return false
        return x.label.toLowerCase().includes(filters.name)
      }),
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
        rightSectionPointerEvents={clearable && value ? 'all' : 'none'}
        rightSection={clearable && value
          ? (
            <CloseButton
              size='xs'
              onClick={(e) => {
                e.stopPropagation()
                onChange(null)
              }}
            />
          )
          : null}
        styles={{ input: { cursor: 'pointer', textOverflow: 'ellipsis', paddingRight: clearable && value ? 28 : undefined, fontSize: 13 } }}
      />

      <Modal
        opened={isOpen}
        onClose={close}
        centered
        size='90%'
        styles={LC_MODAL_STYLES}
        title={t('Title')}
      >
        {isOpen && (
          <div className={classes.modalContent}>
            <Flex gap={12} wrap='wrap'>
              <TextInput
                className={classes.searchInput}
                styles={SEARCH_INPUT_STYLES}
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
              <Flex wrap='wrap' className={classes.filterWrapper} gap={12}>
                <Flex wrap='wrap' className={classes.filterWrapper}>
                  <SegmentedFilterRow
                    tags={lcPathTags}
                    flexBasis='11.111%'
                    currentFilter={filters.path}
                    setCurrentFilters={(v) => updateFilter('path', v)}
                  />
                </Flex>
                <Flex wrap='wrap' className={classes.filterWrapper}>
                  <SegmentedFilterRow
                    tags={lcRarityTags}
                    flexBasis='14.2%'
                    currentFilter={filters.rarity}
                    setCurrentFilters={(v) => updateFilter('rarity', v)}
                  />
                </Flex>
              </Flex>
            </Flex>

            <OverlayScrollbarsComponent className={classes.scrollArea} defer options={OVERLAY_SCROLLBAR_OPTIONS}>
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
