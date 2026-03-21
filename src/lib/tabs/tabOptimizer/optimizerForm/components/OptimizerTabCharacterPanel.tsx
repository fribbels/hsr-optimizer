import type { CharacterId } from 'types/character'
import { Assets } from 'lib/rendering/assets'
import { useOptimizerDisplayStore } from 'lib/stores/optimizerUI/useOptimizerDisplayStore'

const parentW = 233
const parentH = 350
const innerW = 350
const innerH = 400

export function OptimizerTabCharacterPanel() {
  const optimizerTabFocusCharacter = useOptimizerDisplayStore((s) => s.focusCharacterId)

  return (
    <div style={{ width: parentW, height: parentH, borderRadius: 6, position: 'relative' }}>
      <CharacterPreviewInternalImage id={optimizerTabFocusCharacter!} />
    </div>
  )
}

export function CharacterPreviewInternalImage({ id, disableClick, parentH: customParentHProp }: {
  id: CharacterId
  disableClick?: boolean
  parentH?: number
}) {
  const customParentH = customParentHProp ?? parentH
  const customInnerH = customParentH >= innerH ? customParentH : innerH
  return (
    <img
      width={innerW}
      src={Assets.getCharacterPreviewById(id)}
      style={{
        transform: `translate(${(innerW - parentW) / 2 / innerW * -100}%, ${(customInnerH - customParentH) / 2 / customInnerH * -100}%)`,
        cursor: disableClick ? '' : 'pointer',
      }}
      onClick={() => {
        if (disableClick) return
        useOptimizerDisplayStore.getState().setCharacterSelectModalOpen(true)
      }}
    />
  )
}
