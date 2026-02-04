"""RabbitMQ publisher module (fire-and-forget)."""

import json
import logging

import pika
from flask import current_app

logger = logging.getLogger(__name__)

_connection = None
_channel = None


def _get_channel():
    """Return a reusable channel, reconnecting if necessary."""
    global _connection, _channel

    if _channel is not None and _channel.is_open:
        return _channel

    if _connection is not None and _connection.is_open:
        _connection.close()

    credentials = pika.PlainCredentials(
        current_app.config["RABBITMQ_USER"],
        current_app.config["RABBITMQ_PASS"],
    )
    params = pika.ConnectionParameters(
        host=current_app.config["RABBITMQ_HOST"],
        port=current_app.config["RABBITMQ_PORT"],
        credentials=credentials,
    )

    _connection = pika.BlockingConnection(params)
    _channel = _connection.channel()
    return _channel


def publish_message(queue, message):
    """Publish a JSON message to the given queue.

    Returns True on success, False on failure.
    Errors are logged but never propagated.
    """
    try:
        channel = _get_channel()
        channel.queue_declare(queue=queue, durable=True)
        channel.basic_publish(
            exchange="",
            routing_key=queue,
            body=json.dumps(message),
            properties=pika.BasicProperties(delivery_mode=2),
        )
        logger.info("Published message to queue '%s'", queue)
        return True
    except Exception:
        logger.exception("Failed to publish message to queue '%s'", queue)
        return False
