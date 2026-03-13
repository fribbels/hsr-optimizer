import { IconRefresh } from '@tabler/icons-react'
import { ActionIcon, Avatar, Box, Flex, Group, SegmentedControl, Select, Text } from '@mantine/core'
import { Message } from 'lib/interactions/message'
import { Assets } from 'lib/rendering/assets'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { CharacterConditionalsDisplay } from 'lib/tabs/tabOptimizer/conditionals/CharacterConditionalsDisplay'
import { LightConeConditionalDisplay } from 'lib/tabs/tabOptimizer/conditionals/LightConeConditionalDisplay'
import { CharacterSelect } from 'lib/tabs/tabOptimizer/optimizerForm/components/CharacterSelect'
import { LightConeSelect } from 'lib/tabs/tabOptimizer/optimizerForm/components/LightConeSelect'
import {
  renderTeammateOrnamentSetOptions,
  renderTeammateRelicSetOptions,
} from 'lib/tabs/tabOptimizer/optimizerForm/components/teammate/teammateCardUtils'
import { useTeammateCardDebugValues } from 'lib/tabs/tabOptimizer/optimizerForm/components/TeammateCardDebugPanel'
import { updateTeammate } from 'lib/tabs/tabOptimizer/optimizerForm/components/teammate/updateTeammate'
import {
  memo,
  useMemo,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'
import {
  CharacterId,
} from 'types/character'
import {
  TeammateProperty,
} from 'types/form'
import {
  LightConeId,
  SuperImpositionLevel,
} from 'types/lightCone'
import { DBMetadata } from 'types/metadata'
import classes from './TeammateCard.module.css'

const EIDOLON_DATA = ['0', '1', '2', '3', '4', '5', '6'].map((v) => ({ value: v, label: v }))
const SI_DATA = ['1', '2', '3', '4', '5'].map((v) => ({ value: v, label: v }))

const CARD_WIDTH = 420

export const TeammateCard = memo(function TeammateCard({ index, dbMetadata }: {
  index: number
  dbMetadata: DBMetadata
}) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'TeammateCard' })
  const tmIndex = index as 0 | 1 | 2
  const {
    teammateCharacterId,
    teammateEidolon,
    teammateLightConeId,
    teammateSuperimposition,
    teammateTeamRelicSet,
    teammateTeamOrnamentSet,
  } = useOptimizerRequestStore(
    useShallow((s) => ({
      teammateCharacterId: s.teammates[tmIndex].characterId as CharacterId,
      teammateEidolon: s.teammates[tmIndex].characterEidolon,
      teammateLightConeId: s.teammates[tmIndex].lightCone as LightConeId,
      teammateSuperimposition: s.teammates[tmIndex].lightConeSuperimposition as SuperImpositionLevel,
      teammateTeamRelicSet: s.teammates[tmIndex].teamRelicSet,
      teammateTeamOrnamentSet: s.teammates[tmIndex].teamOrnamentSet,
    })),
  )

  const debug = useTeammateCardDebugValues()

  const [teammateSelectModalOpen, setTeammateSelectModalOpen] = useState(false)
  const [teammateLightConeSelectOpen, setTeammateLightConeSelectOpen] = useState(false)

  const disabled = teammateCharacterId == null

  const teammateRelicSetOptions = useMemo(renderTeammateRelicSetOptions(t), [t])
  const teammateOrnamentSetOptions = useMemo(renderTeammateOrnamentSetOptions(t), [t])

  const teammateRelicSelectData = useMemo(() => teammateRelicSetOptions.map((opt) => ({ value: opt.value, label: opt.desc })), [teammateRelicSetOptions])
  const teammateOrnamentSelectData = useMemo(() => teammateOrnamentSetOptions.map((opt) => ({ value: opt.value, label: opt.desc })), [teammateOrnamentSetOptions])

  const insetClass = debug.showInsetShadow ? classes.insetShadow : undefined

  return (
    <Flex
      direction="column"
      className={classes.card}
      w={CARD_WIDTH}
      h={debug.cardHeight}
      style={{ borderRadius: debug.cardBorderRadius }}
    >
      {/* ======== Character area ======== */}
      <Flex style={{ flex: 1, overflow: 'hidden' }} gap={debug.rightColGap}>
        {/* Left — character select + conditionals */}
        <Flex
          direction="column"
          className={`hide-scrollbar ${insetClass ?? ''}`}
          p={debug.zonePx}
          style={{ flex: 1, minWidth: 0, overflow: 'auto' }}
        >
          <Group gap={6} wrap="nowrap" mb={6}>
            <CharacterSelect
              value={teammateCharacterId}
              onChange={(id) => {
                if (id) {
                  useOptimizerRequestStore.getState().setTeammateField(tmIndex, 'characterId', id)
                  updateTeammate({ [`teammate${index}` as TeammateProperty]: { characterId: id } })
                } else {
                  updateTeammate({ [`teammate${index}` as TeammateProperty]: { characterId: null } })
                }
              }}
              selectStyle={{ flex: 1 }}
              externalOpen={teammateSelectModalOpen}
              setExternalOpen={setTeammateSelectModalOpen}
            />

            <ActionIcon
              size="sm"
              variant="default"
              disabled={disabled}
              onClick={() => {
                updateTeammate({ [`teammate${index}` as TeammateProperty]: { characterId: teammateCharacterId } })
                Message.success(t('TeammateSyncSuccessMessage'))
              }}
              aria-label="Sync from roster"
            >
              <IconRefresh size={14} />
            </ActionIcon>
          </Group>

          <CharacterConditionalsDisplay
            id={teammateCharacterId}
            eidolon={teammateEidolon}
            teammateIndex={index}
          />
        </Flex>

        {/* Right — eidolon + avatar + team sets */}
        <Flex
          direction="column"
          w={debug.rightColWidth}
          p={debug.zonePx}
          gap={6}
          className={classes.rightCol}
        >
          <SegmentedControl
            size="xs"
            data={EIDOLON_DATA}
            value={String(teammateEidolon ?? 0)}
            onChange={(v) => useOptimizerRequestStore.getState().setTeammateField(tmIndex, 'characterEidolon', Number(v))}
            fullWidth
            withItemsBorders={false}
            className={classes.segmented}
            disabled={disabled}
          />

          <Avatar
            src={Assets.getCharacterAvatarById(teammateCharacterId)}
            size={debug.avatarSize}
            radius={debug.avatarSize}
            className={classes.avatar}
            onClick={() => setTeammateSelectModalOpen(true)}
            style={{ alignSelf: 'center' }}
          />

          <Box w="100%">
            <Text fz={9} c="dimmed" lts={0.2}>
              {t('RelicsPlaceholder')}
            </Text>
            <Select
              data={teammateRelicSelectData}
              value={teammateTeamRelicSet}
              onChange={(val) => useOptimizerRequestStore.getState().setTeammateField(tmIndex, 'teamRelicSet', val ?? undefined)}
              placeholder={t('RelicsPlaceholder')}
              clearable
              comboboxProps={{ keepMounted: false, width: 'auto' }}
              disabled={disabled}
              mt={2}
              styles={{
                input: { fontSize: 11, height: 24, minHeight: 24 },
              }}
            />
          </Box>

          <Box w="100%">
            <Text fz={9} c="dimmed" lts={0.2}>
              {t('OrnamentsPlaceholder')}
            </Text>
            <Select
              data={teammateOrnamentSelectData}
              value={teammateTeamOrnamentSet}
              onChange={(val) => useOptimizerRequestStore.getState().setTeammateField(tmIndex, 'teamOrnamentSet', val ?? undefined)}
              placeholder={t('OrnamentsPlaceholder')}
              clearable
              comboboxProps={{ keepMounted: false, width: 'auto' }}
              disabled={disabled}
              mt={2}
              styles={{
                input: { fontSize: 11, height: 24, minHeight: 24 },
              }}
            />
          </Box>
        </Flex>
      </Flex>

      {/* ======== LC area ======== */}
      <Flex style={{ overflow: 'hidden' }} gap={debug.rightColGap}>
        {/* Left — LC select + conditionals */}
        <Flex
          direction="column"
          className={insetClass}
          p={debug.zonePx}
          style={{ flex: 1, minWidth: 0 }}
        >
          <Group gap={6} wrap="nowrap" mb={6}>
            <LightConeSelect
              value={teammateLightConeId ?? null}
              onChange={(id) => {
                if (id) {
                  useOptimizerRequestStore.getState().setTeammateField(tmIndex, 'lightCone', id)
                  updateTeammate({ [`teammate${index}` as TeammateProperty]: { lightCone: id } })
                } else {
                  updateTeammate({ [`teammate${index}` as TeammateProperty]: { lightCone: null } })
                }
              }}
              selectStyle={{ flex: 1 }}
              characterId={teammateCharacterId}
              externalOpen={teammateLightConeSelectOpen}
              setExternalOpen={setTeammateLightConeSelectOpen}
            />
          </Group>

          <LightConeConditionalDisplay
            id={teammateLightConeId}
            superImposition={teammateSuperimposition}
            teammateIndex={index}
            dbMetadata={dbMetadata}
          />
        </Flex>

        {/* Right — SI + LC icon */}
        <Flex
          direction="column"
          w={debug.rightColWidth}
          p={debug.zonePx}
          gap={6}
          className={classes.rightColLc}
        >
          <SegmentedControl
            size="xs"
            data={SI_DATA}
            value={String(teammateSuperimposition ?? 1)}
            onChange={(v) => useOptimizerRequestStore.getState().setTeammateField(tmIndex, 'lightConeSuperimposition', Number(v))}
            fullWidth
            withItemsBorders={false}
            className={classes.segmented}
            disabled={disabled}
          />

          <Avatar
            src={Assets.getLightConeIconById(teammateLightConeId)}
            size={debug.lcIconSize}
            radius="sm"
            style={{ cursor: 'pointer', alignSelf: 'center' }}
            onClick={() => setTeammateLightConeSelectOpen(true)}
          />
        </Flex>
      </Flex>
    </Flex>
  )
})
