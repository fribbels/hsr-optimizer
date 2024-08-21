import * as AWS from 'aws-sdk'
import { APIGatewayEvent } from 'aws-lambda'
import fetch from 'node-fetch'

type ProfileResponse = object
type IdCacheValue = {
  date: Date
  data: string
}
const TABLE_NAME = process.env.TABLE_NAME || ''
const PRIMARY_KEY = process.env.PRIMARY_KEY || ''
const SORT_KEY = process.env.SORT_KEY || ''

const db = new AWS.DynamoDB.DocumentClient()

const idCache: { [key: string]: IdCacheValue } = {}

export const handler = async (event: APIGatewayEvent): Promise<any> => {
  const accountId = event.pathParameters?.id
  if (!accountId) {
    console.log('Invalid account id event', event)
    return { statusCode: 400, body: `Error: Missing id` }
  }

  // Fetch from cache
  const cachedValue = idCache[accountId]
  if (cachedValue && (new Date().getTime() - cachedValue.date.getTime()) < 60 * 1000) {
    console.log('Return cached response ' + accountId)
    return generate200Response(cachedValue.data)
  }

  // Fetch from api
  let data
  let dataString
  try {
    data = await getProfile(`${enkaEndpoint}${accountId}`)
    data.source = 'enka'
    dataString = JSON.stringify(data)
    console.log(data)
    idCache[accountId] = {
      date: new Date(),
      data: dataString,
    }
  } catch (e) {
    try {
      data = await getProfile(getMihomoEndpoint(accountId))
      data.source = 'mihomo'
      dataString = JSON.stringify(data)
      console.log(data)
      idCache[accountId] = {
        date: new Date(),
        data: dataString,
      }
    } catch (e) {
      try {
        data = await getProfile(`${manaEndpoint}${accountId}`)
        data.source = 'mana'
        dataString = JSON.stringify(data)
        console.log(data)
        idCache[accountId] = {
          date: new Date(),
          data: dataString,
        }
      } catch (e) {
        console.error(e)
        idCache[accountId] = {
          date: new Date(),
          data: '',
        }
        return { statusCode: 500, body: 'Error' }
      }
    }
  }

  // Cache value

  // Store in db
  // const params = {
  //   TableName: TABLE_NAME,
  //   Item: {
  //     [PRIMARY_KEY]: accountId,
  //     [SORT_KEY]: uuidv4(),
  //     data: dataString,
  //     createdDate: new Date().toISOString(),
  //   },
  // }
  // try {
  //   await db.put(params).promise()
  // } catch (error) {
  //   console.log(params)
  //   console.error('DB put error', error)
  // }

  return generate200Response(dataString)
}

const enkaEndpoint = 'https://enka.network/api/hsr/uid/'
const manaEndpoint = 'https://starrail-showcase.mana.wiki/api/showcase/'

function getMihomoEndpoint(id: string) {
  return `https://api.mihomo.me/sr_info_parsed/${id}?lang=en`
}

async function getProfile(endpoint: string): Promise<ProfileResponse> {
  console.log('GET ' + endpoint)

  const fetchPromise = fetch(endpoint, {
    method: 'GET',
    headers: {
      'content-type': 'application/json;charset=UTF-8',
      'User-Agent': 'Fribbels-HSR-Optimizer',
    },
  })

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Timing out request after 5s, changing to fallback')), 5000)
  )

  const response = await Promise.race([fetchPromise, timeoutPromise])

  if (!response.ok) {
    console.error(response)
    throw new Error('Fetch error')
  }

  return await response.json() as ProfileResponse
}

function generate200Response(dataString: string) {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    body: dataString,
  }
}
