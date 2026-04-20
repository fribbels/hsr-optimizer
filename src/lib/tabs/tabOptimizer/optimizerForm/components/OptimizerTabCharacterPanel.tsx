import { Flex } from '@mantine/core'
import { showcaseOutlineLight } from 'lib/characterPreview/CharacterPreviewComponents'
import { Assets } from 'lib/rendering/assets'
import { DEFAULT_LC_IMAGE_OFFSET } from 'lib/rendering/lcImageTransform'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { useOptimizerDisplayStore } from 'lib/stores/optimizerUI/useOptimizerDisplayStore'
import { CenteredImage } from 'lib/ui/CenteredImage'
import type { CharacterId } from 'types/character'

const containerW = 248
const charInnerW = 350
const charInnerH = 400
const charZoom = 0.75 // < 1 to zoom out, > 1 to zoom in
const charVerticalOffset = -20 // negative = up
const charFilter = 'brightness(1.05) saturate(1.05)'

const cardGap = 10
const lcCardH = 85
const formCardH = 415
const charCardH = formCardH - lcCardH - cardGap
const lcZoom = 1.15 // > 1 to zoom in

const cardStyle = {
  borderRadius: 6,
  backgroundColor: 'var(--layer-2)',
  boxShadow: 'var(--shadow-card)',
  overflow: 'hidden' as const,
}

export function OptimizerTabCharacterPanel() {
  const optimizerTabFocusCharacter = useOptimizerDisplayStore((s) => s.focusCharacterId)
  const lightCone = useOptimizerRequestStore((s) => s.lightCone)

  const lightConeMetadata = lightCone ? getGameMetadata().lightCones[lightCone] : null
  const lcOffset = lightConeMetadata?.imageOffset ?? DEFAULT_LC_IMAGE_OFFSET

  return (
    <Flex direction="column" gap={cardGap}>
      <div style={{ ...cardStyle, width: containerW, height: charCardH, position: 'relative' }}>
        <CharacterPreviewInternalImage id={optimizerTabFocusCharacter!} parentH={charCardH} />
      </div>
      <div
        style={{
          ...cardStyle,
          width: containerW,
          height: lcCardH,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          border: showcaseOutlineLight,
          cursor: 'pointer',
        }}
        onClick={() => useOptimizerDisplayStore.getState().setLightConeSelectModalOpen(true)}
      >
        <div style={{ transform: `scale(${lcZoom})`, overflow: 'hidden', filter: 'brightness(0.95) saturate(0.90)' }}>
          <CenteredImage
            src={lightCone ? Assets.getLightConePortraitById(lightCone) : Assets.getBlank()}
            containerW={containerW}
            containerH={lcCardH}
            imageOffset={lcOffset}
          />
        </div>
      </div>
    </Flex>
  )
}

export function CharacterPreviewInternalImage({ id, disableClick, parentH: customParentHProp, parentW: customParentWProp }: {
  id: CharacterId,
  disableClick?: boolean,
  parentH?: number,
  parentW?: number,
}) {
  const customParentH = customParentHProp ?? charCardH
  const customParentW = customParentWProp ?? containerW
  const customInnerH = customParentH >= charInnerH ? customParentH : charInnerH
  return (
    <img
      width={charInnerW}
      src={Assets.getCharacterPreviewById(id)}
      style={{
        transform: `translate(${(charInnerW - customParentW) / 2 / charInnerW * -100}%, calc(${(customInnerH - customParentH) / 2 / customInnerH * -100}% + ${charVerticalOffset}px)) scale(${charZoom})`,
        cursor: disableClick ? '' : 'pointer',
        filter: charFilter,
      }}
      onClick={() => {
        if (disableClick) return
        useOptimizerDisplayStore.getState().setCharacterSelectModalOpen(true)
      }}
    />
  )
}
