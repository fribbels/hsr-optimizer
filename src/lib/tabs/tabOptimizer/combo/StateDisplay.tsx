import { Divider, Flex } from '@mantine/core'
import { ComboConditionalsGroupRow } from 'lib/tabs/tabOptimizer/combo/ComboConditionalsGroupRow'
import { ComboHeader } from 'lib/tabs/tabOptimizer/combo/ComboHeader'
import { SetDisplays } from 'lib/tabs/tabOptimizer/combo/SetDisplays'
import { SetSelectors } from 'lib/tabs/tabOptimizer/combo/SetSelectors'
import { useComboDrawerStore } from 'lib/tabs/tabOptimizer/combo/useComboDrawerStore'
import { useTranslation } from 'react-i18next'

function GroupDivider({ text }: { text: string }) {
  return <Divider label={text} labelPosition='center' />
}

export function StateDisplay() {
  const comboCharacter = useComboDrawerStore((s) => s.comboCharacter)
  const comboTeammate0 = useComboDrawerStore((s) => s.comboTeammate0)
  const comboTeammate1 = useComboDrawerStore((s) => s.comboTeammate1)
  const comboTeammate2 = useComboDrawerStore((s) => s.comboTeammate2)
  const actionCount = useComboDrawerStore((s) => s.comboTurnAbilities.length)
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
        <ComboHeader />
      </Flex>

      <ComboConditionalsGroupRow comboOrigin={comboCharacter} actionCount={actionCount} conditionalType='character' originKey='comboCharacter' />
      <ComboConditionalsGroupRow comboOrigin={comboCharacter} actionCount={actionCount} conditionalType='lightCone' originKey='comboCharacterLightCone' />

      <GroupDivider text={t('GroupHeaders.Sets')} />
      <SetSelectors comboOrigin={comboCharacter} />
      <SetDisplays comboOrigin={comboCharacter} actionCount={actionCount} originKey='comboCharacterRelicSets' />

      <GroupDivider text={t('GroupHeaders.Teammate1')} />
      <ComboConditionalsGroupRow comboOrigin={comboTeammate0} actionCount={actionCount} conditionalType='character' originKey='comboTeammate0' />
      <ComboConditionalsGroupRow comboOrigin={comboTeammate0} actionCount={actionCount} conditionalType='lightCone' originKey='comboTeammate0LightCone' />
      <ComboConditionalsGroupRow comboOrigin={comboTeammate0} actionCount={actionCount} conditionalType='relicSet' originKey='comboTeammate0RelicSet' />
      <ComboConditionalsGroupRow comboOrigin={comboTeammate0} actionCount={actionCount} conditionalType='ornamentSet' originKey='comboTeammate0OrnamentSet' />

      <GroupDivider text={t('GroupHeaders.Teammate2')} />
      <ComboConditionalsGroupRow comboOrigin={comboTeammate1} actionCount={actionCount} conditionalType='character' originKey='comboTeammate1' />
      <ComboConditionalsGroupRow comboOrigin={comboTeammate1} actionCount={actionCount} conditionalType='lightCone' originKey='comboTeammate1LightCone' />
      <ComboConditionalsGroupRow comboOrigin={comboTeammate1} actionCount={actionCount} conditionalType='relicSet' originKey='comboTeammate1RelicSet' />
      <ComboConditionalsGroupRow comboOrigin={comboTeammate1} actionCount={actionCount} conditionalType='ornamentSet' originKey='comboTeammate1OrnamentSet' />

      <GroupDivider text={t('GroupHeaders.Teammate3')} />
      <ComboConditionalsGroupRow comboOrigin={comboTeammate2} actionCount={actionCount} conditionalType='character' originKey='comboTeammate2' />
      <ComboConditionalsGroupRow comboOrigin={comboTeammate2} actionCount={actionCount} conditionalType='lightCone' originKey='comboTeammate2LightCone' />
      <ComboConditionalsGroupRow comboOrigin={comboTeammate2} actionCount={actionCount} conditionalType='relicSet' originKey='comboTeammate2RelicSet' />
      <ComboConditionalsGroupRow comboOrigin={comboTeammate2} actionCount={actionCount} conditionalType='ornamentSet' originKey='comboTeammate2OrnamentSet' />
    </Flex>
  )
}
