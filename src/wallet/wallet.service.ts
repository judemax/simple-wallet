import {Inject, Injectable} from "@nestjs/common";
import {REDIS} from "../redis/redis.module";
import {RedisClientType} from "redis";
import {WalletRepository} from "./wallet.repository";
import {CryptoService} from "../crypto/crypto.service";
import {IWalletCreationAttributes, IWalletItem, IWalletSensitiveData} from "./wallet.interfaces";
import {AssertionUtils} from "../utils/assertion.utils";

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

    async create(chatId: string, name: string): Promise<string> {
        console.log(`[WALLET] Create new by ${chatId} with name ${name}`);

        const mnemonic: string = this.cryptoService.generateMnemonic();

        await this.add(chatId, mnemonic, name);

        return mnemonic;
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
        await this.repo.remove(chatId, this.prepareName(name));
    }
}
