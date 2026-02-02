import {Inject, Injectable, OnModuleDestroy, OnModuleInit} from "@nestjs/common";
import {KAFKA} from "./kafka.constants";
import {Admin, Consumer, EachMessagePayload, Kafka} from "kafkajs";
import {DiscoveryService, Reflector} from "@nestjs/core";
import {InstanceWrapper} from "@nestjs/core/injector/instance-wrapper";
import {KAFKA_CONSUMER} from "./kafka.consumer.decorator";

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
    private consumer!: Consumer;

    constructor(
        @Inject(KAFKA)private readonly kafka: Kafka,
        private readonly discovery: DiscoveryService,
        private readonly reflector: Reflector,
    ) {}

    private async waitForKafkaReady(retries: number = 10, delayMs: number = 3000): Promise<void> {
        const admin: Admin = this.kafka.admin();

        for (let attempt: number = 1; attempt <= retries; ++attempt) {
            try {
                await admin.connect();
                await admin.fetchTopicMetadata();
                await admin.disconnect();
                console.log("[Kafka] ready");
                break;
            } catch (err) {
                console.warn(
                    `[Kafka] not ready (attempt ${attempt}/${retries}), retrying in ${delayMs} ms`,
                );
                try {
                    await admin.disconnect();
                } catch (_) { /* empty */ }

                if (attempt >= retries) {
                    throw err;
                }

                await new Promise((r) => setTimeout(r, delayMs));
            }
        }
    }

    async onModuleInit() {
        await this.waitForKafkaReady();

        this.consumer = this.kafka.consumer({
            groupId: "tg-bot-group",
            sessionTimeout: 10000,
            heartbeatInterval: 3000,
        });

        await this.consumer.connect();

        const handlers: Map<string, InstanceWrapper[]> = new Map();
        const providers: InstanceWrapper[] = this.discovery.getProviders();

        for (const wrapper of providers) {
            if (!wrapper?.instance) {
                continue;
            }

            const topic: string = this.reflector.get<string>(
                KAFKA_CONSUMER,
                wrapper.instance.constructor,
            );

            if (!topic) {
                continue;
            }

            if (!handlers.has(topic)) {
                handlers.set(topic, []);
                await this.consumer.subscribe({topic});
            }

            handlers.get(topic)!.push(wrapper);
        }

        await this.consumer.run({
            eachMessage: async ({topic, message}: EachMessagePayload) => {
                const topicHandlers: InstanceWrapper[] = handlers.get(topic) || [];
                for (const wrapper of topicHandlers) {
                    await wrapper.instance.handle(JSON.parse(message?.value?.toString() || "{}"));
                }
            },
        });
    }

    async onModuleDestroy() {
        if (this.consumer) {
            await this.consumer.disconnect();
        }
    }
}
