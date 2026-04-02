import { Flex, Pagination, Title } from '@mantine/core'
import { Assets } from 'lib/rendering/assets'
import { type ChangelogContent, getChangelogContent } from 'lib/tabs/tabChangelog/changelogData'
import { ColorizedLinkWithIcon } from 'lib/ui/ColorizedLink'
import React, { useMemo, useState } from 'react'

const PAGE_SIZE = 3

function ChangelogEntry(props: { contentUpdate: ChangelogContent }) {
  const contentUpdate = props.contentUpdate
  const headerText = contentUpdate.date !== '' ? `Update ${contentUpdate.date}` : contentUpdate.title

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
                  border: '2px solid var(--layer-0)',
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
              <div style={{ fontSize: 16 }}>{entry}</div>
            </li>
          )
        })}
      </ul>
    </Flex>
  )
}

export function ChangelogTab(): React.JSX.Element {
  const changelogContent = useMemo(() => getChangelogContent(), [])
  const [page, setPage] = useState(1)

  const versionEntry = changelogContent[0]
  const entries = changelogContent.slice(1)
  const totalPages = Math.ceil(entries.length / PAGE_SIZE)
  const paginatedItems = entries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <Flex direction='column' style={{ marginBottom: 400, width: 1250 }}>
      <ChangelogEntry contentUpdate={versionEntry} />
      {totalPages > 1 && (
        <Pagination
          total={totalPages}
          value={page}
          onChange={setPage}
          mb='md'
          style={{ marginLeft: 20, marginTop: 20 }}
        />
      )}
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
          style={{ marginLeft: 20 }}
        />
      )}
    </Flex>
  )
}
