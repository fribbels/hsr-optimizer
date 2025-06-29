import {
  CheckCircleFilled,
  CloseCircleFilled,
  QuestionOutlined,
} from '@ant-design/icons'
import {
  Button,
  Collapse,
  Flex,
  Table,
  TableProps,
} from 'antd'
import {
  generateAllTests,
  WebgpuTest,
} from 'lib/gpu/tests/webgpuTestGenerator'
import {
  StatDelta,
  StatDeltas,
} from 'lib/gpu/tests/webgpuTestUtils'
import { AppPages } from 'lib/state/db'
import React, { useState } from 'react'

export default function WebgpuTab(): React.JSX.Element {
  const activeKey = window.store((s) => s.activeKey)

  if (activeKey != AppPages.WEBGPU_TEST) {
    // Don't load unless tab active
    return <></>
  }

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

    runs.map((run) => run.name = `#${++index} — ${run.name}`)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    for (const run of runs) {
      await run.execute()
      const newRuns = [...runs].sort(testSorter)
      setTests(newRuns)

      completed++

      if (completed == allRunsCount) {
        setDone(true)
      }
    }
  }

  return (
    <Flex vertical style={{ width: 1200, minHeight: 2000 }}>
      <Button
        type='primary'
        onClick={startTests}
        style={{ height: 50, background: done ? '#248453' : undefined }}
        disabled={!done && tests.length > 0}
      >
        {done ? 'Tests complete' : 'Run all WebGPU tests'}
      </Button>

      <Collapse
        items={tests.map(RenderTest)}
        expandIconPosition='end'
        size='small'
      />
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

const columns: TableProps<StatDeltas>['columns'] = [
  {
    title: '',
    dataIndex: 'pass',
    render: (pass) => (
      <Flex style={{ color: pass ? '#83ec66' : '#ef7979', width: '100%' }} justify='space-around'>
        {pass ? <CheckCircleFilled /> : <CloseCircleFilled />}
      </Flex>
    ),
    width: 20,
  },
  {
    title: 'Stat',
    dataIndex: 'key',
    render: (text) => <RenderText text={text} />,
    width: 80,
  },
  {
    title: 'CPU',
    dataIndex: 'cpu',
    render: (text) => <RenderText text={text} />,
    width: 120,
  },
  {
    title: 'GPU',
    dataIndex: 'gpu',
    render: (text) => <RenderText text={text} />,
    width: 120,
  },
  {
    title: 'Delta',
    dataIndex: 'deltaString',
    render: (text) => <RenderText text={text} />,
    width: 120,
  },
  {
    title: 'Precision',
    dataIndex: 'precision',
    render: (text) => <RenderText text={text} />,
    width: 120,
  },
]

function TestRow(props: { test: WebgpuTest }) {
  const { test } = props
  if (!test.result) return <></>

  const statDeltas = test.result.statDeltas
  const deltaArray = Object.values(statDeltas)
  deltaArray.sort((a: StatDelta, b: StatDelta) => Number(a.pass) - Number(b.pass))

  return (
    <Table
      // @ts-ignore
      columns={columns}
      dataSource={deltaArray}
      size='small'
      pagination={false}
    />
  )
}

function TestIcon(props: { test: WebgpuTest }) {
  const { test } = props

  if (!test.done) {
    return (
      <Flex gap={8} style={{ color: 'e6e6e6' }}>
        <QuestionOutlined />
        {test.name}
      </Flex>
    )
  }
  return (
    <Flex gap={8} style={{ color: test.result.allPass ? '#83ec66' : '#ef7979' }}>
      {test.result.allPass ? <CheckCircleFilled /> : <CloseCircleFilled />}
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
