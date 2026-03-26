import { Button, Flex } from '@mantine/core'
import { Hint } from 'lib/interactions/hint'
import { useBuildsModalStore } from 'lib/overlays/modals/buildsModalStore'
import { useSaveBuildModalStore } from 'lib/overlays/modals/saveBuildModalStore'
import { useOptimizerDisplayStore } from 'lib/stores/optimizerUI/useOptimizerDisplayStore'
import { HeaderText } from 'lib/ui/HeaderText'
import { TooltipImage } from 'lib/ui/TooltipImage'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { BuildSource } from 'types/savedBuild'

const defaultGap = 5

export const BuildsSection = React.memo(function BuildsSection({ isFullSize }: { isFullSize: boolean }) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'Sidebar.BuildsGroup' })
  const focusCharacter = useOptimizerDisplayStore((s) => s.focusCharacterId)

  if (!isFullSize || !focusCharacter) return null

  return (
    <Flex direction="column">
      <Flex justify='space-between' align='center'>
        <HeaderText>{t('Header')}</HeaderText>
        <TooltipImage type={Hint.builds()} />
      </Flex>
      <Flex gap={defaultGap} justify='space-around'>
        <Button
          variant="default"
          style={{ flex: 1 }}
          onClick={() => useSaveBuildModalStore.getState().openOverlay({ source: BuildSource.Optimizer, characterId: focusCharacter })}
        >
          {t('Save')}
        </Button>
        <Button
          variant="default"
          style={{ flex: 1 }}
          onClick={() => useBuildsModalStore.getState().openOverlay({ characterId: focusCharacter })}
        >
          {t('Load')}
        </Button>
      </Flex>
    </Flex>
  )
})
