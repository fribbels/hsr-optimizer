import * as React from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Card, Flex, Input, InputRef, Modal, Select, Typography } from 'antd'
import { Utils } from 'lib/utils'
import { Assets } from 'lib/assets'
import CheckableTag from 'antd/lib/tag/CheckableTag'
import { ElementToDamage, PathToClass } from 'lib/constants.ts'

const { Text } = Typography

interface CharacterSelectProps {
  value
  onChange: (id) => void
  selectStyle?: React.CSSProperties
}

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

const CharacterSelect: React.FC<CharacterSelectProps> = ({ value, onChange, selectStyle }) => {
  console.log('==================================== CHARACTER SELECT')

  const inputRef = useRef<InputRef>(null)
  const [open, setOpen] = useState(false)
  const [currentFilters, setCurrentFilters] = useState(Utils.clone(defaultFilters))
  const characterOptions = useMemo(() => Utils.generateCharacterOptions(), [])

  useEffect(() => {
    setTimeout(() => inputRef?.current?.focus(), 0)
  }, [open])

  const parentW = 100
  const parentH = 150
  const innerW = 140
  const innerH = 170

  const goldBg = 'linear-gradient(180deg, #8A6700, #D6A100 50%)'
  const purpleBg = 'linear-gradient(180deg, #5F388C, #9F6CD9 50%)'

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
    onChange(id)
  }

  return (
    <>
      <Select
        style={selectStyle}
        value={value}
        options={characterOptions}
        placeholder="Character"
        onClick={() => {
          setOpen(true)
          setCurrentFilters(Utils.clone(defaultFilters))
        }}
        dropdownStyle={{ display: 'none' }}
      />

      <Modal
        open={open}
        centered
        width="80%"
        style={{ height: '80%' }}
        destroyOnClose
        title="Select a character"
        onCancel={() => setOpen(false)}
        footer={null}
      >
        <Flex vertical gap={10}>
          <Flex gap={10}>
            <Flex vertical flex={0.5}>
              <Input
                size="large"
                style={{ height: 40 }}
                placeholder="Character name"
                ref={inputRef}
                onChange={(e) => {
                  const newFilters = Utils.clone(currentFilters)
                  newFilters.name = e.target.value.toLowerCase()
                  setCurrentFilters(newFilters)
                }}
              />
            </Flex>
            <Flex vertical flex={0.5}>
              <FilterRow
                name="element"
                tags={generateElementTags()}
                flexBasis="14.2%"
                currentFilters={currentFilters}
                setCurrentFilters={setCurrentFilters}
              />
            </Flex>
            <Flex vertical flex={0.5}>
              <FilterRow
                name="path"
                tags={generatePathTags()}
                flexBasis="14.2%"
                currentFilters={currentFilters}
                setCurrentFilters={setCurrentFilters}
              />
            </Flex>
          </Flex>

          <Flex wrap="wrap" justify="center" style={{ top: 100 }}>
            {
              characterOptions
                .filter((x) => {
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
                })
                .map((characterOption) => (
                  <Card
                    key={characterOption.id}
                    hoverable
                    style={{ margin: 6, background: characterOption.rarity === 5 ? goldBg : purpleBg }}
                    styles={{ body: { padding: 1 } }}
                  >
                    <div style={{ width: `${parentW}px`, height: `${parentH}px`, borderRadius: '10px', overflow: 'hidden' }}>
                      <img
                        width={innerW}
                        src={Assets.getCharacterPreviewById(characterOption.id)}
                        style={{ transform: `translate(${(innerW - parentW) / 2 / innerW * -100}%, ${(innerH - parentH) / 2 / innerH * -100}%)` }}
                        onClick={() => handleClick(characterOption.id)}
                      />
                    </div>
                    <Text strong style={{ position: 'absolute', bottom: 0, width: '100%', textAlign: 'center' }}>{characterOption.displayName}</Text>
                  </Card>
                ))
            }
          </Flex>
        </Flex>
      </Modal>
    </>
  )
}

export default CharacterSelect
