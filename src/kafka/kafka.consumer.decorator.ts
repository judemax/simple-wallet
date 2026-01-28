import {SetMetadata} from "@nestjs/common";

export const KAFKA_CONSUMER: string = "KAFKA_CONSUMER";

export const KafkaConsumer = (topic: string) =>
    SetMetadata(KAFKA_CONSUMER, topic);
