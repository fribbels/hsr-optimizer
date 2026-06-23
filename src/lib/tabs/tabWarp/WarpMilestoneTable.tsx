import { Badge, Flex, Table } from '@mantine/core'
import i18next from 'i18next'
import { Assets } from 'lib/rendering/assets'
import type { EnrichedWarpRequest, WarpMilestoneResult } from 'lib/tabs/tabWarp/warpCalculatorTypes'
import { localeNumber_0, localeNumberComma } from 'lib/utils/i18nUtils'
import { precisionRound } from 'lib/utils/mathUtils'
import type { CSSProperties } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import chroma from 'chroma-js'
import classes from './WarpCalculatorTab.module.css'

const warpChanceColorScale = chroma.scale(['#df524bcc', '#efe959cc', '#89d86dcc']).domain([0, 0.33, 1])
const chanceThreshold = 0.0005

function translateLabel(label: string) {
  const t = i18next.getFixedT(null, ['warpCalculatorTab', 'common'])
  if (/^S\d$/.test(label)) return t('common:SuperimpositionNShort', { superimposition: label.charAt(1) })
  if (/^E\d$/.test(label)) return t('common:EidolonNShort', { eidolon: label.charAt(1) })
  return t('warpCalculatorTab:TargetLabel', { superimposition: label.charAt(3), eidolon: label.charAt(1) })
}

export type WarpMilestoneRowData = { label: string, warps: number, wins: number }

export function toMilestoneRows(milestoneResults: Record<string, WarpMilestoneResult> | undefined): WarpMilestoneRowData[] {
  return Object.entries(milestoneResults ?? {}).map(([label, result]) => ({ label, warps: result.warps, wins: result.wins }))
}

export function PassIcon({ size = 16 }: { size?: number }) {
  return <img style={{ height: size }} src={Assets.getPass()}/>
}

export function WarpTableHeader({ request, goalColStyle }: { request: EnrichedWarpRequest, goalColStyle?: CSSProperties }) {
  const { t } = useTranslation('warpCalculatorTab', { keyPrefix: 'ColumnTitles' })
  return (
    <Table.Thead>
      <Table.Tr>
        <Table.Th style={{ textAlign: 'center', ...goalColStyle }}>{t('Goal')/* Goal */}</Table.Th>
        <Table.Th style={{ textAlign: 'center' }}>
          <Flex justify='center' align='center' gap={4}>
            <Trans
              t={t}
              i18nKey='Chance'
              values={{ ticketCount: localeNumberComma(request.warps) }}
              components={{ 1: <PassIcon/> }}
            />
          </Flex>
        </Table.Th>
        <Table.Th style={{ textAlign: 'center' }}>
          <Flex justify='center' align='center' gap={4}>
            <Trans t={t} i18nKey='Average' components={{ 1: <PassIcon/> }}/>
          </Flex>
        </Table.Th>
      </Table.Tr>
    </Table.Thead>
  )
}

export function WarpMilestoneRows({ milestones, rowKeyPrefix }: { milestones: WarpMilestoneRowData[], rowKeyPrefix?: string }) {
  return (
    <>
      {milestones.map((milestone) => (
        <Table.Tr
          key={rowKeyPrefix ? `${rowKeyPrefix}-${milestone.label}` : milestone.label}
          className={milestone.wins < chanceThreshold ? classes.warpRowDisabled : classes.warpRow}
        >
          <Table.Td className={classes.goalCell}>
            <Flex className={classes.goalBarOverlay} align='center'>
              {milestone.wins >= chanceThreshold && (
                <div
                  className={classes.goalBar}
                  style={{
                    width: `${milestone.wins * 100}%`,
                    backgroundColor: warpChanceColorScale(milestone.wins).hex(),
                  }}
                />
              )}
              <Flex className={classes.goalContent} justify='center' align='center'>
                <Badge color='#000000aa' className={classes.goalBadge} style={{ fontWeight: 'normal', fontSize: 12 }}>
                  {translateLabel(milestone.label)}
                </Badge>
              </Flex>
            </Flex>
          </Table.Td>
          <Table.Td style={{ textAlign: 'center' }}>
            {`${localeNumber_0(precisionRound(milestone.wins * 100, 1))}%`}
          </Table.Td>
          <Table.Td style={{ textAlign: 'center' }}>
            <Flex align='center' justify='center' gap={4}>
              {Math.ceil(milestone.warps)}
              <PassIcon size={14}/>
            </Flex>
          </Table.Td>
        </Table.Tr>
      ))}
    </>
  )
}
