import { Card, Flex, Image, List, Typography } from 'antd'
import { Octokit } from '@octokit/core'
import { restEndpointMethods } from '@octokit/plugin-rest-endpoint-methods'
import { DiscordIcon } from 'icons/DiscordIcon'
import { GithubIcon } from 'icons/GithubIcon'
import { CoffeeIcon } from 'icons/CoffeeIcon'
import { LinkOutlined } from '@ant-design/icons'
import { AppPages } from 'lib/db'
import { useEffect, useState } from 'react'
import { roadmapIssueList } from 'components/ChangelogTab'

// Total API requests = 1 + sizeof(roadmap)
// API limit = 60 requests per hour per IP address
const owner = 'fribbels'
const repo = 'hsr-optimizer'
const MyOctokit = Octokit.plugin(restEndpointMethods)
const octokit = new MyOctokit({/* auth: '<auth token>' */ })

export default function InfoTab() {
  const activeKey = window.store((s) => s.activeKey)

  const links = generateLinks()
  const [contributors, setContributors] = useState<object[]>([])
  const [roadmap, setRoadmap] = useState<object[]>([])

  useEffect(() => {
    getContributors()
      .then(
        (output) => setContributors(output))
      .catch(
        () => { console.error('ERROR fetching contributors') })

    generateRoadmap(roadmapIssueList)
      .then(
        (output) => setRoadmap(output))
      .catch(
        () => { console.error('ERROR fetching roadmap') })
  }, [])

  if (activeKey != AppPages.INFO) return (<></>)
  return (
    <Flex vertical>
      <RoadMap roadmap={roadmap} />
      <Links links={links} />
      <ContributorInfo contributors={contributors} />
    </Flex>
  )
}

async function generateRoadmap(issues: number[]) {
  console.log('fetching issues')
  const output: { title: string; link: string }[] = []
  for (const number of issues) {
    const reset = 1// TODO: Fetch from DB
    if (Date.now() / 1000 <= reset) break

    const response = await octokit.rest.issues.get({ owner: owner, repo: repo, issue_number: number })

    if ([403, 429].includes(response.status)) {
      console.log('rate limited while generating roadmap')
      // TODO: update reset time in DB
      break
    }

    if ([301, 304, 404, 410].includes(response.status)) {
      console.error(`error while generating roadmap (status code: ${response.status})`)
    }

    output.push({
      title: response.data.title,
      link: response.data.html_url,
    })

    if (response.headers['x-ratelimit-remaining'] == '0') {
      console.log('rate limit reached while generating roadmap')
      // TODO: Update reset time in DB
      break
    }
  }
  return output
}

function RoadMap(props: { roadmap: object[] }) {
  if (!props.roadmap.length) return (
    <Flex vertical>
      <Typography.Title>Upcoming features</Typography.Title>
      <Typography>Awaiting API/rate limited</Typography>
    </Flex>
  )
  return (
    <Flex vertical>
      <Typography.Title>Upcoming features</Typography.Title>
      <List
        grid={{ gutter: 20 }}
        dataSource={props.roadmap}
        renderItem={(item) => (
          <List.Item>
            <Card
              hoverable
              size="small"
              style={{ width: 200, marginTop: 16, height: 120 }}
              onClick={() => window.open(item.link)}
            >
              <Typography>{item.title}</Typography>
            </Card>
          </List.Item>
        )}
      />
    </Flex>
  )
}

function generateLinks() {
  const output = [
    {
      description: 'Join us on discord',
      link: 'https://discord.gg/rDmB4Un7qg',
      icon: <DiscordIcon style={{ marginRight: 15 }} />,
    },
    {
      description: 'Help keep the servers running',
      link: 'https://www.patreon.com/fribbels',
      icon: <CoffeeIcon style={{ marginRight: 15 }} />,
    },
    {
      description: 'Help out on the project',
      link: 'https://github.com/fribbels/hsr-optimizer',
      icon: <GithubIcon style={{ marginRight: 15 }} />,
    },
  ]
  if (!window.officialOnly) {
    output.push({
      description: 'All the optimization, none of the leaks',
      link: 'https://starrailoptimizer.github.io/',
      icon: <LinkOutlined style={{ marginRight: 15 }} />,
    })
  }
  return output
}

function Links(props: { links }) {
  return (
    <Flex vertical>
      <Typography.Title>Useful Links</Typography.Title>
      <List
        grid={{ gutter: 20 }}
        dataSource={props.links}
        renderItem={(item) => (
          <List.Item>
            <Card
              hoverable
              size="small"
              style={{ width: 200, height: 70 }}
              onClick={() => window.open(item.link)}
            >
              <Flex>
                {item.icon}
                <Typography style={{ margin: 'auto' }}>{item.description}</Typography>
              </Flex>
            </Card>
          </List.Item>
        )}
      />
    </Flex>
  )
}

async function getContributors() {
  const reset = 1// TODO: Fetch reset time from DB
  if (Date.now() / 1000 <= reset) return []
  const output: { profile?: string; avatar?: string; name?: string }[] = []
  console.log('fetching contributors')
  const request = await octokit.rest.repos.listContributors({ owner: owner, repo: repo })
  if ([403, 429].includes(request.status)) {
    console.log('rate limited while fetching contributors')
    // TODO: Update the reset time in DB
    return []
  }
  if (request.headers['x-ratelimit-remaining'] == '0') {
    console.log('rate limit reached while fetching contributors')
    // TODO: Update the reset time in DB
  }
  if (request.status == 404) {
    console.error('Repository contributors: resource not found (code 404)')
    return []
  }
  for (const contributor of request.data) {
    output.push({
      profile: contributor.html_url,
      avatar: contributor.avatar_url,
      name: contributor.login,
    })
  }
  return output
}

function ContributorInfo(props: { contributors: object[] }) {
  if (!props.contributors.length) return (
    <Flex>
      <Typography.Title>Contributors</Typography.Title>
      <Typography>Awaiting API/currently rate limited</Typography>
    </Flex>
  )
  return (
    <Flex vertical>
      <Typography.Title>Contributors</Typography.Title>
      <List
        grid={{ gutter: 20 }}
        dataSource={props.contributors}
        renderItem={(item) => (
          <List.Item>
            <Card
              hoverable
              size="small"
              onClick={() => window.open(item.profile)}
            >
              <Flex gap={8}>
                <Image
                  src={item.avatar}
                  width={50}
                  preview={false}
                />
                <Typography>{item.name}</Typography>
              </Flex>
            </Card>
          </List.Item>
        )}
      />
    </Flex>
  )
}
