import * as React from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Button, Card, Flex, Input, InputRef, Modal, Select } from 'antd'
import { Utils } from 'lib/utils.js'
import { Assets } from 'lib/assets.js'
import { CardGridItemContent, generateElementTags, generatePathTags, SegmentedFilterRow } from 'components/optimizerTab/optimizerForm/CardSelectModalComponents.tsx'

interface CharacterSelectProps {
  value
  onChange?: (id) => void
  selectStyle?: React.CSSProperties
  multipleSelect?: boolean
  withIcon?: boolean
}

const parentW = 100
const parentH = 150
const innerW = 150
const innerH = 170

const goldBg = 'linear-gradient(#8A6700 0px, #D6A100 63px, #D6A100 130px, #282B31 130px, #282B31 150px)'
const purpleBg = 'linear-gradient(#5F388C 0px, #9F6CD9 63px, #9F6CD9 130px, #282B31 130px, #282B31 150px)'

const defaultFilters = {
  rarity: [],
  path: [],
  element: [],
  name: '',
}

const CharacterSelect: React.FC<CharacterSelectProps> = ({ value, onChange, selectStyle, multipleSelect, withIcon }) => {
  // console.log('==================================== CHARACTER SELECT')
  const inputRef = useRef<InputRef>(null)
  const [open, setOpen] = useState(false)
  const [currentFilters, setCurrentFilters] = useState(Utils.clone(defaultFilters))
  const characterOptions = useMemo(() => Utils.generateCharacterOptions(), [])
  const [selected, setSelected] = useState<Map<string, boolean>>(new Map())
  const excludedRelicPotentialCharacters = window.store((s) => s.excludedRelicPotentialCharacters)

  const labelledOptions: { value: string; label }[] = []
  for (const option of characterOptions) {
    labelledOptions.push({
      value: option.value,
      label: (
        <Flex gap={5} align="center">
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
    if (open) {
      setTimeout(() => inputRef?.current?.focus(), 100)

      if (multipleSelect) {
        const newSelected = new Map<string, boolean>(excludedRelicPotentialCharacters.map((characterId: string) => [characterId, true]))
        setSelected(newSelected)
      }
    }
  }, [open])

  function applyFilters(x) {
    if (currentFilters.element.length && !currentFilters.element.includes(x.element)) {
      return false
    }
    if (currentFilters.path.length && !currentFilters.path.includes(x.path)) {
      return false
    }
    if (!x.label.toLowerCase().includes(currentFilters.name) || !x.displayName.toLowerCase().includes(currentFilters.name)) {
      return false
    }

    return true
  }

  const handleClick = (id) => {
    if (multipleSelect) {
      selected.set(id, !selected.get(id))
      setSelected(new Map(selected))
    } else {
      setOpen(false)
      if (onChange) onChange(id)
    }
  }

  const excludeAll = () => {
    const newSelected = new Map<string, boolean>(selected)
    characterOptions
      .filter(applyFilters)
      .forEach((option) => newSelected.set(option.id, true))
    setSelected(newSelected)
  }

  const includeAll = () => {
    const newSelected = new Map<string, boolean>(selected)
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
        placeholder={multipleSelect ? 'Customize characters' : 'Character'}
        allowClear
        maxTagCount={0}
        maxTagPlaceholder={() => (
          <span>{excludedRelicPotentialCharacters.length ? `${excludedRelicPotentialCharacters.length} characters excluded` : 'All characters enabled'}</span>
        )}
        onClear={() => {
          if (onChange) onChange(null)
        }}
        onDropdownVisibleChange={(visible) => {
          if (visible) {
            setOpen(true)
            setCurrentFilters(Utils.clone(defaultFilters))
          }
        }}
        dropdownStyle={{ display: 'none' }}
        suffixIcon={null}
        mode={multipleSelect ? 'multiple' : undefined}
      />

      <Modal
        open={open}
        centered
        destroyOnClose
        width="90%"
        style={{ height: '80%', maxWidth: 1450 }}
        title={multipleSelect ? 'Select characters to exclude' : 'Select a character'}
        onCancel={() => {
          if (multipleSelect) {
            if (onChange) onChange(selected)
          }

          setOpen(false)
        }}
        footer={null}
      >
        <Flex vertical gap={12} style={{ minWidth: 350 }}>
          <Flex gap={12} wrap="wrap">
            <Flex wrap="nowrap" style={{ flexGrow: 1 }} gap={10}>
              <Input
                size="large"
                style={{
                  height: 40,
                  flex: 1,
                }}
                placeholder="Search character name"
                ref={inputRef}
                onChange={(e) => {
                  const newFilters = Utils.clone(currentFilters)
                  newFilters.name = e.target.value.toLowerCase()
                  setCurrentFilters(newFilters)
                }}
                onPressEnter={() => {
                  const first = characterOptions.filter(applyFilters)[0]
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
                    Exclude all
                  </Button>
                  <Button
                    onClick={includeAll}
                    style={{ height: '100%', width: 120 }}
                  >
                    Clear
                  </Button>
                </Flex>
              )}
            </Flex>
            <Flex wrap="wrap" style={{ minWidth: 350, flexGrow: 1 }} gap={12}>
              <Flex wrap="wrap" style={{ minWidth: 350, flexGrow: 1 }}>
                <SegmentedFilterRow
                  name="element"
                  tags={generateElementTags()}
                  flexBasis="14.2%"
                  currentFilters={currentFilters}
                  setCurrentFilters={setCurrentFilters}
                />
              </Flex>
              <Flex wrap="wrap" style={{ minWidth: 350, flexGrow: 1 }}>
                <SegmentedFilterRow
                  name="path"
                  tags={generatePathTags()}
                  flexBasis="14.2%"
                  currentFilters={currentFilters}
                  setCurrentFilters={setCurrentFilters}
                />
              </Flex>
            </Flex>
          </Flex>

          <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${parentW}px, 1fr))`, gridGap: 8 }}>
            {
              characterOptions
                .sort(Utils.sortRarityDesc)
                .filter(applyFilters)
                .map((option) => (
                  <Card
                    key={option.id}
                    hoverable
                    style={{
                      ...{
                        background: option.rarity === 5 ? goldBg : purpleBg,
                        overflow: 'hidden',
                        height: `${parentH}px`,
                      },
                      ...(selected.get(option.id)
                        ? {
                          opacity: 0.25,
                          background: 'grey',
                        }
                        : {}
                      ),
                    }}
                    styles={{ body: { padding: 1 } }}
                    onMouseDown={() => handleClick(option.id)}
                  >
                    <CardGridItemContent imgSrc={Assets.getCharacterPreviewById(option.id)} text={option.displayName} innerW={innerW} innerH={innerH} rows={1} />
                  </Card>
                ))
            }
          </div>
        </Flex>
      </Modal>
    </>
  )
}

export default CharacterSelect
