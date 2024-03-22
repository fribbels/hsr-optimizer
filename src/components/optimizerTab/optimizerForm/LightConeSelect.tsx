import * as React from 'react'
import { ReactElement, useEffect, useMemo, useRef, useState } from 'react'
import { Card, Flex, Input, InputRef, Modal, Select, Typography } from 'antd'
import { Utils } from 'lib/utils'
import { Assets } from 'lib/assets'
import CheckableTag from 'antd/lib/tag/CheckableTag'
import { ClassToPath, PathToClass } from 'lib/constants.ts'
import DB from 'lib/db.js'

const { Paragraph } = Typography

interface LightConeSelectProps {
  value
  characterId: string
  onChange?: (id) => void
  selectStyle?: React.CSSProperties
}

const parentW = 100
const parentH = 150
const innerW = 115
const innerH = 150

const goldBg = 'linear-gradient(#8A6700 0px, #D6A100 63px, #D6A100 112px, #282B31 112px, #282B31 150px)'
const purpleBg = 'linear-gradient(#5F388C 0px, #9F6CD9 63px, #9F6CD9 112px, #282B31 112px, #282B31 150px)'
const blueBg = 'linear-gradient(#2d4cc5 0px, #4A85C8 63px, #4A85C8 112px, #282B31 112px, #282B31 150px)'

const rarityToBg = {
  5: goldBg,
  4: purpleBg,
  3: blueBg,
}

function FilterRow({ currentFilters, name, flexBasis, tags, setCurrentFilters }) {
  const selectedTags = currentFilters[name]

  const handleChange = (tag, checked) => {
    const nextSelectedTags = checked
      ? [...selectedTags, tag]
      : selectedTags.filter((t) => t != tag)

    const clonedFilters = Utils.clone(currentFilters)
    clonedFilters[name] = nextSelectedTags

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

// TODO: This is copy pasted from CharacterSelect.tsx. Maybe want to revisit these two files and make the components more modular
const LightConeSelect: React.FC<LightConeSelectProps> = ({ characterId, value, onChange, selectStyle }) => {
  // console.log('==================================== LC SELECT')
  const characterMetadata = DB.getMetadata().characters
  const [open, setOpen] = useState(false)
  const defaultFilters = useMemo(() => {
    return {
      rarity: [],
      path: characterId ? [ClassToPath[characterMetadata[characterId].path]] : [],
      name: '',
    }
  }, [characterId])

  const inputRef = useRef<InputRef>(null)
  const [currentFilters, setCurrentFilters] = useState(Utils.clone(defaultFilters))
  const lightConeOptions = useMemo(() => Utils.generateLightConeOptions(), [])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef?.current?.focus(), 0)
    }
  }, [open])

  function applyFilters(x) {
    if (currentFilters.rarity.length && !currentFilters.rarity.includes(x.rarity)) {
      return false
    }
    if (currentFilters.path.length && !currentFilters.path.map((x) => PathToClass[x]).includes(x.path)) {
      return false
    }
    if (!x.name.toLowerCase().includes(currentFilters.name)) {
      return false
    }

    return true
  }

  function generateRarityTags() {
    return [5, 4, 3].map((x) => {
      const stars: ReactElement[] = []
      for (let i = 0; i < x; i++) {
        stars.push(<img key={i} style={{ width: 16 }} src={Assets.getStar()} />)
      }
      return {
        key: x,
        display: (
          <Flex flex={1} justify="center" align="center" style={{ marginTop: 1 }}>
            {stars}
          </Flex>
        ),
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
    if (onChange)onChange(id)
  }

  return (
    <>
      <Select
        style={selectStyle}
        value={value}
        options={lightConeOptions}
        placeholder="Light cone"
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
        width="90%"
        style={{ height: '70%', maxWidth: 1200 }}
        destroyOnClose
        title="Select a light cone"
        onCancel={() => setOpen(false)}
        footer={null}
      >
        <Flex vertical gap={12}>
          <Flex gap={12} wrap="wrap">
            <Flex vertical wrap="wrap" style={{ minWidth: 300, flexGrow: 1 }}>
              <Input
                size="large"
                style={{ height: 40 }}
                placeholder="Light cone"
                ref={inputRef}
                onChange={(e) => {
                  const newFilters = Utils.clone(currentFilters)
                  newFilters.name = e.target.value.toLowerCase()
                  setCurrentFilters(newFilters)
                }}
                onPressEnter={() => {
                  const first = lightConeOptions.filter(applyFilters)[0]
                  if (first) {
                    handleClick(first.id)
                  }
                }}
              />
            </Flex>
            <Flex wrap="wrap" style={{ flexGrow: 1 }} gap={12}>
              <Flex wrap="wrap" style={{ minWidth: 350, flexGrow: 1 }}>
                <FilterRow
                  name="path"
                  tags={generatePathTags()}
                  flexBasis="14.2%"
                  currentFilters={currentFilters}
                  setCurrentFilters={setCurrentFilters}
                />
              </Flex>
              <Flex wrap="wrap" style={{ minWidth: 350, flexGrow: 1 }}>
                <FilterRow
                  name="rarity"
                  tags={generateRarityTags()}
                  flexBasis="14.2%"
                  currentFilters={currentFilters}
                  setCurrentFilters={setCurrentFilters}
                />
              </Flex>
            </Flex>
          </Flex>

          <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${parentW}px, 1fr))`, gridGap: 8 }}>
            {
              lightConeOptions
                .sort(Utils.sortRarityDesc)
                .filter(applyFilters)
                .map((option) => (
                  <Card
                    key={option.id}
                    hoverable
                    style={{
                      background: rarityToBg[option.rarity],
                      overflow: 'hidden',
                      height: `${parentH}px`,
                    }}
                    onMouseDown={() => handleClick(option.id)}
                    styles={{ body: { padding: 1 } }}
                  >
                    <img
                      width={innerW}
                      src={Assets.getLightConeIconById(option.id)}
                      style={{
                        transform: `translate(${(innerW - parentW) / 2 / innerW * -100}%, ${(innerH - parentH) / 2 / innerH * -100}%)`,
                      }}
                    />
                    <Paragraph
                      ellipsis={{ rows: 2 }}
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        width: '110%',
                        textAlign: 'center',
                        background: '#282B31',
                        color: '#D0D0D2',
                        marginLeft: '-5%',
                        paddingLeft: 10,
                        paddingRight: 10,
                        lineHeight: '16px',
                        height: 36,
                        alignItems: 'center',
                        marginBottom: 0,
                      }}
                    >
                      <div
                        style={{
                          position: 'relative',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          maxHeight: 36,
                        }}
                      >
                        {option.displayName}
                      </div>
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

export default LightConeSelect
