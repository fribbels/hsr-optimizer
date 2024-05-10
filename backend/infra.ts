import { Cors, LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway'
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { App, Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib'
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs'
import { join } from 'path'

enum Stage {
  BETA = 'Beta',
  PROD = 'Prod',
}

type StackEnvProps = StackProps & {
  stage: Stage
}

export class HsrOptimizerApiStack extends Stack {
  constructor(app: App, id: string, props: StackEnvProps) {
    super(app, id, props)

    const dynamoTable = new Table(this, 'hsrOptimizerTable', {
      partitionKey: {
        name: 'pk',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'sk',
        type: AttributeType.STRING,
      },
      tableName: `HsrOptimizerTable-${props.stage}`,

      removalPolicy: props.stage == Stage.BETA ? RemovalPolicy.DESTROY : RemovalPolicy.RETAIN,
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
        SORT_KEY: 'sk',
        TABLE_NAME: dynamoTable.tableName,
      },
      runtime: Runtime.NODEJS_16_X,
      timeout: Duration.seconds(10),
      memorySize: 256,
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
      restApiName: `HsrOptimizerApi-${props.stage}`,
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
      },
    })

    const profile = api.root.addResource('profile')
    const singleProfile = profile.addResource('{id}')
    singleProfile.addMethod('GET', new LambdaIntegration(getProfileLambda))
  }
}

/**
 * Usage:
 *
 * Set up permissions at ~/.aws/credentials with profile:
 * [hsr-beta]
 * aws_access_key_id = ...
 * aws_secret_access_key = ...
 *
 * First time setup, npm install in both folders then:
 * cdk bootstrap aws://ACCOUNT-NUMBER-1/us-west-2 --profile hsr-beta
 *
 * Subsequent deployments:
 * npm run build && cdk deploy HsrBetaStack --profile hsr-beta
 * and/or
 * npm run build && cdk deploy HsrProdStack --profile hsr-prod
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
new HsrOptimizerApiStack(app, 'HsrBetaStack', betaEnvProps)
new HsrOptimizerApiStack(app, 'HsrProdStack', prodEnvProps)
app.synth()
