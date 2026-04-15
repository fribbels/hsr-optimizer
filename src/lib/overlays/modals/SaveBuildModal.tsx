import {
  Button,
  Divider,
  Flex,
  Modal,
  TextInput,
  Tooltip,
} from '@mantine/core'
import i18next from 'i18next'
import { useConfirmAction } from 'lib/hooks/useConfirmAction'
import { Message } from 'lib/interactions/message'
import { useScrollLock } from 'lib/layout/scrollController'
import {
  BuildList,
  BuildPreview,
} from 'lib/overlays/modals/BuildsModal'
import styles from 'lib/overlays/modals/SaveBuildModal.module.css'
import { useSaveBuildModalStore } from 'lib/overlays/modals/saveBuildModalStore'
import { serializeFromOptimizer } from 'lib/services/buildConverter'
import * as buildService from 'lib/services/buildService'
import { useCharacterStore } from 'lib/stores/character/characterStore'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { useOptimizerDisplayStore } from 'lib/stores/optimizerUI/useOptimizerDisplayStore'
import {
  useCallback,
  useMemo,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import type { LightConeId } from 'types/lightCone'
import {
  BuildSource,
  type SavedBuild,
} from 'types/savedBuild'

export function SaveBuildModal() {
  const open = useSaveBuildModalStore((s) => s.open)
  const closeOverlay = useSaveBuildModalStore((s) => s.closeOverlay)

  return (
    <Modal
      opened={open}
      size={1550}
      centered
      onClose={closeOverlay}
    >
      {open && <SaveBuildModalContent />}
    </Modal>
  )
}

function SaveBuildModalContent() {
  const config = useSaveBuildModalStore((s) => s.config)
  const closeOverlay = useSaveBuildModalStore((s) => s.closeOverlay)
  const source = config?.source ?? BuildSource.Character
  const characterId = config?.characterId ?? null
  const character = useCharacterStore(
    useCallback((s) => characterId ? s.charactersById[characterId] ?? null : null, [characterId]),
  )

  const [selectedBuild, setSelectedBuild] = useState<string | null>(null)
  const [inputName, setInputName] = useState<string>('')

  useScrollLock(true)

  const setSelectedBuildWrapped = (name: string | null) => {
    setSelectedBuild(name)
    if (name !== null && character) {
      const build = character.builds?.find((b) => b.name === name)
      setInputName(build?.name ?? '')
    } else {
      setInputName('')
    }
  }

  const { t } = useTranslation('modals', { keyPrefix: 'SaveBuild' })
  const { t: tCommon } = useTranslation('common')
  const confirm = useConfirmAction()

  function handleSave(mode: 'overwrite' | 'save') {
    if (!characterId) return
    const result = buildService.saveBuild(inputName, characterId, source, mode === 'overwrite')
    if (result?.error) {
      Message.error(result.error)
      return
    }
    Message.success(
      mode === 'overwrite'
        ? i18next.t('modals:SaveBuild.ConfirmOverwrite.SuccessMessage', { name: inputName })
        : i18next.t('charactersTab:Messages.SaveSuccess', { name: inputName }),
    )
    closeOverlay()
  }

  function onModalOk() {
    handleSave('save')
  }

  const handleOverwrite = async () => {
    const res = await confirm(t('ConfirmOverwrite.Content'))
    if (res) {
      handleSave('overwrite')
    }
  }

  const nameTaken = character?.builds?.some((b) => b.name === inputName) ?? false
  const saveDisabled = nameTaken || inputName === ''
  const overwriteDisabled = !nameTaken || inputName === ''

  const previewBuild: SavedBuild | null = useMemo(() => {
    if (selectedBuild !== null) {
      return character?.builds?.find((b) => b.name === selectedBuild) ?? null
    }
    if (!character || !characterId) return null
    if (source === BuildSource.Optimizer) {
      const state = useOptimizerRequestStore.getState()
      if (!state.lightCone) return null
      const equipped = useOptimizerDisplayStore.getState().optimizerBuild ?? {}
      return serializeFromOptimizer('', characterId, state as typeof state & { lightCone: LightConeId }, equipped)
    }
    return null // Character tab: preview shows character's current equipped
  }, [selectedBuild, source, character, characterId])

  return (
    <Flex gap={10} className={styles.outerFlex}>
      <Flex direction='column' className={styles.leftColumn}>
        <TextInput
          label={t('Label')}
          value={inputName}
          onChange={(e) => {
            const value = e.currentTarget.value
            setInputName(value)
            const match = character?.builds?.find((b) => b.name === value)
            setSelectedBuild(match ? match.name : null)
          }}
        />
        <Divider className={styles.divider} />
        <Button variant='default' onClick={closeOverlay} className={styles.actionButton}>
          {tCommon('Cancel')}
        </Button>
        <Tooltip
          label={saveDisabled
            ? nameTaken ? t('Tooltip.SaveDisabled.NameTaken') : t('Tooltip.SaveDisabled.NoName')
            : ''}
          position='right'
        >
          <Button onClick={onModalOk} className={styles.actionButton} disabled={saveDisabled}>
            {tCommon('Save')}
          </Button>
        </Tooltip>
        <Tooltip label={overwriteDisabled ? t('Tooltip.OverwriteDisabled') : ''} position='right'>
          <Button onClick={handleOverwrite} className={styles.actionButton} disabled={overwriteDisabled}>
            {t('Overwrite')}
          </Button>
        </Tooltip>
        <Divider className={styles.divider} />
        <BuildList
          preview
          character={character}
          selectedBuild={selectedBuild}
          setSelectedBuild={setSelectedBuildWrapped}
          style={{ height: '100%' }}
        />
      </Flex>
      <BuildPreview character={character} build={previewBuild} />
    </Flex>
  )
}
