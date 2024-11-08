import * as React from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Card, Flex, Input, InputRef, Modal, Select } from 'antd'
import { Utils } from 'lib/utils'
import { Assets } from 'lib/assets'
import DB from 'lib/db'
import { CardGridItemContent, generatePathTags, generateRarityTags, SegmentedFilterRow } from 'components/optimizerTab/optimizerForm/CardSelectModalComponents'
import { useTranslation } from 'react-i18next'

interface LightConeSelectProps {
  value
  characterId: string
  onChange?: (id) => void
  selectStyle?: React.CSSProperties
  initialPath?: string
  withIcon?: boolean
  externalOpen?: boolean
  setExternalOpen?: (state: boolean) => void
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

const LightConeSelect: React.FC<LightConeSelectProps> = ({ characterId, value, onChange, selectStyle, initialPath, withIcon, externalOpen, setExternalOpen }) => {
  // console.log('==================================== LC SELECT')
  const metadata = DB.getMetadata()
  const [open, setOpen] = useState(false)
  const { t } = useTranslation('modals', { keyPrefix: 'LightconeSelect' })
  const defaultFilters = useMemo(() => {
    return {
      rarity: [],
      path: initialPath ?? (characterId ? [metadata.characters[characterId].path] : []),
      name: '',
    }
  }, [characterId, initialPath])

  const inputRef = useRef<InputRef>(null)
  const [currentFilters, setCurrentFilters] = useState(Utils.clone(defaultFilters))
  const lightConeOptions = useMemo(() => Utils.generateLightConeOptions(), [t])

  const labelledOptions = useMemo(() => {
    const labelledOptions: { value: string; label }[] = []
    for (const option of lightConeOptions) {
      labelledOptions.push({
        value: option.value,
        label: (
          <Flex gap={5} align='center'>
            <img
              src={Assets.getPath(metadata.lightCones[option.value].path)}
              style={{ height: 22, marginRight: 4 }}
            />
            {option.label}
          </Flex>
        ),
      })
    }
    return labelledOptions
  }, [lightConeOptions])

  useEffect(() => {
    if (open || externalOpen) {
      setTimeout(() => inputRef?.current?.focus(), 100)
    }
  }, [open, externalOpen])

  function applyFilters(x) {
    if (currentFilters.rarity.length && !currentFilters.rarity.includes(x.rarity)) {
      return false
    }
    if (currentFilters.path.length && !currentFilters.path.includes(x.path)) {
      return false
    }
    if (!x.name.toLowerCase().includes(currentFilters.name)) {
      return false
    }

    return true
  }

  const handleClick = (id) => {
    setOpen(false)
    if (setExternalOpen) setExternalOpen(false)
    if (onChange) onChange(id)
  }

  return (
    <>
      <Select
        style={selectStyle}
        value={value}
        options={withIcon ? labelledOptions : lightConeOptions}
        placeholder={t('Placeholder')/* Lightcone */}
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
        open={open || externalOpen}
        centered
        width='90%'
        style={{ height: '70%', maxWidth: 1200 }}
        destroyOnClose
        title={t('Title')}
        onCancel={() => {
          setOpen(false)
          if (setExternalOpen) setExternalOpen(false)
        }}
        footer={null}
      >
        <Flex vertical gap={12}>
          <Flex gap={12} wrap='wrap'>
            <Flex vertical wrap='wrap' style={{ minWidth: 300, flexGrow: 1 }}>
              <Input
                size='large'
                style={{ height: 40 }}
                placeholder={t('Placeholder')/* Select a lightcone */}
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
            <Flex wrap='wrap' style={{ flexGrow: 1 }} gap={12}>
              <Flex wrap='wrap' style={{ minWidth: 350, flexGrow: 1 }}>
                <SegmentedFilterRow
                  name='path'
                  tags={generatePathTags()}
                  flexBasis='14.2%'
                  currentFilters={currentFilters}
                  setCurrentFilters={setCurrentFilters}
                />
              </Flex>
              <Flex wrap='wrap' style={{ minWidth: 350, flexGrow: 1 }}>
                <SegmentedFilterRow
                  name='rarity'
                  tags={generateRarityTags()}
                  flexBasis='14.2%'
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
                    <CardGridItemContent imgSrc={Assets.getLightConeIconById(option.id)} text={option.label} innerW={innerW} innerH={innerH} rows={2}/>
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
