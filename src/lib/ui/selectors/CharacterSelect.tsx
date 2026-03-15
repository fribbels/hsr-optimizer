import { CloseButton, Flex, Modal, TextInput } from '@mantine/core'
import { ElementName, PathName } from 'lib/constants/constants'
import { Assets } from 'lib/rendering/assets'
import { CharacterOptions, generateCharacterOptions } from 'lib/rendering/optionGenerator'
import {
  generateElementTags,
  generatePathTags,
  SegmentedFilterRow,
} from 'lib/tabs/tabOptimizer/optimizerForm/components/CardSelectModalComponents'
import { SelectCardGrid } from 'lib/ui/selectors/SelectCardGrid'
import { CHARACTER_CARD_IMAGE_HEIGHT, CHARACTER_CARD_IMAGE_WIDTH, CHARACTER_CARD_IMAGE_X_OFFSET, CHARACTER_CARD_IMAGE_Y_OFFSET } from 'lib/ui/selectors/selectConstants'
import { useSelectModal } from 'lib/ui/selectors/useSelectModal'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'
import { CSSProperties, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { CharacterId } from 'types/character'
import classes from './SelectCardGrid.module.css'

type CharacterFilters = {
  element: ElementName[]
  path: PathName[]
  name: string
}

const defaultCharacterFilters: CharacterFilters = {
  element: [],
  path: [],
  name: '',
}

export function CharacterSelect({
  value,
  onChange,
  selectStyle,
  opened,
  onOpenChange,
}: {
  value: CharacterId | null
  onChange: (id: CharacterId | null) => void
  selectStyle?: CSSProperties
  opened?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const { t } = useTranslation('modals', { keyPrefix: 'CharacterSelect' })
  const characterOptions = useMemo(() => generateCharacterOptions(), [t])

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

  function applyFilters(x: CharacterOptions[CharacterId]) {
    if (filters.element.length && !filters.element.includes(x.element)) return false
    if (filters.path.length && !filters.path.includes(x.path)) return false
    if (!x.label.toLowerCase().includes(filters.name)) return false
    return true
  }

  const handleSelect = (id: CharacterId) => {
    onChange(id)
    close()
  }

  const selectedLabel = useMemo(() => {
    if (!value) return ''
    return characterOptions.find((opt) => opt.value === value)?.label ?? ''
  }, [value, characterOptions])

  const filteredOptions = useMemo(
    () => characterOptions.filter(applyFilters),
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
        styles={{ content: { height: '80%', maxWidth: 1450 }, body: { height: 'calc(100% - 60px)', overflow: 'hidden' } }}
        title={t('SingleSelect.ModalTitle')}
      >
        {isOpen && (
          <div className={classes.modalContent}>
            <Flex gap={12} wrap="wrap">
              <TextInput
                className={classes.searchInput}
                styles={{ wrapper: { height: 40 }, input: { height: 40, minHeight: 40 } }}
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
              <Flex wrap="wrap" className={classes.filterWrapper} gap={12}>
                <Flex wrap="wrap" className={classes.filterWrapper}>
                  <SegmentedFilterRow
                    tags={generateElementTags()}
                    flexBasis="14.2%"
                    currentFilter={filters.element}
                    setCurrentFilters={(v) => updateFilter('element', v)}
                  />
                </Flex>
                <Flex wrap="wrap" className={classes.filterWrapper}>
                  <SegmentedFilterRow
                    tags={generatePathTags()}
                    flexBasis="11.111%"
                    currentFilter={filters.path}
                    setCurrentFilters={(v) => updateFilter('path', v)}
                  />
                </Flex>
              </Flex>
            </Flex>

            <OverlayScrollbarsComponent className={classes.scrollArea} defer options={{ scrollbars: { autoHide: 'move', autoHideDelay: 500 } }}>
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
