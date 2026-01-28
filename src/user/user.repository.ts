import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/sequelize";
import {UserModel} from "./user.model";
import {IUserCreationAttributes, IUserEncryptedItem, IUserItem} from "./user.interfaces";

@Injectable()
export class UserRepository {
    constructor(
        @InjectModel(UserModel)
        private readonly model: typeof UserModel,
    ) {}

    async getByChatId(chatId: string, defaults: IUserCreationAttributes): Promise<IUserItem> {
        const [user, created]: [UserModel, boolean] = await this.model.findOrCreate({
            where: {chatId},
            attributes: UserModel.itemAttrs(),
            defaults,
        });

        if (created) {
            console.log("[USER] Add new user from chat:", chatId);
        }

        return user.getItem();
    }

    async getByAPIKey(apiKeyHash: string): Promise<IUserItem | null> {
        const user: UserModel | null = await UserModel.findOne({
            where: {apiKeyHash},
            attributes: UserModel.itemAttrs(),
        });

        return user?.getItem() || null;
    }

    async getEncryptedItem(chatId: string): Promise<IUserEncryptedItem | null> {
        const user: UserModel | null = await UserModel.findOne({
            where: {chatId},
            attributes: UserModel.encryptedItemAttrs(),
        });

        return user?.getEncryptedItem() || null;
    }

    async apiKeyExists(apiKeyHash: string): Promise<boolean> {
        const user: UserModel | null = await UserModel.findOne({
            where: {apiKeyHash},
            attributes: ["chatId"],
        });
        return !!user;
    }
}
