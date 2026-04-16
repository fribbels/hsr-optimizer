<<<<<<< Updated upstream
import {
  Accordion,
  Button,
} from '@mantine/core'
import { IconEyeOff } from '@tabler/icons-react'
import { SettingOptions } from 'lib/constants/settingsConstants'
import { SaveState } from 'lib/state/saveState'
import { useGlobalStore } from 'lib/stores/app/appStore'
import {
  Trans,
  useTranslation,
} from 'react-i18next'
=======
import { IconAlertTriangle } from '@tabler/icons-react'
import { Button, Flex, Text } from '@mantine/core'
import { modals } from '@mantine/modals'
import { SettingOptions } from 'lib/overlays/drawers/SettingsDrawer'
import { SaveState } from 'lib/state/saveState'
import { useGlobalStore } from 'lib/stores/app/appStore'
>>>>>>> Stashed changes
import styles from './DPSScoreDisclaimer.module.css'

function handleDismiss() {
  useGlobalStore.getState().setSettings({
    ...useGlobalStore.getState().settings,
    ShowComboDmgWarning: SettingOptions.ShowComboDmgWarning.Hide,
  })
  SaveState.delayedSave()
}

function openConfirmModal() {
  modals.openConfirmModal({
    title: (
      <Text fw={600} size="lg" style={{ color: '#f87171' }}>Acknowledge and hide warning</Text>
    ),
    children: (
      <Text size="md" style={{ padding: '8px 0' }}>
        I will not compare Combo DMG or DPS Score against different teams, light cones, eidolons, or versions.
      </Text>
    ),
    labels: { confirm: 'Confirm', cancel: 'Cancel' },
    centered: true,
    cancelProps: { variant: 'subtle' },
    styles: {
      content: { backgroundColor: '#2a1215', borderLeft: '4px solid #ef4444' },
      header: { backgroundColor: 'transparent' },
      body: { backgroundColor: 'transparent' },
    },
    onConfirm: handleDismiss,
  })
}

export function DPSScoreDisclaimer() {
  const showComboDmgWarning = useGlobalStore((s) => s.settings.ShowComboDmgWarning)

  if (showComboDmgWarning !== SettingOptions.ShowComboDmgWarning.Show) return null

  return (
    <div className={styles.wrapper}>
<<<<<<< Updated upstream
      <Accordion className={styles.accordion} styles={{ control: { backgroundColor: '#8a1717' }, content: { backgroundColor: 'var(--layer-1)' } }}>
        <Accordion.Item value='1'>
          <Accordion.Control>
            <div className={styles.disclaimerText}>
              <Trans t={t} i18nKey='Disclaimer'>
                Note: Combo DMG is meant to compare different relics relative to the selected team, and should <u>NOT</u>{' '}
                be used to compare different teams / LCs / eidolons!
              </Trans>
            </div>
          </Accordion.Control>
          <Accordion.Panel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }} className={styles.disclaimerPanel}>
              <Trans t={t} i18nKey='DisclaimerDescription'>
                Combo DMG is a tool to measure the damage of a single ability rotation within the context of a specific team.

                Changing the team / eidolons / light cones will change the duration of the rotation, how much energy is generated, uptime of buffs, etc.

                This means Combo DMG can NOT be used to determine which team is better, or which light cone is better, or measure the damage increase between
                eidolons. Combo DMG is only meant to compare different relics within a defined team and speed target.
              </Trans>

              <Button
                fullWidth
                leftSection={<IconEyeOff size={16} />}
                onClick={() => {
                  useGlobalStore.getState().setSettings({
                    ...useGlobalStore.getState().settings,
                    ShowComboDmgWarning: SettingOptions.ShowComboDmgWarning.Hide,
                  })
                  SaveState.delayedSave()
                }}
              >
                {tSettings('ShowComboDmgWarning.Hide')}
              </Button>
            </div>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
=======
      <div className={styles.header}>
        <IconAlertTriangle size={20} color="#ef4444" />
        <Text fw={600} size="md" style={{ color: '#f0d0d0' }}>
          Do NOT use Combo DMG or DPS Score to compare teams, light cones, or eidolons!
        </Text>
      </div>

      <div className={styles.content}>
        <ul className={styles.bulletList}>
          <li>
            <Text size="md">
              Combo DMG and DPS Score measure how much damage your build deals in a fixed ability rotation, specific to your current team setup.
            </Text>
          </li>
          <li>
            <Text size="md">
              Different teams, light cones, eidolons, or beta versions can all affect the rotation, and the resulting scores
              cannot be meaningfully compared against each other.
            </Text>
          </li>
          <li>
            <Text size="md">
              Within your current team setup, use Combo DMG to see how different relics, main stats, and set effects impact your rotation damage.
              DPS Score compares your Combo DMG against simulated benchmark builds with optimally distributed substats at the same speed,
              showing how close your relics are to the best possible build for your team.
            </Text>
          </li>
          <li>
            <Text size="md">
              Benchmarks are generated to match your character's combat speed. Builds at different speed targets are scored against fundamentally
              different benchmarks, so their scores should not be compared. This is why when comparing two builds at different speeds, you might see
              the slower one have higher Combo DMG, but the faster one have a higher DPS Score, because the benchmark redistributes substats to match
              each speed target. The fixed rotation does not model changes in action advance, energy regen, or other differences between team
              compositions. Each character is measured with their own unique rotation and rotation length.
            </Text>
          </li>
        </ul>

        <Button
          size="sm"
          fullWidth
          onClick={openConfirmModal}
        >
          Understood, hide warning
        </Button>
      </div>
>>>>>>> Stashed changes
    </div>
  )
}
