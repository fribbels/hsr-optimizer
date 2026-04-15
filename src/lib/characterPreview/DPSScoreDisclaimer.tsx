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
import styles from './DPSScoreDisclaimer.module.css'

export function DPSScoreDisclaimer() {
  const showComboDmgWarning = useGlobalStore((s) => s.settings.ShowComboDmgWarning)

  const { t } = useTranslation('relicScorerTab')
  const { t: tSettings } = useTranslation('settings')

  if (showComboDmgWarning !== SettingOptions.ShowComboDmgWarning.Show) return null

  return (
    <div className={styles.wrapper}>
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
    </div>
  )
}
