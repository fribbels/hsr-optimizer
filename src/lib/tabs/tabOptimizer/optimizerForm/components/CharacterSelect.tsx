import {
  Button,
  Card,
  Flex,
  Input,
  InputRef,
  Modal,
  Select,
} from 'antd'
import {
  ElementName,
  PathName,
} from 'lib/constants/constants'
import { Assets } from 'lib/rendering/assets'
import {
  CharacterOptions,
  generateCharacterOptions,
} from 'lib/rendering/optionGenerator'
import {
  CardGridItemContent,
  generateElementTags,
  generatePathTags,
  SegmentedFilterRow,
} from 'lib/tabs/tabOptimizer/optimizerForm/components/CardSelectModalComponents'
import { TsUtils } from 'lib/utils/TsUtils'
import { Utils } from 'lib/utils/utils'
import * as React from 'react'
import {
  ChangeEvent,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
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

const defaultFilters: CharacterFilters = {
  path: [],
  element: [],
  name: '',
}

type CharacterFilters = {
  path: PathName[],
  element: ElementName[],
  name: string,
}

const CharacterSelect: React.FC<CharacterSelectProps> = ({ value, onChange, selectStyle, multipleSelect, withIcon, externalOpen, setExternalOpen }) => {
  // console.log('==================================== CHARACTER SELECT')
  const inputRef = useRef<InputRef>(null)
  const { t } = useTranslation('modals', { keyPrefix: 'CharacterSelect' })
  const [open, setOpen] = useState(false)
  const [currentFilters, setCurrentFilters] = useState(TsUtils.clone(defaultFilters))
  const characterOptions = useMemo(() => generateCharacterOptions(), [t])
  const [selected, setSelected] = useState<Map<CharacterId, boolean>>(new Map())
  const excludedRelicPotentialCharacters = window.store((s) => s.excludedRelicPotentialCharacters)

  const setElementFilter = (element: CharacterFilters['element']) => setCurrentFilters({ ...currentFilters, element })

  const setPathFilter = (path: CharacterFilters['path']) => setCurrentFilters({ ...currentFilters, path })

  const setNameFilter = (e: ChangeEvent<HTMLInputElement>) => setCurrentFilters({ ...currentFilters, name: e.target.value.toLowerCase() })

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

  useEffect(() => {
    if (open || externalOpen) {
      // closing and re-opening the select by clicking on the character image doesn't reset the filters
      setCurrentFilters(TsUtils.clone(defaultFilters))
      setTimeout(() => inputRef.current?.focus(), 100)

      if (multipleSelect) {
        const newSelected = new Map<CharacterId, boolean>(excludedRelicPotentialCharacters.map((characterId: CharacterId) => [characterId, true]))
        setSelected(newSelected)
      }
    }
  }, [open, externalOpen])

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
      <Select
        style={selectStyle}
        value={value}
        options={withIcon ? labelledOptions : characterOptions}
        placeholder={multipleSelect ? t('MultiSelect.Placeholder') /* Customize characters */ : t('SingleSelect.Placeholder') /* Character */}
        allowClear
        maxTagCount={0}
        maxTagPlaceholder={() => (
          <span>
            {
              excludedRelicPotentialCharacters.length
                ? t('MultiSelect.MaxTagPlaceholderSome', { count: excludedRelicPotentialCharacters.length })
                : t('MultiSelect.MaxTagPlaceholderNone')
              /* {count} characters excluded | all characters enabled */
            }
          </span>
        )}
        onClear={() => {
          if (onChange) onChange(null)
        }}
        onDropdownVisibleChange={(visible) => {
          if (visible) {
            setOpen(true)
            setCurrentFilters(TsUtils.clone(defaultFilters))
          }
        }}
        dropdownStyle={{ display: 'none' }}
        suffixIcon={null}
        mode={multipleSelect ? 'multiple' : undefined}
      />

      <Modal
        open={open || externalOpen}
        centered
        destroyOnClose
        width='90%'
        style={{ height: '80%', maxWidth: 1450 }}
        title={multipleSelect ? t('MultiSelect.ModalTitle') /* select characters to exclude */ : t('SingleSelect.ModalTitle') /* select a character */}
        onCancel={() => {
          if (multipleSelect) {
            if (onChange) onChange(selected)
          }

          setOpen(false)
          if (setExternalOpen) setExternalOpen(false)
        }}
        footer={null}
      >
        <Flex vertical gap={12} style={{ minWidth: 350 }}>
          <Flex gap={12} wrap='wrap'>
            <Flex wrap='nowrap' style={{ flexGrow: 1 }} gap={10}>
              <Input
                size='large'
                style={{
                  height: 40,
                  flex: 1,
                }}
                placeholder={t('SearchPlaceholder') /* Search character name */}
                ref={inputRef}
                onChange={setNameFilter}
                onPressEnter={() => {
                  const first = characterOptions.find(applyFilters)
                  if (first) {
                    handleClick(first.id)
                  }
                }}
              />
              {multipleSelect && (
                <Flex gap={12}>
                  <Button
                    onClick={excludeAll}
                    style={{ height: '100%', width: 120 }}
                  >
                    {t('ExcludeButton') /* Exclude all */}
                  </Button>
                  <Button
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
                  flexBasis='12.5%'
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
                <Card
                  key={option.id}
                  hoverable
                  style={{
                    background: option.rarity === 5 ? goldBg : purpleBg,
                    overflow: 'hidden',
                    height: `${parentH}px`,
                    ...(selected.get(option.id)
                      ? {
                        opacity: 0.25,
                        background: 'grey',
                      }
                      : {}),
                  }}
                  styles={{ body: { padding: 1 } }}
                  onMouseDown={() => handleClick(option.id)}
                >
                  <CardGridItemContent imgSrc={Assets.getCharacterPreviewById(option.id)} text={option.label} innerW={innerW} innerH={innerH} rows={1} />
                </Card>
              ))}
          </div>
        </Flex>
      </Modal>
    </>
  )
}

export default CharacterSelect
