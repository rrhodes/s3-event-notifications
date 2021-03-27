import json
import logging
import os

import boto3

LAMBDA_CLIENT = boto3.client("lambda")
LOG = logging.getLogger()

LOG.setLevel(logging.INFO)


def handler(event: dict, _context):
    """
    Routing functionality for S3 event notifications.
    Filter out incompatible records, map records to consumers, then invoke the consumers.
    :param event: Event invoking the Router Lambda.
    :param _context: Router Lambda execution context.
    """
    LOG.debug("S3 Event Notification Router invoked.")
    s3_records = list(filter(lambda record: is_s3_event_notification_record(record), event.get("Records")))
    target_consumers = list(map(lambda s3_record: map_record_to_consumer_lambda(s3_record), s3_records))
    list(map(lambda zipped_args: invoke_consumer_lambda(*zipped_args), zip(s3_records, target_consumers)))
    LOG.info("S3 Event Notification Router finished.")


def is_s3_event_notification_record(record: dict) -> bool:
    """
    Determine if the given record references an S3 event notification.
    :param record: Record within the invocation event.
    :return: True if the record is an S3 event notification, otherwise False.
    """
    LOG.debug("Determining if record references an S3 event notification.")
    return record.get("s3") and record["s3"].get("object") and record["s3"]["object"].get("key")


def map_record_to_consumer_lambda(s3_record: dict) -> str:
    """
    Map S3 event notification record to a consumer Lambda function.
    :param s3_record: S3 record from the Lambda invocation event.
    :return: Name of the S3 Event Notification Consumer Lambda to invoke.
    """
    LOG.debug("Mapping record to a consumer Lambda.")
    if s3_record["s3"]["object"]["key"].startswith(os.getenv("SUBFOLDER_KEY")):
        consumer_lambda = os.getenv("SUBFOLDER_CONSUMER_LAMBDA")
    else:
        consumer_lambda = os.getenv("PARENT_FOLDER_CONSUMER_LAMBDA")
    LOG.info(f"Routing record to consumer Lambda {consumer_lambda}.")
    return consumer_lambda


def invoke_consumer_lambda(s3_record: dict, consumer_lambda_name: str):
    """
    Invoke the Consumer Lambda mapped to the given S3 record.
    :param s3_record: S3 event notification record from invocation event.
    :param consumer_lambda_name: Name of the consumer Lambda function to invoke.
    """
    LOG.debug(f"Invoking consumer Lambda {consumer_lambda_name}.")
    LAMBDA_CLIENT.invoke(
        ClientContext="S3 Event Notification Router invocation.",
        FunctionName=consumer_lambda_name,
        InvocationType="Event",
        LogType="Tail",
        Payload=json.dumps(s3_record).encode()
    )
    LOG.info(f"Invoked consumer Lambda {consumer_lambda_name}.")
