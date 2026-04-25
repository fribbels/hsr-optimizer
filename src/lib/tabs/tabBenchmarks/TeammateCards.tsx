import { Flex } from '@mantine/core'
import { OverlayText } from 'lib/characterPreview/CharacterPreviewComponents'
import { useCharacterModalStore } from 'lib/overlays/modals/characterModalStore'
import { Assets } from 'lib/rendering/assets'
import { useBenchmarksTabStore } from 'lib/tabs/tabBenchmarks/useBenchmarksTabStore'
import { HeaderText } from 'lib/ui/HeaderText'
import { useTranslation } from 'react-i18next'
import teammateClasses from 'style/teammateCard.module.css'
import { useShallow } from 'zustand/react/shallow'

export function TeammatesSection() {
  const { t } = useTranslation('benchmarksTab', { keyPrefix: 'MiddlePanel' })
  return (
    <Flex direction='column'>
      <HeaderText>{t('TeammatesHeader')}</HeaderText>
      <Flex justify='space-around'>
        <Teammate index={0} />
        <Teammate index={1} />
        <Teammate index={2} />
      </Flex>
    </Flex>
  )
}

export function Teammate({ index }: { index: number }) {
  const { t } = useTranslation('common')
  const {
    onCharacterModalOk,
    setSelectedTeammateIndex,
    teammate,
  } = useBenchmarksTabStore(useShallow((s) => ({
    onCharacterModalOk: s.onCharacterModalOk,
    setSelectedTeammateIndex: s.setSelectedTeammateIndex,
    teammate: [s.teammate0, s.teammate1, s.teammate2][index],
  })))
  const characterId = teammate?.characterId
  const lightCone = teammate?.lightCone
  const characterEidolon = teammate?.characterEidolon ?? 0
  const lightConeSuperimposition = teammate?.lightConeSuperimposition ?? 1

  return (
    <div
      className={`custom-grid ${teammateClasses.teammateCard}`}
      style={{ cursor: 'pointer' }}
      onClick={() => {
        setSelectedTeammateIndex(index)
        useCharacterModalStore.getState().openOverlay({
          initialCharacter: teammate ? { form: teammate } : undefined,
          onOk: onCharacterModalOk,
          showSetSelection: true,
        })
      }}
    >
      <Flex direction='column' align='center'>
        <img
          src={Assets.getCharacterAvatarById(characterId)}
          className={teammateClasses.teammateAvatar}
        />

        <OverlayText
          text={t('EidolonNShort', { eidolon: characterEidolon })}
          top={-12}
        />

        <div className={teammateClasses.iconWrapper}>
          <img
            src={Assets.getLightConeIconById(lightCone)}
            className={teammateClasses.lcIcon}
          />

          {teammate && teammate.teamRelicSet && (
            <img
              className={teammateClasses.relicBadge}
              src={Assets.getSetImage(teammate.teamRelicSet)}
            />
          )}

          {teammate && teammate.teamOrnamentSet && (
            <img
              className={teammateClasses.ornamentBadge}
              src={Assets.getSetImage(teammate.teamOrnamentSet)}
            />
          )}
        </div>

        <OverlayText
          text={t('SuperimpositionNShort', { superimposition: lightConeSuperimposition })}
          top={-18}
        />
      </Flex>
    </div>
  )
}
