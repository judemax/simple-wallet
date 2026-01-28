import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/sequelize";
import {WalletModel} from "./wallet.model";
import {IWalletCreationAttributes, IWalletItem} from "./wallet.interfaces";

@Injectable()
export class WalletRepository {
    constructor(
        @InjectModel(WalletModel)
        private readonly model: typeof WalletModel,
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
}
