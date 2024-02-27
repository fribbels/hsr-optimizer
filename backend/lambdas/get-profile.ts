import * as AWS from 'aws-sdk'
import { APIGatewayEvent } from 'aws-lambda'
import { v4 as uuidv4 } from 'uuid'
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
    return { statusCode: 400, body: `Error: Missing id` }
  }

  // Fetch from cache
  const cachedValue = idCache[accountId]
  if (cachedValue && (new Date().getTime() - cachedValue.date.getTime()) < 60 * 1000) {
    console.log('Return cached response')
    return generate200Response(cachedValue.data)
  }

  // Fetch from api
  let data
  try {
    data = await getProfile(accountId)
    console.log(data)
  } catch (e) {
    console.error(e)
    return { statusCode: 500, body: 'Error' }
  }

  // Cache value
  const dataString = JSON.stringify(data)
  idCache[accountId] = {
    date: new Date(),
    data: dataString,
  }

  // Store in db
  const params = {
    TableName: TABLE_NAME,
    Item: {
      [PRIMARY_KEY]: accountId,
      [SORT_KEY]: uuidv4(),
      data: dataString,
      createdDate: new Date().toISOString(),
    },
  }
  try {
    await db.put(params).promise()
  } catch (error) {
    console.log(params)
    console.error('DB put error', error)
  }

  return generate200Response(dataString)
}

async function getProfile(accountId: string): Promise<ProfileResponse> {
  const endpoint = `https://enka.network/api/hsr/uid/${accountId}`
  console.log('GET ' + endpoint)

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      'content-type': 'application/json;charset=UTF-8',
    },
  })

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
