import * as React from 'react'
import { useMemo, useState } from 'react'
import { Card, Flex, Image, Modal, Select, Typography } from 'antd'
import { Utils } from 'lib/utils'
import { Assets } from 'lib/assets'
const { Text } = Typography

interface CharacterSelectProps {
  value
  onChange: (id) => void
  selectStyle?: React.CSSProperties
}

const CharacterSelect: React.FC<CharacterSelectProps> = ({ value, onChange, selectStyle }) => {
  const [open, setOpen] = useState(false)
  const characterOptions = useMemo(() => Utils.generateCharacterOptions(), [])

  const parentW = 117
  const parentH = 175
  const innerW = 175
  const innerH = 200

  const goldBg = 'linear-gradient(180deg, #8A6700, #D6A100 50%)'
  const purpleBg = 'linear-gradient(180deg, #5F388C, #9F6CD9 50%)'

  const handleClick = (id) => {
    onChange(id)
    setOpen(false)
  }

  return (
    <>
      <Select
        style={selectStyle}
        value={value}
        options={characterOptions}
        placeholder="Character"
        onClick={() => setOpen(true)}
        dropdownStyle={{ display: 'none' }}
      />
      <Modal
        open={open}
        centered
        width="80%"
        destroyOnClose
        title="Select a character"
        onCancel={() => setOpen(false)}
        footer={null}
      >
        <Flex wrap="wrap" justify="center">
          {
            characterOptions.map((characterOption) => (
              <Card
                key={characterOption.id}
                hoverable
                style={{ margin: 6, background: characterOption.rarity === 5 ? goldBg : purpleBg }}
                styles={{ body: { padding: 1 } }}
              >
                <div style={{ width: `${parentW}px`, height: `${parentH}px`, borderRadius: '10px', overflow: 'hidden' }}>
                  <Image
                    preview={false}
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
      </Modal>
    </>
  )
}

export default CharacterSelect
