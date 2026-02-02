import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/sequelize";
import {WalletModel} from "./wallet.model";
import {IWalletCreationAttributes, IWalletItem, IWalletUpdate} from "./wallet.interfaces";
import {Sequelize} from "sequelize-typescript";

@Injectable()
export class WalletRepository {
    constructor(
        @InjectModel(WalletModel)
        private readonly model: typeof WalletModel,
        private readonly sequelize: Sequelize,
    ) {}

    async nameAlreadyExists(chatId: string, name: string): Promise<boolean> {
        const wallet: WalletModel | null = await this.model.findOne({
            where: {chatId, name},
            attributes: ["id"],
        });
        return !!wallet;
    }

    async mnemonicAlreadyExists(mnemonicHash: string): Promise<boolean> {
        const wallet: WalletModel | null = await this.model.findOne({
            where: {mnemonicHash},
            attributes: ["id"],
        });
        return !!wallet;
    }

    async add(data: IWalletCreationAttributes): Promise<IWalletItem> {
        const wallet: WalletModel = await this.model.create(data);
        return wallet.getItem();
    }

    async listByChatId(chatId: string): Promise<ReadonlyArray<string>> {
        const wallets: WalletModel[] = await this.model.findAll({
            where: {chatId},
            attributes: ["name"],
            raw: true,
        });
        return wallets.map(w => w.name);
    }

    async remove(chatId: string, name: string) {
        await this.model.destroy({where: {chatId, name}});
    }

    async get(chatId: string, name: string): Promise<IWalletItem | null> {
        const wallet: WalletModel | null = await this.model.findOne({
            where: {chatId, name},
            attributes: WalletModel.itemAttrs(),
        });
        return wallet?.getItem() || null;
    }

    async list(chatId: string): Promise<ReadonlyArray<IWalletItem>> {
        const wallets: WalletModel[] = await this.model.findAll({
            where: {chatId},
            attributes: WalletModel.itemAttrs(),
        });

        return wallets.map(w => w.getItem());
    }

    async update(chatId: string, name: string, data: IWalletUpdate): Promise<IWalletItem | null> {
        const wallet: WalletModel | null = await this.sequelize.transaction(async (t) => {
            await this.model.update({
                name: data.name,
            }, {
                where: {chatId, name},
                transaction: t,
            });

            return WalletModel.findOne({
                where: {chatId, name: data.name},
                transaction: t,
            });
        });
        return wallet?.getItem() || null;
    }
}
