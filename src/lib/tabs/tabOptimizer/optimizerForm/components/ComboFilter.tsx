import {
  IconCheck,
  IconSettings,
  IconX,
} from '@tabler/icons-react'
import { Button, Flex, SegmentedControl } from '@mantine/core'
import { PopConfirm } from 'lib/ui/PopConfirm'
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
import DB from 'lib/state/db'
import { useOptimizerFormStore } from 'lib/stores/optimizerForm/useOptimizerFormStore'
import { useOptimizerUIStore } from 'lib/stores/optimizerUI/useOptimizerUIStore'
import { ComboDrawer } from 'lib/tabs/tabOptimizer/combo/ComboDrawer'
import InputNumberStyled from 'lib/tabs/tabOptimizer/optimizerForm/components/InputNumberStyled'
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
import { CharacterConditionalsController } from 'types/conditionals'


export const ComboFilters = () => {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ComboFilter' })
  const comboType = useOptimizerFormStore((s) => s.comboType)
  const characterId = useOptimizerFormStore((s) => s.characterId)
  const characterEidolon = useOptimizerFormStore((s) => s.characterEidolon)
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
        size='xs'
        fullWidth
        value={comboType}
        onChange={(value) => useOptimizerFormStore.getState().setComboType(value as ComboType)}
        data={[
          { label: t('ModeSelector.Simple'), value: ComboType.SIMPLE },
          { label: t('ModeSelector.Advanced'), value: ComboType.ADVANCED },
        ]}
      />

      <ComboBasicDefinition comboOptions={comboOptions} />

      <>
        <Flex direction="column" gap={8} style={{ marginTop: 8 }}>
          <Button
            variant="default"
            onClick={() => setOpen(OpenCloseIDs.COMBO_DRAWER)}
            leftSection={<IconSettings size={16} />}
            disabled={comboType == ComboType.SIMPLE}
          >
            {t('RotationButton')}
          </Button>
        </Flex>
        <ComboDrawer />
      </>
    </Flex>
  )
}

function add() {
  const store = useOptimizerFormStore.getState()
  const abilities = [...store.comboTurnAbilities]

  for (let i = 1; i <= ABILITY_LIMIT + 2; i++) {
    if (abilities[i] == null) {
      abilities[i] = DEFAULT_BASIC
      break
    }
  }

  useOptimizerFormStore.getState().setComboTurnAbilities(abilities)
}

function minus() {
  const store = useOptimizerFormStore.getState()
  const abilities = [...store.comboTurnAbilities]

  for (let i = ABILITY_LIMIT + 2; i > 1; i--) {
    if (abilities[i] != null) {
      abilities.length = i
      break
    }
  }

  useOptimizerFormStore.getState().setComboTurnAbilities(abilities)
}

function resetClicked() {
  const characterId = useOptimizerUIStore.getState().focusCharacterId!
  const characterMetadata = DB.getMetadata().characters[characterId]

  if (!characterMetadata) return

  const defaultComboTurnAbilities = characterMetadata.scoringMetadata?.simulation?.comboTurnAbilities ?? [NULL_TURN_ABILITY_NAME, WHOLE_BASIC]
  const defaultComboDot = characterMetadata.scoringMetadata?.simulation?.comboDot ?? 0

  useOptimizerFormStore.getState().setComboTurnAbilities(defaultComboTurnAbilities)
  useOptimizerFormStore.getState().setComboDot(defaultComboDot)
  useOptimizerFormStore.getState().setComboStateJson('{}')
}

