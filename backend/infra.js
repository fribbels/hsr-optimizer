"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HsrOptimizerApiStack = void 0;
const aws_apigateway_1 = require("aws-cdk-lib/aws-apigateway");
const aws_dynamodb_1 = require("aws-cdk-lib/aws-dynamodb");
const aws_lambda_1 = require("aws-cdk-lib/aws-lambda");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const aws_lambda_nodejs_1 = require("aws-cdk-lib/aws-lambda-nodejs");
const path_1 = require("path");
var Stage;
(function (Stage) {
    Stage["BETA"] = "Beta";
    Stage["PROD"] = "Prod";
})(Stage || (Stage = {}));
class HsrOptimizerApiStack extends aws_cdk_lib_1.Stack {
    constructor(app, id, props) {
        super(app, id, props);
        const dynamoTable = new aws_dynamodb_1.Table(this, 'hsrOptimizerTable', {
            partitionKey: {
                name: 'pk',
                type: aws_dynamodb_1.AttributeType.STRING,
            },
            sortKey: {
                name: 'sk',
                type: aws_dynamodb_1.AttributeType.STRING,
            },
            tableName: `HsrOptimizerTable-${props.stage}`,
            removalPolicy: props.stage == Stage.BETA ? aws_cdk_lib_1.RemovalPolicy.DESTROY : aws_cdk_lib_1.RemovalPolicy.RETAIN,
        });
        const nodeJsFunctionProps = {
            bundling: {
                externalModules: [
                    'aws-sdk', // Use the 'aws-sdk' available in the Lambda runtime
                ],
            },
            depsLockFilePath: (0, path_1.join)(__dirname, 'lambdas', 'package-lock.json'),
            environment: {
                PRIMARY_KEY: 'pk',
                SORT_KEY: 'sk',
                TABLE_NAME: dynamoTable.tableName,
            },
            runtime: aws_lambda_1.Runtime.NODEJS_16_X,
        };
        // Create a Lambda function for each of the CRUD operations
        const getProfileLambda = new aws_lambda_nodejs_1.NodejsFunction(this, 'getProfileFunction', {
            entry: (0, path_1.join)(__dirname, 'lambdas', 'get-profile.ts'),
            ...nodeJsFunctionProps,
        });
        // Grant the Lambda function read access to the DynamoDB table
        dynamoTable.grantReadWriteData(getProfileLambda);
        // Create an API Gateway resource for each of the CRUD operations
        const api = new aws_apigateway_1.RestApi(this, 'hsrOptimizerApi', {
            restApiName: `HsrOptimizerApi-${props.stage}`,
            defaultCorsPreflightOptions: {
                allowOrigins: aws_apigateway_1.Cors.ALL_ORIGINS,
            },
        });
        const profile = api.root.addResource('profile');
        const singleProfile = profile.addResource('{id}');
        singleProfile.addMethod('GET', new aws_apigateway_1.LambdaIntegration(getProfileLambda));
    }
}
exports.HsrOptimizerApiStack = HsrOptimizerApiStack;
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
 */
