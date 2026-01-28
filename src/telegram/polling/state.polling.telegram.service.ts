import {Inject, Injectable} from "@nestjs/common";
import {REDIS} from "../../redis/redis.module";
import {RedisClientType} from "redis";
import {StatePollingTelegramRepository} from "./state.polling.telegram.repository";

@Injectable()
export class StatePollingTelegramService {
    private readonly prefix: string = "tg:pollingState";
    private readonly ttl: number = parseInt(process.env.REDIS_STATE_TTL || "600");

    constructor(
        @Inject(REDIS)
        private readonly redis: RedisClientType,
        private readonly repo: StatePollingTelegramRepository,
    ) {}

    private key(botId: string): string {
        return `${this.prefix}:${botId}`;
    }

    async get(botId: string): Promise<number> {
        const key: string = this.key(botId);
        const cached: string | object = await this.redis.get(key);
        if (cached && (typeof cached === "string")) {
            return JSON.parse(cached).offset;
        }

        const offset: number = await this.repo.get(botId);

        await this.redis.set(key, JSON.stringify({offset}), {EX: this.ttl});

        return offset;
    }

    async set(botId: string, offset: number) {
        const key: string = this.key(botId);
        await Promise.all([
            this.redis.set(key, JSON.stringify({offset}), {EX: this.ttl}),
            this.repo.set(botId, offset),
        ]);
    }

    async clear(botId: string) {
        const key: string = this.key(botId);
        await Promise.all([
            this.redis.del(key),
            this.repo.clear(botId),
        ]);
    }
}
