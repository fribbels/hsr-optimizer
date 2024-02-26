"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addCorsOptions = exports.ApiLambdaCrudDynamoDBStack = void 0;
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
class ApiLambdaCrudDynamoDBStack extends aws_cdk_lib_1.Stack {
    constructor(app, id, props) {
        super(app, id, props);
        const dynamoTable = new aws_dynamodb_1.Table(this, 'hsrOptimizerTable', {
            partitionKey: {
                name: 'pk',
                type: aws_dynamodb_1.AttributeType.STRING,
            },
            tableName: `${props.stage}HsrOptimizerTable`,
            /**
             * The default removal policy is RETAIN, which means that cdk destroy will not attempt to delete
             * the new table, and it will remain in your account until manually deleted. By setting the policy to
             * DESTROY, cdk destroy will delete the table (even if it has data in it)
             */
            removalPolicy: props.stage == Stage.BETA ? aws_cdk_lib_1.RemovalPolicy.DESTROY : aws_cdk_lib_1.RemovalPolicy.RETAIN, // NOT recommended for production code
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
            restApiName: `${props.stage}HsrOptimizerApi`,
            // In case you want to manage binary types, uncomment the following
            // binaryMediaTypes: ["*/*"],
        });
        const profile = api.root.addResource('profile');
        const singleProfile = profile.addResource('{id}');
        singleProfile.addMethod('GET', new aws_apigateway_1.LambdaIntegration(getProfileLambda));
        addCorsOptions(profile);
        addCorsOptions(singleProfile);
    }
}
exports.ApiLambdaCrudDynamoDBStack = ApiLambdaCrudDynamoDBStack;
function addCorsOptions(apiResource) {
    apiResource.addMethod('OPTIONS', new aws_apigateway_1.MockIntegration({
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
        passthroughBehavior: aws_apigateway_1.PassthroughBehavior.NEVER,
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
    });
}
exports.addCorsOptions = addCorsOptions;
/**
 * Usage:
 * npm run build
 * cdk deploy HsrBetaStack --profile hsr-beta
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
new ApiLambdaCrudDynamoDBStack(app, 'HsrBetaStack', betaEnvProps);
new ApiLambdaCrudDynamoDBStack(app, 'HsrProdStack', prodEnvProps);
app.synth();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwrREFNbUM7QUFDbkMsMkRBQStEO0FBQy9ELHVEQUFnRDtBQUNoRCw2Q0FBbUU7QUFDbkUscUVBQW1GO0FBQ25GLCtCQUEyQjtBQUUzQixJQUFLLEtBR0o7QUFIRCxXQUFLLEtBQUs7SUFDUixzQkFBYSxDQUFBO0lBQ2Isc0JBQWEsQ0FBQTtBQUNmLENBQUMsRUFISSxLQUFLLEtBQUwsS0FBSyxRQUdUO0FBTUQsTUFBYSwwQkFBMkIsU0FBUSxtQkFBSztJQUNuRCxZQUFZLEdBQVEsRUFBRSxFQUFVLEVBQUUsS0FBb0I7UUFDcEQsS0FBSyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFFckIsTUFBTSxXQUFXLEdBQUcsSUFBSSxvQkFBSyxDQUFDLElBQUksRUFBRSxtQkFBbUIsRUFBRTtZQUN2RCxZQUFZLEVBQUU7Z0JBQ1osSUFBSSxFQUFFLElBQUk7Z0JBQ1YsSUFBSSxFQUFFLDRCQUFhLENBQUMsTUFBTTthQUMzQjtZQUNELFNBQVMsRUFBRSxHQUFHLEtBQUssQ0FBQyxLQUFLLG1CQUFtQjtZQUU1Qzs7OztlQUlHO1lBQ0gsYUFBYSxFQUFFLEtBQUssQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsMkJBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLDJCQUFhLENBQUMsTUFBTSxFQUFFLHNDQUFzQztTQUNoSSxDQUFDLENBQUE7UUFFRixNQUFNLG1CQUFtQixHQUF3QjtZQUMvQyxRQUFRLEVBQUU7Z0JBQ1IsZUFBZSxFQUFFO29CQUNmLFNBQVMsRUFBRSxvREFBb0Q7aUJBQ2hFO2FBQ0Y7WUFDRCxnQkFBZ0IsRUFBRSxJQUFBLFdBQUksRUFBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLG1CQUFtQixDQUFDO1lBQ2pFLFdBQVcsRUFBRTtnQkFDWCxXQUFXLEVB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LEdBQUcsRUFBRSxjQUFjLEVBQUUsWUFBWSxDQUFDLENBQUE7QUFDakUsSUFBSSwwQkFBMEIsQ0FBQyxHQUFHLEVBQUUsY0FBYyxFQUFFLFlBQVksQ0FBQyxDQUFBO0FBQ2pFLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIElSZXNvdXJjZSxcbiAgTGFtYmRhSW50ZWdyYXRpb24sXG4gIE1vY2tJbnRlZ3JhdGlvbixcbiAgUGFzc3Rocm91Z2hCZWhhdmlvcixcbiAgUmVzdEFwaSxcbn0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWFwaWdhdGV3YXknXG5pbXBvcnQgeyBBdHRyaWJ1dGVUeXBlLCBUYWJsZSB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1keW5hbW9kYidcbmltcG9ydCB7IFJ1bnRpbWUgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbGFtYmRhJ1xuaW1wb3J0IHsgQXBwLCBSZW1vdmFsUG9saWN5LCBTdGFjaywgU3RhY2tQcm9wcyB9IGZyb20gJ2F3cy1jZGstbGliJ1xuaW1wb3J0IHsgTm9kZWpzRnVuY3Rpb24sIE5vZGVqc0Z1bmN0aW9uUHJvcHMgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbGFtYmRhLW5vZGVqcydcbmltcG9ydCB7IGpvaW4gfSBmcm9tICdwYXRoJ1xuXG5lbnVtIFN0YWdlIHtcbiAgQkVUQSA9ICdCZXRhJyxcbiAgUFJPRCA9ICdQcm9kJyxcbn1cblxudHlwZSBTdGFja0VudlByb3BzID0gU3RhY2tQcm9wcyAmIHtcbiAgc3RhZ2U6IFN0YWdlXG59XG5cbmV4cG9ydCBjbGFzcyBBcGlMYW1iZGFDcnVkRHluYW1vREJTdGFjayBleHRlbmRzIFN0YWNrIHtcbiAgY29uc3RydWN0b3IoYXBwOiBBcHAsIGlkOiBzdHJpbmcsIHByb3BzOiBTdGFja0VudlByb3BzKSB7XG4gICAgc3VwZXIoYXBwLCBpZCwgcHJvcHMpXG5cbiAgICBjb25zdCBkeW5hbW9UYWJsZSA9IG5ldyBUYWJsZSh0aGlzLCAnaHNyT3B0aW1pemVyVGFibGUnLCB7XG4gICAgICBwYXJ0aXRpb25LZXk6IHtcbiAgICAgICAgbmFtZTogJ3BrJyxcbiAgICAgICAgdHlwZTogQXR0cmlidXRlVHlwZS5TVFJJTkcsXG4gICAgICB9LFxuICAgICAgdGFibGVOYW1lOiBgJHtwcm9wcy5zdGFnZX1Ic3JPcHRpbWl6ZXJUYWJsZWAsXG5cbiAgICAgIC8qKlxuICAgICAgICogVGhlIGRlZmF1bHQgcmVtb3ZhbCBwb2xpY3kgaXMgUkVUQUlOLCB3aGljaCBtZWFucyB0aGF0IGNkayBkZXN0cm95IHdpbGwgbm90IGF0dGVtcHQgdG8gZGVsZXRlXG4gICAgICAgKiB0aGUgbmV3IHRhYmxlLCBhbmQgaXQgd2lsbCByZW1haW4gaW4geW91ciBhY2NvdW50IHVudGlsIG1hbnVhbGx5IGRlbGV0ZWQuIEJ5IHNldHRpbmcgdGhlIHBvbGljeSB0b1xuICAgICAgICogREVTVFJPWSwgY2RrIGRlc3Ryb3kgd2lsbCBkZWxldGUgdGhlIHRhYmxlIChldmVuIGlmIGl0IGhhcyBkYXRhIGluIGl0KVxuICAgICAgICovXG4gICAgICByZW1vdmFsUG9saWN5OiBwcm9wcy5zdGFnZSA9PSBTdGFnZS5CRVRBID8gUmVtb3ZhbFBvbGljeS5ERVNUUk9ZIDogUmVtb3ZhbFBvbGljeS5SRVRBSU4sIC8vIE5PVCByZWNvbW1lbmRlZCBmb3IgcHJvZHVjdGlvbiBjb2RlXG4gICAgfSlcblxuICAgIGNvbnN0IG5vZGVKc0Z1bmN0aW9uUHJvcHM6IE5vZGVqc0Z1bmN0aW9uUHJvcHMgPSB7XG4gICAgICBidW5kbGluZzoge1xuICAgICAgICBleHRlcm5hbE1vZHVsZXM6IFtcbiAgICAgICAgICAnYXdzLXNkaycsIC8vIFVzZSB0aGUgJ2F3cy1zZGsnIGF2YWlsYWJsZSBpbiB0aGUgTGFtYmRhIHJ1bnRpbWVcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgICBkZXBzTG9ja0ZpbGVQYXRoOiBqb2luKF9fZGlybmFtZSwgJ2xhbWJkYXMnLCAncGFja2FnZS1sb2NrLmpzb24nKSxcbiAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgIFBSSU1BUllfS0VZOiAncGsnLFxuICAgICAgICBUQUJMRV9OQU1FOiBkeW5hbW9UYWJsZS50YWJsZU5hbWUsXG4gICAgICB9LFxuICAgICAgcnVudGltZTogUnVudGltZS5OT0RFSlNfMTZfWCxcbiAgICB9XG5cbiAgICAvLyBDcmVhdGUgYSBMYW1iZGEgZnVuY3Rpb24gZm9yIGVhY2ggb2YgdGhlIENSVUQgb3BlcmF0aW9uc1xuICAgIGNvbnN0IGdldFByb2ZpbGVMYW1iZGEgPSBuZXcgTm9kZWpzRnVuY3Rpb24odGhpcywgJ2dldFByb2ZpbGVGdW5jdGlvbicsIHtcbiAgICAgIGVudHJ5OiBqb2luKF9fZGlybmFtZSwgJ2xhbWJkYXMnLCAnZ2V0LXByb2ZpbGUudHMnKSxcbiAgICAgIC4uLm5vZGVKc0Z1bmN0aW9uUHJvcHMsXG4gICAgfSlcblxuICAgIC8vIEdyYW50IHRoZSBMYW1iZGEgZnVuY3Rpb24gcmVhZCBhY2Nlc3MgdG8gdGhlIER5bmFtb0RCIHRhYmxlXG4gICAgZHluYW1vVGFibGUuZ3JhbnRSZWFkV3JpdGVEYXRhKGdldFByb2ZpbGVMYW1iZGEpXG5cbiAgICAvLyBDcmVhdGUgYW4gQVBJIEdhdGV3YXkgcmVzb3VyY2UgZm9yIGVhY2ggb2YgdGhlIENSVUQgb3BlcmF0aW9uc1xuICAgIGNvbnN0IGFwaSA9IG5ldyBSZXN0QXBpKHRoaXMsICdoc3JPcHRpbWl6ZXJBcGknLCB7XG4gICAgICByZXN0QXBpTmFtZTogYCR7cHJvcHMuc3RhZ2V9SHNyT3B0aW1pemVyQXBpYCxcbiAgICAgIC8vIEluIGNhc2UgeW91IHdhbnQgdG8gbWFuYWdlIGJpbmFyeSB0eXBlcywgdW5jb21tZW50IHRoZSBmb2xsb3dpbmdcbiAgICAgIC8vIGJpbmFyeU1lZGlhVHlwZXM6IFtcIiovKlwiXSxcbiAgICB9KVxuXG4gICAgY29uc3QgcHJvZmlsZSA9IGFwaS5yb290LmFkZFJlc291cmNlKCdwcm9maWxlJylcbiAgICBjb25zdCBzaW5nbGVQcm9maWxlID0gcHJvZmlsZS5hZGRSZXNvdXJjZSgne2lkfScpXG4gICAgc2luZ2xlUHJvZmlsZS5hZGRNZXRob2QoJ0dFVCcsIG5ldyBMYW1iZGFJbnRlZ3JhdGlvbihnZXRQcm9maWxlTGFtYmRhKSlcbiAgICBhZGRDb3JzT3B0aW9ucyhwcm9maWxlKVxuICAgIGFkZENvcnNPcHRpb25zKHNpbmdsZVByb2ZpbGUpXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFkZENvcnNPcHRpb25zKGFwaVJlc291cmNlOiBJUmVzb3VyY2UpIHtcbiAgYXBpUmVzb3VyY2UuYWRkTWV0aG9kKCdPUFRJT05TJywgbmV3IE1vY2tJbnRlZ3JhdGlvbih7XG4gICAgLy8gSW4gY2FzZSB5b3Ugd2FudCB0byB1c2UgYmluYXJ5IG1lZGlhIHR5cGVzLCB1bmNvbW1lbnQgdGhlIGZvbGxvd2luZyBsaW5lXG4gICAgLy8gY29udGVudEhhbmRsaW5nOiBDb250ZW50SGFuZGxpbmcuQ09OVkVSVF9UT19URVhULFxuICAgIGludGVncmF0aW9uUmVzcG9uc2VzOiBbe1xuICAgICAgc3RhdHVzQ29kZTogJzIwMCcsXG4gICAgICByZXNwb25zZVBhcmFtZXRlcnM6IHtcbiAgICAgICAgJ21ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycyc6IFwiJ0NvbnRlbnQtVHlwZSxYLUFtei1EYXRlLEF1dGhvcml6YXRpb24sWC1BcGktS2V5LFgtQW16LVNlY3VyaXR5LVRva2VuLFgtQW16LVVzZXItQWdlbnQnXCIsXG4gICAgICAgICdtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6IFwiJyonXCIsXG4gICAgICAgICdtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LUNyZWRlbnRpYWxzJzogXCInZmFsc2UnXCIsXG4gICAgICAgICdtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnOiBcIidPUFRJT05TLEdFVCxQVVQsUE9TVCxERUxFVEUnXCIsXG4gICAgICB9LFxuICAgIH1dLFxuICAgIC8vIEluIGNhc2UgeW91IHdhbnQgdG8gdXNlIGJpbmFyeSBtZWRpYSB0eXBlcywgY29tbWVudCBvdXQgdGhlIGZvbGxvd2luZyBsaW5lXG4gICAgcGFzc3Rocm91Z2hCZWhhdmlvcjogUGFzc3Rocm91Z2hCZWhhdmlvci5ORVZFUixcbiAgICByZXF1ZXN0VGVtcGxhdGVzOiB7XG4gICAgICAnYXBwbGljYXRpb24vanNvbic6ICd7XCJzdGF0dXNDb2RlXCI6IDIwMH0nLFxuICAgIH0sXG4gIH0pLCB7XG4gICAgbWV0aG9kUmVzcG9uc2VzOiBbe1xuICAgICAgc3RhdHVzQ29kZTogJzIwMCcsXG4gICAgICByZXNwb25zZVBhcmFtZXRlcnM6IHtcbiAgICAgICAgJ21ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycyc6IHRydWUsXG4gICAgICAgICdtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnOiB0cnVlLFxuICAgICAgICAnbWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1DcmVkZW50aWFscyc6IHRydWUsXG4gICAgICAgICdtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6IHRydWUsXG4gICAgICB9LFxuICAgIH1dLFxuICB9KVxufVxuXG4vKipcbiAqIFVzYWdlOlxuICogbnBtIHJ1biBidWlsZFxuICogY2RrIGRlcGxveSBIc3JCZXRhU3RhY2sgLS1wcm9maWxlIGhzci1iZXRhXG4gKi9cblxuY29uc3QgYmV0YUFjY291bnRJZCA9IHByb2Nlc3MuZW52LkhTUl9CRVRBX0FXU19BQ0NPVU5UIVxuY29uc3QgcHJvZEFjY291bnRJZCA9IHByb2Nlc3MuZW52LkhTUl9QUk9EX0FXU19BQ0NPVU5UIVxuXG5jb25zdCBiZXRhRW52UHJvcHM6IFN0YWNrRW52UHJvcHMgPSB7XG4gIHN0YWdlOiBTdGFnZS5CRVRBLFxuICBlbnY6IHtcbiAgICBhY2NvdW50OiBiZXRhQWNjb3VudElkLFxuICAgIHJlZ2lvbjogJ3VzLXdlc3QtMicsXG4gIH0sXG59XG5jb25zdCBwcm9kRW52UHJvcHM6IFN0YWNrRW52UHJvcHMgPSB7XG4gIHN0YWdlOiBTdGFnZS5QUk9ELFxuICBlbnY6IHtcbiAgICBhY2NvdW50OiBwcm9kQWNjb3VudElkLFxuICAgIHJlZ2lvbjogJ3VzLWVhc3QtMScsXG4gIH0sXG59XG5cbmNvbnN0IGFwcCA9IG5ldyBBcHAoKVxubmV3IEFwaUxhbWJkYUNydWREeW5hbW9EQlN0YWNrKGFwcCwgJ0hzckJldGFTdGFjaycsIGJldGFFbnZQcm9wcylcbm5ldyBBcGlMYW1iZGFDcnVkRHluYW1vREJTdGFjayhhcHAsICdIc3JQcm9kU3RhY2snLCBwcm9kRW52UHJvcHMpXG5hcHAuc3ludGgoKVxuIl19