import { Image } from 'antd'
import { Assets } from 'lib/assets.js'

const parentW = 233
const parentH = 350
const innerW = 350
const innerH = 400

export const OptimizerTabCharacterPanel = () => {
  const optimizerTabFocusCharacter = window.store((s) => s.optimizerTabFocusCharacter)

  return (
    <div style={{ width: `${parentW}px`, height: `${parentH}px`, borderRadius: '10px' }}>
      <Image
        preview={false}
        width={innerW}
        src={Assets.getCharacterPreviewById(optimizerTabFocusCharacter)}
        style={{ transform: `translate(${(innerW - parentW) / 2 / innerW * -100}%, ${(innerH - parentH) / 2 / innerH * -100}%)` }}
      />
    </div>
  )
}