const betaAccountId = process.env.HSR_BETA_AWS_ACCOUNT;
const prodAccountId = process.env.HSR_PROD_AWS_ACCOUNT;
const betaEnvProps = {
    stage: Stage.BETA,
    env: {
        account: betaAccountId,
        region: 'us-west-2',
    },
};
const prodEnvProps = {
    stage: Stage.PROD,
    env: {
        account: prodAccountId,
        region: 'us-east-1',
    },
};
const app = new aws_cdk_lib_1.App();
new HsrOptimizerApiStack(app, 'HsrBetaStack', betaEnvProps);
new HsrOptimizerApiStack(app, 'HsrProdStack', prodEnvProps);
app.synth();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5mcmEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmZyYS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwrREFBNkU7QUFDN0UsMkRBQStEO0FBQy9ELHVEQUFnRDtBQUNoRCw2Q0FBbUU7QUFDbkUscUVBQW1GO0FBQ25GLCtCQUEyQjtBQUUzQixJQUFLLEtBR0o7QUFIRCxXQUFLLEtBQUs7SUFDUixzQkFBYSxDQUFBO0lBQ2Isc0JBQWEsQ0FBQTtBQUNmLENBQUMsRUFISSxLQUFLLEtBQUwsS0FBSyxRQUdUO0FBTUQsTUFBYSxvQkFBcUIsU0FBUSxtQkFBSztJQUM3QyxZQUFZLEdBQVEsRUFBRSxFQUFVLEVBQUUsS0FBb0I7UUFDcEQsS0FBSyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFFckIsTUFBTSxXQUFXLEdBQUcsSUFBSSxvQkFBSyxDQUFDLElBQUksRUFBRSxtQkFBbUIsRUFBRTtZQUN2RCxZQUFZLEVBQUU7Z0JBQ1osSUFBSSxFQUFFLElBQUk7Z0JBQ1YsSUFBSSxFQUFFLDRCQUFhLENBQUMsTUFBTTthQUMzQjtZQUNELE9BQU8sRUFBRTtnQkFDUCxJQUFJLEVBQUUsSUFBSTtnQkFDVixJQUFJLEVBQUUsNEJBQWEsQ0FBQyxNQUFNO2FBQzNCO1lBQ0QsU0FBUyxFQUFFLHFCQUFxQixLQUFLLENBQUMsS0FBSyxFQUFFO1lBRTdDLGFBQWEsRUFBRSxLQUFLLENBQUMsS0FBSyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLDJCQUFhLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQywyQkFBYSxDQUFDLE1BQU07U0FDeEYsQ0FBQyxDQUFBO1FBRUYsTUFBTSxtQkFBbUIsR0FBd0I7WUFDL0MsUUFBUSxFQUFFO2dCQUNSLGVBQWUsRUFBRTtvQkFDZixTQUFTLEVBQUUsb0RBQW9EO2lCQUNoRTthQUNGO1lBQ0QsZ0JBQWdCLEVBQUUsSUFBQSxXQUFJLEVBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxtQkFBbUIsQ0FBQztZQUNqRSxXQUFXLEVBQUU7Z0JBQ1gsV0FBVyxFQUFFLElBQUk7Z0JBQ2pCLFFBQVEsRUFBRSxJQUFJO2dCQUNkLFVBQVUsRUFBRSxXQUFXLENBQUMsU0FBUzthQUNsQztZQUNELE9BQU8sRUFBRSxvQkFBTyxDQUFDLFdBQVc7U0FDN0IsQ0FBQTtRQUVELDJEQUEyRDtRQUMzRCxNQUFNLGdCQUFnQixHQUFHLElBQUksa0NBQWMsQ0FBQyxJQUFJLEVBQUUsb0JBQW9CLEVBQUU7WUFDdEUsS0FBSyxFQUFFLElBQUEsV0FBSSxFQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsZ0JBQWdCLENBQUM7WUFDbkQsR0FBRyxtQkFBbUI7U0FDdkIsQ0FBQyxDQUFBO1FBRUYsOERBQThEO1FBQzlELFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBO1FBRWhELGlFQUFpRTtRQUNqRSxNQUFNLEdBQUcsR0FBRyxJQUFJLHdCQUFPLENBQUMsSUFBSSxFQUFFLGlCQUFpQixFQUFFO1lBQy9DLFdBQVcsRUFBRSxtQkFBbUIsS0FBSyxDQUFDLEtBQUssRUFBRTtZQUM3QywyQkFBMkIsRUFBRTtnQkFDM0IsWUFBWSxFQUFFLHFCQUFJLENBQUMsV0FBVzthQUMvQjtTQUNGLENBQUMsQ0FBQTtRQUVGLE1BQU0sT0FBTyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFBO1FBQy9DLE1BQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUE7UUFDakQsYUFBYSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxrQ0FBaUIsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUE7SUFDekUsQ0FBQztDQUNGO0FBdERELG9EQXNEQztBQUVEOzs7Ozs7Ozs7Ozs7O0dBYUc7QUFFSCxNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFxQixDQUFBO0FBQ3ZELE1BQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQXFCLENBQUE7QUFFdkQsTUFBTSxZQUFZLEdBQWtCO0lBQ2xDLEtBQUssRUFBRSxLQUFLLENBQUMsSUFBSTtJQUNqQixHQUFHLEVBQUU7UUFDSCxPQUFPLEVBQUUsYUFBYTtRQUN0QixNQUFNLEVBQUUsV0FBVztLQUNwQjtDQUNGLENBQUE7QUFDRCxNQUFNLFlBQVksR0FBa0I7SUFDbEMsS0FBSyxFQUFFLEtBQUssQ0FBQyxJQUFJO0lBQ2pCLEdBQUcsRUFBRTtRQUNILE9BQU8sRUFBRSxhQUFhO1FBQ3RCLE1BQU0sRUFBRSxXQUFXO0tBQ3BCO0NBQ0YsQ0FBQTtBQUVELE1BQU0sR0FBRyxHQUFHLElBQUksaUJBQUcsRUFBRSxDQUFBO0FBQ3JCLElBQUksb0JBQW9CLENBQUMsR0FBRyxFQUFFLGNBQWMsRUFBRSxZQUFZLENBQUMsQ0FBQTtBQUMzRCxJQUFJLG9CQUFvQixDQUFDLEdBQUcsRUFBRSxjQUFjLEVBQUUsWUFBWSxDQUFDLENBQUE7QUFDM0QsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29ycywgTGFtYmRhSW50ZWdyYXRpb24sIFJlc3RBcGkgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtYXBpZ2F0ZXdheSdcclxuaW1wb3J0IHsgQXR0cmlidXRlVHlwZSwgVGFibGUgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZHluYW1vZGInXHJcbmltcG9ydCB7IFJ1bnRpbWUgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbGFtYmRhJ1xyXG5pbXBvcnQgeyBBcHAsIFJlbW92YWxQb2xpY3ksIFN0YWNrLCBTdGFja1Byb3BzIH0gZnJvbSAnYXdzLWNkay1saWInXHJcbmltcG9ydCB7IE5vZGVqc0Z1bmN0aW9uLCBOb2RlanNGdW5jdGlvblByb3BzIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWxhbWJkYS1ub2RlanMnXHJcbmltcG9ydCB7IGpvaW4gfSBmcm9tICdwYXRoJ1xyXG5cclxuZW51bSBTdGFnZSB7XHJcbiAgQkVUQSA9ICdCZXRhJyxcclxuICBQUk9EID0gJ1Byb2QnLFxyXG59XHJcblxyXG50eXBlIFN0YWNrRW52UHJvcHMgPSBTdGFja1Byb3BzICYge1xyXG4gIHN0YWdlOiBTdGFnZVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgSHNyT3B0aW1pemVyQXBpU3RhY2sgZXh0ZW5kcyBTdGFjayB7XHJcbiAgY29uc3RydWN0b3IoYXBwOiBBcHAsIGlkOiBzdHJpbmcsIHByb3BzOiBTdGFja0VudlByb3BzKSB7XHJcbiAgICBzdXBlcihhcHAsIGlkLCBwcm9wcylcclxuXHJcbiAgICBjb25zdCBkeW5hbW9UYWJsZSA9IG5ldyBUYWJsZSh0aGlzLCAnaHNyT3B0aW1pemVyVGFibGUnLCB7XHJcbiAgICAgIHBhcnRpdGlvbktleToge1xyXG4gICAgICAgIG5hbWU6ICdwaycsXHJcbiAgICAgICAgdHlwZTogQXR0cmlidXRlVHlwZS5TVFJJTkcsXHJcbiAgICAgIH0sXHJcbiAgICAgIHNvcnRLZXk6IHtcclxuICAgICAgICBuYW1lOiAnc2snLFxyXG4gICAgICAgIHR5cGU6IEF0dHJpYnV0ZVR5cGUuU1RSSU5HLFxyXG4gICAgICB9LFxyXG4gICAgICB0YWJsZU5hbWU6IGBIc3JPcHRpbWl6ZXJUYWJsZS0ke3Byb3BzLnN0YWdlfWAsXHJcblxyXG4gICAgICByZW1vdmFsUG9saWN5OiBwcm9wcy5zdGFnZSA9PSBTdGFnZS5CRVRBID8gUmVtb3ZhbFBvbGljeS5ERVNUUk9ZIDogUmVtb3ZhbFBvbGljeS5SRVRBSU4sXHJcbiAgICB9KVxyXG5cclxuICAgIGNvbnN0IG5vZGVKc0Z1bmN0aW9uUHJvcHM6IE5vZGVqc0Z1bmN0aW9uUHJvcHMgPSB7XHJcbiAgICAgIGJ1bmRsaW5nOiB7XHJcbiAgICAgICAgZXh0ZXJuYWxNb2R1bGVzOiBbXHJcbiAgICAgICAgICAnYXdzLXNkaycsIC8vIFVzZSB0aGUgJ2F3cy1zZGsnIGF2YWlsYWJsZSBpbiB0aGUgTGFtYmRhIHJ1bnRpbWVcclxuICAgICAgICBdLFxyXG4gICAgICB9LFxyXG4gICAgICBkZXBzTG9ja0ZpbGVQYXRoOiBqb2luKF9fZGlybmFtZSwgJ2xhbWJkYXMnLCAncGFja2FnZS1sb2NrLmpzb24nKSxcclxuICAgICAgZW52aXJvbm1lbnQ6IHtcclxuICAgICAgICBQUklNQVJZX0tFWTogJ3BrJyxcclxuICAgICAgICBTT1JUX0tFWTogJ3NrJyxcclxuICAgICAgICBUQUJMRV9OQU1FOiBkeW5hbW9UYWJsZS50YWJsZU5hbWUsXHJcbiAgICAgIH0sXHJcbiAgICAgIHJ1bnRpbWU6IFJ1bnRpbWUuTk9ERUpTXzE2X1gsXHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ3JlYXRlIGEgTGFtYmRhIGZ1bmN0aW9uIGZvciBlYWNoIG9mIHRoZSBDUlVEIG9wZXJhdGlvbnNcclxuICAgIGNvbnN0IGdldFByb2ZpbGVMYW1iZGEgPSBuZXcgTm9kZWpzRnVuY3Rpb24odGhpcywgJ2dldFByb2ZpbGVGdW5jdGlvbicsIHtcclxuICAgICAgZW50cnk6IGpvaW4oX19kaXJuYW1lLCAnbGFtYmRhcycsICdnZXQtcHJvZmlsZS50cycpLFxyXG4gICAgICAuLi5ub2RlSnNGdW5jdGlvblByb3BzLFxyXG4gICAgfSlcclxuXHJcbiAgICAvLyBHcmFudCB0aGUgTGFtYmRhIGZ1bmN0aW9uIHJlYWQgYWNjZXNzIHRvIHRoZSBEeW5hbW9EQiB0YWJsZVxyXG4gICAgZHluYW1vVGFibGUuZ3JhbnRSZWFkV3JpdGVEYXRhKGdldFByb2ZpbGVMYW1iZGEpXHJcblxyXG4gICAgLy8gQ3JlYXRlIGFuIEFQSSBHYXRld2F5IHJlc291cmNlIGZvciBlYWNoIG9mIHRoZSBDUlVEIG9wZXJhdGlvbnNcclxuICAgIGNvbnN0IGFwaSA9IG5ldyBSZXN0QXBpKHRoaXMsICdoc3JPcHRpbWl6ZXJBcGknLCB7XHJcbiAgICAgIHJlc3RBcGlOYW1lOiBgSHNyT3B0aW1pemVyQXBpLSR7cHJvcHMuc3RhZ2V9YCxcclxuICAgICAgZGVmYXVsdENvcnNQcmVmbGlnaHRPcHRpb25zOiB7XHJcbiAgICAgICAgYWxsb3dPcmlnaW5zOiBDb3JzLkFMTF9PUklHSU5TLFxyXG4gICAgICB9LFxyXG4gICAgfSlcclxuXHJcbiAgICBjb25zdCBwcm9maWxlID0gYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ3Byb2ZpbGUnKVxyXG4gICAgY29uc3Qgc2luZ2xlUHJvZmlsZSA9IHByb2ZpbGUuYWRkUmVzb3VyY2UoJ3tpZH0nKVxyXG4gICAgc2luZ2xlUHJvZmlsZS5hZGRNZXRob2QoJ0dFVCcsIG5ldyBMYW1iZGFJbnRlZ3JhdGlvbihnZXRQcm9maWxlTGFtYmRhKSlcclxuICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBVc2FnZTpcclxuICpcclxuICogU2V0IHVwIHBlcm1pc3Npb25zIGF0IH4vLmF3cy9jcmVkZW50aWFscyB3aXRoIHByb2ZpbGU6XHJcbiAqIFtoc3ItYmV0YV1cclxuICogYXdzX2FjY2Vzc19rZXlfaWQgPSAuLi5cclxuICogYXdzX3NlY3JldF9hY2Nlc3Nfa2V5ID0gLi4uXHJcbiAqXHJcbiAqIEZpcnN0IHRpbWUgc2V0dXAsIG5wbSBpbnN0YWxsIGluIGJvdGggZm9sZGVycyB0aGVuOlxyXG4gKiBjZGsgYm9vdHN0cmFwIGF3czovL0FDQ09VTlQtTlVNQkVSLTEvdXMtd2VzdC0yIC0tcHJvZmlsZSBoc3ItYmV0YVxyXG4gKlxyXG4gKiBTdWJzZXF1ZW50IGRlcGxveW1lbnRzOlxyXG4gKiBucG0gcnVuIGJ1aWxkICYmIGNkayBkZXBsb3kgSHNyQmV0YVN0YWNrIC0tcHJvZmlsZSBoc3ItYmV0YVxyXG4gKi9cclxuXHJcbmNvbnN0IGJldGFBY2NvdW50SWQgPSBwcm9jZXNzLmVudi5IU1JfQkVUQV9BV1NfQUNDT1VOVCFcclxuY29uc3QgcHJvZEFjY291bnRJZCA9IHByb2Nlc3MuZW52LkhTUl9QUk9EX0FXU19BQ0NPVU5UIVxyXG5cclxuY29uc3QgYmV0YUVudlByb3BzOiBTdGFja0VudlByb3BzID0ge1xyXG4gIHN0YWdlOiBTdGFnZS5CRVRBLFxyXG4gIGVudjoge1xyXG4gICAgYWNjb3VudDogYmV0YUFjY291bnRJZCxcclxuICAgIHJlZ2lvbjogJ3VzLXdlc3QtMicsXHJcbiAgfSxcclxufVxyXG5jb25zdCBwcm9kRW52UHJvcHM6IFN0YWNrRW52UHJvcHMgPSB7XHJcbiAgc3RhZ2U6IFN0YWdlLlBST0QsXHJcbiAgZW52OiB7XHJcbiAgICBhY2NvdW50OiBwcm9kQWNjb3VudElkLFxyXG4gICAgcmVnaW9uOiAndXMtZWFzdC0xJyxcclxuICB9LFxyXG59XHJcblxyXG5jb25zdCBhcHAgPSBuZXcgQXBwKClcclxubmV3IEhzck9wdGltaXplckFwaVN0YWNrKGFwcCwgJ0hzckJldGFTdGFjaycsIGJldGFFbnZQcm9wcylcclxubmV3IEhzck9wdGltaXplckFwaVN0YWNrKGFwcCwgJ0hzclByb2RTdGFjaycsIHByb2RFbnZQcm9wcylcclxuYXBwLnN5bnRoKClcclxuIl19