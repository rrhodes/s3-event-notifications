import { PolicyStatement } from '@aws-cdk/aws-iam';
import {
  IFunction,
  Runtime,
} from '@aws-cdk/aws-lambda';
import { PythonFunction } from '@aws-cdk/aws-lambda-python';
import {
  Construct,
} from '@aws-cdk/core';

const createS3EventNotificationRouterLambda = (
  scope: Construct,
  eventNotificationParentFolder: string,
  parentFolderConsumerLambda: IFunction,
  subfolderConsumerLambda: IFunction,
) => {
  const s3EventNotificationRouterLambda = new PythonFunction(scope, 'S3EventNotificationRouter', {
    description: 'Routing Lambda function for S3 event notifications.',
    entry: './s3-event-notification-router',
    environment: {
      PARENT_FOLDER_CONSUMER_LAMBDA: parentFolderConsumerLambda.functionName,
      SUBFOLDER_CONSUMER_LAMBDA: subfolderConsumerLambda.functionName,
      SUBFOLDER_KEY: `${eventNotificationParentFolder}/subfolder`,
    },
    functionName: 's3-event-notification-router',
    handler: 'handler',
    index: 'main.py',
    runtime: Runtime.PYTHON_3_8,
  });

  s3EventNotificationRouterLambda.addToRolePolicy(
    new PolicyStatement({
      actions: ['lambda:InvokeFunction'],
      resources: [
        parentFolderConsumerLambda.functionArn,
        subfolderConsumerLambda.functionArn,
      ],
    }),
  );

  return s3EventNotificationRouterLambda;
};

export default createS3EventNotificationRouterLambda;
