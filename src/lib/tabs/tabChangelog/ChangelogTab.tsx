import { Flex, Pagination, Text, Title } from '@mantine/core'
import { Assets } from 'lib/rendering/assets'
import { useGlobalStore } from 'lib/stores/appStore'
import { AppPages } from 'lib/constants/appPages'
import { ChangelogContent, getChangelogContent } from 'lib/tabs/tabChangelog/changelogData'
import { ColorizedLinkWithIcon } from 'lib/ui/ColorizedLink'
import React, { useMemo, useState } from 'react'

const PAGE_SIZE = 4

function ChangelogEntry(props: { contentUpdate: ChangelogContent }) {
  const contentUpdate = props.contentUpdate
  const headerText = contentUpdate.date != '' ? `Update ${contentUpdate.date}` : contentUpdate.title

  return (
    <Flex direction='column'>
      <Title style={{ marginLeft: 20 }}>
        <u>{headerText}</u>
      </Title>
      <ul>
        {contentUpdate.content.map((entry, i) => {
          if (entry.endsWith('.webp')) {
            return (
              <img
                key={i}
                src={Assets.getChangelog(`${contentUpdate.date}/${entry}`)}
                loading='lazy'
                style={{
                  border: '2px solid var(--mantine-color-dark-7)',
                  margin: 5,
                  maxWidth: 1200,
                }}
              />
            )
          }
          if (entry.startsWith('https')) {
            return (
              <li key={i}>
                <ColorizedLinkWithIcon text={entry} url={entry} />
              </li>
            )
          }
          return (
            <li key={i}>
              <Text style={{ fontSize: 16 }}>{entry}</Text>
            </li>
          )
        })}
      </ul>
    </Flex>
  )
}

export default function ChangelogTab(): React.JSX.Element {
  const activeKey = useGlobalStore((s) => s.activeKey)
  const changelogContent = useMemo(() => getChangelogContent(), [])
  const [page, setPage] = useState(1)

  if (activeKey != AppPages.CHANGELOG) {
    return <></>
  }

  const totalPages = Math.ceil(changelogContent.length / PAGE_SIZE)
  const paginatedItems = changelogContent.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <Flex direction='column'>
      {paginatedItems.map((item, index) => (
        <div key={item.date || index}>
          <ChangelogEntry contentUpdate={item} />
        </div>
      ))}
      {totalPages > 1 && (
        <Pagination
          total={totalPages}
          value={page}
          onChange={setPage}
          mt='md'
        />
      )}
    </Flex>
  )
}
