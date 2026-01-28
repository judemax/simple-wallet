import {Inject, Injectable, OnModuleInit} from "@nestjs/common";
import {Kafka, Producer} from "kafkajs";
import {KAFKA} from "./kafka.constants";

@Injectable()
export class KafkaProducer implements OnModuleInit {
    private producer!: Producer;

    constructor(@Inject(KAFKA) private readonly kafka: Kafka) {}

    async onModuleInit() {
        this.producer = this.kafka.producer();
        await this.producer.connect();
    }

    async send(topic: string, message: unknown) {
        await this.producer.send({
            topic,
            messages: [{value: JSON.stringify(message)}],
        });
    }
}
