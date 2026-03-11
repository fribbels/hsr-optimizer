import { Button, Flex, Modal, MultiSelect, Paper, Select, TextInput } from '@mantine/core'
import { ElementName, PathName, } from 'lib/constants/constants'
import { useSelectModal } from 'lib/hooks/useSelectModal'
import { Assets } from 'lib/rendering/assets'
import { CharacterOptions, generateCharacterOptions, } from 'lib/rendering/optionGenerator'
import {
  CardGridItemContent,
  generateElementTags,
  generatePathTags,
  SegmentedFilterRow,
} from 'lib/tabs/tabOptimizer/optimizerForm/components/CardSelectModalComponents'
import { Utils } from 'lib/utils/utils'
import * as React from 'react'
import { ReactNode, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CharacterId } from 'types/character'

// FIXME HIGH

interface BaseCharacterSelectProps {
  selectStyle?: React.CSSProperties
  withIcon?: boolean
  externalOpen?: boolean
  setExternalOpen?: (state: boolean) => void
}

interface MultiCharacterSelectProps extends BaseCharacterSelectProps {
  multipleSelect: true
  value: CharacterId[]
  onChange?: (x: Map<CharacterId, boolean> | null) => void
}

interface SingleCharacterSelectProps extends BaseCharacterSelectProps {
  multipleSelect?: false
  value: CharacterId | null | undefined
  onChange?: (x: CharacterId | null | undefined) => void
}

type CharacterSelectProps = SingleCharacterSelectProps | MultiCharacterSelectProps

const parentW = 100
const parentH = 150
const innerW = 150
const innerH = 170

const goldBg = 'linear-gradient(#8A6700 0px, #D6A100 63px, #D6A100 130px, #282B31 130px, #282B31 150px)'
const purpleBg = 'linear-gradient(#5F388C 0px, #9F6CD9 63px, #9F6CD9 130px, #282B31 130px, #282B31 150px)'

type CharacterFilters = {
  path: PathName[],
  element: ElementName[],
  name: string,
}

const defaultCharacterFilters: CharacterFilters = {
  path: [],
  element: [],
  name: '',
}

