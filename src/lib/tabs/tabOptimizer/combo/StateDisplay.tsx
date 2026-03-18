import { Divider, Flex } from '@mantine/core'
import { ComboConditionalsGroupRow } from 'lib/tabs/tabOptimizer/combo/ComboConditionalsGroupRow'
import { ComboHeader } from 'lib/tabs/tabOptimizer/combo/ComboHeader'
import { SetDisplays } from 'lib/tabs/tabOptimizer/combo/SetDisplays'
import { SetSelectors } from 'lib/tabs/tabOptimizer/combo/SetSelectors'
import type { ComboState } from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import { useTranslation } from 'react-i18next'

function GroupDivider({ text }: { text: string }) {
  return (
    <Divider label={text} labelPosition='center' />
  )
}

export function StateDisplay({ comboState, onComboStateChange }: {
  comboState: ComboState
  onComboStateChange: (newState: ComboState) => void
}) {
  const comboCharacter = comboState?.comboCharacter
  const comboTeammate0 = comboState?.comboTeammate0
  const comboTeammate1 = comboState?.comboTeammate1
  const comboTeammate2 = comboState?.comboTeammate2
  const actionCount = comboState?.comboTurnAbilities?.length || 0
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'ComboDrawer' })

  return (
    <Flex direction="column" gap={8}>
      <Flex
        style={{
          position: 'sticky',
          backgroundColor: 'var(--mantine-color-dark-5)',
          top: 0,
          zIndex: 10,
          paddingTop: 6,
          paddingBottom: 6,
        }}
        align='center'
      >
        <ComboHeader comboState={comboState} onComboStateChange={onComboStateChange} />
      </Flex>

      <ComboConditionalsGroupRow
        comboOrigin={comboCharacter}
        actionCount={actionCount}
        conditionalType='character'
        originKey='comboCharacter'
        comboState={comboState}
        onComboStateChange={onComboStateChange}
      />
      <ComboConditionalsGroupRow
        comboOrigin={comboCharacter}
        actionCount={actionCount}
        conditionalType='lightCone'
        originKey='comboCharacterLightCone'
        comboState={comboState}
        onComboStateChange={onComboStateChange}
      />
      <GroupDivider text={t('GroupHeaders.Sets') /* 'Relic / Ornament set conditionals' */} />
      <SetSelectors comboOrigin={comboCharacter} comboState={comboState} onComboStateChange={onComboStateChange} />
      <SetDisplays
        comboOrigin={comboCharacter}
        actionCount={actionCount}
        originKey='comboCharacterRelicSets'
        comboState={comboState}
        onComboStateChange={onComboStateChange}
      />
      <GroupDivider text={t('GroupHeaders.Teammate1') /* 'Teammate 1 conditionals' */} />
      <ComboConditionalsGroupRow
        comboOrigin={comboTeammate0}
        actionCount={actionCount}
        conditionalType='character'
        originKey='comboTeammate0'
        comboState={comboState}
        onComboStateChange={onComboStateChange}
      />
      <ComboConditionalsGroupRow
        comboOrigin={comboTeammate0}
        actionCount={actionCount}
        conditionalType='lightCone'
        originKey='comboTeammate0LightCone'
        comboState={comboState}
        onComboStateChange={onComboStateChange}
      />
      <ComboConditionalsGroupRow
        comboOrigin={comboTeammate0}
        actionCount={actionCount}
        conditionalType='lightCone'
        originKey='comboTeammate0RelicSet'
        comboState={comboState}
        onComboStateChange={onComboStateChange}
      />
      <ComboConditionalsGroupRow
        comboOrigin={comboTeammate0}
        actionCount={actionCount}
        conditionalType='lightCone'
        originKey='comboTeammate0OrnamentSet'
        comboState={comboState}
        onComboStateChange={onComboStateChange}
      />
      <GroupDivider text={t('GroupHeaders.Teammate2') /* 'Teammate 2 conditionals' */} />
      <ComboConditionalsGroupRow
        comboOrigin={comboTeammate1}
        actionCount={actionCount}
        conditionalType='character'
        originKey='comboTeammate1'
        comboState={comboState}
        onComboStateChange={onComboStateChange}
      />
      <ComboConditionalsGroupRow
        comboOrigin={comboTeammate1}
        actionCount={actionCount}
        conditionalType='lightCone'
        originKey='comboTeammate1LightCone'
        comboState={comboState}
        onComboStateChange={onComboStateChange}
      />
      <ComboConditionalsGroupRow
        comboOrigin={comboTeammate1}
        actionCount={actionCount}
        conditionalType='lightCone'
        originKey='comboTeammate1RelicSet'
        comboState={comboState}
        onComboStateChange={onComboStateChange}
      />
      <ComboConditionalsGroupRow
        comboOrigin={comboTeammate1}
        actionCount={actionCount}
        conditionalType='lightCone'
        originKey='comboTeammate1OrnamentSet'
        comboState={comboState}
        onComboStateChange={onComboStateChange}
      />
      <GroupDivider text={t('GroupHeaders.Teammate3') /* 'Teammate 3 conditionals' */} />
      <ComboConditionalsGroupRow
        comboOrigin={comboTeammate2}
        actionCount={actionCount}
        conditionalType='character'
        originKey='comboTeammate2'
        comboState={comboState}
        onComboStateChange={onComboStateChange}
      />
      <ComboConditionalsGroupRow
        comboOrigin={comboTeammate2}
        actionCount={actionCount}
        conditionalType='lightCone'
        originKey='comboTeammate2LightCone'
        comboState={comboState}
        onComboStateChange={onComboStateChange}
      />
      <ComboConditionalsGroupRow
        comboOrigin={comboTeammate2}
        actionCount={actionCount}
        conditionalType='lightCone'
        originKey='comboTeammate2RelicSet'
        comboState={comboState}
        onComboStateChange={onComboStateChange}
      />
      <ComboConditionalsGroupRow
        comboOrigin={comboTeammate2}
        actionCount={actionCount}
        conditionalType='lightCone'
        originKey='comboTeammate2OrnamentSet'
        comboState={comboState}
        onComboStateChange={onComboStateChange}
      />
    </Flex>
  )
}
