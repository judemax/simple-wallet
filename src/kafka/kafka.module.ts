import {Global, Module} from "@nestjs/common";
import {KAFKA} from "./kafka.constants";
import {Kafka} from "kafkajs";
import {KafkaProducer} from "./kafka.producer";
import {KafkaConsumerService} from "./kafka.consumer.service";
import {DiscoveryModule} from "@nestjs/core";

@Global()
@Module({
    imports: [DiscoveryModule],
    providers: [
        {
            provide: KAFKA,
            useFactory: () => new Kafka({
                brokers: [`${process.env.KAFKA_HOST}:${process.env.KAFKA_PORT}`],
                clientId: "tg-bot",
            }),
        },
        KafkaProducer,
        KafkaConsumerService,
    ],
    exports: [KafkaProducer],
})
export class KafkaModule {}
