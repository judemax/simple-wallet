import {Inject, Injectable} from "@nestjs/common";
import {REDIS} from "../redis/redis.module";
import {RedisClientType} from "redis";
import {IUserCreationAttributes, IUserEncryptedItem, IUserItem, IUserSensitiveData} from "./user.interfaces";
import {UserRepository} from "./user.repository";
import {CryptoService} from "../crypto/crypto.service";
import {AssertionUtils} from "../utils/assertion.utils";

@Injectable()
export class UserService {
    private readonly ttl: number = parseInt(process.env.REDIS_STATE_TTL || "600");

    constructor(
        @Inject(REDIS)
        private readonly redis: RedisClientType,
        private readonly repo: UserRepository,
        private readonly cryptoService: CryptoService,
    ) {}

    private keyByChatId(chatId: string): string {
        return `users:byChatId:${chatId}`;
    }

    private keyByAPIKey(apiKeyHash: string): string {
        return `users:byAPIKey:${apiKeyHash}`;
    }

    private async saveUserItem(userItem: IUserItem) {
        await Promise.all([
            this.redis.set(this.keyByChatId(userItem.chatId), JSON.stringify(userItem), {EX: this.ttl}),
            this.redis.set(this.keyByAPIKey(userItem.apiKeyHash), userItem.chatId, {EX: this.ttl}),
        ]);
    }

    private getAPIKeyHash(apiKey: string): string {
        const mainSalt: string = process.env.APP_SALT || "";
        return this.cryptoService.hashData(apiKey, mainSalt);
    }

    private generateUser(chatId: string): IUserCreationAttributes {
        const userSalt: string = this.cryptoService.generateSalt();
        const apiKey: string = this.cryptoService.generateSalt();
        const mainSalt: string = process.env.APP_SALT || "";
        const apiKeyHash: string = this.getAPIKeyHash(apiKey);
        const data: IUserSensitiveData = {apiKey};
        const encrypted: string = this.cryptoService.encrypt(data, mainSalt, userSalt);

        return {
            chatId,
            userSalt,
            apiKeyHash,
            encrypted,
        };
    }

    async getByChatId(chatId: string): Promise<IUserItem> {
        const key: string = this.keyByChatId(chatId);
        const cached: string | object | null = await this.redis.get(key);
        if (cached && (typeof cached === "string")) {
            return JSON.parse(cached);
        }

        let defaults: IUserCreationAttributes = this.generateUser(chatId);
        while ((await this.repo.apiKeyExists(defaults.apiKeyHash))) {
            defaults = this.generateUser(chatId);
        }

        const userItem: IUserItem = await this.repo.getByChatId(chatId, defaults);

        await this.saveUserItem(userItem);

        return userItem;
    }

    async getByAPIKey(apiKey: string): Promise<IUserItem | null> {
        const apiKeyHash: string = this.getAPIKeyHash(apiKey);
        const key: string = this.keyByAPIKey(apiKeyHash);
        const chatId: string | object | null = await this.redis.get(key);
        if (chatId && (typeof chatId === "string")) {
            return this.getByChatId(chatId);
        }

        const userItem: IUserItem | null = await this.repo.getByAPIKey(apiKeyHash);
        if (!userItem) {
            return null;
        }

        await this.saveUserItem(userItem);

        return userItem;
    }

    async getAPIKey(chatId: string): Promise<string> {
        await this.getByChatId(chatId);

        const userItem: IUserEncryptedItem | null = await this.repo.getEncryptedItem(chatId);
        AssertionUtils.doesUserExist(userItem);

        const mainSalt: string = process.env.APP_SALT || "";
        const data: IUserSensitiveData = this.cryptoService.decrypt(userItem.encrypted, mainSalt, userItem.userSalt);
        return data.apiKey || "";
    }
}
