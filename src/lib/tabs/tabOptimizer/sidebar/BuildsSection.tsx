import { Button, Flex } from '@mantine/core'
import { Hint } from 'lib/interactions/hint'
import { BuildsModal } from 'lib/overlays/modals/BuildsModal'
import { SaveBuildModal } from 'lib/overlays/modals/SaveBuildModal'
import { AppPages } from 'lib/state/db'
import { useCharacterTabStore } from 'lib/tabs/tabCharacters/useCharacterTabStore'
import { useOptimizerDisplayStore } from 'lib/stores/optimizerUI/useOptimizerDisplayStore'
import { HeaderText } from 'lib/ui/HeaderText'
import { TooltipImage } from 'lib/ui/TooltipImage'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

const defaultGap = 5

export const BuildsSection = React.memo(function BuildsSection(props: { isFullSize: boolean }) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'Sidebar.BuildsGroup' })
  const [saveBuildModalOpen, setSaveBuildModalOpen] = useState(false)
  const [buildsModalOpen, setBuildsModalOpen] = useState(false)
  const focusCharacter = useOptimizerDisplayStore((s) => s.focusCharacterId)
  const charactersById = useCharacterTabStore((s) => s.charactersById)

  if (!props.isFullSize || !focusCharacter) return <></>

  const character = charactersById[focusCharacter] ?? null

  return (
    <Flex direction="column">
      <SaveBuildModal
        character={character}
        source={AppPages.OPTIMIZER}
        isOpen={saveBuildModalOpen}
        close={() => setSaveBuildModalOpen(false)}
      />
      <BuildsModal
        selectedCharacter={character}
        isOpen={buildsModalOpen}
        close={() => setBuildsModalOpen(false)}
      />
      <Flex justify='space-between' align='center'>
        <HeaderText>{t('Header')}</HeaderText>
        <TooltipImage type={Hint.builds()} />
      </Flex>
      <Flex gap={defaultGap} justify='space-around'>
        <Button
          variant="default"
          style={{ width: '100px' }}
          onClick={() => setSaveBuildModalOpen(true)}
        >
          {t('Save')}
        </Button>
        <Button
          variant="default"
          style={{ width: '100px' }}
          onClick={() => setBuildsModalOpen(true)}
        >
          {t('Load')}
        </Button>
      </Flex>
    </Flex>
  )
})
