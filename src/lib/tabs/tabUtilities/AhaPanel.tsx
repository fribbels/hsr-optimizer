import {
  Flex,
  Paper,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { buildSpdPresetOptions } from 'lib/constants/spdPresetConfig'
import { SaveState } from 'lib/state/saveState'
import { useAhaTuningStore } from 'lib/stores/ahaTuningStore'
import {
  calculateAhaSpeed,
  calculateNextTeammateSpeed,
} from 'lib/tabs/tabUtilities/ahaCalculations'
import {
  AhaPanelContent,
} from 'lib/tabs/tabUtilities/AhaPanelContent'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export function AhaPanel() {
  const { t } = useTranslation('modals', { keyPrefix: 'QuickUtils.AHA' })
  const { t: tPresets } = useTranslation('optimizerTab', { keyPrefix: 'Presets' })

  const form = useForm({
    initialValues: useAhaTuningStore.getState(),
    onValuesChange(updated) {
      useAhaTuningStore.setState(updated)
      SaveState.delayedSave()
    },
  })

  const { teammate0, teammate1, teammate2, teammate3, desiredAha } = form.getValues()
  const speeds = [teammate0, teammate1, teammate2, teammate3].filter((x): x is number => x !== '')
  const ahaSpeed = calculateAhaSpeed(speeds)
  const teammateSpeed = typeof speeds[3] === 'number' ? null : calculateNextTeammateSpeed(desiredAha, speeds)
  const spdOptions = useMemo(() => buildSpdPresetOptions(tPresets, { skipNoMinimum: true }), [tPresets])
  const desiredValue = desiredAha === '' ? undefined : desiredAha

  function handleDesiredChange(value: number | undefined) {
    form.setFieldValue('desiredAha', value ?? '')
  }

  return (
    <Flex direction='column' gap={16} style={{ alignSelf: 'center' }}>
      <Paper withBorder p='xl'>
        <form>
          <Flex direction='column' gap={18}>
            <AhaPanelContent
              form={form}
              ahaSpeed={ahaSpeed}
              speeds={speeds}
              teammateSpeed={teammateSpeed}
              desiredValue={desiredValue}
              spdOptions={spdOptions}
              onDesiredChange={handleDesiredChange}
              t={t}
            />
          </Flex>
        </form>
      </Paper>
    </Flex>
  )
}
