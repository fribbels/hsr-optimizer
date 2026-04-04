import {
  IconMinus,
  IconPlus,
  IconRefresh,
  IconSettings,
  IconWand,
  IconWandOff,
} from '@tabler/icons-react'
import { ActionIcon, Button, Flex, rem, SegmentedControl, Tooltip } from '@mantine/core'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { ABILITY_LIMIT } from 'lib/constants/constants'
import {
  OpenCloseIDs,
  setOpen,
} from 'lib/hooks/useOpenClose'
import { Hint } from 'lib/interactions/hint'
import { ComboType } from 'lib/optimization/rotation/comboType'
import { getDefaultComboTurnAbilities } from 'lib/optimization/rotation/comboStateTransform'
import {
  DEFAULT_BASIC,
  NULL_TURN_ABILITY_NAME,
  TurnAbilityName,
  WHOLE_BASIC,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { useOptimizerDisplayStore } from 'lib/stores/optimizerUI/useOptimizerDisplayStore'
import {
  TurnAbilitySelector,
  TurnAbilitySelectorSimple,
} from 'lib/tabs/tabOptimizer/optimizerForm/components/TurnAbilitySelector'
import { optimizerTabDefaultGap } from 'lib/tabs/tabOptimizer/optimizerForm/grid/optimizerGridColumns'
import { HeaderText } from 'lib/ui/HeaderText'
import { TooltipImage } from 'lib/ui/TooltipImage'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'
import classes from './ComboFilter.module.css'

const controlSize = 28

export function ComboFilters() {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ComboFilter' })
  const comboType = useOptimizerRequestStore((s) => s.comboType)

  return (
    <Flex direction="column" gap={optimizerTabDefaultGap + 3}>
      <Flex justify='space-between' align='center'>
        <HeaderText>{t('Header') /* Rotation COMBO formula */}</HeaderText>
        <TooltipImage type={Hint.comboFilters()} />
      </Flex>
      <SegmentedControl
        fullWidth
        value={comboType}
        onChange={(value) => useOptimizerRequestStore.getState().setComboType(value as ComboType)}
        data={[
          { label: t('ModeSelector.Simple'), value: ComboType.SIMPLE },
          { label: t('ModeSelector.Advanced'), value: ComboType.ADVANCED },
        ]}
      />

      <ComboBasicDefinition />

      <Flex direction="column" gap={8} className={classes.advancedButtonContainer}>
        <Button
          variant="default"
          onMouseDown={(e: React.MouseEvent) => { if (e.button === 0) setOpen(OpenCloseIDs.COMBO_DRAWER) }}
          leftSection={<IconSettings size={16} stroke={1.5} />}
          disabled={comboType === ComboType.SIMPLE}
        >
          {t('RotationButton')}
        </Button>
      </Flex>
    </Flex>
  )
}

export function addAbility(abilities: TurnAbilityName[]): TurnAbilityName[] {
  const result = [...abilities]
  for (let i = 1; i <= ABILITY_LIMIT; i++) {
    if (result[i] == null) {
      result[i] = DEFAULT_BASIC
      break
    }
  }
  return result
}

export function removeAbility(abilities: TurnAbilityName[]): TurnAbilityName[] {
  const result = [...abilities]
  for (let i = ABILITY_LIMIT; i > 1; i--) {
    if (result[i] != null) {
      result.length = i
      break
    }
  }
  return result
}

function add() {
  const abilities = useOptimizerRequestStore.getState().comboTurnAbilities
  useOptimizerRequestStore.getState().setComboTurnAbilities(addAbility(abilities))
}

function minus() {
  const abilities = useOptimizerRequestStore.getState().comboTurnAbilities
  useOptimizerRequestStore.getState().setComboTurnAbilities(removeAbility(abilities))
}

function resetClicked() {
  const characterId = useOptimizerDisplayStore.getState().focusCharacterId!
  const characterMetadata = getGameMetadata().characters[characterId]

  if (!characterMetadata) return

  const defaultComboTurnAbilities = [...(characterMetadata.scoringMetadata?.simulation?.comboTurnAbilities ?? [NULL_TURN_ABILITY_NAME, WHOLE_BASIC])]

  useOptimizerRequestStore.getState().setComboTurnAbilities(defaultComboTurnAbilities)
  useOptimizerRequestStore.getState().setComboStateJson('{}')
}

function ComboBasicDefinition() {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ComboFilter' })
  const { t: tCommon } = useTranslation('common')
  const {
    comboType,
    characterId,
    characterEidolon,
    comboPreprocessor,
    comboTurnAbilities,
  } = useOptimizerRequestStore(
    useShallow((s) => ({
      comboType: s.comboType,
      characterId: s.characterId,
      characterEidolon: s.characterEidolon,
      comboPreprocessor: s.comboPreprocessor,
      comboTurnAbilities: s.comboTurnAbilities,
    })),
  )

  const {
    comboTurnAbilities: defaultComboTurnAbilities,
  } = getDefaultComboTurnAbilities(characterId!, characterEidolon)

  const disabled = comboType === ComboType.SIMPLE

  return (
    <Flex className={classes.comboContainer}>
      <Flex direction="column" flex={1} className={classes.abilitiesColumn} gap={3}>
        <Flex direction="column" flex={1} className={classes.abilitiesColumn} style={{ display: comboType === ComboType.ADVANCED ? 'flex' : 'none' }} gap={3}>
          {Array.from({ length: ABILITY_LIMIT }, (_, i) => (
            <ComboOptionRowSelect
              key={i + 1}
              index={i + 1}
              disabled={disabled}
            />
          ))}
        </Flex>

        <Flex direction="column" flex={1} className={`${classes.abilitiesColumn} ${classes.simpleAbilities}`} style={{ display: comboType === ComboType.SIMPLE ? 'flex' : 'none' }} gap={3}>
          {Array.from({ length: ABILITY_LIMIT }, (_, i) => <TurnAbilitySelectorSimple key={i + 1} value={defaultComboTurnAbilities[i + 1]} index={i + 1} />)}
        </Flex>
      </Flex>

      <Flex direction="column" gap={controlSize / 2} w={controlSize}>
        <Flex direction="column" gap={5}>
          <Tooltip label={t('RowControls.ResetTooltip')} position='right' openDelay={300} withArrow>
            <ActionIcon
              variant='default'
              w='100%'
              h={controlSize}
              disabled={disabled}
              onClick={() => modals.openConfirmModal({
                title: tCommon('Confirm'),
                children: t('RowControls.ResetConfirm.Description'),
                labels: { confirm: tCommon('Yes'), cancel: tCommon('Cancel') },
                centered: true,
                onConfirm: () => resetClicked(),
              })}
            >
              <IconRefresh size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label={t('RowControls.AddTooltip')} position='right' openDelay={300} withArrow>
            <ActionIcon variant='default' w='100%' h={controlSize} onClick={() => add()} disabled={disabled}>
              <IconPlus size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label={t('RowControls.RemoveTooltip')} position='right' openDelay={300} withArrow>
            <ActionIcon variant='default' w='100%' h={controlSize} onClick={() => minus()} disabled={disabled}>
              <IconMinus size={16} />
            </ActionIcon>
          </Tooltip>
        </Flex>

        <Tooltip label={t('RowControls.PresetsTooltip')} position='right' openDelay={300} withArrow>
          <SegmentedControl
            orientation='vertical'
            fullWidth
            disabled={disabled}
            value={String(comboPreprocessor)}
            onChange={(value) => {
              const enabled = value === 'true'
              useOptimizerRequestStore.getState().setComboPreprocessor(enabled)
              notifications.show({
                message: enabled ? t('Presets.Enabled') : t('Presets.Disabled'),
                autoClose: 2000,
              })
            }}
            styles={{
              root: { padding: 0 },
              label: {
                padding: 0,
                height: rem(controlSize),
                width: rem(controlSize),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              },
            }}
            data={[
              { label: <IconWand size={16} />, value: 'true' },
              { label: <IconWandOff size={16} />, value: 'false' },
            ]}
          />
        </Tooltip>
      </Flex>
    </Flex>
  )
}

function ComboOptionRowSelect({ index, disabled }: { index: number; disabled: boolean }) {
  const comboTurnAbilities = useOptimizerRequestStore((s) => s.comboTurnAbilities)
  const shouldRenderSegmented = comboTurnAbilities[index] != null || index < 2

  return shouldRenderSegmented
    ? <TurnAbilitySelector index={index} disabled={disabled} />
    : null
}
