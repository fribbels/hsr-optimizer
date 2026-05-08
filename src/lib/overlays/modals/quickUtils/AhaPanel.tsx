import {
  Divider,
  Flex,
  NumberInput,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { Stats } from 'lib/constants/constants'
import type { SharedProps } from 'lib/overlays/modals/quickUtils/common'
import { Assets } from 'lib/rendering/assets'
import { HeaderText } from 'lib/ui/HeaderText'
import { localeNumber_000 } from 'lib/utils/i18nUtils'

interface AhaForm {
  teammate0: number | ''
  teammate1: number | ''
  teammate2: number | ''
  teammate3: number | ''
  desiredAha: number | ''
}

const sharedInputProps: NumberInput.Props = {
  allowNegative: false,
  min: 0,
  leftSection: <img src={Assets.getStatIcon(Stats.SPD)} style={{ height: 24 }} />,
}

export function AhaPanel({ t }: SharedProps) {
  const form = useForm<AhaForm>()
  const { teammate0, teammate1, teammate2, teammate3, desiredAha } = form.getValues()
  const speeds = [teammate0, teammate1, teammate2, teammate3].filter((x) => x !== '')
  const ahaSpeed = calculateAhaSpeed(speeds)
  const teammateSpeed = speeds[3] ? null : calculateNextTeammateSpeed(desiredAha, speeds)
  return (
    <Flex style={{ marginTop: 16, alignSelf: 'center' }}>
      <form>
        <Flex gap={24}>
          <Flex gap={8} direction='column'>
            <HeaderText>Elation teammate speeds</HeaderText>
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
              <HeaderText>Desired Aha Speed</HeaderText>
              <NumberInput
                key={form.key('desiredAha')}
                {...form.getInputProps('desiredAha')}
                {...sharedInputProps}
              />
            </div>
            <div style={{ opacity: teammateSpeed !== null ? undefined : 0.3 }}>
              <HeaderText>{teammateSpeed !== null ? t(`Aha.Teammate${speeds.length as 0 | 1 | 2 | 3}`) : '-'}</HeaderText>
              <span>{teammateSpeed !== null ? localeNumber_000(teammateSpeed) : '-'} :: {teammateSpeed}</span>
            </div>
            <Divider />
            <HeaderText>Aha's speed</HeaderText>
            <span>{localeNumber_000(ahaSpeed)}</span>
          </Flex>
        </Flex>
      </form>
    </Flex>
  )
}

function calculateNextTeammateSpeed(target: number | '', speeds: Array<number>): number | null {
  if (target === '') return null
  speeds.sort((a, b) => b - a)
  if (!speeds.length) return (target - 80) / speedToContributionMultiplier(0)

  for (let pivotIndex = speeds.length - 1; pivotIndex >= 0; pivotIndex--) {
    if (calculateAhaSpeed([...speeds, speeds[pivotIndex]]) >= target) {
      // speed must be lower than the speed at speeds[pivotIndex] but greater than that at speeds[pivotIndex + 1]
      // so the new speeds array must be
      // [speeds[0], ..., speeds[pivotIndex], ?, speeds[pivotIndex + 1], ..., speeds[speeds.length - 1]]
      const contribution = speeds.reduce((acc, cur, idx) => {
        const newIdx = pivotIndex > idx ? idx + 1 : idx
        const contribution = cur * speedToContributionMultiplier(newIdx)
        return acc - contribution
      }, target - 80)
      return contribution / speedToContributionMultiplier(pivotIndex + 1)
    }
  }

  // the new speed must be the highest speed in the team
  const contribution = speeds.reduce((acc, cur, idx) => {
    const newIdx = idx + 1
    const contribution = cur * speedToContributionMultiplier(newIdx)
    return acc - contribution
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
