#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { S3EventNotificationsStack } from '../lib/s3-event-notifications-stack';

const app = new cdk.App();
new S3EventNotificationsStack(app, 'S3EventNotificationsStack');
