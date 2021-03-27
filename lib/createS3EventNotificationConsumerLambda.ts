import {
  Code,
  Function as LambdaFunction,
  IFunction,
  Runtime,
} from '@aws-cdk/aws-lambda';
import { Construct } from '@aws-cdk/core';

const pascalToKebabCase = (input: string): string => input.split(/(?=[A-Z])/).join('-').toLowerCase();

const createS3EventNotificationConsumerLambda = (scope: Construct, id: string): IFunction => {
  const eventConsumerHandler = 'hello_world';
  const kebabCaseId = pascalToKebabCase(id);
  return new LambdaFunction(scope, `Lambda${id}`, {
    code: Code.fromInline(
      `def ${eventConsumerHandler}(event: dict, _context): print('Hello from ${kebabCaseId} Lambda!')`,
    ),
    description: 'Consumer Lambda for S3 event notifications.',
    functionName: `s3-event-notification-consumer-${kebabCaseId}`,
    handler: `index.${eventConsumerHandler}`,
    runtime: Runtime.PYTHON_3_8,
  });
};

export default createS3EventNotificationConsumerLambda;
