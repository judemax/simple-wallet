import {Column, DataType, Model, Table} from "sequelize-typescript";
import {IStatePollingTelegramCreationData} from "./state.polling.telegram.interfaces";

@Table({
    tableName: "statePollingTelegram",
    modelName: "StatePollingTelegramModel",
})
export class StatePollingTelegramModel extends Model<StatePollingTelegramModel, IStatePollingTelegramCreationData> {
    @Column({
        type: DataType.STRING,
        allowNull: false,
        primaryKey: true,
    })
    readonly botId!: string;

    @Column({
        type: DataType.BIGINT,
        allowNull: false,
        defaultValue: 0,
    })
    readonly offset!: number;
}
