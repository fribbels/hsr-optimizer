import React from 'react'
import { Flex, Typography } from 'antd'
import { AppPages } from 'lib/db.js'
import CharacterSelect from 'components/optimizerTab/optimizerForm/CharacterSelect.tsx'
import { Assets } from 'lib/assets'

const { Text } = Typography

const parentW = 350
const parentH = 350
const innerW = 350
const innerH = 400

export default function EhrCalculatorTab(): React.JSX.Element {
  const activeKey = window.store((s) => s.activeKey)
  const ehrCalculatorTabFocusCharacter = window.store((s) => s.ehrCalculatorTabFocusCharacter)
  const setEhrCalculatorTabFocusCharacter = window.store((s) => s.setEhrCalculatorTabFocusCharacter)

  if (activeKey != AppPages.EHR_CALCULATOR) {
    // Don't load images unless we're on the changelog tab
    return (<></>)
  }

  function onCharacterChange(x) {
    setEhrCalculatorTabFocusCharacter(x)
  }

  return (
    <Flex vertical gap={10}>
      <CharacterSelect
        value=""
        selectStyle={{ width: innerW }}
        onChange={onCharacterChange}
      />

      <div style={{ width: innerW, overflow: 'hidden' }}>
        <div style={{ width: `${parentW}px`, height: `${parentH}px`, borderRadius: '10px', position: 'relative' }}>
          <img
            width={innerW}
            src={Assets.getCharacterPreviewById(ehrCalculatorTabFocusCharacter)}
            style={{ transform: `translate(${(innerW - parentW) / 2 / innerW * -100}%, ${(innerH - parentH) / 2 / innerH * -100}%)` }}
          />
        </div>
      </div>
    </Flex>
  )
}
