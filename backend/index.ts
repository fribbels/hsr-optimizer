import {
  IResource,
  LambdaIntegration,
  MockIntegration,
  PassthroughBehavior,
  RestApi,
} from 'aws-cdk-lib/aws-apigateway'
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { App, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib'
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs'
import { join } from 'path'

enum Stage {
  BETA = 'Beta',
  PROD = 'Prod',
}

type StackEnvProps = StackProps & {
  stage: Stage
}

export class ApiLambdaCrudDynamoDBStack extends Stack {
  constructor(app: App, id: string, props: StackEnvProps) {
    super(app, id, props)

    const dynamoTable = new Table(this, 'hsrOptimizerTable', {
      partitionKey: {
        name: 'pk',
        type: AttributeType.STRING,
      },
      tableName: `${props.stage}HsrOptimizerTable`,

      /**
       * The default removal policy is RETAIN, which means that cdk destroy will not attempt to delete
       * the new table, and it will remain in your account until manually deleted. By setting the policy to
       * DESTROY, cdk destroy will delete the table (even if it has data in it)
       */
      removalPolicy: props.stage == Stage.BETA ? RemovalPolicy.DESTROY : RemovalPolicy.RETAIN, // NOT recommended for production code
    })

    const nodeJsFunctionProps: NodejsFunctionProps = {
      bundling: {
        externalModules: [
          'aws-sdk', // Use the 'aws-sdk' available in the Lambda runtime
        ],
      },
      depsLockFilePath: join(__dirname, 'lambdas', 'package-lock.json'),
      environment: {
        PRIMARY_KEY: 'pk',
        TABLE_NAME: dynamoTable.tableName,
      },
      runtime: Runtime.NODEJS_16_X,
    }

    // Create a Lambda function for each of the CRUD operations
    const getProfileLambda = new NodejsFunction(this, 'getProfileFunction', {
      entry: join(__dirname, 'lambdas', 'get-profile.ts'),
      ...nodeJsFunctionProps,
    })

    // Grant the Lambda function read access to the DynamoDB table
    dynamoTable.grantReadWriteData(getProfileLambda)

    // Create an API Gateway resource for each of the CRUD operations
    const api = new RestApi(this, 'hsrOptimizerApi', {
      restApiName: `${props.stage}HsrOptimizerApi`,
      // In case you want to manage binary types, uncomment the following
      // binaryMediaTypes: ["*/*"],
    })

    const profile = api.root.addResource('profile')
    const singleProfile = profile.addResource('{id}')
    singleProfile.addMethod('GET', new LambdaIntegration(getProfileLambda))
    addCorsOptions(profile)
    addCorsOptions(singleProfile)
  }
}

export function addCorsOptions(apiResource: IResource) {
  apiResource.addMethod('OPTIONS', new MockIntegration({
    // In case you want to use binary media types, uncomment the following line
    // contentHandling: ContentHandling.CONVERT_TO_TEXT,
    integrationResponses: [{
      statusCode: '200',
      responseParameters: {
        'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
        'method.response.header.Access-Control-Allow-Origin': "'*'",
        'method.response.header.Access-Control-Allow-Credentials': "'false'",
        'method.response.header.Access-Control-Allow-Methods': "'OPTIONS,GET,PUT,POST,DELETE'",
      },
    }],
    // In case you want to use binary media types, comment out the following line
    passthroughBehavior: PassthroughBehavior.NEVER,
    requestTemplates: {
      'application/json': '{"statusCode": 200}',
    },
  }), {
    methodResponses: [{
      statusCode: '200',
      responseParameters: {
        'method.response.header.Access-Control-Allow-Headers': true,
        'method.response.header.Access-Control-Allow-Methods': true,
        'method.response.header.Access-Control-Allow-Credentials': true,
        'method.response.header.Access-Control-Allow-Origin': true,
      },
    }],
  })
}

/**
 * Usage:
 * npm run build
 * cdk deploy HsrBetaStack --profile hsr-beta
 */

const betaAccountId = process.env.HSR_BETA_AWS_ACCOUNT!
const prodAccountId = process.env.HSR_PROD_AWS_ACCOUNT!

const betaEnvProps: StackEnvProps = {
  stage: Stage.BETA,
  env: {
    account: betaAccountId,
    region: 'us-west-2',
  },
}
const prodEnvProps: StackEnvProps = {
  stage: Stage.PROD,
  env: {
    account: prodAccountId,
    region: 'us-east-1',
  },
}

const app = new App()
new ApiLambdaCrudDynamoDBStack(app, 'HsrBetaStack', betaEnvProps)
new ApiLambdaCrudDynamoDBStack(app, 'HsrProdStack', prodEnvProps)
app.synth()
