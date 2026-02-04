import pika, time

credentials = pika.PlainCredentials('user', 'password')

connection = pika.BlockingConnection(pika.ConnectionParameters(host="localhost", credentials=credentials))

channel = connection.channel()

channel.queue_declare(queue="hello")

# Prefetch - pobieraj maksymalnie 2 wiadomości na raz
channel.basic_qos(prefetch_count=2)

def callback(ch, method, properties, body):
    try:
        time.sleep(5)
        print("[x] {} is done...".format(body))
        # Ręczne potwierdzenie tylko gdy sukces
        ch.basic_ack(delivery_tag=method.delivery_tag)
    except Exception as e:
        print("[!] Error processing {}: {}".format(body, e))
        # Nie potwierdzaj - wiadomość wróci do kolejki (requeue=True)
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)


channel.basic_consume(
    queue="hello", on_message_callback=callback, auto_ack=False
)

channel.start_consuming()
