import * as React from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Card, Flex, Input, InputRef, Modal, Select, Typography } from 'antd'
import { Utils } from 'lib/utils.js'
import { Assets } from 'lib/assets.js'
import CheckableTag from 'antd/lib/tag/CheckableTag'
import { ElementToDamage, PathToClass } from 'lib/constants.ts'

const { Paragraph } = Typography

interface CharacterSelectProps {
  value
  onChange?: (id) => void
  selectStyle?: React.CSSProperties
}

const parentW = 100
const parentH = 150
const innerW = 150
const innerH = 170

const goldBg = 'linear-gradient(#8A6700 0px, #D6A100 63px, #D6A100 130px, #282B31 130px, #282B31 150px)'
const purpleBg = 'linear-gradient(#5F388C 0px, #9F6CD9 63px, #9F6CD9 130px, #282B31 130px, #282B31 150px)'

function FilterRow({ currentFilters, name, flexBasis, tags, setCurrentFilters }) {
  const selectedTags = currentFilters[name]

  const handleChange = (tag, checked) => {
    const nextSelectedTags = checked
      ? [...selectedTags, tag]
      : selectedTags.filter((t) => t != tag)

    const clonedFilters = Utils.clone(currentFilters)
    clonedFilters[name] = nextSelectedTags
    console.log('filters', name, clonedFilters)

    setCurrentFilters(clonedFilters)
  }

  return (
    <Flex
      style={{
        flexWrap: 'wrap',
        flexGrow: 1,
        backgroundColor: '#243356',
        boxShadow: '0px 0px 0px 1px #3F5A96 inset',
        borderRadius: 6,
        overflow: 'hidden',
        height: 40,
      }}
    >
      {tags.map((tag) => (
        <CheckableTag
          key={tag.key}
          checked={selectedTags.includes(tag.key)}
          onChange={(checked) => handleChange(tag.key, checked)}
          style={{
            flex: 1,
            flexBasis: flexBasis,
            boxShadow: '1px 1px 0px 0px #3F5A96',
          }}
        >
          <Flex align="center" justify="space-around" style={{ height: '100%' }}>
            {tag.display}
          </Flex>
        </CheckableTag>
      ))}
    </Flex>
  )
}

const defaultFilters = {
  rarity: [],
  path: [],
  element: [],
  name: '',
}

// TODO: This is copy pasted to LightConeSelect.tsx. Maybe want to revisit these two files and make the components more modular
const CharacterSelect: React.FC<CharacterSelectProps> = ({ value, onChange, selectStyle }) => {
  // console.log('==================================== CHARACTER SELECT')
  const inputRef = useRef<InputRef>(null)
  const [open, setOpen] = useState(false)
  const [currentFilters, setCurrentFilters] = useState(Utils.clone(defaultFilters))
  const characterOptions = useMemo(() => Utils.generateCharacterOptions(), [])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef?.current?.focus(), 0)
    }
  }, [open])

  function applyFilters(x) {
    if (currentFilters.element.length && !currentFilters.element.includes(x.element)) {
      return false
    }
    if (currentFilters.path.length && !currentFilters.path.map((x) => PathToClass[x]).includes(x.path)) {
      return false
    }
    if (!x.label.toLowerCase().includes(currentFilters.name) || !x.displayName.toLowerCase().includes(currentFilters.name)) {
      return false
    }

    return true
  }

  function generateElementTags() {
    return Object.keys(ElementToDamage).map((x) => {
      return {
        key: x,
        display: <img style={{ width: 30 }} src={Assets.getElement(x)} />,
      }
    })
  }

  function generatePathTags() {
    return Object.keys(PathToClass).map((x) => {
      return {
        key: x,
        display: <img style={{ width: 32 }} src={Assets.getPath(x)} />,
      }
    })
  }

  const handleClick = (id) => {
    setOpen(false)
    if (onChange) onChange(id)
  }

  return (
    <>
      <Select
        style={selectStyle}
        value={value}
        options={characterOptions}
        placeholder="Character"
        allowClear
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
      />

      <Modal
        open={open}
        centered
        destroyOnClose
        width="90%"
        style={{ height: '80%', maxWidth: 1450 }}
        title="Select a character"
        onCancel={() => setOpen(false)}
        footer={null}
      >
        <Flex vertical gap={12}>
          <Flex gap={12} wrap="wrap">
            <Flex vertical wrap="wrap" style={{ minWidth: 300, flexGrow: 1 }}>
              <Input
                size="large"
                style={{ height: 40 }}
                placeholder="Character"
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
            </Flex>
            <Flex wrap="wrap" style={{ minWidth: 350, flexGrow: 1 }} gap={12}>
              <Flex wrap="wrap" style={{ minWidth: 350, flexGrow: 1 }}>
                <FilterRow
                  name="element"
                  tags={generateElementTags()}
                  flexBasis="14.2%"
                  currentFilters={currentFilters}
                  setCurrentFilters={setCurrentFilters}
                />
              </Flex>
              <Flex wrap="wrap" style={{ minWidth: 350, flexGrow: 1 }}>
                <FilterRow
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
                      background: option.rarity === 5 ? goldBg : purpleBg,
                      overflow: 'hidden',
                      height: `${parentH}px`,
                    }}
                    styles={{ body: { padding: 1 } }}
                    onMouseDown={() => handleClick(option.id)}
                  >
                    <img
                      width={innerW}
                      src={Assets.getCharacterPreviewById(option.id)}
                      style={{
                        transform: `translate(${(innerW - parentW) / 2 / innerW * -100}%, ${(innerH - parentH) / 2 / innerH * -100}%)`,
                      }}
                    />
                    <Paragraph
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        width: '110%',
                        textAlign: 'center',
                        justifyContent: 'center',
                        background: '#282B31',
                        color: '#D0D0D2',
                        marginLeft: '-5%',
                        textWrap: 'nowrap',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        paddingLeft: 10,
                        paddingRight: 10,
                        lineHeight: '18px',
                        height: 18,
                        marginBottom: 0,
                      }}
                    >
                      {option.displayName}
                    </Paragraph>
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
