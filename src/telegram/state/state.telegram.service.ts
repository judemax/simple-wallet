import {Inject, Injectable} from "@nestjs/common";
import {RedisClientType} from "redis";
import {ITGCommandState} from "../../commands/command.interfaces";
import {REDIS} from "../../redis/redis.module";
import {StateTelegramRepository} from "./state.telegram.repository";

@Injectable()
export class StateTelegramService {
    private readonly prefix: string = "tg:state";
    private readonly ttl: number = parseInt(process.env.REDIS_STATE_TTL || "600");

    constructor(
        @Inject(REDIS)
        private readonly redis: RedisClientType,
        private readonly repo: StateTelegramRepository,
    ) {}

    private key(chatId: string): string {
        return `${this.prefix}:${chatId}`;
    }

    async get(chatId: string): Promise<ITGCommandState | null> {
        const key: string = this.key(chatId);
        const cached: string | object = await this.redis.get(key);
        if (cached && (typeof cached === "string")) {
            return JSON.parse(cached);
        }

        const state: ITGCommandState | null = await this.repo.get(chatId);
        if (!state) {
            return state;
        }

        await this.redis.set(key, JSON.stringify(state), {EX: this.ttl});

        return state;
    }

    async set(chatId: string, state: ITGCommandState) {
        const key: string = this.key(chatId);
        await Promise.all([
            this.redis.set(key, JSON.stringify(state), {EX: this.ttl}),
            this.repo.set(chatId, state),
        ]);
    }

    async clear(chatId: string) {
        const key: string = this.key(chatId);
        await Promise.all([
            this.redis.del(key),
            this.repo.clear(chatId),
        ]);
    }
}
