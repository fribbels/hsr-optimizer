import { Modal, ScrollArea } from '@mantine/core'
import { IconChevronDown } from '@tabler/icons-react'
import { OpenCloseIDs, setOpen, useOpenClose } from 'lib/hooks/useOpenClose'
import { Assets } from 'lib/rendering/assets'
import { SaveState } from 'lib/state/saveState'
import { useGlobalStore } from 'lib/stores/app/appStore'
import { CURRENT_OPTIMIZER_VERSION } from 'lib/constants/constants'
import { getChangelogContent } from 'lib/tabs/tabChangelog/changelogData'
import { ColorizedLinkWithIcon } from 'lib/ui/ColorizedLink'
import { CtaCards } from 'lib/overlays/modals/changelogCta/CtaCards'
import { useCallback, useMemo, useRef, useState } from 'react'
import classes from './ChangelogModal.module.css'

globalThis.openChangelogModal = () => setOpen(OpenCloseIDs.CHANGELOG_MODAL)

export function ChangelogModal() {
  const { isOpen, close } = useOpenClose(OpenCloseIDs.CHANGELOG_MODAL)
  const [atBottom, setAtBottom] = useState(false)
  const viewportRef = useRef<HTMLDivElement>(null)

  const entry = useMemo(() => getChangelogContent()[1], [])

  const handleScroll = useCallback((position: { x: number; y: number }) => {
    const viewport = viewportRef.current
    if (!viewport) return
    const isAtBottom = position.y + viewport.clientHeight >= viewport.scrollHeight - 20
    setAtBottom((prev) => prev !== isAtBottom ? isAtBottom : prev)
  }, [])

  const handleDismiss = () => {
    close()
    useGlobalStore.getState().setVersion(CURRENT_OPTIMIZER_VERSION)
    SaveState.delayedSave()
  }

  if (!entry) return null

  return (
    <Modal
      opened={isOpen}
      onClose={handleDismiss}
      size={1000}
      centered
      withCloseButton
      transitionProps={{ transition: 'pop', duration: 500, exitDuration: 150, timingFunction: 'ease' }}
      title={
        <div className={classes.headerTitle}>
          What's New
          <span className={classes.versionBadge}>{entry.date}</span>
        </div>
      }
      classNames={{
        body: classes.modalBody,
        content: classes.modalContent,
        header: classes.header,
      }}
    >

      <ScrollArea
        className={classes.scrollArea}
        type='scroll'
        scrollbarSize={8}
        scrollbars='y'
        classNames={{ viewport: classes.scrollViewport }}
        viewportRef={viewportRef}
        onScrollPositionChange={handleScroll}
      >
        <ul className={classes.contentList}>
          {entry.content.map((item, i) => {
            if (item.endsWith('.webp')) {
              return (
                <img
                  key={i}
                  src={Assets.getChangelog(`${entry.date}/${item}`)}
                  loading='lazy'
                  className={classes.changelogImage}
                />
              )
            }
            if (item.startsWith('https')) {
              return (
                <li key={i} className={classes.changelogItem}>
                  <ColorizedLinkWithIcon text={item} url={item} />
                </li>
              )
            }
            return (
              <li key={i} className={classes.changelogItem}>
                {item}
              </li>
            )
          })}
        </ul>
        <div className={`${classes.scrollIndicator} ${atBottom ? classes.scrollIndicatorHidden : ''}`}>
          <div className={classes.scrollIndicatorContent}>
            <span>Scroll to explore</span>
            <IconChevronDown size={20} />
          </div>
        </div>
      </ScrollArea>

      <div className={classes.ctaSection}>
        <CtaCards />
      </div>
    </Modal>
  )
}
