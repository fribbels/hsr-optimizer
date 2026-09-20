import {
  ActionIcon,
  Button,
  Divider,
  Menu,
  Tooltip,
} from '@mantine/core'
import {
  IconCamera,
  IconChevronDown,
  IconDownload,
  IconTrash,
} from '@tabler/icons-react'
import { ActionsForm } from 'lib/tabs/tabTeamShowcase/layouts/trialStyles'
import type { TeamShowcaseState } from 'lib/tabs/tabTeamShowcase/useTeamShowcase'
import { useTranslation } from 'react-i18next'

/** Matches the Characters panel's menu button and filter bar, which are all 40px tall with a 4px radius */
const HEADER_BUTTON_STYLE = { height: 40, boxShadow: 'unset', borderRadius: 4 }
const HEADER_ICON_BUTTON_SIZE = 40
const ICON_SIZE = 16
const COMPACT_ICON_SIZE = 14

/**
 * The screenshot and clear actions in one of several forms, for the actions trial axis. Placement is the
 * shell's business; this only decides what the buttons look like. `includeClear` is false when Clear has
 * moved into the saved-teams dock.
 */
export function ShowcaseActions({ state, form, includeClear, dense = false }: {
  state: TeamShowcaseState,
  form: ActionsForm,
  includeClear: boolean,
  /** Smaller controls for toolbar strips inside the grid column */
  dense?: boolean,
}) {
  const { t } = useTranslation('teamShowcaseTab')
  const {
    clearTeam,
    hasTeam,
    screenshot,
    screenshotLoading,
  } = state

  const buttonStyle = dense ? undefined : HEADER_BUTTON_STYLE
  const buttonSize = dense ? 'sm' : undefined
  const iconButtonSize = dense ? 'input-sm' : HEADER_ICON_BUTTON_SIZE

  const clearLabel = t('Buttons.Clear')
  const downloadLabel = t('Buttons.DownloadScreenshot')
  const copyLabel = t('Buttons.CopyScreenshot')

  const clearIcon = includeClear && (
    <Tooltip label={clearLabel}>
      <ActionIcon variant='default' size={iconButtonSize} aria-label={clearLabel} disabled={!hasTeam} onClick={clearTeam}>
        <IconTrash size={ICON_SIZE} />
      </ActionIcon>
    </Tooltip>
  )

  switch (form) {
    case ActionsForm.ICON_CLEAR:
      return (
        <>
          {clearIcon}
          {includeClear && <Divider orientation='vertical' />}
          <Button
            style={buttonStyle}
            size={buttonSize}
            variant='default'
            leftSection={<IconDownload size={ICON_SIZE} />}
            loading={screenshotLoading}
            disabled={!hasTeam}
            onClick={() => screenshot('download')}
          >
            {downloadLabel}
          </Button>
          <Button
            style={buttonStyle}
            size={buttonSize}
            leftSection={<IconCamera size={ICON_SIZE} />}
            loading={screenshotLoading}
            disabled={!hasTeam}
            onClick={() => screenshot('clipboard')}
          >
            {copyLabel}
          </Button>
        </>
      )

    case ActionsForm.SPLIT:
      return (
        <>
          {clearIcon}
          <Menu position='bottom-end' width={200}>
            <Menu.Target>
              <Button
                style={buttonStyle}
                size={buttonSize}
                leftSection={<IconCamera size={ICON_SIZE} />}
                rightSection={<IconChevronDown size={ICON_SIZE} />}
                loading={screenshotLoading}
                disabled={!hasTeam}
              >
                {/* TODO(i18n): split screenshot button */}
                Screenshot
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<IconCamera size={ICON_SIZE} />} onClick={() => screenshot('clipboard')}>
                {copyLabel}
              </Menu.Item>
              <Menu.Item leftSection={<IconDownload size={ICON_SIZE} />} onClick={() => screenshot('download')}>
                {downloadLabel}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </>
      )

    case ActionsForm.ICONS:
      return (
        <>
          {clearIcon}
          <Tooltip label={downloadLabel}>
            <ActionIcon
              variant='default'
              size={iconButtonSize}
              aria-label={downloadLabel}
              loading={screenshotLoading}
              disabled={!hasTeam}
              onClick={() => screenshot('download')}
            >
              <IconDownload size={ICON_SIZE} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label={copyLabel}>
            <ActionIcon
              size={iconButtonSize}
              aria-label={copyLabel}
              loading={screenshotLoading}
              disabled={!hasTeam}
              onClick={() => screenshot('clipboard')}
            >
              <IconCamera size={ICON_SIZE} />
            </ActionIcon>
          </Tooltip>
        </>
      )

    case ActionsForm.GROUPED:
      return (
        <Button.Group>
          {includeClear && (
            <Button
              style={buttonStyle}
              size={buttonSize}
              variant='default'
              leftSection={<IconTrash size={ICON_SIZE} />}
              disabled={!hasTeam}
              onClick={clearTeam}
            >
              {clearLabel}
            </Button>
          )}
          <Button
            style={buttonStyle}
            size={buttonSize}
            variant='default'
            leftSection={<IconDownload size={ICON_SIZE} />}
            loading={screenshotLoading}
            disabled={!hasTeam}
            onClick={() => screenshot('download')}
          >
            {downloadLabel}
          </Button>
          <Button
            style={buttonStyle}
            size={buttonSize}
            variant='default'
            leftSection={<IconCamera size={ICON_SIZE} />}
            loading={screenshotLoading}
            disabled={!hasTeam}
            onClick={() => screenshot('clipboard')}
          >
            {copyLabel}
          </Button>
        </Button.Group>
      )

    case ActionsForm.SUBTLE:
      return (
        <>
          {includeClear && (
            <Button
              style={buttonStyle}
              size={buttonSize}
              variant='subtle'
              color='gray'
              leftSection={<IconTrash size={ICON_SIZE} />}
              disabled={!hasTeam}
              onClick={clearTeam}
            >
              {clearLabel}
            </Button>
          )}
          <Button
            style={buttonStyle}
            size={buttonSize}
            variant='subtle'
            color='gray'
            leftSection={<IconDownload size={ICON_SIZE} />}
            loading={screenshotLoading}
            disabled={!hasTeam}
            onClick={() => screenshot('download')}
          >
            {downloadLabel}
          </Button>
          <Button
            style={buttonStyle}
            size={buttonSize}
            variant='subtle'
            leftSection={<IconCamera size={ICON_SIZE} />}
            loading={screenshotLoading}
            disabled={!hasTeam}
            onClick={() => screenshot('clipboard')}
          >
            {copyLabel}
          </Button>
        </>
      )

    case ActionsForm.COMPACT:
      return (
        <>
          {includeClear && (
            <Button
              size='xs'
              variant='default'
              leftSection={<IconTrash size={COMPACT_ICON_SIZE} />}
              disabled={!hasTeam}
              onClick={clearTeam}
            >
              {clearLabel}
            </Button>
          )}
          <Button
            size='xs'
            variant='default'
            leftSection={<IconDownload size={COMPACT_ICON_SIZE} />}
            loading={screenshotLoading}
            disabled={!hasTeam}
            onClick={() => screenshot('download')}
          >
            {downloadLabel}
          </Button>
          <Button
            size='xs'
            leftSection={<IconCamera size={COMPACT_ICON_SIZE} />}
            loading={screenshotLoading}
            disabled={!hasTeam}
            onClick={() => screenshot('clipboard')}
          >
            {copyLabel}
          </Button>
        </>
      )

    case ActionsForm.BUTTONS:
      return (
        <>
          {includeClear && (
            <Button
              style={buttonStyle}
              size={buttonSize}
              variant='subtle'
              color='gray'
              leftSection={<IconTrash size={ICON_SIZE} />}
              disabled={!hasTeam}
              onClick={clearTeam}
            >
              {clearLabel}
            </Button>
          )}
          <Button
            style={buttonStyle}
            size={buttonSize}
            variant='default'
            leftSection={<IconDownload size={ICON_SIZE} />}
            loading={screenshotLoading}
            disabled={!hasTeam}
            onClick={() => screenshot('download')}
          >
            {downloadLabel}
          </Button>
          <Button
            style={buttonStyle}
            size={buttonSize}
            leftSection={<IconCamera size={ICON_SIZE} />}
            loading={screenshotLoading}
            disabled={!hasTeam}
            onClick={() => screenshot('clipboard')}
          >
            {copyLabel}
          </Button>
        </>
      )
  }
}
