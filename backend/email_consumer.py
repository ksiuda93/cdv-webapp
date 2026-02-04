"""Email consumer - listens to email-send queue and sends emails via SMTP."""

import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

import pika

from app.config import Config


def get_rabbitmq_connection():
    """Create RabbitMQ connection."""
    credentials = pika.PlainCredentials(Config.RABBITMQ_USER, Config.RABBITMQ_PASS)
    return pika.BlockingConnection(
        pika.ConnectionParameters(
            host=Config.RABBITMQ_HOST,
            port=Config.RABBITMQ_PORT,
            credentials=credentials,
        )
    )


def send_email(to_email: str, subject: str, body: str):
    """Send email via SMTP to Mailhog."""
    msg = MIMEMultipart()
    msg["From"] = "noreply@cdv-webapp.local"
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    with smtplib.SMTP(Config.SMTP_HOST, Config.SMTP_PORT) as server:
        server.sendmail(msg["From"], to_email, msg.as_string())


def callback(ch, method, properties, body):
    """Process email-send message."""
    try:
        data = json.loads(body)
        event = data.get("event", "unknown")
        email = data.get("email")
        first_name = data.get("first_name", "")
        last_name = data.get("last_name", "")
        registered_at = data.get("registered_at", "")

        if not email:
            print(f"[!] Missing email in message: {data}")
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
            return

        subject = f"CDV Webapp - {event}"
        body_text = (
            f"Hello {first_name} {last_name},\n\n"
            f"Event: {event}\n"
            f"Registered at: {registered_at}\n\n"
            f"Best regards,\nCDV Webapp Team"
        )

        send_email(email, subject, body_text)
        print(f"[x] Email sent to {email} for event: {event}")
        ch.basic_ack(delivery_tag=method.delivery_tag)

    except json.JSONDecodeError as e:
        print(f"[!] Invalid JSON: {e}")
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
    except Exception as e:
        print(f"[!] Error processing message: {e}")
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)


def main():
    """Start email consumer."""
    connection = get_rabbitmq_connection()
    channel = connection.channel()

    channel.queue_declare(queue="email-send", durable=True)
    channel.basic_qos(prefetch_count=1)

    print("[*] Email consumer started. Waiting for messages...")

    channel.basic_consume(queue="email-send", on_message_callback=callback, auto_ack=False)
    channel.start_consuming()


if __name__ == "__main__":
    main()
