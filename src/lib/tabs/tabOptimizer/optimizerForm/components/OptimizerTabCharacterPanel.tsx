import { Assets } from 'lib/rendering/assets'

const parentW = 233
const parentH = 350
const innerW = 350
const innerH = 400

export const OptimizerTabCharacterPanel = () => {
  const optimizerTabFocusCharacter = window.store((s) => s.optimizerTabFocusCharacter)

  return (
    <div style={{ width: parentW, height: parentH, borderRadius: 10, position: 'relative' }}>
      <CharacterPreviewInternalImage id={optimizerTabFocusCharacter!} />
    </div>
  )
}

export function CharacterPreviewInternalImage(props: { id: string, disableClick?: boolean, parentH?: number }) {
  const customParentH = props.parentH ?? parentH
  const customInnerH = customParentH >= innerH ? customParentH : innerH
  return (
    <img
      width={innerW}
      src={Assets.getCharacterPreviewById(props.id)}
      style={{
        transform: `translate(${(innerW - parentW) / 2 / innerW * -100}%, ${(customInnerH - customParentH) / 2 / customInnerH * -100}%)`,
        cursor: props.disableClick ? '' : 'pointer',
      }}
      onClick={() => {
        if (props.disableClick) return
        window.store.getState().setOptimizerTabFocusCharacterSelectModalOpen(true)
      }}
    />
  )
}

// TODO: I don't really like the way the light cone icon looks on top of the character portrait
// <img
//   width={100}
//   src={Assets.getLightConeIconById(optimizerFormSelectedLightCone)}
//   style={{ position: 'absolute', top: 235, left: 120 }}
// />
