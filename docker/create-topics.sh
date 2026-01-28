#!/usr/bin/env bash
set -e

echo "Searching for kafka-topics.sh..."
KAFKA_TOPICS_BIN="$(find / -type f -name kafka-topics.sh 2>/dev/null | head -n 1)"

if [ -z "$KAFKA_TOPICS_BIN" ]; then
echo "kafka-topics.sh not found"
exit 1
fi

echo "Found kafka-topics.sh at: $KAFKA_TOPICS_BIN"

BOOTSTRAP_SERVER="${KAFKA_HOST}:${KAFKA_PORT}"

echo "Using bootstrap server: $BOOTSTRAP_SERVER"

echo "Waiting for kafka server started..."

until "$KAFKA_TOPICS_BIN" --bootstrap-server "$BOOTSTRAP_SERVER" --list >/dev/null 2>&1; do
sleep 2
done

"$KAFKA_TOPICS_BIN" --bootstrap-server "$BOOTSTRAP_SERVER" \
--create --if-not-exists \
--topic tg.incoming \
--partitions 1 \
--replication-factor 1

"$KAFKA_TOPICS_BIN" --bootstrap-server "$BOOTSTRAP_SERVER" \
--create --if-not-exists \
--topic tg.outgoing \
--partitions 1 \
--replication-factor 1

echo "Kafka topics created (or already exist)"
