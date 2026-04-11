import {
  ActionIcon,
  Avatar,
  CheckIcon,
  CloseButton,
  Combobox,
  Flex,
  Group,
  Input,
  InputBase,
  SegmentedControl,
  useCombobox,
} from '@mantine/core'
import { IconRefresh } from '@tabler/icons-react'
import { Constants } from 'lib/constants/constants'
import { Message } from 'lib/interactions/message'
import { Assets } from 'lib/rendering/assets'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { CharacterConditionalsDisplay } from 'lib/tabs/tabOptimizer/conditionals/CharacterConditionalsDisplay'
import { LightConeConditionalDisplay } from 'lib/tabs/tabOptimizer/conditionals/LightConeConditionalDisplay'
import {
  type OptionRender,
  renderTeammateOrnamentSetOptions,
  renderTeammateRelicSetOptions,
} from 'lib/tabs/tabOptimizer/optimizerForm/components/teammate/teammateCardUtils'
import { updateTeammate } from 'lib/tabs/tabOptimizer/optimizerForm/components/teammate/updateTeammate'
import { CharacterSelect } from 'lib/ui/selectors/CharacterSelect'
import { LightConeSelect } from 'lib/ui/selectors/LightConeSelect'
import {
  memo,
  useMemo,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import iconClasses from 'style/icons.module.css'
import type { TeammateProperty } from 'types/form'
import type { DBMetadata } from 'types/metadata'
import { useShallow } from 'zustand/react/shallow'
import classes from './TeammateCard.module.css'

const EIDOLON_DATA = ['0', '1', '2', '3', '4', '5', '6'].map((v) => ({ value: v, label: v }))
const SI_DATA = ['1', '2', '3', '4', '5'].map((v) => ({ value: v, label: v }))

const CARD_WIDTH = 420

export const TeammateCard = memo(function TeammateCard({ index, dbMetadata }: {
  index: 0 | 1 | 2,
  dbMetadata: DBMetadata,
}) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'TeammateCard' })
  const {
    teammateCharacterId,
    teammateEidolon,
    teammateLightConeId,
    teammateSuperimposition,
    teammateTeamRelicSet,
    teammateTeamOrnamentSet,
  } = useOptimizerRequestStore(
    useShallow((s) => ({
      teammateCharacterId: s.teammates[index].characterId,
      teammateEidolon: s.teammates[index].characterEidolon,
      teammateLightConeId: s.teammates[index].lightCone,
      teammateSuperimposition: s.teammates[index].lightConeSuperimposition,
      teammateTeamRelicSet: s.teammates[index].teamRelicSet,
      teammateTeamOrnamentSet: s.teammates[index].teamOrnamentSet,
    })),
  )

  const [teammateSelectModalOpen, setTeammateSelectModalOpen] = useState(false)
  const [teammateLightConeSelectOpen, setTeammateLightConeSelectOpen] = useState(false)

  const disabled = teammateCharacterId == null

  const teammateRelicSetOptions = useMemo(renderTeammateRelicSetOptions(t), [t])
  const teammateOrnamentSetOptions = useMemo(renderTeammateOrnamentSetOptions(t), [t])

  return (
    <Flex
      direction='column'
      className={`${classes.card} hide-scrollbar`}
      w={CARD_WIDTH}
      h={490}
      style={{ borderRadius: 6, overflowY: 'auto' }}
    >
      {/* ======== Character area ======== */}
      <Flex style={{ flexShrink: 0 }} gap={0}>
        {/* Left — character select + conditionals */}
        <Flex
          direction='column'
          py={10}
          pl={10}
          pr={5}
          style={{ flex: 1, minWidth: 0 }}
        >
          <Group gap={6} wrap='nowrap' mb={6}>
            <CharacterSelect
              value={teammateCharacterId ?? null}
              onChange={(id) => {
                if (id) {
                  useOptimizerRequestStore.getState().setTeammateField(index, 'characterId', id)
                  updateTeammate({ [`teammate${index}` as TeammateProperty]: { characterId: id } })
                } else {
                  updateTeammate({ [`teammate${index}` as TeammateProperty]: { characterId: null } })
                }
              }}
              selectStyle={{ flex: 1 }}
              opened={teammateSelectModalOpen}
              onOpenChange={setTeammateSelectModalOpen}
              showIcon={false}
            />

            <ActionIcon
              size={30}
              variant='default'
              disabled={disabled}
              onClick={() => {
                updateTeammate({ [`teammate${index}` as TeammateProperty]: { characterId: teammateCharacterId } })
                Message.success(t('TeammateSyncSuccessMessage'))
              }}
              aria-label='Sync from roster'
            >
              <IconRefresh size={16} />
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
          direction='column'
          w={135}
          py={10}
          pl={5}
          pr={10}
          gap={16}
          className={classes.rightCol}
        >
          <SegmentedControl
            size='xs'
            data={EIDOLON_DATA}
            value={String(teammateEidolon ?? 0)}
            onChange={(v) => useOptimizerRequestStore.getState().setTeammateField(index, 'characterEidolon', Number(v))}
            fullWidth
            withItemsBorders={false}
            className={classes.segmented}
            disabled={disabled}
          />

          <Avatar
            src={Assets.getCharacterAvatarById(teammateCharacterId)}
            size={96}
            radius={96}
            className={classes.avatar}
            onClick={() => setTeammateSelectModalOpen(true)}
            style={{ alignSelf: 'center' }}
          />

          <Flex direction='column' w='100%' gap={6}>
            <ClearableCombobox
              data={teammateRelicSetOptions}
              value={teammateTeamRelicSet}
              onChange={(val) => useOptimizerRequestStore.getState().setTeammateField(index, 'teamRelicSet', val)}
              placeholder={t('RelicsPlaceholder')}
              disabled={disabled}
            />
            <ClearableCombobox
              data={teammateOrnamentSetOptions}
              value={teammateTeamOrnamentSet}
              onChange={(val) => useOptimizerRequestStore.getState().setTeammateField(index, 'teamOrnamentSet', val)}
              placeholder={t('OrnamentsPlaceholder')}
              disabled={disabled}
            />
          </Flex>
        </Flex>
      </Flex>

      {/* ======== LC area ======== */}
      <Flex style={{ flex: '1 0 auto' }} gap={0}>
        {/* Left — LC select + conditionals */}
        <Flex
          direction='column'
          py={10}
          pl={10}
          pr={5}
          style={{ flex: 1, minWidth: 0 }}
        >
          <Group gap={6} wrap='nowrap' mb={6}>
            <LightConeSelect
              value={teammateLightConeId ?? null}
              onChange={(id) => {
                if (id) {
                  useOptimizerRequestStore.getState().setTeammateField(index, 'lightCone', id)
                  updateTeammate({ [`teammate${index}` as TeammateProperty]: { lightCone: id } })
                } else {
                  updateTeammate({ [`teammate${index}` as TeammateProperty]: { lightCone: null } })
                }
              }}
              selectStyle={{ flex: 1 }}
              characterId={teammateCharacterId}
              opened={teammateLightConeSelectOpen}
              onOpenChange={setTeammateLightConeSelectOpen}
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
          direction='column'
          w={135}
          py={10}
          pl={5}
          pr={10}
          gap={6}
          className={classes.rightColLc}
        >
          <SegmentedControl
            size='xs'
            data={SI_DATA}
            value={String(teammateSuperimposition ?? 1)}
            onChange={(v) => useOptimizerRequestStore.getState().setTeammateField(index, 'lightConeSuperimposition', Number(v))}
            fullWidth
            withItemsBorders={false}
            className={classes.segmented}
            disabled={disabled}
          />

          <Avatar
            src={Assets.getLightConeIconById(teammateLightConeId)}
            size={96}
            radius='sm'
            style={{ cursor: 'pointer', alignSelf: 'center' }}
            onClick={() => setTeammateLightConeSelectOpen(true)}
          />
        </Flex>
      </Flex>
    </Flex>
  )
})

