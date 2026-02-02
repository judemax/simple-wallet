import {Column, DataType, HasMany, Model, Table} from "sequelize-typescript";
import {WalletModel} from "../wallet/wallet.model";
import {IUserCreationAttributes, IUserData, IUserEncryptedItem, IUserItem} from "./user.interfaces";

@Table({
    tableName: "user",
    modelName: "UserModel",
})
export class UserModel extends Model<UserModel, IUserCreationAttributes> {
    @Column({
        type: DataType.STRING(64),
        primaryKey: true,
    })
    readonly chatId!: string;

    @Column({
        type: DataType.STRING(64),
        allowNull: false,
    })
    readonly userSalt!: string;

    @Column({
        type: DataType.STRING(64),
        allowNull: false,
        unique: true,
    })
    readonly apiKeyHash!: string;

    @Column({
        type: DataType.TEXT("long"),
        allowNull: false,
    })
    readonly encrypted!: string;

    @HasMany(() => WalletModel, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        foreignKey: "chatId",
    })
    readonly wallets?: WalletModel[];

    static itemAttrs(): string[] {
        return ["chatId", "userSalt", "apiKeyHash"];
    }

    static encryptedItemAttrs(): string[] {
        return ["userSalt", "encrypted"];
    }

    getItem(): IUserItem {
        const data: IUserData = this.toJSON();
        return {
            chatId: data.chatId,
            userSalt: data.userSalt,
            apiKeyHash: data.apiKeyHash,
        };
    }

    getEncryptedItem(): IUserEncryptedItem {
        const data: IUserData = this.toJSON();
        return {
            userSalt: data.userSalt,
            encrypted: data.encrypted,
        };
    }
}
