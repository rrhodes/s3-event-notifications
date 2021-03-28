import {
  BlockPublicAccess,
  Bucket,
  BucketEncryption,
  EventType,
} from '@aws-cdk/aws-s3';
import { LambdaDestination } from '@aws-cdk/aws-s3-notifications';
import {
  Construct, RemovalPolicy, Stack, StackProps,
} from '@aws-cdk/core';

import createS3EventNotificationConsumerLambda from './createS3EventNotificationConsumerLambda';
import createS3EventNotificationRouterLambda from './createS3EventNotificationRouterLambda';

export default class S3EventNotificationsStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const bucket = new Bucket(this, 'Bucket', {
      autoDeleteObjects: true,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const parentFolderConsumerLambda = createS3EventNotificationConsumerLambda(this, 'ParentFolder');
    const subfolderConsumerLambda = createS3EventNotificationConsumerLambda(this, 'Subfolder');
    
    const eventNotificationParentFolder = 'test-folder';
    const s3EventNotificationRouterLambda = createS3EventNotificationRouterLambda(
      this, eventNotificationParentFolder, parentFolderConsumerLambda, subfolderConsumerLambda,
    );

    bucket.addEventNotification(
      EventType.OBJECT_CREATED,
      new LambdaDestination(s3EventNotificationRouterLambda),
      { prefix: eventNotificationParentFolder },
    );
  }
}
