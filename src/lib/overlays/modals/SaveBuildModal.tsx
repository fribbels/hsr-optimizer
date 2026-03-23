import { useForm } from '@mantine/form'
import { Button, Divider, Flex, Modal, TextInput, Tooltip } from '@mantine/core'
import i18next from 'i18next'
import { useConfirmAction } from 'lib/hooks/useConfirmAction'
import { Message } from 'lib/interactions/message'
import {
  BuildList,
  BuildPreview,
} from 'lib/overlays/modals/BuildsModal'
import styles from 'lib/overlays/modals/SaveBuildModal.module.css'
import { useSaveBuildModalStore } from 'lib/overlays/modals/saveBuildModalStore'
import { useScrollLock } from 'lib/layout/scrollController'
import { AppPages, SavedBuildSource } from 'lib/constants/appPages'
import * as buildService from 'lib/services/buildService'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { useOptimizerDisplayStore } from 'lib/stores/optimizerUI/useOptimizerDisplayStore'
import { SaveState } from 'lib/state/saveState'
import { CharacterTabController } from 'lib/tabs/tabCharacters/characterTabController'
import {
  useMemo,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import type {
  Character,
  SavedBuild,
} from 'types/character'
type CharacterForm = {
  name: string,
}

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
  const source = config?.source ?? AppPages.CHARACTERS
  const character = config?.character ?? null

  const characterForm = useForm<CharacterForm>({ initialValues: { name: '' } })
  const [selectedBuild, setSelectedBuild] = useState<number | null>(null)
  const [inputName, setInputName] = useState<string>('')

  useScrollLock(true)

  const setSelectedBuildWrapped = (idx: number | null) => {
    setSelectedBuild(idx)
    if (idx !== null && character) {
      const buildName = character.builds?.[idx]?.name ?? ''
      characterForm.setFieldValue('name', buildName)
      setInputName(buildName)
    } else {
      characterForm.setFieldValue('name', '')
      setInputName('')
    }
  }

  const { t } = useTranslation('modals', { keyPrefix: 'SaveBuild' })
  const { t: tCommon } = useTranslation('common')
  const confirm = useConfirmAction()

  function handleInput(mode: 'overwrite' | 'save') {
    switch (source) {
      case AppPages.CHARACTERS:
        if (mode === 'save') {
          CharacterTabController.confirmSaveBuild(inputName)
        } else {
          CharacterTabController.confirmOverwriteBuild(inputName)
        }
        break
      case AppPages.OPTIMIZER:
        const overwrite = mode === 'overwrite'
        const selectedCharacter = useOptimizerDisplayStore.getState().focusCharacterId
        if (!selectedCharacter) {
          console.warn('no selected character')
          break
        }
        const res = buildService.saveBuild(inputName, selectedCharacter, SavedBuildSource.OPTIMIZER, overwrite)
        if (res) {
          Message.error(res.error)
          break
        }
        if (overwrite) {
          Message.success(i18next.t('modals:SaveBuild.ConfirmOverwrite.SuccessMessage', { name: inputName }))
        } else {
          Message.success(i18next.t('charactersTab:Messages.SaveSuccess', { name: inputName }))
        }
    }
    SaveState.delayedSave()
    closeOverlay()
  }

  function onModalOk() {
    handleInput('save')
  }

  const handleOverwrite = async () => {
    const res = await confirm(t('ConfirmOverwrite.Content'))
    if (res) {
      handleInput('overwrite')
    }
  }

  const nameTaken = character?.builds?.reduce((acc, cur) => acc || cur.name === inputName, false)
  const saveDisabled = nameTaken || inputName === ''
  const overwriteDisabled = !nameTaken || inputName === ''

  const build: SavedBuild | null = useMemo(() => {
    // if build is null then the preview will show the character's currently equipped build as seen in the character tab
    if (selectedBuild !== null && selectedBuild !== -1) {
      return character?.builds?.[selectedBuild] ?? null
    }
    switch (source) {
      case AppPages.CHARACTERS:
        return null
      case AppPages.OPTIMIZER:
        const storeState = useOptimizerRequestStore.getState()
        return {
          name: '',
          optimizerMetadata: null,
          deprioritizeBuffs: storeState.deprioritizeBuffs,
          characterId: storeState.characterId!,
          eidolon: storeState.characterEidolon,
          lightConeId: storeState.lightCone!,
          superimposition: storeState.lightConeSuperimposition,
          characterConditionals: storeState.characterConditionals,
          lightConeConditionals: storeState.lightConeConditionals,
          team: storeState.teammates.map((t) => ({
            characterId: t.characterId!,
            eidolon: t.characterEidolon,
            lightConeId: t.lightCone!,
            superimposition: t.lightConeSuperimposition,
            relicSet: t.teamRelicSet,
            ornamentSet: t.teamOrnamentSet,
            characterConditionals: t.characterConditionals,
            lightConeConditionals: t.lightConeConditionals,
          })),
          equipped: useOptimizerDisplayStore.getState().optimizerBuild ?? {},
        }
    }
  }, [selectedBuild, source, character])

  return (
    <Flex gap={10} className={styles.outerFlex}>
      <Flex direction="column" className={styles.leftColumn}>
        <TextInput
          label={t('Label') /* Build name */}
          {...characterForm.getInputProps('name')}
          onChange={(e) => {
            const value = e.currentTarget.value
            characterForm.setFieldValue('name', value)
            setInputName(value)
            const idx = character?.builds?.findIndex((b) => b.name === value) ?? -1
            setSelectedBuild(idx >= 0 ? idx : null)
          }}
        />
        <Divider className={styles.divider} />
        <Button variant="default" onClick={closeOverlay} className={styles.actionButton}>
          {tCommon('Cancel') /* Cancel */}
        </Button>
        <Tooltip
          label={saveDisabled
            ? nameTaken ? t('Tooltip.SaveDisabled.NameTaken') : t('Tooltip.SaveDisabled.NoName')
            : ''}
          position='right'
        >
          <Button onClick={onModalOk} className={styles.actionButton} disabled={saveDisabled}>
            {tCommon('Save') /* Save */}
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
      <BuildPreview character={character} build={build} />
    </Flex>
  )
}
