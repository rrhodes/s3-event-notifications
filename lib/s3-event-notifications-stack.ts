import { Code, Function as LambdaFunction, Runtime } from '@aws-cdk/aws-lambda';
import { BlockPublicAccess, Bucket, BucketEncryption, EventType } from '@aws-cdk/aws-s3';
import { LambdaDestination } from '@aws-cdk/aws-s3-notifications';
import { Construct, RemovalPolicy, Stack, StackProps } from '@aws-cdk/core';

export class S3EventNotificationsStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const bucket = new Bucket(this, 'Bucket', {
      autoDeleteObjects: true,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    this.lambdaWithS3EventNotification(this, 'LambdaOne', bucket, 'subfolder-one');
    this.lambdaWithS3EventNotification(this, 'LambdaTwo', bucket, 'subfolder-one/subfolder-two');
  }

  private lambdaWithS3EventNotification(
    scope: Construct,
    lambdaId: string,
    bucket: Bucket,
    eventNotificationPrefixSubfolder: string
  ) {
    const lambdaHandler = 'hello_world';
    const lambda = new LambdaFunction(scope, lambdaId, {
      code: Code.fromInline(`def ${lambdaHandler}(): print('Hello from Lambda one!')`),
      handler: lambdaHandler,
      runtime: Runtime.PYTHON_3_8,
    });
    
    bucket.addEventNotification(
      EventType.OBJECT_CREATED,
      new LambdaDestination(lambda),
      { prefix: `trigger-folder/${eventNotificationPrefixSubfolder}` },
    )
  }
}
