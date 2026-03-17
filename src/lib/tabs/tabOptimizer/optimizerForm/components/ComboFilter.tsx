import {
  IconCheck,
  IconSettings,
  IconX,
} from '@tabler/icons-react'
import { Button, Flex, SegmentedControl } from '@mantine/core'
import { modals } from '@mantine/modals'
import { CharacterConditionalsResolver } from 'lib/conditionals/resolver/characterConditionalsResolver'
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
import { VerticalDivider } from 'lib/ui/Dividers'
import { HeaderText } from 'lib/ui/HeaderText'
import { TooltipImage } from 'lib/ui/TooltipImage'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'
import { CharacterConditionalsController } from 'types/conditionals'
import classes from './ComboFilter.module.css'


export function ComboFilters() {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ComboFilter' })
  const comboType = useOptimizerRequestStore((s) => s.comboType)
  const characterId = useOptimizerRequestStore((s) => s.characterId)
  const characterEidolon = useOptimizerRequestStore((s) => s.characterEidolon)
  const comboOptions = useMemo(() => {
    if (characterId == null || characterEidolon == null) return []

    const characterConditionals: CharacterConditionalsController = CharacterConditionalsResolver.get({
      characterId,
      characterEidolon,
    })

    const actions = characterConditionals.actionDeclaration ? characterConditionals.actionDeclaration() : []

    return actions.map((x) => ({
      label: x,
      value: x,
    }))
  }, [t, characterId, characterEidolon])

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

      <ComboBasicDefinition comboOptions={comboOptions} />

      <Flex direction="column" gap={8} className={classes.advancedButtonContainer}>
        <Button
          variant="default"
          onClick={() => setOpen(OpenCloseIDs.COMBO_DRAWER)}
          leftSection={<IconSettings size={16} />}
          disabled={comboType == ComboType.SIMPLE}
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

function ComboBasicDefinition({ comboOptions }: { comboOptions: { value: string; label: string }[] }) {
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

  const disabled = comboType == ComboType.SIMPLE

  return (
    <Flex className={classes.comboContainer}>
      <Flex direction="column" flex={1} className={classes.abilitiesColumn} gap={3}>
        <HeaderText>{t('AbilityLabel') /* Abilities */}</HeaderText>

        <Flex direction="column" flex={1} className={classes.abilitiesColumn} style={{ display: comboType == ComboType.ADVANCED ? 'flex' : 'none' }} gap={3}>
          {Array.from({ length: ABILITY_LIMIT }, (_, i) => (
            <ComboOptionRowSelect
              key={i + 1}
              index={i + 1}
              comboOptions={comboOptions}
              disabled={disabled}
            />
          ))}
        </Flex>

        <Flex direction="column" flex={1} className={`${classes.abilitiesColumn} ${classes.simpleAbilities}`} style={{ display: comboType == ComboType.SIMPLE ? 'flex' : 'none' }} gap={3}>
          {Array.from({ length: ABILITY_LIMIT }, (_, i) => <TurnAbilitySelectorSimple key={i + 1} value={defaultComboTurnAbilities[i + 1]} index={i + 1} />)}
        </Flex>
      </Flex>

      <VerticalDivider width={10} />

      <Flex direction="column" gap={20} flex={1} align='flex-start'>
        <Flex direction="column" w='100%' gap={5}>
          <HeaderText>{t('RowControls.Header') /* Controls */}</HeaderText>
          <Button
            variant='outline'
            size='xs'
            h={24}
            fullWidth
            disabled={disabled}
            onClick={() => modals.openConfirmModal({
              title: tCommon('Confirm'),
              children: t('RowControls.ResetConfirm.Description'),
              labels: { confirm: tCommon('Yes'), cancel: tCommon('Cancel') },
              centered: true,
              onConfirm: () => resetClicked(),
            })}
          >
            {tCommon('Reset')}
          </Button>
          <Flex gap={5}>
            <Button variant='outline' size='xs' h={24} style={{ flex: 1 }} onClick={() => add()} disabled={disabled}>
              {t('RowControls.Add')}
            </Button>
            <Button variant='outline' size='xs' h={24} style={{ flex: 1 }} onClick={() => minus()} disabled={disabled}>
              {t('RowControls.Remove')}
            </Button>
          </Flex>
        </Flex>

        <Flex direction="column" w='100%' gap={5}>
          <HeaderText>{t('RowControls.PresetsHeader') /*Presets*/}</HeaderText>
          <SegmentedControl
            fullWidth
            size='xs'
            disabled={disabled}
            value={String(comboPreprocessor)}
            onChange={(value) => useOptimizerRequestStore.getState().setComboPreprocessor(value === 'true')}
            data={[
              { label: <Flex align='center' justify='center'><IconCheck size={14} /></Flex>, value: 'true' },
              { label: <Flex align='center' justify='center'><IconX size={14} /></Flex>, value: 'false' },
            ]}
          />
        </Flex>

      </Flex>
    </Flex>
  )
}

function ComboOptionRowSelect({ index, disabled }: { index: number; disabled: boolean; comboOptions: { value: string; label: string }[] }) {
  const comboTurnAbilities = useOptimizerRequestStore((s) => s.comboTurnAbilities)
  const shouldRenderSegmented = comboTurnAbilities[index] != null || index < 2

  return shouldRenderSegmented
    ? <TurnAbilitySelector index={index} disabled={disabled} />
    : null
}
