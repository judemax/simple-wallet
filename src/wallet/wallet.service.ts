import {Inject, Injectable} from "@nestjs/common";
import {REDIS} from "../redis/redis.module";
import {RedisClientType} from "redis";
import {WalletRepository} from "./wallet.repository";
import {CryptoService} from "../crypto/crypto.service";
import {
    IExtendedWalletItem, IWalletAPIExtendedResult, IWalletAPIResult,
    IWalletCreate,
    IWalletCreationAttributes,
    IWalletItem,
    IWalletSensitiveData, IWalletUpdate,
} from "./wallet.interfaces";
import {AssertionUtils} from "../utils/assertion.utils";
import {IUserItem} from "../user/user.interfaces";

@Injectable()
export class WalletService {
    private readonly ttl: number = parseInt(process.env.REDIS_STATE_TTL || "600");

    constructor(
        @Inject(REDIS)
        private readonly redis: RedisClientType,
        private readonly repo: WalletRepository,
        private readonly cryptoService: CryptoService,
    ) {}

    private key(chatId: string, name: string): string {
        return `wallet:${chatId}:${name}`;
    }

    private prepareMnemonic(mnemonic: string): string {
        return mnemonic.trim().toLowerCase().split(/\s+/).join(" ");
    }

    private prepareName(name: string): string {
        return name.trim().toLowerCase();
    }

    private getMnemonicHash(mnemonic: string): string {
        mnemonic = this.prepareMnemonic(mnemonic);
        const mainSalt: string = process.env.APP_SALT || "";
        return this.cryptoService.hashData(mnemonic, mainSalt);
    }

    async create(chatId: string, name: string): Promise<IExtendedWalletItem> {
        console.log(`[WALLET] Create new by ${chatId} with name ${name}`);

        const mnemonic: string = this.cryptoService.generateMnemonic();

        const walletItem: IWalletItem = await this.add(chatId, mnemonic, name);

        return {
            ...walletItem,
            mnemonic,
        };
    }

    fullyCorrectMnemonic(mnemonic: string): boolean {
        return this.cryptoService.fullyCorrectMnemonic(mnemonic);
    }

    correctMnemonic(mnemonic: string): boolean {
        return this.cryptoService.correctMnemonic(mnemonic);
    }

    mnemonicAlreadyExists(mnemonic: string): Promise<boolean> {
        return this.repo.mnemonicAlreadyExists(this.getMnemonicHash(mnemonic));
    }

    async add(chatId: string, mnemonic: string, name: string): Promise<IWalletItem> {
        mnemonic = this.prepareMnemonic(mnemonic);
        name = this.prepareName(name);

        console.log(`[WALLET] Add wallet by ${chatId} with name ${name}`);

        const walletSalt: string = this.cryptoService.generateSalt();
        const mainSalt: string = process.env.APP_SALT || "";
        const mnemonicHash: string = this.getMnemonicHash(mnemonic);
        const data: IWalletSensitiveData = {mnemonic};
        const encrypted: string = this.cryptoService.encrypt(data, mainSalt, walletSalt);

        const wallet: IWalletCreationAttributes = {
            chatId,
            name,
            walletSalt,
            mnemonicHash,
            encrypted,
        };

        AssertionUtils.isCorrectMnemonic(this.cryptoService.correctMnemonic(mnemonic));
        AssertionUtils.doesWalletNameNotExist(!(await this.nameAlreadyExists(chatId, name)), name);
        AssertionUtils.doesMnemonicNotExist(!(await this.mnemonicAlreadyExists(mnemonic)));

        const walletItem: IWalletItem = await this.repo.add(wallet);
        await this.redis.set(
            this.key(chatId, name),
            JSON.stringify(walletItem),
            {EX: this.ttl},
        );
        return walletItem;
    }

    nameAlreadyExists(chatId: string, name: string): Promise<boolean> {
        return this.repo.nameAlreadyExists(chatId, this.prepareName(name));
    }

    list(chatId: string): Promise<ReadonlyArray<string>> {
        return this.repo.listByChatId(chatId);
    }

    async remove(chatId: string, name: string) {
        name = this.prepareName(name);

        await Promise.all([
            this.redis.del(this.key(chatId, name)),
            this.repo.remove(chatId, name),
        ]);
    }

    async createByAPI(user: IUserItem, data: IWalletCreate): Promise<IWalletAPIResult | IWalletAPIExtendedResult> {
        AssertionUtils.doesUserExist(user);
        AssertionUtils.nameFieldFilled(data);

        if (!data.mnemonic) {
            const walletItem: IExtendedWalletItem = await this.create(user.chatId, data.name);
            return {
                name: walletItem.name,
                mnemonic: walletItem.mnemonic,
            };
        }
        const walletItem: IWalletItem = await this.add(user.chatId, data.mnemonic, data.name);
        return {
            name: walletItem.name,
        };
    }

    private async saveWalletItem(user: IUserItem, name: string, walletItem: IWalletItem) {
        await this.redis.set(
            this.key(user.chatId, name),
            JSON.stringify(walletItem),
            {EX: this.ttl},
        );
    }

    async findOneByAPI(user: IUserItem, name: string): Promise<IWalletAPIResult> {
        AssertionUtils.doesUserExist(user);
        name = this.prepareName(name);

        const key: string = this.key(user.chatId, name);
        const cached: string | object | null = await this.redis.get(key);
        if (cached && (typeof cached === "string")) {
            const walletItem: IWalletItem = JSON.parse(cached);
            return {
                name: walletItem.name,
            };
        }

        const walletItem: IWalletItem | null = await this.repo.get(user.chatId, name);
        AssertionUtils.doesWalletExists(walletItem);

        await this.saveWalletItem(user, name, walletItem);

        return {
            name: walletItem.name,
        };
    }

    async listByAPI(user: IUserItem): Promise<ReadonlyArray<IWalletAPIResult>> {
        AssertionUtils.doesUserExist(user);

        const list: ReadonlyArray<IWalletItem> = await this.repo.list(user.chatId);

        return list.map(l => ({
            name: l.name,
        }));
    }

    async updateByAPI(user: IUserItem, name: string, data: IWalletUpdate): Promise<IWalletAPIResult> {
        AssertionUtils.doesUserExist(user);
        name = this.prepareName(name);
        data.name = this.prepareName(data.name);

        const walletItem: IWalletItem | null = await this.repo.update(user.chatId, name, data);
        AssertionUtils.doesWalletExists(walletItem);

        await this.saveWalletItem(user, name, walletItem);

        return {
            name: walletItem.name,
        };
    }

    async removeByAPI(user: IUserItem, name: string) {
        AssertionUtils.doesUserExist(user);
        await this.remove(user.chatId, name);
    }
}
