import { Button, CloseButton, Flex, Modal, MultiSelect, Pill, PillsInput, TextInput } from '@mantine/core'
import { generateCharacterOptions } from 'lib/ui/selectors/optionGenerator'
import {
  generateElementTags,
  generatePathTags,
  SegmentedFilterRow,
} from 'lib/ui/selectors/CardSelectModalComponents'
import { Assets } from 'lib/rendering/assets'
import { SelectCardGrid } from 'lib/ui/selectors/SelectCardGrid'
import {
  CHARACTER_CARD_IMAGE_HEIGHT,
  CHARACTER_CARD_IMAGE_WIDTH,
  CHARACTER_CARD_IMAGE_X_OFFSET,
  CHARACTER_CARD_IMAGE_Y_OFFSET,
  CHARACTER_MODAL_STYLES,
  type CharacterFilters,
  OVERLAY_SCROLLBAR_OPTIONS,
  SEARCH_INPUT_STYLES,
  applyCharacterFilters,
  defaultCharacterFilters,
} from 'lib/ui/selectors/selectConstants'
import { useSelectModal } from 'lib/ui/selectors/useSelectModal'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'
import { type CSSProperties, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { CharacterId } from 'types/character'
import classes from './SelectCardGrid.module.css'

const elementTags = generateElementTags()
const pathTags = generatePathTags()

export function CharacterMultiSelect({
  value,
  onChange,
  selectStyle,
  maxDisplayedValues,
}: {
  value: Set<CharacterId>
  onChange: (excluded: Set<CharacterId>) => void
  selectStyle?: CSSProperties
  maxDisplayedValues?: number
}) {
  const { t } = useTranslation('modals', { keyPrefix: 'CharacterSelect' })
  const characterOptions = useMemo(() => generateCharacterOptions(), [t])
  const [excluded, setExcluded] = useState<Set<CharacterId>>(() => new Set())

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
    () => characterOptions.filter((x) => applyCharacterFilters(filters, x)),
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
      {maxDisplayedValues === 0
        ? (
          <PillsInput
            size="xs"
            onClick={open}
            style={selectStyle}
            styles={{ input: { cursor: 'pointer', minHeight: 'unset' } }}
            rightSection={value.size > 0 ? (
              <CloseButton size="xs" onClick={(e) => { e.stopPropagation(); onChange(new Set()) }} />
            ) : undefined}
          >
            <Pill.Group style={{ flexWrap: 'nowrap', overflow: 'hidden' }}>
              {value.size > 0
                ? <Pill>{t('MultiSelect.Placeholder')} +{value.size}</Pill>
                : <PillsInput.Field placeholder={t('MultiSelect.Placeholder')} readOnly pointer />}
            </Pill.Group>
          </PillsInput>
        )
        : (
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
        )}

      <Modal
        opened={isOpen}
        onClose={handleClose}
        centered
        size="90%"
        styles={CHARACTER_MODAL_STYLES}
        title={t('MultiSelect.ModalTitle')}
      >
        {isOpen && (
          <div className={classes.modalContent}>
            <Flex gap={12} wrap="wrap">
              <Flex style={{ flexGrow: 1 }} gap={10}>
                <TextInput
                  className={classes.searchInput}
                  styles={SEARCH_INPUT_STYLES}
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
                    tags={elementTags}
                    flexBasis="14.2%"
                    currentFilter={filters.element}
                    setCurrentFilters={(v) => updateFilter('element', v)}
                  />
                </Flex>
                <Flex wrap="wrap" className={classes.filterWrapper}>
                  <SegmentedFilterRow
                    tags={pathTags}
                    flexBasis="11.111%"
                    currentFilter={filters.path}
                    setCurrentFilters={(v) => updateFilter('path', v)}
                  />
                </Flex>
              </Flex>
            </Flex>

            <OverlayScrollbarsComponent className={classes.scrollArea} defer options={OVERLAY_SCROLLBAR_OPTIONS}>
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
