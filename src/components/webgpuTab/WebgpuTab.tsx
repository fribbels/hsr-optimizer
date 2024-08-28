import React, { useState } from 'react'
import { Button, Collapse, Flex, Table, TableProps } from 'antd'
import { AppPages } from 'lib/db.js'
import { CheckCircleFilled, CloseCircleFilled, QuestionOutlined } from '@ant-design/icons'
import { generateAllTests, WebgpuTest } from 'lib/gpu/tests/webgpuTestGenerator'
import { StatDelta, StatDeltas } from 'lib/gpu/tests/webgpuTestUtils'

export default function WebgpuTab(): React.JSX.Element {
  const activeKey = window.store((s) => s.activeKey)

  if (activeKey != AppPages.WEBGPU_TEST) {
    // Don't load unless tab active
    return (<></>)
  }

  return (
    <WebgpuDashboard/>
  )
}

function WebgpuDashboard() {
  const [tests, setTests] = useState<WebgpuTest[]>([])
  const [done, setDone] = useState(false)

  async function startTests() {
    setDone(false)

    const runs = await generateAllTests()
    const allRunsCount = runs.length
    let completed = 0
    setTests(runs)

    runs.forEach((run, index) => {
      run.promise.then(() => {
        const newRuns = [...runs].sort((a, b) => {
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
        })
        setTests(newRuns)

        completed++

        if (completed == allRunsCount) {
          setDone(true)
        }
      }).catch((error) => {
        console.error(`Promise at index ${index} failed:`, error)
      })
    })
  }

  return (
    <Flex vertical style={{ width: 1200 }}>
      <Button
        type='primary'
        onClick={startTests}
        style={{ height: 50, background: done ? '#248453' : undefined }}
        disabled={!done && tests.length > 0}
      >
        {done ? 'Tests complete' : 'Run all unit tests'}
      </Button>

      <Collapse
        items={tests.map(RenderTest)}
        expandIconPosition='end'
        size='small'
      />
    </Flex>
  )
}

function RenderTest(test: WebgpuTest) {
  return {
    key: test.name,
    label: (
      <TestIcon test={test}/>
    ),
    children: (
      <TestRow test={test}/>
    ),
  }
}

const columns: TableProps<StatDeltas>['columns'] = [
  {
    title: '',
    dataIndex: 'pass',
    render: (pass) => (
      <Flex style={{ color: pass ? '#83ec66' : '#ef7979', width: '100%' }} justify='space-around'>
        {pass ? <CheckCircleFilled/> : <CloseCircleFilled/>}
      </Flex>
    ),
    width: 20,
  },
  {
    title: 'Stat',
    dataIndex: 'key',
    render: (text) => <RenderText text={text}/>,
    width: 80,
  },
  {
    title: 'CPU',
    dataIndex: 'cpu',
    render: (text) => <RenderText text={text}/>,
    width: 120,
  },
  {
    title: 'GPU',
    dataIndex: 'gpu',
    render: (text) => <RenderText text={text}/>,
    width: 120,
  },
  {
    title: 'Delta',
    dataIndex: 'deltaString',
    render: (text) => <RenderText text={text}/>,
    width: 120,
  },
  {
    title: 'Precision',
    dataIndex: 'precision',
    render: (text) => <RenderText text={text}/>,
    width: 120,
  },
]

function TestRow(props: { test: WebgpuTest }) {
  const { test } = props
  if (!test.result) return (<></>)

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
        <QuestionOutlined/>
        {test.name}
      </Flex>
    )
  }
  return (
    <Flex gap={8} style={{ color: test.result.allPass ? '#83ec66' : '#ef7979' }}>
      {test.result.allPass ? <CheckCircleFilled/> : <CloseCircleFilled/>}
      {test.name}
    </Flex>
  )
}

function RenderText(props: { text: any }) {
  return (
    <div style={{ margin: '0', fontFamily: 'Segoe UI, Frutiger, Frutiger Linotype, Dejavu Sans, Helvetica Neue, Arial, sans-serif' }}>
      {props.text}
    </div>
  )
}
