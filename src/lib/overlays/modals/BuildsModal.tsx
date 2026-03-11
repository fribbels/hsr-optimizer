import {
  IconCamera,
  IconDownload,
  IconTrash,
} from '@tabler/icons-react'
import { Button, Flex, Modal, useMantineTheme } from '@mantine/core'
import { CharacterPreview } from 'lib/characterPreview/CharacterPreview'
import { ShowcaseSource } from 'lib/characterPreview/CharacterPreviewComponents'
import { CUSTOM_TEAM } from 'lib/constants/constants'
import { Message } from 'lib/interactions/message'
import { defaultTeammate } from 'lib/optimization/defaultForm'
import styles from 'lib/overlays/modals/BuildsModal.module.css'
import { Assets } from 'lib/rendering/assets'
import { useScrollLock } from 'lib/rendering/scrollController'
import DB, { useGlobalStore, AppPages } from 'lib/state/db'
import { SaveState } from 'lib/state/saveState'
import { useCharacterTabStore } from 'lib/tabs/tabCharacters/useCharacterTabStore'
import { useConfirmAction } from 'lib/hooks/useConfirmAction'
import { HeaderText } from 'lib/ui/HeaderText'
import { TsUtils } from 'lib/utils/TsUtils'
import { Utils } from 'lib/utils/utils'
import {
  CSSProperties,
  Fragment,
  memo,
  useEffect,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import type {
  Character,
  CharacterId,
  SavedBuild,
} from 'types/character'
import { Teammate } from 'types/form'

// FIXME LOW

export function BuildsModal(props: { selectedCharacter: Character | null, isOpen: boolean, close: () => void }) {
  const {
    selectedCharacter,
    isOpen,
    close,
  } = props
  const { t } = useTranslation(['modals', 'gameData', 'common'])
  const [selectedBuild, setSelectedBuild] = useState<null | number>(null)
  const confirm = useConfirmAction()

  const [loading, setLoading] = useState(false)

  useScrollLock(isOpen)

  // When opening, pick the first build if there are any
  useEffect(() => {
    if (isOpen && selectedCharacter?.builds?.length) {
      setSelectedBuild(0)
    }
  }, [isOpen, selectedCharacter])

  if (!selectedCharacter?.builds?.length) {
    return (
      <Modal
        opened={isOpen}
        size={300}
        onClose={close}
        centered
      >
        {t('Builds.NoBuilds.NoneSaved') /* No saved builds */}
      </Modal>
    )
  }

  function onModalOk() {
    close()
  }

  const handleCancel = () => {
    setSelectedBuild(null)
    close()
  }

  const handleDeleteAllBuilds = async () => {
    const characterName = t(`gameData:Characters.${selectedCharacter.id}.Name`)
    const result = await confirm(t('Builds.ConfirmDelete.DeleteAll') /* Are you sure you want to delete all builds? */)
    if (result) {
      setSelectedBuild(null)
      DB.clearCharacterBuilds(selectedCharacter?.id)
      SaveState.delayedSave()
      Message.success(t('Builds.ConfirmDelete.SuccessMessageAll', { characterName: characterName }) /* Successfully deleted all builds for {{characterName}} */)
      close()
    }
  }

  const handleDeleteSingleBuild = async (name: string) => {
    const result = await confirm(t('Builds.ConfirmDelete.DeleteSingle', { name: name }) /* Are you sure you want to delete {{name}}? */)
    if (result) {
      setSelectedBuild(null)
      DB.deleteCharacterBuild(selectedCharacter?.id, name)
      SaveState.delayedSave()
      Message.success(t('Builds.ConfirmDelete.SuccessMessageSingle', { name: name }) /* Successfully deleted build: {{name}} */)

      if (selectedCharacter?.builds?.length == 0) {
        close()
      }
    }
  }

  const handleEquip = async (build: SavedBuild) => {
    const result = await confirm(t('Builds.ConfirmEquip.Content') /* Equipping this will unequip characters that use the relics in this build */)
    if (result) {
      DB.equipRelicIdsToCharacter(
        Object.values(build.equipped),
        selectedCharacter?.id,
      )
      const simulation = TsUtils.clone(DB.getScoringMetadata(selectedCharacter.id).simulation)
      if (simulation) {
        simulation.deprioritizeBuffs = build.deprioritizeBuffs
        for (let i = 0; i <= 2; i++) {
          const teammate = build.team[i]
          if (!teammate) {
            simulation.teammates[i] = defaultTeammate() as Teammate
          } else {
            simulation.teammates[i] = {
              characterId: teammate.characterId,
              characterEidolon: teammate.eidolon,
              lightCone: teammate.lightConeId,
              lightConeSuperimposition: teammate.superimposition,
              teamRelicSet: teammate.relicSet,
              teamOrnamentSet: teammate.ornamentSet,
            }
          }
        }
        DB.updateSimulationScoreOverrides(selectedCharacter.id, simulation)
        useGlobalStore.getState().setShowcaseTeamPreferenceById([selectedCharacter.id, CUSTOM_TEAM])
      }
      SaveState.delayedSave()
      Message.success(t('Builds.ConfirmEquip.SuccessMessage', { buildName: build.name }) /* Successfully equipped build: {{buildName}} */)
      handleCancel()
      // equip can be triggered from the optimizer tab, move to character tab and focus on the appropriate character
      useCharacterTabStore.getState().setFocusCharacter(build.characterId)
      useGlobalStore.getState().setActiveKey(AppPages.CHARACTERS)
    }
  }

  function clipboardClicked(action: string) {
    if (selectedBuild === null || selectedCharacter === null || !selectedCharacter.builds) {
      console.debug(selectedBuild, selectedCharacter)
      return
    }
    setLoading(true)
    const charId = selectedCharacter.id
    const buildName = selectedCharacter.builds[selectedBuild].name
    setTimeout(() => {
      void Utils.screenshotElementById('buildPreview', action, `${t(`gameData:Characters.${charId}.LongName`)}_${buildName}`)
        .finally(() => {
          setLoading(false)
        })
    }, 100)
  }

  const build = selectedBuild !== null
    ? selectedCharacter?.builds[selectedBuild] ?? null
    : null

  return (
    <Modal
      opened={isOpen}
      size={1550}
      centered
      onClose={handleCancel}
    >
      <Flex gap={10}>
        <BuildList
          character={selectedCharacter}
          selectedBuild={selectedBuild}
          setSelectedBuild={setSelectedBuild}
          handleEquip={handleEquip}
          handleDelete={handleDeleteSingleBuild}
          closeModal={close}
        />

        <BuildPreview character={selectedCharacter} build={build} />
      </Flex>
      <Flex justify='flex-end' gap={8} className={styles.footerActions}>
        <Button
          key='download'
          leftSection={<IconDownload style={{ fontSize: 30 }} size={16} />}
          loading={loading}
          onClick={() => {
            clipboardClicked('download')
          }}
          className={styles.actionButton}
        >
        </Button>
        <Button
          key='clipboard'
          leftSection={<IconCamera style={{ fontSize: 30 }} size={16} />}
          loading={loading}
          onClick={() => clipboardClicked('clipboard')}
          className={styles.actionButton}
        >
        </Button>
        <Button key='delete' onClick={() => handleDeleteAllBuilds()}>
          {t('Builds.DeleteAll') /* Delete All */}
        </Button>
        <Button key='back' onClick={handleCancel}>
          {t('common:Cancel') /* Cancel */}
        </Button>
      </Flex>
    </Modal>
  )
}

export const BuildPreview = memo(function BuildPreview(props: { character: Character | null, build: SavedBuild | null }) {
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
  selectedBuild: number | null
  setSelectedBuild: (index: number | null) => void
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
      {character?.builds?.map((build, index) => {
        return preview
          ? (
            <BuildCard
              key={index}
              index={index}
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
              key={index}
              index={index}
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
  index: number
  build: SavedBuild
  selectedBuild: number | null
  setSelectedBuild: (index: number) => void
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
    characterId,
    index,
    build,
    selectedBuild,
    setSelectedBuild,
    handleEquip,
    handleDelete,
    preview,
    closeModal,
  } = props
  const { t } = useTranslation('modals', { keyPrefix: 'Builds' })
  const selected = selectedBuild === index
  const theme = useMantineTheme()
  return (
    <div
      className={styles.buildCard}
      style={{
        backgroundColor: selected ? '#001529' : theme.colors.dark[7],
        borderColor: theme.colors.dark[4],
      }}
      onClick={(e) => {
        setSelectedBuild(index)
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
                {t('Equip') /* Equip */}
              </Button>
              <Button
                onClick={() => {
                  DB.loadCharacterBuildInOptimizer(characterId, index)
                  closeModal?.()
                }}
              >
                {t('Load') /* Load in Optimizer */}
              </Button>
              <Button
                className={styles.deleteButton}
                leftSection={<IconTrash size={16} />}
                onClick={() => {
                  handleDelete(build.name)
                }}
              />
            </Flex>
          )}
        </Flex>
        <TeammatePreview build={build} display={true} />
      </Flex>
    </div>
  )
})

const TeammatePreview = memo(function TeammatePreview(props: { build: SavedBuild, display: boolean }) {
  const { build, display } = props
  const imgStyle: CSSProperties = {
    opacity: display ? 1 : 0,
    height: display ? 50 : 0,
  }
  return (
    <Flex
      justify='space-around'
      gap={8}
    >
      {build.team.map((ally, idx) => (
        <Fragment key={idx}>
          <img src={Assets.getCharacterAvatarById(ally.characterId)} className={styles.teammateImg} style={imgStyle} />
          <img src={Assets.getLightConeIconById(ally.lightConeId)} className={styles.teammateImg} style={{ ...imgStyle, visibility: ally.characterId ? 'visible' : 'hidden' }} />
        </Fragment>
      ))}
    </Flex>
  )
})
