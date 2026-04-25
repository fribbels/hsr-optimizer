import {
  CloseButton,
  Flex,
  Modal,
  TextInput,
} from '@mantine/core'
import { Assets } from 'lib/rendering/assets'
import { getGameMetadata } from 'lib/state/gameMetadata'
import {
  generateElementTags,
  generatePathTags,
  SegmentedFilterRow,
} from 'lib/ui/selectors/CardSelectModalComponents'
import { generateCharacterOptions } from 'lib/ui/selectors/optionGenerator'
import { SelectCardGrid } from 'lib/ui/selectors/SelectCardGrid'
import {
  applyCharacterFilters,
  CHARACTER_CARD_IMAGE_HEIGHT,
  CHARACTER_CARD_IMAGE_WIDTH,
  CHARACTER_CARD_IMAGE_X_OFFSET,
  CHARACTER_CARD_IMAGE_Y_OFFSET,
  CHARACTER_MODAL_STYLES,
  type CharacterFilters,
  defaultCharacterFilters,
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
import iconClasses from 'style/icons.module.css'
import type { CharacterId } from 'types/character'
import classes from './SelectCardGrid.module.css'

const elementTags = generateElementTags()
const pathTags = generatePathTags()

export function CharacterSelect({
  value,
  onChange,
  selectStyle,
  opened,
  onOpenChange,
  showIcon = true,
  clearable = true,
  withSimulation = false,
}: {
  value: CharacterId | null,
  onChange: (id: CharacterId | null) => void,
  selectStyle?: CSSProperties,
  opened?: boolean,
  onOpenChange?: (open: boolean) => void,
  showIcon?: boolean,
  clearable?: boolean,
  withSimulation?: boolean,
}) {
  const { t } = useTranslation('modals', { keyPrefix: 'CharacterSelect' })
  const characterOptions = useMemo(() => {
    const options = generateCharacterOptions()
    if (withSimulation) {
      return options.filter((opt) => getGameMetadata().characters[opt.id]?.scoringMetadata?.simulation)
    }
    return options
  }, [t, withSimulation])

  const {
    isOpen,
    open,
    close,
    inputRef,
    filters,
    setNameFilter,
    updateFilter,
  } = useSelectModal<CharacterFilters>({
    defaultFilters: defaultCharacterFilters,
    opened,
    onOpenChange,
  })

  const handleSelect = (id: CharacterId) => {
    onChange(id)
    close()
  }

  const selectedLabel = useMemo(() => {
    if (!value) return ''
    return characterOptions.find((opt) => opt.value === value)?.label ?? ''
  }, [value, characterOptions])

  const filteredOptions = useMemo(
    () => characterOptions.filter((x) => applyCharacterFilters(filters, x)),
    [characterOptions, filters],
  )

  return (
    <>
      <TextInput
        readOnly
        style={selectStyle}
        value={selectedLabel}
        placeholder={t('SingleSelect.Placeholder')}
        onClick={open}
        leftSection={showIcon && value ? <img src={Assets.getCharacterAvatarById(value)} className={iconClasses.icon20} /> : null}
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
        styles={CHARACTER_MODAL_STYLES}
        title={t('SingleSelect.ModalTitle')}
      >
        {isOpen && (
          <div className={classes.modalContent}>
            <Flex gap={12} wrap='wrap'>
              <TextInput
                className={classes.searchInput}
                styles={SEARCH_INPUT_STYLES}
                placeholder={t('SearchPlaceholder')}
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
                    tags={elementTags}
                    flexBasis='14.2%'
                    currentFilter={filters.element}
                    setCurrentFilters={(v) => updateFilter('element', v)}
                  />
                </Flex>
                <Flex wrap='wrap' className={classes.filterWrapper}>
                  <SegmentedFilterRow
                    tags={pathTags}
                    flexBasis='11.111%'
                    currentFilter={filters.path}
                    setCurrentFilters={(v) => updateFilter('path', v)}
                  />
                </Flex>
              </Flex>
            </Flex>

            <OverlayScrollbarsComponent className={classes.scrollArea} defer options={OVERLAY_SCROLLBAR_OPTIONS}>
              <SelectCardGrid<CharacterId>
                options={filteredOptions}
                onSelect={handleSelect}
                getImageSrc={Assets.getCharacterPreviewById}
                cardImageHeight={CHARACTER_CARD_IMAGE_HEIGHT}
                imageWidth={CHARACTER_CARD_IMAGE_WIDTH}
                imageXOffset={CHARACTER_CARD_IMAGE_X_OFFSET}
                imageYOffset={CHARACTER_CARD_IMAGE_Y_OFFSET}
                textRows={1}
              />
            </OverlayScrollbarsComponent>
          </div>
        )}
      </Modal>
    </>
  )
}
