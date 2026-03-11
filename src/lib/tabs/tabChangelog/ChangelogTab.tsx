import { Flex, Pagination, Text, Title, useMantineTheme } from '@mantine/core'
import { Assets } from 'lib/rendering/assets'
import { useGlobalStore } from 'lib/stores/appStore'
import { AppPages } from 'lib/constants/appPages'
import { ChangelogContent, getChangelogContent } from 'lib/tabs/tabChangelog/changelogData'
import { ColorizedLinkWithIcon } from 'lib/ui/ColorizedLink'
import React, {
  ReactElement,
  useMemo,
  useState,
} from 'react'

export default function ChangelogTab(): React.JSX.Element {
  const theme = useMantineTheme()

  const activeKey = useGlobalStore((s) => s.activeKey)
  const changelogContent = useMemo(() => getChangelogContent(), [])

  const PAGE_SIZE = 4
  const [page, setPage] = useState(1)

  if (activeKey != AppPages.CHANGELOG) {
    // Don't load images unless we're on the changelog tab
    return <></>
  }

  function listToDisplay(content: string[], contentUpdate: ChangelogContent) {
    const display: ReactElement[] = []
    let i = 0
    for (const entry of content) {
      if (entry.endsWith('.webp')) {
        display.push(
          <img
            key={i++}
            src={Assets.getChangelog(`${contentUpdate.date}/${entry}`)}
            loading='lazy'
            style={{
              border: `2px solid ${theme.colors.dark[7]}`,
              margin: 5,
              maxWidth: 1200,
            }}
          />,
        )
      } else if (entry.startsWith('https')) {
        display.push(
          <li key={i++}>
            <ColorizedLinkWithIcon
              text={entry}
              url={entry}
              key={i++}
            />
          </li>,
        )
      } else {
        display.push(
          <li key={i++}>
            <Text style={{ fontSize: 16 }}>{entry}</Text>
          </li>,
        )
      }
    }

    const headerText = contentUpdate.date != '' ? `Update ${contentUpdate.date}` : contentUpdate.title

    return (
      <Flex direction="column">
        <Title style={{ marginLeft: 20 }}>
          <u>
            {headerText}
          </u>
        </Title>
        <ul>
          {display}
        </ul>
      </Flex>
    )
  }

  const totalPages = Math.ceil(changelogContent.length / PAGE_SIZE)
  const paginatedItems = changelogContent.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <Flex direction="column" gap={0}>
      {paginatedItems.map((item, index) => (
        <div key={item.date || index}>
          {listToDisplay(item.content, item)}
        </div>
      ))}
      {totalPages > 1 && (
        <Pagination
          total={totalPages}
          value={page}
          onChange={setPage}
          mt="md"
        />
      )}
    </Flex>
  )
}
