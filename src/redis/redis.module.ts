import {Module} from "@nestjs/common";
import {createClient, RedisClientType} from "redis";

export const REDIS: symbol = Symbol("REDIS");

@Module({
    providers: [
        {
            provide: REDIS,
            useFactory: async () => {
                const client: RedisClientType = createClient({
                    url: `redis://:${process.env.REDIS_SECURE}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
                });

                await client.connect();
                return client;
            },
        },
    ],
    exports: [REDIS],
})
export class RedisModule {}
