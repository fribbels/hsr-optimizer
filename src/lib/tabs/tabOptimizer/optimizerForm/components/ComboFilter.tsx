import {
  IconCheck,
  IconMinus,
  IconPlus,
  IconRefresh,
  IconSettings,
  IconX,
} from '@tabler/icons-react'
import { ActionIcon, Button, Flex, SegmentedControl } from '@mantine/core'
import { modals } from '@mantine/modals'
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


export function ComboFilters() {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ComboFilter' })
  const comboType = useOptimizerRequestStore((s) => s.comboType)

  return (
    <Flex direction="column" gap={optimizerTabDefaultGap}>
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
          onClick={() => setOpen(OpenCloseIDs.COMBO_DRAWER)}
          leftSection={<IconSettings size={16} />}
          disabled={comboType === ComboType.SIMPLE}
        >
          {t('RotationButton')}
        </Button>
      </Flex>
    </Flex>
  )
}

function add() {
  const store = useOptimizerRequestStore.getState()
  const abilities = [...store.comboTurnAbilities]

  for (let i = 1; i <= ABILITY_LIMIT + 2; i++) {
    if (abilities[i] == null) {
      abilities[i] = DEFAULT_BASIC
      break
    }
  }

  useOptimizerRequestStore.getState().setComboTurnAbilities(abilities)
}

function minus() {
  const store = useOptimizerRequestStore.getState()
  const abilities = [...store.comboTurnAbilities]

  for (let i = ABILITY_LIMIT + 2; i > 1; i--) {
    if (abilities[i] != null) {
      abilities.length = i
      break
    }
  }

  useOptimizerRequestStore.getState().setComboTurnAbilities(abilities)
}

function resetClicked() {
  const characterId = useOptimizerDisplayStore.getState().focusCharacterId!
  const characterMetadata = getGameMetadata().characters[characterId]

  if (!characterMetadata) return

  const defaultComboTurnAbilities = characterMetadata.scoringMetadata?.simulation?.comboTurnAbilities ?? [NULL_TURN_ABILITY_NAME, WHOLE_BASIC]

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
        <HeaderText>{t('AbilityLabel') /* Abilities */}</HeaderText>

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

      <Flex direction="column" gap={3} justify='center'>
        <ActionIcon
          variant='outline'
          size='sm'
          disabled={disabled}
          onClick={() => modals.openConfirmModal({
            title: tCommon('Confirm'),
            children: t('RowControls.ResetConfirm.Description'),
            labels: { confirm: tCommon('Yes'), cancel: tCommon('Cancel') },
            centered: true,
            onConfirm: () => resetClicked(),
          })}
        >
          <IconRefresh size={14} />
        </ActionIcon>
        <ActionIcon variant='outline' size='sm' onClick={() => add()} disabled={disabled}>
          <IconPlus size={14} />
        </ActionIcon>
        <ActionIcon variant='outline' size='sm' onClick={() => minus()} disabled={disabled}>
          <IconMinus size={14} />
        </ActionIcon>
      </Flex>

      <Flex direction="column" gap={3} justify='center'>
        <ActionIcon
          variant={comboPreprocessor ? 'filled' : 'outline'}
          size='sm'
          disabled={disabled}
          onClick={() => useOptimizerRequestStore.getState().setComboPreprocessor(true)}
        >
          <IconCheck size={14} />
        </ActionIcon>
        <ActionIcon
          variant={!comboPreprocessor ? 'filled' : 'outline'}
          size='sm'
          disabled={disabled}
          onClick={() => useOptimizerRequestStore.getState().setComboPreprocessor(false)}
        >
          <IconX size={14} />
        </ActionIcon>
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
