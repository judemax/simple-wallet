import {Column, DataType, ForeignKey, Model, Table} from "sequelize-typescript";
import {UserModel} from "../user/user.model";
import {IWalletCreationAttributes, IWalletData, IWalletEncryptedItem, IWalletItem} from "./wallet.interfaces";

@Table({
    tableName: "wallet",
    modelName: "WalletModel",
    indexes: [
        {fields: ["chatId"]},
        {fields: ["chatId", "name"]},
    ],
})
export class WalletModel extends Model<WalletModel, IWalletCreationAttributes> {
    @Column({
        type: DataType.STRING(64),
        allowNull: false,
    })
    @ForeignKey(() => UserModel)
    readonly chatId!: string;

    @Column({
        type: DataType.STRING(64),
        allowNull: false,
    })
    readonly name!: string;

    @Column({
        type: DataType.STRING(64),
        allowNull: false,
    })
    readonly walletSalt!: string;

    @Column({
        type: DataType.STRING(64),
        allowNull: false,
        unique: true,
    })
    readonly mnemonicHash!: string;

    @Column({
        type: DataType.TEXT("long"),
        allowNull: false,
    })
    readonly encrypted!: string;

    static itemAttrs(): string[] {
        return ["chatId", "name", "walletSalt", "mnemonicHash"];
    }

    static encryptedItemAttrs(): string[] {
        return ["walletSalt", "encrypted"];
    }

    getItem(): IWalletItem {
        const data: IWalletData = this.toJSON();
        return {
            chatId: data.chatId,
            name: data.name,
            walletSalt: data.walletSalt,
            mnemonicHash: data.mnemonicHash,
        };
    }

    getEncryptedItem(): IWalletEncryptedItem {
        const data: IWalletData = this.toJSON();
        return {
            walletSalt: data.walletSalt,
            encrypted: data.encrypted,
        };
    }
}
