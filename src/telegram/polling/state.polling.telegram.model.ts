import {Column, DataType, Model, Table} from "sequelize-typescript";

@Table({
    tableName: "statePollingTelegram",
    modelName: "StatePollingTelegramModel",
})
export class StatePollingTelegramModel extends Model<StatePollingTelegramModel> {
    @Column({
        type: DataType.STRING,
        allowNull: false,
        primaryKey: true,
    })
    readonly botId: string;

    @Column({
        type: DataType.BIGINT,
        allowNull: false,
        defaultValue: 0,
    })
    readonly offset: number;
}
