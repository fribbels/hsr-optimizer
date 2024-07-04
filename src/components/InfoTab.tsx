import { Card, Flex, Image, List, Typography } from 'antd'
import { Octokit } from '@octokit/core'
import { restEndpointMethods } from '@octokit/plugin-rest-endpoint-methods'
import { DiscordIcon } from 'icons/DiscordIcon'
import { GithubIcon } from 'icons/GithubIcon'
import { CoffeeIcon } from 'icons/CoffeeIcon'
import { LinkOutlined } from '@ant-design/icons'

// Total API requests = 1 + sizeof(roadmap)
// API limit = 60 requests per hour per IP address
const owner = 'fribbels'
const repo = 'hsr-optimizer'
const MyOctokit = Octokit.plugin(restEndpointMethods)
const octokit = new MyOctokit(/* {<auth token>} */)

const contributors = await getContributors()

async function getContributors() { // TODO: add error + rate limit handling
  console.log('fetching contributors')
  const output: { profile?: string; avatar?: string; name?: string }[] = []
  const request = await octokit.rest.repos.listContributors({ owner: owner, repo: repo })
  for (const contributor of request.data) {
    output.push({
      profile: contributor.html_url,
      avatar: contributor.avatar_url,
      name: contributor.login,
    })
  }
  output.slice(0, 500)// only the first 500 contributors' profile information is conserved by the API, beyond that are anonymised
  return output
}

// updating the roadmap dynamically based on the Kanban has to be done via graphql as restAPI for projects is being deprecated, graphql can't be used unauthenticated
// could this be improved via with github actions maybe?
// in the meantime the issue numbers are manually updated
const roadmapIssueList = [173, 27, 190, 375, 420, 372, 247, 29]
const roadmap = await generateRoadmap(roadmapIssueList)

async function generateRoadmap(issues: number[]) { // TODO: add error + rate limit handling
  console.log('fetching issues')
  const output: { title: string; link: string }[] = []
  for (const number of issues) {
    console.log(`fetching issue ${number}`)
    const response = await octokit.rest.issues.get({ owner: owner, repo: repo, issue_number: number })
    output.push({
      title: response.data.title,
      link: response.data.html_url,
    })
    console.log(`rate limit remaining: ${response.headers['x-ratelimit-remaining']}`)
  }
  console.log('returning')
  return output
}

const links = generateLinks()

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

export default function InfoTab() {
  return (
    <Flex vertical>
      <RoadMap />
      <Links />
      <ContributorInfo />
    </Flex>
  )
}

function RoadMap() {
  return (
    <Flex vertical>
      <Typography.Title>Upcoming features</Typography.Title>
      <List
        bordered
        grid={{ gutter: 0 }}
        dataSource={roadmap}
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

function Links() {
  return (
    <Flex vertical>
      <Typography.Title>Useful Links</Typography.Title>
      <List
        grid={{ gutter: 0 }}
        dataSource={links}
        renderItem={(item) => (
          <List.Item>
            <Card
              hoverable
              size="small"
              style={{ width: 200, margin: 16, height: 70 }}
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

function ContributorInfo() {
  return (
    <Flex vertical>
      <Typography.Title>Contributors</Typography.Title>
      <List
        grid={{ gutter: 20 }}
        dataSource={contributors}
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
