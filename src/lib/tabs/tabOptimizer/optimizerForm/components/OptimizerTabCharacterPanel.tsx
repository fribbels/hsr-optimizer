import { Assets } from 'lib/rendering/assets'

const parentW = 233
const parentH = 350
const innerW = 350
const innerH = 400

export const OptimizerTabCharacterPanel = () => {
  const optimizerTabFocusCharacter = window.store((s) => s.optimizerTabFocusCharacter)

  return (
    <div style={{ width: `${parentW}px`, height: `${parentH}px`, borderRadius: '10px', position: 'relative' }}>
      <img
        width={innerW}
        src={Assets.getCharacterPreviewById(optimizerTabFocusCharacter!)}
        style={{ transform: `translate(${(innerW - parentW) / 2 / innerW * -100}%, ${(innerH - parentH) / 2 / innerH * -100}%)`, cursor: 'pointer' }}
        onClick={() => {
          window.store.getState().setOptimizerTabFocusCharacterSelectModalOpen(true)
        }}
      />
    </div>
  )
}

// TODO: I don't really like the way the light cone icon looks on top of the character portrait
// <img
//   width={100}
//   src={Assets.getLightConeIconById(optimizerFormSelectedLightCone)}
//   style={{ position: 'absolute', top: 235, left: 120 }}
// />
