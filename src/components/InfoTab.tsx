import { Button, Card, Flex, Image, List, Typography } from 'antd'
import { Octokit } from '@octokit/core'
import { restEndpointMethods } from '@octokit/plugin-rest-endpoint-methods'
import { DiscordIcon } from 'icons/DiscordIcon'
import { GithubIcon } from 'icons/GithubIcon'
import { CoffeeIcon } from 'icons/CoffeeIcon'
import { LinkOutlined } from '@ant-design/icons'
import DB, { AppPages } from 'lib/db'
import { useEffect, useState } from 'react'
import { roadmapIssueList } from 'components/ChangelogTab'
import { SaveState } from 'lib/saveState'

// Total API requests = 1 + sizeof(roadmap)
// API limit = 60 requests per hour per IP address
const owner = 'fribbels'
const repo = 'hsr-optimizer'
const MyOctokit = Octokit.plugin(restEndpointMethods)
const octokit = new MyOctokit({ /*auth: '<token>'*/ })

export default function InfoTab() {
  console.log(`api info: ${DB.getGithubAPI().limited}, ${DB.getGithubAPI().limit_reset}`)
  const activeKey = window.store((s) => s.activeKey)

  const links = generateLinks()
  const [contributors, setContributors] = useState<object[]>([])
  const [roadmap, setRoadmap] = useState<object[]>([])

  const [loadingRoadmap, setLoadingRoadmap] = useState(true)
  const [loadingContributors, setLoadingContributors] = useState(true)

  useEffect(() => {
    getContributors()
      .then(
        (output) => setContributors(output))
      .catch(
        () => {
          const info = DB.getGithubAPI()
          info.limited = true
          DB.setGithubAPI(info)
          console.error('ERROR fetching contributors')
        })
      .finally(() => setLoadingContributors(false))

    generateRoadmap(roadmapIssueList)
      .then(
        (output) => setRoadmap(output))
      .catch(
        () => {
          const info = DB.getGithubAPI()
          info.limited = true
          DB.setGithubAPI(info)
          console.error('ERROR fetching roadmap')
        })
      .finally(() => setLoadingRoadmap(false))
  }, [])

  if (activeKey != AppPages.INFO) return (<></>)
  return (
    <Flex vertical>
      <RoadMap roadmap={roadmap} loading={loadingRoadmap} />
      <Links links={links} />
      <ContributorInfo contributors={contributors} loading={loadingContributors} />
      <Button onClick={() => console.log(DB.getState())} />
    </Flex>
  )
}

async function generateRoadmap(issues: number[]) {
  console.log('fetching issues')
  const output: { title: string; link: string }[] = []
  for (const number of issues) {
    const reset = DB.getGithubAPI().limit_reset
    const limited: boolean = DB.getGithubAPI().limited
    if (Date.now() / 1000 <= reset && limited) {
      console.log('rate limited, exiting roadmap')
      break
    }
    DB.setGithubAPI({ limited: false, limit_reset: reset })

    try {
      const response = await octokit.rest.issues.get({ owner: owner, repo: repo, issue_number: number })
      DB.setGithubAPI({ limited: limited, limit_reset: parseInt(response.headers['x-ratelimit-reset']) })
      output.push({
        title: response.data.title,
        link: response.data.html_url,
      })
      if (parseInt(response.headers['x-ratelimit-remaining']) == 0) {
        console.log('rate limit reached while generating roadmap')
        DB.setGithubAPI({ limited: true, limit_reset: reset })
        break
      }
    } catch (error) {
      if ([403, 429].includes(error.status)) {
        console.log('rate limited while generating roadmap')
        DB.setGithubAPI({ limited: true, limit_reset: reset })
        break
      }
      if ([301, 304, 404, 410].includes(error.status)) {
        console.error(`error while generating roadmap (status code: ${error.status})`)
      }
    }
  }
  SaveState.save()
  console.log('returning roadmap')
  return output
}

function RoadMap(props: { roadmap: object[]; loading: boolean }) {
  if (!props.roadmap.length) return (
    <Flex vertical>
      <Typography.Title>Upcoming features</Typography.Title>
      <Card
        size="small"
        style={{ width: 200, marginTop: 16, height: 120 }}
      >
        <Typography>{props.loading ? 'waiting on API' : 'You are currently rate limited, reload the page again at a later time'}</Typography>
      </Card>
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
  const reset = DB.getGithubAPI().limit_reset
  const limited: boolean = DB.getGithubAPI().limited
  if (Date.now() / 1000 <= reset && limited) {
    console.log('rate limited, exiting contributors')
    return []
  }
  DB.setGithubAPI({ limited: false, limit_reset: reset })
  const output: { profile?: string; avatar?: string; name?: string }[] = []
  console.log('fetching contributors')

  try {
    const request = await octokit.rest.repos.listContributors({ owner: owner, repo: repo })
    for (const contributor of request.data) {
      output.push({
        profile: contributor.html_url,
        avatar: contributor.avatar_url,
        name: contributor.login,
      })
    }
    if (parseInt(request.headers['x-ratelimit-remaining']) == 0) {
      console.log('rate limit reached while generating roadmap')
    }
    DB.setGithubAPI({ limited: parseInt(request.headers['x-ratelimit-remaining']) == 0, limit_reset: parseInt(request.headers['x-ratelimit-reset']) })
  } catch (error) {
    if ([403, 429].includes(error.status)) {
      console.log('rate limited while fetching contributors')
      DB.setGithubAPI({ limited: true, limit_reset: reset })
    }
    if (error.status == 404) {
      console.error('Repository contributors: resource not found (code 404)')
    }
    console.log('returning contributors')
  }
  console.log('returning contributors')
  SaveState.save()
  return output
}

function ContributorInfo(props: { contributors: object[]; loading: boolean }) {
  if (!props.contributors.length) return (
    <Flex vertical>
      <Typography.Title>Contributors</Typography.Title>
      <Card
        size="small"
        style={{ width: 200, marginTop: 16, height: 120 }}
      >
        <Typography>{props.loading ? 'waiting on API' : 'You are currently rate limited, reload the page again at a later time'}</Typography>
      </Card>
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
