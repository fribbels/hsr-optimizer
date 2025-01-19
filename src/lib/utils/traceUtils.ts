import DB from 'lib/state/db'
import { getOverrideTraces, traceTrees } from 'lib/state/metadata'
import { TsUtils } from 'lib/utils/TsUtils'
import { Utils } from 'lib/utils/utils'

type RawNode = {
  PointID: number
  PointType: number
  PrePoint: number[]
  StatusAddList: { Name: string; Value: number }[]
}

type ParsedNode = {
  id: number
  stat: string
  value: number
  pre: number
  children: ParsedNode[]
}

// @ts-ignore
window.data = {}

function testTraces() {
  const fails = []

  for (const [id, traces] of Object.entries(traceTrees)) {
    const stack = [...traces]
    const stats: Record<string, number> = {}

    while (stack.length) {
      const trace = stack.pop()!
      for (const child of trace.children) {
        stack.push(child)
      }

      if (!stats[trace.stat]) {
        stats[trace.stat] = 0
      }
      stats[trace.stat] += trace.value
    }

    const saved = getOverrideTraces()[id]
    console.log(stats)
    console.log(saved)

    if (Object.entries(stats).length != Object.entries(saved).length) {
      fails.push(id)
      console.log('????', id)
    }

    for (const [stat, value] of Object.entries(stats)) {
      if (Utils.precisionRound(saved[stat]) != Utils.precisionRound(value)) {
        fails.push(id)
        console.log('????', id)
      }
    }
    console.log('---')
  }

  console.log('!!!', fails)
}

window.testTraces = testTraces

function generateTraceTrees() {
  for (const character of Object.values(DB.getMetadata().characters)) {
    const url = `https://api.hakush.in/hsr/data/en/character/${character.id}.json`

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch data for character ID: ${character.id}`)
        }
        return response.json()
      })
      .then((data) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const skillTree = data.SkillTrees

        const rootNodes: ParsedNode[] = []
        const usefulNodes: ParsedNode[] = []
        const nodesById: Record<string, ParsedNode> = {}

        const statMap: Record<string, string> = {
          ATK: 'ATK%',
          DEF: 'DEF%',
          HP: 'HP%',
        }

        for (const basePointNode of Object.values(skillTree)) {
          for (const pointNode of Object.values(basePointNode)) {
            const node = pointNode as RawNode
            if (node.PointType == 1) {
              const data: ParsedNode = {
                id: node.PointID,
                stat: statMap[node.StatusAddList[0].Name] ?? node.StatusAddList[0].Name,
                value: TsUtils.precisionRound(node.StatusAddList[0].Value),
                pre: node.PrePoint[0] ?? 0,
                children: [],
              }

              usefulNodes.push(data)
              nodesById[data.id] = data
            }
          }
        }

        for (const node of usefulNodes) {
          if (nodesById[node.pre] == null) {
            rootNodes.push(node)
          } else {
            nodesById[node.pre].children.push(node)
          }

          delete node.pre
          delete node.id
        }

        window.data[character.id] = rootNodes
        console.log(character.id)
      })
      .catch((error) => {
        console.error(`Error fetching character ID ${character.id}:`, error)
      })
  }
}

export function testLoad() {

}