function ComboBasicDefinition(props: { comboOptions: { value: string; label: string }[] }) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ComboFilter' })
  const { t: tCommon } = useTranslation('common')
  const comboType = useOptimizerFormStore((s) => s.comboType)
  const characterId = useOptimizerFormStore((s) => s.characterId)
  const characterEidolon = useOptimizerFormStore((s) => s.characterEidolon)
  const comboPreprocessor = useOptimizerFormStore((s) => s.comboPreprocessor)
  const comboDot = useOptimizerFormStore((s) => s.comboDot)
  const comboTurnAbilities = useOptimizerFormStore((s) => s.comboTurnAbilities)

  const {
    comboTurnAbilities: defaultComboTurnAbilities,
    comboDot: defaultComboDot,
  } = getDefaultComboTurnAbilities(characterId!, characterEidolon)

  const disabled = comboType == ComboType.SIMPLE

  return (
    <Flex style={{ height: 275 }}>
      <Flex direction="column" flex={1} style={{ marginLeft: 2 }} gap={3}>
        <HeaderText>{t('AbilityLabel') /* Abilities */}</HeaderText>

        <Flex direction="column" flex={1} style={{ marginLeft: 2, display: comboType == ComboType.ADVANCED ? 'flex' : 'none' }} gap={3}>
          {Array.from({ length: ABILITY_LIMIT }, (_, i) => (
            <ComboOptionRowSelect
              key={i + 1}
              index={i + 1}
              comboOptions={props.comboOptions}
              disabled={disabled}
            />
          ))}
        </Flex>

        <Flex direction="column" flex={1} style={{ marginLeft: 2, display: comboType == ComboType.SIMPLE ? 'flex' : 'none' }} gap={3}>
          {Array.from({ length: ABILITY_LIMIT }, (_, i) => <TurnAbilitySelectorSimple key={i + 1} value={defaultComboTurnAbilities[i + 1]} index={i + 1} />)}
        </Flex>
      </Flex>

      <VerticalDivider width={10} />

      <Flex direction="column" gap={20} flex={1} align='flex-start'>
        <Flex direction="column" style={{ width: '100%' }} gap={5}>
          <HeaderText>{t('RowControls.Header') /* Controls */}</HeaderText>
          <PopConfirm
            title={tCommon('Confirm')}
            description={t('RowControls.ResetConfirm.Description')}
            onConfirm={() => resetClicked()}
            okText={tCommon('Yes')}
            cancelText={tCommon('Cancel')}
            placement='bottomRight'
          >
            <Button size='xs' variant='outline' disabled={disabled}>
              {tCommon('Reset')}
            </Button>
          </PopConfirm>
          <Flex gap={5}>
            <Button size='xs' variant='outline' style={{ flex: 1 }} onClick={() => add()} disabled={disabled}>
              {t('RowControls.Add')}
            </Button>
            <Button size='xs' variant='outline' style={{ flex: 1 }} onClick={() => minus()} disabled={disabled}>
              {t('RowControls.Remove')}
            </Button>
          </Flex>
        </Flex>

        <Flex direction="column" style={{ width: '100%' }} gap={5}>
          <HeaderText>{t('RowControls.PresetsHeader') /*Presets*/}</HeaderText>
          <SegmentedControl
            size='xs'
            fullWidth
            disabled={disabled}
            value={String(comboPreprocessor)}
            onChange={(value) => useOptimizerFormStore.getState().setComboPreprocessor(value === 'true')}
            data={[
              { label: <IconCheck />, value: 'true' },
              { label: <IconX />, value: 'false' },
            ]}
          />
        </Flex>

        <Flex direction="column" gap={5}>
          <HeaderText>{t('CounterLabels.Dot')}</HeaderText>
          <NumberXInput disabled={disabled} defaultValue={defaultComboDot} value={comboDot} />
        </Flex>
      </Flex>
    </Flex>
  )
}

function ComboOptionRowSelect(props: { index: number; disabled: boolean; comboOptions: { value: string; label: string }[] }) {
  const comboTurnAbilities = useOptimizerFormStore((s) => s.comboTurnAbilities)
  const shouldRenderSegmented = comboTurnAbilities[props.index] != null || props.index < 2

  return shouldRenderSegmented
    ? <TurnAbilitySelector index={props.index} disabled={props.disabled} />
    : null
}

function NumberXInput(props: {
  disabled: boolean;
  defaultValue?: number;
  value: number;
}) {
  return (
    <InputNumberStyled
      leftSection='⨯'
      size='xs'
      disabled={props.disabled}
      value={props.disabled ? props.defaultValue : props.value}
      onChange={(val) => {
        if (!props.disabled && val != null) {
          useOptimizerFormStore.getState().setComboDot(val as number)
        }
      }}
      style={{ width: '100%' }}
      className='comboInputNumber'
    />
  )
}
