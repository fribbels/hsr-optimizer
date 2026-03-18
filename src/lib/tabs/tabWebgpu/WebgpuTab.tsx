import {
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconQuestionMark,
} from '@tabler/icons-react'
import { Accordion, Button, Flex, Table } from '@mantine/core'
import {
  generateAllTests,
  type WebgpuTest,
} from 'lib/gpu/tests/webgpuTestGenerator'
import { type StatDelta } from 'lib/gpu/tests/webgpuTestUtils'
import { useState } from 'react'

export function WebgpuTab() {
  return <WebgpuDashboard />
}

function WebgpuDashboard() {
  const [tests, setTests] = useState<WebgpuTest[]>([])
  const [done, setDone] = useState(false)

  async function startTests() {
    setDone(false)
    globalThis.WEBGPU_DEBUG = true

    const runs = await generateAllTests()
    const allRunsCount = runs.length
    let index = 0
    let completed = 0
    setTests(runs)

    runs.forEach((run) => run.name = `#${++index} — ${run.name}`)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    for (const run of runs) {
      await run.execute()
      const newRuns = [...runs].sort(testSorter)
      setTests(newRuns)

      completed++

      if (completed === allRunsCount) {
        setDone(true)
      }
    }
  }

  return (
    <Flex direction="column" style={{ width: 1200, minHeight: 2000 }}>
      <Button
        onClick={startTests}
        style={{ height: 50, background: done ? '#248453' : undefined }}
        disabled={!done && tests.length > 0}
      >
        {done ? 'Tests complete' : 'Run all WebGPU tests'}
      </Button>

      <Accordion multiple chevronPosition='right'>
        {tests.map((test) => {
          const item = RenderTest(test)
          return (
            <Accordion.Item key={item.key} value={item.key}>
              <Accordion.Control>{item.label}</Accordion.Control>
              <Accordion.Panel>{item.children}</Accordion.Panel>
            </Accordion.Item>
          )
        })}
      </Accordion>
    </Flex>
  )
}

function testSorter(a: WebgpuTest, b: WebgpuTest) {
  // Sort by 'done' first: true goes above false
  if (a.done !== b.done) {
    return a.done ? -1 : 1
  }

  // If both are done, sort by 'result.allPass': false should go first
  if (a.done && b.done) {
    return a.result.allPass === b.result.allPass ? 0 : a.result.allPass ? 1 : -1
  }

  // If both are not done or have the same 'done' value and same 'allPass', keep their order
  return 0
}

function RenderTest(test: WebgpuTest) {
  return {
    key: test.name,
    label: <TestIcon test={test} />,
    children: <TestRow test={test} />,
  }
}

function TestRow(props: { test: WebgpuTest }) {
  const { test } = props
  if (!test.result) return <></>

  const statDeltas = test.result.statDeltas
  const deltaArray = Object.values(statDeltas)
  deltaArray.sort((a: StatDelta, b: StatDelta) => Number(a.pass) - Number(b.pass))

  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th style={{ width: 20 }} />
          <Table.Th style={{ width: 80 }}>Stat</Table.Th>
          <Table.Th style={{ width: 120 }}>CPU</Table.Th>
          <Table.Th style={{ width: 120 }}>GPU</Table.Th>
          <Table.Th style={{ width: 120 }}>Delta</Table.Th>
          <Table.Th style={{ width: 120 }}>Precision</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {deltaArray.map((delta) => (
          <Table.Tr key={delta.key}>
            <Table.Td>
              <Flex style={{ color: delta.pass ? '#83ec66' : '#ef7979', width: '100%' }} justify='space-around'>
                {delta.pass ? <IconCircleCheckFilled /> : <IconCircleXFilled />}
              </Flex>
            </Table.Td>
            <Table.Td><RenderText text={delta.key} /></Table.Td>
            <Table.Td><RenderText text={delta.cpu} /></Table.Td>
            <Table.Td><RenderText text={delta.gpu} /></Table.Td>
            <Table.Td><RenderText text={delta.deltaString} /></Table.Td>
            <Table.Td><RenderText text={String(delta.precision)} /></Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  )
}

function TestIcon(props: { test: WebgpuTest }) {
  const { test } = props

  if (!test.done) {
    return (
      <Flex gap={8} style={{ color: '#e6e6e6' }}>
        <IconQuestionMark />
        {test.name}
      </Flex>
    )
  }
  return (
    <Flex gap={8} style={{ color: test.result.allPass ? '#83ec66' : '#ef7979' }}>
      {test.result.allPass ? <IconCircleCheckFilled /> : <IconCircleXFilled />}
      {test.name}
    </Flex>
  )
}

function RenderText(props: { text: string }) {
  return (
    <div style={{ margin: '0', fontFamily: 'Segoe UI, Frutiger, Frutiger Linotype, Dejavu Sans, Helvetica Neue, Arial, sans-serif' }}>
      {props.text}
    </div>
  )
}