function CharacterSelect({ value, onChange, selectStyle, multipleSelect, withIcon, externalOpen, setExternalOpen }: CharacterSelectProps) {
  // console.log('==================================== CHARACTER SELECT')
  const { t } = useTranslation('modals', { keyPrefix: 'CharacterSelect' })
  const characterOptions = useMemo(() => generateCharacterOptions(), [t])
  const [selected, setSelected] = useState<Map<CharacterId, boolean>>(new Map())

  const {
    open,
    setOpen,
    inputRef,
    currentFilters,
    setNameFilter,
    updateFilter,
    resetAndOpen,
  } = useSelectModal<CharacterFilters>({
    defaultFilters: defaultCharacterFilters,
    externalOpen,
    onOpen: () => {
      if (multipleSelect) {
        const newSelected = new Map<CharacterId, boolean>(value.map((characterId: CharacterId) => [characterId, true]))
        setSelected(newSelected)
      }
    },
  })

  const setElementFilter = (element: CharacterFilters['element']) => updateFilter('element', element)

  const setPathFilter = (path: CharacterFilters['path']) => updateFilter('path', path)

  const labelledOptions: { value: string, label: ReactNode }[] = []
  for (const option of characterOptions) {
    labelledOptions.push({
      value: option.value,
      label: (
        <Flex gap={5} align='center'>
          <img
            src={Assets.getCharacterAvatarById(option.value)}
            style={{ height: 22, marginRight: 4 }}
          />
          {option.label}
        </Flex>
      ),
    })
  }

  function applyFilters(x: CharacterOptions[CharacterId]) {
    if (currentFilters.element.length && !currentFilters.element.includes(x.element)) {
      return false
    }
    if (currentFilters.path.length && !currentFilters.path.includes(x.path)) {
      return false
    }
    if (!x.label.toLowerCase().includes(currentFilters.name)) {
      return false
    }

    return true
  }

  const handleClick = (id: CharacterId) => {
    if (multipleSelect) {
      selected.set(id, !selected.get(id))
      setSelected(new Map(selected))
    } else {
      setOpen(false)
      if (setExternalOpen) setExternalOpen(false)
      if (onChange) onChange(id)
    }
  }

  const excludeAll = () => {
    const newSelected = new Map<CharacterId, boolean>(selected)
    characterOptions
      .filter(applyFilters)
      .forEach((option) => newSelected.set(option.id, true))
    setSelected(newSelected)
  }

  const includeAll = () => {
    const newSelected = new Map<CharacterId, boolean>(selected)
    characterOptions
      .filter(applyFilters)
      .forEach((option) => newSelected.delete(option.id))
    setSelected(newSelected)
  }

  return (
    <>
      {multipleSelect
        ? (
          <MultiSelect
            style={selectStyle}
            value={value as string[]}
            data={characterOptions.map((opt) => ({ value: opt.value, label: opt.label }))}
            placeholder={t('MultiSelect.Placeholder') /* Customize characters */}
            clearable
            maxValues={0}
            onClear={() => {
              if (onChange) onChange(null)
            }}
            onDropdownOpen={resetAndOpen}
            comboboxProps={{ styles: { dropdown: { display: 'none' } } }}
            rightSection={null}
          />
        )
        : (
          <Select
            style={selectStyle}
            value={value as string | null}
            data={withIcon
              ? labelledOptions.map((opt) => ({ value: opt.value, label: typeof opt.label === 'string' ? opt.label : opt.value }))
              : characterOptions.map((opt) => ({ value: opt.value, label: opt.label }))}
            placeholder={t('SingleSelect.Placeholder') /* Character */}
            clearable
            onClear={() => {
              if (onChange) onChange(null)
            }}
            onDropdownOpen={resetAndOpen}
            comboboxProps={{ styles: { dropdown: { display: 'none' } } }}
            rightSection={null}
          />
        )}

      <Modal
        opened={open || !!externalOpen}
        centered
        size='90%'
        styles={{ content: { height: '80%', maxWidth: 1450 } }}
        title={multipleSelect ? t('MultiSelect.ModalTitle') /* select characters to exclude */ : t('SingleSelect.ModalTitle') /* select a character */}
        onClose={() => {
          if (multipleSelect) {
            if (onChange) onChange(selected)
          }

          setOpen(false)
          if (setExternalOpen) setExternalOpen(false)
        }}
      >
        <Flex direction="column" gap={12} style={{ minWidth: 350 }}>
          <Flex gap={12} wrap='wrap'>
            <Flex wrap='nowrap' style={{ flexGrow: 1 }} gap={10}>
              <TextInput
                size='lg'
                style={{
                  height: 40,
                  flex: 1,
                }}
                placeholder={t('SearchPlaceholder') /* Search character name */}
                ref={inputRef}
                onChange={setNameFilter}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const first = characterOptions.find(applyFilters)
                    if (first) {
                      handleClick(first.id)
                    }
                  }
                }}
              />
              {multipleSelect && (
                <Flex gap={12}>
                  <Button
                    variant="default"
                    onClick={excludeAll}
                    style={{ height: '100%', width: 120 }}
                  >
                    {t('ExcludeButton') /* Exclude all */}
                  </Button>
                  <Button
                    variant="default"
                    onClick={includeAll}
                    style={{ height: '100%', width: 120 }}
                  >
                    {t('ClearButton') /* Clear */}
                  </Button>
                </Flex>
              )}
            </Flex>
            <Flex wrap='wrap' style={{ minWidth: 350, flexGrow: 1 }} gap={12}>
              <Flex wrap='wrap' style={{ minWidth: 350, flexGrow: 1 }}>
                <SegmentedFilterRow
                  tags={generateElementTags()}
                  flexBasis='14.2%'
                  currentFilter={currentFilters.element}
                  setCurrentFilters={setElementFilter}
                />
              </Flex>
              <Flex wrap='wrap' style={{ minWidth: 350, flexGrow: 1 }}>
                <SegmentedFilterRow
                  tags={generatePathTags()}
                  flexBasis='11.111%'
                  currentFilter={currentFilters.path}
                  setCurrentFilters={setPathFilter}
                />
              </Flex>
            </Flex>
          </Flex>

          <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${parentW}px, 1fr))`, gridGap: 8 }}>
            {characterOptions
              .sort(Utils.sortRarityDesc)
              .filter(applyFilters)
              .map((option) => (
                <Paper
                  key={option.id}
                  style={{
                    background: option.rarity === 5 ? goldBg : purpleBg,
                    overflow: 'hidden',
                    height: `${parentH}px`,
                    cursor: 'pointer',
                    padding: 1,
                    ...(selected.get(option.id)
                      ? {
                        opacity: 0.25,
                        background: 'grey',
                      }
                      : {}),
                  }}
                  onMouseDown={() => handleClick(option.id)}
                >
                  <CardGridItemContent imgSrc={Assets.getCharacterPreviewById(option.id)} text={option.label} innerW={innerW} innerH={innerH} rows={1} />
                </Paper>
              ))}
          </div>
        </Flex>
      </Modal>
    </>
  )
}

export default CharacterSelect
