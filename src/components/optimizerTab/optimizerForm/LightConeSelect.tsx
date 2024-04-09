import * as React from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Card, Flex, Input, InputRef, Modal, Select } from 'antd'
import { Utils } from 'lib/utils'
import { Assets } from 'lib/assets'
import { ClassToPath, PathToClass } from 'lib/constants.ts'
import DB from 'lib/db.js'
import { CardGridFilterRow, CardGridItemContent, generatePathTags, generateRarityTags } from 'components/optimizerTab/optimizerForm/CardSelectModalComponents.tsx'

interface LightConeSelectProps {
  value
  characterId: string
  onChange?: (id) => void
  selectStyle?: React.CSSProperties
}

const goldBg = 'linear-gradient(#8A6700 0px, #D6A100 63px, #D6A100 112px, #282B31 112px, #282B31 150px)'
const purpleBg = 'linear-gradient(#5F388C 0px, #9F6CD9 63px, #9F6CD9 112px, #282B31 112px, #282B31 150px)'
const blueBg = 'linear-gradient(#2d4cc5 0px, #4A85C8 63px, #4A85C8 112px, #282B31 112px, #282B31 150px)'

const rarityToBg = {
  5: goldBg,
  4: purpleBg,
  3: blueBg,
}

const parentW = 100
const parentH = 150
const innerW = 115
const innerH = 150

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
      setTimeout(() => inputRef?.current?.focus(), 100)
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

  const handleClick = (id) => {
    setOpen(false)
    if (onChange) onChange(id)
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
                <CardGridFilterRow
                  name="path"
                  tags={generatePathTags()}
                  flexBasis="14.2%"
                  currentFilters={currentFilters}
                  setCurrentFilters={setCurrentFilters}
                />
              </Flex>
              <Flex wrap="wrap" style={{ minWidth: 350, flexGrow: 1 }}>
                <CardGridFilterRow
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
                    <CardGridItemContent imgSrc={Assets.getLightConeIconById(option.id)} text={option.displayName} innerW={innerW} innerH={innerH} rows={2} />
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
