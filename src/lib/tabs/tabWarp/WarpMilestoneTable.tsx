import {
  Badge,
  Flex,
  Table,
} from '@mantine/core'
import chroma from 'chroma-js'
import i18next from 'i18next'
import { Assets } from 'lib/rendering/assets'
import classes from 'lib/tabs/tabWarp/WarpCalculatorTab.module.css'
import {
  type EnrichedWarpRequest,
  type SkinDrawResult,
  type WarpMilestoneResult,
} from 'lib/tabs/tabWarp/warpCalculatorTypes'
import { skinChancePercent } from 'lib/tabs/tabWarp/warpSkinBanners'
import {
  localeNumber_0,
  localeNumberComma,
} from 'lib/utils/i18nUtils'
import { precisionRound } from 'lib/utils/mathUtils'
import type {
  CSSProperties,
  ReactNode,
} from 'react'
import {
  Trans,
  useTranslation,
} from 'react-i18next'

const warpChanceColorScale = chroma.scale(['#df524bcc', '#efe959cc', '#89d86dcc']).domain([0, 0.33, 1])
const chanceThreshold = 0.0005

function translateLabel(label: string) {
  const t = i18next.getFixedT(null, ['warpCalculatorTab', 'common'])

  if (/^S\d$/.test(label)) return t('common:SuperimpositionNShort', { superimposition: label.charAt(1) })
  if (/^E\d$/.test(label)) return t('common:EidolonNShort', { eidolon: label.charAt(1) })
  return t('warpCalculatorTab:TargetLabel', { superimposition: label.charAt(3), eidolon: label.charAt(1) })
}

export function PassIcon({ size = 16 }: { size?: number }) {
  return <img style={{ height: size }} src={Assets.getPass()} />
}

export function WarpTableHeader({ request, goalColStyle }: { request: EnrichedWarpRequest, goalColStyle?: CSSProperties }) {
  const { t } = useTranslation('warpCalculatorTab', { keyPrefix: 'ColumnTitles' })
  return (
    <Table.Thead>
      <Table.Tr>
        <Table.Th style={{ textAlign: 'center', ...goalColStyle }}>{t('Goal') /* Goal */}</Table.Th>
        <Table.Th style={{ textAlign: 'center' }}>
          <Flex justify='center' align='center' gap={4}>
            <Trans
              t={t}
              i18nKey='Chance'
              values={{ ticketCount: localeNumberComma(request.warps) }}
              components={{ 1: <PassIcon /> }}
            />
          </Flex>
        </Table.Th>
        <Table.Th style={{ textAlign: 'center' }}>
          <Flex justify='center' align='center' gap={4}>
            <Trans t={t} i18nKey='Average' components={{ 1: <PassIcon /> }} />
          </Flex>
        </Table.Th>
      </Table.Tr>
    </Table.Thead>
  )
}

export function WarpMilestoneRows({ milestones, rowKeyPrefix }: {
  milestones: Record<string, WarpMilestoneResult>,
  rowKeyPrefix: string,
}) {
  return (
    <>
      {Object.entries(milestones).map(([label, milestone]) => (
        <MilestoneRow
          key={`${rowKeyPrefix}-${label}`}
          label={translateLabel(label)}
          wins={milestone.wins}
          chance={precisionRound(milestone.wins * 100, 1)}
          disabled={milestone.wins < chanceThreshold}
          cost={Math.ceil(milestone.warps)}
          icon={<PassIcon size={14} />}
        />
      ))}
    </>
  )
}

export function SkinDrawRows({ draws, rowKeyPrefix }: {
  draws: Record<string, SkinDrawResult>,
  rowKeyPrefix: string,
}) {
  return (
    <>
      {Object.values(draws).map((draw) => (
        <MilestoneRow
          key={`${rowKeyPrefix}-${draw.draw}`}
          label={`Draw ${draw.draw}`}
          wins={draw.wins}
          chance={skinChancePercent(draw.wins)}
          disabled={draw.unaffordable}
          cost={localeNumberComma(draw.jades)}
          icon={<img style={{ height: 14 }} src={Assets.getJade()} />}
        />
      ))}
    </>
  )
}

function MilestoneRow({ label, wins, chance, disabled, cost, icon }: {
  label: string,
  wins: number,
  chance: number,
  disabled: boolean,
  cost: ReactNode,
  icon: ReactNode,
}) {
  return (
    <Table.Tr className={disabled ? classes.warpRowDisabled : classes.warpRow}>
      <Table.Td className={classes.goalCell}>
        <Flex className={classes.goalBarOverlay} align='center'>
          {!disabled && (
            <div
              className={classes.goalBar}
              style={{ width: `${wins * 100}%`, backgroundColor: warpChanceColorScale(wins).hex() }}
            />
          )}
          <Flex className={classes.goalContent} justify='center' align='center'>
            <Badge color='#000000aa' className={classes.goalBadge} style={{ fontWeight: 'normal', fontSize: 12 }}>
              {label}
            </Badge>
          </Flex>
        </Flex>
      </Table.Td>
      <Table.Td style={{ textAlign: 'center' }}>{localeNumber_0(chance)}%</Table.Td>
      <Table.Td style={{ textAlign: 'center' }}>
        <Flex align='center' justify='center' gap={4}>{cost}{icon}</Flex>
      </Table.Td>
    </Table.Tr>
  )
}
