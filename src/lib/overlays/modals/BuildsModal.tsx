import {
  IconCamera,
  IconDownload,
  IconTrash,
} from '@tabler/icons-react'
import { Button, Flex, Modal } from '@mantine/core'
import { CharacterPreview } from 'lib/characterPreview/CharacterPreview'
import { ShowcaseSource } from 'lib/characterPreview/CharacterPreviewComponents'
import { Message } from 'lib/interactions/message'
import styles from 'lib/overlays/modals/BuildsModal.module.css'
import { useBuildsModalStore } from 'lib/overlays/modals/buildsModalStore'
import { Assets } from 'lib/rendering/assets'
import { useScrollLock } from 'lib/layout/scrollController'
import { AppPages } from 'lib/constants/appPages'
import * as buildService from 'lib/services/buildService'
import { useGlobalStore } from 'lib/stores/app/appStore'
import { getCharacterById, useCharacterStore } from 'lib/stores/character/characterStore'
import { useCharacterTabStore } from 'lib/tabs/tabCharacters/useCharacterTabStore'
import { useConfirmAction } from 'lib/hooks/useConfirmAction'
import { useScreenshotAction } from 'lib/hooks/useScreenshotAction'
import { useShallow } from 'zustand/react/shallow'
import { HeaderText } from 'lib/ui/HeaderText'
import {
  type CSSProperties,
  Fragment,
  memo,
  useCallback,
  useEffect,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import type {
  Character,
  CharacterId,
} from 'types/character'
import type { SavedBuild } from 'types/savedBuild'

export function BuildsModal() {
  const { open, closeOverlay, characterId } = useBuildsModalStore(
    useShallow((s) => ({ open: s.open, closeOverlay: s.closeOverlay, characterId: s.config?.characterId }))
  )
  const hasBuilds = useCharacterStore(
    useCallback((s) => characterId ? !!(s.charactersById[characterId]?.builds?.length) : false, [characterId]),
  )

  return (
    <Modal
      opened={open}
      size={open && hasBuilds ? 1550 : 300}
      centered
      onClose={closeOverlay}
    >
      {open && <BuildsModalContent />}
    </Modal>
  )
}

function BuildsModalContent() {
  const { config, closeOverlay } = useBuildsModalStore(
    useShallow((s) => ({ config: s.config, closeOverlay: s.closeOverlay }))
  )
  const characterId = config?.characterId ?? null
  const character = useCharacterStore(
    useCallback((s) => characterId ? s.charactersById[characterId] ?? null : null, [characterId]),
  )

  const { t } = useTranslation(['modals', 'gameData', 'common'])
  const [selectedBuild, setSelectedBuild] = useState<string | null>(null)
  const confirm = useConfirmAction()
  const { loading, trigger: screenshot } = useScreenshotAction('buildPreview')

  useScrollLock(true)

  // When opening, pick the first build if there are any
  useEffect(() => {
    if (character?.builds?.length) {
      setSelectedBuild(character.builds[0].name)
    }
  }, [character?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!character?.builds?.length) {
    return (
      <>
        {t('Builds.NoBuilds.NoneSaved')}
      </>
    )
  }

  const handleCancel = useCallback(() => {
    setSelectedBuild(null)
    closeOverlay()
  }, [closeOverlay])

  const handleDeleteAllBuilds = async () => {
    const characterName = t(`gameData:Characters.${character.id}.Name`)
    const result = await confirm(t('Builds.ConfirmDelete.DeleteAll'))
    if (result) {
      setSelectedBuild(null)
      buildService.clearBuilds(character.id)
      Message.success(t('Builds.ConfirmDelete.SuccessMessageAll', { characterName }))
      closeOverlay()
    }
  }

  const handleDeleteSingleBuild = useCallback(async (name: string) => {
    const result = await confirm(t('Builds.ConfirmDelete.DeleteSingle', { name }))
    if (result) {
      setSelectedBuild(null)
      buildService.deleteBuild(character.id, name)
      Message.success(t('Builds.ConfirmDelete.SuccessMessageSingle', { name }))
      const fresh = getCharacterById(character.id)
      if (!fresh?.builds?.length) closeOverlay()
    }
  }, [character.id, closeOverlay, confirm, t])

  const handleEquip = useCallback(async (build: SavedBuild) => {
    const result = await confirm(t('Builds.ConfirmEquip.Content'))
    if (result) {
      buildService.equipBuildRelics(build.characterId, build.equipped)
      Message.success(t('Builds.ConfirmEquip.SuccessMessage', { buildName: build.name }))
      handleCancel()
      useCharacterTabStore.getState().setFocusCharacter(build.characterId)
      useGlobalStore.getState().setActiveKey(AppPages.CHARACTERS)
    }
  }, [closeOverlay, confirm, handleCancel, t])

  function clipboardClicked(action: 'clipboard' | 'download') {
    if (selectedBuild === null || character === null) {
      return
    }
    const charId = character.id
    screenshot(action, `${t(`gameData:Characters.${charId}.LongName`)}_${selectedBuild}`)
  }

  const build = selectedBuild !== null
    ? character.builds.find((b) => b.name === selectedBuild) ?? null
    : null

  return (
    <>
      <Flex gap={10}>
        <BuildList
          character={character}
          selectedBuild={selectedBuild}
          setSelectedBuild={setSelectedBuild}
          handleEquip={handleEquip}
          handleDelete={handleDeleteSingleBuild}
          closeModal={closeOverlay}
        />

        <BuildPreview character={character} build={build} />
      </Flex>
      <Flex justify='flex-end' gap={8} className={styles.footerActions}>
        <Button
          key='download'
          loading={loading}
          onClick={() => clipboardClicked('download')}
          className={styles.actionButton}
        >
          <IconDownload size={16} />
        </Button>
        <Button
          key='clipboard'
          loading={loading}
          onClick={() => clipboardClicked('clipboard')}
          className={styles.actionButton}
        >
          <IconCamera size={16} />
        </Button>
        <Button key='delete' color='red' onClick={() => handleDeleteAllBuilds()}>
          {t('Builds.DeleteAll')}
        </Button>
        <Button key='back' onClick={handleCancel}>
          {t('common:Cancel')}
        </Button>
      </Flex>
    </>
  )
}

export const BuildPreview = memo(function BuildPreview(props: { character: Character | null; build: SavedBuild | null }) {
  if (props.character !== null) {
    return (
      <CharacterPreview
        character={props.character}
        source={ShowcaseSource.BUILDS_MODAL}
        id='buildPreview'
        savedBuildOverride={props.build}
      />
    )
  }

  return <div className={styles.emptyPreview}></div>
})

interface BuildListBaseProps {
  character: Character | null
  selectedBuild: string | null
  setSelectedBuild: (name: string | null) => void
  style?: CSSProperties
  closeModal?: () => void
}

interface InteractiveBuildListProps extends BuildListBaseProps {
  handleEquip: (build: SavedBuild) => Promise<void>
  handleDelete: (name: string) => void
  preview?: never
}

interface PreviewBuildListProps extends BuildListBaseProps {
  preview: true
  handleEquip?: never
  handleDelete?: never
}

type BuildListProps = InteractiveBuildListProps | PreviewBuildListProps

export function BuildList(props: BuildListProps) {
  const {
    character,
    selectedBuild,
    setSelectedBuild,
    handleEquip,
    handleDelete,
    preview,
    style,
    closeModal,
  } = props
  return (
    <Flex
      direction="column"
      className={styles.buildList}
      style={style}
      gap={8}
      onClick={() => setSelectedBuild(null)}
    >
      {character?.builds?.map((build) => {
        return preview
          ? (
            <BuildCard
              key={build.name}
              build={build}
              characterId={character.id}
              selectedBuild={selectedBuild}
              setSelectedBuild={setSelectedBuild}
              closeModal={closeModal}
              preview
            />
          )
          : (
            <BuildCard
              key={build.name}
              build={build}
              characterId={character.id}
              selectedBuild={selectedBuild}
              setSelectedBuild={setSelectedBuild}
              closeModal={closeModal}
              handleEquip={handleEquip}
              handleDelete={handleDelete}
            />
          )
      })}
    </Flex>
  )
}

interface BuildCardBaseProps {
  characterId: CharacterId
  build: SavedBuild
  selectedBuild: string | null
  setSelectedBuild: (name: string) => void
  closeModal?: () => void
}

interface InteractiveBuildCardProps extends BuildCardBaseProps {
  handleEquip: (build: SavedBuild) => Promise<void>
  handleDelete: (name: string) => void
  preview?: never
}

interface PreviewBuildCardProps extends BuildCardBaseProps {
  preview: true
  handleEquip?: never
  handleDelete?: never
}

type BuildCardProps = InteractiveBuildCardProps | PreviewBuildCardProps

const BuildCard = memo(function BuildCard(props: BuildCardProps) {
  const {
    build,
    selectedBuild,
    setSelectedBuild,
    handleEquip,
    handleDelete,
    preview,
    closeModal,
  } = props
  const { t } = useTranslation('modals', { keyPrefix: 'Builds' })
  const selected = selectedBuild === build.name

  return (
    <div
      className={styles.buildCard}
      style={{
        backgroundColor: selected ? 'var(--layer-3)' : 'var(--layer-1)',
      }}
      onClick={(e) => {
        setSelectedBuild(build.name)
        e.stopPropagation()
      }}
    >
      <Flex direction="column" gap={8}>
        <Flex justify='space-between' gap={8} align='center'>
          <Flex direction="column" align='flex-start'>
            <HeaderText style={{ flex: 1, fontSize: 16, fontWeight: 600, maxWidth: preview ? 350 : 85, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{build.name}</HeaderText>
          </Flex>
          {!preview && (
            <Flex gap={5}>
              <Button
                onClick={() => {
                  void handleEquip(build)
                }}
              >
                {t('Equip')}
              </Button>
              <Button
                onClick={() => {
                  buildService.loadBuildInOptimizer(build)
                  closeModal?.()
                }}
              >
                {t('Load')}
              </Button>
              <Button
                className={styles.deleteButton}
                onClick={() => {
                  handleDelete(build.name)
                }}
              >
                <IconTrash size={16} />
              </Button>
            </Flex>
          )}
        </Flex>
        <TeammatePreview build={build} />
      </Flex>
    </div>
  )
})

const TeammatePreview = memo(function TeammatePreview(props: { build: SavedBuild }) {
  const { build } = props
  const hasTeammates = build.team.some(Boolean)
  if (!hasTeammates) return null

  const imgStyle: CSSProperties = {
    opacity: 1,
    height: 50,
  }
  return (
    <Flex
      justify='space-around'
      gap={8}
    >
      {build.team.map((ally, idx) => (
        ally
          ? (
            <Fragment key={idx}>
              <img src={Assets.getCharacterAvatarById(ally.characterId)} className={styles.teammateImg} style={imgStyle} />
              <img src={Assets.getLightConeIconById(ally.lightCone)} className={styles.teammateImg} style={imgStyle} />
            </Fragment>
          )
          : null
      ))}
    </Flex>
  )
})
