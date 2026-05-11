import {
  Divider,
  Flex,
  NumberInput,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { Stats } from 'lib/constants/constants'
import { Assets } from 'lib/rendering/assets'
import { SaveState } from 'lib/state/saveState'
import { useAhaTuningStore } from 'lib/stores/ahaTuningStore'
import { HeaderText } from 'lib/ui/HeaderText'
import { localeNumber_000 } from 'lib/utils/i18nUtils'
import { type CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'

const textColours = {
  normal: undefined,
  low: 'orange',
  negative: 'red',
} as const satisfies Record<string, CSSProperties['color']>

const sharedInputProps: NumberInput.Props = {
  allowNegative: false,
  min: 0,
  leftSection: <img src={Assets.getStatIcon(Stats.SPD)} style={{ height: 24 }} />,
  stepHoldDelay: 300,
  stepHoldInterval: 50,
}

export function AhaPanel() {
  const { t } = useTranslation('modals', { keyPrefix: 'QuickUtils.AHA' })
  const form = useForm({
    initialValues: useAhaTuningStore.getState(),
    onValuesChange(updated) {
      useAhaTuningStore.setState(updated)
      SaveState.delayedSave()
    },
  })
  const { teammate0, teammate1, teammate2, teammate3, desiredAha } = form.getValues()
  const speeds = [teammate0, teammate1, teammate2, teammate3].filter((x) => x !== '')
  const ahaSpeed = calculateAhaSpeed(speeds)
  const teammateSpeed = typeof speeds[3] === 'number' ? null : calculateNextTeammateSpeed(desiredAha, speeds)
  const teammateSpeedColour = teammateSpeed == null
    ? textColours.normal
    : (teammateSpeed < 0
        ? textColours.negative
        : (teammateSpeed < 90
            ? textColours.low
            : textColours.normal))
  return (
    <Flex style={{ marginTop: 16, alignSelf: 'center' }} direction='column' gap={16}>
      <form>
        <Flex gap={24}>
          <Flex gap={8} direction='column'>
            <HeaderText>{t('Input.TeammateSpeeds')}</HeaderText>
            <NumberInput
              key={form.key('teammate0')}
              {...form.getInputProps('teammate0')}
              {...sharedInputProps}
            />
            <NumberInput
              key={form.key('teammate1')}
              {...form.getInputProps('teammate1')}
              {...sharedInputProps}
            />
            <NumberInput
              key={form.key('teammate2')}
              {...form.getInputProps('teammate2')}
              {...sharedInputProps}
            />
            <NumberInput
              key={form.key('teammate3')}
              {...form.getInputProps('teammate3')}
              {...sharedInputProps}
            />
          </Flex>
          <Divider orientation='vertical' />
          <Flex gap={8} direction='column'>
            <div>
              <HeaderText>{t('Input.DesiredAha')}</HeaderText>
              <NumberInput
                key={form.key('desiredAha')}
                {...form.getInputProps('desiredAha')}
                {...sharedInputProps}
              />
            </div>
            <div style={{ opacity: teammateSpeed !== null ? undefined : 0.3 }}>
              <HeaderText>{teammateSpeed !== null ? t(`Output.Teammate${speeds.length as 0 | 1 | 2 | 3}`) : '-'}</HeaderText>
              <span style={{ color: teammateSpeedColour }}>
                {teammateSpeed !== null ? localeNumber_000(teammateSpeed) : '-'}
              </span>
            </div>
            <Divider />
            <HeaderText>{t('Output.AhaSpeed')}</HeaderText>
            <span>{localeNumber_000(ahaSpeed)}</span>
          </Flex>
        </Flex>
      </form>
      <AhaEquation />
    </Flex>
  )
}

function AhaEquation() {
  return (
    <Flex align='center' justify='center' gap={4} style={{ fontSize: '1.1em' }}>
      <Fraction numerator='Aha' denominator='Speed' />
      <span>=</span>
      <Fraction numerator={<>v<sub>1</sub></>} denominator='5' />
      <span>+</span>
      <Fraction numerator={<>v<sub>2</sub></>} denominator='10' />
      <span>+</span>
      <Fraction numerator={<>v<sub>3</sub></>} denominator='20' />
      <span>+</span>
      <Fraction numerator={<>v<sub>4</sub></>} denominator='40' />
      <span>+ 80</span>
    </Flex>
  )
}

function Fraction({ numerator, denominator }: { numerator: React.ReactNode; denominator: React.ReactNode }) {
  return (
    <Flex direction='column' align='center' style={{ lineHeight: 1.2 }}>
      <span>{numerator}</span>
      <hr style={{ width: '100%', margin: 0, border: 'none', borderTop: '1px solid currentColor' }} />
      <span>{denominator}</span>
    </Flex>
  )
}

function calculateNextTeammateSpeed(target: number | '', speeds: Array<number>): number | null {
  if (target === '') return null
  if (!speeds.length) return (target - 80) / speedToContributionMultiplier(0)
  speeds.sort((a, b) => b - a)

  for (let pivotIndex = speeds.length - 1; pivotIndex >= 0; pivotIndex--) {
    if (calculateAhaSpeed([...speeds, speeds[pivotIndex]]) >= target) {
      const contribution = speeds.reduce((acc, cur, idx) => {
        const newIdx = idx > pivotIndex ? idx + 1 : idx
        return acc - cur * speedToContributionMultiplier(newIdx)
      }, target - 80)
      return contribution / speedToContributionMultiplier(pivotIndex + 1)
    }
  }

  const contribution = speeds.reduce((acc, cur, idx) => {
    return acc - cur * speedToContributionMultiplier(idx + 1)
  }, target - 80)
  return contribution / speedToContributionMultiplier(0)
}

function calculateAhaSpeed(speeds: Array<number>) {
  speeds.sort((a, b) => b - a)
  return speeds.reduce((acc, cur, idx) => acc + cur * speedToContributionMultiplier(idx), 80)
}

function speedToContributionMultiplier(rank: number) {
  return 1 / (5 * Math.pow(2, Math.min(rank, 3)))
}