function ClearableCombobox({ data, value, onChange, placeholder, disabled }: {
  data: OptionRender[],
  value: string | undefined,
  onChange: (val: string | undefined) => void,
  placeholder: string,
  disabled: boolean,
}) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  })

  const selected = data.find((d) => d.value === value)

  return (
    <Combobox
      store={combobox}
      width='auto'
      onOptionSubmit={(val) => {
        onChange(val)
        combobox.closeDropdown()
      }}
    >
      <Combobox.Target>
        <InputBase
          component='button'
          type='button'
          pointer
          disabled={disabled}
          leftSection={value ? <img src={Assets.getSetImage(value, Constants.Parts.PlanarSphere)} className={iconClasses.icon20} /> : undefined}
          rightSection={value != null
            ? (
              <CloseButton
                size='sm'
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onChange(undefined)}
              />
            )
            : <Combobox.Chevron />}
          rightSectionPointerEvents={value == null ? 'none' : 'all'}
          onClick={() => combobox.toggleDropdown()}
          styles={{
            input: {
              height: 30,
              minHeight: 30,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              paddingInlineEnd: 22,
              ...(!value ? { '--input-padding-inline-start': '6px' } : {}),
            },
          }}
        >
          {selected?.text || <Input.Placeholder>{placeholder}</Input.Placeholder>}
        </InputBase>
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options>
          {combobox.dropdownOpened && data.map((item) => (
            <Combobox.Option value={item.value} key={item.value}>
              <Group gap={6} justify='space-between' wrap='nowrap'>
                <Flex gap={10} align='center'>
                  <img src={Assets.getSetImage(item.value, Constants.Parts.PlanarSphere)} className={iconClasses.icon26} />
                  {item.desc}
                </Flex>
                {item.value === value && <CheckIcon size={12} />}
              </Group>
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  )
}
