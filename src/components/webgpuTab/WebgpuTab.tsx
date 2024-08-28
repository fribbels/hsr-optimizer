import React, { useState } from 'react'
import { Button, Collapse, Flex } from 'antd'
import { AppPages } from 'lib/db.js'
import { generateTests, WebgpuTest } from 'lib/gpu/tests/webgpuTester'
import { CheckCircleFilled } from '@ant-design/icons'

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

  async function startTests() {
    const runs = await generateTests()
    setTests(runs)

    runs.forEach((run, index) => {
      run.promise.then(() => {
        setTests([...runs])
      }).catch((error) => {
        console.error(`Promise at index ${index} failed:`, error)
      })
    })
  }

  return (
    <Flex vertical style={{ width: 1000 }}>
      <Button
        type='primary' onClick={startTests}
      >
        Execute tests
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
      <Flex gap={8} style={{ color: test.passed ? '#83ec66' : '#ef7979' }}>
        <CheckCircleFilled/>
        {test.name}
      </Flex>
    ),
    children: (
      <pre>
        {test.result ? test.name + JSON.stringify(test.result) : 'Loading..'}
      </pre>
    ),
  }
}
