import { Button, Flex, Modal, MultiSelect, TextInput } from '@mantine/core'
import { ElementName, PathName } from 'lib/constants/constants'
import { generateCharacterOptions, CharacterOptions } from 'lib/rendering/optionGenerator'
import {
  generateElementTags,
  generatePathTags,
  SegmentedFilterRow,
} from 'lib/tabs/tabOptimizer/optimizerForm/components/CardSelectModalComponents'
import { Assets } from 'lib/rendering/assets'
import { SelectCardGrid } from 'lib/ui/selectors/SelectCardGrid'
import { CHARACTER_CARD_IMAGE_HEIGHT, CHARACTER_CARD_IMAGE_WIDTH, CHARACTER_CARD_IMAGE_X_OFFSET, CHARACTER_CARD_IMAGE_Y_OFFSET } from 'lib/ui/selectors/selectConstants'
import { useSelectModal } from 'lib/ui/selectors/useSelectModal'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'
import { CSSProperties, useMemo, useState } from 'react'
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

export function CharacterMultiSelect({
  value,
  onChange,
  selectStyle,
}: {
  value: Set<CharacterId>
  onChange: (excluded: Set<CharacterId>) => void
  selectStyle?: CSSProperties
}) {
  const { t } = useTranslation('modals', { keyPrefix: 'CharacterSelect' })
  const characterOptions = useMemo(() => generateCharacterOptions(), [t])
  const [excluded, setExcluded] = useState<Set<CharacterId>>(() => new Set(value))

  const {
    isOpen,
    open: openModal,
    close,
    inputRef,
    filters,
    setNameFilter,
    updateFilter,
  } = useSelectModal<CharacterFilters>({
    defaultFilters: defaultCharacterFilters,
  })

  const open = () => {
    setExcluded(new Set(value))
    openModal()
  }

  function applyFilters(x: CharacterOptions[CharacterId]) {
    if (filters.element.length && !filters.element.includes(x.element)) return false
    if (filters.path.length && !filters.path.includes(x.path)) return false
    if (!x.label.toLowerCase().includes(filters.name)) return false
    return true
  }

  const handleToggle = (id: CharacterId) => {
    setExcluded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const filteredOptions = useMemo(
    () => characterOptions.filter(applyFilters),
    [characterOptions, filters],
  )

  const excludeAll = () => {
    setExcluded((prev) => {
      const next = new Set(prev)
      filteredOptions.forEach((opt) => next.add(opt.id))
      return next
    })
  }

  const clearAll = () => {
    setExcluded((prev) => {
      const next = new Set(prev)
      filteredOptions.forEach((opt) => next.delete(opt.id))
      return next
    })
  }

  const handleClose = () => {
    onChange(excluded)
    close()
  }

  const multiSelectData = useMemo(
    () => characterOptions.map((opt) => ({ value: opt.value, label: opt.label })),
    [characterOptions],
  )

  const multiSelectValue = useMemo(
    () => [...value] as string[],
    [value],
  )

  return (
    <>
      <MultiSelect
        style={selectStyle}
        value={multiSelectValue}
        data={multiSelectData}
        placeholder={t('MultiSelect.Placeholder')}
        clearable
        maxValues={0}
        onClear={() => onChange(new Set())}
        onDropdownOpen={open}
        comboboxProps={{ keepMounted: false, styles: { dropdown: { display: 'none' } } }}
        rightSection={null}
      />

      <Modal
        opened={isOpen}
        onClose={handleClose}
        centered
        size="90%"
        styles={{ content: { height: '80%', maxWidth: 1450 }, body: { height: 'calc(100% - 60px)', overflow: 'hidden' } }}
        title={t('MultiSelect.ModalTitle')}
      >
        {isOpen && (
          <div className={classes.modalContent}>
            <Flex gap={12} wrap="wrap">
              <Flex style={{ flexGrow: 1 }} gap={10}>
                <TextInput
                  className={classes.searchInput}
                  styles={{ wrapper: { height: 40 }, input: { height: 40, minHeight: 40 } }}
                  placeholder={t('SearchPlaceholder')}
                  ref={inputRef}
                  autoFocus
                  onChange={setNameFilter}
                />
                <Flex gap={12}>
                  <Button variant="default" onClick={excludeAll} className={classes.bulkActionButton}>
                    {t('ExcludeButton')}
                  </Button>
                  <Button variant="default" onClick={clearAll} className={classes.bulkActionButton}>
                    {t('ClearButton')}
                  </Button>
                </Flex>
              </Flex>
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
                onSelect={handleToggle}
                getImageSrc={Assets.getCharacterPreviewById}
                cardImageHeight={CHARACTER_CARD_IMAGE_HEIGHT}
                imageWidth={CHARACTER_CARD_IMAGE_WIDTH}
                imageXOffset={CHARACTER_CARD_IMAGE_X_OFFSET}
                imageYOffset={CHARACTER_CARD_IMAGE_Y_OFFSET}
                textRows={1}
                excludedIds={excluded}
              />
            </OverlayScrollbarsComponent>
          </div>
        )}
      </Modal>
    </>
  )
}
